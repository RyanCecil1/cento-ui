import "server-only";

import { resolveWorkspaceAudience } from "@/lib/contacts/repository";
import { listSenderIds } from "@/lib/sender-ids/repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { estimateCampaignCredits } from "./pricing";
import {
  hasValidSelectedCandidateId,
  type CampaignDraft,
  type CampaignState,
} from "./types";

type CampaignRow = {
  id: string;
  workspace_id: string;
  name: string;
  sender_mode: "shared" | "branded";
  sender_id: string | null;
  template_id: string | null;
  message_body: string;
  personalization_fallback: {
    firstName?: string;
    lastName?: string;
  } | null;
  audience_filters: CampaignDraft["audience"]["filters"];
  scheduled_for: string | null;
  state: CampaignState;
  failure_reason: string | null;
  estimated_recipient_count: number;
  estimated_units: number;
  last_rechecked_at: string | null;
  ai_compose: CampaignDraft["aiCompose"];
  created_at: string;
  updated_at: string;
};

type CampaignRunRow = {
  campaign_id: string;
  deliverable_recipient_count: number;
  charge_units_total: number;
};

export const campaignDraftPersistenceErrorCodes = {
  notFound: "CAMPAIGN_DRAFT_NOT_FOUND",
  invalidAiComposeSelection: "INVALID_AI_COMPOSE_SELECTION",
} as const;

export type CampaignDraftPersistenceErrorCode =
  (typeof campaignDraftPersistenceErrorCodes)[keyof typeof campaignDraftPersistenceErrorCodes];

export class CampaignDraftPersistenceError extends Error {
  code: CampaignDraftPersistenceErrorCode;

  constructor(code: CampaignDraftPersistenceErrorCode, options?: { cause?: unknown }) {
    super(code, options);
    this.name = "CampaignDraftPersistenceError";
    this.code = code;
  }
}

function toAudienceFilterSummary(draft: { groupIds: string[]; filters: CampaignDraft["audience"]["filters"] }) {
  return `${draft.groupIds.length} groups • ${draft.filters.length} filters`;
}

async function getRunStats(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaign_runs")
    .select("campaign_id, deliverable_recipient_count, charge_units_total")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error("Unable to load campaign runs");
  }

  const stats = new Map<string, { actualRecipients: number; creditsUsed: number }>();
  for (const row of (data ?? []) as CampaignRunRow[]) {
    stats.set(row.campaign_id, {
      actualRecipients: row.deliverable_recipient_count,
      creditsUsed: row.charge_units_total,
    });
  }
  return stats;
}

function toCampaignView(
  row: CampaignRow,
  groupIds: string[],
  runStats?: { actualRecipients: number; creditsUsed: number },
) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    state: row.state,
    senderId: row.sender_id ?? "",
    message: row.message_body,
    templateId: row.template_id,
    scheduleAt: row.scheduled_for,
    audienceFilterSummary: toAudienceFilterSummary({
      groupIds,
      filters: row.audience_filters ?? [],
    }),
    personalizationDefaults: {
      firstName: row.personalization_fallback?.firstName ?? "Customer",
      lastName: row.personalization_fallback?.lastName ?? "",
    },
    aiCompose: row.ai_compose,
    audienceFilters: row.audience_filters ?? [],
    failureReason: row.failure_reason,
    estimatedRecipients: row.estimated_recipient_count,
    estimatedCredits: row.estimated_units,
    actualRecipients: runStats?.actualRecipients ?? 0,
    creditsUsed: runStats?.creditsUsed ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCampaigns(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const [{ data, error }, groupMap, runStats] = await Promise.all([
    supabase.from("campaigns").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    getCampaignAudienceGroupMap(workspaceId),
    getRunStats(workspaceId),
  ]);

  if (error) {
    throw new Error("Unable to list campaigns");
  }

  return ((data ?? []) as CampaignRow[]).map((row) =>
    toCampaignView(row, groupMap.get(row.id) ?? [], runStats.get(row.id)),
  );
}

export async function getCampaign(workspaceId: string, campaignId: string) {
  const supabase = createServerSupabaseClient();
  const [{ data, error }, groupIds, runStats] = await Promise.all([
    supabase
      .from("campaigns")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("id", campaignId)
      .maybeSingle(),
    getCampaignAudienceGroupIds(workspaceId, campaignId),
    getRunStats(workspaceId),
  ]);

  if (error || !data) {
    return null;
  }

  return toCampaignView(data as CampaignRow, groupIds, runStats.get(campaignId));
}

export async function getCampaignDraft(workspaceId: string, campaignId: string) {
  const campaign = await getCampaign(workspaceId, campaignId);
  if (!campaign) return null;

  const groupIds = await getCampaignAudienceGroupIds(workspaceId, campaignId);
  return {
    id: campaign.id,
    name: campaign.name,
    senderId: campaign.senderId,
    message: campaign.message,
    templateId: campaign.templateId ?? undefined,
    scheduleAt: campaign.scheduleAt ?? undefined,
    audience: {
      groupIds,
      filters: campaign.audienceFilters,
    },
    personalizationDefaults: campaign.personalizationDefaults,
    aiCompose: campaign.aiCompose,
  };
}

