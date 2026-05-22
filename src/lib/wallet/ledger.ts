export type LedgerEntry = {
  direction: "credit" | "debit";
  units: number;
};

export function applyLedgerEntries(entries: LedgerEntry[]) {
  return entries.reduce((total, entry) => {
    return entry.direction === "credit" ? total + entry.units : total - entry.units;
  }, 0);
}

