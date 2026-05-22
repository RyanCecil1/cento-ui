import "server-only";

import { env } from "@/lib/env";
import type { SmsProvider } from "./sms-provider";

type HubtelSendResponse = {
  MessageId?: string;
  messageId?: string;
  Status?: number | string;
  status?: number | string;
  Message?: string;
  message?: string;
};

function buildBasicAuthHeader() {
  const username = env.HUBTEL_CLIENT_ID;
  const password = env.HUBTEL_CLIENT_SECRET;

  if (!username || !password) {
    throw new Error("Hubtel credentials are not configured");
  }

  return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}

function getHubtelBaseUrl() {
  if (!env.HUBTEL_API_BASE_URL) {
    throw new Error("Hubtel API base URL is not configured");
  }

  return env.HUBTEL_API_BASE_URL.replace(/\/+$/, "");
}

export function createHubtelSmsProvider(): SmsProvider {
  return {
    async sendBatch(input) {
      const authorization = buildBasicAuthHeader();
      const baseUrl = getHubtelBaseUrl();
      const senderId = env.HUBTEL_SENDER_ID ?? input.senderId;

      const deliveries = await Promise.all(
        input.recipients.map(async (recipient) => {
          try {
            const response = await fetch(`${baseUrl}/send`, {
              method: "POST",
              headers: {
                Authorization: authorization,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                From: senderId,
                To: recipient,
                Content: input.message,
                RegisteredDelivery: true,
              }),
            });

            const payload = (await response.json().catch(() => null)) as HubtelSendResponse | null;
            const providerMessageId = payload?.MessageId ?? payload?.messageId;

            if (!response.ok) {
              return {
                recipient,
                status: "failed" as const,
                providerMessageId,
              };
            }

            return {
              recipient,
              status: "sent" as const,
              providerMessageId,
            };
          } catch {
            return {
              recipient,
              status: "failed" as const,
            };
          }
        }),
      );

      return deliveries;
    },
  };
}
