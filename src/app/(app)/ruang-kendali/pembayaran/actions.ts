"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const refSchema = z
  .string()
  .trim()
  .regex(/^TOP[A-Z0-9]{6,40}$/);
const alasanSchema = z.string().trim().max(200);

/** Setujui order top-up (grant kredit atomik). Izin dicek di fungsi DB. */
export async function setujuiAction(formData: FormData): Promise<void> {
  const ref = refSchema.safeParse(formData.get("ref"));
  if (!ref.success) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("approve_topup", {
    p_order_ref: ref.data,
    p_confirmed_amount: null,
    p_reason_code: "match",
    p_notes: null,
  });
  revalidatePath("/ruang-kendali/pembayaran");
}

/** Tolak order top-up (tanpa gerakan kredit). */
export async function tolakAction(formData: FormData): Promise<void> {
  const ref = refSchema.safeParse(formData.get("ref"));
  const alasan = alasanSchema.safeParse(formData.get("alasan"));
  if (!ref.success) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("reject_topup", {
    p_order_ref: ref.data,
    p_reason_code: alasan.success && alasan.data ? alasan.data : "ditolak",
    p_notes: null,
  });
  revalidatePath("/ruang-kendali/pembayaran");
}
