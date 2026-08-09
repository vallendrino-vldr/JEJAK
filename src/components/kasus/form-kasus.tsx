"use client";

import { useActionState } from "react";
import { buatKasus, tambahPetunjuk, type HasilAksi } from "@/lib/kasus/actions";

const TUJUAN = [
  { nilai: "fraud_check", label: "Dugaan penipuan" },
  { nilai: "self_check", label: "Cek data sendiri" },
  { nilai: "assisted_check", label: "Bantu orang terdekat" },
  { nilai: "public_research", label: "Riset publik" },
] as const;

export function FormBuatKasus() {
  const [hasil, kirim, sedangKirim] = useActionState<HasilAksi, FormData>(buatKasus, null);

  return (
    <form action={kirim} className="form">
      <div className="form-baris">
        <label htmlFor="judul">Judul kasus</label>
        <input
          id="judul"
          name="judul"
          className="isian"
          maxLength={120}
          placeholder="Misalnya: Toko online yang mencurigakan"
          required
        />
      </div>

      <div className="form-baris">
        <label htmlFor="purpose">Tujuan</label>
        <select id="purpose" name="purpose" className="isian" defaultValue="fraud_check">
          {TUJUAN.map((tujuan) => (
            <option key={tujuan.nilai} value={tujuan.nilai}>
              {tujuan.label}
            </option>
          ))}
        </select>
      </div>

      <label className="form-centang">
        <input type="checkbox" name="rahasia" value="ya" />
        <span>
          Jadikan kasus rahasia
          <span className="form-bantuan">
            Judul dan isinya nggak akan muncul di pratinjau atau notifikasi.
          </span>
        </span>
      </label>

      {hasil?.galat ? (
        <p className="form-galat" role="alert">
          {hasil.galat}
        </p>
      ) : null}

      <button type="submit" className="tombol-utama" disabled={sedangKirim}>
        {sedangKirim ? "Menyimpan…" : "Buat kasus"}
      </button>
    </form>
  );
}

export function FormTambahPetunjuk({ caseId }: { caseId: string }) {
  const [hasil, kirim, sedangKirim] = useActionState<HasilAksi, FormData>(tambahPetunjuk, null);

  return (
    <form action={kirim} className="form form-sebaris">
      <input type="hidden" name="caseId" value={caseId} />
      <label className="hanya-pembaca-layar" htmlFor="nilai">
        Petunjuk baru
      </label>
      <input
        id="nilai"
        name="nilai"
        className="isian"
        placeholder="Email, nomor HP, nama, username, atau domain"
        autoComplete="off"
        required
      />
      <button type="submit" className="tombol-utama" disabled={sedangKirim}>
        {sedangKirim ? "Menambah…" : "Tambah"}
      </button>

      {hasil?.galat ? (
        <p className="form-galat" role="alert">
          {hasil.galat}
        </p>
      ) : null}
    </form>
  );
}
