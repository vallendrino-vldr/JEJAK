import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sumber — Ruang Kendali" };

type Baris = {
  code: string;
  name: string;
  category: string;
  status: string;
  health: string;
  priority: number;
};

const LABEL_STATUS: Record<string, string> = {
  active: "Aktif",
  experimental: "Eksperimen",
  degraded: "Menurun",
  paused: "Dijeda",
  disabled: "Nonaktif",
};

export default async function KendaliSumberPage() {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!(sesi.roleCodes.includes("owner") || sesi.roleCodes.includes("admin"))) redirect("/beranda");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_sumber_kendali");
  const rows = (data ?? []) as Baris[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Sumber</h1>
        <p className="hero-teks">
          Daftar sumber pemeriksaan yang terdaftar dan statusnya. Baru RDAP (domain) yang aktif.
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>
      <section aria-label="Daftar sumber">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada sumber terdaftar.</p>
        ) : (
          <ul className="daftar">
            {rows.map((s) => (
              <li key={s.code} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">{s.name}</span>
                <span className="tanda-jenis">{LABEL_STATUS[s.status] ?? s.status}</span>
                <span className="kartu-meta">
                  {s.category} · prioritas {s.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
