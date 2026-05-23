import { MarketingFooter, MarketingHeader } from "@/components/site-chrome";
import { SalesInquiryForm } from "@/components/sales-inquiry-form";
import { SectionIntro } from "@/components/ui";

export default function ContactPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="flex-1 py-16">
        <div className="page-shell">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <SectionIntro
              eyebrow="Talk to sales"
              title="Tell us what you need, how many credits you expect to buy, and why your team needs a sales follow-up."
              description="Use this path for higher-volume buying, rollout support, or when your sending needs go beyond the published bundles on the pricing page."
            />
            <SalesInquiryForm />
          </div>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
