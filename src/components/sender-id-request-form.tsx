"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function SenderIdRequestForm() {
  const router = useRouter();
  const [values, setValues] = useState({ name: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/sender-ids", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to submit sender request.");
        return;
      }

      setValues({ name: "", note: "" });
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="rounded-lg app-card p-5" onSubmit={handleSubmit}>
      <p className="mono-number text-xs uppercase app-label">Request branded sender</p>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Sender name</span>
          <input
            value={values.name}
            onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
            placeholder="GraceHub"
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Reason or note</span>
          <textarea
            value={values.note}
            onChange={(event) => setValues((current) => ({ ...current, note: event.target.value }))}
            rows={3}
            placeholder="Use this sender for church member reminders and notices."
            required
          />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" variant="dark" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
