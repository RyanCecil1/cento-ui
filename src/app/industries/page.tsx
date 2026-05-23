import { IndustryStrip } from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";

export default function IndustriesPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="flex-1">
        <IndustryStrip />
      </main>
      <MarketingFooter />
    </div>
  );
}
