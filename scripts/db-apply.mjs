// Apply satu file SQL (multi-statement) ke DB canonical, atomik.
//
// Password dibaca dari JEJAK.md (local bootstrap, gitignored) — TIDAK pernah
// masuk argv/log. Pakai session pooler + pg (simple-query protocol) supaya
// migration multi-statement + fungsi ($$...$$) jalan dalam satu transaksi.
//
// Pakai:  node scripts/db-apply.mjs <path-ke-file.sql>
// Override koneksi (opsional): JEJAK_DB_HOST, JEJAK_DB_PORT, JEJAK_DB_USER.
import { readFileSync } from "node:fs";
import { Client } from "pg";

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("Usage: node scripts/db-apply.mjs <file.sql>");
  process.exit(2);
}

const boot = readFileSync(new URL("../JEJAK.md", import.meta.url), "utf8");
const m = boot.match(/Password Database\s*:\s*([^\r\n]+)/i);
if (!m) {
  console.error("Field 'Password Database' tidak ditemukan di JEJAK.md");
  process.exit(2);
}
const password = m[1].trim();
const redact = (s) =>
  String(s ?? "")
    .split(password)
    .join("***");

const sql = readFileSync(sqlPath, "utf8");

const client = new Client({
  host: process.env.JEJAK_DB_HOST ?? "aws-0-ap-southeast-1.pooler.supabase.com",
  port: Number(process.env.JEJAK_DB_PORT ?? 5432),
  user: process.env.JEJAK_DB_USER ?? "postgres.tauyicvfhpfnohhgccvn",
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
  application_name: "jejak-migrate",
});

try {
  await client.connect();
  await client.query("BEGIN");
  const res = await client.query(sql);
  await client.query("COMMIT");
  console.log("APPLIED OK:", sqlPath);
  for (const r of Array.isArray(res) ? res : [res]) {
    if (r?.rows?.length) console.log(redact(JSON.stringify(r.rows)));
  }
} catch (e) {
  try {
    await client.query("ROLLBACK");
  } catch {}
  console.error("APPLY FAILED:", redact(e.message));
  process.exitCode = 1;
} finally {
  await client.end();
}
