import "server-only";

import { createRequestSupabaseAuthClient } from "@/lib/supabase/server";

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
