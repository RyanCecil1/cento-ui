import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";

export async function listSenderIds(workspaceId: string) {
  return getDemoStore().senderIds.filter((sender) => sender.workspaceId === workspaceId);
}

export async function createSenderIdRequest(workspaceId: string, input: { name: string; note: string }) {
  const sender = {
    id: createDemoId("sender"),
    workspaceId,
    name: input.name.toUpperCase(),
    status: "draft" as const,
    note: input.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  getDemoStore().senderIds.unshift(sender);
  return sender;
}

