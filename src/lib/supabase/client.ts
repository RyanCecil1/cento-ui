import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserSupabaseClient: SupabaseClient | null = null;

function getPublicSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { supabaseUrl, supabaseAnonKey };
}

// Public browser client for future anon-safe reads only.
// Workspace-owned tables must stay behind server helpers until explicit RLS policies exist.
export function createPublicBrowserSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("Browser Supabase client can only be created in the browser");
  }

  if (!browserSupabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getPublicSupabaseConfig();

    browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  return browserSupabaseClient;
}
