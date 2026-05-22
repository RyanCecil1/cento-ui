import type { CampaignCopyRequest } from "@/lib/ai/types";

export function buildCampaignCopyPrompt(input: CampaignCopyRequest) {
  return {
    system: [
      "You write concise SMS campaign copy for legitimate business outreach.",
      "Return JSON only with this shape: {\"candidates\":[{\"label\":\"...\",\"body\":\"...\"}]}",
      "Return exactly 3 candidates.",
      "Keep each body SMS-safe: concise, plain text, no markdown, no emojis, no line breaks, no placeholders.",
      "Use practical CTA-driven wording grounded in the provided campaign details.",
    ].join(" "),
    user: [
      `Campaign name: ${input.campaignName}`,
      `Sender name: ${input.senderName}`,
      `Audience summary: ${input.audienceSummary}`,
      `Goal: ${input.goal}`,
      `Tone: ${input.tone}`,
      `Urgency: ${input.urgency}`,
      `Offer: ${input.offer}`,
      `CTA: ${input.cta}`,
      `Existing message: ${input.existingMessage?.trim() || "None"}`,
      'Respond with exactly 3 concise candidates in JSON under the "candidates" key.',
    ].join("\n"),
  };
}
