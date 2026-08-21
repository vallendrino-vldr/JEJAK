import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setujuiAction, tolakAction } from "./actions";

export const metadata: Metadata = { title: "Pembayaran — Ruang Kendali" };

type Baris = {
  public_ref: string;
  email_masked: string;
  package_name: string | null;
  expected_amount_idr: number;
  credits_base: number;
  credits_bonus: number;
  status: string;
  submitted_at: string | null;
  proof_bucket: string | null;
  proof_path: string | null;
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const fmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export default async function KendaliPembayaranPage() {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  const boleh =
    sesi.roleCodes.includes("owner") ||
    sesi.roleCodes.includes("admin") ||
    sesi.roleCodes.includes("finance");
  if (!boleh) redirect("/beranda");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_topup_kendali");
  const rows = (data ?? []) as Baris[];

  // Signed URL bukti (berumur pendek) dibuat server-side dari bucket privat.
  const admin = createSupabaseAdminClient();
  const buktiUrl = new Map<string, string>();
  await Promise.all(
    rows.map(async (r) => {
      if (!r.proof_path || !r.proof_bucket) return;
      const { data: signed } = await admin.storage
        .from(r.proof_bucket)
        .createSignedUrl(r.proof_path, 120);
      if (signed?.signedUrl) buktiUrl.set(r.public_ref, signed.signedUrl);
    }),
  );

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Pembayaran</h1>
        <p className="hero-teks">
          {rows.length} top-up menunggu verifikasi. Cocokkan nominal (termasuk angka unik) dengan
          mutasi rekening sebelum menyetujui. Approve = kredit langsung masuk ke user.
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>

      <section aria-label="Antrean pembayaran">
        {rows.length === 0 ? (
          <p className="kosong">Nggak ada pembayaran yang perlu ditangani. Aman.</p>
        ) : (
          <ul className="daftar">
            {rows.map((r) => (
              <li key={r.public_ref} className="kartu" style={{ marginBottom: "1rem" }}>
                <p className="kartu-teks">
                  {r.email_masked} · {r.package_name ?? "Paket"} ({r.credits_base + r.credits_bonus}{" "}
                  kredit)
                </p>
                <p className="statik-angka">{rupiah.format(r.expected_amount_idr)}</p>
                <p className="kartu-meta">
                  {r.public_ref} · dikirim{" "}
                  {r.submitted_at ? fmt.format(new Date(r.submitted_at)) : "-"}
                </p>

                {buktiUrl.has(r.public_ref) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={buktiUrl.get(r.public_ref)}
                    alt={`Bukti transfer ${r.public_ref}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "320px",
                      margin: "0.75rem 0",
                      borderRadius: "var(--lengkung, 12px)",
                    }}
                  />
                ) : (
                  <p className="catatan">Bukti belum tersedia.</p>
                )}

                <div className="hero-aksi" style={{ marginTop: "0.5rem" }}>
                  <form action={setujuiAction}>
                    <input type="hidden" name="ref" value={r.public_ref} />
                    <button type="submit" className="tombol-utama">
                      Setujui
                    </button>
                  </form>
                  <form action={tolakAction} style={{ display: "flex", gap: "0.5rem" }}>
                    <input type="hidden" name="ref" value={r.public_ref} />
                    <input
                      name="alasan"
                      type="text"
                      placeholder="Alasan tolak"
                      maxLength={200}
                      style={{ minWidth: "10rem" }}
                    />
                    <button type="submit" className="tombol-sekunder">
                      Tolak
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
