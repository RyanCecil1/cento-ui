import { IndustryStrip } from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";

export default function IndustriesPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <IndustryStrip />
      </main>
      <MarketingFooter />
    </>
  );
}
