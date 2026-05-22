import { z } from "zod";

import { requestDeepSeekChatCompletion } from "@/lib/ai/deepseek";
import { buildCampaignCopyPrompt } from "@/lib/ai/prompts";
import type {
  CampaignCopyCandidate,
  CampaignCopyProviderPayload,
  CampaignCopyRequest,
} from "@/lib/ai/types";

const CampaignCopyCandidateSchema = z.object({
  label: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

const CampaignCopyProviderPayloadSchema = z.object({
  candidates: z.array(CampaignCopyCandidateSchema).length(3),
});

export function normalizeCampaignCopyResult(
  payload: CampaignCopyProviderPayload,
): CampaignCopyCandidate[] {
  const parsed = CampaignCopyProviderPayloadSchema.parse(payload);

  return parsed.candidates.map((candidate, index) => ({
    id: `candidate-${index + 1}`,
    label: candidate.label,
    body: candidate.body,
  }));
}

export async function generateCampaignCopy(
  input: CampaignCopyRequest,
): Promise<CampaignCopyCandidate[]> {
  const prompt = buildCampaignCopyPrompt(input);
  const content = await requestDeepSeekChatCompletion([
    { role: "system", content: prompt.system },
    { role: "user", content: prompt.user },
  ]);

  return normalizeCampaignCopyResult(
    JSON.parse(content) as CampaignCopyProviderPayload,
  );
}
