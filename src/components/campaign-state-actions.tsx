"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

type CampaignStateActionsProps = {
  campaignId: string;
  state: string;
};

export function CampaignStateActions({ campaignId, state }: CampaignStateActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runAction(action: "schedule" | "pause" | "resume" | "cancel" | "process") {
    setLoading(action);
    setError(null);

    try {
      const response =
        action === "process"
          ? await fetch("/api/internal/jobs/run-due-campaigns", { method: "POST" })
          : await fetch(`/api/campaigns/${campaignId}/${action}`, { method: "POST" });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Action failed.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      {state === "draft" ? (
        <Button onClick={() => runAction("schedule")} disabled={loading !== null}>
          {loading === "schedule" ? "Queuing..." : "Queue campaign"}
        </Button>
      ) : null}
      {state === "queued" ? (
        <>
          <Button variant="dark" onClick={() => runAction("process")} disabled={loading !== null}>
            {loading === "process" ? "Processing..." : "Process queue"}
          </Button>
          <Button variant="outlineDark" onClick={() => runAction("pause")} disabled={loading !== null}>
            Pause
          </Button>
          <Button variant="outlineDark" onClick={() => runAction("cancel")} disabled={loading !== null}>
            Cancel
          </Button>
        </>
      ) : null}
      {state === "paused" ? (
        <>
          <Button onClick={() => runAction("resume")} disabled={loading !== null}>
            Resume
          </Button>
          <Button variant="outlineDark" onClick={() => runAction("cancel")} disabled={loading !== null}>
            Cancel
          </Button>
        </>
      ) : null}
      {state === "needs_attention" ? (
        <>
          <Button onClick={() => runAction("schedule")} disabled={loading !== null}>
            Requeue
          </Button>
          <Button variant="outlineDark" onClick={() => runAction("process")} disabled={loading !== null}>
            Process queue
          </Button>
        </>
      ) : null}
      {error ? <p className="w-full text-sm text-danger">{error}</p> : null}
    </div>
  );
}
