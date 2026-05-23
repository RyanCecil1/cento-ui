import { AppSection, Button } from "@/components/ui";
import { aiSuggestions } from "@/data/site";

export default function AIWriterPage() {
  const experimentationNotes = [
    {
      label: "Use it for",
      value: "Prompt shaping, subject-matter variants, and early draft exploration before a real campaign is built.",
    },
    {
      label: "Do not use it for",
      value: "Final approvals, audience selection, sender checks, or anything that should happen inside the campaign flow.",
    },
    {
      label: "Best next step",
      value: "Move the strongest draft into campaign creation where credits, recipients, schedule, and final review stay visible.",
    },
  ];

  const labUseCases = [
    "Test alternate openings before writing the final campaign.",
    "Explore shorter versions when cost per send matters.",
    "Collect tone directions for different audiences and approvals.",
  ];

  return (
    <AppSection
      title="AI message lab"
      description="Use this page when you want a quick nudge, a warmer version, or a shorter SMS before you build the real campaign."
      action={<Button href="/app/campaigns/new">Open campaign builder</Button>}
    >
      <div className="space-y-6">
        <section className="rounded-lg app-card-gradient p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="mono-number text-xs uppercase text-primary">Secondary AI surface</p>
              <h2 className="mt-3 text-2xl font-medium text-[var(--app-text)]">
                Explore message angles here, then move the winner into campaign creation.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-muted)]">
                This lab is useful when you want to test tone, shorten a message, or get unstuck
                without feeling buried in settings.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/app/campaigns/new">Create campaign with AI</Button>
              <Button href="/app/campaigns" variant="outlineDark">
                Review campaign drafts
              </Button>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-lg app-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mono-number text-xs uppercase app-label">Message sandbox</p>
                <h2 className="mt-3 text-xl font-medium text-[var(--app-text)]">
                  Copy you can warm up fast
                </h2>
              </div>
              <div className="rounded-full border app-border bg-[var(--app-soft-fill)] px-3 py-1">
                <p className="mono-number text-[11px] uppercase app-label">Assistive only</p>
              </div>
            </div>

            <div className="mt-5 rounded-[20px] border app-border bg-[var(--app-panel-soft)] p-5">
              <p className="text-sm leading-7 text-[var(--app-text)]">
                Dear parents, this is a reminder that the PTA meeting starts tomorrow at 10:00 AM
                in the assembly hall. Please arrive a few minutes early so registration can begin
                on time.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {["153 characters", "1 SMS unit", "Reminder tone"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,241,255,0.95)_100%)] px-4 py-4 shadow-[0_16px_28px_-24px_rgba(93,54,197,0.35)]"
                >
                  <p className="text-sm text-[var(--app-muted-strong)]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {experimentationNotes.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,241,255,0.92)_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(93,54,197,0.34)]"
                >
                  <p className="mono-number text-[11px] uppercase app-label">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--app-muted-strong)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-lg app-card p-6">
              <p className="mono-number text-xs uppercase app-label">Prompt starters</p>
              <div className="mt-5 grid gap-3">
                {aiSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="rounded-2xl border app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,241,255,0.94)_100%)] px-4 py-4 text-left text-sm leading-6 text-[var(--app-muted-strong)] shadow-[0_18px_34px_-28px_rgba(93,54,197,0.3)] transition hover:border-primary/50 hover:bg-[var(--app-hover)] hover:text-[var(--app-text)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-lg app-card-soft p-6">
              <p className="mono-number text-xs uppercase app-label">Useful experiments</p>
              <div className="mt-5 space-y-3">
                {labUseCases.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border app-border bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,241,255,0.92)_100%)] px-4 py-4 shadow-[0_18px_34px_-28px_rgba(93,54,197,0.28)]"
                  >
                    <p className="text-sm leading-6 text-[var(--app-muted-strong)]">{item}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppSection>
  );
}
