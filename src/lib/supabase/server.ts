import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getClientEnv } from "@/lib/env/client";

/**
 * Client Supabase untuk Server Component, Server Action, dan Route Handler.
 *
 * Tetap memakai kunci publishable supaya setiap query lewat RLS sebagai user
 * yang sedang login. Kunci secret hanya boleh dipakai oleh alur server
 * terkontrol yang memang perlu melewati RLS (lihat docs/SCHEMA.md §127).
 */
export async function createSupabaseServerClient() {
  const env = getClientEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component tidak boleh menulis cookie. Middleware yang
            // menyegarkan session, jadi kondisi ini aman diabaikan.
          }
        },
      },
    },
  );
}
