import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bacaSesiPengguna } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { beriKreditAction, ubahStatusAction } from "./actions";

export const metadata: Metadata = { title: "Pengguna — Ruang Kendali" };

type Baris = {
  id: string;
  nama: string | null;
  email_masked: string;
  status: string;
  peran: string[];
  saldo: number;
  bergabung: string;
};

const LABEL_STATUS: Record<string, string> = {
  active: "Aktif",
  observed: "Diamati",
  limited: "Dibatasi",
  paused: "Dijeda",
  blocked: "Diblokir",
  deletion_pending: "Menunggu hapus",
  deleted: "Terhapus",
};

const STATUS_PILIH = ["active", "observed", "limited", "paused", "blocked"] as const;

const fmt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" });

export default async function KendaliPenggunaPage() {
  const sesi = await bacaSesiPengguna();
  if (!sesi) redirect("/masuk");
  if (!(sesi.roleCodes.includes("owner") || sesi.roleCodes.includes("admin"))) redirect("/beranda");
  const owner = sesi.roleCodes.includes("owner");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.rpc("daftar_pengguna_kendali");
  const rows = (data ?? []) as Baris[];

  return (
    <div className="ruang">
      <section className="hero hero-rapat">
        <p className="mata-kicker">Ruang Kendali</p>
        <h1 className="hero-judul">Pengguna</h1>
        <p className="hero-teks">
          {rows.length} pengguna terbaru. Email disamarkan.
          {owner ? " Sebagai owner, lo bisa grant kredit & atur status akun di sini." : ""}
        </p>
        <p className="hero-aksi">
          <Link href="/ruang-kendali" className="tombol-sekunder">
            Kembali ke Ringkasan
          </Link>
        </p>
      </section>

      <section aria-label="Daftar pengguna">
        {rows.length === 0 ? (
          <p className="kosong">Belum ada pengguna.</p>
        ) : (
          <ul className="daftar">
            {rows.map((u) => (
              <li key={u.id} className="kartu" style={{ marginBottom: "1rem" }}>
                <p className="petunjuk-nilai">{u.email_masked}</p>
                <p className="kartu-meta">
                  {LABEL_STATUS[u.status] ?? u.status} ·{" "}
                  {u.peran.length ? u.peran.join(", ") : "user"} · <strong>{u.saldo} kredit</strong>{" "}
                  · gabung {fmt.format(new Date(u.bergabung))}
                </p>

                {owner ? (
                  <div className="kendali-aksi">
                    <form action={beriKreditAction} className="form-sebaris">
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="nonce" value={randomUUID()} />
                      <input
                        className="isian"
                        name="kredit"
                        type="number"
                        min={1}
                        max={100000}
                        placeholder="Jumlah kredit"
                        required
                      />
                      <input
                        className="isian"
                        name="alasan"
                        type="text"
                        placeholder="Alasan (opsional)"
                        maxLength={200}
                      />
                      <button type="submit" className="tombol-utama tombol-kecil">
                        Grant kredit
                      </button>
                    </form>

                    <form action={ubahStatusAction} className="form-sebaris">
                      <input type="hidden" name="user_id" value={u.id} />
                      <select className="isian" name="status" defaultValue={u.status}>
                        {STATUS_PILIH.map((s) => (
                          <option key={s} value={s}>
                            {LABEL_STATUS[s]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="tombol-sekunder tombol-kecil">
                        Ubah status
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
