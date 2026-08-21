"use client";

import { useActionState } from "react";
import { actionMulaiPemeriksaan, type HasilMulaiPemeriksaan } from "@/app/(app)/periksa/actions";

export function FormMulaiScan({
  masukan,
  nonce,
  biaya,
}: {
  masukan: string;
  nonce: string;
  biaya: number;
}) {
  const [hasil, kirim, sedangKirim] = useActionState<HasilMulaiPemeriksaan, FormData>(
    actionMulaiPemeriksaan,
    null,
  );

  return (
    <form action={kirim} className="form mt-8">
      <input type="hidden" name="masukan" value={masukan} />
      <input type="hidden" name="nonce" value={nonce} />

      {hasil?.galat ? (
        <p className="form-galat" role="alert">
          {hasil.galat}
        </p>
      ) : null}

      <button type="submit" className="tombol tombol-utama" disabled={sedangKirim}>
        {sedangKirim ? "Menyiapkan pemeriksaan…" : `Mulai Pemeriksaan (${biaya} Kredit)`}
      </button>
    </form>
  );
}
