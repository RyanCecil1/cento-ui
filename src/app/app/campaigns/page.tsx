import Link from "next/link";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listCampaigns } from "@/lib/campaigns/repository";
import { formatCredits, formatNumber, formatShortDateTime } from "@/lib/format";
import { AppSection, Button } from "@/components/ui";

export default async function CampaignsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const campaigns = await listCampaigns(viewer.workspace.id);
  const counts = {
    all: campaigns.length,
    queued: campaigns.filter((campaign) => campaign.state === "queued").length,
    completed: campaigns.filter((campaign) => campaign.state.startsWith("completed")).length,
    needsAttention: campaigns.filter((campaign) => campaign.state === "needs_attention").length,
  };

  return (
    <AppSection
      title="Campaigns"
      description="Track draft, queued, sent, paused, and blocked campaigns from a single execution ledger."
      action={<Button href="/app/campaigns/new">Create Campaign</Button>}
    >
      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
          <Chip label="All campaigns" value={counts.all} active />
          <Chip label="Queued" value={counts.queued} />
          <Chip label="Delivered" value={counts.completed} />
          <Chip label="Needs attention" value={counts.needsAttention} />
        </div>

        <div className="divide-y divide-white/10">
          {campaigns.map((item) => (
            <div
              key={item.id}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.35fr_0.75fr_0.85fr_0.75fr_0.65fr]"
            >
              <div>
                <Link href={`/app/campaigns/${item.id}`} className="font-medium text-white hover:text-primary">
                  {item.name}
                </Link>
                <p className="mt-1 text-xs text-white/42">{item.audienceFilterSummary}</p>
              </div>
              <Cell label="Status" value={item.state.replaceAll("_", " ")} />
              <Cell label="Send time" value={formatShortDateTime(item.scheduleAt ?? item.updatedAt)} />
              <Cell label="Recipients" value={formatNumber(item.estimatedRecipients)} />
              <Cell label="Cost" value={formatCredits(item.estimatedCredits)} />
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}

function Chip({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-md px-3 py-2 text-sm ${
        active
          ? "bg-primary text-white"
          : "border border-white/10 text-white/58"
      }`}
    >
      {label} ({value})
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-number text-[10px] uppercase text-white/32">{label}</p>
      <p className="mt-2 text-sm text-white/72">{value}</p>
    </div>
  );
}
