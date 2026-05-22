import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listCampaigns } from "@/lib/campaigns/repository";
import { formatCredits, formatNumber } from "@/lib/format";
import { AppSection } from "@/components/ui";

export default async function ReportsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const campaigns = await listCampaigns(viewer.workspace.id);
  const deliveredCredits = campaigns.reduce((total, campaign) => total + campaign.creditsUsed, 0);
  const reportHighlights = [
    {
      label: "Completed campaigns",
      value: formatNumber(campaigns.filter((campaign) => campaign.state === "completed").length),
      helper: "Campaigns that cleared final recheck and sent successfully.",
    },
    {
      label: "Queued campaigns",
      value: formatNumber(campaigns.filter((campaign) => campaign.state === "queued").length),
      helper: "Campaigns waiting for schedule time or queue processing.",
    },
    {
      label: "Credits consumed",
      value: formatCredits(deliveredCredits),
      helper: "Debits posted after successful execution runs.",
    },
  ];

  return (
    <AppSection
      title="Reports"
      description="The reporting shell prioritizes campaign outcomes and plain-language status over gateway-heavy jargon."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {reportHighlights.map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-5">
            <p className="mono-number text-xs uppercase text-white/36">{item.label}</p>
            <p className="mono-number mt-4 text-4xl text-white">{item.value}</p>
            <p className="mt-3 text-sm leading-6 text-white/52">{item.helper}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="border-b border-white/10 p-5">
          <p className="mono-number text-xs uppercase text-white/36">Campaign performance snapshot</p>
        </div>
        <div className="divide-y divide-white/10">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr]"
            >
              <div>
                <p className="font-medium text-white">{campaign.name}</p>
                <p className="mt-1 text-xs text-white/42">{campaign.audienceFilterSummary}</p>
              </div>
              <Metric label="Delivered" value={formatNumber(campaign.actualRecipients)} />
              <Metric label="Failed" value={campaign.failureReason ? "1 issue" : "0"} />
              <Metric label="Cost" value={formatCredits(campaign.creditsUsed || campaign.estimatedCredits)} />
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-number text-[10px] uppercase text-white/32">{label}</p>
      <p className="mt-2 text-sm text-white/72">{value}</p>
    </div>
  );
}
