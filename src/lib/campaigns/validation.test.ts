import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateCampaignDraft } from "./validation";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/current-viewer", () => ({
  getCurrentViewer: vi.fn(),
}));
vi.mock("@/lib/campaigns/repository", () => ({
  listCampaigns: vi.fn(),
  saveCampaignDraft: vi.fn(),
}));

describe("validateCampaignDraft", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    const draft = {
      name: "PTA Reminder",
      senderId: "sender_1",
      message: "Parents, the meeting starts at 10 AM tomorrow.",
      audience: { groupIds: ["group_1"], filters: [] },
      personalizationDefaults: { firstName: "Customer", lastName: "" },
      aiCompose: {
        inputs: {
          goal: "Remind parents about tomorrow's meeting",
          tone: "friendly" as const,
          urgency: "medium",
          offer: "None",
          cta: "Arrive by 10 AM",
          senderContext: "School admin office",
          audienceSummary: "Parents in Group A",
        },
        candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
        selectedCandidateId: "candidate-1",
      },
    };

    expect(validateCampaignDraft(draft).ok).toBe(true);
  });

  it("accepts AI compose metadata through the campaign API schema", async () => {
    const draft = {
      name: "PTA Reminder",
      senderId: "sender_1",
      message: "Parents, the meeting starts at 10 AM tomorrow.",
      audience: { groupIds: ["group_1"], filters: [] },
      personalizationDefaults: { firstName: "Customer", lastName: "" },
      aiCompose: {
        inputs: {
          goal: "Remind parents about tomorrow's meeting",
          tone: "friendly" as const,
          urgency: "medium",
          offer: "None",
          cta: "Arrive by 10 AM",
          senderContext: "School admin office",
          audienceSummary: "Parents in Group A",
        },
        candidates: [{ id: "candidate-1", label: "Direct", body: "Message one" }],
        selectedCandidateId: "candidate-1",
      },
    };

    const { getCurrentViewer } = await import("@/lib/auth/current-viewer");
    const { saveCampaignDraft } = await import("@/lib/campaigns/repository");
    const { POST } = await import("@/app/api/campaigns/route");

    vi.mocked(getCurrentViewer).mockResolvedValue({
      workspace: { id: "workspace_1" },
    } as Awaited<ReturnType<typeof getCurrentViewer>>);
    vi.mocked(saveCampaignDraft).mockResolvedValue({
      id: "campaign_1",
      ...draft,
    });

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
});
