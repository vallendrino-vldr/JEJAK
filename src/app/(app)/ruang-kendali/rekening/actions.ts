"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9_]+$/i, "kode hanya huruf/angka/underscore"),
  display_name: z.string().trim().min(1).max(100),
  method_type: z.enum(["bank_transfer", "ewallet", "qris"]),
  institution_name: z.string().trim().min(1).max(100),
  account_number: z.string().trim().min(2).max(50),
  account_holder_name: z.string().trim().min(1).max(120),
  instructions: z.string().trim().max(500).optional(),
  is_primary: z.boolean(),
});

/** Simpan/ubah rekening (create/update by code). Izin dicek di fungsi DB. */
export async function simpanRekeningAction(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    code: formData.get("code"),
    display_name: formData.get("display_name"),
    method_type: formData.get("method_type"),
    institution_name: formData.get("institution_name"),
    account_number: formData.get("account_number"),
    account_holder_name: formData.get("account_holder_name"),
    instructions: (formData.get("instructions") as string) || undefined,
    is_primary: formData.get("is_primary") === "on",
  });
  if (!parsed.success) redirect("/ruang-kendali/rekening?galat=input");
  const v = parsed.success ? parsed.data : null;
  if (!v) redirect("/ruang-kendali/rekening?galat=input");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { error } = await supabase.rpc("simpan_rekening", {
    p_code: v.code,
    p_display_name: v.display_name,
    p_method_type: v.method_type,
    p_institution_name: v.institution_name,
    p_account_number: v.account_number,
    p_account_holder_name: v.account_holder_name,
    p_instructions: v.instructions ?? null,
    p_is_active: true,
    p_is_primary: v.is_primary,
    p_display_order: 0,
  });
  if (error) redirect("/ruang-kendali/rekening?galat=simpan");

  revalidatePath("/ruang-kendali/rekening");
  redirect("/ruang-kendali/rekening?ok=1");
}
