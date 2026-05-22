import "server-only";

import { createDemoId, getDemoStore } from "@/lib/demo/store";

export async function listTemplates(workspaceId: string) {
  return getDemoStore().templates.filter((template) => template.workspaceId === workspaceId);
}

export async function createTemplate(workspaceId: string, input: {
  name: string;
  body: string;
  variables?: string[];
  fallbackFirstName?: string;
  fallbackLastName?: string;
}) {
  const template = {
    id: createDemoId("template"),
    workspaceId,
    name: input.name,
    body: input.body,
    source: "custom" as const,
    variables: input.variables ?? [],
    fallbackFirstName: input.fallbackFirstName ?? "Customer",
    fallbackLastName: input.fallbackLastName ?? "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  getDemoStore().templates.unshift(template);
  return template;
}

