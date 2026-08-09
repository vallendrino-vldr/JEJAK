import "server-only";

import { headers } from "next/headers";

/** Domain produksi resmi Jejak. Apex `cekjejak.my.id` dialihkan ke sini. */
export const ASAL_PRODUKSI = "https://www.cekjejak.my.id";

/**
 * Origin yang dipakai untuk membangun URL redirect OAuth.
 *
 * Di produksi nilainya dipatok ke domain kanonik, bukan diambil dari header
 * request. Header `Host`/`X-Forwarded-Host` berasal dari klien, jadi kalau
 * dipercaya bulat-bulat ia bisa dipakai mengarahkan alur login ke domain lain.
 * Di luar produksi origin tetap diturunkan dari request supaya localhost dan
 * preview jalan tanpa konfigurasi tambahan.
 */
export async function asalKanonik() {
  if (process.env.VERCEL_ENV === "production") {
    return ASAL_PRODUKSI;
  }

  const daftarHeader = await headers();
  const host = daftarHeader.get("x-forwarded-host") ?? daftarHeader.get("host");

  if (!host) {
    return ASAL_PRODUKSI;
  }

  const protokol =
    daftarHeader.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return `${protokol}://${host}`;
}
