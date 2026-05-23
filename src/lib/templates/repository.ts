import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type TemplateRow = {
  id: string;
  workspace_id: string;
  name: string;
  body: string;
  variables: string[];
  fallback_values: {
    firstName?: string;
    lastName?: string;
  } | null;
  template_type: "starter" | "custom";
  created_at: string;
  updated_at: string;
};

function toTemplateView(row: TemplateRow) {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    body: row.body,
    source: row.template_type,
    variables: row.variables ?? [],
    fallbackFirstName: row.fallback_values?.firstName ?? "Customer",
    fallbackLastName: row.fallback_values?.lastName ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listTemplates(workspaceId: string) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to list templates");
  }

  return ((data ?? []) as TemplateRow[]).map(toTemplateView);
}

export async function createTemplate(workspaceId: string, input: {
  name: string;
  body: string;
  variables?: string[];
  fallbackFirstName?: string;
  fallbackLastName?: string;
}) {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("templates")
    .insert({
      workspace_id: workspaceId,
      name: input.name,
      body: input.body,
      variables: input.variables ?? [],
      fallback_values: {
        firstName: input.fallbackFirstName ?? "Customer",
        lastName: input.fallbackLastName ?? "",
      },
      template_type: "custom",
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error("Unable to create template");
  }

  return toTemplateView(data as TemplateRow);
}
