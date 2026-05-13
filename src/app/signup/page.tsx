import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { MarketingHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";

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
            <div className="grid gap-4">
              <MockInput label="Organization name" value="GraceHub Communications" />
              <MockInput label="Work email" value="admin@gracehub.local" />
              <MockInput label="Phone number" value="+233 24 000 0000" />
              <MockInput label="Primary use case" value="Member announcements and reminders" />
              <Button href="/onboarding" className="mt-2 w-full">
                Continue to Onboarding
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function MockInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-[var(--cream-50)] p-4">
      <p className="mono-number text-xs uppercase text-muted">{label}</p>
      <p className="mt-3 text-sm text-foreground">{value}</p>
    </div>
  );
}
