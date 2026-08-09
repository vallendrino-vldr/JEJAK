"use client";

export default function GlobalError({ reset }: Readonly<{ reset: () => void }>) {
  return (
    <html lang="id">
      <body
        style={{
          minHeight: "100dvh",
          margin: 0,
          display: "grid",
          placeItems: "center",
          padding: 24,
          color: "#f4f1e9",
          background: "#08090b",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 520 }}>
          <p style={{ color: "#d7b874" }}>JX-1001</p>
          <h1>Jejak perlu memuat ulang tampilan.</h1>
          <p style={{ color: "#a6a39b", lineHeight: 1.6 }}>
            Data lo nggak ikut hilang. Coba buka ulang fondasi aplikasinya.
          </p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 18px" }}>
            Muat Ulang
          </button>
        </main>
      </body>
    </html>
  );
}
