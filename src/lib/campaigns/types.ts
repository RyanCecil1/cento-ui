export type CampaignState =
  | "draft"
  | "queued"
  | "paused"
  | "rechecking"
  | "sending"
  | "needs_attention"
  | "completed"
  | "completed_with_failures"
  | "canceled";

export type AudienceFilter = {
  field: "tag" | "status" | "source";
  operator: "in";
  value: string;
};

export type CampaignDraft = {
  id?: string;
  name: string;
  senderId: string;
  message: string;
  templateId?: string;
  scheduleAt?: string;
  audience: {
    groupIds: string[];
    filters: AudienceFilter[];
  };
  personalizationDefaults: {
    firstName: string;
    lastName: string;
  };
};

