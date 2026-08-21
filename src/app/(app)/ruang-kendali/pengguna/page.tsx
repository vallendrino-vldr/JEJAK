import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pengguna — Ruang Kendali" };

type Baris = {
  id: string;
  nama: string | null;
  email_masked: string;
  status: string;
  peran: string[];
  bergabung: string;
};

const LABEL_STATUS: Record<string, string> = {
  active: "Aktif",
  observed: "Diamati",
  limited: "Dibatasi",
  paused: "Dijeda",
  blocked: "Diblokir",
  deletion_pending: "Menunggu hapus",
  deleted: "Terhapus",
};

const fmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function KendaliPenggunaPage() {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!(sesi.roleCodes.includes("owner") || sesi.roleCodes.includes("admin"))) redirect("/beranda");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_pengguna_kendali");
  const rows = (data ?? []) as Baris[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Pengguna</h1>
        <p className="hero-teks">
          {rows.length} pengguna terbaru. Email sengaja disamarkan — buka mentahnya butuh alur
          khusus yang teraudit.
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>

      <section aria-label="Daftar pengguna">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada pengguna.</p>
        ) : (
          <ul className="daftar">
            {rows.map((u) => (
              <li key={u.id} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">{u.email_masked}</span>
                <span className="tanda-jenis">{LABEL_STATUS[u.status] ?? u.status}</span>
                <span className="kartu-meta">
                  {u.peran.length ? u.peran.join(", ") : "user"} ·{" "}
                  {fmt.format(new Date(u.bergabung))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
