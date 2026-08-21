import "server-only";

import { promises as dns } from "node:dns";

export type CekEmail = {
  formatValid: boolean;
  domain: string | null;
  punyaMx: boolean | null; // null = tidak bisa dipastikan (timeout/galat jaringan)
  mxHost: string | null;
};

/**
 * Cek email lokal + lookup MX domainnya.
 *
 * Format + apakah domain menerima email. DNS-only (bukan fetch URL), jadi bukan
 * SSRF. Instan, gratis, di luar pipeline kredit. Punya timeout supaya tidak
 * menggantung halaman.
 */
export async function cekEmail(email: string): Promise<CekEmail> {
  const m = email
    .trim()
    .toLowerCase()
    .match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!m) return { formatValid: false, domain: null, punyaMx: null, mxHost: null };

  const domain = m[1];
  try {
    const mx = (await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
    ])) as { exchange: string; priority: number }[];

    const urut = mx.slice().sort((a, b) => a.priority - b.priority);
    return {
      formatValid: true,
      domain,
      punyaMx: urut.length > 0,
      mxHost: urut[0]?.exchange ?? null,
    };
  } catch (galat) {
    const code = (galat as { code?: string }).code;
    // Domain tidak ada / tidak punya MX = sinyal nyata (domain palsu/salah ketik).
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { formatValid: true, domain, punyaMx: false, mxHost: null };
    }
    // Timeout / galat lain: jujur tidak tahu.
    return { formatValid: true, domain, punyaMx: null, mxHost: null };
  }
}
