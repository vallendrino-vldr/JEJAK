"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

type PembaruanHasilProps = {
  otomatis: boolean;
  refScan?: string;
  pastikanAntrean?: boolean;
};

export function PembaruanHasil({
  otomatis,
  refScan,
  pastikanAntrean = false,
}: PembaruanHasilProps) {
  const router = useRouter();
  const [sedangMenyinkronkan, mulaiTransisi] = useTransition();
  const sedangMenyinkronkanRef = useRef(false);
  const sedangMemastikanAntreanRef = useRef(false);

  useEffect(() => {
    sedangMenyinkronkanRef.current = sedangMenyinkronkan;
  }, [sedangMenyinkronkan]);

  const segarkan = useCallback(async () => {
    if (sedangMenyinkronkanRef.current) return;

    if (pastikanAntrean && refScan && !sedangMemastikanAntreanRef.current) {
      sedangMemastikanAntreanRef.current = true;
      try {
        await fetch(`/api/periksa/${encodeURIComponent(refScan)}/dispatch`, {
          method: "POST",
          cache: "no-store",
        });
      } catch {
        // Status utama tetap dibaca dari DB pada refresh berikutnya. Gangguan
        // pemicu antrean tidak boleh membuat browser mengarang status baru.
      } finally {
        sedangMemastikanAntreanRef.current = false;
      }
    }

    mulaiTransisi(() => {
      router.refresh();
    });
  }, [pastikanAntrean, refScan, router]);

  useEffect(() => {
    if (!otomatis) return;

    const sinkronkanSaatTerlihat = () => {
      if (document.visibilityState === "visible") void segarkan();
    };

    const intervalId = window.setInterval(sinkronkanSaatTerlihat, 4_000);
    document.addEventListener("visibilitychange", sinkronkanSaatTerlihat);
    sinkronkanSaatTerlihat();

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", sinkronkanSaatTerlihat);
    };
  }, [otomatis, segarkan]);

  return (
    <div className={styles.sinkronisasi}>
      {otomatis ? (
        <p className={styles.sinkronisasiStatus} aria-live="polite" aria-atomic="true">
          <span className={styles.titikAktif} aria-hidden="true" />
          {sedangMenyinkronkan
            ? "Lagi nyocokin status terbaru…"
            : "Status diperbarui otomatis selama pemeriksaan berjalan."}
        </p>
      ) : null}

      <button
        type="button"
        className={styles.tombolSegarkan}
        onClick={() => void segarkan()}
        disabled={sedangMenyinkronkan}
      >
        {sedangMenyinkronkan ? "Menyinkronkan…" : "Segarkan status"}
      </button>
    </div>
  );
}
