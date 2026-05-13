import {
  ArrowRight,
  ChartLineUp,
  CheckCircle,
  PaperPlaneTilt,
} from "@phosphor-icons/react/dist/ssr";
import {
  dashboardStats,
  featureCards,
  homepageMetrics,
  industries,
  pricingComparison,
  pricingTiers,
  recentCampaigns,
  reportHighlights,
  workflowSteps,
} from "@/data/site";
import { Button, SectionIntro } from "./ui";

export function HeroSection() {
  return (
    <section className="controlled-plane border-b border-line">
      <div className="page-shell grid min-h-[calc(100dvh-64px)] gap-10 py-14 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:py-18">
        <div className="section-fade max-w-2xl">
          <p className="mono-number text-xs uppercase text-primary">Bulk SMS operations</p>
          <h1 className="display-title mt-5 text-5xl font-medium leading-[1.04] text-foreground sm:text-6xl">
            Cento
          </h1>
          <p className="mt-5 max-w-xl text-xl leading-8 text-muted">
            A premium SMS workspace for teams that need contacts, credits, sender
            IDs, campaign review, and delivery reporting in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup">
              Start Free Trial
              <ArrowRight size={16} weight="bold" />
            </Button>
            <Button href="/contact" variant="secondary">
              Book Demo
            </Button>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  );
}

