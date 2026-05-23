import Image from "next/image";
import {
  ChartLineUp,
  CheckCircle,
} from "@phosphor-icons/react/dist/ssr";
import {
  featureCards,
  pricingComparison,
  pricingTiers,
  reportHighlights,
  workflowSteps,
} from "@/data/site";
import { Button, SectionIntro } from "./ui";

const channelBadges = [
  { title: "SMS", note: "Delivery reporting" },
  { title: "Sender IDs", note: "Approval visibility" },
  { title: "Wallet", note: "Credit control" },
  { title: "Reports", note: "Operator insight" },
];

const platformPillars = [
  {
    title: "Broadcast with control",
    detail:
      "Launch bulk SMS campaigns with sender review, live credit visibility, and cleaner delivery discipline.",
  },
  {
    title: "Built for repeat outreach",
    detail:
      "For schools, churches, NGOs, and SMEs that send often and cannot afford messy lists or vague reporting.",
  },
  {
    title: "Conversion-minded workflow",
    detail:
      "Keep audience prep, message timing, wallet readiness, and send confidence aligned before every blast.",
  },
];

const trustPanels = [
  {
    title: "Sender governance",
    value: "Reviewed before launch",
    detail: "Operators see which sender IDs are approved, in review, or blocked before campaign release.",
  },
  {
    title: "Wallet accountability",
    value: "Credits always visible",
    detail: "Top-ups, deductions, and balance readiness are part of the send workflow instead of being buried elsewhere.",
  },
  {
    title: "Delivery reporting",
    value: "Status in plain language",
    detail: "Delivered, failed, pending, and review states stay readable for daily operations teams.",
  },
];

const sectors = [
  {
    title: "Churches",
    summary: "Service reminders, follow-up notices, and department updates in one controlled messaging workspace.",
  },
  {
    title: "Schools",
    summary: "PTA notices, fee reminders, parent alerts, and schedule changes with sender and credit clarity.",
  },
  {
    title: "NGOs",
    summary: "Volunteer coordination, campaign mobilization, and outreach updates with better traceability.",
  },
  {
    title: "SMEs",
    summary: "Promotions, customer reminders, and recurring operational alerts without improvising every send.",
  },
];

