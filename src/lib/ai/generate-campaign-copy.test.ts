// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { ZodError } from "zod";

import type { CampaignCopyRequest } from "@/lib/ai/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/ai/deepseek", () => ({
  requestDeepSeekChatCompletion: vi.fn(),
}));

import { requestDeepSeekChatCompletion } from "@/lib/ai/deepseek";
import {
  generateCampaignCopy,
  normalizeCampaignCopyResult,
} from "@/lib/ai/generate-campaign-copy";

const baseRequest: CampaignCopyRequest = {
  campaignName: "PTA Reminder",
  senderName: "CentoSMS",
  audienceSummary: "Parents in Group A",
  goal: "Remind parents about tomorrow's meeting",
  tone: "friendly",
  urgency: "Meeting is tomorrow at 9 AM",
  offer: "Stay informed about your child's schedule",
  cta: "Reply YES to confirm attendance",
  existingMessage: "Please remember tomorrow's PTA meeting.",
};

describe("normalizeCampaignCopyResult", () => {
  it("normalizes exactly three candidates into typed ids", () => {
    expect(
      normalizeCampaignCopyResult({
        candidates: [
          { label: " Direct ", body: " Message one " },
          { label: "Friendly", body: "Message two" },
          { label: "Urgent", body: "Message three" },
        ],
      }),
    ).toEqual([
      { id: "candidate-1", label: "Direct", body: "Message one" },
      { id: "candidate-2", label: "Friendly", body: "Message two" },
      { id: "candidate-3", label: "Urgent", body: "Message three" },
    ]);
  });

  it("rejects provider payloads that do not return exactly three candidates", () => {
    expect(() =>
      normalizeCampaignCopyResult({
        candidates: [
          { label: "Direct", body: "Message one" },
          { label: "Friendly", body: "Message two" },
        ],
      }),
    ).toThrow(ZodError);
  });
});

describe("generateCampaignCopy", () => {
  it("parses provider JSON into three normalized candidates", async () => {
    vi.mocked(requestDeepSeekChatCompletion).mockResolvedValue(
      JSON.stringify({
        candidates: [
          { label: "Direct", body: "Book now with CentoSMS." },
          { label: "Friendly", body: "Hi parents, join us tomorrow at 9 AM." },
          { label: "Urgent", body: "Final reminder: reply YES for tomorrow." },
        ],
      }),
    );

    await expect(generateCampaignCopy(baseRequest)).resolves.toEqual([
      { id: "candidate-1", label: "Direct", body: "Book now with CentoSMS." },
      {
        id: "candidate-2",
        label: "Friendly",
        body: "Hi parents, join us tomorrow at 9 AM.",
      },
      {
        id: "candidate-3",
        label: "Urgent",
        body: "Final reminder: reply YES for tomorrow.",
      },
    ]);
  });

  it("surfaces malformed provider JSON as a hard failure", async () => {
    vi.mocked(requestDeepSeekChatCompletion).mockResolvedValue("{not-json");

    await expect(generateCampaignCopy(baseRequest)).rejects.toThrow(SyntaxError);
  });
});
