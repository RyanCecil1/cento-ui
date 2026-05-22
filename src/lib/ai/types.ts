export type CampaignCopyTone = "direct" | "friendly" | "urgent" | "formal";

export type CampaignCopyRequest = {
  campaignName: string;
  senderName: string;
  audienceSummary: string;
  goal: string;
  tone: CampaignCopyTone;
  urgency: string;
  offer: string;
  cta: string;
  existingMessage?: string;
};

export type CampaignCopyCandidate = {
  id: string;
  label: string;
  body: string;
};

export type CampaignCopyProviderCandidate = {
  label: string;
  body: string;
};

export type CampaignCopyProviderPayload = {
  candidates: CampaignCopyProviderCandidate[];
};

export type DeepSeekChatMessage = {
  role: "system" | "user";
  content: string;
};
