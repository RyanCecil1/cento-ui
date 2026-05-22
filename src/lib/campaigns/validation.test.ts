import { beforeEach, describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./types";
import { validateCampaignDraft } from "./validation";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/current-viewer", () => ({
  getCurrentViewer: vi.fn(),
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

function buildAiComposeDraft(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    name: "PTA Reminder",
    senderId: "sender_1",
    message: "Parents, the meeting starts at 10 AM tomorrow.",
    audience: { groupIds: ["group_1"], filters: [] },
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

describe("validateCampaignDraft", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.resetModules();
  });

  it("blocks scheduling without message, sender, and audience", () => {
    const result = validateCampaignDraft({
      name: "Sunday reminder",
      senderId: "",
      message: "",
      scheduleAt: "2026-05-30T07:00:00.000Z",
      audience: { groupIds: [], filters: [] },
      personalizationDefaults: { firstName: "Member", lastName: "" },
    });

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(expect.arrayContaining(["senderId", "message", "audience"]));
  });

  it("accepts AI compose metadata on a campaign draft", () => {
    const draft = buildAiComposeDraft();

    expect(validateCampaignDraft(draft).ok).toBe(true);
  });

  it("accepts AI compose metadata through the campaign API schema", async () => {
    const draft = buildAiComposeDraft();
    const { getCurrentViewer } = await import("@/lib/auth/current-viewer");
    const saveCampaignDraft = vi.fn().mockResolvedValue({
      id: "campaign_1",
      ...draft,
    });

    vi.doMock("@/lib/campaigns/repository", () => ({
      listCampaigns: vi.fn(),
      saveCampaignDraft,
    }));

    const { CampaignSchema, POST } = await import("@/app/api/campaigns/route");

    expect(CampaignSchema.parse(draft)).toEqual(draft);

    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);

    const response = await POST(
      new Request("http://localhost/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      }),
    );

    expect(response.status).toBe(201);
    expect(saveCampaignDraft).toHaveBeenCalledWith("workspace_1", draft);
  });

  it("persists AI compose metadata through the draft save path", async () => {
    const draft = buildAiComposeDraft({
      senderId: "sender_gracehub",
      audience: { groupIds: ["group_parents"], filters: [] },
    });

    vi.doUnmock("@/lib/campaigns/repository");

    const { resolveWorkspaceAudience } = await import("@/lib/contacts/repository");
    const { getDemoStore } = await import("@/lib/demo/store");
    const { getCampaign, listCampaigns, saveCampaignDraft } = await import(
      "@/lib/campaigns/repository"
    );

    vi.mocked(resolveWorkspaceAudience).mockResolvedValue({
      contacts: [],
      summary: {
        total: 25,
        deliverable: 20,
        invalid: 2,
        duplicate: 1,
        suppressed: 2,
      },
    });

    const store = getDemoStore();
    const originalCampaigns = structuredClone(store.campaigns);
    const originalAudienceGroups = structuredClone(store.campaignAudienceGroups);

    try {
      const created = await saveCampaignDraft("workspace_demo", draft);
      expect(created.aiCompose).toEqual(draft.aiCompose);

      const listed = await listCampaigns("workspace_demo");
      const listedCampaign = listed.find((campaign) => campaign.id === created.id);
      expect(listedCampaign?.aiCompose).toEqual(draft.aiCompose);

      const loaded = await getCampaign("workspace_demo", created.id);
      expect(loaded?.aiCompose).toEqual(draft.aiCompose);

      const updatedDraft = buildAiComposeDraft({
        id: created.id,
        senderId: "sender_gracehub",
        audience: { groupIds: ["group_parents"], filters: [] },
        aiCompose: {
          inputs: {
            ...draft.aiCompose!.inputs,
            tone: "urgent",
            cta: "Confirm attendance today",
          },
          candidates: [
            ...draft.aiCompose!.candidates,
            { id: "candidate-2", label: "Urgent", body: "Message two" },
          ],
          selectedCandidateId: "candidate-2",
        },
      });

      const updated = await saveCampaignDraft("workspace_demo", updatedDraft);
      expect(updated.aiCompose).toEqual(updatedDraft.aiCompose);

      const reloaded = await getCampaign("workspace_demo", created.id);
      expect(reloaded?.aiCompose).toEqual(updatedDraft.aiCompose);
    } finally {
      store.campaigns = originalCampaigns;
      store.campaignAudienceGroups = originalAudienceGroups;
    }
  });
});
