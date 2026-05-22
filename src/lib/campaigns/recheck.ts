export async function runFinalRecheck(input: {
  resolvedRecipients: number;
  unitsPerRecipient: number;
  walletBalance: number;
  senderStatus: "approved" | "shared" | "rejected";
  jobAlreadyClaimed: boolean;
}) {
  if (input.jobAlreadyClaimed) {
    return { ok: false, state: "needs_attention", reason: "job_already_claimed" } as const;
  }

  if (!["approved", "shared"].includes(input.senderStatus)) {
    return { ok: false, state: "needs_attention", reason: "invalid_sender" } as const;
  }

  const requiredUnits = input.resolvedRecipients * input.unitsPerRecipient;
  if (input.walletBalance < requiredUnits) {
    return { ok: false, state: "needs_attention", reason: "insufficient_balance" } as const;
  }

  if (input.resolvedRecipients === 0) {
    return { ok: false, state: "needs_attention", reason: "empty_audience" } as const;
  }

  return { ok: true, requiredUnits } as const;
}

