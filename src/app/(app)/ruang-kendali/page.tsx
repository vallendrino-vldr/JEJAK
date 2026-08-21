import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ruang Kendali" };

type Ringkasan = {
  pengguna: number;
  kasus_aktif: number;
  scan_total: number;
  scan_hari_ini: number;
  sumber_terdaftar: number;
};

const KARTU: { key: keyof Ringkasan; label: string }[] = [
  { key: "pengguna", label: "Pengguna" },
  { key: "kasus_aktif", label: "Kasus aktif" },
  { key: "scan_total", label: "Total pemeriksaan" },
  { key: "scan_hari_ini", label: "Pemeriksaan hari ini" },
  { key: "sumber_terdaftar", label: "Sumber terdaftar" },
];

export default async function RuangKendaliPage() {
  const sesi = await bacaSesiPengguna();

  if (!sesi) redirect("/masuk");

  // Otorisasi server-side dari peran DB, bukan kondisi email di frontend.
  // Fungsi RPC-nya juga mengecek ulang izin — pertahanan berlapis.
  const boleh = sesi.roleCodes.includes("owner") || sesi.roleCodes.includes("admin");
  if (!boleh) redirect("/beranda");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("ringkasan_kendali");
  const r = (data ?? {}) as Ringkasan;

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Ringkasan</h1>
        <p className="hero-teks">
          Angka ringkas kondisi JEJAK. Cuma kelihatan buat Owner dan Admin.
        </p>
        <p className="hero-aksi">
          <Link href="/beranda" className="tombol-sekunder">
            Kembali sebagai Pengguna
          </Link>
        </p>
      </section>

      <section aria-label="Ringkasan angka">
        <div className="kartu-grid">
          {KARTU.map((k) => (
            <div key={k.key} className="kartu kartu-statik">
              <span className="statik-angka">{Number(r[k.key] ?? 0).toLocaleString("id-ID")}</span>
              <span className="kartu-teks">{k.label}</span>
            </div>
          ))}
        </div>
        <p className="catatan">
          Bagian lain Ruang Kendali — pembayaran, pengelolaan pengguna, konfigurasi — nyusul di fase
          berikutnya.
        </p>
      </section>
    </div>
  );
}
