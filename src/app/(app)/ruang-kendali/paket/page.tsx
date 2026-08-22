import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { simpanPaketAction } from "./actions";

export const metadata: Metadata = { title: "Paket — Ruang Kendali" };

type Paket = {
  code: string;
  name: string;
  price_idr: number;
  base_credits: number;
  bonus_credits: number;
  validity_days: number;
  active: boolean;
  badge_text: string | null;
  display_order: number;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PESAN: Record<string, string> = {
  input: "Isian paket belum valid.",
  simpan: "Gagal menyimpan. Cek izin atau coba lagi.",
};

export default async function KendaliPaketPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string; ok?: string }>;
}) {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!sesi.roleCodes.includes("owner")) redirect("/beranda");
  const { galat, ok } = await searchParams;

  // Owner-only page: baca semua paket (termasuk nonaktif) lewat admin client.
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("credit_packages")
    .select(
      "code,name,price_idr,base_credits,bonus_credits,validity_days,active,badge_text,display_order",
    )
    .order("display_order", { ascending: true });
  const rows = (data ?? []) as Paket[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Paket Kredit</h1>
        <p className="hero-teks">
          Harga & isi paket top-up. Ubah kapan saja tanpa deploy. Kode sama menimpa paket yang ada.
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>

      {ok ? (
        <p className="catatan" role="status">
          Paket tersimpan.
        </p>
      ) : null}
      {galat ? (
        <p className="catatan" role="alert">
          {PESAN[galat] ?? "Ada yang salah."}
        </p>
      ) : null}

      <section aria-label="Daftar paket">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada paket.</p>
        ) : (
          <ul className="daftar">
            {rows.map((p) => (
              <li key={p.code} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">
                  {p.name} — {rupiah.format(p.price_idr)}
                </span>
                <span className="tanda-jenis">{p.active ? "Aktif" : "Nonaktif"}</span>
                <span className="kartu-meta">
                  {p.base_credits + p.bonus_credits} kredit ({p.base_credits}+{p.bonus_credits}) ·{" "}
                  {p.validity_days} hari · kode {p.code}
                  {p.badge_text ? ` · "${p.badge_text}"` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="kartu" aria-label="Tambah / ubah paket" style={{ marginTop: "1.5rem" }}>
        <h2 className="kartu-teks">Tambah / ubah paket</h2>
        <form action={simpanPaketAction} className="form" style={{ marginTop: "var(--r4)" }}>
          <input
            className="isian"
            name="code"
            placeholder="Kode (mis. proteksi)"
            required
            maxLength={50}
          />
          <input
            className="isian"
            name="name"
            placeholder="Nama tampilan"
            required
            maxLength={100}
          />
          <input
            className="isian"
            name="price_idr"
            type="number"
            min={0}
            placeholder="Harga (IDR)"
            required
          />
          <input
            className="isian"
            name="base_credits"
            type="number"
            min={0}
            placeholder="Kredit dasar"
            required
          />
          <input
            className="isian"
            name="bonus_credits"
            type="number"
            min={0}
            placeholder="Kredit bonus"
            defaultValue={0}
          />
          <input
            className="isian"
            name="validity_days"
            type="number"
            min={1}
            placeholder="Masa berlaku (hari)"
            required
          />
          <input
            className="isian"
            name="badge_text"
            placeholder="Badge (opsional, mis. Populer)"
            maxLength={40}
          />
          <input
            className="isian"
            name="display_order"
            type="number"
            min={0}
            placeholder="Urutan tampil"
            defaultValue={0}
          />
          <label className="form-centang">
            <input type="checkbox" name="active" defaultChecked /> Aktif
          </label>
          <button type="submit" className="tombol-utama">
            Simpan paket
          </button>
        </form>
      </section>
    </div>
  );
}
