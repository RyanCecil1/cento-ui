"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ContactGroupAssignmentProps = {
  contactId: string;
  initialGroupIds: string[];
  groups: Array<{ id: string; name: string }>;
};

export function ContactGroupAssignment({
  contactId,
  initialGroupIds,
  groups,
}: ContactGroupAssignmentProps) {
  const router = useRouter();
  const [selectedGroupIds, setSelectedGroupIds] = useState(initialGroupIds);
  const [saving, setSaving] = useState(false);

  async function toggleGroup(groupId: string) {
    const nextGroupIds = selectedGroupIds.includes(groupId)
      ? selectedGroupIds.filter((value) => value !== groupId)
      : [...selectedGroupIds, groupId];

    setSelectedGroupIds(nextGroupIds);
    setSaving(true);

    try {
      await fetch(`/api/contacts/${contactId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ groupIds: nextGroupIds }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group) => {
        const selected = selectedGroupIds.includes(group.id);

        return (
          <button
            key={group.id}
            type="button"
            disabled={saving}
            onClick={() => void toggleGroup(group.id)}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              selected
                ? "border-primary bg-primary text-white"
                : "border-[var(--app-border)] bg-[var(--app-soft-fill)] text-[var(--app-text)] hover:bg-[var(--app-hover)]"
            } ${saving ? "opacity-70" : ""}`}
          >
            {group.name}
          </button>
        );
      })}
    </div>
  );
}
