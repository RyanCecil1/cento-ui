import type { CampaignDraft } from "./types";

export function validateCampaignDraft(draft: CampaignDraft) {
  const errors: string[] = [];
  if (!draft.name.trim()) errors.push("name");
  if (!draft.senderId) errors.push("senderId");
  if (!draft.message.trim()) errors.push("message");
  if (draft.audience.groupIds.length === 0 && draft.audience.filters.length === 0) {
    errors.push("audience");
  }
  return { ok: errors.length === 0, errors };
}

