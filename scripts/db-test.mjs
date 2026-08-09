import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const cliSupabase = join(dirname(require.resolve("supabase/package.json")), "dist", "supabase.js");

/**
 * Menjalankan seluruh suite invariant SQL di supabase/tests.
 *
 * Connection string diambil dari env `JEJAK_DB_URL` bila ada; kalau tidak,
 * dirakit dari `JEJAK.md` lokal. Nilainya tidak pernah dicetak — kegagalan
 * dilaporkan lewat nama berkas dan pesan dari Postgres saja.
 */
const DIR = "supabase/tests";
const REF = "tauyicvfhpfnohhgccvn";

function connectionString() {
  if (process.env.JEJAK_DB_URL) return process.env.JEJAK_DB_URL;

  if (!existsSync("JEJAK.md")) {
    console.error(
      "Tidak ada JEJAK_DB_URL dan JEJAK.md tidak ditemukan. Setel JEJAK_DB_URL lalu ulangi.",
    );
    process.exit(2);
  }

  const cocok = readFileSync("JEJAK.md", "utf8").match(/^Password Database\s*:\s*(.+)$/m);

  if (!cocok) {
    console.error("Password database tidak ditemukan di JEJAK.md.");
    process.exit(2);
  }

  const sandi = encodeURIComponent(cocok[1].trim());
  // Host langsung hanya punya AAAA; session pooler yang dipakai (lihat DEC-0102).
  return `postgresql://postgres.${REF}:${sandi}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;
}

const url = connectionString();
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
      [cliSupabase, "db", "query", "--db-url", url, "-f", `${DIR}/${nama}`],
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
      pesan = mentah ?? pesan;
    }
    console.error(`GAGAL  ${nama}: ${pesan}`);
  }
}

if (gagal > 0) {
  console.error(`${gagal} dari ${berkas.length} suite SQL gagal.`);
  process.exit(1);
}

console.log(`${berkas.length} suite SQL lulus.`);
