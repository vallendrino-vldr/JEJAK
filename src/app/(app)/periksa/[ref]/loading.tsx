import styles from "./page.module.css";

export default function HasilPemeriksaanLoading() {
  return (
    <div className={`ruang ${styles.halaman}`} aria-busy="true" aria-live="polite">
      <p className="hanya-pembaca-layar">Lagi membuka status pemeriksaan.</p>
      <section className={`${styles.kepala} ${styles.kerangka}`}>
        <div className={styles.kerangkaBarisPendek} />
        <div className={styles.kerangkaJudul} />
        <div className={styles.kerangkaTeks} />
        <div className={styles.kerangkaTeksPendek} />
      </section>
      <section className={`${styles.bagian} ${styles.kerangka}`}>
        <div className={styles.kerangkaBarisPendek} />
        <div className={styles.kerangkaJudulKecil} />
        <div className={styles.kerangkaGrid}>
          <div />
          <div />
        </div>
      </section>
    </div>
  );
}
