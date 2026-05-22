import { getCurrentViewer } from "@/lib/auth/current-viewer";
import { listCampaigns } from "@/lib/campaigns/repository";
import { getContactQualitySummary } from "@/lib/contacts/repository";
import { formatCredits, formatNumber, formatShortDateTime } from "@/lib/format";
import { getWorkspaceBalance, listWalletEntries } from "@/lib/wallet/repository";
import { AppSection, Button } from "@/components/ui";
import { quickActions } from "@/data/site";

export default async function AppOverviewPage() {
  const viewer = await getCurrentViewer();

  if (!viewer) {
    return null;
  }

  const [campaigns, walletBalance, walletEntries, contactSummary] = await Promise.all([
    listCampaigns(viewer.workspace.id),
    getWorkspaceBalance(viewer.workspace.id),
    listWalletEntries(viewer.workspace.id),
    getContactQualitySummary(viewer.workspace.id),
  ]);

  const recentCampaigns = campaigns.slice(0, 4);
  const dashboardStats = [
    {
      label: "Available credits",
      value: formatNumber(walletBalance),
      helper: "Current wallet balance ready for queued or immediate sends.",
    },
    {
      label: "Queued campaigns",
      value: formatNumber(campaigns.filter((campaign) => campaign.state === "queued").length),
      helper: "Campaigns waiting for execution or scheduled send time.",
    },
    {
      label: "Deliverable contacts",
      value: formatNumber(contactSummary.deliverable),
      helper: "Recipients available after duplicate, invalid, and suppression checks.",
    },
    {
      label: "Needs attention",
      value: formatNumber(campaigns.filter((campaign) => campaign.state === "needs_attention").length),
      helper: "Campaigns blocked by sender, balance, or audience recheck issues.",
    },
  ];

  return (
    <div className="space-y-6">
      <AppSection
        title="Operations overview"
        description={`Monitor ${viewer.workspace.name}, its current credit health, and the campaigns that will send next.`}
        action={<Button href="/app/campaigns/new">Create Campaign</Button>}
      >
        <div className="grid gap-4 xl:grid-cols-4">
          {dashboardStats.map((item) => (
            <div key={item.label} className="rounded-lg app-card-soft p-5">
              <p className="mono-number text-[11px] uppercase app-label">{item.label}</p>
              <p className="mono-number mt-4 text-3xl text-[var(--app-text)]">{item.value}</p>
              <p className="mt-3 text-sm leading-6 app-muted">{item.helper}</p>
            </div>
          ))}
        </div>
      </AppSection>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg app-card">
          <div className="flex items-center justify-between border-b app-border p-5">
            <div>
              <p className="mono-number text-xs uppercase app-label">Campaign desk</p>
              <h2 className="mt-2 text-xl font-medium text-[var(--app-text)]">Recent campaigns</h2>
            </div>
            <Button href="/app/campaigns" variant="dark">
              View all
            </Button>
          </div>
          <div className="divide-y divide-[var(--app-border)]">
            {recentCampaigns.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1.35fr_0.75fr_0.85fr_0.75fr_0.65fr]"
              >
                <div>
                  <p className="font-medium text-[var(--app-text)]">{item.name}</p>
                  <p className="mt-1 text-xs app-label">{item.audienceFilterSummary}</p>
                </div>
                <InfoCell label="Status" value={item.state.replaceAll("_", " ")} />
                <InfoCell label="When" value={formatShortDateTime(item.scheduleAt ?? item.updatedAt)} />
                <InfoCell label="Recipients" value={formatNumber(item.estimatedRecipients)} />
                <InfoCell label="Cost" value={formatCredits(item.estimatedCredits)} />
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-lg app-card-gradient p-5">
            <p className="mono-number text-xs uppercase text-primary">First-run actions</p>
            <div className="mt-5 space-y-3">
              {quickActions.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="flex gap-3 rounded-md app-card-soft p-4 transition hover:border-primary/60 hover:bg-[var(--app-hover)]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
                    <item.icon size={17} weight="bold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 app-muted">{item.detail}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section className="rounded-lg app-card p-5">
            <p className="mono-number text-xs uppercase app-label">Wallet activity</p>
            <div className="mt-5 space-y-3">
              {walletEntries.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 border-b app-border pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--app-text)]">{item.reason}</p>
                    <p className="mt-1 text-xs app-label">{item.meta}</p>
                  </div>
                  <p className="mono-number text-sm text-[var(--app-text)]">
                    {item.direction === "credit" ? "+" : "-"}
                    {formatCredits(item.units)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mono-number text-[10px] uppercase app-label">{label}</p>
      <p className="mt-2 text-sm app-muted-strong">{value}</p>
    </div>
  );
}
