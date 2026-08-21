"use client";

import { useRef } from "react";
import { hapusKasus } from "@/lib/kasus/actions";

/**
 * Tombol hapus kasus dengan konfirmasi.
 *
 * Soft-delete: kasus masuk sampah dan bisa dibalikin ~3 hari (di server).
 * Konfirmasi di klien mencegah kepencet nggak sengaja; otorisasi tetap di
 * fungsi database.
 */
export function HapusKasus({ caseId }: { caseId: string }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={hapusKasus}>
      <input type="hidden" name="caseId" value={caseId} />
      <button
        type="button"
        className="tombol-bahaya"
        onClick={() => {
          if (confirm("Pindahkan kasus ini ke sampah? Masih bisa dibalikin dalam 3 hari.")) {
            formRef.current?.requestSubmit();
          }
        }}
      >
        Hapus kasus
      </button>
    </form>
  );
}
