import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RingkasanKasus = {
  id: string;
  publicRef: string;
  title: string;
  purpose: string;
  isSecret: boolean;
  lastActivityAt: string;
  jumlahPetunjuk: number;
};

export type PetunjukKasus = {
  id: string;
  entityType: string;
  label: string | null;
  displayValueMasked: string;
  createdAt: string;
};

export const LABEL_TUJUAN: Record<string, string> = {
  self_check: "Cek data sendiri",
  assisted_check: "Bantu orang terdekat",
  fraud_check: "Dugaan penipuan",
  public_research: "Riset publik",
  mitra_client: "Klien mitra",
};

export const LABEL_ENTITAS: Record<string, string> = {
  email: "Email",
  phone: "Nomor HP",
  domain: "Domain",
  username: "Username",
  person_name: "Nama",
  public_profile: "Profil publik",
  business: "Usaha",
  event: "Kejadian",
  other: "Lainnya",
};

/**
 * Daftar kasus milik pengguna.
 *
 * Tidak ada filter pemilik di query ini dan itu memang disengaja: RLS yang
 * menentukan baris mana yang terlihat, jadi kesalahan di sini tidak bisa
 * membocorkan kasus orang lain.
 */
export async function daftarKasus(): Promise<RingkasanKasus[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("cases")
    .select("id, public_ref, title, purpose, is_secret, last_activity_at, case_entities(count)")
    .eq("status", "active")
    .order("last_activity_at", { ascending: false });

  return (data ?? []).map((baris) => ({
    id: baris.id,
    publicRef: baris.public_ref,
    title: baris.title,
    purpose: baris.purpose,
    isSecret: baris.is_secret,
    lastActivityAt: baris.last_activity_at,
    jumlahPetunjuk: (baris.case_entities as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));
}

export async function bacaKasus(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data: kasus } = await supabase
    .from("cases")
    .select("id, public_ref, title, purpose, is_secret, status, created_at, last_activity_at")
    .eq("id", id)
    .maybeSingle();

  if (!kasus) return null;

  const { data: petunjuk } = await supabase
    .from("case_entities")
    .select("id, entity_type, label, display_value_masked, created_at")
    .eq("case_id", id)
    .is("merged_into_entity_id", null)
    .order("created_at", { ascending: false });

  return {
    kasus,
    petunjuk: (petunjuk ?? []).map((baris): PetunjukKasus => ({
      id: baris.id,
      entityType: baris.entity_type,
      label: baris.label,
      displayValueMasked: baris.display_value_masked,
      createdAt: baris.created_at,
    })),
  };
}
