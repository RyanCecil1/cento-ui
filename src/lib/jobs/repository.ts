import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";

export async function createCampaignJob(workspaceId: string, campaignId: string, scheduledFor: string | null) {
  const job = {
    id: createDemoId("job"),
    workspaceId,
    campaignId,
    state: "queued" as const,
    scheduledFor,
    startedAt: null,
    completedAt: null,
    failureReason: null,
  };
  getDemoStore().campaignJobs.unshift(job);
  return job;
}

export async function listDueCampaignJobs() {
  const now = Date.now();
  return getDemoStore().campaignJobs.filter((job) => {
    if (job.state !== "queued") return false;
    if (!job.scheduledFor) return true;
    return new Date(job.scheduledFor).getTime() <= now;
  });
}

