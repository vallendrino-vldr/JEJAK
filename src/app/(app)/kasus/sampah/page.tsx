import type { Metadata } from "next";
import Link from "next/link";
import { pulihkanKasus } from "@/lib/kasus/actions";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Sampah — Kasus" };

type Baris = {
  id: string;
  public_ref: string;
  title: string;
  dihapus: string;
  kedaluwarsa: string;
};

const fmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function SampahKasusPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_sampah_kasus");
  const rows = (data ?? []) as Baris[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Kasus · Sampah</p>
        <h1 className="hero-judul">Sampah</h1>
        <p className="hero-teks">
          Kasus yang lo buang. Masih bisa dibalikin sampai tanggal kedaluwarsanya, setelah itu
          benar-benar hilang.
        </p>
        <p className="hero-aksi">
          <Link href="/kasus" className="tombol-sekunder">
            Kembali ke Kasus
          </Link>
        </p>
      </section>

      <section aria-label="Isi sampah">
        {rows.length === 0 ? (
          <p className="kosong">Sampah kosong.</p>
        ) : (
          <ul className="daftar">
            {rows.map((k) => (
              <li key={k.id} className="daftar-item daftar-item-rapi">
                <span className="petunjuk-nilai">{k.title}</span>
                <span className="kartu-meta">
                  Dibuang {fmt.format(new Date(k.dihapus))} · hilang{" "}
                  {fmt.format(new Date(k.kedaluwarsa))}
                </span>
                <form action={pulihkanKasus}>
                  <input type="hidden" name="caseId" value={k.id} />
                  <button type="submit" className="tombol-sekunder tombol-kecil">
                    Pulihkan
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
