import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function createCampaignJob(workspaceId: string, campaignId: string, scheduledFor: string | null) {
  const supabase = createServerSupabaseClient();
  const dueAt = scheduledFor ?? new Date().toISOString();
  const { data, error } = await supabase
    .from("campaign_jobs")
    .insert({
      workspace_id: workspaceId,
      campaign_id: campaignId,
      due_at: dueAt,
      state: "queued",
      idempotency_key: `${campaignId}:${dueAt}`,
      payload: {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create campaign job");
  }

  return {
    id: data.id as string,
    workspaceId,
    campaignId,
    state: data.state as "queued" | "claimed" | "running" | "completed" | "failed" | "canceled",
    scheduledFor: data.due_at as string,
    startedAt: data.started_at as string | null,
    completedAt: data.finished_at as string | null,
    failureReason: data.failure_reason as string | null,
  };
}

export async function updateCampaignJob(jobId: string, updates: {
  state?: "queued" | "claimed" | "running" | "completed" | "failed" | "canceled";
  startedAt?: string | null;
  completedAt?: string | null;
  failureReason?: string | null;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaign_jobs")
    .update({
      state: updates.state,
      started_at: updates.startedAt,
      finished_at: updates.completedAt,
      failure_reason: updates.failureReason,
    })
    .eq("id", jobId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to update campaign job");
  }

  return data;
}

export async function listDueCampaignJobs() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("campaign_jobs")
    .select("*")
    .eq("state", "queued")
    .lte("due_at", new Date().toISOString())
    .order("due_at", { ascending: true });

  if (error) {
    throw new Error("Unable to list due campaign jobs");
  }

  return (data ?? []).map((job) => ({
    id: job.id as string,
    workspaceId: job.workspace_id as string,
    campaignId: job.campaign_id as string,
    state: job.state as "queued" | "claimed" | "running" | "completed" | "failed" | "canceled",
    scheduledFor: job.due_at as string,
    startedAt: job.started_at as string | null,
    completedAt: job.finished_at as string | null,
    failureReason: job.failure_reason as string | null,
  }));
}
