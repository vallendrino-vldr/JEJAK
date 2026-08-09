import { defineConfig } from "vitest/config";

/**
 * Gate integrasi.
 *
 * Menembak project Supabase sungguhan, jadi butuh `.env.local` dan tidak
 * dijalankan CI publik — repositori ini terbuka, dan menjalankan test yang
 * menyentuh database produksi pada setiap pull request dari siapa pun bukan
 * pertukaran yang sehat.
 *
 * Wajib dijalankan sebelum deploy: `pnpm gate:integrasi`.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
