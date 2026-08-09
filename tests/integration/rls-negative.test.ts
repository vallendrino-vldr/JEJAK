import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

/**
 * Test negatif RLS terhadap database sungguhan.
 *
 * Yang dibuktikan di sini bukan "user bisa baca datanya sendiri", tapi
 * "tamu tidak bisa baca data siapa pun". Dipakai kunci publishable, persis
 * seperti yang dipegang browser.
 *
 * Dilewati kalau `.env.local` tidak ada, supaya CI dan mesin tanpa credential
 * tetap hijau tanpa memberi rasa aman palsu — status skip terlihat di output.
 */
function bacaEnvLokal(): Record<string, string> {
  if (!existsSync(".env.local")) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(".env.local", "utf8")
      .split(/\r?\n/)
      .filter((baris) => baris.trim() && !baris.startsWith("#") && baris.includes("="))
      .map((baris) => {
        const pemisah = baris.indexOf("=");
        return [baris.slice(0, pemisah).trim(), baris.slice(pemisah + 1).trim()];
      }),
  );
}

const env = bacaEnvLokal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const adaCredential = Boolean(url && publishableKey);

describe.skipIf(!adaCredential)("RLS menolak akses tamu", () => {
  // Dibuat malas di dalam fungsi, bukan saat modul dibaca. `describe.skipIf`
  // tetap menjalankan badan callback untuk mengumpulkan daftar test, jadi
  // memanggil createClient dengan nilai kosong di sini akan melempar dan
  // menggagalkan seluruh berkas alih-alih melewatinya.
  const tamu = () =>
    createClient(url ?? "", publishableKey ?? "", {
      auth: { persistSession: false, autoRefreshToken: false },
    });

  it.each(["profiles", "user_roles", "roles", "permissions", "role_permissions"])(
    "tamu tidak mendapat baris dari %s",
    async (tabel) => {
      const { data, error } = await tamu().from(tabel).select("*").limit(1);

      // Boleh ditolak (error) atau dikembalikan kosong — yang dilarang adalah
      // tamu benar-benar menerima baris data.
      expect(error !== null || (data ?? []).length === 0).toBe(true);
      expect(data ?? []).toHaveLength(0);
    },
  );

  it("tamu tidak bisa menyisipkan profil", async () => {
    const { error } = await tamu()
      .from("profiles")
      .insert({ id: "00000000-0000-0000-0000-000000000000", email: "tamu@contoh.test" });

    expect(error).not.toBeNull();
  });

  it("tamu tidak bisa menaikkan status akun siapa pun", async () => {
    const { error, data } = await tamu()
      .from("profiles")
      .update({ account_status: "active" })
      .neq("id", "00000000-0000-0000-0000-000000000000")
      .select();

    expect(error !== null || (data ?? []).length === 0).toBe(true);
  });

  it("tamu tidak bisa memberi dirinya peran", async () => {
    const { error } = await tamu().from("user_roles").insert({
      user_id: "00000000-0000-0000-0000-000000000000",
      role_id: "00000000-0000-0000-0000-000000000000",
    });

    expect(error).not.toBeNull();
  });

  it.each(["case-attachments", "payment-proofs"])(
    "bucket %s tidak bisa dijelajahi tamu",
    async (bucket) => {
      const { data, error } = await tamu().storage.from(bucket).list();

      expect(error !== null || (data ?? []).length === 0).toBe(true);
      expect(data ?? []).toHaveLength(0);
    },
  );

  it.each(["case-attachments", "payment-proofs"])(
    "tamu tidak bisa mengunggah ke bucket %s",
    async (bucket) => {
      const { error } = await tamu()
        .storage.from(bucket)
        .upload(`uji/${bucket}-tamu.txt`, new Blob(["uji"]), { contentType: "text/plain" });

      expect(error).not.toBeNull();
    },
  );

  it("URL publik bucket privat tidak mengembalikan file", async () => {
    const { data } = tamu().storage.from("payment-proofs").getPublicUrl("apa-saja.png");
    const respons = await fetch(data.publicUrl);

    expect(respons.ok).toBe(false);
  });
});
