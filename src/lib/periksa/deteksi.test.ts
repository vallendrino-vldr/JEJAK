import { describe, expect, it } from "vitest";
import { deteksiIdentifier } from "./deteksi";

describe("deteksi identifier", () => {
  it("mengabaikan input kosong", () => {
    expect(deteksiIdentifier("")).toBeNull();
    expect(deteksiIdentifier("   ")).toBeNull();
  });

  it.each([
    ["budi@contoh.co.id", "budi@contoh.co.id"],
    ["  Budi@Contoh.CO.ID ", "budi@contoh.co.id"],
  ])("mengenali email %s", (masukan, ternormalisasi) => {
    const hasil = deteksiIdentifier(masukan);
    expect(hasil?.jenis).toBe("email");
    expect(hasil?.ternormalisasi).toBe(ternormalisasi);
  });

  it.each([
    ["081234567890", "081234567890"],
    ["+62 812-3456-7890", "+6281234567890"],
    ["(021) 555 1234", "0215551234"],
  ])("mengenali nomor HP %s", (masukan, ternormalisasi) => {
    const hasil = deteksiIdentifier(masukan);
    expect(hasil?.jenis).toBe("nomor_hp");
    expect(hasil?.ternormalisasi).toBe(ternormalisasi);
  });

  it.each([
    ["cekjejak.my.id", "cekjejak.my.id"],
    ["https://www.Contoh.com/halaman", "contoh.com"],
  ])("mengenali domain %s", (masukan, ternormalisasi) => {
    const hasil = deteksiIdentifier(masukan);
    expect(hasil?.jenis).toBe("domain");
    expect(hasil?.ternormalisasi).toBe(ternormalisasi);
  });

  it("mengenali handle dengan @ sebagai username tanpa ragu", () => {
    const hasil = deteksiIdentifier("@budi_santoso");
    expect(hasil?.jenis).toBe("username");
    expect(hasil?.ternormalisasi).toBe("budi_santoso");
    expect(hasil?.alternatif).toEqual([]);
  });

  it("menandai satu kata tanpa spasi sebagai ambigu, bukan kesimpulan", () => {
    const hasil = deteksiIdentifier("budisantoso");
    expect(hasil?.jenis).toBe("username");
    expect(hasil?.alternatif).toContain("nama");
  });

  it("membaca beberapa kata sebagai nama", () => {
    const hasil = deteksiIdentifier("  Budi   Santoso ");
    expect(hasil?.jenis).toBe("nama");
    expect(hasil?.ternormalisasi).toBe("Budi Santoso");
  });

  it("tidak menganggap deretan angka panjang sebagai nomor HP", () => {
    expect(deteksiIdentifier("12345678901234567890")?.jenis).not.toBe("nomor_hp");
  });

  it("tidak menganggap angka terlalu pendek sebagai nomor HP", () => {
    expect(deteksiIdentifier("12345")?.jenis).not.toBe("nomor_hp");
  });
});
