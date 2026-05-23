import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { applyLedgerEntries } from "./ledger";

type WalletRow = {
  id: string;
  workspace_id: string;
  direction: "credit" | "debit";
  units: number;
  reason: string;
  entry_type: "top_up" | "manual_adjustment" | "campaign_deduction" | "refund" | "reversal";
  provider_reference: string | null;
  created_at: string;
  campaign_id: string | null;
};

function toWalletEntry(row: WalletRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    direction: row.direction,
    units: row.units,
    reason: row.reason,
    meta: row.provider_reference ?? row.entry_type.replaceAll("_", " "),
    campaignId: row.campaign_id,
    createdAt: row.created_at,
  };
}

export async function listWalletEntries(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("wallet_ledger_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list wallet entries");
  }

  return ((data ?? []) as WalletRow[]).map(toWalletEntry);
}

export async function getWorkspaceBalance(workspaceId: string) {
  const entries = await listWalletEntries(workspaceId);
  return applyLedgerEntries(entries.map((entry) => ({
    direction: entry.direction,
    units: entry.units,
  })));
}

export async function createTopUpOrder(workspaceId: string, input: { creditsPurchased: number; amountGhs: number }) {
  const supabase = createServerSupabaseClient();
  const reference = crypto.randomUUID();
  const { data, error } = await supabase
    .from("payment_events")
    .insert({
      workspace_id: workspaceId,
      provider_name: "manual",
      provider_event_id: `pending_${reference}`,
      payment_reference: reference,
      status: "pending",
      amount_minor: Math.round(input.amountGhs * 100),
      currency: "GHS",
      metadata: { creditsPurchased: input.creditsPurchased },
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create top-up order");
  }

  return {
    id: data.id as string,
    workspaceId,
    creditsPurchased: input.creditsPurchased,
    amountGhs: input.amountGhs,
    paymentReference: reference,
    status: "pending" as const,
    createdAt: data.created_at as string,
  };
}

export async function applyWalletCredit(workspaceId: string, input: {
  units: number;
  reason: string;
  meta: string;
  paymentEventId?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("wallet_ledger_entries")
    .insert({
      workspace_id: workspaceId,
      entry_type: input.paymentEventId ? "top_up" : "manual_adjustment",
      direction: "credit",
      units: input.units,
      reason: input.reason,
      provider_reference: input.meta,
      payment_event_id: input.paymentEventId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to credit wallet");
  }

  return toWalletEntry(data as WalletRow);
}

export async function applyWalletDebit(workspaceId: string, input: {
  units: number;
  reason: string;
  meta: string;
  campaignId?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("wallet_ledger_entries")
    .insert({
      workspace_id: workspaceId,
      entry_type: input.campaignId ? "campaign_deduction" : "manual_adjustment",
      direction: "debit",
      units: input.units,
      reason: input.reason,
      provider_reference: input.meta,
      campaign_id: input.campaignId ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to debit wallet");
  }

  return toWalletEntry(data as WalletRow);
}

export async function createManualAdjustment(workspaceId: string, input: {
  direction: "credit" | "debit";
  units: number;
  reason: string;
}) {
  return input.direction === "credit"
    ? applyWalletCredit(workspaceId, {
        units: input.units,
        reason: input.reason,
        meta: "Manual adjustment",
      })
    : applyWalletDebit(workspaceId, {
        units: input.units,
        reason: input.reason,
        meta: "Manual adjustment",
      });
}
