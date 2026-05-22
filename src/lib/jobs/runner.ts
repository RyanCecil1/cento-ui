import "server-only";

import { resolveWorkspaceAudience } from "@/lib/contacts/repository";
import { createDemoId, getDemoStore } from "@/lib/demo/store";
import { getCurrentSmsProvider } from "@/lib/providers/current-provider";
import { getWorkspaceBalance, applyWalletDebit } from "@/lib/wallet/repository";
import { getCampaign, getCampaignAudienceGroupIds, getCampaignEstimate, setCampaignState } from "@/lib/campaigns/repository";
import { runFinalRecheck } from "@/lib/campaigns/recheck";
import { createCampaignJob, listDueCampaignJobs } from "./repository";

export async function queueCampaign(workspaceId: string, campaignId: string, scheduledFor: string | null) {
  const campaign = await setCampaignState(workspaceId, campaignId, "queued");
  const job = await createCampaignJob(workspaceId, campaignId, scheduledFor);
  return { campaign, job };
}

export async function runDueCampaignJobs() {
  const dueJobs = await listDueCampaignJobs();
  const provider = getCurrentSmsProvider();
  const store = getDemoStore();
  const processed: string[] = [];

  for (const job of dueJobs) {
    const campaign = await getCampaign(job.workspaceId, job.campaignId);
    if (!campaign || campaign.state === "canceled" || campaign.state === "paused") {
      job.state = "canceled";
      continue;
    }

    job.state = "running";
    job.startedAt = new Date().toISOString();
    campaign.state = "rechecking";

    const groupIds = await getCampaignAudienceGroupIds(job.workspaceId, campaign.id);
    const audience = await resolveWorkspaceAudience(job.workspaceId, {
      groupIds,
      filters: campaign.audienceFilters,
    });
    const estimate = await getCampaignEstimate(job.workspaceId, campaign.id);
    const balance = await getWorkspaceBalance(job.workspaceId);
    const result = await runFinalRecheck({
      resolvedRecipients: estimate.recipients,
      unitsPerRecipient: estimate.unitsPerRecipient,
      walletBalance: balance,
      senderStatus: estimate.senderStatus === "approved" ? "approved" : "rejected",
      jobAlreadyClaimed: false,
    });

    if (!result.ok) {
      campaign.state = "needs_attention";
      campaign.failureReason = result.reason;
      job.state = "failed";
      job.failureReason = result.reason;
      continue;
    }

    campaign.state = "sending";
    const recipients = audience.deliverable.map((contact) => contact.phoneE164);
    const sendResults = await provider.sendBatch({
      senderId: campaign.senderId,
      message: campaign.message,
      recipients,
    });

    const runId = createDemoId("run");
    store.campaignRuns.unshift({
      id: runId,
      workspaceId: job.workspaceId,
      campaignId: campaign.id,
      jobId: job.id,
      senderId: campaign.senderId,
      renderedMessage: campaign.message,
      recipientCount: estimate.recipients,
      totalUnits: result.requiredUnits,
      creditsUsed: result.requiredUnits,
      createdAt: new Date().toISOString(),
    });

    for (const contact of audience.deliverable) {
      const sent = sendResults.find((item) => item.recipient === contact.phoneE164);
      store.messageAttempts.unshift({
        id: createDemoId("attempt"),
        workspaceId: job.workspaceId,
        campaignId: campaign.id,
        runId,
        contactId: contact.id,
        phoneE164: contact.phoneE164,
        status: sent?.status === "sent" ? "sent" : "failed",
        providerMessageId: sent?.providerMessageId ?? null,
        failureReason: sent?.status === "failed" ? "provider_failed" : null,
        createdAt: new Date().toISOString(),
      });
    }

    await applyWalletDebit(job.workspaceId, {
      units: result.requiredUnits,
      reason: "Campaign deduction",
      meta: campaign.name,
      campaignId: campaign.id,
    });

    campaign.actualRecipients = estimate.recipients;
    campaign.creditsUsed = result.requiredUnits;
    campaign.failureReason = null;
    campaign.state = "completed";
    job.state = "completed";
    job.completedAt = new Date().toISOString();
    processed.push(job.id);
  }

  return { processedJobs: processed.length, processed };
}

