import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { tujuanAman } from "@/lib/auth/tujuan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { asalKanonik } from "@/lib/url/origin";

/**
 * Titik mulai login Google.
 *
 * Sengaja berupa GET yang dibuka lewat tautan biasa, bukan form POST. Header
 * keamanan kita memasang `form-action 'self'`, dan browser ikut menerapkannya
 * pada redirect hasil submit form — artinya form POST yang berujung ke
 * accounts.google.com akan diblokir. Navigasi tautan tidak kena aturan itu.
 */
export async function GET(request: NextRequest) {
  const lanjut = tujuanAman(request.nextUrl.searchParams.get("lanjut"));
  const asal = await asalKanonik();

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${asal}/auth/callback?lanjut=${encodeURIComponent(lanjut)}`,
    },
  });

  if (error || !data.url) {
    redirect("/masuk?galat=JX-2001");
  }

  redirect(data.url);
}
