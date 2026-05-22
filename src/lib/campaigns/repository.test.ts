import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./types";

vi.mock("server-only", () => ({}));
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
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("rehydrates a saved draft with group ids and aiCompose intact", async () => {
    const { resolveWorkspaceAudience } = await import("@/lib/contacts/repository");
    const { getDemoStore } = await import("@/lib/demo/store");
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

    const store = getDemoStore();
    const originalCampaigns = structuredClone(store.campaigns);
    const originalAudienceGroups = structuredClone(store.campaignAudienceGroups);

    try {
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
    } finally {
      store.campaigns = originalCampaigns;
      store.campaignAudienceGroups = originalAudienceGroups;
    }
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
