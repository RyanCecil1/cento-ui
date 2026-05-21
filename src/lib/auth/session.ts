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

  return { userId: user.id };
}
