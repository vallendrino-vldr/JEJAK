import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TargetInput = {
  type: string;
  displayValue: string;
  normalizedValueHmac?: string;
};

export type ScanResult = {
  scanId: string;
  publicRef: string;
  status: string;
};

/**
 * Memulai scan baru:
 * 1. Mendapatkan quote harga (MVP statis untuk sekarang, atau dari DB).
 * 2. Menyimpan scan dan targets.
 * 3. Melakukan reservasi kredit (FEFO).
 * 4. Mempersiapkan run untuk OSINT source aktif.
 */
export async function mulaiScan(
  userId: string,
  caseId: string | undefined,
  productCode: string,
  targets: TargetInput[],
  idempotencyKey: string,
): Promise<ScanResult> {
  const supabase = await createSupabaseServerClient();

  // 1. Dapatkan produk
  const { data: product, error: errProduct } = await supabase
    .from("scan_products")
    .select("id, base_credit_cost, version")
    .eq("code", productCode)
    .single();

  if (errProduct || !product) {
    throw new Error(`Produk scan tidak ditemukan: ${productCode}`);
  }

  // 2. Dapatkan wallet (opsional jika wallet_id dibutuhkan oleh RPC)
  const { data: wallet, error: errWallet } = await supabase
    .from("credit_wallets")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (errWallet || !wallet) {
    throw new Error(`Dompet tidak ditemukan untuk user.`);
  }

  // 3. Buat quote
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 jam berlaku

  const { data: quote, error: errQuote } = await supabase
    .from("scan_quotes")
    .insert({
      user_id: userId,
      case_id: caseId || null,
      scan_product_id: product.id,
      quoted_credit_cost: product.base_credit_cost,
      final_credit_cost: product.base_credit_cost,
      config_version: product.version,
      expires_at: expiresAt.toISOString(),
    })
    .select("id")
    .single();

  if (errQuote || !quote) {
    throw new Error(`Gagal membuat quote: ${errQuote?.message}`);
  }

  // 4. Buat scan
  const { data: scan, error: errScan } = await supabase
    .from("scans")
    .insert({
      user_id: userId,
      case_id: caseId || null,
      purpose: "self_check", // Default sementara
      product_code: productCode,
      quote_id: quote.id,
      status: "requested",
      idempotency_key: idempotencyKey,
    })
    .select("id, public_ref, status")
    .single();

  if (errScan || !scan) {
    throw new Error(`Gagal membuat data scan: ${errScan?.message}`);
  }

  // 5. Simpan targets
  if (targets.length > 0) {
    const targetPayloads = targets.map((t) => ({
      scan_id: scan.id,
      target_type: t.type,
      display_value_masked: t.displayValue,
      normalized_value_hmac: t.normalizedValueHmac || null,
    }));

    const { error: errTargets } = await supabase.from("scan_targets").insert(targetPayloads);

    if (errTargets) {
      throw new Error(`Gagal menyimpan target: ${errTargets.message}`);
    }
  }

  // 6. Reservasi Kredit (FEFO) via RPC
  const { data: reserveHoldId, error: errReserve } = await supabase.rpc("reserve_scan_credits", {
    p_user_id: userId,
    p_wallet_id: wallet.id,
    p_scan_id: scan.id,
    p_quote_id: quote.id,
    p_cost: product.base_credit_cost,
    p_idempotency_key: idempotencyKey + "_reserve",
  });

  if (errReserve || !reserveHoldId) {
    // Jika gagal, batalkan scan (idealnya pakai transaksi, tapi di Supabase RPC lebih aman)
    await supabase
      .from("scans")
      .update({ status: "failed", failure_reason_code: "insufficient_credits" })
      .eq("id", scan.id);
    throw new Error(`Saldo tidak mencukupi atau gagal hold: ${errReserve?.message}`);
  }

  // 7. Siapkan Source Runs
  // Ambil semua source aktif yang sesuai untuk MVP
  const { data: sources, error: errSources } = await supabase
    .from("source_registry")
    .select("id")
    .eq("status", "active");

  if (!errSources && sources && sources.length > 0) {
    const runs = sources.map((s) => ({
      scan_id: scan.id,
      source_id: s.id,
      status: "queued",
    }));

    await supabase.from("scan_source_runs").insert(runs);
  }

  // 8. Update scan status ke running (atau kembalikan sebagai credit_reserved dan trigger job runner)
  // Untuk vertikal slice, kita update ke running sebagai penanda mesin siap.
  await supabase
    .from("scans")
    .update({ status: "running", started_at: new Date().toISOString() })
    .eq("id", scan.id);

  scan.status = "running";

  return {
    scanId: scan.id,
    publicRef: scan.public_ref,
    status: scan.status,
  };
}
