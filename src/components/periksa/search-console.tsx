"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IkonPeriksa } from "@/components/ikon";
import { LABEL_JENIS, deteksiIdentifier } from "@/lib/periksa/deteksi";

/**
 * Search Console — objek utama Beranda.
 *
 * Deteksi jenis identifier berjalan lokal saat mengetik. Tidak ada sumber
 * eksternal yang dipanggil di sini, dan tidak ada klaim apa pun soal target;
 * yang ditampilkan hanya "ini kelihatannya jenis apa".
 */
export function SearchConsole({ nilaiAwal = "" }: { nilaiAwal?: string }) {
  const router = useRouter();
  const [nilai, setNilai] = useState(nilaiAwal);

  const deteksi = useMemo(() => deteksiIdentifier(nilai), [nilai]);

  return (
    <form
      className="konsol"
      onSubmit={(event) => {
        event.preventDefault();
        if (!deteksi) return;
        router.push(`/periksa?q=${encodeURIComponent(nilai.trim())}`);
      }}
    >
      <div className="konsol-cincin" data-terdeteksi={deteksi ? "ya" : undefined}>
        <label className="hanya-pembaca-layar" htmlFor="konsol-input">
          Yang mau lo periksa
        </label>
        <input
          id="konsol-input"
          className="konsol-input"
          value={nilai}
          onChange={(event) => setNilai(event.target.value)}
          placeholder="Masukin satu hal yang mau lo periksa"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        <button type="submit" className="konsol-tombol" disabled={!deteksi}>
          <IkonPeriksa />
          <span className="hanya-pembaca-layar">Periksa</span>
        </button>
      </div>

      <p className="konsol-deteksi" role="status">
        {deteksi ? (
          <>
            <span className="konsol-tanda">{deteksi.label}</span>
            {deteksi.alternatif.length > 0 ? (
              <span className="konsol-ragu">
                {" "}
                — bisa juga{" "}
                {deteksi.alternatif
                  .map((jenis) => LABEL_JENIS[jenis].toLowerCase().replace(" terdeteksi", ""))
                  .join(", ")}
                , nanti lo yang pilih
              </span>
            ) : null}
          </>
        ) : (
          <span className="konsol-ragu">Email, nomor HP, nama, username, atau domain.</span>
        )}
      </p>
    </form>
  );
}
