"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Analisa = { ringkasan: string; observasi: string[]; sumber: "ai" | "aturan" };

type Keadaan =
  { fase: "muat" } | { fase: "ada"; data: Analisa } | { fase: "kosong" } | { fase: "gagal" };

export function AnalisaDomain({ refScan }: { refScan: string }) {
  const [keadaan, setKeadaan] = useState<Keadaan>({ fase: "muat" });

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      try {
        const res = await fetch(`/api/periksa/${encodeURIComponent(refScan)}/analisa`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!res.ok) {
          setKeadaan({ fase: "gagal" });
          return;
        }
        const data: unknown = await res.json();
        const isi = data as Partial<Analisa> & { tersedia?: boolean };
        if (isi?.tersedia && typeof isi.ringkasan === "string") {
          setKeadaan({
            fase: "ada",
            data: {
              ringkasan: isi.ringkasan,
              observasi: Array.isArray(isi.observasi) ? isi.observasi : [],
              sumber: isi.sumber === "ai" ? "ai" : "aturan",
            },
          });
        } else {
          setKeadaan({ fase: "kosong" });
        }
      } catch (error) {
        // Batal karena unmount bukan kegagalan; JEJAK tidak mengarang analisa.
        if ((error as Error).name !== "AbortError") setKeadaan({ fase: "gagal" });
      }
    })();

    return () => controller.abort();
  }, [refScan]);

  if (keadaan.fase === "kosong") return null;

  return (
    <section className={styles.bagian} aria-labelledby="analisa-judul">
      <div className={styles.bagianKepala}>
        <div>
          <p className={styles.bagianLabel}>Analisa</p>
          <h2 id="analisa-judul">Bacaan cepat dari catatan</h2>
        </div>
        {keadaan.fase === "ada" ? (
          <span className={styles.analisaChip} data-sumber={keadaan.data.sumber}>
            {keadaan.data.sumber === "ai" ? "Interpretasi AI" : "Ringkasan otomatis"}
          </span>
        ) : null}
      </div>

      {keadaan.fase === "muat" ? (
        <div className={styles.analisaKerangka} aria-busy="true" aria-live="polite">
          <span className="hanya-pembaca-layar">Lagi menyusun bacaan dari catatan.</span>
          <div className={styles.kerangkaTeks} />
          <div className={styles.kerangkaTeksPendek} />
        </div>
      ) : null}

      {keadaan.fase === "gagal" ? (
        <p className={styles.analisaCatatan}>
          Analisanya lagi nggak bisa dimuat. Catatan RDAP di atas tetap lengkap dan jadi acuan
          utama.
        </p>
      ) : null}

      {keadaan.fase === "ada" ? (
        <>
          <p className={styles.analisaRingkasan}>{keadaan.data.ringkasan}</p>
          {keadaan.data.observasi.length ? (
            <ul className={styles.analisaObservasi}>
              {keadaan.data.observasi.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : null}
          <p className={styles.analisaCatatan}>
            {keadaan.data.sumber === "ai"
              ? "Ini bacaan AI atas catatan RDAP di atas—buat bantu paham, bukan sumber fakta. Faktanya tetap dari registri."
              : "Ringkasan otomatis dari catatan RDAP di atas. Faktanya tetap dari registri."}
          </p>
        </>
      ) : null}
    </section>
  );
}