export function DashboardPreview() {
  return (
    <div className="section-fade overflow-hidden rounded-lg border border-line bg-white shadow-[var(--shadow-quiet)]">
      <div className="grid min-h-[560px] lg:grid-cols-[220px_1fr]">
        <aside className="hidden border-r border-white/10 bg-[#111018] p-5 text-white lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-xs font-semibold">
              C
            </div>
            <div>
              <p className="display-title text-base font-medium">Cento</p>
              <p className="mono-number mt-1 text-[10px] uppercase text-white/42">Command</p>
            </div>
          </div>
          <nav className="mt-8 space-y-1">
            {["Overview", "Campaigns", "Contacts", "Wallet", "Reports", "AI Writer"].map(
              (item, index) => (
                <div
                  key={item}
                  className={`rounded-md px-3 py-2.5 text-sm ${
                    index === 0 ? "bg-white/10 text-white" : "text-white/52"
                  }`}
                >
                  {item}
                </div>
              ),
            )}
          </nav>
        </aside>

        <div className="bg-[#17121f] p-5 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mono-number text-xs uppercase text-white/42">Overview</p>
              <h3 className="display-title mt-2 text-2xl font-medium text-white">
                Campaign control room
              </h3>
            </div>
            <Button href="/app/campaigns/new" className="self-start">
              Create Campaign
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardStats.map((item) => (
              <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="mono-number text-[11px] uppercase text-white/42">{item.label}</p>
                <p className="mono-number mt-3 text-2xl text-white">{item.value}</p>
                <p className="mt-2 text-xs leading-5 text-white/52">{item.helper}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-lg border border-white/10">
            <div className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 px-4 py-3 text-xs uppercase text-white/36">
              <span>Campaign</span>
              <span>Status</span>
              <span>Recipients</span>
              <span>Cost</span>
            </div>
            {recentCampaigns.map((campaign) => (
              <div
                key={campaign.name}
                className="grid grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr] border-b border-white/10 px-4 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="text-white">{campaign.name}</p>
                  <p className="mt-1 text-xs text-white/42">{campaign.audience}</p>
                </div>
                <span className="text-white/72">{campaign.status}</span>
                <span className="mono-number text-white/72">{campaign.recipients}</span>
                <span className="mono-number text-white/72">{campaign.cost}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetricsRibbon({ items = homepageMetrics }: { items?: typeof homepageMetrics }) {
  return (
    <section className="border-b border-line bg-white">
      <div className="page-shell grid gap-px bg-line md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-white px-6 py-7">
            <p className="mono-number text-3xl text-foreground">{item.value}</p>
            <p className="mt-3 text-sm font-medium text-foreground">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrustBand() {
  return (
    <section className="page-shell py-16">
      <div className="grid gap-8 border-y border-line py-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionIntro
          eyebrow="Who it is built for"
          title="Recurring communication teams need a workspace, not just a send button."
          description="Cento is shaped for organizations that send reminders, notices, and promotions often enough that credits, delivery, and list quality need to stay visible."
        />
        <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {industries.map((industry) => (
            <div key={industry.name} className="bg-white p-5">
              <h3 className="text-base font-medium text-foreground">{industry.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{industry.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <MarketingSection
      eyebrow="Product architecture"
      title="The main surfaces are arranged around action, review, and accountability."
      description="Each module has a job: prepare the audience, create the campaign, understand the cost, send with confidence, and trace what happened afterward."
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-3">
        {featureCards.map((feature) => (
          <div key={feature.title} className="bg-white p-6">
            <feature.icon size={22} weight="bold" className="text-primary" />
            <h3 className="mt-6 text-xl font-medium text-foreground">{feature.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{feature.description}</p>
            <p className="mt-5 border-t border-line pt-4 text-sm text-foreground">
              {feature.proof}
            </p>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}

export function HowItWorks() {
  return (
    <MarketingSection
      eyebrow="Workflow"
      title="A guided path from signup to the first campaign."
      description="The UI now supports the real product journey: onboarding, contact prep, campaign review, and reporting."
      tone="cream"
    >
      <div className="grid gap-4 lg:grid-cols-4">
        {workflowSteps.map((step, index) => (
          <div key={step.title} className="rounded-lg border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <step.icon size={22} weight="bold" className="text-primary" />
              <span className="mono-number text-xs text-muted">0{index + 1}</span>
            </div>
            <h3 className="mt-7 text-lg font-medium text-foreground">{step.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{step.detail}</p>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}

export function PricingPreview() {
  return (
    <MarketingSection
      eyebrow="Credit bundles"
      title="Pricing is visible before users enter the campaign flow."
      description="The pricing model is shaped around wallet top-ups, not abstract SaaS seats, because SMS cost clarity is part of the product trust."
    >
      <PricingCards />
    </MarketingSection>
  );
}

export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {pricingTiers.map((tier) => (
        <div
          key={tier.name}
          className={`rounded-lg border bg-white p-6 ${
            tier.featured ? "border-primary shadow-[var(--shadow-quiet)]" : "border-line"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">{tier.name}</p>
              <p className="mono-number mt-5 text-4xl text-foreground">{tier.price}</p>
            </div>
            {tier.featured ? (
              <span className="rounded bg-primary px-2 py-1 text-xs font-medium text-white">
                Recommended
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm font-medium text-primary">{tier.credits}</p>
          <p className="mt-3 text-sm leading-6 text-muted">{tier.description}</p>
          <ul className="mt-6 space-y-3 border-t border-line pt-5">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-sm text-foreground">
                <CheckCircle size={17} weight="fill" className="mt-0.5 text-success" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button
            href={tier.featured ? "/signup" : "/contact"}
            variant={tier.featured ? "primary" : "secondary"}
            className="mt-7 w-full"
          >
            {tier.cta}
          </Button>
        </div>
      ))}
    </div>
  );
}

export function PricingComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white">
      <table className="min-w-[760px] w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--cream-50)] text-left text-xs uppercase text-muted">
            <th className="px-5 py-4 font-medium">Feature</th>
            <th className="px-5 py-4 font-medium">Starter</th>
            <th className="px-5 py-4 font-medium">Growth</th>
            <th className="px-5 py-4 font-medium">Scale</th>
          </tr>
        </thead>
        <tbody>
          {pricingComparison.map((row) => (
            <tr key={row.feature} className="border-t border-line">
              <td className="px-5 py-4 font-medium text-foreground">{row.feature}</td>
              <td className="px-5 py-4 text-muted">{row.starter}</td>
              <td className="px-5 py-4 text-foreground">{row.growth}</td>
              <td className="px-5 py-4 text-muted">{row.scale}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function IndustryStrip() {
  return (
    <MarketingSection
      eyebrow="Use cases"
      title="Built for repeat communication across Ghana-first organizations."
      description="The interface does not assume one kind of sender. It keeps the workflow consistent while letting each sector bring its own audience and message rhythm."
      tone="dark"
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
        {industries.map((industry) => (
          <div key={industry.name} className="bg-white/5 p-5">
            <h3 className="text-lg font-medium text-white">{industry.name}</h3>
            <p className="mt-3 text-sm leading-6 text-white/58">{industry.detail}</p>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}

export function CTASection() {
  return (
    <section className="page-shell py-16">
      <div className="grid gap-8 rounded-lg bg-foreground p-8 text-white md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="mono-number text-xs uppercase text-white/42">Ready to walk the flow</p>
          <h2 className="display-title mt-4 max-w-3xl text-3xl font-medium leading-[1.12] sm:text-5xl">
            Start with onboarding, then move directly into the dashboard and campaign builder.
          </h2>
        </div>
        <Button href="/signup" variant="light">
          Start Free Trial
          <PaperPlaneTilt size={16} weight="bold" />
        </Button>
      </div>
    </section>
  );
}

export function MarketingSection({
  eyebrow,
  title,
  description,
  children,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  tone?: "light" | "cream" | "dark";
}) {
  if (tone === "dark") {
    return (
      <section className="bg-foreground py-16 text-white">
        <div className="page-shell">
          <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
            <div>
              <p className="mono-number text-xs uppercase text-white/42">{eyebrow}</p>
              <h2 className="display-title mt-4 text-3xl font-medium leading-[1.08] text-white sm:text-5xl">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-7 text-white/58">{description}</p>
            </div>
            {children}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={tone === "cream" ? "bg-surface py-16" : "py-16"}>
      <div className="page-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionIntro eyebrow={eyebrow} title={title} description={description} />
          {children}
        </div>
      </div>
    </section>
  );
}

export function ReportBand() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {reportHighlights.map((item) => (
        <div key={item.label} className="rounded-lg border border-line bg-white p-5">
          <ChartLineUp size={20} weight="bold" className="text-primary" />
          <p className="mono-number mt-5 text-3xl text-foreground">{item.value}</p>
          <p className="mt-2 text-sm font-medium text-foreground">{item.label}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}
