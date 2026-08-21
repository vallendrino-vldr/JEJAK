"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  IkonBeranda,
  IkonDompet,
  IkonJejakGue,
  IkonKabar,
  IkonKasus,
  IkonKembali,
  IkonPeriksa,
  IkonRuangKendali,
  IkonSegarkan,
  IkonTutup,
} from "@/components/ikon";
import { Aurora } from "@/components/aurora";
import { MataJejak } from "@/components/mata-jejak";
import { Wordmark } from "@/components/merek";

import type { DompetInfo } from "@/lib/ledger/service";

export type RingkasanSesi = {
  namaTampilan: string;
  peran: string[];
};

const NAVIGASI = [
  { href: "/beranda", label: "Beranda", Ikon: IkonBeranda },
  { href: "/periksa", label: "Periksa", Ikon: IkonPeriksa },
  { href: "/kasus", label: "Kasus", Ikon: IkonKasus },
  { href: "/jejak-gue", label: "Jejak Gue", Ikon: IkonJejakGue },
] as const;

type PanelAktif = "dompet" | "kabar" | "mata" | null;

/**
 * App Shell persisten.
 *
 * Komponen ini hidup di layout, jadi navigasi antar bagian utama hanya menukar
 * isi workspace. Navigasi, kontrol global, dan state panel tidak ikut dimuat
 * ulang — itulah yang membuat perpindahan tab terasa instan tanpa spinner.
 */
