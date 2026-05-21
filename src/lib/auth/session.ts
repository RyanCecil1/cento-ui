import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function requireOwnerSession() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required");
  }

  return { userId: user.id };
}
