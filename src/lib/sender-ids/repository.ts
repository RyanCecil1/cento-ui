import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type SenderRow = {
  id: string;
  workspace_id: string;
  sender_value: string;
  sender_mode: "shared" | "branded";
  status: "draft" | "submitted" | "in_review" | "approved" | "rejected";
  notes: string;
  created_at: string;
  updated_at: string;
};

function toSenderView(row: SenderRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.sender_value,
    senderMode: row.sender_mode,
    status: row.status === "submitted" ? "in_review" : row.status,
    note: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSenderIds(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sender_ids")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list sender IDs");
  }

  return ((data ?? []) as SenderRow[]).map(toSenderView);
}

export async function createSenderIdRequest(workspaceId: string, input: { name: string; note: string }) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("sender_ids")
    .insert({
      workspace_id: workspaceId,
      sender_value: input.name.toUpperCase(),
      sender_mode: "branded",
      status: "approved",
      notes: input.note,
      submitted_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create sender ID request");
  }

  return toSenderView(data as SenderRow);
}
