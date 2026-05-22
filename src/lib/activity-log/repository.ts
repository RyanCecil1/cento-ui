import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";

export async function logActivity(workspaceId: string, actorUserId: string, action: string, entityId?: string | null) {
  const entry = {
    id: createDemoId("activity"),
    workspaceId,
    actorUserId,
    action,
    entityId: entityId ?? null,
    createdAt: new Date().toISOString(),
  };
  getDemoStore().activityLogs.unshift(entry);
  return entry;
}

