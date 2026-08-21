import "server-only";

import { promises as dns } from "node:dns";

// Domain email sekali-pakai yang umum. Bukan daftar lengkap; sinyal, bukan vonis.
const DISPOSABLE = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
  "sharklasers.com",
  "mohmal.com",
  "emailondeck.com",
]);

// Local-part yang biasanya alamat peran/organisasi, bukan orang tertentu.
const ROLE_LOCAL = new Set([
  "admin",
  "administrator",
  "info",
  "support",
  "sales",
  "contact",
  "hello",
  "help",
  "noreply",
  "no-reply",
  "office",
  "team",
  "billing",
  "abuse",
  "postmaster",
  "webmaster",
  "service",
  "cs",
]);

function penyediaDariMx(host: string | null): string | null {
  if (!host) return null;
  const h = host.toLowerCase();
  if (h.includes("google")) return "Google (Gmail/Workspace)";
  if (h.includes("outlook") || h.includes("microsoft") || h.includes("hotmail")) return "Microsoft";
  if (h.includes("yahoodns") || h.includes("yahoo")) return "Yahoo";
  if (h.includes("zoho")) return "Zoho";
  if (h.includes("proton")) return "Proton";
  if (h.includes("mimecast")) return "Mimecast";
  if (h.includes("pphosted") || h.includes("proofpoint")) return "Proofpoint";
  if (h.includes("amazonaws") || h.includes("amazonses")) return "Amazon SES";
  if (h.includes("secureserver")) return "GoDaddy";
  return null;
}

export type CekEmail = {
  formatValid: boolean;
  domain: string | null;
  punyaMx: boolean | null;
  mxHost: string | null;
  penyedia: string | null;
  disposable: boolean;
  peran: boolean;
};

/**
 * Cek email lokal + lookup MX + sinyal ringan (disposable, akun peran, penyedia).
 *
 * DNS-only (bukan fetch URL) jadi bukan SSRF, timeout, gratis, di luar pipeline
 * kredit. Semua sinyal, bukan kesimpulan.
 */
export async function cekEmail(email: string): Promise<CekEmail> {
  const rapi = email.trim().toLowerCase();
  const m = rapi.match(/^([^\s@]+)@([^\s@]+\.[^\s@]+)$/);
  if (!m) {
    return {
      formatValid: false,
      domain: null,
      punyaMx: null,
      mxHost: null,
      penyedia: null,
      disposable: false,
      peran: false,
    };
  }

  const local = m[1];
  const domain = m[2];
  const disposable = DISPOSABLE.has(domain);
  const peran = ROLE_LOCAL.has(local);

  try {
    const mx = (await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
    ])) as { exchange: string; priority: number }[];

    const urut = mx.slice().sort((a, b) => a.priority - b.priority);
    const mxHost = urut[0]?.exchange ?? null;
    return {
      formatValid: true,
      domain,
      punyaMx: urut.length > 0,
      mxHost,
      penyedia: penyediaDariMx(mxHost),
      disposable,
      peran,
    };
  } catch (galat) {
    const code = (galat as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return {
        formatValid: true,
        domain,
        punyaMx: false,
        mxHost: null,
        penyedia: null,
        disposable,
        peran,
      };
    }
    return {
      formatValid: true,
      domain,
      punyaMx: null,
      mxHost: null,
      penyedia: null,
      disposable,
      peran,
    };
  }
}
