"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MagicWand, PaperPlaneTilt, Plus, X } from "@phosphor-icons/react";
import type { CampaignCopyCandidate, CampaignCopyTone } from "@/lib/ai/types";
import { estimateCampaignCredits, getMessageUnits } from "@/lib/campaigns/pricing";
import type {
  AudienceFilter,
  CampaignDraft,
  CampaignDraftAiComposeInputs,
} from "@/lib/campaigns/types";
import { campaignBuilderSteps } from "@/data/site";
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
  workspaceId: string;
};

type ValidationResult = {
  valid: boolean;
  message?: string;
};

type RouteErrorPayload = {
  code?: string;
  message?: string;
};

type RouteResponse = {
  error?: string | RouteErrorPayload;
};

type CampaignCopyResponse = RouteResponse & {
  candidates?: CampaignCopyCandidate[];
};

const composeToneOptions: Array<{
  value: CampaignCopyTone;
  label: string;
  detail: string;
}> = [
  { value: "friendly", label: "Friendly", detail: "Warm and reassuring" },
  { value: "direct", label: "Direct", detail: "Clear and efficient" },
  { value: "urgent", label: "Urgent", detail: "Action-first and time-aware" },
  { value: "formal", label: "Formal", detail: "Professional and restrained" },
];

function createAiComposeInputs(): CampaignDraftAiComposeInputs {
  return {
    goal: "",
    tone: "friendly",
    urgency: "",
    offer: "",
    cta: "",
    senderContext: "",
    audienceSummary: "",
  };
}

function createAiComposeState() {
  return {
    inputs: createAiComposeInputs(),
    candidates: [] as CampaignCopyCandidate[],
    selectedCandidateId: undefined,
  };
}

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
  aiCompose: createAiComposeState(),
});

const emptyFilter: AudienceFilter = {
  field: "tag",
  operator: "in",
  value: "",
};

function getCurrentTimestamp() {
  return Date.now();
}

function readStoredBuilderState(workspaceId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(`cento:campaign-draft:${workspaceId}`);
    if (!storedValue) {
      return null;
    }

    return JSON.parse(storedValue) as {
      step?: number;
      draft?: CampaignDraft;
    };
  } catch {
    window.localStorage.removeItem(`cento:campaign-draft:${workspaceId}`);
    return null;
  }
}

