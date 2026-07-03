import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, isSupabaseConfigured } from "./env";

export function isSupabaseAdminConfigured() {
  return Boolean(isSupabaseConfigured() && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createSupabaseAdminClient() {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  return createClient(
    getSupabaseUrl(),
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
}
