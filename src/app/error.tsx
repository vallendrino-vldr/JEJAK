"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error("[JX-1000] Tampilan gagal dimuat", { digest: error.digest ?? "tidak-ada" });
  }, [error.digest]);

  return (
    <main className="foundation-shell">
      <section className="foundation-card" aria-labelledby="error-title">
        <p className="foundation-kicker">JX-1000</p>
        <h1 id="error-title">Bagian ini lagi tersendat.</h1>
        <p className="foundation-copy">
          Data lo tetap aman. Coba muat ulang bagian ini tanpa keluar dari Jejak.
        </p>
        <div className="error-actions">
          <button type="button" onClick={reset}>
            Coba Lagi
          </button>
        </div>
      </section>
    </main>
  );
}
