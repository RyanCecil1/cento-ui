import { z } from "zod";

import { requestDeepSeekChatCompletion } from "@/lib/ai/deepseek";
import { buildCampaignCopyPrompt } from "@/lib/ai/prompts";
import type {
  CampaignCopyCandidate,
  CampaignCopyProviderPayload,
  CampaignCopyRequest,
} from "@/lib/ai/types";
import { CampaignCopyError, campaignCopyErrorCodes } from "@/lib/ai/types";

const MAX_SMS_BODY_LENGTH = 320;
const placeholderPattern =
  /\b(?:lorem ipsum|tbd|n\/a|none|insert\b|placeholder\b|your message here|coming soon)\b/i;

const SmsSafeBodySchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_SMS_BODY_LENGTH)
  .refine((value) => !/[\r\n]/.test(value), {
    message: "SMS copy must be single-line",
  })
  .refine((value) => /[A-Za-z0-9]/.test(value), {
    message: "SMS copy must contain meaningful text",
  })
  .refine((value) => !placeholderPattern.test(value), {
    message: "SMS copy cannot contain placeholder text",
  });

const SmsSafeLabelSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .refine((value) => !/[\r\n]/.test(value), {
    message: "SMS label must be single-line",
  })
  .refine((value) => /[A-Za-z0-9]/.test(value), {
    message: "SMS label must contain meaningful text",
  })
  .refine((value) => !placeholderPattern.test(value), {
    message: "SMS label cannot contain placeholder text",
  });

const CampaignCopyCandidateSchema = z.object({
  label: SmsSafeLabelSchema,
  body: SmsSafeBodySchema,
});

const CampaignCopyProviderPayloadSchema = z.object({
  candidates: z.array(CampaignCopyCandidateSchema).length(3),
});

export function normalizeCampaignCopyResult(
  payload: CampaignCopyProviderPayload,
): CampaignCopyCandidate[] {
  const parsed = safeParseProviderPayload(payload);

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

  try {
    const content = await requestDeepSeekChatCompletion([
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ]);

    return normalizeCampaignCopyResult(parseProviderResponse(content));
  } catch (error) {
    throw toCampaignCopyError(error);
  }
}

function parseProviderResponse(content: string): CampaignCopyProviderPayload {
  try {
    return JSON.parse(content) as CampaignCopyProviderPayload;
  } catch (error) {
    throw new CampaignCopyError(
      campaignCopyErrorCodes.malformedProviderResponse,
      { cause: error },
    );
  }
}

function safeParseProviderPayload(
  payload: CampaignCopyProviderPayload,
): CampaignCopyProviderPayload {
  try {
    return CampaignCopyProviderPayloadSchema.parse(payload);
  } catch (error) {
    throw new CampaignCopyError(campaignCopyErrorCodes.invalidProviderPayload, {
      cause: error,
    });
  }
}

function toCampaignCopyError(error: unknown) {
  if (error instanceof CampaignCopyError) {
    return error;
  }

  return new CampaignCopyError(campaignCopyErrorCodes.upstreamHttpError, {
    cause: error,
  });
}
