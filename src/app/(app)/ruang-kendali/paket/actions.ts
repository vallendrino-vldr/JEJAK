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
    .regex(/^[a-z0-9_]+$/i),
  name: z.string().trim().min(1).max(100),
  price_idr: z.coerce.number().int().min(0).max(100_000_000),
  base_credits: z.coerce.number().int().min(0).max(1_000_000),
  bonus_credits: z.coerce.number().int().min(0).max(1_000_000),
  validity_days: z.coerce.number().int().min(1).max(3650),
  active: z.boolean(),
  badge_text: z.string().trim().max(40).optional(),
  display_order: z.coerce.number().int().min(0).max(9999),
});

/** Simpan/ubah paket kredit (butuh business.manage_pricing). */
export async function simpanPaketAction(formData: FormData): Promise<void> {
  const parsed = schema.safeParse({
    code: formData.get("code"),
    name: formData.get("name"),
    price_idr: formData.get("price_idr"),
    base_credits: formData.get("base_credits"),
    bonus_credits: formData.get("bonus_credits"),
    validity_days: formData.get("validity_days"),
    active: formData.get("active") === "on",
    badge_text: (formData.get("badge_text") as string) || undefined,
    display_order: formData.get("display_order") || 0,
  });
  if (!parsed.success) redirect("/ruang-kendali/paket?galat=input");
  const v = parsed.success ? parsed.data : null;
  if (!v) redirect("/ruang-kendali/paket?galat=input");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { error } = await supabase.rpc("simpan_paket", {
    p_code: v.code,
    p_name: v.name,
    p_price_idr: v.price_idr,
    p_base_credits: v.base_credits,
    p_bonus_credits: v.bonus_credits,
    p_validity_days: v.validity_days,
    p_active: v.active,
    p_badge_text: v.badge_text ?? null,
    p_display_order: v.display_order,
  });
  if (error) redirect("/ruang-kendali/paket?galat=simpan");

  revalidatePath("/ruang-kendali/paket");
  redirect("/ruang-kendali/paket?ok=1");
}
