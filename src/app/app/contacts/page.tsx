import { ContactIntakeForm } from "@/components/contacts/contact-intake-form";
import { getCurrentViewer } from "@/lib/auth/current-viewer";
import {
  getContactQualitySummary,
  listContactGroupsWithCounts,
  listWorkspaceContactsWithGroups,
} from "@/lib/contacts/repository";
import { AppSection, Button } from "@/components/ui";

export default async function ContactsPage() {
  const viewer = await getCurrentViewer();
  if (!viewer) return null;

  const [contacts, groups, summary] = await Promise.all([
    listWorkspaceContactsWithGroups(viewer.workspace.id),
    listContactGroupsWithCounts(viewer.workspace.id),
    getContactQualitySummary(viewer.workspace.id),
  ]);

  return (
    <AppSection
      title="Contacts"
      description="Manage the contact records that power campaign counts, suppression checks, and send-time filtering."
      action={<Button variant="outlineDark">Manual intake active</Button>}
    >
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total contacts" value={contacts.length} />
        <SummaryCard label="Deliverable" value={summary.deliverable} />
        <SummaryCard label="Suppressed" value={summary.suppressed} />
        <SummaryCard label="Duplicates or invalid" value={summary.invalid + summary.duplicates} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ContactIntakeForm groups={groups.map((group) => ({ id: group.id, name: group.name }))} />
        <section className="rounded-lg app-card p-5">
          <p className="mono-number text-xs uppercase app-label">Groups</p>
          <div className="mt-4 space-y-3">
            {groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between gap-4 rounded-md border border-[var(--app-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--app-text)]">{group.name}</p>
                  <p className="mt-1 text-xs app-label">{group.description || "No description yet"}</p>
                </div>
                <p className="mono-number text-sm text-[var(--app-text)]">{group.memberCount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-lg border border-white/10 bg-[#121018]">
        <div className="flex flex-wrap gap-2 border-b border-white/10 p-4">
          <span className="rounded-md bg-primary px-3 py-2 text-sm text-white">All contacts</span>
          <span className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/58">Valid</span>
          <span className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/58">Invalid</span>
          <span className="rounded-md border border-white/10 px-3 py-2 text-sm text-white/58">Duplicates</span>
        </div>
        <div className="divide-y divide-white/10">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="grid gap-3 px-5 py-4 text-sm md:grid-cols-[1fr_1fr_0.8fr_0.7fr]"
            >
              <p className="font-medium text-white">{contact.fullName}</p>
              <p className="text-white/50">{contact.phoneE164}</p>
              <p className="text-white/50">{contact.groupNames.join(", ") || "Ungrouped"}</p>
              <p className="text-white/72">
                {contact.isSuppressed ? "suppressed" : contact.status}
              </p>
            </div>
          ))}
        </div>
      </section>
    </AppSection>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg app-card-soft p-5">
      <p className="mono-number text-[11px] uppercase app-label">{label}</p>
      <p className="mono-number mt-4 text-3xl text-[var(--app-text)]">{value}</p>
    </div>
  );
}
