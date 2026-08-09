/**
 * Hanya path internal yang boleh dipakai sebagai tujuan lanjutan setelah login.
 *
 * Menolak URL absolut (`https://jahat.test`), protocol-relative (`//jahat.test`),
 * dan backslash yang sebagian browser perlakukan seperti garis miring
 * (`/\jahat.test`). Tanpa penjagaan ini, parameter `lanjut` jadi open redirect.
 */
export function tujuanAman(nilai: unknown, bawaan = "/beranda") {
  if (typeof nilai !== "string" || nilai.length === 0) {
    return bawaan;
  }

  const sudahDinormalkan = nilai.replaceAll("\\", "/");

  if (!sudahDinormalkan.startsWith("/") || sudahDinormalkan.startsWith("//")) {
    return bawaan;
  }

  return sudahDinormalkan;
}
