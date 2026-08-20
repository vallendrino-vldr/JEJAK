import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ScanTargetType =
  | "person_name"
  | "email"
  | "phone"
  | "username"
  | "domain"
  | "public_profile"
  | "business"
  | "event"
  | "other";

export type ScanResult = {
  scanId: string;
  publicRef: string;
  status: string;
  quotedCost: number;
};

export class ScanStartError extends Error {
  readonly code: "unsupported" | "invalid" | "unavailable" | "conflict";

  constructor(code: ScanStartError["code"]) {
    super(code);
    this.name = "ScanStartError";
    this.code = code;
  }
}

type ScanRpcRow = {
  scan_id: string;
  scan_ref: string;
  scan_status: string;
  quoted_cost: number;
};

/**
 * Membuat quote, scan, target terenkripsi, dan source plan melalui satu transaksi DB.
 * Browser tidak pernah menentukan harga final atau menulis tabel ledger langsung.
 */
export async function mulaiScan(input: {
  productCode: string;
  targetType: ScanTargetType;
  targetValue: string;
  idempotencyKey: string;
  caseId?: string;
}): Promise<ScanResult> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("mulai_scan", {
    p_product_code: input.productCode,
    p_target_type: input.targetType,
    p_target_value: input.targetValue,
    p_idempotency_key: input.idempotencyKey,
    p_case_id: input.caseId ?? null,
  });

  if (error) {
    if (error.code === "0A000") throw new ScanStartError("unsupported");
    if (error.code === "22023") throw new ScanStartError("invalid");
    if (error.code === "23505") throw new ScanStartError("conflict");
    throw new ScanStartError("unavailable");
  }

  const row = (Array.isArray(data) ? data[0] : data) as ScanRpcRow | null;
  if (!row) throw new ScanStartError("unavailable");

  return {
    scanId: row.scan_id,
    publicRef: row.scan_ref,
    status: row.scan_status,
    quotedCost: row.quoted_cost,
  };
}
