import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";
import { resolveWorkspaceAudience } from "@/lib/contacts/repository";
import { listSenderIds } from "@/lib/sender-ids/repository";
import { estimateCampaignCredits } from "./pricing";
import type { CampaignDraft, CampaignState } from "./types";

export async function listCampaigns(workspaceId: string) {
  return getDemoStore().campaigns.filter((campaign) => campaign.workspaceId === workspaceId);
}

export async function getCampaign(workspaceId: string, campaignId: string) {
  return getDemoStore().campaigns.find(
    (campaign) => campaign.workspaceId === workspaceId && campaign.id === campaignId,
  ) ?? null;
}

export async function saveCampaignDraft(workspaceId: string, draft: CampaignDraft) {
  const store = getDemoStore();
  const audience = await resolveWorkspaceAudience(workspaceId, draft.audience);
  const pricing = estimateCampaignCredits(audience.summary.deliverable, draft.message);
  const now = new Date().toISOString();

  const existing = draft.id
    ? store.campaigns.find((campaign) => campaign.workspaceId === workspaceId && campaign.id === draft.id)
    : null;

  if (existing) {
    existing.name = draft.name;
    existing.senderId = draft.senderId;
    existing.message = draft.message;
    existing.templateId = draft.templateId ?? null;
    existing.scheduleAt = draft.scheduleAt ?? null;
    existing.audienceFilters = draft.audience.filters;
    existing.personalizationDefaults = draft.personalizationDefaults;
    existing.aiCompose = draft.aiCompose;
    existing.audienceFilterSummary = `${draft.audience.groupIds.length} groups • ${draft.audience.filters.length} filters`;
    existing.estimatedRecipients = audience.summary.deliverable;
    existing.estimatedCredits = pricing.totalCredits;
    existing.updatedAt = now;

    store.campaignAudienceGroups = store.campaignAudienceGroups.filter(
      (item) => !(item.workspaceId === workspaceId && item.campaignId === existing.id),
    );
    draft.audience.groupIds.forEach((groupId) => {
      store.campaignAudienceGroups.push({ workspaceId, campaignId: existing.id, groupId });
    });

    return existing;
  }

  const campaign = {
    id: createDemoId("campaign"),
    workspaceId,
    name: draft.name,
    state: "draft" as CampaignState,
    senderId: draft.senderId,
    message: draft.message,
    templateId: draft.templateId ?? null,
    scheduleAt: draft.scheduleAt ?? null,
    audienceFilterSummary: `${draft.audience.groupIds.length} groups • ${draft.audience.filters.length} filters`,
    personalizationDefaults: draft.personalizationDefaults,
    aiCompose: draft.aiCompose,
    audienceFilters: draft.audience.filters,
    failureReason: null,
    estimatedRecipients: audience.summary.deliverable,
    estimatedCredits: pricing.totalCredits,
    actualRecipients: 0,
    creditsUsed: 0,
    createdAt: now,
    updatedAt: now,
  };

  store.campaigns.unshift(campaign);
  draft.audience.groupIds.forEach((groupId) => {
    store.campaignAudienceGroups.push({ workspaceId, campaignId: campaign.id, groupId });
  });

  return campaign;
}

export async function setCampaignState(workspaceId: string, campaignId: string, state: CampaignState, failureReason: string | null = null) {
  const campaign = await getCampaign(workspaceId, campaignId);
  if (!campaign) {
    throw new Error("Campaign not found");
  }
  campaign.state = state;
  campaign.failureReason = failureReason;
  campaign.updatedAt = new Date().toISOString();
  return campaign;
}

export async function getCampaignAudienceGroupIds(workspaceId: string, campaignId: string) {
  return getDemoStore().campaignAudienceGroups
    .filter((item) => item.workspaceId === workspaceId && item.campaignId === campaignId)
    .map((item) => item.groupId);
}

export async function getCampaignEstimate(workspaceId: string, campaignId: string) {
  const campaign = await getCampaign(workspaceId, campaignId);
  if (!campaign) throw new Error("Campaign not found");

  const groupIds = await getCampaignAudienceGroupIds(workspaceId, campaignId);
  const audience = await resolveWorkspaceAudience(workspaceId, {
    groupIds,
    filters: campaign.audienceFilters,
  });
  const pricing = estimateCampaignCredits(audience.summary.deliverable, campaign.message);
  const senderIds = await listSenderIds(workspaceId);
  const sender = senderIds.find((item) => item.id === campaign.senderId);

  return {
    recipients: audience.summary.deliverable,
    credits: pricing.totalCredits,
    unitsPerRecipient: pricing.unitsPerRecipient,
    senderStatus: sender?.status ?? "rejected",
    summary: audience.summary,
  };
}
