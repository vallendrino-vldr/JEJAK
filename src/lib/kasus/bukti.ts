import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Bukti = {
  id: string;
  evidenceClass: string;
  sourceKind: string;
  sourceLocator: string;
  reliability: string;
  summary: string;
  observedAt: string;
  occurredAt: string | null;
  reverifiable: boolean;
  reverifyHint: string | null;
};

/**
 * Label kelas bukti.
 *
 * Urutannya bermakna dan tidak boleh diacak: makin ke bawah makin lemah
 * klaimnya. UI wajib menampilkan kelas ini, karena inilah yang menjaga
 * inferensi AI tidak terbaca setara fakta.
 */
export const KELAS_BUKTI: Record<string, { label: string; nada: string }> = {
  verified_fact: { label: "Fakta terverifikasi", nada: "kuat" },
  signal: { label: "Sinyal", nada: "sedang" },
  correlation: { label: "Korelasi", nada: "sedang" },
  ai_inference: { label: "Inferensi AI", nada: "lemah" },
  user_provided: { label: "Bukti dari lo", nada: "lemah" },
};

export const LABEL_SUMBER: Record<string, string> = {
  rdap: "Catatan domain (RDAP)",
  dns: "DNS",
  phone_format: "Format nomor",
  breach_index: "Indeks kebocoran",
  public_page: "Halaman publik",
  code_host: "Layanan kode",
  user_upload: "Unggahan lo",
  user_note: "Catatan lo",
  ai_analysis: "Analisis AI",
  internal_correlation: "Korelasi internal",
};

export const LABEL_KEANDALAN: Record<string, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
  unknown: "Belum dinilai",
};

export async function daftarBukti(caseId: string): Promise<Bukti[]> {
  const supabase = await createSupabaseServerClient();

  const { data } = await supabase
    .from("case_evidence")
    .select(
      "id, evidence_class, source_kind, source_locator, reliability, summary, observed_at, occurred_at, reverifiable, reverify_hint",
    )
    .eq("case_id", caseId)
    .order("observed_at", { ascending: false });

  return (data ?? []).map((baris) => ({
    id: baris.id,
    evidenceClass: baris.evidence_class,
    sourceKind: baris.source_kind,
    sourceLocator: baris.source_locator,
    reliability: baris.reliability,
    summary: baris.summary,
    observedAt: baris.observed_at,
    occurredAt: baris.occurred_at,
    reverifiable: baris.reverifiable,
    reverifyHint: baris.reverify_hint,
  }));
}

export async function linimasaKasus(caseId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("linimasa_kasus", { p_case_id: caseId });
  return data ?? [];
}
