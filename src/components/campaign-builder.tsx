"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MagicWand, PaperPlaneTilt, Plus, X } from "@phosphor-icons/react";
import { estimateCampaignCredits, getMessageUnits } from "@/lib/campaigns/pricing";
import type { AudienceFilter, CampaignDraft } from "@/lib/campaigns/types";
import { aiSuggestions, campaignBuilderSteps } from "@/data/site";
import { Button } from "./ui";

type BuilderSender = {
  id: string;
  name: string;
  status: "approved" | "in_review" | "draft" | "rejected";
};

type BuilderTemplate = {
  id: string;
  name: string;
  body: string;
  variables: string[];
  fallbackFirstName: string;
  fallbackLastName: string;
};

type BuilderGroup = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
};

type BuilderContact = {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneE164: string;
  source: string;
  status: "active" | "inactive" | "invalid" | "duplicate";
  tags: string[];
  isSuppressed: boolean;
  groupIds: string[];
  groupNames: string[];
};

type CampaignBuilderProps = {
  senders: BuilderSender[];
  templates: BuilderTemplate[];
  groups: BuilderGroup[];
  contacts: BuilderContact[];
  walletBalance: number;
  timezone: string;
};

type ValidationResult = {
  valid: boolean;
  message?: string;
};

const emptyDraft = (senders: BuilderSender[], templates: BuilderTemplate[]): CampaignDraft => ({
  name: "",
  senderId: senders[0]?.id ?? "",
  message: "",
  templateId: templates[0]?.id,
  scheduleAt: undefined,
  audience: {
    groupIds: [],
    filters: [],
  },
  personalizationDefaults: {
    firstName: templates[0]?.fallbackFirstName ?? "Customer",
    lastName: templates[0]?.fallbackLastName ?? "",
  },
});

const emptyFilter: AudienceFilter = {
  field: "tag",
  operator: "in",
  value: "",
};

