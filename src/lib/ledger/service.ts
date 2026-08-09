import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DompetInfo = {
  id: string;
  tersedia: number;
  dicadangkan: number;
};

export type RiwayatKredit = {
  id: string;
  jenis: string;
  deltaTersedia: number;
  deltaDicadangkan: number;
  tanggal: string;
  referensi: string | null;
};

/**
 * Mengambil ringkasan dompet pengguna yang sedang masuk.
 */
export async function bacaDompetPengguna(): Promise<DompetInfo | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("credit_wallets")
    .select("id, available_cached, reserved_cached")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    tersedia: data.available_cached,
    dicadangkan: data.reserved_cached,
  };
}

/**
 * Mengambil riwayat mutasi kredit.
 */
export async function bacaRiwayatKredit(walletId: string, limit = 10): Promise<RiwayatKredit[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("credit_transactions")
    .select("id, transaction_type, delta_available, delta_reserved, reference_type, created_at")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map(
    (tx: {
      id: string;
      transaction_type: string;
      delta_available: number;
      delta_reserved: number;
      created_at: string;
      reference_type: string | null;
    }) => ({
      id: tx.id,
      jenis: tx.transaction_type,
      deltaTersedia: tx.delta_available,
      deltaDicadangkan: tx.delta_reserved,
      tanggal: tx.created_at,
      referensi: tx.reference_type,
    }),
  );
}
