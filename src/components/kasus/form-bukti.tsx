"use client";

import { useActionState } from "react";
import type { HasilAksi } from "@/lib/kasus/actions";
import { catatBuktiPengguna } from "@/lib/kasus/bukti-actions";

export function FormBukti({ caseId }: { caseId: string }) {
  const [hasil, kirim, sedangKirim] = useActionState<HasilAksi, FormData>(catatBuktiPengguna, null);

  return (
    <form action={kirim} className="form">
      <input type="hidden" name="caseId" value={caseId} />

      <div className="form-baris">
        <label htmlFor="ringkasan">Apa yang lo temukan</label>
        <input
          id="ringkasan"
          name="ringkasan"
          className="isian"
          maxLength={500}
          placeholder="Misalnya: nomor rekeningnya beda dari yang dikasih di chat"
          required
        />
      </div>

      <div className="form-baris">
        <label htmlFor="asal">Dari mana lo dapat ini</label>
        <input
          id="asal"
          name="asal"
          className="isian"
          maxLength={300}
          placeholder="Misalnya: screenshot chat WhatsApp 3 Agustus"
          required
        />
        <span className="form-bantuan">
          Jejak nggak nyimpen temuan tanpa sumber. Ini yang bikin buktinya bisa dicek lagi nanti.
        </span>
      </div>

      {hasil?.galat ? (
        <p className="form-galat" role="alert">
          {hasil.galat}
        </p>
      ) : null}

      <button type="submit" className="tombol-utama" disabled={sedangKirim}>
        {sedangKirim ? "Menyimpan…" : "Catat bukti"}
      </button>
    </form>
  );
}
