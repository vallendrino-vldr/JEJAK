import { describe, expect, it } from "vitest";
import { AppError, toPublicError } from "./public-error";

describe("public error mapping", () => {
  it("tidak membocorkan pesan internal", () => {
    const publicError = toPublicError(new AppError("JX-1000", "database password leaked"));

    expect(publicError).toEqual({
      code: "JX-1000",
      message: "Bagian ini lagi tersendat. Coba lagi sebentar.",
    });
    expect(publicError.message).not.toContain("database");
  });

  it("mengubah error asing jadi kode aman", () => {
    expect(toPublicError(new Error("stack internal"))).toEqual({
      code: "JX-1000",
      message: "Bagian ini lagi tersendat. Coba lagi sebentar.",
    });
  });
});
