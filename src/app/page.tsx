import {
  CTASection,
  FeatureGrid,
  HeroSection,
  HowItWorks,
  IndustryStrip,
  MarketingSection,
  MetricsRibbon,
  PricingPreview,
  ReportBand,
  TrustBand,
} from "@/components/marketing";
import { FAQAccordion } from "@/components/faq-accordion";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { faqs, homepageMetrics } from "@/data/site";

export default function HomePage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <MetricsRibbon items={homepageMetrics} />
        <TrustBand />
        <FeatureGrid />
        <HowItWorks />
        <MarketingSection
          eyebrow="Operational reporting"
          title="The dashboard prioritizes outcomes, not decoration."
          description="Credits, failed numbers, delivery rate, and campaign cost are treated as operational signals that should be easy to scan every day."
          tone="dark"
        >
          <ReportBand />
        </MarketingSection>
        <PricingPreview />
        <IndustryStrip />
        <MarketingSection
          eyebrow="Answers before launch"
          title="Questions teams ask before they trust a messaging platform"
          description="This preview phase is focused on clarity. The product UI shows cost visibility, campaign status, and admin review surfaces long before live logic is added."
        >
          <FAQAccordion items={faqs} />
        </MarketingSection>
        <CTASection />
      </main>
      <MarketingFooter />
    </>
  );
}
