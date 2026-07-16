import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
// Clean URL in case it has /rest/v1/ or /rest/v1 appended
const cleanUrl = rawUrl.includes("/rest/v1/")
  ? rawUrl.split("/rest/v1/")[0]
  : rawUrl.includes("/rest/v1")
  ? rawUrl.split("/rest/v1")[0]
  : rawUrl;

export const supabaseUrl = cleanUrl.endsWith("/") ? cleanUrl.slice(0, -1) : cleanUrl;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

// Helper to determine if we have a real, configured Supabase backend.
export const isSupabaseConfigured =
  Boolean(supabaseUrl) &&
  supabaseUrl !== "MY_SUPABASE_URL" &&
  Boolean(supabaseAnonKey) &&
  supabaseAnonKey !== "MY_SUPABASE_ANON_KEY";

// Safe dynamic initialization. Does not crash the application if missing.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
