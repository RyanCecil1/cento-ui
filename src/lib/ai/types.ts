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

export const campaignCopyErrorCodes = {
  notConfigured: "DEEPSEEK_NOT_CONFIGURED",
  upstreamTimeout: "DEEPSEEK_UPSTREAM_TIMEOUT",
  upstreamHttpError: "DEEPSEEK_UPSTREAM_HTTP_ERROR",
  malformedProviderResponse: "DEEPSEEK_MALFORMED_PROVIDER_RESPONSE",
  invalidProviderPayload: "DEEPSEEK_INVALID_PROVIDER_PAYLOAD",
} as const;

export type CampaignCopyErrorCode =
  (typeof campaignCopyErrorCodes)[keyof typeof campaignCopyErrorCodes];

export class CampaignCopyError extends Error {
  code: CampaignCopyErrorCode;

  constructor(code: CampaignCopyErrorCode, options?: { cause?: unknown }) {
    super(code, options);
    this.name = "CampaignCopyError";
    this.code = code;
  }
}
