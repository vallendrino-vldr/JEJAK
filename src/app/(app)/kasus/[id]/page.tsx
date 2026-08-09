import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormTambahPetunjuk } from "@/components/kasus/form-kasus";
import { LABEL_ENTITAS, LABEL_TUJUAN, bacaKasus } from "@/lib/kasus/baca";

export const metadata: Metadata = { title: "Kasus" };

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function DetailKasusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hasil = await bacaKasus(id);

  // RLS yang menentukan ini kosong atau tidak. Kasus milik orang lain sampai di
  // sini sebagai "tidak ditemukan", bukan sebagai "dilarang" — supaya keberadaan
  // sebuah kasus tidak bisa ditebak dari selisih respons.
  if (!hasil) {
    notFound();
  }

  const { kasus, petunjuk } = hasil;

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">
          {kasus.public_ref} · {LABEL_TUJUAN[kasus.purpose] ?? kasus.purpose}
          {kasus.is_secret ? " · Rahasia" : ""}
        </p>
        <h1 className="hero-judul">{kasus.title}</h1>
        <p className="hero-teks">
          Dibuat {formatTanggal.format(new Date(kasus.created_at))}. Semua petunjuk di bawah
          disimpen terenkripsi — yang lo lihat cuma bentuk samarnya.
        </p>
      </section>

      <section aria-labelledby="petunjuk-judul">
        <h2 id="petunjuk-judul" className="bagian-judul">
          Petunjuk
        </h2>

        <FormTambahPetunjuk caseId={kasus.id} />

        {petunjuk.length === 0 ? (
          <p className="kosong">
            Belum ada petunjuk. Tambahin email, nomor HP, nama, username, atau domain yang mau lo
            telusurin.
          </p>
        ) : (
          <ul className="daftar">
            {petunjuk.map((satu) => (
              <li key={satu.id} className="daftar-item daftar-item-rapi">
                <span className="tanda-jenis">
                  {LABEL_ENTITAS[satu.entityType] ?? satu.entityType}
                </span>
                <span className="petunjuk-nilai">{satu.displayValueMasked}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="bukti-judul">
        <h2 id="bukti-judul" className="bagian-judul">
          Bukti
        </h2>
        <p className="kosong">
          Belum ada bukti. Bukti masuk dari hasil pemeriksaan, dan mesinnya masih dibangun. Jejak
          nggak bakal ngisi bagian ini pakai tebakan.
        </p>
      </section>
    </div>
  );
}
