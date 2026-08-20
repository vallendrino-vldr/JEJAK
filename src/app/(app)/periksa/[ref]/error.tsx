"use client";

import styles from "./page.module.css";

export default function HasilPemeriksaanError({ reset }: { reset: () => void }) {
  return (
    <div className={`ruang ${styles.halaman}`}>
      <section className={styles.hasilKhusus} data-tone="gagal" aria-labelledby="error-judul">
        <p className={styles.hasilKhususLabel}>Tampilan terputus</p>
        <h1 id="error-judul">Hasilnya belum kebuka dengan benar.</h1>
        <p>Data pemeriksaannya tetap ada. Coba sambungkan lagi tampilan ini ke status terbaru.</p>
        <button type="button" className={styles.tombolSegarkan} onClick={reset}>
          Coba buka lagi
        </button>
      </section>
    </div>
  );
}
