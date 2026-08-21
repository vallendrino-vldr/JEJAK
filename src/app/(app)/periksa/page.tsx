import type { Metadata } from "next";
import { randomUUID } from "node:crypto";
import { FormMulaiScan } from "@/components/periksa/form-mulai-scan";
import { SearchConsole } from "@/components/periksa/search-console";
import { deteksiIdentifier, type JenisIdentifier } from "@/lib/periksa/deteksi";
import { validasiTelepon } from "@/lib/periksa/telepon";

export const metadata: Metadata = { title: "Periksa" };

/**
 * Apa yang akan diperiksa untuk tiap jenis identifier.
 *
 * Daftar ini sengaja hanya menyebut sumber yang memang direncanakan, supaya
 * tidak ada janji cakupan yang tidak bisa ditepati.
 */
const RENCANA_PEMERIKSAAN: Record<JenisIdentifier, string[]> = {
  email: [
    "Bentuk dan kewajaran alamatnya",
    "Domain pengirim dan catatan MX-nya",
    "Kaitan dengan bukti yang sudah ada di kasus lo",
  ],
  nomor_hp: [
    "Keabsahan format, wilayah, dan jenis nomor",
    "Kaitan dengan bukti lain — bukan pemilik nomornya",
  ],
  domain: [
    "Catatan pendaftaran domain lewat RDAP",
    "Status, tanggal penting, registrar, dan nameserver yang tersedia",
    "Catatan publik apa adanya — bukan vonis aman atau berbahaya",
  ],
  username: [
    "Pola penggunaan handle yang sama di layanan publik",
    "Sinyal keterkaitan, bukan kesimpulan orang yang sama",
  ],
  nama: [
    "Nama saja terlalu ambigu untuk menyimpulkan identitas",
    "JEJAK bakal minta petunjuk tambahan sebelum melangkah",
  ],
};

export default async function PeriksaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { q } = await searchParams;
  const masukan = typeof q === "string" ? q : "";
  const deteksi = deteksiIdentifier(masukan);
  const telepon = deteksi?.jenis === "nomor_hp" ? validasiTelepon(deteksi.ternormalisasi) : null;
  const nonce = randomUUID();

  let costExact: number | null = null;
  if (deteksi?.jenis === "domain") {
    const { createSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await createSupabaseServerClient();
    const { data: product } = await supabase
      .from("scan_products")
      .select("base_credit_cost")
      .eq("code", "quick_check")
      .eq("active", true)
      .maybeSingle();
    if (product) {
      costExact = product.base_credit_cost;
    }
  }

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Periksa</p>
        <h1 className="hero-judul">Periksa sebelum percaya.</h1>
        <SearchConsole nilaiAwal={masukan} />
      </section>

      {deteksi ? (
        <section aria-labelledby="rencana-judul">
          <h2 id="rencana-judul" className="bagian-judul">
            Yang bakal diperiksa
          </h2>
          <ul className="daftar">
            {RENCANA_PEMERIKSAAN[deteksi.jenis].map((butir) => (
              <li key={butir} className="daftar-item">
                {butir}
              </li>
            ))}
          </ul>
          {deteksi.jenis === "domain" ? (
            <>
              <p className="catatan">
                Versi awal ini cuma memakai RDAP. Kalau sumbernya nggak ngasih hasil yang cukup,
                pemeriksaan ditutup tanpa biaya dan kredit balik otomatis.
              </p>
              {costExact !== null ? (
                <FormMulaiScan masukan={deteksi.ternormalisasi} nonce={nonce} biaya={costExact} />
              ) : (
                <button type="button" className="tombol tombol-utama mt-8" disabled>
                  Mesin pemeriksaan belum tersedia
                </button>
              )}
            </>
          ) : deteksi.jenis === "nomor_hp" && telepon ? (
            <>
              <p className="catatan">
                Validasi format & wilayah — instan, gratis, bukan pemeriksaan berbayar. Ini{" "}
                <strong>bukan</strong> info pemilik nomor.
              </p>
              <dl className="rincian">
                <div>
                  <dt>Status format</dt>
                  <dd>{telepon.valid ? "Valid" : "Tidak valid"}</dd>
                </div>
                {telepon.format ? (
                  <div>
                    <dt>Ditulis rapi</dt>
                    <dd>{telepon.format}</dd>
                  </div>
                ) : null}
                {telepon.wilayah ? (
                  <div>
                    <dt>Wilayah</dt>
                    <dd>{telepon.wilayah}</dd>
                  </div>
                ) : null}
                {telepon.jenis ? (
                  <div>
                    <dt>Jenis nomor</dt>
                    <dd>{telepon.jenis}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : (
            <>
              <p className="catatan">
                Jenis ini belum aktif. Nggak ada pemeriksaan yang dimulai dan nggak ada kredit yang
                dipotong.
              </p>
              <button type="button" className="tombol tombol-utama mt-8" disabled>
                Pemeriksaan belum tersedia
              </button>
            </>
          )}
        </section>
      ) : (
        <p className="kosong">
          Masukin satu hal di kotak atas. JEJAK bakal bilang itu kebaca sebagai apa sebelum ada yang
          dikerjain.
        </p>
      )}
    </div>
  );
}
