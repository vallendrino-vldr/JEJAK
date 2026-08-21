import "server-only";

export type CekUsername = {
  github: boolean | null;
  githubUrl: string | null;
  githubNama: string | null;
  githubRepo: number | null;
  githubPengikut: number | null;
  githubSejak: string | null;
  gitlab: boolean | null;
  gitlabUrl: string | null;
};

const KOSONG: CekUsername = {
  github: null,
  githubUrl: null,
  githubNama: null,
  githubRepo: null,
  githubPengikut: null,
  githubSejak: null,
  gitlab: null,
  gitlabUrl: null,
};

async function ambil(url: string): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3500);
  try {
    return await fetch(url, {
      headers: { "User-Agent": "JEJAK", Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Cek keberadaan handle di GitHub & GitLab lewat API publik resmi.
 *
 * Host tetap (api.github.com, gitlab.com), segmen dinamis di-encode — bukan
 * SSRF. Instan, gratis, di luar pipeline kredit. Handle sama BUKAN bukti orang
 * yang sama.
 */
export async function cekUsername(handle: string): Promise<CekUsername> {
  const bersih = handle.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,38})$/.test(bersih)) return KOSONG;

  const enc = encodeURIComponent(bersih);
  const [gh, gl] = await Promise.all([
    ambil(`https://api.github.com/users/${enc}`),
    ambil(`https://gitlab.com/api/v4/users?username=${enc}`),
  ]);

  const hasil: CekUsername = { ...KOSONG };

  if (gh) {
    if (gh.status === 200) {
      hasil.github = true;
      hasil.githubUrl = `https://github.com/${bersih}`;
      try {
        const d = (await gh.json()) as {
          name?: string;
          public_repos?: number;
          followers?: number;
          created_at?: string;
        };
        hasil.githubNama = d.name ?? null;
        hasil.githubRepo = typeof d.public_repos === "number" ? d.public_repos : null;
        hasil.githubPengikut = typeof d.followers === "number" ? d.followers : null;
        hasil.githubSejak = d.created_at ? d.created_at.slice(0, 4) : null;
      } catch {
        // biarkan detail null
      }
    } else if (gh.status === 404) {
      hasil.github = false;
    }
  }

  if (gl) {
    if (gl.status === 200) {
      try {
        const arr = (await gl.json()) as { web_url?: string }[];
        if (Array.isArray(arr) && arr.length > 0) {
          hasil.gitlab = true;
          hasil.gitlabUrl = arr[0].web_url ?? `https://gitlab.com/${bersih}`;
        } else {
          hasil.gitlab = false;
        }
      } catch {
        hasil.gitlab = null;
      }
    }
  }

  return hasil;
}