export function HeroSection() {
  return (
    <section className="ark-hero-shell">
      <div className="page-shell grid items-center gap-12 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
        <div className="max-w-2xl">
          <h1 className="ark-hero-title">
            Send bulk SMS campaigns with stronger deliverability, cleaner targeting, and full operator control.
          </h1>
          <p className="ark-hero-copy mt-8 max-w-xl">
            Cento helps teams segment lists, protect sender trust, manage credits, and track campaign outcomes from one focused SMS workspace.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button href="/signup" className="ark-primary-button min-w-[220px]">
              Start Using for Free
            </Button>
            <Button href="/pricing" variant="secondary" className="ark-secondary-button min-w-[220px]">
              View Pricing
            </Button>
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}

export function HeroIllustration() {
  return (
    <div className="ark-hero-visual">
      <div className="ark-visual-dot left-[8%] top-[10%]" />
      <div className="ark-visual-dot left-[18%] bottom-[18%]" />
      <div className="ark-visual-dot right-[12%] top-[22%]" />
      <div className="ark-visual-dot right-[18%] bottom-[16%]" />

      <div className="ark-connector left-[25%] top-[27%] h-[24%] w-[24%]" />
      <div className="ark-connector right-[24%] top-[28%] h-[22%] w-[24%]" />
      <div className="ark-connector left-[24%] bottom-[22%] h-[18%] w-[24%]" />
      <div className="ark-connector right-[24%] bottom-[21%] h-[18%] w-[24%]" />

      <FloatingSignalCard
        className="left-[7%] top-[19%]"
        title="SMS"
        subtitle="Queued sends"
        accent="green"
      />
      <FloatingSignalCard
        className="right-[5%] top-[24%]"
        title="Sender ID"
        subtitle="Approval ready"
        accent="blue"
      />
      <FloatingSignalCard
        className="left-[3%] bottom-[14%]"
        title="Wallet"
        subtitle="Credit visibility"
        accent="navy"
      />
      <FloatingSignalCard
        className="right-[4%] bottom-[14%]"
        title="Reports"
        subtitle="Outcome scan"
        accent="green"
      />

      <div className="ark-phone">
        <div className="ark-phone-screen">
          <div className="ark-phone-topbar">
            <div className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b9c6d8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#b9c6d8]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#b9c6d8]" />
            </div>
            <div className="ark-phone-speaker" />
            <div className="h-3 w-3 rounded-[4px] bg-[#d3ddea]" />
          </div>
          <div className="mt-6 text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-[#f5f9ff] px-4 py-1.5">
              <span className="h-3 w-8 skew-x-[-18deg] rounded-sm bg-primary" />
              <span className="text-sm font-semibold text-[#203d5d]">Cento</span>
            </div>
            <h3 className="mt-5 text-[1.35rem] font-semibold text-[#243d5c]">Message Analytics</h3>
            <p className="mt-1 text-xs text-[#93a3b8]">SMS operations overview</p>
          </div>
          <div className="mt-6 flex h-[98px] items-end justify-center gap-2.5 px-5">
            {[48, 36, 62, 44, 56].map((height, index) => (
              <div
                key={height}
                className={`w-5 rounded-t-[8px] ${index % 2 === 0 ? "bg-[#5cc58c]" : "bg-primary/80"}`}
                style={{ height }}
              />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center gap-5 text-[11px] text-[#a1afc0]">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#5cc58c]" />Active</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary/70" />Pending</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#d3ddea]" />Queued</span>
          </div>
          <div className="mt-5 px-6">
            <div className="relative h-[60px] overflow-hidden rounded-[16px] bg-[#f6fbff]">
              <div className="absolute left-3 right-3 top-[24px] h-[2px] bg-[#d9e5f1]" />
              <div className="absolute left-0 top-[20px] h-[3px] w-full origin-left rotate-[12deg] rounded-full bg-[#5cc58c]" />
              <div className="absolute left-0 top-[30px] h-[3px] w-full origin-left rotate-[6deg] rounded-full bg-primary/60" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 px-6 text-center">
            {channelBadges.map((item) => (
              <div key={item.title}>
                <p className="text-[13px] font-semibold text-[#233d5a]">{item.title}</p>
                <p className="mt-1 text-[10px] text-[#7ea078]">{item.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-around border-t border-[#edf2f7] px-8 pt-4 text-[#97a6b7]">
            <span className="h-3 w-3 rounded-full bg-[#5cc58c]" />
            <span className="h-4 w-4 rounded-[4px] border-2 border-current" />
            <span className="h-4 w-4 rounded-full border-2 border-current" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingSignalCard({
  className,
  title,
  subtitle,
  accent,
}: {
  className: string;
  title: string;
  subtitle: string;
  accent: "green" | "blue" | "navy";
}) {
  return (
    <div className={`ark-floating-card ${className}`}>
      <div className="flex items-start gap-3">
        <span className={`ark-floating-icon ark-floating-icon-${accent}`} />
        <div>
          <p className="text-base font-semibold text-[#1f3550]">{title}</p>
          <p className={`mt-2 text-sm font-medium ${accent === "green" ? "text-[#5cc58c]" : accent === "blue" ? "text-primary" : "text-[#233d5a]"}`}>
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MetricsRibbon() {
  return (
    <section className="page-shell py-7">
      <div className="grid gap-5 md:grid-cols-3">
        {platformPillars.map((item) => (
          <div key={item.title} className="ark-kicker-card ark-animate-card">
            <p className="text-[1.08rem] font-semibold text-[#263f5b]">{item.title}</p>
            <p className="mt-3 text-[15px] leading-7 text-muted">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TrustBand() {
  return (
    <section className="page-shell py-18">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="ark-section-eyebrow">How Cento works</p>
          <h2 className="ark-section-title mt-5">
            Built for repeat campaigns that need trust, timing, and measurable delivery.
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted">
            Every send starts with the basics that matter most: audience quality, sender approval, credit readiness, and campaign reporting you can act on.
          </p>
        </div>
        <div className="grid gap-5">
          {trustPanels.map((panel) => (
            <div key={panel.title} className="ark-trust-card ark-animate-card">
              <div>
                <p className="marketing-field-label text-primary">{panel.title}</p>
                <h3 className="mt-3 text-[1.55rem] font-semibold text-[#233d5a]">{panel.value}</h3>
                <p className="mt-3 text-[15px] leading-7 text-muted">{panel.detail}</p>
              </div>
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
      title="Core product surfaces for teams that need organized, high-volume SMS execution."
      description="From campaign drafting to wallet visibility and sender governance, Cento keeps the operational pieces tight and sales-ready."
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((feature) => (
          <div key={feature.title} className="ark-feature-card ark-animate-card">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <feature.icon size={20} weight="bold" />
            </div>
            <h3 className="mt-5 text-[1.45rem] font-semibold text-[#233d5a]">{feature.title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-muted">{feature.description}</p>
            <p className="mt-5 text-sm font-medium text-[#233d5a]">{feature.proof}</p>
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
      title="A simple send flow for teams that want faster launches and fewer campaign mistakes."
      description="Capture your workspace once, build the list, tighten the copy, launch at the right time, and track the results."
      tone="cream"
    >
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="ark-step-card ark-animate-card">
              <div className="flex items-center justify-between">
                <step.icon size={20} weight="bold" className="text-primary" />
                <span className="marketing-field-label text-muted">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-[1.06rem] font-semibold text-[#233d5a]">{step.title}</h3>
              <p className="mt-3 text-[15px] leading-6 text-muted">{step.detail}</p>
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
      title="Pricing stays tied to operational readiness, not decorative plan names."
      description="Teams buy into a workflow that keeps credits, send approvals, support posture, and reporting visible."
    >
      <PricingCards />
    </MarketingSection>
  );
}

export function PricingCards() {
  return (
      <div className="grid gap-5 lg:grid-cols-3">
      {pricingTiers.map((tier, index) => (
        <div
          key={tier.name}
          className={`ark-price-card ark-price-static-card ark-animate-card ${tier.featured ? "ark-price-card-featured" : ""} ${index === 1 ? "ark-price-glow" : ""}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-[#233d5a]">{tier.name}</p>
              <p className="mt-4 text-[2rem] font-semibold text-[#233d5a]">{tier.price}</p>
            </div>
            {tier.featured ? <span className="ark-badge">Recommended</span> : null}
          </div>
          <p className="mt-3 text-sm font-semibold text-primary">{tier.credits}</p>
          <p className="mt-3 text-[15px] leading-6 text-muted">{tier.description}</p>
          <ul className="mt-6 space-y-3">
            {tier.perks.map((perk) => (
              <li key={perk} className="flex gap-3 text-sm text-[#233d5a]">
                <CheckCircle size={17} weight="fill" className="mt-0.5 text-[#5cc58c]" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
          <Button
            href={tier.featured ? "/signup" : "/contact"}
            variant={tier.featured ? "primary" : "secondary"}
            className="mt-8 w-full"
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
    <div className="overflow-x-auto rounded-[24px] border border-line bg-white">
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
              <td className="px-5 py-4 font-medium text-[#233d5a]">{row.feature}</td>
              <td className="px-5 py-4 text-muted">{row.starter}</td>
              <td className="px-5 py-4 text-[#233d5a]">{row.growth}</td>
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
      eyebrow="Industries"
      title="Built for sectors that need clear, repeatable, accountable outreach."
      description="Cento keeps the same core operator flow while supporting the messaging patterns used by churches, schools, NGOs, and SMEs."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {sectors.map((sector, index) => (
          <div key={sector.title} className="ark-sector-card ark-animate-card">
            <p className="marketing-field-label text-primary">0{index + 1}</p>
            <h3 className="mt-4 text-[1.45rem] font-semibold text-[#233d5a]">{sector.title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-muted">{sector.summary}</p>
          </div>
        ))}
      </div>
    </MarketingSection>
  );
}

export function CTASection() {
  return (
    <section className="page-shell py-18">
      <div className="ark-cta-panel">
        <div>
          <p className="marketing-field-label text-primary">Start with Cento</p>
          <h2 className="ark-cta-title mt-4 text-4xl font-semibold leading-[1.18] text-[#233d5a] sm:text-5xl">
            Create the account, set the workspace once, and move straight into your operational dashboard.
          </h2>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button href="/signup" className="ark-primary-button min-w-[220px]">
            Start Using for Free
          </Button>
          <Button href="/contact" variant="secondary" className="ark-secondary-button min-w-[220px]">
            Book Demo
          </Button>
        </div>
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
  return (
    <section className={tone === "cream" ? "bg-[rgba(255,255,255,0.54)] py-18" : tone === "dark" ? "bg-[var(--cream-50)] py-18" : "py-18"}>
      <div className="page-shell">
        <div className="max-w-3xl">
          <SectionIntro eyebrow={eyebrow} title={title} description={description} />
        </div>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

export function ReportBand() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {reportHighlights.map((item) => (
        <div key={item.label} className="ark-report-card ark-animate-card">
          <ChartLineUp size={20} weight="bold" className="text-primary" />
          <p className="mt-5 text-[2rem] font-semibold text-white">{item.value}</p>
          <p className="mt-2 text-base font-medium text-white">{item.label}</p>
          <p className="mt-3 text-sm leading-7 text-white/70">{item.helper}</p>
        </div>
      ))}
    </div>
  );
}

export function AuthIllustrationPanel({
  eyebrow,
  title,
  description,
  imageSrc,
  imageAlt,
  imageClassName = "",
}: {
  eyebrow: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  imageClassName?: string;
}) {
  return (
    <div className="ark-auth-panel">
      <div className="max-w-xl">
        <p className="ark-section-eyebrow">{eyebrow}</p>
        <h1 className="ark-section-title mt-5">{title}</h1>
        <p className="mt-6 text-lg leading-8 text-muted">{description}</p>
      </div>
      <div className="ark-auth-illustration-wrap mt-6">
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={1600}
          height={1600}
          unoptimized={imageSrc.endsWith(".svg")}
          className={`ark-auth-illustration object-contain ${imageClassName}`}
        />
      </div>
    </div>
  );
}
