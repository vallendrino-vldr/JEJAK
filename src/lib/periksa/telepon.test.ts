import { describe, expect, it } from "vitest";
import { validasiTelepon } from "./telepon";

describe("validasi telepon", () => {
  it("mengenali nomor Indonesia yang valid", () => {
    const r = validasiTelepon("081320014968");
    expect(r.valid).toBe(true);
    expect(r.wilayah).toBe("Indonesia");
    expect(r.format).toContain("+62");
  });

  it("menebak penerbit awal dari prefix (0813 = Telkomsel)", () => {
    expect(validasiTelepon("081320014968").operatorAwal).toBe("Telkomsel");
    expect(validasiTelepon("081712345678").operatorAwal).toBe("XL");
  });

  it("menormalkan format internasional", () => {
    expect(validasiTelepon("+628123456789").wilayah).toBe("Indonesia");
  });

  it("menolak yang jelas bukan nomor", () => {
    expect(validasiTelepon("abc").valid).toBe(false);
  });

  it("tidak melempar untuk input aneh", () => {
    expect(() => validasiTelepon("")).not.toThrow();
    expect(() => validasiTelepon("12")).not.toThrow();
  });
});
