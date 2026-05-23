"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { PencilSimple, Trash, UploadSimple, UsersThree } from "@phosphor-icons/react";
import { ContactIntakeForm } from "@/components/contacts/contact-intake-form";
import { ContactGroupAssignment } from "@/components/contacts/contact-group-assignment";
import { ContactGroupManager } from "@/components/contacts/contact-group-manager";
import { ContactUploadPanel } from "@/components/contacts/contact-upload-panel";
import { Button } from "@/components/ui";

type ContactWorkspaceProps = {
  contacts: Array<{
    id: string;
    fullName: string;
    phoneE164: string;
    source: string;
    status: "active" | "inactive" | "invalid" | "duplicate";
    tags: string[];
    isSuppressed: boolean;
    groupIds: string[];
    groupNames: string[];
  }>;
  groups: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
  }>;
  summary: {
    deliverable: number;
    suppressed: number;
    invalid: number;
    duplicates: number;
  };
};

type FilterKey = "all" | "valid" | "invalid" | "duplicate";

export function ContactWorkspace({
  contacts,
  groups,
  summary,
}: ContactWorkspaceProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showUpload, setShowUpload] = useState(false);
  const [showGroups, setShowGroups] = useState(false);

  const filteredContacts = useMemo(() => {
    if (activeFilter === "all") {
      return contacts;
    }

    if (activeFilter === "valid") {
      return contacts.filter(
        (contact) => contact.status !== "invalid" && contact.status !== "duplicate",
      );
    }

    if (activeFilter === "invalid") {
      return contacts.filter((contact) => contact.status === "invalid");
    }

    return contacts.filter((contact) => contact.status === "duplicate");
  }, [activeFilter, contacts]);

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: "All contacts", count: contacts.length },
    { key: "valid", label: "Valid", count: summary.deliverable },
    { key: "invalid", label: "Invalid", count: summary.invalid },
    { key: "duplicate", label: "Duplicate", count: summary.duplicates },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Total contacts" value={contacts.length} />
        <SummaryCard label="Deliverable" value={summary.deliverable} />
        <SummaryCard label="Suppressed" value={summary.suppressed} />
        <SummaryCard
          label="Duplicates or invalid"
          value={summary.invalid + summary.duplicates}
        />
      </div>

      <section className="app-card rounded-[30px] p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mono-number text-xs uppercase app-label">Manual entry first</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--app-text)]">
                Add one contact quickly, then open upload or group tools only when you need them.
              </h2>
              <p className="mt-2 text-sm leading-6 app-muted">
                Keep the primary action simple. Manual entry stays front and center, while import
                and group setup remain one click away instead of crowding the page.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={showUpload ? "dark" : "outlineDark"}
                onClick={() => setShowUpload((current) => !current)}
              >
                <UploadSimple size={16} weight="bold" />
                {showUpload ? "Hide upload" : "Upload contacts"}
              </Button>
              <Button
                variant={showGroups ? "dark" : "outlineDark"}
                onClick={() => setShowGroups((current) => !current)}
              >
                <UsersThree size={16} weight="bold" />
                {showGroups ? "Hide groups" : "Create groups"}
              </Button>
              <Button href="/contact-upload-template.csv" variant="outlineDark">
                Download template
              </Button>
            </div>
          </div>

          <div className="rounded-[26px] border border-[var(--app-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,241,255,0.88)_100%)] p-5 shadow-[0_26px_50px_-40px_rgba(93,54,197,0.26)]">
            <ContactIntakeForm groups={groups.map((group) => ({ id: group.id, name: group.name }))} />
          </div>

          {showUpload ? (
            <div className="rounded-[26px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] p-5">
              <ContactUploadPanel groups={groups.map((group) => ({ id: group.id, name: group.name }))} />
            </div>
          ) : null}

          {showGroups ? (
            <div className="rounded-[26px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] p-5">
              <ContactGroupManager groups={groups} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[30px] app-card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b app-border p-5">
          <div>
            <p className="mono-number text-xs uppercase app-label">Contact list</p>
            <h2 className="mt-3 text-xl font-semibold text-[var(--app-text)]">
              Filter, fix, and clean the list from one place
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => {
              const active = activeFilter === filter.key;

              return (
                <button
                  key={filter.key}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    active
                      ? "bg-primary text-white keep-white"
                      : "border border-[var(--app-border)] bg-[var(--app-soft-fill)] text-[var(--app-text)]"
                  }`}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  {filter.label} ({filter.count})
                </button>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-[var(--app-border)]">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                groups={groups.map((group) => ({ id: group.id, name: group.name }))}
              />
            ))
          ) : (
            <EmptyFilterState filter={activeFilter} />
          )}
        </div>
      </section>
    </div>
  );
}

function ContactRow({
  contact,
  groups,
}: {
  contact: ContactWorkspaceProps["contacts"][number];
  groups: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    fullName: contact.fullName,
    phoneE164: contact.phoneE164,
  });

  async function handleSave() {
    setSubmitting(true);

    try {
      await fetch(`/api/contacts/${contact.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      setEditing(false);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setSubmitting(true);

    try {
      await fetch(`/api/contacts/${contact.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4 px-5 py-4 lg:grid-cols-[1.1fr_0.9fr_1.2fr_0.7fr_auto] lg:items-start">
      <div>
        {editing ? (
          <div className="grid gap-3">
            <input
              value={values.fullName}
              onChange={(event) =>
                setValues((current) => ({ ...current, fullName: event.target.value }))
              }
            />
            <input
              value={values.phoneE164}
              onChange={(event) =>
                setValues((current) => ({ ...current, phoneE164: event.target.value }))
              }
            />
          </div>
        ) : (
          <>
            <p className="font-medium text-[var(--app-text)]">{contact.fullName}</p>
            <p className="mt-1 text-xs app-label">Source: {contact.source}</p>
          </>
        )}
      </div>
      <p className="app-muted">{editing ? "Editing details" : contact.phoneE164}</p>
      <div>
        <ContactGroupAssignment
          contactId={contact.id}
          initialGroupIds={contact.groupIds}
          groups={groups}
        />
      </div>
      <div>
        <span className="rounded-full bg-[var(--app-soft-fill)] px-3 py-1.5 text-xs font-medium text-[var(--app-text)]">
          {contact.isSuppressed ? "suppressed" : contact.status}
        </span>
      </div>
      <div className="flex gap-2">
        {editing ? (
          <>
            <Button variant="dark" onClick={() => void handleSave()} disabled={submitting}>
              Save
            </Button>
            <Button variant="outlineDark" onClick={() => setEditing(false)} disabled={submitting}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-3 text-[var(--app-text)]"
              onClick={() => setEditing(true)}
              aria-label={`Edit ${contact.fullName}`}
            >
              <PencilSimple size={16} weight="bold" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-3 text-danger"
              onClick={() => void handleDelete()}
              aria-label={`Delete ${contact.fullName}`}
              disabled={submitting}
            >
              <Trash size={16} weight="bold" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyFilterState({ filter }: { filter: FilterKey }) {
  const copy = {
    all: {
      title: "No contacts yet",
      detail: "Start with manual entry or upload a file to build the list.",
    },
    valid: {
      title: "No valid contacts",
      detail: "There are no deliverable contacts in the list right now.",
    },
    invalid: {
      title: "No invalid contacts",
      detail: "The list currently has no invalid contacts to fix.",
    },
    duplicate: {
      title: "No duplicate contacts",
      detail: "There are no duplicates in the current workspace list.",
    },
  } satisfies Record<FilterKey, { title: string; detail: string }>;

  return (
    <div className="px-5 py-10">
      <div className="rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-soft-fill)] px-5 py-8">
        <p className="text-sm font-medium text-[var(--app-text)]">{copy[filter].title}</p>
        <p className="mt-2 text-sm leading-6 app-muted">{copy[filter].detail}</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[24px] app-card-soft p-5">
      <p className="mono-number text-[11px] uppercase app-label">{label}</p>
      <p className="mono-number mt-4 text-3xl text-[var(--app-text)]">{value}</p>
    </div>
  );
}
