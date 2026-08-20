"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { deteksiIdentifier } from "@/lib/periksa/deteksi";
import { dispatchScan } from "@/lib/scan/dispatch";
import { mulaiScan, ScanStartError } from "@/lib/scan/engine";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const masukanSchema = z.string().trim().min(1).max(500);
const nonceSchema = z.uuid();

export type HasilMulaiPemeriksaan = { galat: string } | null;

function pesanMulaiGagal(error: ScanStartError): string {
  switch (error.code) {
    case "unsupported":
      return "Jenis pemeriksaan ini belum aktif.";
    case "invalid":
      return "Domainnya nggak kebaca. Cek lagi ejaannya, ya.";
    case "conflict":
      return "Permintaan ini udah dipakai buat pemeriksaan lain. Muat ulang halaman lalu coba lagi.";
    default:
      return "Mesin pemeriksaan lagi nggak tersedia. Kredit lo belum dipotong.";
  }
}

export async function actionMulaiPemeriksaan(
  _state: HasilMulaiPemeriksaan,
  formData: FormData,
): Promise<HasilMulaiPemeriksaan> {
  const hasilMasukan = masukanSchema.safeParse(formData.get("masukan"));
  const hasilNonce = nonceSchema.safeParse(formData.get("nonce"));

  if (!hasilMasukan.success || !hasilNonce.success) {
    return { galat: "Permintaannya nggak valid. Muat ulang halaman lalu coba lagi." };
  }

  const deteksi = deteksiIdentifier(hasilMasukan.data);
  if (!deteksi || deteksi.jenis !== "domain") {
    return { galat: "Untuk sekarang, pemeriksaan yang aktif baru domain." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/masuk");

  let scan: Awaited<ReturnType<typeof mulaiScan>>;
  try {
    scan = await mulaiScan({
      productCode: "quick_check",
      targetType: "domain",
      targetValue: deteksi.ternormalisasi,
      idempotencyKey: hasilNonce.data,
    });
  } catch (error) {
    return {
      galat:
        error instanceof ScanStartError
          ? pesanMulaiGagal(error)
          : pesanMulaiGagal(new ScanStartError("unavailable")),
    };
  }

  // Outbox di DB tetap pending kalau pemicu ini putus. Halaman hasil akan
  // mengklaimnya lagi; jadi crash sesudah commit tidak membuat scan yatim.
  await dispatchScan(scan.scanId);

  redirect(`/periksa/${scan.publicRef}`);
}
