import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignStateActions } from "@/components/campaign-state-actions";
import { AppSection, Button } from "@/components/ui";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import {
  getCampaign,
  getCampaignAudienceGroupIds,
  getCampaignEstimate,
} from "@/lib/campaigns/repository";
import { listContactGroupsWithCounts } from "@/lib/contacts/repository";
import { formatCredits, formatDateTime, formatNumber } from "@/lib/format";
import { listSenderIds } from "@/lib/sender-ids/repository";

type Params = Promise<{ campaignId: string }>;

export default async function CampaignDetailPage({
  params,
}: {
  params: Params;
}) {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const { campaignId } = await params;
  const campaign = await getCampaign(viewer.workspace.id, campaignId);

  if (!campaign) {
    notFound();
  }

  const [estimate, senderIds, groupIds, groups] = await Promise.all([
    getCampaignEstimate(viewer.workspace.id, campaign.id),
    listSenderIds(viewer.workspace.id),
    getCampaignAudienceGroupIds(viewer.workspace.id, campaign.id),
    listContactGroupsWithCounts(viewer.workspace.id),
  ]);

  const sender = senderIds.find((item) => item.id === campaign.senderId);
  const groupNames = groups
    .filter((group) => groupIds.includes(group.id))
    .map((group) => group.name);

  return (
    <AppSection
      title={campaign.name}
      description="Campaign detail combines draft values, execution state, recipient math, and recovery actions."
      action={<Button href="/app/campaigns/new">New campaign</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg app-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b app-border pb-5">
            <div>
              <p className="mono-number text-xs uppercase app-label">Execution state</p>
              <h2 className="mt-2 text-2xl font-medium text-[var(--app-text)]">
                {campaign.state.replaceAll("_", " ")}
              </h2>
              <p className="mt-2 text-sm app-muted">
                {campaign.failureReason ? `Current blocker: ${campaign.failureReason}` : "No current blockers."}
              </p>
            </div>
            <CampaignStateActions campaignId={campaign.id} state={campaign.state} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <DetailCard label="Sender" value={sender?.name ?? campaign.senderId} />
            <DetailCard label="Sender status" value={sender?.status.replaceAll("_", " ") ?? "unknown"} />
            <DetailCard label="Audience groups" value={groupNames.join(", ") || "No groups linked"} />
            <DetailCard label="Filters" value={campaign.audienceFilters.map((filter) => `${filter.field}:${filter.value}`).join(", ") || "No filters"} />
            <DetailCard label="Schedule" value={formatDateTime(campaign.scheduleAt)} />
            <DetailCard label="Updated" value={formatDateTime(campaign.updatedAt)} />
          </div>

          <div className="mt-5 rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-5">
            <p className="mono-number text-xs uppercase app-label">Message body</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--app-text)]">{campaign.message}</p>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg app-card-gradient p-5">
            <p className="mono-number text-xs uppercase app-label">Recipient snapshot</p>
            <div className="mt-5 space-y-3">
              <SummaryRow label="Resolved recipients" value={formatNumber(estimate.recipients)} />
              <SummaryRow label="Deliverable now" value={formatNumber(estimate.summary.deliverable)} />
              <SummaryRow label="Suppressed" value={formatNumber(estimate.summary.suppressed)} />
              <SummaryRow label="Invalid" value={formatNumber(estimate.summary.invalid)} />
            </div>
          </section>

          <section className="rounded-lg app-card p-5">
            <p className="mono-number text-xs uppercase app-label">Cost and outcome</p>
            <div className="mt-5 space-y-3">
              <SummaryRow label="Units per recipient" value={String(estimate.unitsPerRecipient)} />
              <SummaryRow label="Estimated credits" value={formatCredits(estimate.credits)} />
              <SummaryRow label="Credits used" value={formatCredits(campaign.creditsUsed)} />
              <SummaryRow label="Actual recipients" value={formatNumber(campaign.actualRecipients)} />
            </div>
          </section>

          <Link href="/app/campaigns" className="inline-flex text-sm font-medium text-primary">
            Back to campaign ledger
          </Link>
        </aside>
      </div>
    </AppSection>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-panel-soft)] p-4">
      <p className="mono-number text-[10px] uppercase app-label">{label}</p>
      <p className="mt-3 text-sm text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b app-border pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm app-muted">{label}</p>
      <p className="mono-number text-sm text-[var(--app-text)]">{value}</p>
    </div>
  );
}
