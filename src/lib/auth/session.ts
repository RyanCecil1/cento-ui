import "server-only";

import {
  createRequestSupabaseAuthClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";

export async function requireOwnerSession(accessToken: string) {
  if (!accessToken.trim()) {
    throw new Error("Authentication required");
  }

  const supabase = createRequestSupabaseAuthClient(accessToken);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return { userId: user.id };
}

export async function requireOwnerWorkspaceContext(accessToken: string) {
  const { userId } = await requireOwnerSession(accessToken);
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, verification_status")
    .eq("owner_user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Workspace access denied");
  }

  return {
    userId,
    workspaceId: data.id,
    verificationStatus: data.verification_status,
  };
}
