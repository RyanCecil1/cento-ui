import { describe, expect, it } from "vitest";
import { applyLedgerEntries } from "./ledger";

describe("applyLedgerEntries", () => {
  it("derives the current credit balance from immutable entries", () => {
    const balance = applyLedgerEntries([
      { direction: "credit", units: 8000 },
      { direction: "debit", units: 2480 },
      { direction: "credit", units: 320 },
    ]);

    expect(balance).toBe(5840);
  });
});

