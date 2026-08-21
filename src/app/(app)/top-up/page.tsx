import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buatOrderAction } from "./actions";

export const metadata: Metadata = { title: "Isi Ulang Kredit" };

type Paket = {
  code: string;
  name: string;
  price_idr: number;
  base_credits: number;
  bonus_credits: number;
  validity_days: number;
  badge_text: string | null;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const GALAT: Record<string, string> = {
  input: "Pilihan paketnya nggak kebaca. Coba lagi.",
  rekening: "Belum ada rekening pembayaran aktif. Isi ulang belum bisa jalan — hubungi admin.",
  order: "Gagal bikin order barusan. Coba lagi sebentar.",
};

export default async function TopUpPage({
  searchParams,
}: {
  searchParams: Promise<{ galat?: string }>;
}) {
  const { galat } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { data } = await supabase
    .from("credit_packages")
    .select("code,name,price_idr,base_credits,bonus_credits,validity_days,badge_text")
    .order("display_order", { ascending: true });
  const paket = (data ?? []) as Paket[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Dompet</p>
        <h1 className="hero-judul">Isi Ulang Kredit</h1>
        <p className="hero-teks">
          Pilih paket, transfer manual, lalu upload bukti. Kredit masuk setelah admin memverifikasi
          — nggak ada potong otomatis sebelum itu.
        </p>
      </section>

      {galat ? (
        <p className="catatan" role="alert">
          {GALAT[galat] ?? "Ada yang salah. Coba lagi."}
        </p>
      ) : null}

      <section aria-label="Paket kredit">
        {paket.length === 0 ? (
          <p className="kosong">Belum ada paket tersedia.</p>
        ) : (
          <div className="kartu-grid">
            {paket.map((p) => (
              <form key={p.code} action={buatOrderAction} className="kartu kartu-statik">
                <input type="hidden" name="paket" value={p.code} />
                <input type="hidden" name="nonce" value={randomUUID()} />
                {p.badge_text ? <span className="tanda-jenis">{p.badge_text}</span> : null}
                <span className="statik-angka">{p.base_credits + p.bonus_credits} kredit</span>
                <span className="kartu-teks">
                  {p.name}
                  {p.bonus_credits > 0 ? ` · ${p.base_credits} + ${p.bonus_credits} bonus` : ""}
                </span>
                <span className="kartu-meta">Berlaku {p.validity_days} hari</span>
                <button type="submit" className="tombol-utama" style={{ marginTop: "0.75rem" }}>
                  {rupiah.format(p.price_idr)}
                </button>
              </form>
            ))}
          </div>
        )}
      </section>

      <p className="hero-aksi">
        <Link href="/beranda" className="tombol-sekunder">
          Kembali
        </Link>
      </p>
    </div>
  );
}
