"use client";

import { useState } from "react";
import { Check, MagicWand, PaperPlaneTilt } from "@phosphor-icons/react";
import {
  aiSuggestions,
  campaignBuilderSteps,
  contactsPreview,
  recentCampaigns,
} from "@/data/site";
import { Button } from "./ui";

export function CampaignBuilder() {
  const [step, setStep] = useState(0);

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
          {step === 0 ? <CampaignDetailsStep /> : null}
          {step === 1 ? <AudienceStep /> : null}
          {step === 2 ? <ComposeStep /> : null}
          {step === 3 ? <PreviewStep /> : null}
          {step === 4 ? <ScheduleStep /> : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 p-4 sm:flex-row sm:justify-between">
          <Button
            variant="outlineDark"
            className={`${
              step === 0 ? "pointer-events-none opacity-40" : ""
            }`}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setStep((value) => Math.min(campaignBuilderSteps.length - 1, value + 1))
            }
          >
            {step === campaignBuilderSteps.length - 1 ? (
              <>
                Review plan <PaperPlaneTilt size={16} weight="bold" />
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </section>

      <aside className="space-y-5">
        <div className="rounded-lg border border-white/10 bg-[#121018] p-5">
          <p className="mono-number text-xs uppercase text-white/36">Campaign summary</p>
          <h3 className="mt-4 text-xl font-medium text-white">Sunday service reminder</h3>
          <div className="mt-5 space-y-3">
            <SummaryRow label="Audience" value="2,480 contacts" />
            <SummaryRow label="SMS units" value="1 per recipient" />
            <SummaryRow label="Cost" value="2,480 credits" />
            <SummaryRow label="Balance after" value="9,940 credits" />
            <SummaryRow label="Schedule" value="Tomorrow, 7:00 AM" />
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
                className="rounded-md border border-white/10 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white"
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

function CampaignDetailsStep() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InputPanel label="Campaign name" value="Sunday service reminder" />
      <InputPanel label="Sender ID" value="GRACEHUB" />
      <InputPanel label="Campaign type" value="Scheduled campaign" />
      <InputPanel label="Audience source" value="Church members group" />
    </div>
  );
}

function AudienceStep() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
        <InputPanel label="Selected group" value="Church members" />
        <InputPanel label="Estimated valid contacts" value="2,480 recipients" />
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10">
        {contactsPreview.map((contact) => (
          <div
            key={contact.name}
            className="grid gap-2 border-b border-white/10 px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1fr_1fr_0.8fr_0.7fr]"
          >
            <p className="font-medium text-white">{contact.name}</p>
            <p className="text-white/50">{contact.phone}</p>
            <p className="text-white/50">{contact.group}</p>
            <p className="text-white/72">{contact.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComposeStep() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-medium text-white">Message preview</p>
        <p className="mt-3 text-sm leading-7 text-white/64">
          Hello {"{first_name}"}, this is a reminder that our Sunday service starts
          at 8:30 AM tomorrow. Please arrive early if you are serving. God bless you.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InputPanel label="Characters" value="132 chars" />
        <InputPanel label="SMS units" value="1 unit" />
        <InputPanel label="Tone" value="Warm and clear" />
      </div>
    </div>
  );
}

function PreviewStep() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InputPanel label="Recipients" value="2,480" />
      <InputPanel label="Units per recipient" value="1" />
      <InputPanel label="Total credits needed" value="2,480" />
      <InputPanel label="Remaining after send" value="9,940" />
    </div>
  );
}

function ScheduleStep() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <InputPanel label="Date" value="Friday, 16 May 2026" />
        <InputPanel label="Time" value="7:00 AM" />
      </div>
      <div className="rounded-lg border border-white/10 bg-black/20 p-5">
        <p className="text-sm font-medium text-white">Recent scheduled activity</p>
        <div className="mt-4 space-y-2">
          {recentCampaigns.slice(0, 2).map((campaign) => (
            <div
              key={campaign.name}
              className="flex items-center justify-between gap-4 rounded-md border border-white/10 px-3 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{campaign.name}</p>
                <p className="text-xs text-white/42">{campaign.sentAt}</p>
              </div>
              <p className="text-sm text-white/64">{campaign.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InputPanel({ label, value }: { label: string; value: string }) {
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
