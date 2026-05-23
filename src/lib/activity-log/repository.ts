import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function logActivity(workspaceId: string, actorUserId: string, action: string, entityId?: string | null) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .insert({
      workspace_id: workspaceId,
      actor_user_id: actorUserId,
      entity_type: "workspace_event",
      entity_id: entityId ?? null,
      action,
      details: {},
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to write activity log");
  }

  return {
    id: data.id as string,
    workspaceId,
    actorUserId,
    action,
    entityId: entityId ?? null,
    createdAt: data.created_at as string,
  };
}
