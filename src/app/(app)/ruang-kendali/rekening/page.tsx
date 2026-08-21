import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { simpanRekeningAction } from "./actions";

export const metadata: Metadata = { title: "Rekening — Ruang Kendali" };

type Rekening = {
  code: string;
  display_name: string;
  method_type: string;
  institution_name: string;
  account_number_last4: string;
  holder_name: string;
  is_active: boolean;
  is_primary: boolean;
};

const PESAN: Record<string, string> = {
  input: "Isian rekening belum lengkap/valid.",
  simpan: "Gagal menyimpan. Cek izin atau coba lagi.",
};

export default async function KendaliRekeningPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!sesi.roleCodes.includes("owner")) redirect("/beranda");
  const { galat, ok } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_rekening_kendali");
  const rows = (data ?? []) as Rekening[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Rekening Pembayaran</h1>
        <p className="hero-teks">
          Rekening tujuan transfer top-up. Nomor lengkap disimpan terenkripsi — di sini cuma tampil
          4 digit terakhir. Yang ditandai utama dipakai untuk order baru.
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>

      {ok ? (
        <p className="catatan" role="status">
          Rekening tersimpan.
        </p>
      ) : null}
      {galat ? (
        <p className="catatan" role="alert">
          {PESAN[galat] ?? "Ada yang salah."}
        </p>
      ) : null}

      <section aria-label="Rekening tersimpan">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada rekening. Tambah di bawah biar top-up bisa jalan.</p>
        ) : (
          <ul className="daftar">
            {rows.map((r) => (
              <li key={r.code} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">
                  {r.institution_name} ···· {r.account_number_last4}
                </span>
                <span className="tanda-jenis">{r.is_primary ? "Utama" : r.display_name}</span>
                <span className="kartu-meta">
                  a.n. {r.holder_name} · {r.is_active ? "aktif" : "nonaktif"} · kode {r.code}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="kartu"
        aria-label="Tambah / ubah rekening"
        style={{ marginTop: "1.5rem" }}
      >
        <h2 className="kartu-teks">Tambah / ubah rekening</h2>
        <p className="kartu-meta">Kode yang sama akan menimpa rekening yang ada.</p>
        <form
          action={simpanRekeningAction}
          style={{ display: "grid", gap: "0.75rem", marginTop: "0.75rem" }}
        >
          <input name="code" placeholder="kode unik (mis. bca_utama)" required maxLength={50} />
          <input
            name="display_name"
            placeholder="Nama tampilan (mis. BCA)"
            required
            maxLength={100}
          />
          <select name="method_type" defaultValue="bank_transfer">
            <option value="bank_transfer">Transfer Bank</option>
            <option value="ewallet">E-Wallet</option>
            <option value="qris">QRIS</option>
          </select>
          <input
            name="institution_name"
            placeholder="Bank/penyedia (mis. BCA)"
            required
            maxLength={100}
          />
          <input name="account_number" placeholder="Nomor rekening" required maxLength={50} />
          <input name="account_holder_name" placeholder="Atas nama" required maxLength={120} />
          <textarea
            name="instructions"
            placeholder="Instruksi tambahan (opsional)"
            maxLength={500}
          />
          <label style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input type="checkbox" name="is_primary" /> Jadikan rekening utama
          </label>
          <button type="submit" className="tombol-utama">
            Simpan rekening
          </button>
        </form>
      </section>
    </div>
  );
}
