import { describe, expect, it } from "vitest";
import { tujuanAman } from "./tujuan";

describe("tujuan lanjutan setelah login", () => {
  it("meneruskan path internal apa adanya", () => {
    expect(tujuanAman("/kasus/123")).toBe("/kasus/123");
    expect(tujuanAman("/beranda?tab=kabar")).toBe("/beranda?tab=kabar");
  });

  const ditolak: Array<[string, unknown]> = [
    ["URL absolut", "https://jahat.test/panen"],
    ["protocol-relative", "//jahat.test/panen"],
    ["backslash yang dibaca browser sebagai garis miring", "/\\jahat.test/panen"],
    ["UNC", "\\\\jahat.test"],
    ["skema javascript", "javascript:alert(1)"],
    ["string kosong", ""],
    ["null", null],
    ["undefined", undefined],
    ["objek yang menyamar jadi string", { toString: (): string => "/beranda" }],
  ];

  it.each(ditolak)("menolak %s dan jatuh ke bawaan", (_nama, masukan) => {
    expect(tujuanAman(masukan)).toBe("/beranda");
  });

  it("bawaan bisa diganti", () => {
    expect(tujuanAman("https://jahat.test", "/masuk")).toBe("/masuk");
  });
});
