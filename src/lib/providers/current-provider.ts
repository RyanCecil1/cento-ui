import { createDemoId } from "@/lib/demo/store";
import type { SmsProvider } from "./sms-provider";

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
  return demoProvider;
}

