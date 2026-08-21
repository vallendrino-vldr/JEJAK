import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormBukti } from "@/components/kasus/form-bukti";
import { HapusKasus } from "@/components/kasus/hapus-kasus";
import { FormTambahPetunjuk } from "@/components/kasus/form-kasus";
import { LABEL_ENTITAS, LABEL_TUJUAN, bacaKasus } from "@/lib/kasus/baca";
import { KELAS_BUKTI, LABEL_KEANDALAN, LABEL_SUMBER, daftarBukti } from "@/lib/kasus/bukti";

export const metadata: Metadata = { title: "Kasus" };

const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function DetailKasusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hasil = await bacaKasus(id);
  const bukti = hasil ? await daftarBukti(id) : [];

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
        <p className="catatan catatan-atas">
          Bukti dari mesin pemeriksaan menyusul. Sementara ini lo bisa nyatet sendiri apa yang lo
          temukan — Jejak bakal nandain itu sebagai bukti dari lo, bukan fakta terverifikasi.
        </p>

        <FormBukti caseId={kasus.id} />

        {bukti.length === 0 ? (
          <p className="kosong">Belum ada bukti di kasus ini.</p>
        ) : (
          <ul className="daftar-bukti">
            {bukti.map((satu) => {
              const kelas = KELAS_BUKTI[satu.evidenceClass];
              return (
                <li key={satu.id} className="bukti" data-nada={kelas?.nada}>
                  <p className="bukti-kelas">{kelas?.label ?? satu.evidenceClass}</p>
                  <p className="bukti-ringkasan">{satu.summary}</p>
                  <p className="bukti-paspor">
                    <span>{LABEL_SUMBER[satu.sourceKind] ?? satu.sourceKind}</span>
                    <span>·</span>
                    <span>{satu.sourceLocator}</span>
                    <span>·</span>
                    <span>Keandalan {LABEL_KEANDALAN[satu.reliability] ?? satu.reliability}</span>
                    <span>·</span>
                    <span>{formatTanggal.format(new Date(satu.observedAt))}</span>
                    {satu.occurredAt ? (
                      <>
                        <span>·</span>
                        <span>Kejadian {formatTanggal.format(new Date(satu.occurredAt))}</span>
                      </>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="hapus-judul" className="bahaya-zona">
        <h2 id="hapus-judul" className="bagian-judul">
          Hapus kasus
        </h2>
        <p className="catatan catatan-atas">
          Kasus masuk sampah dan hilang dari daftar. Masih bisa dibalikin dalam 3 hari sebelum
          benar-benar terhapus.
        </p>
        <HapusKasus caseId={kasus.id} />
      </section>
    </div>
  );
}
