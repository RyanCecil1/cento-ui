"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type ContactGroupManagerProps = {
  groups: Array<{
    id: string;
    name: string;
    description: string;
    memberCount: number;
  }>;
};

export function ContactGroupManager({ groups }: ContactGroupManagerProps) {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact-groups", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to create group.");
        return;
      }

      setValues({ name: "", description: "" });
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="groups" className="rounded-lg app-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="mono-number text-xs uppercase app-label">Groups</p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--app-text)]">Organize contacts</h2>
          <p className="mt-2 text-sm leading-6 app-muted">
            Create the audience groups you will target during campaign creation.
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Group name</span>
          <input
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="Parents list"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Description</span>
          <textarea
            rows={3}
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({ ...current, description: event.target.value }))
            }
            placeholder="Parents and guardians for PTA notices and fee reminders."
          />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" variant="dark" disabled={submitting}>
          {submitting ? "Creating..." : "Create group"}
        </Button>
      </form>

      <div className="mt-6 space-y-3">
        {groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group.id}
              className="rounded-[20px] border border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[var(--app-text)]">{group.name}</p>
                  <p className="mt-1 text-sm leading-6 app-muted">
                    {group.description || "No description yet."}
                  </p>
                </div>
                <p className="mono-number text-sm text-[var(--app-text)]">
                  {group.memberCount}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[20px] border border-dashed border-[var(--app-border)] bg-[var(--app-soft-fill)] px-4 py-4">
            <p className="text-sm font-medium text-[var(--app-text)]">No groups yet</p>
            <p className="mt-1 text-sm leading-6 app-muted">
              Start with groups like Parents, Members, Customers, or Volunteers.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
