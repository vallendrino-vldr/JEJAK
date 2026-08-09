import type { Metadata } from "next";
import Link from "next/link";
import { SearchConsole } from "@/components/periksa/search-console";
import { bacaSesiPengguna } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Beranda" };

const PINTASAN = [
  {
    href: "/jejak-gue",
    judul: "Cek data gue",
    teks: "Seberapa kebuka jejak digital lo sendiri.",
  },
  {
    href: "/periksa",
    judul: "Cek sebelum transfer",
    teks: "Cek rekening, toko, atau orangnya sebelum duit pindah.",
  },
  {
    href: "/periksa",
    judul: "Bantu orang terdekat",
    teks: "Bantuin ngecek sesuatu buat keluarga atau teman.",
  },
] as const;

export default async function BerandaPage() {
  const sesi = await bacaSesiPengguna();
  const sapaan = sesi?.displayName?.split(" ")[0] ?? "";

  return (
    <div className="ruang">
      <section className="hero">
        <p className="mata-kicker">{sapaan ? `Halo, ${sapaan}` : "Halo"}</p>
        <h1 className="hero-judul">Mau periksa apa hari ini?</h1>
        <SearchConsole />
      </section>

      <section aria-labelledby="pintasan-judul">
        <h2 id="pintasan-judul" className="bagian-judul">
          Mulai dari sini
        </h2>
        <div className="kartu-grid">
          {PINTASAN.map((pintasan) => (
            <Link key={pintasan.judul} href={pintasan.href} className="kartu">
              <span className="kartu-judul">{pintasan.judul}</span>
              <span className="kartu-teks">{pintasan.teks}</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="kasus-judul">
        <h2 id="kasus-judul" className="bagian-judul">
          Kasus lo
        </h2>
        <p className="kosong">
          Belum ada kasus yang jalan. Begitu lo mulai meriksa sesuatu, hasilnya bisa disimpen jadi
          kasus biar buktinya nggak tercecer.
        </p>
      </section>
    </div>
  );
}
