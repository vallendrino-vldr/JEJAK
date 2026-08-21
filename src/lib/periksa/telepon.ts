import { parsePhoneNumberFromString } from "libphonenumber-js";

const TIPE_LABEL: Record<string, string> = {
  MOBILE: "Ponsel",
  FIXED_LINE: "Telepon tetap",
  FIXED_LINE_OR_MOBILE: "Ponsel atau telepon tetap",
  TOLL_FREE: "Bebas pulsa",
  PREMIUM_RATE: "Tarif premium",
  VOIP: "VoIP",
  PERSONAL_NUMBER: "Nomor personal",
  PAGER: "Pager",
  UAN: "Nomor akses universal",
  SHARED_COST: "Berbagi biaya",
};

const WILAYAH_LABEL: Record<string, string> = {
  ID: "Indonesia",
  SG: "Singapura",
  MY: "Malaysia",
  US: "Amerika Serikat",
};

export type ValidasiTelepon = {
  valid: boolean;
  wilayah: string | null;
  jenis: string | null;
  format: string | null;
};

/**
 * Validasi nomor telepon secara lokal (default region Indonesia).
 *
 * Hanya memberi keabsahan format, wilayah, dan jenis nomor — BUKAN pemilik.
 * Tidak memanggil sumber eksternal dan tidak memotong kredit.
 */
export function validasiTelepon(nilai: string): ValidasiTelepon {
  const p = parsePhoneNumberFromString(nilai, "ID");
  if (!p) return { valid: false, wilayah: null, jenis: null, format: null };

  const t = p.getType();
  return {
    valid: p.isValid(),
    wilayah: p.country ? (WILAYAH_LABEL[p.country] ?? p.country) : null,
    jenis: t ? (TIPE_LABEL[t] ?? t) : null,
    format: p.formatInternational(),
  };
}
