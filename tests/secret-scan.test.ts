import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Fixture sengaja ditulis ke luar repo agar scanner produksi tidak ikut memindainya.
let fixtureDir: string;

function scan(fileName: string, content: string) {
  const filePath = join(fixtureDir, fileName);
  writeFileSync(filePath, content, "utf8");

  const result = spawnSync(process.execPath, ["scripts/secret-scan.mjs", filePath], {
    encoding: "utf8",
  });

  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

beforeAll(() => {
  fixtureDir = mkdtempSync(join(tmpdir(), "jejak-secret-scan-"));
});

afterAll(() => {
  rmSync(fixtureDir, { recursive: true, force: true });
});

describe("secret scanner", () => {
  const kebocoran: Array<[string, string]> = [
    ["google-api-key", `GEMINI_KEY_LITERAL AIzaSyA${"b".repeat(33)}`],
    ["groq-api-key", `gsk_${"c".repeat(32)}`],
    ["github-token", `ghp_${"d".repeat(36)}`],
    ["supabase-secret", `sb_secret_${"e".repeat(32)}`],
    // Sampel di bawah dirakit dari potongan supaya file test ini sendiri tidak terbaca sebagai kebocoran.
    ["private-key", `-----BEGIN OPENSSH PRIVATE ${"KEY"}-----`],
    ["jwt-token", `eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.${"f".repeat(20)}`],
    ["db-connection-string", `postgresql://postgres:${"R4hasiaBanget"}@db.contoh.co:5432/db`],
    ["filled-sensitive-env", "SUPABASE_SERVICE_ROLE_KEY=nilai-terisi-yang-panjang"],
  ];

  it.each(kebocoran)("menolak file yang mengandung %s", (rule, content) => {
    const { status, output } = scan(`bocor-${rule}.txt`, content);

    expect(status).toBe(1);
    expect(output).toContain(rule);
  });

  it("tidak menampilkan nilai secret pada laporan", () => {
    const secretValue = `sb_secret_${"z".repeat(32)}`;
    const { output } = scan("bocor-tanpa-nilai.txt", secretValue);

    expect(output).not.toContain(secretValue);
  });

  it("meloloskan placeholder dan contoh dokumentasi", () => {
    const { status } = scan(
      "aman.txt",
      [
        "NEXT_PUBLIC_SUPABASE_URL=https://project-id.supabase.co",
        "SUPABASE_SECRET_KEY=",
        "GEMINI_API_KEY_1=<isi-dari-dashboard>",
        "GROQ_API_KEY_1=your-key-here",
        "DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_example_key_12345",
      ].join("\n"),
    );

    expect(status).toBe(0);
  });
});