export async function createCampaignDraft(workspaceId: string, draft: CampaignDraft) {
  assertValidCampaignDraft(draft);

  const supabase = createServerSupabaseClient();
  const audience = await resolveWorkspaceAudience(workspaceId, draft.audience);
  const pricing = estimateCampaignCredits(audience.summary.deliverable, draft.message);
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: workspaceId,
      name: draft.name,
      sender_mode: "shared",
      sender_id: draft.senderId,
      template_id: draft.templateId ?? null,
      message_body: draft.message,
      personalization_fallback: draft.personalizationDefaults,
      audience_filters: draft.audience.filters,
      scheduled_for: draft.scheduleAt ?? null,
      state: "draft",
      failure_reason: null,
      estimated_recipient_count: audience.summary.deliverable,
      estimated_units: pricing.totalCredits,
      ai_compose: draft.aiCompose ?? {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create campaign draft");
  }

  if (draft.audience.groupIds.length > 0) {
    const { error: groupError } = await supabase.from("campaign_audience_groups").insert(
      draft.audience.groupIds.map((groupId) => ({
        workspace_id: workspaceId,
        campaign_id: data.id,
        group_id: groupId,
      })),
    );

    if (groupError) {
      throw new Error("Unable to attach campaign audience groups");
    }
  }

  return toCampaignView(data as CampaignRow, draft.audience.groupIds);
}

export async function updateCampaignDraft(workspaceId: string, draft: CampaignDraft) {
  assertValidCampaignDraft(draft);

  if (!draft.id) {
    throw new CampaignDraftPersistenceError(campaignDraftPersistenceErrorCodes.notFound);
  }

  const supabase = createServerSupabaseClient();
  const audience = await resolveWorkspaceAudience(workspaceId, draft.audience);
  const pricing = estimateCampaignCredits(audience.summary.deliverable, draft.message);
  const { data, error } = await supabase
    .from("campaigns")
    .update({
      name: draft.name,
      sender_id: draft.senderId,
      template_id: draft.templateId ?? null,
      message_body: draft.message,
      personalization_fallback: draft.personalizationDefaults,
      audience_filters: draft.audience.filters,
      scheduled_for: draft.scheduleAt ?? null,
      estimated_recipient_count: audience.summary.deliverable,
      estimated_units: pricing.totalCredits,
      ai_compose: draft.aiCompose ?? {},
    })
    .eq("workspace_id", workspaceId)
    .eq("id", draft.id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error("Unable to update campaign draft");
  }
  if (!data) {
    throw new CampaignDraftPersistenceError(campaignDraftPersistenceErrorCodes.notFound);
  }

  await supabase.from("campaign_audience_groups").delete().eq("workspace_id", workspaceId).eq("campaign_id", draft.id);

  if (draft.audience.groupIds.length > 0) {
    const { error: groupError } = await supabase.from("campaign_audience_groups").insert(
      draft.audience.groupIds.map((groupId) => ({
        workspace_id: workspaceId,
        campaign_id: draft.id,
        group_id: groupId,
      })),
    );

    if (groupError) {
      throw new Error("Unable to update campaign audience groups");
    }
  }

  return toCampaignView(data as CampaignRow, draft.audience.groupIds);
}

export async function setCampaignState(workspaceId: string, campaignId: string, state: CampaignState, failureReason: string | null = null) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaigns")
    .update({
      state,
      failure_reason: failureReason,
      last_rechecked_at: new Date().toISOString(),
    })
    .eq("workspace_id", workspaceId)
    .eq("id", campaignId)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Campaign not found");
  }

  const groupIds = await getCampaignAudienceGroupIds(workspaceId, campaignId);
  return toCampaignView(data as CampaignRow, groupIds);
}

async function getCampaignAudienceGroupMap(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaign_audience_groups")
    .select("campaign_id, group_id")
    .eq("workspace_id", workspaceId);

  if (error) {
    throw new Error("Unable to load campaign audience groups");
  }

  const result = new Map<string, string[]>();
  for (const row of (data ?? []) as Array<{ campaign_id: string; group_id: string }>) {
    result.set(row.campaign_id, [...(result.get(row.campaign_id) ?? []), row.group_id]);
  }
  return result;
}

export async function getCampaignAudienceGroupIds(workspaceId: string, campaignId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaign_audience_groups")
    .select("group_id")
    .eq("workspace_id", workspaceId)
    .eq("campaign_id", campaignId);

  if (error) {
    throw new Error("Unable to load campaign audience groups");
  }

  return ((data ?? []) as Array<{ group_id: string }>).map((item) => item.group_id);
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

function assertValidCampaignDraft(draft: CampaignDraft) {
  if (!hasValidSelectedCandidateId(draft.aiCompose)) {
    throw new CampaignDraftPersistenceError(
      campaignDraftPersistenceErrorCodes.invalidAiComposeSelection,
    );
  }
}
