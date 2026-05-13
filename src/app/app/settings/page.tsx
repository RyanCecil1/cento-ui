import { AppSection } from "@/components/ui";

const settingBlocks = [
  {
    title: "Organization profile",
    items: ["Workspace name", "Primary phone", "Support email"],
  },
  {
    title: "Notification preferences",
    items: ["Campaign alerts", "Top-up confirmations", "Delivery issue summaries"],
  },
  {
    title: "Security",
    items: ["Password reset", "Two-factor auth later", "Audit activity later"],
  },
];

export default function SettingsPage() {
  return (
    <AppSection
      title="Settings"
      description="This shell page maps the future account-management surfaces without adding real persistence yet."
    >
      <div className="grid gap-4 xl:grid-cols-3">
        {settingBlocks.map((block) => (
          <section key={block.title} className="rounded-lg border border-white/10 bg-[#121018] p-5">
            <h2 className="text-xl font-medium text-white">{block.title}</h2>
            <div className="mt-5 space-y-3">
              {block.items.map((item) => (
                <div key={item} className="rounded-md border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/70">
                  {item}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppSection>
  );
}