export function CampaignBuilder({
  senders,
  templates,
  groups,
  contacts,
  walletBalance,
  timezone,
  workspaceId,
}: CampaignBuilderProps) {
  const router = useRouter();
  const initialStoredState = readStoredBuilderState(workspaceId);
  const [step, setStep] = useState(() =>
    typeof initialStoredState?.step === "number"
      ? Math.max(0, Math.min(campaignBuilderSteps.length - 1, initialStoredState.step))
      : 0,
  );
  const [draft, setDraft] = useState<CampaignDraft>(() =>
    initialStoredState?.draft
      ? sanitizeRestoredDraft(initialStoredState.draft, senders, templates, groups)
      : emptyDraft(senders, templates),
  );
  const [pendingFilter, setPendingFilter] = useState<AudienceFilter>(emptyFilter);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [validationNow, setValidationNow] = useState(() => getCurrentTimestamp());
  const scheduleTimeZone = useMemo(() => resolveTimeZone(timezone), [timezone]);
  const draftStorageKey = `cento:campaign-draft:${workspaceId}`;

  useEffect(() => {
    window.localStorage.setItem(
      draftStorageKey,
      JSON.stringify({ step, draft }),
    );
  }, [draft, draftStorageKey, step]);

  useEffect(() => {
    if (step !== campaignBuilderSteps.length - 1 || !draft.scheduleAt) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setValidationNow(getCurrentTimestamp());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [draft.scheduleAt, step]);

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
  const selectedSender = senders.find((sender) => sender.id === draft.senderId) ?? null;
  const aiCompose = draft.aiCompose ?? createAiComposeState();
  const aiComposeInputs = aiCompose.inputs;
  const selectedGroupNames = groups
    .filter((group) => draft.audience.groupIds.includes(group.id))
    .map((group) => group.name);
  const liveAudienceSummary = useMemo(() => {
    const segments: string[] = [];

    if (selectedGroupNames.length > 0) {
      segments.push(`Groups: ${selectedGroupNames.join(", ")}`);
    }
    if (draft.audience.filters.length > 0) {
      segments.push(
        `Filters: ${draft.audience.filters
          .map((filter) => `${filter.field}:${filter.value}`)
          .join(", ")}`,
      );
    }
    segments.push(`${audienceSummary.deliverable} deliverable contacts`);

    if (audienceSummary.suppressed > 0) {
      segments.push(`${audienceSummary.suppressed} suppressed`);
    }
    if (audienceSummary.invalid > 0) {
      segments.push(`${audienceSummary.invalid} invalid`);
    }
    if (audienceSummary.duplicates > 0) {
      segments.push(`${audienceSummary.duplicates} duplicates`);
    }

    return segments.join(" | ");
  }, [
    audienceSummary.deliverable,
    audienceSummary.duplicates,
    audienceSummary.invalid,
    audienceSummary.suppressed,
    draft.audience.filters,
    selectedGroupNames,
  ]);
  const suggestedSenderContext = useMemo(() => {
    const contextParts = [
      selectedSender ? `${selectedSender.name} sender ID` : null,
      selectedTemplate ? `${selectedTemplate.name} template as the starting point` : null,
    ].filter(Boolean);

    return contextParts.length > 0
      ? contextParts.join(" | ")
      : "Describe why this sender is familiar and trusted by the audience.";
  }, [selectedSender, selectedTemplate]);
  const canGenerateCandidates =
    !isGenerating &&
    Boolean(
      draft.name.trim() &&
        draft.senderId &&
        aiComposeInputs.goal.trim() &&
        (draft.message.trim() ||
          aiComposeInputs.offer.trim() ||
          selectedTemplate?.body.trim()),
    );

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
    if (!draft.message.trim()) {
      return { valid: false, message: "Write the SMS body before continuing." };
    }
    return { valid: true };
  };

  const validateSchedule = (): ValidationResult => {
    if (!draft.scheduleAt) return { valid: true };

    const scheduleDate = new Date(draft.scheduleAt);
    if (Number.isNaN(scheduleDate.getTime())) {
      return { valid: false, message: "Choose a valid send time." };
    }
    if (scheduleDate.getTime() <= validationNow) {
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
  const unlockedSteps = validations.map((_, index) =>
    validations.slice(0, index).every((validation) => validation.valid),
  );
  const currentValidation = validations[step] ?? { valid: true };
  const canContinue = currentValidation.valid && !submitting;
  const currentStepLabel = campaignBuilderSteps[step] ?? "Step";
  const currentStepTitle = getStepTitle(step);
  const currentStepDetail = getStepDetail(step);

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
      personalizationDefaults: {
        firstName: template?.fallbackFirstName ?? current.personalizationDefaults.firstName,
        lastName: template?.fallbackLastName ?? current.personalizationDefaults.lastName,
      },
    }));
  }

  function updateAiComposeInput<Key extends keyof CampaignDraftAiComposeInputs>(
    key: Key,
    value: CampaignDraftAiComposeInputs[Key],
  ) {
    setGenerationError(null);
    setDraft((current) => ({
      ...current,
      aiCompose: {
        ...(current.aiCompose ?? createAiComposeState()),
        inputs: {
          ...(current.aiCompose?.inputs ?? createAiComposeInputs()),
          [key]: value,
        },
      },
    }));
  }

  async function handleGenerateCandidates() {
    if (!canGenerateCandidates) {
      setGenerationError("Add the message goal and at least a rough message before generating options.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const senderContext = suggestedSenderContext;
    const audienceContext = liveAudienceSummary;
    const goalContext = [
      aiComposeInputs.goal.trim(),
      senderContext ? `Sender context: ${senderContext}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    try {
      const response = await fetch("/api/ai/campaign-copy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          campaignName: draft.name.trim(),
          senderName: selectedSender?.name ?? draft.senderId,
          audienceSummary: audienceContext,
          goal: goalContext,
          tone: aiComposeInputs.tone,
          urgency: aiComposeInputs.urgency.trim() || "Routine",
          offer:
            draft.message.trim() ||
            aiComposeInputs.offer.trim() ||
            selectedTemplate?.body.trim() ||
            "",
          cta: aiComposeInputs.cta.trim() || "Reply or act on this update.",
          existingMessage:
            draft.message.trim() || aiComposeInputs.offer.trim() || selectedTemplate?.body.trim() || undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as CampaignCopyResponse;

      if (!response.ok) {
        throw new Error(resolveCampaignCopyError(data));
      }

      if (!Array.isArray(data.candidates) || data.candidates.length !== 3) {
        throw new Error("AI returned an invalid set of campaign options.");
      }
      const candidates = data.candidates;

      setDraft((current) => ({
        ...current,
        message: "",
        aiCompose: {
          ...(current.aiCompose ?? createAiComposeState()),
          inputs: {
            ...(current.aiCompose?.inputs ?? createAiComposeInputs()),
            offer:
              current.message.trim() ||
              current.aiCompose?.inputs.offer ||
              selectedTemplate?.body ||
              "",
            senderContext,
            audienceSummary: audienceContext,
          },
          candidates,
          selectedCandidateId: undefined,
        },
      }));
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Unable to generate campaign options.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function selectCandidate(candidateId: string) {
    setGenerationError(null);
    setDraft((current) => {
      const candidate = current.aiCompose?.candidates.find((item) => item.id === candidateId);
      if (!candidate) {
        return current;
      }

      return {
        ...current,
        message: candidate.body,
        aiCompose: {
          ...(current.aiCompose ?? createAiComposeState()),
          selectedCandidateId: candidateId,
        },
      };
    });
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
      const savedCampaign = (await saveResponse.json().catch(() => ({}))) as
        | (RouteResponse & { id?: string })
        | Record<string, never>;

      if (!saveResponse.ok || typeof savedCampaign.id !== "string") {
        setSubmitError(resolveRouteErrorMessage(savedCampaign, "Unable to save this campaign."));
        return;
      }

      const scheduleResponse = await fetch(`/api/campaigns/${savedCampaign.id}/schedule`, {
        method: "POST",
      });
      const scheduleData = (await scheduleResponse.json().catch(() => ({}))) as RouteResponse;

      if (!scheduleResponse.ok) {
        setSubmitError(resolveRouteErrorMessage(scheduleData, "Unable to queue the campaign."));
        return;
      }

      if (!draft.scheduleAt) {
        const runnerResponse = await fetch("/api/internal/jobs/run-due-campaigns", {
          method: "POST",
        });
        const runnerData = (await runnerResponse.json().catch(() => ({}))) as RouteResponse;

        if (!runnerResponse.ok) {
          setSubmitError(
            resolveRouteErrorMessage(
              runnerData,
              "Campaign saved, but the immediate runner could not start.",
            ),
          );
          return;
        }
      }

      window.localStorage.removeItem(draftStorageKey);
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

    setStep((value) => {
      const nextStep = Math.min(campaignBuilderSteps.length - 1, value + 1);

      if (nextStep === campaignBuilderSteps.length - 1) {
        setValidationNow(getCurrentTimestamp());
      }

      return nextStep;
    });
  }

  function handleStepChange(nextStep: number) {
    if (!unlockedSteps[nextStep]) {
      return;
    }

    if (nextStep === campaignBuilderSteps.length - 1) {
      setValidationNow(getCurrentTimestamp());
    }

    setStep(nextStep);
  }

  return (
    <div>
      <section className="app-shell-pane overflow-hidden rounded-[28px]">
        <div className="app-shell-glass border-b border-[var(--app-border)] p-5">
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-2xl">
                <p className="mono-number text-xs uppercase text-[var(--app-muted)]">
                  {`Step ${step + 1} of ${campaignBuilderSteps.length}`}
                </p>
                <h2 className="mt-3 text-2xl font-medium tracking-[-0.03em] text-[var(--app-text)]">
                  {currentStepTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                  {currentStepDetail}
                </p>
              </div>
              <div className="app-shell-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--app-text)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white keep-white">
                  {step + 1}
                </span>
                {currentStepLabel}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-5">
            {campaignBuilderSteps.map((label, index) => {
              const isActive = step === index;
              const isDone = step > index;
              const isUnlocked = unlockedSteps[index];

              return (
                <button
                  key={label}
                  type="button"
                  aria-label={`Step ${index + 1}: ${label}`}
                  disabled={!isUnlocked}
                  onClick={() => handleStepChange(index)}
                  className={`rounded-[24px] border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-primary/60 bg-primary/12 text-[var(--app-text)] shadow-[0_20px_45px_-34px_rgba(93,54,197,0.95)]"
                      : isDone
                        ? "border-[var(--app-border)] bg-[var(--app-hover)] text-[var(--app-text)]"
                        : "border-[var(--app-border)] bg-[var(--app-panel)] text-[var(--app-muted)]"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                      isActive
                        ? "bg-primary text-white keep-white"
                        : isDone
                          ? "bg-[var(--app-text)] text-[var(--app-bg)]"
                          : "bg-[var(--app-soft-fill)] text-[var(--app-muted)]"
                    }`}
                  >
                    {isDone ? <Check size={12} weight="bold" /> : index + 1}
                  </span>
                  <div className="mt-3">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">{getStepMicrocopy(index)}</p>
                  </div>
                </button>
              );
            })}
            </div>
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
            <div className="space-y-5">
              <section className="app-shell-glass rounded-[26px] p-5">
                <div>
                  <p className="mono-number text-xs uppercase text-[var(--app-muted)]">
                    Guided message studio
                  </p>
                  <h3 className="mt-3 text-xl font-medium text-[var(--app-text)]">
                    Write the message first. Use AI only if you want help.
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--app-muted)]">
                    Keep this simple: write the main SMS in the large editor below. If you want
                    faster options or a cleaner version, use the AI helper right under it.
                  </p>
                </div>

                <div className="mt-5">
                  <Field label="Main message">
                    <textarea
                      rows={8}
                      value={draft.message}
                      onChange={(event) => {
                        const value = event.target.value;
                        setDraft((current) => ({ ...current, message: value }));
                        updateAiComposeInput("offer", value);
                      }}
                      placeholder="Write the SMS your audience should receive. Example: PTA meeting starts tomorrow at 10 AM in the assembly hall. Please arrive by 9:45 AM."
                    />
                  </Field>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Message goal">
                    <input
                      value={aiComposeInputs.goal}
                      onChange={(event) => updateAiComposeInput("goal", event.target.value)}
                      placeholder="Remind parents about tomorrow's meeting"
                    />
                  </Field>
                  <Field label="Tone">
                    <select
                      value={aiComposeInputs.tone}
                      onChange={(event) =>
                        updateAiComposeInput(
                          "tone",
                          event.target.value as CampaignCopyTone,
                        )
                      }
                    >
                      {composeToneOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Urgency">
                    <select
                      value={aiComposeInputs.urgency}
                      onChange={(event) => updateAiComposeInput("urgency", event.target.value)}
                    >
                      <option value="">Routine</option>
                      <option value="Send this as a calm reminder.">Routine reminder</option>
                      <option value="This should be seen today.">Needs attention today</option>
                      <option value="This is urgent and needs immediate action.">Immediate action</option>
                    </select>
                  </Field>
                  <Field label="Call to action">
                    <input
                      value={aiComposeInputs.cta}
                      onChange={(event) => updateAiComposeInput("cta", event.target.value)}
                      placeholder="Arrive by 9:45 AM"
                    />
                  </Field>
                </div>

                <div className="mt-5 rounded-[24px] border border-[var(--app-border)] bg-[var(--app-panel)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[var(--app-text)]">AI helper</p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">
                        AI uses your current message, sender, and selected audience automatically.
                      </p>
                    </div>
                    <Button
                      className="min-w-[200px]"
                      onClick={() => void handleGenerateCandidates()}
                      disabled={!canGenerateCandidates}
                    >
                      <MagicWand size={16} weight="bold" />
                      {isGenerating ? "Generating 3 options..." : "Generate 3 options"}
                    </Button>
                  </div>
                  {generationError ? (
                    <p className="mt-3 text-sm text-danger">{generationError}</p>
                  ) : null}
                </div>
              </section>

              <section className="app-shell-highlight rounded-[26px] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="mono-number text-xs uppercase text-[var(--app-muted)]">
                      Candidate review
                    </p>
                    <h3 className="mt-3 text-xl font-medium text-[var(--app-text)]">
                      Compare AI options if you generated them
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                      Pick any suggestion to replace the current message, then keep editing it.
                    </p>
                  </div>
                  <div className="app-shell-chip inline-flex items-center rounded-full px-4 py-2 text-sm text-[var(--app-text)]">
                    {aiCompose.candidates.length}/3 options ready
                  </div>
                </div>

                {isGenerating ? (
                  <div
                    className="mt-5 rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] px-5 py-6 text-sm text-[var(--app-muted)]"
                    aria-live="polite"
                  >
                    Writing three SMS-safe variants tuned to this campaign.
                  </div>
                ) : aiCompose.candidates.length > 0 ? (
                  <div className="mt-5 grid gap-3 xl:grid-cols-3">
                    {aiCompose.candidates.map((candidate) => {
                      const isSelected = aiCompose.selectedCandidateId === candidate.id;

                      return (
                        <button
                          key={candidate.id}
                          type="button"
                          aria-pressed={isSelected}
                          aria-label={`Choose ${candidate.label}`}
                          className={`rounded-[24px] border px-5 py-4 text-left transition ${
                            isSelected
                              ? "border-primary/70 bg-primary/12 shadow-[0_24px_48px_-34px_rgba(93,54,197,0.95)]"
                              : "border-[var(--app-border)] bg-[var(--app-panel)] hover:border-primary/30 hover:bg-[var(--app-hover)]"
                          }`}
                          onClick={() => selectCandidate(candidate.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="mono-number text-xs uppercase text-[var(--app-muted)]">
                                {candidate.label}
                              </p>
                              <p className="mt-3 text-sm leading-7 text-[var(--app-text)]">
                                {candidate.body}
                              </p>
                            </div>
                            {isSelected ? (
                              <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white keep-white">
                                Using this
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-[24px] border border-dashed border-[var(--app-border)] bg-[var(--app-panel)] px-5 py-6">
                    <p className="text-sm font-medium text-[var(--app-text)]">
                      No AI suggestions yet
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                      You can continue with the message you wrote manually, or generate three
                      options first.
                    </p>
                  </div>
                )}

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <StatPanel label="Characters" value={`${draft.message.trim().length} chars`} />
                  <StatPanel label="SMS units" value={`${getMessageUnits(draft.message)} unit(s)`} />
                  <StatPanel
                    label="Template variables"
                    value={selectedTemplate?.variables.join(", ") || "None"}
                  />
                </div>
              </section>
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
                <Field label={`Schedule (workspace timezone: ${scheduleTimeZone})`}>
                  <input
                    type="datetime-local"
                    value={toZonedDateTimeValue(draft.scheduleAt, scheduleTimeZone)}
                    onChange={(event) => {
                      setValidationNow(getCurrentTimestamp());
                      setDraft((current) => ({
                        ...current,
                        scheduleAt: parseZonedDateTimeValue(
                          event.target.value,
                          scheduleTimeZone,
                        ),
                      }));
                    }}
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

        <div className="flex flex-col gap-3 border-t border-[var(--app-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {step === 2 && generationError ? (
              <p className="text-sm text-danger">{generationError}</p>
            ) : currentValidation.message ? (
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
    <label className="grid gap-2 text-sm text-[var(--app-text)]">
      <span className="mono-number text-xs uppercase text-[var(--app-muted)]">{label}</span>
      {children}
    </label>
  );
}

function getStepTitle(step: number) {
  switch (step) {
    case 0:
      return "Set the campaign frame.";
    case 1:
      return "Lock the exact audience.";
    case 2:
      return "Write the message and use AI only if needed.";
    case 3:
      return "Review cost and delivery impact.";
    case 4:
      return "Choose when this campaign goes out.";
    default:
      return "Prepare the campaign.";
  }
}

function getStepDetail(step: number) {
  switch (step) {
    case 0:
      return "Name the campaign, choose the sender, and set the personalization defaults before any copy is written.";
    case 1:
      return "Use groups and filters to confirm who should receive this send and what quality issues still need attention.";
    case 2:
      return "Keep the core SMS simple and visible. AI can suggest cleaner or shorter variants, but it should never block the send.";
    case 3:
      return "Check the deliverable audience, message length, credit burn, and post-send balance before committing.";
    case 4:
      return "Queue the campaign immediately or schedule it in the workspace timezone so delivery timing stays predictable.";
    default:
      return "Prepare the campaign.";
  }
}

function getStepMicrocopy(step: number) {
  switch (step) {
    case 0:
      return "Name, sender, defaults";
    case 1:
      return "Groups, filters, quality";
    case 2:
      return "Message, AI help, draft";
    case 3:
      return "Recipients, units, credits";
    case 4:
      return "Immediate or scheduled";
    default:
      return "";
  }
}

function StatPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-shell-glass rounded-[22px] p-4">
      <p className="mono-number text-xs uppercase text-[var(--app-muted)]">{label}</p>
      <p className="mt-3 text-sm font-medium text-[var(--app-text)]">{value}</p>
    </div>
  );
}

function toZonedDateTimeValue(value: string | undefined, timeZone: string) {
  if (!value) return "";

  const parts = getTimeZoneParts(new Date(value), timeZone);
  const year = String(parts.year);
  const month = `${parts.month}`.padStart(2, "0");
  const day = `${parts.day}`.padStart(2, "0");
  const hours = `${parts.hour}`.padStart(2, "0");
  const minutes = `${parts.minute}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseZonedDateTimeValue(value: string, timeZone: string) {
  if (!value) {
    return undefined;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);

  if (!match) {
    return undefined;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
  let offset = getTimeZoneOffsetMilliseconds(new Date(naiveUtc), timeZone);
  let timestamp = naiveUtc - offset;
  let candidate = new Date(timestamp);
  const correctedOffset = getTimeZoneOffsetMilliseconds(candidate, timeZone);

  if (correctedOffset !== offset) {
    offset = correctedOffset;
    timestamp = naiveUtc - offset;
    candidate = new Date(timestamp);
  }

  if (toZonedDateTimeValue(candidate.toISOString(), timeZone) !== value) {
    return undefined;
  }

  return candidate.toISOString();
}

function resolveCampaignCopyError(data: CampaignCopyResponse) {
  const message = resolveRouteErrorMessage(data, "Unable to generate campaign options.");

  if (message === "AI is not configured for this environment") {
    return "AI help is not available here yet because the DeepSeek key is missing. You can still write and send the message manually.";
  }

  return message;
}

function resolveRouteErrorMessage(data: RouteResponse, fallbackMessage: string) {
  if (typeof data.error === "string") {
    return data.error;
  }

  if (typeof data.error?.message === "string") {
    return data.error.message;
  }

  return fallbackMessage;
}

function resolveTimeZone(timeZone: string) {
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone }).resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const lookup = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: lookup.year,
    month: lookup.month,
    day: lookup.day,
    hour: lookup.hour,
    minute: lookup.minute,
    second: lookup.second,
  };
}

function getTimeZoneOffsetMilliseconds(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const utcTimestamp = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return utcTimestamp - date.getTime();
}

function sanitizeRestoredDraft(
  draft: CampaignDraft,
  senders: BuilderSender[],
  templates: BuilderTemplate[],
  groups: BuilderGroup[],
) {
  const fallback = emptyDraft(senders, templates);
  const validGroupIds = new Set(groups.map((group) => group.id));
  const validSenderIds = new Set(senders.map((sender) => sender.id));
  const validTemplateIds = new Set(templates.map((template) => template.id));

  return {
    ...fallback,
    ...draft,
    senderId: validSenderIds.has(draft.senderId) ? draft.senderId : fallback.senderId,
    templateId:
      draft.templateId && validTemplateIds.has(draft.templateId)
        ? draft.templateId
        : fallback.templateId,
    audience: {
      groupIds: (draft.audience?.groupIds ?? []).filter((groupId) =>
        validGroupIds.has(groupId),
      ),
      filters: draft.audience?.filters ?? [],
    },
    personalizationDefaults: {
      firstName:
        draft.personalizationDefaults?.firstName ??
        fallback.personalizationDefaults.firstName,
      lastName:
        draft.personalizationDefaults?.lastName ??
        fallback.personalizationDefaults.lastName,
    },
    aiCompose: draft.aiCompose ?? fallback.aiCompose,
  };
}
