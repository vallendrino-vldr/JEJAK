import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server";

/**
 * Client berprivilege tinggi khusus workflow internal.
 *
 * Jangan teruskan instance atau hasil query sensitifnya ke browser. Boundary
 * mutasi tetap berupa RPC sempit dengan EXECUTE hanya untuk service_role.
 */
export function createSupabaseAdminClient() {
  const env = getServerEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
