"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type WorkspaceProfileFormProps = {
  workspaceName: string;
  timezone: string;
  primaryAudience: string;
  useCase: string;
};

export function WorkspaceProfileForm({
  workspaceName,
  timezone,
  primaryAudience,
  useCase,
}: WorkspaceProfileFormProps) {
  const router = useRouter();
  const [values, setValues] = useState({
    workspaceName,
    timezone,
    primaryAudience,
    useCase,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/workspace/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Unable to update workspace profile.",
        );
        return;
      }

      setSuccess("Workspace profile updated.");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="app-card rounded-[28px] p-6" onSubmit={handleSubmit}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-number text-xs uppercase app-label">Organization profile</p>
          <h2 className="mt-3 text-xl font-semibold text-[var(--app-text)]">
            Workspace details
          </h2>
          <p className="mt-2 text-sm leading-6 app-muted">
            Keep the name, audience, and use case current so the app speaks clearly
            everywhere.
          </p>
        </div>
        <Button type="submit" variant="dark" disabled={submitting}>
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Workspace name</span>
          <input
            value={values.workspaceName}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                workspaceName: event.target.value,
              }))
            }
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Timezone</span>
          <input
            value={values.timezone}
            onChange={(event) =>
              setValues((current) => ({ ...current, timezone: event.target.value }))
            }
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">
            Primary audience
          </span>
          <input
            value={values.primaryAudience}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                primaryAudience: event.target.value,
              }))
            }
            required
          />
        </label>
        <label className="grid gap-2 text-sm text-[var(--app-text)]">
          <span className="mono-number text-[10px] uppercase app-label">Use case</span>
          <input
            value={values.useCase}
            onChange={(event) =>
              setValues((current) => ({ ...current, useCase: event.target.value }))
            }
            required
          />
        </label>
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {success ? <p className="mt-4 text-sm text-success">{success}</p> : null}
    </form>
  );
}
