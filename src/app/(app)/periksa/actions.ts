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

  // Privacy audit: Mask display value & hash the real value
  let displayValueMasked = masukan;
  if (jenis === "email" && masukan.includes("@")) {
    const [name, dom] = masukan.split("@");
    displayValueMasked = `${name.slice(0, 2)}***@${dom}`;
  } else if (jenis === "nomor_hp") {
    displayValueMasked = masukan.slice(0, 4) + "***" + masukan.slice(-2);
  }

  // Sebaiknya pakai HMAC dengan key rahasia, untuk sekarang hash SHA-256 dasar
  const encoder = new TextEncoder();
  const dataBuf = encoder.encode(masukan + process.env.SUPABASE_SECRET_KEY);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuf);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const normalizedValueHmac = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  const targets = [{ type: jenis, displayValue: displayValueMasked, normalizedValueHmac }];

  const result = await mulaiScan(user.id, undefined, "quick_check", targets, idempotencyKey);

  redirect(`/periksa/${result.publicRef}`);
}
