import { describe, expect, it, vi } from "vitest";

import type { CampaignDraft } from "./types";
import {
  hasValidSelectedCandidateId,
  type CampaignDraftAiComposeState,
} from "./types";
import { validateCampaignDraft } from "./validation";

vi.mock("server-only", () => ({}));

function buildAiComposeState(
  overrides: Partial<CampaignDraftAiComposeState> = {},
): CampaignDraftAiComposeState {
  return {
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
    ...overrides,
  };
}

function buildDraft(overrides: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    name: "PTA Reminder",
    senderId: "sender_1",
    message: "Parents, the meeting starts at 10 AM tomorrow.",
    audience: { groupIds: ["group_1"], filters: [] },
    personalizationDefaults: { firstName: "Customer", lastName: "" },
    aiCompose: buildAiComposeState(),
    ...overrides,
  };
}

describe("validateCampaignDraft", () => {
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

  it("accepts a valid draft carrying AI compose metadata", () => {
    expect(validateCampaignDraft(buildDraft()).ok).toBe(true);
  });
});

describe("hasValidSelectedCandidateId", () => {
  it("accepts drafts without a selected candidate", () => {
    expect(
      hasValidSelectedCandidateId(buildAiComposeState({ selectedCandidateId: undefined })),
    ).toBe(true);
  });

  it("rejects selected candidate ids that are not in the saved candidates", async () => {
    expect(
      hasValidSelectedCandidateId(buildAiComposeState({ selectedCandidateId: "candidate-9" })),
    ).toBe(false);

    const { CampaignSchema } = await import("@/app/api/campaigns/route");
    const result = CampaignSchema.safeParse(
      buildDraft({
        aiCompose: buildAiComposeState({ selectedCandidateId: "candidate-9" }),
      }),
    );

    expect(result.success).toBe(false);
  });
});
