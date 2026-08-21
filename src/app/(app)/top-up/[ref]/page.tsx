import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { kirimBuktiAction } from "../actions";

export const metadata: Metadata = { title: "Pembayaran Top-up" };

type Order = {
  public_ref: string;
  status: string;
  expected_amount_idr: number;
  credits_base: number;
  credits_bonus: number;
  package_snapshot: { name?: string } | null;
  payment_method_snapshot: {
    display_name?: string;
    institution_name?: string;
    account_number?: string;
    account_holder_name?: string;
    instructions?: string | null;
  } | null;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const STATUS: Record<string, { label: string; teks: string }> = {
  awaiting_proof: {
    label: "Menunggu bukti",
    teks: "Transfer nominal PERSIS di bawah, lalu upload bukti transfernya.",
  },
  needs_new_proof: {
    label: "Perlu bukti baru",
    teks: "Bukti sebelumnya belum cukup. Upload ulang, ya.",
  },
  proof_submitted: {
    label: "Bukti terkirim",
    teks: "Bukti lo lagi diverifikasi admin. Kredit masuk otomatis begitu disetujui.",
  },
  under_review: { label: "Sedang direview", teks: "Admin lagi mencocokkan transfer lo." },
  approved: { label: "Disetujui", teks: "Kredit udah masuk ke dompet lo. Makasih!" },
  rejected: {
    label: "Ditolak",
    teks: "Pembayaran ini nggak bisa diverifikasi. Cek Kabar atau hubungi admin.",
  },
  expired: { label: "Kedaluwarsa", teks: "Order ini kelewat waktu. Bikin order baru aja." },
  cancelled: { label: "Dibatalkan", teks: "Order ini dibatalkan." },
};

const GALAT: Record<string, string> = {
  berkas: "Pilih file buktinya dulu.",
  ukuran: "File-nya kegedean (maks 5MB).",
  jenis: "Formatnya cuma JPG, PNG, atau WebP.",
  unggah: "Gagal mengunggah. Coba lagi.",
  simpan: "Gagal menyimpan bukti. Coba lagi.",
};

export default async function OrderTopUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ galat?: string }>;
}) {
  const { ref: raw } = await params;
  const ref = raw.trim().toUpperCase();
  if (!/^TOP[A-Z0-9]{6,40}$/.test(ref)) notFound();
  const { galat } = await searchParams;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/masuk");

  const { data } = await supabase
    .from("topup_orders")
    .select(
      "public_ref,status,expected_amount_idr,credits_base,credits_bonus,package_snapshot,payment_method_snapshot",
    )
    .eq("public_ref", ref)
    .maybeSingle();
  if (!data) notFound();

  const order = data as Order;
  const s = STATUS[order.status] ?? { label: order.status, teks: "" };
  const bank = order.payment_method_snapshot ?? {};
  const bolehUpload = order.status === "awaiting_proof" || order.status === "needs_new_proof";

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Top-up · {order.public_ref}</p>
        <h1 className="hero-judul">{s.label}</h1>
        <p className="hero-teks">{s.teks}</p>
      </section>

      <section className="kartu kartu-statik" aria-label="Nominal transfer">
        <span className="kartu-teks">
          {order.package_snapshot?.name ?? "Paket"} — {order.credits_base + order.credits_bonus}{" "}
          kredit
        </span>
        <span className="statik-angka">{rupiah.format(order.expected_amount_idr)}</span>
        <span className="kartu-meta">
          Transfer nominal PERSIS ini (termasuk angka unik di belakang) biar cepat kecocokannya.
        </span>
      </section>

      {bolehUpload ? (
        <>
          <section className="kartu" aria-label="Rekening tujuan">
            <p className="kartu-teks">
              {bank.institution_name} · {bank.display_name}
            </p>
            <p className="petunjuk-nilai" style={{ fontFamily: "ui-monospace, monospace" }}>
              {bank.account_number}
            </p>
            <p className="kartu-meta">a.n. {bank.account_holder_name}</p>
            {bank.instructions ? <p className="catatan">{bank.instructions}</p> : null}
          </section>

          {galat ? (
            <p className="catatan" role="alert">
              {GALAT[galat] ?? "Ada yang salah."}
            </p>
          ) : null}

          <section className="kartu" aria-label="Upload bukti transfer">
            <form action={kirimBuktiAction}>
              <input type="hidden" name="ref" value={order.public_ref} />
              <label className="kartu-teks" htmlFor="bukti">
                Upload bukti transfer (JPG/PNG/WebP, maks 5MB)
              </label>
              <input
                id="bukti"
                name="bukti"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                required
                style={{ display: "block", margin: "0.75rem 0" }}
              />
              <button type="submit" className="tombol-utama">
                Kirim bukti
              </button>
            </form>
          </section>
        </>
      ) : null}

      <p className="hero-aksi">
        <Link href="/top-up" className="tombol-sekunder">
          Paket lain
        </Link>
        <Link href="/beranda" className="tombol-sekunder">
          Beranda
        </Link>
      </p>
    </div>
  );
}
