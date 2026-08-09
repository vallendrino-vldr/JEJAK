"use server";

import { revalidatePath } from "next/cache";
import type { HasilAksi } from "@/lib/kasus/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Mencatat bukti yang berasal dari pengguna sendiri.
 *
 * Kelasnya dipatok `user_provided` di server, bukan diambil dari form: pengguna
 * tidak boleh menandai catatannya sendiri sebagai fakta terverifikasi.
 */
export async function catatBuktiPengguna(
  _sebelumnya: HasilAksi,
  formData: FormData,
): Promise<HasilAksi> {
  const caseId = String(formData.get("caseId") ?? "");
  const ringkasan = String(formData.get("ringkasan") ?? "").trim();
  const asal = String(formData.get("asal") ?? "").trim();

  if (ringkasan.length === 0) {
    return { galat: "Tulis dulu apa yang lo temukan." };
  }

  if (asal.length === 0) {
    return { galat: "Sebutin dari mana lo dapat ini. Bukti tanpa sumber nggak bisa dipakai." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("catat_bukti", {
    p_case_id: caseId,
    p_class: "user_provided",
    p_source_kind: "user_note",
    p_source_locator: asal,
    p_summary: ringkasan,
    p_reliability: "unknown",
  });

  if (error) {
    return { galat: "Buktinya belum bisa disimpan. Coba lagi sebentar." };
  }

  revalidatePath(`/kasus/${caseId}`);
  return null;
}
