import { SessionForm } from "@/components/auth/session-form";
import { AuthIllustrationPanel } from "@/components/marketing";
import { MarketingHeader } from "@/components/site-chrome";

export default function SignupPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="page-shell flex min-h-[calc(100dvh-88px)] flex-1 items-center py-6">
        <div className="mx-auto grid w-full max-w-[1280px] gap-8 lg:grid-cols-[0.98fr_0.82fr] lg:items-center">
          <AuthIllustrationPanel
            eyebrow="Start using Cento"
            title="Create your workspace and get campaign-ready in one step."
            description="Add your organization, audience, and use case once, then move straight into the dashboard to start building smarter SMS campaigns."
            imageSrc="/marketing-assets/signup-illustration.svg"
            imageAlt="Illustration showing secure signup and account access"
          />

          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[var(--shadow-quiet)]">
            <SessionForm mode="signup" />
          </div>
        </div>
      </main>
    </div>
  );
}
