import "server-only";

import { createHash } from "node:crypto";
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
  gravatar: boolean | null;
  gravatarUrl: string | null;
};

type HasilMx = { punyaMx: boolean | null; mxHost: string | null; penyedia: string | null };

async function lookupMx(domain: string): Promise<HasilMx> {
  try {
    const mx = (await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3000)),
    ])) as { exchange: string; priority: number }[];

    const urut = mx.slice().sort((a, b) => a.priority - b.priority);
    const mxHost = urut[0]?.exchange ?? null;
    return { punyaMx: urut.length > 0, mxHost, penyedia: penyediaDariMx(mxHost) };
  } catch (galat) {
    const code = (galat as { code?: string }).code;
    if (code === "ENOTFOUND" || code === "ENODATA") {
      return { punyaMx: false, mxHost: null, penyedia: null };
    }
    return { punyaMx: null, mxHost: null, penyedia: null };
  }
}

/**
 * Cek keberadaan profil Gravatar dari hash email. Host tetap (gravatar.com),
 * bukan SSRF. 200 = ada profil publik (sinyal email dipakai + kadang ada akun
 * tertaut), 404 = tidak ada. Bukan bukti kepemilikan.
 */
async function cekGravatar(email: string): Promise<{ ada: boolean | null; url: string | null }> {
  const hash = createHash("md5").update(email).digest("hex");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`https://gravatar.com/${hash}.json`, {
      headers: {
        "User-Agent": "JEJAK/1.0 (+https://www.cekjejak.my.id)",
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.status === 200) return { ada: true, url: `https://gravatar.com/${hash}` };
    if (res.status === 404) return { ada: false, url: null };
    return { ada: null, url: null };
  } catch {
    return { ada: null, url: null };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Cek email: format + MX + Gravatar + sinyal ringan (disposable, peran,
 * penyedia). DNS/host tetap → bukan SSRF. Instan, gratis, di luar pipeline
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
      gravatar: null,
      gravatarUrl: null,
    };
  }

  const local = m[1];
  const domain = m[2];
  const [mx, grav] = await Promise.all([lookupMx(domain), cekGravatar(rapi)]);

  return {
    formatValid: true,
    domain,
    punyaMx: mx.punyaMx,
    mxHost: mx.mxHost,
    penyedia: mx.penyedia,
    disposable: DISPOSABLE.has(domain),
    peran: ROLE_LOCAL.has(local),
    gravatar: grav.ada,
    gravatarUrl: grav.url,
  };
}
