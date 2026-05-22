import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";
import { applyLedgerEntries } from "./ledger";

export async function listWalletEntries(workspaceId: string) {
  return getDemoStore().walletEntries.filter((entry) => entry.workspaceId === workspaceId);
}

export async function getWorkspaceBalance(workspaceId: string) {
  const entries = await listWalletEntries(workspaceId);
  return applyLedgerEntries(entries.map((entry) => ({
    direction: entry.direction,
    units: entry.units,
  })));
}

export async function createTopUpOrder(workspaceId: string, input: { creditsPurchased: number; amountGhs: number }) {
  const order = {
    id: createDemoId("topup"),
    workspaceId,
    creditsPurchased: input.creditsPurchased,
    amountGhs: input.amountGhs,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().topUpOrders.unshift(order);
  return order;
}

export async function applyWalletCredit(workspaceId: string, input: {
  units: number;
  reason: string;
  meta: string;
}) {
  const entry = {
    id: createDemoId("wallet"),
    workspaceId,
    direction: "credit" as const,
    units: input.units,
    reason: input.reason,
    meta: input.meta,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().walletEntries.unshift(entry);
  return entry;
}

export async function applyWalletDebit(workspaceId: string, input: {
  units: number;
  reason: string;
  meta: string;
  campaignId?: string;
}) {
  const entry = {
    id: createDemoId("wallet"),
    workspaceId,
    direction: "debit" as const,
    units: input.units,
    reason: input.reason,
    meta: input.meta,
    campaignId: input.campaignId,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().walletEntries.unshift(entry);
  return entry;
}

export async function createManualAdjustment(workspaceId: string, input: {
  direction: "credit" | "debit";
  units: number;
  reason: string;
}) {
  return input.direction === "credit"
    ? applyWalletCredit(workspaceId, { units: input.units, reason: input.reason, meta: "Manual adjustment" })
    : applyWalletDebit(workspaceId, { units: input.units, reason: input.reason, meta: "Manual adjustment" });
}

