import { AppSection } from "@/components/ui";
import { recentCampaigns, reportHighlights } from "@/data/site";

export default function ReportsPage() {
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
          {recentCampaigns.map((campaign) => (
            <div
              key={campaign.name}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.35fr_0.8fr_0.8fr_0.8fr]"
            >
              <div>
                <p className="font-medium text-white">{campaign.name}</p>
                <p className="mt-1 text-xs text-white/42">{campaign.audience}</p>
              </div>
              <Metric label="Delivered" value={campaign.delivered} />
              <Metric label="Failed" value={campaign.failed} />
              <Metric label="Cost" value={campaign.cost} />
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
