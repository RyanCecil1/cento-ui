export type SmsProvider = {
  sendBatch(input: {
    senderId: string;
    message: string;
    recipients: string[];
  }): Promise<Array<{ recipient: string; status: "sent" | "failed"; providerMessageId?: string }>>;
};

