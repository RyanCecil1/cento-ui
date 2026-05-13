import { FAQAccordion } from "@/components/faq-accordion";
import { MarketingSection } from "@/components/marketing";
import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { faqs } from "@/data/site";

export default function FAQPage() {
  return (
    <>
      <MarketingHeader />
      <main className="flex-1">
        <MarketingSection
          eyebrow="Frequently asked questions"
          title="Operational questions answered before teams trust the send button."
          description="Cento is being shaped as a serious SMS workspace, so the frontend already explains gateway, wallet, AI, and sender-ID expectations without pretending those services are live yet."
        >
          <FAQAccordion items={faqs} />
        </MarketingSection>
      </main>
      <MarketingFooter />
    </>
  );
}
