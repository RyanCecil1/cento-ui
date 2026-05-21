import "server-only";

import { headers } from "next/headers";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function readAccessToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  const accessToken = authorizationHeader.slice("Bearer ".length).trim();
  return accessToken.length > 0 ? accessToken : null;
}

export async function requireOwnerSession() {
  const requestHeaders = await headers();
  const accessToken = readAccessToken(requestHeaders.get("authorization"));

  if (!accessToken) {
    throw new Error("Authentication required");
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new Error("Authentication required");
  }

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, verification_status")
    .eq("owner_user_id", user.id)
    .single();

  if (workspaceError || !workspace) {
    throw new Error("Owner workspace not found");
  }

  return {
    userId: user.id,
    workspaceId: workspace.id,
    verificationStatus: workspace.verification_status,
  };
}
