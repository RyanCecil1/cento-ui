import { FeatureGrid } from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";

export default function FeaturesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <FeatureGrid />
      </main>
      <MarketingFooter />
    </>
  );
}
