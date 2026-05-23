import { FAQAccordion } from "@/components/faq-accordion";
import { MarketingSection } from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { faqs } from "@/data/site";

export default function FAQPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="flex-1">
        <MarketingSection
          eyebrow="Frequently asked questions"
          title="Operational questions answered before teams trust the send button."
          description="Cento is designed around the real operator workflow, so these answers cover sender approval, top-ups, reporting, and how AI stays assistive inside the send path."
        >
          <FAQAccordion items={faqs} />
        </MarketingSection>
      </main>
      <MarketingFooter />
    </div>
  );
}
