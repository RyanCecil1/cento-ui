import "server-only";

import { getSessionToken } from "@/lib/auth/app-session";
import {
  createRequestSupabaseAuthClient,
  createServerSupabaseClient,
} from "@/lib/supabase/server";

export async function getCurrentViewer() {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const authClient = createRequestSupabaseAuthClient(token);
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (error || !workspace) {
    return null;
  }

  return {
    token,
    user: {
      id: user.id,
      email: user.email ?? "",
      fullName: user.user_metadata.full_name ?? user.user_metadata.fullName ?? "",
      phoneNumber: user.phone ?? user.user_metadata.phone_number ?? "",
    },
    workspace: {
      id: workspace.id as string,
      name: workspace.name as string,
      timezone: workspace.timezone as string,
      verificationStatus: workspace.verification_status as string,
      primaryAudience:
        ((workspace as Record<string, unknown>).primary_audience as string | undefined) ??
        (user.user_metadata.workspace_profile?.primaryAudience as string | undefined) ??
        "",
      useCase:
        ((workspace as Record<string, unknown>).use_case as string | undefined) ??
        (user.user_metadata.workspace_profile?.useCase as string | undefined) ??
        "",
      senderMode:
        (((workspace as Record<string, unknown>).sender_mode as "shared" | "branded" | undefined) ??
          (user.user_metadata.workspace_profile?.senderMode as "shared" | "branded" | undefined) ??
          "shared"),
    },
  };
}
