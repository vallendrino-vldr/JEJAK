import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SesiPengguna = {
  userId: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  accountStatus: string;
  roleCodes: string[];
};

/**
 * Membaca identitas pengguna dari server.
 *
 * Peran diambil dari database, bukan dari klaim JWT, supaya pencabutan peran
 * langsung berlaku dan tidak menunggu token lama kedaluwarsa
 * (docs/SCHEMA.md §5.5).
 */
export async function bacaSesiPengguna(): Promise<SesiPengguna | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: profile }, { data: roleRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, display_name, avatar_url, account_status")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_roles").select("roles(code)").eq("status", "active"),
  ]);

  if (!profile) {
    return null;
  }

  const roleCodes = (roleRows ?? [])
    .flatMap((row) => (Array.isArray(row.roles) ? row.roles : [row.roles]))
    .map((role) => (role as { code?: string } | null)?.code)
    .filter((code): code is string => Boolean(code));

  return {
    userId: user.id,
    email: profile.email,
    displayName: profile.display_name,
    avatarUrl: profile.avatar_url,
    accountStatus: profile.account_status,
    roleCodes,
  };
}
