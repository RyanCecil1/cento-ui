import { describe, expect, it } from "vitest";
import { runFinalRecheck } from "./recheck";

describe("runFinalRecheck", () => {
  it("returns needs_attention when balance cannot cover the resolved send size", async () => {
    const result = await runFinalRecheck({
      resolvedRecipients: 2480,
      unitsPerRecipient: 1,
      walletBalance: 1200,
      senderStatus: "approved",
      jobAlreadyClaimed: false,
    });

    expect(result).toEqual({
      ok: false,
      state: "needs_attention",
      reason: "insufficient_balance",
    });
  });
});

