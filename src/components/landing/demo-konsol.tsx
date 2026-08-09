"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { deteksiIdentifier, LABEL_JENIS, type JenisIdentifier } from "@/lib/periksa/deteksi";

/**
 * Demo interaktif lokal untuk landing page.
 *
 * 100% client-side, tidak memanggil API, tidak menampilkan hasil palsu.
 * Hanya menunjukkan kemampuan deteksi jenis identifier secara real-time.
 */

const CONTOH_INPUT = [
  "john@email.com",
  "+628123456789",
  "tokopedia.com",
  "@johndoe",
  "Budi Santoso",
];

const IKON_JENIS: Record<JenisIdentifier, string> = {
  email: "✉",
  nomor_hp: "☏",
  domain: "◎",
  username: "@",
  nama: "⊕",
};

export function DemoKonsol() {
  const [nilai, setNilai] = useState("");
  const [fokus, setFokus] = useState(false);
  const [contohIdx, setContohIdx] = useState(0);
  const [sedangAnimasi, setSedangAnimasi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const deteksi = useMemo(() => deteksiIdentifier(nilai), [nilai]);

  const animasiKetik = useCallback(
    (teks: string) => {
      if (sedangAnimasi) return;
      setSedangAnimasi(true);
      setNilai("");
      let i = 0;
      intervalRef.current = setInterval(() => {
        i++;
        setNilai(teks.slice(0, i));
        if (i >= teks.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Biarkan hasil terlihat sebentar sebelum reset
          setTimeout(() => {
            setSedangAnimasi(false);
          }, 1800);
        }
      }, 65);
    },
    [sedangAnimasi],
  );

  // Auto-demo saat idle: ketik contoh secara bergantian
  useEffect(() => {
    if (fokus || sedangAnimasi) return;

    const timer = setTimeout(() => {
      animasiKetik(CONTOH_INPUT[contohIdx % CONTOH_INPUT.length]);
      setContohIdx((prev) => prev + 1);
    }, 2400);

    return () => clearTimeout(timer);
  }, [fokus, sedangAnimasi, contohIdx, animasiKetik]);

  // Cleanup interval saat fokus berubah atau unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const hentikanAnimasi = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setSedangAnimasi(false);
  }, []);

  const status = deteksi
    ? ("recognized" as const)
    : nilai.length > 0
      ? ("typing" as const)
      : fokus
        ? ("focus" as const)
        : ("idle" as const);

  return (
    <div className="demo" data-status={status}>
      <div className="demo-konsol" data-status={status}>
        <label className="hanya-pembaca-layar" htmlFor="demo-input">
          Coba masukin sesuatu
        </label>
        <input
          ref={inputRef}
          id="demo-input"
          className="demo-input"
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          onFocus={() => {
            hentikanAnimasi();
            setFokus(true);
            setNilai("");
          }}
          onBlur={() => setFokus(false)}
          placeholder="Coba masukin email, nomor HP, atau nama…"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        <div className="demo-indikator" aria-hidden="true">
          {deteksi ? (
            <span className="demo-ikon-jenis">{IKON_JENIS[deteksi.jenis]}</span>
          ) : (
            <span className="demo-titik" />
          )}
        </div>
      </div>

      <div className="demo-hasil" role="status" aria-live="polite">
        {deteksi ? (
          <span className="demo-tanda">
            <span className="demo-tanda-ikon" aria-hidden="true">
              {IKON_JENIS[deteksi.jenis]}
            </span>
            {deteksi.label}
            {deteksi.alternatif.length > 0 && (
              <span className="demo-ragu">
                {" "}
                — bisa juga{" "}
                {deteksi.alternatif
                  .map((j) => LABEL_JENIS[j].toLowerCase().replace(" terdeteksi", ""))
                  .join(", ")}
              </span>
            )}
          </span>
        ) : (
          <span className="demo-petunjuk">
            {fokus
              ? "Ketik apa aja — deteksi langsung jalan."
              : "Deteksi jenis input secara real-time."}
          </span>
        )}
      </div>
    </div>
  );
}
