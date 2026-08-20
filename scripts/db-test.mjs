import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const cliSupabase = join(dirname(require.resolve("supabase/package.json")), "dist", "supabase.js");

/**
 * Menjalankan seluruh suite invariant SQL di supabase/tests.
 *
 * Target canonical selalu dibaca dari `.env.local`. `JEJAK_DB_URL` boleh
 * dipakai oleh runner terisolasi yang membawa file env itu; lokal juga bisa
 * memakai project yang sudah di-link ke Supabase CLI. Kegagalan dilaporkan
 * tanpa credential.
 */
const DIR = "supabase/tests";

function canonicalProjectRef() {
  if (!existsSync(".env.local")) {
    throw new Error(".env.local tidak ada; target database tidak bisa diverifikasi.");
  }

  const urlLine = readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .find((line) => line.trimStart().startsWith("NEXT_PUBLIC_SUPABASE_URL="));
  const projectUrl = urlLine?.split("=", 2)[1]?.trim();
  const parsed = projectUrl ? new URL(projectUrl) : null;
  const hostMatch = parsed?.hostname.match(/^([a-z0-9]{20})\.supabase\.co$/);
  const ref = hostMatch?.[1] ?? "";

  if (
    !parsed ||
    parsed.protocol !== "https:" ||
    parsed.port !== "" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.pathname !== "/" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    !/^[a-z0-9]{20}$/.test(ref)
  ) {
    throw new Error("Project ref canonical di .env.local tidak valid.");
  }

  return ref;
}

function projectRefFromDbUrl(dbUrl) {
  let parsed;
  let decodedUsername;
  try {
    parsed = new URL(dbUrl);
    decodedUsername = decodeURIComponent(parsed.username);
  } catch {
    return "";
  }
  const directHost = parsed.hostname.match(/^db\.([a-z0-9]{20})\.supabase\.co$/);
  const poolerHost = /^aws-[0-9]+-[a-z0-9-]+\.pooler\.supabase\.com$/.test(parsed.hostname);
  const poolerUser = decodedUsername.match(/^postgres\.([a-z0-9]{20})$/);

  const commonValid =
    ["postgres:", "postgresql:"].includes(parsed.protocol) &&
    parsed.password !== "" &&
    parsed.pathname === "/postgres" &&
    parsed.search === "" &&
    parsed.hash === "";
  const directValid =
    commonValid &&
    Boolean(directHost) &&
    decodedUsername === "postgres" &&
    ["", "5432"].includes(parsed.port);
  const poolerValid =
    commonValid && poolerHost && Boolean(poolerUser) && ["5432", "6543"].includes(parsed.port);

  if (directValid) {
    return directHost?.[1] ?? "";
  }

  if (poolerValid) {
    return poolerUser?.[1] ?? "";
  }

  return "";
}

function connectionArguments() {
  const canonicalRef = canonicalProjectRef();

  if (process.env.JEJAK_DB_URL) {
    const databaseRef = projectRefFromDbUrl(process.env.JEJAK_DB_URL);
    if (databaseRef !== canonicalRef) {
      throw new Error(
        `JEJAK_DB_URL menunjuk ref ${databaseRef || "tak dikenal"}, bukan target canonical ${canonicalRef}.`,
      );
    }

    return ["--db-url", process.env.JEJAK_DB_URL, "--agent", "no"];
  }

  const linkPath = "supabase/.temp/project-ref";
  if (!existsSync(linkPath)) {
    throw new Error(
      "Supabase CLI belum ditautkan ke target canonical. Set JEJAK_DB_URL atau link project yang benar.",
    );
  }

  const linkedRef = readFileSync(linkPath, "utf8").trim();
  if (linkedRef !== canonicalRef) {
    throw new Error(`CLI tertaut ke ref ${linkedRef}, bukan target canonical ${canonicalRef}.`);
  }

  return ["--linked", "--agent", "no"];
}

function sanitizeCliMessage(message) {
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s"'`]+/gi, "<database-url-redacted>")
    .replace(/sb_(?:secret|publishable)_[A-Za-z0-9_-]+/g, "<api-key-redacted>")
    .replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, "<jwt-redacted>");
}

const connectionArgs = connectionArguments();
const berkas = readdirSync(DIR)
  .filter((nama) => nama.endsWith(".sql"))
  .sort();

let gagal = 0;

for (const nama of berkas) {
  try {
    // Dijalankan lewat entri JS CLI, bukan lewat shim .cmd dan tanpa `shell`.
    // Connection string berisi kata sandi, jadi ia tidak boleh melewati shell
    // yang menggabungkan argumen tanpa escaping.
    execFileSync(
      process.execPath,
      [cliSupabase, "db", "query", ...connectionArgs, "-f", `${DIR}/${nama}`],
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    );
    console.log(`LULUS  ${nama}`);
  } catch (galat) {
    gagal += 1;
    const keluaran = `${galat.stdout ?? ""}${galat.stderr ?? ""}`;
    // Pesan Postgres memuat tanda kutip yang di-escape, jadi dibaca sebagai JSON
    // alih-alih dipotong regex sederhana.
    const mentah = keluaran.match(/\{"_tag":"Error".*\}/s)?.[0];
    let pesan = "gagal tanpa pesan";

    try {
      pesan = mentah ? (JSON.parse(mentah).error?.message ?? pesan) : pesan;
    } catch {
      pesan = "detail CLI disembunyikan agar credential tidak bocor";
    }
    pesan = sanitizeCliMessage(String(pesan));
    console.error(`GAGAL  ${nama}: ${pesan}`);
  }
}

if (gagal > 0) {
  console.error(`${gagal} dari ${berkas.length} suite SQL gagal.`);
  process.exit(1);
}

console.log(`${berkas.length} suite SQL lulus.`);
