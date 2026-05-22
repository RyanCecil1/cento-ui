import "server-only";

import { createDemoId } from "@/lib/demo/store";
import { env } from "@/lib/env";
import type { SmsProvider } from "./sms-provider";
import { createHubtelSmsProvider } from "./hubtel-provider";

const demoProvider: SmsProvider = {
  async sendBatch(input) {
    return input.recipients.map((recipient) => ({
      recipient,
      status: "sent" as const,
      providerMessageId: createDemoId("msg"),
    }));
  },
};

export function getCurrentSmsProvider() {
  if (env.SMS_PROVIDER === "hubtel") {
    return createHubtelSmsProvider();
  }

  return demoProvider;
}
