import {
  CTASection,
  MarketingSection,
  PricingCards,
  PricingComparisonTable,
} from "@/components/marketing";
import { FAQAccordion } from "@/components/faq-accordion";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { faqs } from "@/data/site";

export default function PricingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <section className="page-shell py-16 text-center">
          <p className="mono-number text-xs uppercase text-primary">Pricing</p>
          <h1 className="display-title mx-auto mt-4 max-w-3xl text-5xl font-medium leading-[1.08] text-foreground">
            Credit bundles that make SMS spend visible before anyone sends.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-muted">
            Start with a wallet top-up, then scale into scheduled campaigns, sender ID
            governance, and reporting as volume grows.
          </p>
        </section>
        <section className="page-shell pb-16">
          <PricingCards />
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
          description="These answers keep the current frontend honest while leaving room for real payment and credit logic later."
        >
          <FAQAccordion items={faqs.slice(0, 4)} />
        </MarketingSection>
        <CTASection />
      </main>
      <MarketingFooter />
    </>
  );
}
