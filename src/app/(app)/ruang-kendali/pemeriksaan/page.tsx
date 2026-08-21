import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pemeriksaan — Ruang Kendali" };

type Baris = { public_ref: string; status: string; purpose: string; dibuat: string };

const LABEL_STATUS: Record<string, string> = {
  pending: "Menunggu",
  running: "Berjalan",
  completed: "Selesai",
  no_result: "Tanpa hasil",
  failed: "Gagal",
  cancelled: "Batal",
  refunded: "Dikembalikan",
};

const fmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function KendaliPemeriksaanPage() {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!(sesi.roleCodes.includes("owner") || sesi.roleCodes.includes("admin"))) redirect("/beranda");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_scan_kendali");
  const rows = (data ?? []) as Baris[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Pemeriksaan</h1>
        <p className="hero-teks">{rows.length} pemeriksaan terbaru di seluruh JEJAK.</p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>
      <section aria-label="Daftar pemeriksaan">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada pemeriksaan.</p>
        ) : (
          <ul className="daftar">
            {rows.map((s) => (
              <li key={s.public_ref} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">{s.public_ref}</span>
                <span className="tanda-jenis">{LABEL_STATUS[s.status] ?? s.status}</span>
                <span className="kartu-meta">{fmt.format(new Date(s.dibuat))}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
