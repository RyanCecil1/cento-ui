import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { Button, SectionIntro } from "@/components/ui";

export default function ContactPage() {
  return (
    <>
      <MarketingHeader />
      <main className="page-shell flex-1 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <SectionIntro
            eyebrow="Book a walkthrough"
            title="Review the website, onboarding, and campaign workflow with the team."
            description="This page is still frontend-only, but it models the sales-assisted path Cento can use for higher-volume organizations and sender-ID-heavy accounts."
          />
          <section className="rounded-lg border border-line bg-white p-6 shadow-[var(--shadow-quiet)]">
            <div className="grid gap-4">
              <MockField label="Full name" value="Ryan Kafui" />
              <MockField label="Email address" value="ryan@example.com" />
              <MockField label="Company" value="Cento pilot team" />
              <MockField
                label="Walkthrough focus"
                value="Pricing, onboarding, dashboard operations, and campaign builder"
              />
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button href="/signup">Start Free Trial</Button>
                <Button href="/app" variant="secondary">
                  View Dashboard
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

function MockField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-[var(--cream-50)] p-4">
      <p className="mono-number text-xs uppercase text-muted">{label}</p>
      <p className="mt-3 text-sm text-foreground">{value}</p>
    </div>
  );
}
