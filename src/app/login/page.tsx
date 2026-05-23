import Link from "next/link";
import { SessionForm } from "@/components/auth/session-form";
import { AuthIllustrationPanel } from "@/components/marketing";
import { MarketingHeader } from "@/components/site-chrome";

export default function LoginPage() {
  return (
    <div className="marketing-root">
      <MarketingHeader />
      <main className="page-shell flex min-h-[calc(100dvh-88px)] flex-1 items-center py-6">
        <div className="mx-auto grid w-full max-w-[1240px] gap-8 lg:grid-cols-[0.98fr_0.78fr] lg:items-center">
          <AuthIllustrationPanel
            eyebrow="Cento access"
            title="Sign in and get back to your campaigns, lists, and delivery insights."
            description="Pick up where you left off, review live send activity, and keep your next SMS blast moving without losing visibility."
            imageSrc="/marketing-assets/login-illustration.jpg"
            imageAlt="Illustration showing secure login and access control"
            imageClassName="ark-auth-illustration-login"
          />

          <div className="rounded-[28px] border border-line bg-white p-6 shadow-[var(--shadow-quiet)]">
            <div className="space-y-4">
              <SessionForm mode="login" />
              <p className="text-sm text-muted">
                New here?{" "}
                <Link href="/signup" className="font-medium text-primary">
                  Start a free trial
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
