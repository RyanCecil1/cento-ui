import "server-only";

import { resolveWorkspaceAudience } from "@/lib/contacts/repository";
import { getCurrentSmsProvider } from "@/lib/providers/current-provider";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWorkspaceBalance, applyWalletDebit } from "@/lib/wallet/repository";
import { getCampaign, getCampaignAudienceGroupIds, getCampaignEstimate, setCampaignState } from "@/lib/campaigns/repository";
import { runFinalRecheck } from "@/lib/campaigns/recheck";
import { createCampaignJob, listDueCampaignJobs, updateCampaignJob } from "./repository";

export async function queueCampaign(workspaceId: string, campaignId: string, scheduledFor: string | null) {
  const campaign = await setCampaignState(workspaceId, campaignId, "queued");
  const job = await createCampaignJob(workspaceId, campaignId, scheduledFor);
  return { campaign, job };
}

export async function runDueCampaignJobs() {
  const dueJobs = await listDueCampaignJobs();
  const provider = getCurrentSmsProvider();
  const supabase = createServerSupabaseClient();
  const processed: string[] = [];

  for (const job of dueJobs) {
    const campaign = await getCampaign(job.workspaceId, job.campaignId);
    if (!campaign || campaign.state === "canceled" || campaign.state === "paused") {
      await updateCampaignJob(job.id, { state: "canceled" });
      continue;
    }

    await updateCampaignJob(job.id, {
      state: "running",
      startedAt: new Date().toISOString(),
    });
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
      await updateCampaignJob(job.id, {
        state: "failed",
        failureReason: result.reason,
      });
      continue;
    }

    campaign.state = "sending";
    const recipients = audience.deliverable.map((contact) => contact.phoneE164);
    const sendResults = await provider.sendBatch({
      senderId: campaign.senderId,
      message: campaign.message,
      recipients,
    });

    const { data: run, error: runError } = await supabase
      .from("campaign_runs")
      .insert({
        workspace_id: job.workspaceId,
        campaign_id: campaign.id,
        job_id: job.id,
        exact_sender: campaign.senderId,
        rendered_message_basis: campaign.message,
        audience_snapshot: audience.deliverable.map((contact) => ({
          id: contact.id,
          fullName: contact.fullName,
          phoneE164: contact.phoneE164,
        })),
        charge_basis: {
          recipients: estimate.recipients,
          unitsPerRecipient: estimate.unitsPerRecipient,
        },
        resolved_recipient_count: estimate.recipients,
        deliverable_recipient_count: audience.summary.deliverable,
        charge_units_total: result.requiredUnits,
      })
      .select("id")
      .single();

    if (runError || !run) {
      throw new Error("Unable to create campaign run");
    }

    if (audience.deliverable.length > 0) {
      const { error: attemptsError } = await supabase.from("message_attempts").insert(
        audience.deliverable.map((contact) => {
          const sent = sendResults.find((item) => item.recipient === contact.phoneE164);
          return {
            workspace_id: job.workspaceId,
            campaign_id: campaign.id,
            run_id: run.id,
            contact_id: contact.id,
            phone_e164: contact.phoneE164,
            rendered_message: campaign.message,
            rendered_units: estimate.unitsPerRecipient,
            provider_message_id: sent?.providerMessageId ?? null,
            provider_response: sent ?? {},
            outcome: sent?.status === "sent" ? "sent" : "failed",
            failed_at: sent?.status === "failed" ? new Date().toISOString() : null,
            sent_at: sent?.status === "sent" ? new Date().toISOString() : null,
          };
        }),
      );

      if (attemptsError) {
        throw new Error("Unable to write message attempts");
      }
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
    await updateCampaignJob(job.id, {
      state: "completed",
      completedAt: new Date().toISOString(),
    });
    processed.push(job.id);
  }

  return { processedJobs: processed.length, processed };
}