export function CampaignBuilder({
  senders,
  templates,
  groups,
  contacts,
  walletBalance,
  timezone,
}: CampaignBuilderProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [renderedAt] = useState(() => Date.now());
  const [draft, setDraft] = useState<CampaignDraft>(() => {
    const initial = emptyDraft(senders, templates);
    const firstTemplate = templates[0];
    if (firstTemplate) {
      initial.message = firstTemplate.body;
    }
    return initial;
  });
  const [pendingFilter, setPendingFilter] = useState<AudienceFilter>(emptyFilter);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const matchingContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesGroups =
        draft.audience.groupIds.length === 0 ||
        draft.audience.groupIds.some((groupId) => contact.groupIds.includes(groupId));

      const matchesFilters = draft.audience.filters.every((filter) => {
        if (filter.field === "tag") return contact.tags.includes(filter.value);
        if (filter.field === "status") return contact.status === filter.value;
        return contact.source === filter.value;
      });

      return matchesGroups && matchesFilters;
    });
  }, [contacts, draft.audience.filters, draft.audience.groupIds]);

  const audienceSummary = useMemo(() => {
    const total = matchingContacts.length;
    const invalid = matchingContacts.filter((contact) => contact.status === "invalid").length;
    const duplicates = matchingContacts.filter((contact) => contact.status === "duplicate").length;
    const suppressed = matchingContacts.filter((contact) => contact.isSuppressed).length;
    const deliverable = matchingContacts.filter(
      (contact) =>
        contact.status !== "invalid" && contact.status !== "duplicate" && !contact.isSuppressed,
    ).length;

    return {
      total,
      invalid,
      duplicates,
      suppressed,
      deliverable,
    };
  }, [matchingContacts]);

  const pricing = useMemo(
    () => estimateCampaignCredits(audienceSummary.deliverable, draft.message),
    [audienceSummary.deliverable, draft.message],
  );

  const selectedTemplate = templates.find((template) => template.id === draft.templateId) ?? null;

  const validateDetails = (): ValidationResult => {
    if (!draft.name.trim()) return { valid: false, message: "Name the campaign." };
    if (!draft.senderId) return { valid: false, message: "Choose a sender ID." };
    return { valid: true };
  };

  const validateAudience = (): ValidationResult => {
    if (draft.audience.groupIds.length === 0 && draft.audience.filters.length === 0) {
      return { valid: false, message: "Choose at least one group or filter." };
    }
    if (audienceSummary.total === 0) {
      return { valid: false, message: "Current audience resolves to zero contacts." };
    }
    return { valid: true };
  };

  const validateCompose = (): ValidationResult => {
    if (!draft.message.trim()) return { valid: false, message: "Write the SMS body." };
    return { valid: true };
  };

  const validateSchedule = (): ValidationResult => {
    if (!draft.scheduleAt) return { valid: true };

    const scheduleDate = new Date(draft.scheduleAt);
    if (Number.isNaN(scheduleDate.getTime())) {
      return { valid: false, message: "Choose a valid send time." };
    }
    if (scheduleDate.getTime() < renderedAt - 60_000) {
      return { valid: false, message: "Scheduled time must be in the future." };
    }

    return { valid: true };
  };

  const validations = [
    validateDetails(),
    validateAudience(),
    validateCompose(),
    { valid: true },
    validateSchedule(),
  ];
  const currentValidation = validations[step] ?? { valid: true };
  const canContinue = currentValidation.valid && !submitting;

  function toggleGroup(groupId: string) {
    setDraft((current) => ({
      ...current,
      audience: {
        ...current.audience,
        groupIds: current.audience.groupIds.includes(groupId)
          ? current.audience.groupIds.filter((value) => value !== groupId)
          : [...current.audience.groupIds, groupId],
      },
    }));
  }

  function addFilter() {
    if (!pendingFilter.value.trim()) return;

    setDraft((current) => ({
      ...current,
      audience: {
        ...current.audience,
        filters: [...current.audience.filters, pendingFilter],
      },
    }));
    setPendingFilter(emptyFilter);
  }

  function removeFilter(index: number) {
    setDraft((current) => ({
      ...current,
      audience: {
        ...current.audience,
        filters: current.audience.filters.filter((_, filterIndex) => filterIndex !== index),
      },
    }));
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    setDraft((current) => ({
      ...current,
      templateId,
      message: template?.body ?? current.message,
      personalizationDefaults: {
        firstName: template?.fallbackFirstName ?? current.personalizationDefaults.firstName,
        lastName: template?.fallbackLastName ?? current.personalizationDefaults.lastName,
      },
    }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const saveResponse = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(draft),
      });
      const savedCampaign = await saveResponse.json().catch(() => ({}));

      if (!saveResponse.ok || typeof savedCampaign.id !== "string") {
        setSubmitError(
          typeof savedCampaign.error === "string"
            ? savedCampaign.error
            : "Unable to save this campaign.",
        );
        return;
      }

      const scheduleResponse = await fetch(`/api/campaigns/${savedCampaign.id}/schedule`, {
        method: "POST",
      });
      const scheduleData = await scheduleResponse.json().catch(() => ({}));

      if (!scheduleResponse.ok) {
        setSubmitError(
          typeof scheduleData.error === "string"
            ? scheduleData.error
            : "Unable to queue the campaign.",
        );
        return;
      }

      if (!draft.scheduleAt) {
        await fetch("/api/internal/jobs/run-due-campaigns", { method: "POST" });
      }

      router.push(`/app/campaigns/${savedCampaign.id}`);
      router.refresh();
    } catch {
      setSubmitError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleContinue() {
    if (step === campaignBuilderSteps.length - 1) {
      void handleSubmit();
      return;
    }

    setStep((value) => Math.min(campaignBuilderSteps.length - 1, value + 1));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
      <section className="rounded-lg border border-white/10 bg-white/5">
        <div className="border-b border-white/10 p-4">
          <div className="flex flex-wrap gap-2">
            {campaignBuilderSteps.map((label, index) => {
              const isActive = step === index;
              const isDone = step > index;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm ${
                    isActive
                      ? "bg-primary text-white"
                      : isDone
                        ? "bg-white/10 text-white"
                        : "border border-white/10 text-white/48"
                  }`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-black/20 text-[11px]">
                    {isDone ? <Check size={12} weight="bold" /> : index + 1}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5">
          {step === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Campaign name">
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Sunday service reminder"
                />
              </Field>
              <Field label="Sender ID">
                <select
                  value={draft.senderId}
                  onChange={(event) => setDraft((current) => ({ ...current, senderId: event.target.value }))}
                >
                  {senders.map((sender) => (
                    <option key={sender.id} value={sender.id}>
                      {sender.name} ({sender.status.replaceAll("_", " ")})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Template">
                <select
                  value={draft.templateId ?? ""}
                  onChange={(event) => applyTemplate(event.target.value)}
                >
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fallback first name">
                <input
                  value={draft.personalizationDefaults.firstName}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      personalizationDefaults: {
                        ...current.personalizationDefaults,
                        firstName: event.target.value,
                      },
                    }))
                  }
                  placeholder="Member"
                />
              </Field>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="mono-number text-xs uppercase text-white/36">Select groups</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {groups.map((group) => {
                      const selected = draft.audience.groupIds.includes(group.id);

                      return (
                        <button
                          key={group.id}
                          type="button"
                          className={`rounded-md border px-3 py-2 text-sm ${
                            selected
                              ? "border-primary bg-primary text-white"
                              : "border-white/10 text-white/64 hover:bg-white/10"
                          }`}
                          onClick={() => toggleGroup(group.id)}
                        >
                          {group.name} ({group.memberCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="mono-number text-xs uppercase text-white/36">Add filters</p>
                  <div className="mt-4 grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-[0.9fr_1.1fr_auto]">
                      <select
                        value={pendingFilter.field}
                        onChange={(event) =>
                          setPendingFilter((current) => ({
                            ...current,
                            field: event.target.value as AudienceFilter["field"],
                          }))
                        }
                      >
                        <option value="tag">Tag</option>
                        <option value="status">Status</option>
                        <option value="source">Source</option>
                      </select>
                      <input
                        value={pendingFilter.value}
                        onChange={(event) =>
                          setPendingFilter((current) => ({ ...current, value: event.target.value }))
                        }
                        placeholder="parents"
                      />
                      <Button variant="outlineDark" onClick={addFilter}>
                        <Plus size={16} weight="bold" />
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {draft.audience.filters.map((filter, index) => (
                        <button
                          key={`${filter.field}-${filter.value}-${index}`}
                          type="button"
                          className="inline-flex items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm text-white/72"
                          onClick={() => removeFilter(index)}
                        >
                          {filter.field}:{filter.value}
                          <X size={14} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-white/10">
                {matchingContacts.slice(0, 6).map((contact) => (
                  <div
                    key={contact.id}
                    className="grid gap-2 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_0.8fr_0.7fr]"
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
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <Field label="Message body">
                <textarea
                  rows={7}
                  value={draft.message}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Hello {first_name}, this is your reminder..."
                />
              </Field>
              <div className="rounded-lg border border-white/10 bg-black/20 p-5">
                <p className="text-sm font-medium text-white">Message preview</p>
                <p className="mt-3 text-sm leading-7 text-white/64">
                  {draft.message || "Start writing to preview the SMS body."}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <StatPanel label="Characters" value={`${draft.message.trim().length} chars`} />
                <StatPanel label="SMS units" value={`${getMessageUnits(draft.message)} unit(s)`} />
                <StatPanel
                  label="Template variables"
                  value={selectedTemplate?.variables.join(", ") || "None"}
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <StatPanel label="Matched contacts" value={String(audienceSummary.total)} />
              <StatPanel label="Deliverable" value={String(audienceSummary.deliverable)} />
              <StatPanel label="Total credits needed" value={String(pricing.totalCredits)} />
              <StatPanel label="Balance after send" value={String(walletBalance - pricing.totalCredits)} />
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={`Schedule (${timezone})`}>
                  <input
                    type="datetime-local"
                    value={toLocalDateTimeValue(draft.scheduleAt)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        scheduleAt: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : undefined,
                      }))
                    }
                  />
                </Field>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                  <p className="mono-number text-xs uppercase text-white/36">Execution mode</p>
                  <p className="mt-3 text-sm font-medium text-white">
                    {draft.scheduleAt ? "Scheduled send" : "Immediate queue and send"}
                  </p>
                  <p className="mt-2 text-sm text-white/58">
                    Leave this blank if the campaign should go out as soon as it is queued.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentValidation.message ? (
              <p className="text-sm text-danger">{currentValidation.message}</p>
            ) : submitError ? (
              <p className="text-sm text-danger">{submitError}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outlineDark"
              disabled={step === 0 || submitting}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              Previous
            </Button>
            <Button disabled={!canContinue} onClick={handleContinue}>
              {step === campaignBuilderSteps.length - 1 ? (
                <>
                  {draft.scheduleAt ? "Schedule campaign" : "Queue and send"}
                  <PaperPlaneTilt size={16} weight="bold" />
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <p className="mono-number text-xs uppercase text-white/36">Campaign summary</p>
          <h3 className="mt-4 text-xl font-medium text-white">
            {draft.name || "Untitled campaign"}
          </h3>
          <div className="mt-5 space-y-3">
            <SummaryRow label="Audience" value={`${audienceSummary.deliverable} deliverable`} />
            <SummaryRow label="SMS units" value={`${pricing.unitsPerRecipient} per recipient`} />
            <SummaryRow label="Cost" value={`${pricing.totalCredits} credits`} />
            <SummaryRow label="Balance after" value={`${walletBalance - pricing.totalCredits} credits`} />
            <SummaryRow label="Schedule" value={draft.scheduleAt ? readableDate(draft.scheduleAt) : "Send immediately"} />
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white">
              <MagicWand size={17} weight="bold" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">AI assist</h3>
              <p className="text-xs text-white/42">Draft help only. Human review stays required.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2">
            {aiSuggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-md border border-white/10 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    message: current.message
                      ? `${current.message}\n\n${item}`
                      : item,
                  }))
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </div>
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
    <label className="grid gap-2 text-sm text-white">
      <span className="mono-number text-xs uppercase text-white/36">{label}</span>
      {children}
    </label>
  );
}

function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <p className="mono-number text-xs uppercase text-white/36">{label}</p>
      <p className="mt-3 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="text-sm text-white/42">{label}</p>
      <p className="mono-number text-sm text-white">{value}</p>
    </div>
  );
}

function readableDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function toLocalDateTimeValue(value: string | undefined) {
  if (!value) return "";

  const date = new Date(value);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
