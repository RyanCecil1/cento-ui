import type {
  CampaignCopyCandidate,
  CampaignCopyRequest,
} from "@/lib/ai/types";

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

export type CampaignDraftAiComposeInputs = Pick<
  CampaignCopyRequest,
  "audienceSummary" | "goal" | "tone" | "urgency" | "offer" | "cta"
> & {
  senderContext: string;
};

export type CampaignDraftAiComposeState = {
  inputs: CampaignDraftAiComposeInputs;
  candidates: CampaignCopyCandidate[];
  selectedCandidateId?: CampaignCopyCandidate["id"];
};

export function hasValidSelectedCandidateId(
  aiCompose?: CampaignDraftAiComposeState,
) {
  if (!aiCompose?.selectedCandidateId) {
    return true;
  }

  return aiCompose.candidates.some(
    (candidate) => candidate.id === aiCompose.selectedCandidateId,
  );
}

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
  aiCompose?: CampaignDraftAiComposeState;
};
