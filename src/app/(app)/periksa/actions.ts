"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mulaiScan } from "@/lib/scan/engine";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";

export async function actionMulaiPemeriksaan(formData: FormData) {
  const masukan = formData.get("masukan") as string;
  const jenis = formData.get("jenis") as string;

  if (!masukan || !jenis) {
    throw new Error("Target tidak valid");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/masuk");
  }

  const idempotencyKey = randomUUID(); // Sederhananya pakai random UUID. Di production client kirim nonce.
  const targets = [{ type: jenis, displayValue: masukan }];

  const result = await mulaiScan(user.id, undefined, "quick_check", targets, idempotencyKey);

  redirect(`/periksa/${result.publicRef}`);
}
