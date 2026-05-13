import { AppSection, Button } from "@/components/ui";
import { aiSuggestions } from "@/data/site";

export default function AIWriterPage() {
  return (
    <AppSection
      title="AI Writer"
      description="The AI writer stays assistive: it shortens, clarifies, and repositions SMS drafts while keeping human approval in control."
      action={<Button variant="outlineDark">Generate draft</Button>}
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <p className="mono-number text-xs uppercase text-white/36">Draft editor</p>
          <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-5 text-sm leading-7 text-white/70">
            Dear parent, this is a reminder that the PTA meeting starts tomorrow at
            10:00 AM in the assembly hall. Please arrive a few minutes early for
            registration.
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["147 characters", "1 SMS unit", "Professional tone"].map((item) => (
              <div key={item} className="rounded-md border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-sm text-white/72">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-primary/30 bg-[linear-gradient(180deg,#25163b_0%,#121018_100%)] p-5">
          <p className="mono-number text-xs uppercase text-primary-soft">Suggested actions</p>
          <div className="mt-5 grid gap-2">
            {aiSuggestions.map((item) => (
              <button
                key={item}
                className="rounded-md border border-white/10 px-4 py-3 text-left text-sm text-white/70 transition hover:border-primary/60 hover:bg-white/10 hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>
        </section>
      </div>
    </AppSection>
  );
}
