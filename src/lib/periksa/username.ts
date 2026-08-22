import "server-only";

/**
 * Cek keberadaan handle di banyak layanan publik lewat API resmi/keyless.
 *
 * Host tetap per platform (bukan URL dari user) → bukan SSRF. Instan, gratis, di
 * luar pipeline kredit. Tiap platform degrade jujur: kalau ke-block/rate-limit,
 * `ada = null` ("belum bisa dipastikan"), bukan nebak. Handle sama di banyak
 * tempat adalah SINYAL keterkaitan, BUKAN bukti orang yang sama.
 */

export type PlatformHit = {
  platform: string;
  ada: boolean | null;
  url: string | null;
  catatan: string | null;
};

export type CekUsername = {
  handle: string;
  platform: PlatformHit[];
  ditemukan: number;
  diperiksa: number;
};

const UA = "JEJAK/1.0 (+https://www.cekjejak.my.id)";

async function ambilJson(
  url: string,
  timeoutMs = 4000,
): Promise<{ status: number; json: unknown } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
      redirect: "follow",
    });
    let json: unknown = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    return { status: res.status, json };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}
function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

type Checker = (enc: string, bersih: string) => Promise<PlatformHit>;

const cekGithub: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://api.github.com/users/${enc}`);
  if (!r) return { platform: "GitHub", ada: null, url: null, catatan: null };
  if (r.status === 404) return { platform: "GitHub", ada: false, url: null, catatan: null };
  if (r.status === 200) {
    const d = obj(r.json) ?? {};
    const bits = [
      typeof d.name === "string" && d.name ? d.name : null,
      num(d.public_repos) !== null ? `${num(d.public_repos)} repo` : null,
      num(d.followers) !== null ? `${num(d.followers)} pengikut` : null,
      typeof d.created_at === "string" ? `sejak ${d.created_at.slice(0, 4)}` : null,
    ].filter(Boolean);
    return {
      platform: "GitHub",
      ada: true,
      url: `https://github.com/${bersih}`,
      catatan: bits.join(" · ") || null,
    };
  }
  return { platform: "GitHub", ada: null, url: null, catatan: null };
};

const cekGitlab: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://gitlab.com/api/v4/users?username=${enc}`);
  if (!r) return { platform: "GitLab", ada: null, url: null, catatan: null };
  if (r.status === 200 && Array.isArray(r.json)) {
    if (r.json.length > 0) {
      const first = obj(r.json[0]);
      const url = (first && typeof first.web_url === "string" && first.web_url) || null;
      return {
        platform: "GitLab",
        ada: true,
        url: url ?? `https://gitlab.com/${bersih}`,
        catatan: null,
      };
    }
    return { platform: "GitLab", ada: false, url: null, catatan: null };
  }
  return { platform: "GitLab", ada: null, url: null, catatan: null };
};

const cekDockerHub: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://hub.docker.com/v2/users/${enc}/`);
  if (!r) return { platform: "Docker Hub", ada: null, url: null, catatan: null };
  if (r.status === 200) {
    return {
      platform: "Docker Hub",
      ada: true,
      url: `https://hub.docker.com/u/${bersih}`,
      catatan: null,
    };
  }
  if (r.status === 404) return { platform: "Docker Hub", ada: false, url: null, catatan: null };
  return { platform: "Docker Hub", ada: null, url: null, catatan: null };
};

const cekKeybase: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${enc}`);
  if (!r || r.status !== 200) return { platform: "Keybase", ada: null, url: null, catatan: null };
  const d = obj(r.json);
  const them = d?.them;
  const ada = Array.isArray(them) ? them.length > 0 && them[0] !== null : false;
  return {
    platform: "Keybase",
    ada,
    url: ada ? `https://keybase.io/${bersih}` : null,
    catatan: null,
  };
};

const cekHackerNews: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://hacker-news.firebaseio.com/v0/user/${enc}.json`);
  if (!r || r.status !== 200)
    return { platform: "Hacker News", ada: null, url: null, catatan: null };
  const d = obj(r.json);
  if (!d) return { platform: "Hacker News", ada: false, url: null, catatan: null };
  const karma = num(d.karma);
  return {
    platform: "Hacker News",
    ada: true,
    url: `https://news.ycombinator.com/user?id=${bersih}`,
    catatan: karma !== null ? `${karma} karma` : null,
  };
};

const cekDevTo: Checker = async (enc, bersih) => {
  const r = await ambilJson(`https://dev.to/api/users/by_username?url=${enc}`);
  if (!r) return { platform: "Dev.to", ada: null, url: null, catatan: null };
  if (r.status === 200 && obj(r.json)) {
    return { platform: "Dev.to", ada: true, url: `https://dev.to/${bersih}`, catatan: null };
  }
  if (r.status === 404) return { platform: "Dev.to", ada: false, url: null, catatan: null };
  return { platform: "Dev.to", ada: null, url: null, catatan: null };
};

const CHECKERS: Checker[] = [
  cekGithub,
  cekGitlab,
  cekDockerHub,
  cekKeybase,
  cekHackerNews,
  cekDevTo,
];

export async function cekUsername(handle: string): Promise<CekUsername> {
  const bersih = handle.trim().replace(/^@/, "");
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9_.-]{0,38})$/.test(bersih)) {
    return { handle: bersih, platform: [], ditemukan: 0, diperiksa: 0 };
  }

  const enc = encodeURIComponent(bersih);
  const platform = await Promise.all(CHECKERS.map((c) => c(enc, bersih)));
  const ditemukan = platform.filter((p) => p.ada === true).length;
  const diperiksa = platform.filter((p) => p.ada !== null).length;
  return { handle: bersih, platform, ditemukan, diperiksa };
}
