import {
  CTASection,
  MarketingSection,
  PricingComparisonTable,
} from "@/components/marketing";
import { PricingCardsClient } from "@/components/pricing-cards-client";
import { FAQAccordion } from "@/components/faq-accordion";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { faqs } from "@/data/site";

export default function PricingPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="marketing-pricing marketing-animated flex-1">
        <section className="page-shell py-18">
          <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr] xl:items-end">
            <div>
              <p className="mono-number text-xs uppercase text-primary">Pricing</p>
              <h1 className="display-title mt-4 max-w-3xl text-5xl font-semibold leading-[1.02] text-foreground">
                Choose the operating tier that matches how your team sends.
              </h1>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              Credit bundles are tied to workflow depth, sender governance, reporting, and support. Selecting a plan now should visibly change the next action, not just the border color.
            </p>
          </div>
        </section>
        <section className="page-shell pb-16">
          <PricingCardsClient />
        </section>
        <MarketingSection
          eyebrow="Compare plans"
          title="The differences are operational, not decorative."
          description="Each tier adds more control around campaign volume, list management, sender review, and support."
        >
          <PricingComparisonTable />
        </MarketingSection>
        <MarketingSection
          eyebrow="Pricing questions"
          title="The wallet model is built for clarity."
          description="These answers explain how credits, top-ups, sender approval, and account setup connect across the live workflow."
        >
          <FAQAccordion items={faqs.slice(0, 4)} />
        </MarketingSection>
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
