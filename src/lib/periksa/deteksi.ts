/**
 * Deteksi jenis identifier dari satu kotak input.
 *
 * Semuanya lokal dan murah: tidak memanggil sumber apa pun. Tujuannya membantu
 * pengguna memahami apa yang akan diperiksa, bukan menyimpulkan sesuatu.
 * Validasi nomor yang sesungguhnya memakai libphonenumber di mesin pemeriksaan.
 */
export type JenisIdentifier = "email" | "nomor_hp" | "domain" | "username" | "nama";

export type HasilDeteksi = {
  jenis: JenisIdentifier;
  label: string;
  /** Kemungkinan lain yang masuk akal, supaya input ambigu tidak diklaim sepihak. */
  alternatif: JenisIdentifier[];
  /** Bentuk yang sudah dirapikan untuk dipakai lebih lanjut. */
  ternormalisasi: string;
};

export const LABEL_JENIS: Record<JenisIdentifier, string> = {
  email: "Email terdeteksi",
  nomor_hp: "Nomor HP terdeteksi",
  domain: "Domain terdeteksi",
  username: "Username terdeteksi",
  nama: "Nama terdeteksi",
};

const POLA_EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const POLA_DOMAIN = /^(?!-)[a-z0-9-]{1,63}(\.(?!-)[a-z0-9-]{1,63})*\.[a-z]{2,24}$/;
const POLA_USERNAME = /^[a-z0-9](?:[a-z0-9._-]{1,38})$/;

function bersihkanNomor(nilai: string) {
  return nilai.replace(/[\s()./-]/g, "");
}

/** Betul-betul terlihat seperti nomor telepon, bukan sekadar ada angkanya. */
function mungkinNomor(nilai: string) {
  const bersih = bersihkanNomor(nilai);
  if (!/^\+?\d+$/.test(bersih)) return false;

  const digit = bersih.replace(/^\+/, "");
  return digit.length >= 7 && digit.length <= 15;
}

function tanpaSkema(nilai: string) {
  return nilai
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/.*$/, "");
}

export function deteksiIdentifier(masukan: string): HasilDeteksi | null {
  const rapi = masukan.trim();
  if (rapi.length === 0) return null;

  const kecil = rapi.toLowerCase();

  if (POLA_EMAIL.test(kecil)) {
    return { jenis: "email", label: LABEL_JENIS.email, alternatif: [], ternormalisasi: kecil };
  }

  if (mungkinNomor(rapi)) {
    return {
      jenis: "nomor_hp",
      label: LABEL_JENIS.nomor_hp,
      alternatif: [],
      ternormalisasi: bersihkanNomor(rapi),
    };
  }

  const kandidatDomain = tanpaSkema(kecil);
  if (POLA_DOMAIN.test(kandidatDomain)) {
    return {
      jenis: "domain",
      label: LABEL_JENIS.domain,
      alternatif: [],
      ternormalisasi: kandidatDomain,
    };
  }

  if (kecil.startsWith("@")) {
    const handle = kecil.slice(1);
    if (POLA_USERNAME.test(handle)) {
      return {
        jenis: "username",
        label: LABEL_JENIS.username,
        alternatif: [],
        ternormalisasi: handle,
      };
    }
  }

  // Ada spasi berarti hampir pasti nama orang, bukan handle.
  if (/\s/.test(rapi)) {
    return {
      jenis: "nama",
      label: LABEL_JENIS.nama,
      alternatif: [],
      ternormalisasi: rapi.replace(/\s+/g, " "),
    };
  }

  // Satu kata tanpa spasi bisa username, bisa nama panggilan. Jangan diklaim sepihak.
  if (POLA_USERNAME.test(kecil)) {
    return {
      jenis: "username",
      label: LABEL_JENIS.username,
      alternatif: ["nama"],
      ternormalisasi: kecil,
    };
  }

  return { jenis: "nama", label: LABEL_JENIS.nama, alternatif: [], ternormalisasi: rapi };
}
