export const publicErrorCatalog = {
  "JX-1000": {
    message: "Bagian ini lagi tersendat. Coba lagi sebentar.",
    status: 500,
  },
  "JX-1404": {
    message: "Yang lo cari nggak ditemukan.",
    status: 404,
  },
  "JX-1429": {
    message: "Permintaannya lagi terlalu ramai. Coba lagi sebentar.",
    status: 429,
  },
  "JX-2001": {
    message: "Kami belum bisa membuka halaman Google. Coba lagi sebentar.",
    status: 502,
  },
  "JX-2002": {
    message: "Proses masuknya belum selesai. Coba mulai lagi dari awal.",
    status: 400,
  },
  "JX-2003": {
    message: "Tautan masuknya sudah tidak berlaku. Coba masuk lagi.",
    status: 401,
  },
} as const;

export type PublicErrorCode = keyof typeof publicErrorCatalog;

export class AppError extends Error {
  readonly code: PublicErrorCode;
  readonly status: number;

  constructor(code: PublicErrorCode, internalMessage?: string) {
    super(internalMessage ?? publicErrorCatalog[code].message);
    this.name = "AppError";
    this.code = code;
    this.status = publicErrorCatalog[code].status;
  }
}

export function toPublicError(error: unknown) {
  const code: PublicErrorCode = error instanceof AppError ? error.code : "JX-1000";
  return {
    code,
    message: publicErrorCatalog[code].message,
  };
}
