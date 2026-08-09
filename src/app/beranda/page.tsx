import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { keluar } from "@/lib/auth/actions";
import { bacaSesiPengguna } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Beranda" };

export default async function BerandaPage() {
  const sesi = await bacaSesiPengguna();

  if (!sesi) {
    redirect("/masuk?lanjut=/beranda");
  }

  return (
    <main className="foundation-shell">
      <section className="foundation-card" aria-labelledby="beranda-title">
        <p className="foundation-kicker">Beranda</p>
        <h1 id="beranda-title">Halo, {sesi.displayName ?? sesi.email}</h1>
        <p className="foundation-copy">
          Akun lo sudah tersambung. Fitur pemeriksaan menyusul di tahap berikutnya.
        </p>

        <dl className="foundation-meta">
          <div>
            <dt>Status akun</dt>
            <dd>{sesi.accountStatus}</dd>
          </div>
          <div>
            <dt>Peran</dt>
            <dd>{sesi.roleCodes.length > 0 ? sesi.roleCodes.join(", ") : "belum ada"}</dd>
          </div>
        </dl>

        <form action={keluar}>
          <button type="submit" className="foundation-action">
            Keluar
          </button>
        </form>
      </section>
    </main>
  );
}
