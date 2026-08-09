import { defineConfig } from "vitest/config";

/**
 * Gate deterministik.
 *
 * Hanya test yang tidak butuh kredensial apa pun dan memberi hasil sama di mesin
 * mana pun. Ini yang dijalankan CI publik. Test yang menembak database sungguhan
 * hidup di `tests/integration` dan punya konfigurasi sendiri.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/lib/**/*.ts"],
    },
  },
});
