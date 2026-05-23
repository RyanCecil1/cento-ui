"use client";

import { useMemo, useState } from "react";
import { highestPublishedCreditBundle } from "@/data/site";
import { Button } from "@/components/ui";

const initialValues = {
  fullName: "",
  email: "",
  phoneNumber: "",
  organizationName: "",
  roleTitle: "",
  requestedCredits: "",
  reason: "",
};

export function SalesInquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const requestedCreditsNumber = useMemo(
    () => Number(values.requestedCredits || 0),
    [values.requestedCredits],
  );
  const exceedsPricingLimit = requestedCreditsNumber > highestPublishedCreditBundle;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/sales-inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          requestedCredits: requestedCreditsNumber,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Unable to submit your sales request.");
        return;
      }

      setValues(initialValues);
      setSuccess(
        typeof data.message === "string"
          ? data.message
          : "Submitted. Sales can now review this request and follow up.",
      );
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="rounded-[30px] border border-line bg-white p-6 shadow-[var(--shadow-quiet)]"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name">
            <input
              value={values.fullName}
              onChange={(event) => setValues((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Ama Ofori"
              required
            />
          </Field>
          <Field label="Work email">
            <input
              type="email"
              value={values.email}
              onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
              placeholder="ops@yourorg.com"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone number">
            <input
              value={values.phoneNumber}
              onChange={(event) => setValues((current) => ({ ...current, phoneNumber: event.target.value }))}
              placeholder="+233241234567"
              required
            />
          </Field>
          <Field label="Organization">
            <input
              value={values.organizationName}
              onChange={(event) =>
                setValues((current) => ({ ...current, organizationName: event.target.value }))
              }
              placeholder="North Ridge School"
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Role">
            <input
              value={values.roleTitle}
              onChange={(event) => setValues((current) => ({ ...current, roleTitle: event.target.value }))}
              placeholder="Operations lead"
              required
            />
          </Field>
          <Field label="Credits needed">
            <input
              type="number"
              min={1}
              value={values.requestedCredits}
              onChange={(event) =>
                setValues((current) => ({ ...current, requestedCredits: event.target.value }))
              }
              placeholder="18000"
              required
            />
          </Field>
        </div>

        <Field label="Why do you want to talk to sales?">
          <textarea
            rows={5}
            value={values.reason}
            onChange={(event) => setValues((current) => ({ ...current, reason: event.target.value }))}
            placeholder="Tell us about your sending volume, your audience, and what you need help with."
            required
          />
        </Field>

        <div className="rounded-[20px] border border-line bg-[var(--cream-50)] p-4">
          <p className="marketing-field-label text-primary">Credit check</p>
          <p className="mt-3 text-sm leading-6 text-foreground">
            The largest published bundle on the pricing page is{" "}
            <span className="font-semibold">{highestPublishedCreditBundle.toLocaleString()} credits</span>.
          </p>
          <p className={`mt-2 text-sm leading-6 ${exceedsPricingLimit ? "text-[var(--warning)]" : "text-muted"}`}>
            {requestedCreditsNumber > 0
              ? exceedsPricingLimit
                ? "This request is above the published bundle and will be treated as a custom-volume follow-up."
                : "This request fits within the published pricing range."
              : "Enter the expected credit volume so sales can route the follow-up properly."}
          </p>
        </div>

        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {success ? <p className="text-sm text-success">{success}</p> : null}

        <Button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Send to Sales"}
        </Button>
      </div>
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
      <span className="marketing-field-label text-muted">{label}</span>
      {children}
    </label>
  );
}
