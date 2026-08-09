import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="foundation-shell">
      <section className="foundation-card" aria-labelledby="not-found-title">
        <p className="foundation-kicker">JX-1404</p>
        <h1 id="not-found-title">Halaman ini nggak ditemukan.</h1>
        <p className="foundation-copy">Alamatnya mungkin berubah atau memang sudah nggak ada.</p>
        <div className="error-actions">
          <Link href="/">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
