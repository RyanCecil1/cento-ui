import { describe, expect, it } from "vitest";
import { validateCampaignDraft } from "./validation";

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
});

