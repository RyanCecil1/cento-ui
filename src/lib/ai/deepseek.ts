import "server-only";

import { env } from "@/lib/env";
import {
  CampaignCopyError,
  campaignCopyErrorCodes,
  type DeepSeekChatMessage,
} from "@/lib/ai/types";

const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_TIMEOUT_MS = 12_000;

type DeepSeekApiResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function requestDeepSeekChatCompletion(
  messages: DeepSeekChatMessage[],
): Promise<string> {
  if (!env.DEEPSEEK_API_KEY) {
    throw new CampaignCopyError(campaignCopyErrorCodes.notConfigured);
  }

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), DEEPSEEK_TIMEOUT_MS);

  try {
    const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.5,
        max_tokens: 700,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) {
      await readSafeErrorBody(response);
      throw new CampaignCopyError(campaignCopyErrorCodes.upstreamHttpError);
    }

    const payload = (await response.json()) as DeepSeekApiResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new CampaignCopyError(
        campaignCopyErrorCodes.malformedProviderResponse,
      );
    }

    return content;
  } catch (error) {
    if (error instanceof CampaignCopyError) {
      throw error;
    }

    if (isAbortError(error)) {
      throw new CampaignCopyError(campaignCopyErrorCodes.upstreamTimeout, {
        cause: error,
      });
    }

    throw new CampaignCopyError(campaignCopyErrorCodes.upstreamHttpError, {
      cause: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function readSafeErrorBody(response: Response) {
  try {
    await response.text();
  } catch {
    return "";
  }

  return "";
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}
