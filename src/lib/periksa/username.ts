import "server-only";

export type CekUsername = {
  github: boolean | null; // null = tidak bisa dipastikan
  githubUrl: string | null;
};

/**
 * Cek keberadaan username di GitHub lewat API publik resmi.
 *
 * Host tetap (api.github.com), hanya segmen path yang dari input dan
 * di-encode — bukan SSRF. Instan, gratis, di luar pipeline kredit. Ini sinyal
 * "handle ini dipakai di GitHub", BUKAN bukti orang yang sama.
 */
export async function cekUsername(handle: string): Promise<CekUsername> {
  const bersih = handle.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(bersih)) {
    return { github: null, githubUrl: null };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(bersih)}`, {
      headers: { "User-Agent": "JEJAK", Accept: "application/vnd.github+json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (res.status === 200) return { github: true, githubUrl: `https://github.com/${bersih}` };
    if (res.status === 404) return { github: false, githubUrl: null };
    return { github: null, githubUrl: null };
  } catch {
    return { github: null, githubUrl: null };
  } finally {
    clearTimeout(timer);
  }
}
