"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type ContactIntakeFormProps = {
  groups: Array<{ id: string; name: string }>;
};

export function ContactIntakeForm({ groups }: ContactIntakeFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    fullName: "",
    phoneE164: "",
    source: "manual",
    tags: "",
    groupIds: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          phoneE164: values.phoneE164,
          source: values.source,
          tags: values.tags
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          groupIds: values.groupIds,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to add contact.");
        return;
      }

      setValues({
        fullName: "",
        phoneE164: "",
        source: "manual",
        tags: "",
        groupIds: [],
      });
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function toggleGroup(groupId: string) {
    setValues((current) => ({
      ...current,
      groupIds: current.groupIds.includes(groupId)
        ? current.groupIds.filter((value) => value !== groupId)
        : [...current.groupIds, groupId],
    }));
  }

  return (
    <form className="rounded-lg app-card p-5" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Full name</span>
          <input
            value={values.fullName}
            onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Ama Nkrumah"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Phone number</span>
          <input
            value={values.phoneE164}
            onChange={(event) => setValues((current) => ({ ...current, phoneE164: event.target.value }))}
            placeholder="+233248361973"
            required
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Source</span>
          <input
            value={values.source}
            onChange={(event) => setValues((current) => ({ ...current, source: event.target.value }))}
            placeholder="manual"
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Tags</span>
          <input
            value={values.tags}
            onChange={(event) => setValues((current) => ({ ...current, tags: event.target.value }))}
            placeholder="parents, members"
          />
        </label>
      </div>
      <div className="mt-4">
        <p className="mono-number text-[10px] uppercase app-label">Assign groups</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {groups.map((group) => {
            const selected = values.groupIds.includes(group.id);

            return (
              <button
                key={group.id}
                type="button"
                className={`rounded-md border px-3 py-2 text-sm ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-hover)]"
                }`}
                onClick={() => toggleGroup(group.id)}
              >
                {group.name}
              </button>
            );
          })}
        </div>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <Button className="mt-5" type="submit" variant="dark" disabled={submitting}>
        {submitting ? "Adding..." : "Add contact"}
      </Button>
    </form>
  );
}
