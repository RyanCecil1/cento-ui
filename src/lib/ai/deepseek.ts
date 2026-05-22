import "server-only";

import { env } from "@/lib/env";
import type { DeepSeekChatMessage } from "@/lib/ai/types";

const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";

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
    throw new Error("DEEPSEEK_NOT_CONFIGURED");
  }

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
  });

  if (!response.ok) {
    throw new Error(`DEEPSEEK_HTTP_${response.status}`);
  }

  const payload = (await response.json()) as DeepSeekApiResponse;
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("DEEPSEEK_EMPTY_RESPONSE");
  }

  return content;
}
