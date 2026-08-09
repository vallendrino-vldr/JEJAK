/**
 * Opsi cookie bersama untuk semua client Supabase.
 *
 * `secure` dinyalakan di produksi supaya cookie sesi tidak pernah ikut terkirim
 * pada permintaan HTTP polos. `httpOnly` sengaja tidak dipakai: pustaka SSR
 * Supabase memang perlu membaca cookie ini dari browser untuk menyegarkan sesi,
 * jadi memaksanya akan mematikan alur login, bukan mengamankannya.
 *
 * `sameSite: "lax"` wajib untuk OAuth — cookie code verifier harus ikut terbawa
 * saat Google memulangkan pengguna ke `/auth/callback`.
 */
export const opsiCookieSupabase = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
} as const;
