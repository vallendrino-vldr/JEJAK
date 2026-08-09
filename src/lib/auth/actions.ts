"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Hanya path internal yang boleh dipakai sebagai tujuan lanjutan. */
function tujuanAman(nilai: FormDataEntryValue | null) {
  const path = typeof nilai === "string" ? nilai : "";
  return path.startsWith("/") && !path.startsWith("//") ? path : "/beranda";
}

async function asalRequest() {
  const daftarHeader = await headers();
  const host = daftarHeader.get("x-forwarded-host") ?? daftarHeader.get("host");
  const protokol = daftarHeader.get("x-forwarded-proto") ?? "https";
  return `${protokol}://${host}`;
}

export async function masukDenganGoogle(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const lanjut = tujuanAman(formData.get("lanjut"));

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await asalRequest()}/auth/callback?lanjut=${encodeURIComponent(lanjut)}`,
    },
  });

  if (error || !data.url) {
    redirect("/masuk?galat=JX-2001");
  }

  redirect(data.url);
}

export async function keluar() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/masuk");
}
