import type { Metadata } from "next";
import Link from "next/link";
import { LABEL_TUJUAN, daftarKasus } from "@/lib/kasus/baca";

export const metadata: Metadata = { title: "Kasus" };

const formatTanggal = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function KasusPage() {
  const kasus = await daftarKasus();

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Kasus</p>
        <h1 className="hero-judul">Tempat bukti lo dikumpulkan.</h1>
        <p className="hero-teks">
          Satu kasus nyatuin petunjuk, bukti, dan catatan lo dalam satu berkas yang bisa dibuka lagi
          kapan pun.
        </p>
        <p className="hero-aksi">
          <Link href="/kasus/baru" className="tombol-utama">
            Buat kasus
          </Link>
          <Link href="/kasus/sampah" className="tombol-sekunder">
            Sampah
          </Link>
        </p>
      </section>

      {kasus.length === 0 ? (
        <p className="kosong">
          Belum ada kasus. Bikin satu kalau ada yang mau lo telusurin lebih serius.
        </p>
      ) : (
        <ul className="daftar-kartu">
          {kasus.map((satu) => (
            <li key={satu.id}>
              <Link href={`/kasus/${satu.id}`} className="kartu">
                <span className="kartu-meta">
                  {satu.publicRef} · {LABEL_TUJUAN[satu.purpose] ?? satu.purpose}
                  {satu.isSecret ? " · Rahasia" : ""}
                </span>
                <span className="kartu-judul">{satu.isSecret ? "Kasus rahasia" : satu.title}</span>
                <span className="kartu-teks">
                  {satu.jumlahPetunjuk} petunjuk · terakhir{" "}
                  {formatTanggal.format(new Date(satu.lastActivityAt))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