export function AppShell({
  sesi,
  dompet,
  children,
}: {
  sesi: RingkasanSesi;
  dompet: DompetInfo | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [panel, setPanel] = useState<PanelAktif>(null);
  const [menyegarkan, setMenyegarkan] = useState(false);

  const diBerandaUtama = pathname === "/beranda";

  const tutupPanel = useCallback(() => setPanel(null), []);

  useEffect(() => {
    if (panel === null) return;

    const tutupDenganEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };

    window.addEventListener("keydown", tutupDenganEsc);
    return () => window.removeEventListener("keydown", tutupDenganEsc);
  }, [panel]);

  // Segarkan menyinkronkan ulang data server tanpa membuang state shell.
  // Ini bukan reload penuh — panel, posisi navigasi, dan sesi tetap hidup.
  const segarkan = useCallback(() => {
    setMenyegarkan(true);
    router.refresh();
    window.setTimeout(() => setMenyegarkan(false), 600);
  }, [router]);

  return (
    <div className="shell">
      <Aurora />

      <header className="shell-atas">
        <div className="shell-atas-kiri">
          {diBerandaUtama ? (
            <Wordmark ukuran="kecil" />
          ) : (
            <button
              type="button"
              className="kontrol"
              onClick={() => router.back()}
              aria-label="Kembali"
            >
              <IkonKembali />
              <span className="kontrol-teks">Kembali</span>
            </button>
          )}
        </div>

        <div className="shell-atas-kanan">
          <button
            type="button"
            className="kontrol"
            onClick={segarkan}
            aria-live="polite"
            data-sibuk={menyegarkan ? "ya" : undefined}
          >
            <IkonSegarkan />
            <span className="hanya-pembaca-layar">
              {menyegarkan ? "Sedang menyegarkan" : "Segarkan"}
            </span>
          </button>

          <button
            type="button"
            className="kontrol"
            onClick={() => setPanel("dompet")}
            aria-expanded={panel === "dompet"}
            aria-label="Dompet"
          >
            <IkonDompet />
            <span className="kontrol-teks">Dompet</span>
          </button>

          <button
            type="button"
            className="kontrol"
            onClick={() => setPanel("kabar")}
            aria-expanded={panel === "kabar"}
          >
            <IkonKabar />
            <span className="hanya-pembaca-layar">Kabar Jejak</span>
          </button>
        </div>
      </header>

      <nav className="shell-rail" aria-label="Navigasi utama">
        {NAVIGASI.map(({ href, label, Ikon }) => (
          <Link
            key={href}
            href={href}
            className="nav-item"
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            onClick={tutupPanel}
          >
            <Ikon />
            <span>{label}</span>
          </Link>
        ))}

        {sesi.peran.includes("owner") || sesi.peran.includes("admin") ? (
          <Link
            href="/ruang-kendali"
            className="nav-item nav-item-kendali"
            aria-current={pathname.startsWith("/ruang-kendali") ? "page" : undefined}
            onClick={tutupPanel}
          >
            <IkonRuangKendali />
            <span>Ruang Kendali</span>
          </Link>
        ) : null}
      </nav>

      <main className="shell-workspace gulir" id="workspace">
        {children}
      </main>

      <nav className="shell-bawah" aria-label="Navigasi utama">
        {NAVIGASI.map(({ href, label, Ikon }) => (
          <Link
            key={href}
            href={href}
            className="nav-bawah-item"
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            onClick={tutupPanel}
          >
            <Ikon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <button
        type="button"
        className="mata-jejak"
        onClick={() => setPanel("mata")}
        aria-expanded={panel === "mata"}
      >
        <MataJejak />
        <span className="hanya-pembaca-layar">Mata Jejak — panduan</span>
      </button>

      {panel ? (
        <Panel judul={JUDUL_PANEL[panel]} onTutup={() => setPanel(null)}>
          {panel === "dompet" ? <IsiDompet dompet={dompet} /> : null}
          {panel === "kabar" ? <IsiKabar /> : null}
          {panel === "mata" ? <IsiMata namaTampilan={sesi.namaTampilan} /> : null}
        </Panel>
      ) : null}
    </div>
  );
}

const JUDUL_PANEL: Record<Exclude<PanelAktif, null>, string> = {
  dompet: "Dompet Kredit",
  kabar: "Kabar Jejak",
  mata: "Mata Jejak",
};

function Panel({
  judul,
  onTutup,
  children,
}: {
  judul: string;
  onTutup: () => void;
  children: ReactNode;
}) {
  return (
    <div className="panel-lapisan" role="dialog" aria-modal="true" aria-label={judul}>
      <button type="button" className="panel-tirai" onClick={onTutup} tabIndex={-1}>
        <span className="hanya-pembaca-layar">Tutup panel</span>
      </button>

      <section className="panel">
        <header className="panel-kepala">
          <h2>{judul}</h2>
          <button type="button" className="kontrol" onClick={onTutup} autoFocus>
            <IkonTutup />
            <span className="hanya-pembaca-layar">Tutup</span>
          </button>
        </header>
        <div className="panel-isi gulir">{children}</div>
      </section>
    </div>
  );
}

function IsiDompet({ dompet }: { dompet: DompetInfo | null }) {
  if (!dompet) {
    return (
      <>
        <p className="panel-utama">Dompet lo belum aktif.</p>
        <p className="panel-teks">
          Kredit, riwayat pemakaian, dan isi ulang mulai jalan setelah mesin pemeriksaan siap.
          Sampai saat itu nggak ada saldo yang perlu lo urus, dan nggak ada yang bisa kepotong.
        </p>
      </>
    );
  }

  return (
    <>
      <div className="dompet-ringkasan" style={{ marginBottom: "1.5rem" }}>
        <p className="panel-teks" style={{ fontSize: "0.875rem", color: "var(--fg-muted)" }}>
          Saldo Tersedia
        </p>
        <p
          style={{
            fontSize: "2rem",
            fontWeight: 600,
            margin: "0.25rem 0",
            color: "var(--fg-base)",
          }}
        >
          {dompet.tersedia}{" "}
          <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--fg-muted)" }}>
            kredit
          </span>
        </p>
        {dompet.dicadangkan > 0 && (
          <p className="panel-teks" style={{ fontSize: "0.875rem", color: "var(--fg-warning)" }}>
            + {dompet.dicadangkan} kredit sedang ditahan untuk proses scan aktif
          </p>
        )}
      </div>
      <p className="panel-teks">
        Kredit ini digunakan untuk melakukan pemeriksaan mendalam. Riwayat transaksi lengkap bisa
        dilihat lewat Pengaturan Akun di masa depan.
      </p>
    </>
  );
}

function IsiKabar() {
  return (
    <>
      <p className="panel-utama">Belum ada kabar buat lo.</p>
      <p className="panel-teks">
        Di sini nanti muncul hal-hal yang beneran perlu lo tahu: pemeriksaan selesai, pembayaran
        terkonfirmasi, atau temuan baru di kasus lo. Bukan notifikasi basa-basi.
      </p>
    </>
  );
}

function IsiMata({ namaTampilan }: { namaTampilan: string }) {
  return (
    <>
      <p className="panel-utama">Halo, {namaTampilan}.</p>
      <p className="panel-teks">
        Jejak bekerja dari bukti. Setiap temuan bakal dikasih tahu sumbernya, kapan diambil, dan
        seberapa kuat. Kalau sesuatu cuma dugaan, Jejak bilang itu dugaan.
      </p>
      <p className="panel-teks">
        Yang nggak Jejak lakukan: nebak identitas orang dari satu petunjuk, atau bilang seseorang
        aman cuma karena nggak ketemu apa-apa.
      </p>
    </>
  );
}
