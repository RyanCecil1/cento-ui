import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./types";

vi.mock("server-only", () => ({}));

const audienceGroups: Array<{ workspace_id: string; campaign_id: string; group_id: string }> = [];
const campaigns: Array<Record<string, unknown>> = [];

const supabaseMock = {
  from(table: string) {
    if (table === "campaigns") {
      return {
        select() {
          return this;
        },
        insert(payload: Record<string, unknown>) {
          const row = {
            id: `campaign_${campaigns.length + 1}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...payload,
          };
          campaigns.unshift(row);
          return {
            select() {
              return {
                single: async () => ({ data: row, error: null }),
              };
            },
          };
        },
        update(payload: Record<string, unknown>) {
          return {
            eq(_field: string, value: string) {
              return {
                eq(_field2: string, id: string) {
                  const row = campaigns.find((item) => item.workspace_id === value && item.id === id);
                  if (!row) {
                    return {
                      select() {
                        return {
                          maybeSingle: async () => ({ data: null, error: null }),
                        };
                      },
                    };
                  }
                  Object.assign(row, payload, { updated_at: new Date().toISOString() });
                  return {
                    select() {
                      return {
                        maybeSingle: async () => ({ data: row, error: null }),
                      };
                    },
                  };
                },
              };
            },
          };
        },
        eq(field: string, value: string) {
          const filtered = campaigns.filter((item) => item[field] === value);
          return {
            order: async () => ({ data: filtered, error: null }),
            maybeSingle: async () => ({ data: filtered[0] ?? null, error: null }),
            eq(field2: string, value2: string) {
              const match = campaigns.find((item) => item[field] === value && item[field2] === value2) ?? null;
              return {
                maybeSingle: async () => ({ data: match, error: null }),
              };
            },
          };
        },
      };
    }

    if (table === "campaign_audience_groups") {
      return {
        insert(rows: Array<{ workspace_id: string; campaign_id: string; group_id: string }>) {
          audienceGroups.push(...rows);
          return Promise.resolve({ error: null });
        },
        delete() {
          return {
            eq(_field: string, workspaceId: string) {
              return {
                eq(_field2: string, campaignId: string) {
                  for (let index = audienceGroups.length - 1; index >= 0; index -= 1) {
                    const row = audienceGroups[index];
                    if (row.workspace_id === workspaceId && row.campaign_id === campaignId) {
                      audienceGroups.splice(index, 1);
                    }
                  }
                  return Promise.resolve({ error: null });
                },
              };
            },
          };
        },
        select() {
          return {
            eq(_field: string, workspaceId: string) {
              return {
                eq(_field2: string, campaignId: string) {
                  return Promise.resolve({
                    data: audienceGroups
                      .filter((row) => row.workspace_id === workspaceId && row.campaign_id === campaignId)
                      .map((row) => ({ group_id: row.group_id })),
                    error: null,
                  });
                },
              };
            },
          };
        },
      };
    }

    if (table === "campaign_runs") {
      return {
        select() {
          return {
            eq: async () => ({ data: [], error: null }),
          };
        },
      };
    }

    throw new Error(`Unhandled table ${table}`);
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(() => supabaseMock),
}));

vi.mock("@/lib/contacts/repository", async () => {
  const actual = await vi.importActual<typeof import("@/lib/contacts/repository")>(
    "@/lib/contacts/repository",
  );

  return {
    ...actual,
    resolveWorkspaceAudience: vi.fn(),
  };
});

vi.mock("@/lib/sender-ids/repository", () => ({
  listSenderIds: vi.fn(),
}));

function buildDraft(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    name: "PTA Reminder",
    senderId: "sender_gracehub",
    message: "Parents, the meeting starts at 10 AM tomorrow.",
    audience: { groupIds: ["group_parents"], filters: [] },
    personalizationDefaults: { firstName: "Customer", lastName: "" },
    aiCompose: {
      inputs: {
        goal: "Remind parents about tomorrow's meeting",
        tone: "friendly",
        urgency: "medium",
        offer: "None",
        cta: "Arrive by 10 AM",
        senderContext: "School admin office",
        audienceSummary: "Parents in Group A",
      },
      candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
      selectedCandidateId: "candidate-1",
    },
    ...overrides,
  };
}

describe("campaign draft repository", () => {
  beforeEach(() => {
    campaigns.length = 0;
    audienceGroups.length = 0;
    vi.resetAllMocks();
  });

  it("rehydrates a saved draft with group ids and aiCompose intact", async () => {
    const { resolveWorkspaceAudience } = await import("@/lib/contacts/repository");
    const {
      createCampaignDraft,
      getCampaignDraft,
      updateCampaignDraft,
    } = await import("@/lib/campaigns/repository");

    vi.mocked(resolveWorkspaceAudience).mockResolvedValue({
      contacts: [],
      deliverable: [],
      summary: {
        deliverable: 20,
        invalid: 2,
        duplicates: 1,
        suppressed: 2,
      },
    });

    const created = await createCampaignDraft("workspace_demo", buildDraft());
    const draft = await getCampaignDraft("workspace_demo", created.id);

    expect(draft).toEqual({
      id: created.id,
      ...buildDraft(),
    });

    const updatedDraft = buildDraft({
      id: created.id,
      message: "Updated PTA reminder",
      audience: {
        groupIds: ["group_parents", "group_church"],
        filters: [{ field: "tag", operator: "in", value: "member" }],
      },
      aiCompose: {
        ...buildDraft().aiCompose!,
        candidates: [
          ...buildDraft().aiCompose!.candidates,
          { id: "candidate-2", label: "Urgent", body: "Message two" },
        ],
        selectedCandidateId: "candidate-2",
      },
    });

    await updateCampaignDraft("workspace_demo", updatedDraft);
    const rehydrated = await getCampaignDraft("workspace_demo", created.id);

    expect(rehydrated).toEqual(updatedDraft);
  });

  it("rejects invalid selectedCandidateId during persistence", async () => {
    const { resolveWorkspaceAudience } = await import("@/lib/contacts/repository");
    const {
      campaignDraftPersistenceErrorCodes,
      createCampaignDraft,
    } = await import("@/lib/campaigns/repository");

    vi.mocked(resolveWorkspaceAudience).mockResolvedValue({
      contacts: [],
      deliverable: [],
      summary: {
        deliverable: 20,
        invalid: 2,
        duplicates: 1,
        suppressed: 2,
      },
    });

    await expect(
      createCampaignDraft(
        "workspace_demo",
        buildDraft({
          aiCompose: {
            ...buildDraft().aiCompose!,
            selectedCandidateId: "candidate-9",
          },
        }),
      ),
    ).rejects.toMatchObject({
      code: campaignDraftPersistenceErrorCodes.invalidAiComposeSelection,
    });
  });
});
