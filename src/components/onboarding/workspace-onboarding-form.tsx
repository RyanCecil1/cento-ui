"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type WorkspaceOnboardingFormProps = {
  initialValues: {
    workspaceName: string;
    timezone: string;
    senderMode: "shared" | "branded";
    primaryAudience: string;
    useCase: string;
  };
};

export function WorkspaceOnboardingForm({ initialValues }: WorkspaceOnboardingFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/workspace/bootstrap", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to save workspace settings.");
        return;
      }

      router.push(typeof data.next === "string" ? data.next : "/app");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <Field label="Workspace name">
        <input
          value={values.workspaceName}
          onChange={(event) => setValues((current) => ({ ...current, workspaceName: event.target.value }))}
          required
        />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Timezone">
          <select
            value={values.timezone}
            onChange={(event) => setValues((current) => ({ ...current, timezone: event.target.value }))}
          >
            <option value="Africa/Accra">Africa/Accra</option>
            <option value="UTC">UTC</option>
            <option value="Europe/London">Europe/London</option>
          </select>
        </Field>
        <Field label="Sender mode">
          <select
            value={values.senderMode}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                senderMode: event.target.value as "shared" | "branded",
              }))
            }
          >
            <option value="shared">Shared sender first</option>
            <option value="branded">Branded sender only</option>
          </select>
        </Field>
      </div>
      <Field label="Primary audience">
        <input
          value={values.primaryAudience}
          onChange={(event) => setValues((current) => ({ ...current, primaryAudience: event.target.value }))}
          required
        />
      </Field>
      <Field label="Primary use case">
        <textarea
          value={values.useCase}
          onChange={(event) => setValues((current) => ({ ...current, useCase: event.target.value }))}
          rows={4}
          required
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : "Enter Dashboard"}
      </Button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm text-foreground">
      <span className="mono-number text-xs uppercase app-label">{label}</span>
      {children}
    </label>
  );
}
