import { AppSection, Button } from "@/components/ui";
import { recentCampaigns } from "@/data/site";

export default function CampaignsPage() {
  return (
    <AppSection
      title="Campaigns"
      description="A focused campaign ledger for scheduled, delivered, and review-ready sends. The data is local for now, but the hierarchy is production-shaped."
      action={<Button href="/app/campaigns/new">Create Campaign</Button>}
    >
      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
          {["All campaigns", "Scheduled", "Delivered", "Needs review"].map((filter) => (
            <button
              key={filter}
              className={`rounded-md px-3 py-2 text-sm ${
                filter === "All campaigns"
                  ? "bg-primary text-white"
                  : "border border-white/10 text-white/58 hover:bg-white/10 hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="divide-y divide-white/10">
          {recentCampaigns.map((item) => (
            <div
              key={item.name}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.35fr_0.75fr_0.85fr_0.75fr_0.65fr]"
            >
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="mt-1 text-xs text-white/42">{item.audience}</p>
              </div>
              <Cell label="Status" value={item.status} />
              <Cell label="Send time" value={item.sentAt} />
              <Cell label="Recipients" value={item.recipients} />
              <Cell label="Cost" value={item.cost} />
            </div>
          ))}
        </div>
      </section>
    </AppSection>
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
