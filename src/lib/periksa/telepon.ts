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

// Prefix ponsel Indonesia (3 digit setelah angka 8) → penerbit awal.
// Catatan: karena nomor bisa dipindah antar-operator, ini penerbit AWAL,
// bukan operator sekarang.
const OPERATOR_ID: Record<string, string> = {};
const daftarOperator: [string[], string][] = [
  [["811", "812", "813", "821", "822", "823", "851", "852", "853"], "Telkomsel"],
  [["814", "815", "816", "855", "856", "857", "858"], "Indosat"],
  [["817", "818", "819", "859", "877", "878"], "XL"],
  [["831", "832", "833", "838"], "Axis"],
  [["895", "896", "897", "898", "899"], "Three (3)"],
  [["881", "882", "883", "884", "885", "886", "887", "888", "889"], "Smartfren"],
];
for (const [prefixes, nama] of daftarOperator) {
  for (const p of prefixes) OPERATOR_ID[p] = nama;
}

export type ValidasiTelepon = {
  valid: boolean;
  wilayah: string | null;
  jenis: string | null;
  format: string | null;
  formatNasional: string | null;
  operatorAwal: string | null;
};

/**
 * Validasi nomor telepon secara lokal (default region Indonesia).
 *
 * Format, wilayah, jenis, dan penerbit awal — BUKAN pemilik. Tidak memanggil
 * sumber eksternal dan tidak memotong kredit.
 */
export function validasiTelepon(nilai: string): ValidasiTelepon {
  const p = parsePhoneNumberFromString(nilai, "ID");
  if (!p) {
    return {
      valid: false,
      wilayah: null,
      jenis: null,
      format: null,
      formatNasional: null,
      operatorAwal: null,
    };
  }

  const t = p.getType();
  let operatorAwal: string | null = null;
  if (p.country === "ID") {
    const nn = p.nationalNumber; // mis. "81320014968"
    if (nn.startsWith("8") && nn.length >= 4) {
      operatorAwal = OPERATOR_ID[nn.slice(0, 3)] ?? null;
    }
  }

  return {
    valid: p.isValid(),
    wilayah: p.country ? (WILAYAH_LABEL[p.country] ?? p.country) : null,
    jenis: t ? (TIPE_LABEL[t] ?? t) : null,
    format: p.formatInternational(),
    formatNasional: p.formatNational(),
    operatorAwal,
  };
}
