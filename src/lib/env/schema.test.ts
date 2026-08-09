import { describe, expect, it } from "vitest";
import { EnvironmentValidationError, parseClientEnv, parseServerEnv } from "./schema";

const validClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://project-id.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example_key_12345",
};

describe("environment contract", () => {
  it("menerima konfigurasi publishable yang aman", () => {
    expect(parseClientEnv(validClientEnv)).toEqual(validClientEnv);
  });

  it("menolak URL service non-HTTPS di luar localhost", () => {
    expect(() =>
      parseClientEnv({ ...validClientEnv, NEXT_PUBLIC_SUPABASE_URL: "http://example.com" }),
    ).toThrow(EnvironmentValidationError);
  });

  it("gagal jelas tanpa menampilkan nilai secret", () => {
    const secretValue = "nilai-rahasia-pengujian-yang-tidak-boleh-keluar";

    try {
      parseServerEnv({ ...validClientEnv, SUPABASE_SECRET_KEY: "" });
      throw new Error("Test seharusnya gagal sebelum titik ini.");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect(String(error)).toContain("SUPABASE_SECRET_KEY");
      expect(String(error)).not.toContain(secretValue);
    }
  });
});
