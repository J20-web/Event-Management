import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
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
