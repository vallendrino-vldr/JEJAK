"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getClientEnv } from "@/lib/env/client";

// Hanya kunci publishable yang boleh sampai ke browser. Perlindungan datanya
// berasal dari RLS, bukan dari kunci ini.
export function createSupabaseBrowserClient() {
  const env = getClientEnv();

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
