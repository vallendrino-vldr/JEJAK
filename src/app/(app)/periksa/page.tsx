import type { Metadata } from "next";
import { SearchConsole } from "@/components/periksa/search-console";
import { deteksiIdentifier, type JenisIdentifier } from "@/lib/periksa/deteksi";

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
    "Konfigurasi DNS dan tempat domain diarahkan",
    "Halaman publik yang alamatnya sudah diketahui",
  ],
  username: [
    "Pola penggunaan handle yang sama di layanan publik",
    "Sinyal keterkaitan, bukan kesimpulan orang yang sama",
  ],
  nama: [
    "Nama saja terlalu ambigu untuk menyimpulkan identitas",
    "Jejak akan minta petunjuk tambahan sebelum melangkah",
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
          <p className="catatan">
            Mesin pemeriksaannya masih dibangun. Selama itu, Jejak nggak bakal nampilin hasil apa
            pun — mendingan kosong daripada ngarang.
          </p>
        </section>
      ) : (
        <p className="kosong">
          Masukin satu hal di kotak atas. Jejak bakal bilang itu kebaca sebagai apa sebelum ada yang
          dikerjain.
        </p>
      )}
    </div>
  );
}
