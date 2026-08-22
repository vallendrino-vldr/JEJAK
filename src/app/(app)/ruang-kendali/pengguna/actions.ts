"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const uuidSchema = z.uuid();
const statusSchema = z.enum(["active", "observed", "limited", "paused", "blocked"]);

/** Ubah status akun pengguna (owner-only, dicek di fungsi DB). */
export async function ubahStatusAction(formData: FormData): Promise<void> {
  const id = uuidSchema.safeParse(formData.get("user_id"));
  const status = statusSchema.safeParse(formData.get("status"));
  if (!id.success || !status.success) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("ubah_status_pengguna", { p_user_id: id.data, p_status: status.data });
  revalidatePath("/ruang-kendali/pengguna");
}

/** Grant kredit ke pengguna (butuh credits.grant; idempoten per nonce). */
export async function beriKreditAction(formData: FormData): Promise<void> {
  const id = uuidSchema.safeParse(formData.get("user_id"));
  const kredit = z.coerce.number().int().min(1).max(100000).safeParse(formData.get("kredit"));
  const nonce = uuidSchema.safeParse(formData.get("nonce"));
  const alasan = z.string().trim().max(200).safeParse(formData.get("alasan"));
  if (!id.success || !kredit.success || !nonce.success) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.rpc("beri_kredit_pengguna", {
    p_user_id: id.data,
    p_credits: kredit.data,
    p_reason: alasan.success && alasan.data ? alasan.data : "admin grant",
    p_idempotency_key: nonce.data,
  });
  revalidatePath("/ruang-kendali/pengguna");
}
