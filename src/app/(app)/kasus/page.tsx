import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kasus" };

export default function KasusPage() {
  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Kasus</p>
        <h1 className="hero-judul">Tempat bukti lo dikumpulkan.</h1>
        <p className="hero-teks">
          Satu kasus menyatukan identifier, bukti, hubungan antar temuan, dan catatan lo dalam satu
          berkas yang bisa dibuka lagi kapan pun.
        </p>
      </section>

      <p className="kosong">Belum ada kasus.</p>
    </div>
  );
}
