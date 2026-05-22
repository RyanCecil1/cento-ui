import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { SessionForm } from "@/components/auth/session-form";
import { MarketingHeader } from "@/components/site-chrome";

const benefits = [
  "Create an operator profile",
  "Set workspace and sender ID expectations",
  "Continue into the guided onboarding flow",
];

export default function SignupPage() {
  return (
    <>
      <MarketingHeader />
      <main className="page-shell flex min-h-[calc(100dvh-64px)] flex-1 items-center py-10">
        <div className="mx-auto grid w-full max-w-[1100px] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-lg border border-line bg-[var(--purple-50)] p-8">
            <p className="mono-number text-xs uppercase text-primary">
              Start free trial
            </p>
            <h1 className="display-title mt-4 text-4xl font-medium leading-[1.08] text-foreground">
              Create the account, then set up the SMS workspace properly.
            </h1>
            <div className="mt-8 space-y-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-3 rounded-lg bg-white px-4 py-4">
                  <CheckCircle size={18} weight="fill" className="mt-0.5 text-success" />
                  <p className="text-sm leading-6 text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-6 shadow-[var(--shadow-quiet)]">
            <SessionForm mode="signup" />
          </div>
        </div>
      </main>
    </>
  );
}
