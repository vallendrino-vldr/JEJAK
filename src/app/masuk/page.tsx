import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Aurora } from "@/components/aurora";
import { Wordmark } from "@/components/merek";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { tujuanAman } from "@/lib/auth/tujuan";
import { publicErrorCatalog, type PublicErrorCode } from "@/lib/errors/public-error";

export const metadata: Metadata = { title: "Masuk" };

function pesanGalat(kode: string | undefined) {
  if (!kode) return null;
  const catalog = publicErrorCatalog as Record<string, { message: string } | undefined>;
  return catalog[kode]?.message ?? publicErrorCatalog["JX-1000"].message;
}

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { galat, lanjut } = await searchParams;
  const sesi = await bacaSesiPengguna();

  if (sesi) {
    redirect("/beranda");
  }

  const kodeGalat = typeof galat === "string" ? galat : undefined;
  const pesan = pesanGalat(kodeGalat);
  const tujuan = tujuanAman(lanjut);

  return (
    <main className="foundation-shell">
      <Aurora />
      <section className="foundation-card" aria-labelledby="masuk-title">
        <Wordmark ukuran="besar" />
        <h1 id="masuk-title">Masuk dulu, baru periksa.</h1>
        <p className="foundation-copy">
          Jejak memakai akun Google supaya lo nggak perlu bikin kata sandi baru.
        </p>

        {pesan ? (
          <p className="foundation-status" role="alert">
            {pesan} <span aria-hidden="true">·</span>{" "}
            <span>Kode {kodeGalat as PublicErrorCode}</span>
          </p>
        ) : null}

        <a
          className="foundation-action"
          href={`/auth/masuk-google?lanjut=${encodeURIComponent(tujuan)}`}
          rel="nofollow"
        >
          Lanjut dengan Google
        </a>
      </section>
    </main>
  );
}
