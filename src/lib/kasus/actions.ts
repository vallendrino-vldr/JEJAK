"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deteksiIdentifier, type JenisIdentifier } from "@/lib/periksa/deteksi";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Jenis identifier di UI dipetakan ke enum entity_type di database. */
const KE_ENTITY_TYPE: Record<JenisIdentifier, string> = {
  email: "email",
  nomor_hp: "phone",
  domain: "domain",
  username: "username",
  nama: "person_name",
};

export type HasilAksi = { galat: string } | null;

export async function buatKasus(_sebelumnya: HasilAksi, formData: FormData): Promise<HasilAksi> {
  const judul = String(formData.get("judul") ?? "").trim();

  if (judul.length === 0) {
    return { galat: "Kasusnya perlu judul biar gampang lo kenali lagi." };
  }

  if (judul.length > 120) {
    return { galat: "Judulnya kepanjangan. Maksimal 120 karakter." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("buat_kasus", {
    p_judul: judul,
    p_purpose: String(formData.get("purpose") ?? "fraud_check"),
    p_rahasia: formData.get("rahasia") === "ya",
  });

  if (error || !data) {
    return { galat: "Kasusnya belum bisa dibuat. Coba lagi sebentar." };
  }

  revalidatePath("/kasus");
  redirect(`/kasus/${data}`);
}

export async function tambahPetunjuk(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  const caseId = String(formData.get("caseId") ?? "");
  const nilai = String(formData.get("nilai") ?? "").trim();

  const deteksi = deteksiIdentifier(nilai);

  if (!deteksi) {
    return { galat: "Isi dulu petunjuknya." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("tambah_petunjuk", {
    p_case_id: caseId,
    p_type: KE_ENTITY_TYPE[deteksi.jenis],
    p_nilai: deteksi.ternormalisasi,
    p_label: null,
  });

  if (error) {
    return { galat: "Petunjuknya belum bisa disimpan. Coba lagi sebentar." };
  }

  revalidatePath(`/kasus/${caseId}`);
  return null;
}

export async function hapusKasus(formData: FormData): Promise<void> {
  const caseId = String(formData.get("caseId") ?? "");
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("hapus_kasus", { p_case_id: caseId });
  revalidatePath("/kasus");
  redirect("/kasus");
}
