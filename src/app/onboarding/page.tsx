import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { MarketingHeader } from "@/components/site-chrome";
import { Button } from "@/components/ui";
import { onboardingSteps } from "@/data/site";

export default function OnboardingPage() {
  return (
    <>
      <MarketingHeader />
      <main className="page-shell py-10">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="rounded-lg bg-foreground p-7 text-white">
            <p className="mono-number text-xs uppercase text-white/42">Workspace setup</p>
            <h1 className="display-title mt-4 text-4xl font-medium leading-[1.08]">
              Prepare the account before the first campaign.
            </h1>
            <p className="mt-5 text-sm leading-6 text-white/58">
              The onboarding path captures the information that shapes the dashboard:
              organization, use case, sender ID expectation, and first action.
            </p>
            <div className="mt-8">
              <Button href="/app" variant="light">
                Enter Dashboard
                <ArrowRight size={16} weight="bold" />
              </Button>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white">
            {onboardingSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid gap-5 border-b border-line p-6 last:border-b-0 md:grid-cols-[180px_1fr]"
              >
                <div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-medium text-white">
                    {index + 1}
                  </div>
                  <h2 className="mt-4 text-lg font-medium text-foreground">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{step.detail}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {step.fields.map((field) => (
                    <div key={field} className="rounded-lg border border-line bg-[var(--cream-50)] p-4">
                      <CheckCircle size={17} weight="fill" className="text-success" />
                      <p className="mt-4 text-sm font-medium text-foreground">{field}</p>
                      <p className="mt-2 text-xs leading-5 text-muted">Configured in preview</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
