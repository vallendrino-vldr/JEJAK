import { Aurora } from "@/components/aurora";
import { Wordmark } from "@/components/merek";
import { publicBuildInfo } from "@/lib/version";

export default function HomePage() {
  return (
    <main className="foundation-shell">
      <Aurora />
      <section className="foundation-card" aria-labelledby="foundation-title">
        <Wordmark ukuran="besar" />
        <h1 id="foundation-title">Periksa sebelum percaya.</h1>
        <p className="foundation-copy">
          Fondasi aplikasi lagi disiapkan dengan pagar keamanan, quality gate, dan struktur yang
          siap tumbuh tanpa mengorbankan bukti maupun privasi.
        </p>
        <div className="foundation-status" role="status">
          Runtime siap diperiksa
        </div>
        <p className="foundation-version">
          v{publicBuildInfo.version} · build {publicBuildInfo.buildId}
        </p>
      </section>
    </main>
  );
}
