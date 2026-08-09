import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Aurora } from "@/components/aurora";
import { DemoKonsol } from "@/components/landing/demo-konsol";
import { MataJejak } from "@/components/mata-jejak";
import { Wordmark } from "@/components/merek";
import { bacaSesiPengguna } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "JEJAK — Periksa sebelum percaya",
  description:
    "Pemeriksaan jejak digital dan workspace investigasi berbasis bukti. Masuk pakai Google, nggak perlu bikin password baru.",
};

export default async function LandingPage() {
  const sesi = await bacaSesiPengguna();

  // Kalau sudah login, langsung ke beranda
  if (sesi) {
    redirect("/beranda");
  }

  return (
    <main className="landing">
      <Aurora />

      <div className="landing-isi">
        {/* — Hero — */}
        <header className="landing-hero">
          <div className="landing-mata" aria-hidden="true">
            <MataJejak />
          </div>
          <Wordmark ukuran="besar" className="landing-merek" />
          <h1 className="landing-tagline">
            Periksa sebelum
            <br />
            percaya.
          </h1>
          <p className="landing-sub">
            Telusuri jejak digital siapa pun — mulai dari email, nomor HP, sampai username. Semua
            berbasis bukti, bukan tebakan.
          </p>
        </header>

        {/* — Demo interaktif lokal — */}
        <section className="landing-demo" aria-label="Demo deteksi identifier">
          <DemoKonsol />
        </section>

        {/* — CTA utama — */}
        <section className="landing-aksi">
          <a className="landing-tombol-utama" href="/auth/masuk-google?lanjut=%2Fberanda">
            <IkonGoogle />
            Masuk pakai Google
          </a>
          <p className="landing-gratis">Bisa mulai gratis. Nggak perlu kartu kredit.</p>
        </section>

        {/* — Fitur singkat — */}
        <section className="landing-fitur" aria-label="Apa yang bisa JEJAK lakuin">
          <div className="landing-fitur-item">
            <span className="landing-fitur-ikon" aria-hidden="true">
              ◎
            </span>
            <h2 className="landing-fitur-judul">Deteksi Otomatis</h2>
            <p className="landing-fitur-teks">
              Masukin apa aja — JEJAK langsung tahu itu email, nomor HP, domain, atau username.
            </p>
          </div>
          <div className="landing-fitur-item">
            <span className="landing-fitur-ikon" aria-hidden="true">
              ⊞
            </span>
            <h2 className="landing-fitur-judul">Workspace Investigasi</h2>
            <p className="landing-fitur-teks">
              Kumpulin semua bukti dalam satu kasus. Hubungan antar petunjuk langsung kelihatan.
            </p>
          </div>
          <div className="landing-fitur-item">
            <span className="landing-fitur-ikon" aria-hidden="true">
              ⊘
            </span>
            <h2 className="landing-fitur-judul">Bukti, Bukan Tebakan</h2>
            <p className="landing-fitur-teks">
              Setiap temuan punya sumber jelas. Yang belum pasti, JEJAK bilang belum pasti.
            </p>
          </div>
        </section>

        {/* — Footer — */}
        <footer className="landing-footer">
          <Wordmark ukuran="kecil" />
          <p className="landing-footer-teks">Bisa mulai gratis. Nggak perlu kartu kredit.</p>
        </footer>
      </div>
    </main>
  );
}

/** Ikon Google sederhana — inline SVG supaya tidak butuh asset external. */
function IkonGoogle() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
