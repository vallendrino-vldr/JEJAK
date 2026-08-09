import type { Metadata } from "next";
import { keluar } from "@/lib/auth/actions";
import { bacaSesiPengguna } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Jejak Gue" };

const LABEL_STATUS: Record<string, string> = {
  active: "Aktif",
  observed: "Diamati",
  limited: "Dibatasi",
  paused: "Dijeda",
  blocked: "Diblokir",
  deletion_pending: "Menunggu penghapusan",
  deleted: "Terhapus",
};

const LABEL_PERAN: Record<string, string> = {
  owner: "Pemilik",
  admin: "Admin",
  finance: "Keuangan",
  support: "Bantuan",
  user: "Pengguna",
};

export default async function JejakGuePage() {
  const sesi = await bacaSesiPengguna();

  if (!sesi) return null;

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Jejak Gue</p>
        <h1 className="hero-judul">{sesi.displayName ?? sesi.email}</h1>
        <p className="hero-teks">{sesi.email}</p>
      </section>

      <section aria-labelledby="akun-judul">
        <h2 id="akun-judul" className="bagian-judul">
          Akun
        </h2>
        <dl className="rincian">
          <div>
            <dt>Status</dt>
            <dd>{LABEL_STATUS[sesi.accountStatus] ?? sesi.accountStatus}</dd>
          </div>
          <div>
            <dt>Peran</dt>
            <dd>
              {sesi.roleCodes.length > 0
                ? sesi.roleCodes.map((kode) => LABEL_PERAN[kode] ?? kode).join(", ")
                : "Belum ada"}
            </dd>
          </div>
        </dl>
        <p className="catatan">
          Peran ini dibaca langsung dari database tiap kali halaman dibuka, bukan dari token yang
          disimpan browser. Jadi kalau peran dicabut, efeknya langsung terasa.
        </p>
      </section>

      <section aria-labelledby="keluar-judul">
        <h2 id="keluar-judul" className="bagian-judul">
          Keluar
        </h2>
        <form action={keluar}>
          <button type="submit" className="tombol-sekunder">
            Keluar dari akun ini
          </button>
        </form>
      </section>
    </div>
  );
}
