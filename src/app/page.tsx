import {
  CTASection,
  FeatureGrid,
  HeroSection,
  HowItWorks,
  MarketingSection,
  MetricsRibbon,
  ReportBand,
  TrustBand,
} from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";

export default function HomePage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="marketing-home marketing-animated flex-1">
        <HeroSection />
        <MetricsRibbon />
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
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
