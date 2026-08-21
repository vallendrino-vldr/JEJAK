import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AnalisaDomain } from "./analisa-domain";
import { HasilRdap } from "./hasil-rdap";
import { PembaruanHasil } from "./pembaruan-hasil";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Hasil Pemeriksaan" };

type ScanStatus =
  | "requested"
  | "credit_reserved"
  | "running"
  | "partial"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

type ScanRecord = {
  id: string;
  public_ref: string;
  status: ScanStatus;
  purpose: string;
  product_code: string;
  requested_at: string;
  started_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  coverage_score: number | null;
  failure_reason_code: string | null;
  current_stage: string | null;
  created_at: string;
  updated_at: string;
};

type ScanTargetRecord = {
  id: string;
  scan_id: string;
  target_type: string;
  display_value_masked: string;
  created_at: string;
};

type SourceRunRecord = {
  id: string;
  scan_id: string;
  source_id: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  latency_ms: number | null;
  coverage_contribution: number | null;
  safe_metadata: unknown;
  created_at: string;
};

type SourceRecord = {
  id: string;
  code: string;
  name: string;
  status: string;
};

type NadaStatus = "aktif" | "selesai" | "refund" | "gagal" | "netral";

type StatusCopy = {
  label: string;
  judul: string;
  deskripsi: string;
  nada: NadaStatus;
};

const STATUS_COPY: Record<ScanStatus, StatusCopy> = {
  requested: {
    label: "Permintaan diterima",
    judul: "Pemeriksaan lagi disiapkan.",
    deskripsi:
      "JEJAK sudah menerima permintaan lo. Kredit belum dianggap terpakai sampai prosesnya benar-benar jalan.",
    nada: "aktif",
  },
  credit_reserved: {
    label: "Kredit dicadangkan",
    judul: "Pemeriksaan siap dijalankan.",
    deskripsi:
      "Kredit dicadangkan sementara supaya pemeriksaan nggak terpotong di tengah. Hasil akhir yang menentukan settle atau refund.",
    nada: "aktif",
  },
  running: {
    label: "Sedang diperiksa",
    judul: "JEJAK lagi membaca catatan domain.",
    deskripsi:
      "Sumber RDAP lagi diperiksa di server. Lo boleh pindah layar atau menutup aplikasi; prosesnya tetap lanjut.",
    nada: "aktif",
  },
  partial: {
    label: "Sedang dirapikan",
    judul: "Temuan yang tersedia lagi disusun.",
    deskripsi:
      "Sebagian proses sudah selesai. JEJAK masih memastikan hasil dan status kreditnya konsisten.",
    nada: "aktif",
  },
  completed: {
    label: "Selesai",
    judul: "Catatan pendaftaran domain ditemukan.",
    deskripsi:
      "Di bawah ini adalah fakta publik yang dikembalikan RDAP—bukan kesimpulan bahwa sebuah domain aman atau berbahaya.",
    nada: "selesai",
  },
  refunded: {
    label: "Kredit dikembalikan",
    judul: "Belum nemu jejak yang cukup.",
    deskripsi:
      "Analisis belum memenuhi standar JEJAK, jadi kredit lo sudah dikembalikan. Ini bukan berarti domainnya pasti aman.",
    nada: "refund",
  },
  failed: {
    label: "Nggak berhasil",
    judul: "Pemeriksaan belum bisa dijalankan.",
    deskripsi:
      "JEJAK berhenti sebelum hasil bisa dibuat. Status ini berarti pemeriksaan nggak ditagihkan.",
    nada: "gagal",
  },
  cancelled: {
    label: "Dibatalkan",
    judul: "Pemeriksaan nggak jadi dijalankan.",
    deskripsi: "Permintaan berhenti sebelum proses dimulai, jadi kredit nggak dipotong.",
    nada: "netral",
  },
};

const STATUS_SUMBER: Record<string, { label: string; nada: NadaStatus }> = {
  queued: { label: "Menunggu giliran", nada: "netral" },
  running: { label: "Sedang diperiksa", nada: "aktif" },
  success: { label: "Data ditemukan", nada: "selesai" },
  no_result: { label: "Belum ada data", nada: "refund" },
  failed: { label: "Sumber gagal dijangkau", nada: "gagal" },
  skipped: { label: "Nggak diperlukan", nada: "netral" },
  budget_limited: { label: "Dibatasi anggaran sumber", nada: "netral" },
};

const STATUS_VALID = new Set<ScanStatus>([
  "requested",
  "credit_reserved",
  "running",
  "partial",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);

const STATUS_BELUM_TERMINAL = new Set<ScanStatus>([
  "requested",
  "credit_reserved",
  "running",
  "partial",
]);

const formatWaktu = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function sebagaiScan(value: unknown): ScanRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const scan = value as Record<string, unknown>;

  if (
    typeof scan.id !== "string" ||
    typeof scan.public_ref !== "string" ||
    typeof scan.status !== "string" ||
    !STATUS_VALID.has(scan.status as ScanStatus)
  ) {
    return null;
  }

  return value as ScanRecord;
}

function waktu(value: string | null | undefined) {
  if (!value) return null;
  const tanggal = new Date(value);
  return Number.isNaN(tanggal.getTime()) ? null : formatWaktu.format(tanggal);
}

function durasiSumber(milidetik: number | null) {
  if (typeof milidetik !== "number" || !Number.isFinite(milidetik) || milidetik < 0) return null;
  if (milidetik < 1_000) return "kurang dari 1 detik";

  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(
    milidetik / 1_000,
  )} detik`;
}

function cakupan(score: number | null) {
  return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 100
    ? Math.round(score)
    : null;
}

function maknaMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const meaning = (value as Record<string, unknown>).meaning;
  return typeof meaning === "string" ? meaning : null;
}

function namaSumber(source: SourceRecord | undefined, run: SourceRunRecord) {
  if (
    source?.code === "core_rdap" ||
    maknaMetadata(run.safe_metadata) === "public_registration_record"
  ) {
    return "Catatan pendaftaran domain (RDAP)";
  }

  return source?.name ?? "Sumber pemeriksaan";
}

async function bacaHasil(ref: string) {
  const supabase = await createSupabaseServerClient();
  const { data: scanRaw, error: scanError } = await supabase
    .from("scans")
    .select(
      "id,public_ref,status,purpose,product_code,requested_at,started_at,completed_at,failed_at,coverage_score,failure_reason_code,current_stage,created_at,updated_at",
    )
    .eq("public_ref", ref)
    .maybeSingle();

  if (scanError) return { jenis: "galat" as const };

  const scan = sebagaiScan(scanRaw);
  if (!scan) return { jenis: "tidak-ada" as const };

  const [targetResponse, runsResponse] = await Promise.all([
    supabase
      .from("scan_targets")
      .select("id,scan_id,target_type,display_value_masked,created_at")
      .eq("scan_id", scan.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("scan_source_runs")
      .select(
        "id,scan_id,source_id,status,started_at,finished_at,latency_ms,coverage_contribution,safe_metadata,created_at",
      )
      .eq("scan_id", scan.id)
      .order("created_at", { ascending: true }),
  ]);

  const target = targetResponse.data as ScanTargetRecord | null;
  const runs = (runsResponse.data ?? []) as SourceRunRecord[];
  const sourceIds = [...new Set(runs.map((run) => run.source_id))];

  let sources: SourceRecord[] = [];
  let sourceError = false;

  if (sourceIds.length) {
    const response = await supabase
      .from("source_registry")
      .select("id,code,name,status")
      .in("id", sourceIds);

    sources = (response.data ?? []) as SourceRecord[];
    sourceError = Boolean(response.error);
  }

  return {
    jenis: "ada" as const,
    scan,
    target,
    runs,
    sources,
    detailBermasalah: Boolean(targetResponse.error || runsResponse.error || sourceError),
  };
}

function KartuRefund({ adaNoResult }: { adaNoResult: boolean }) {
  return (
    <section className={styles.hasilKhusus} data-tone="refund" aria-labelledby="refund-judul">
      <p className={styles.hasilKhususLabel}>Settlement selesai</p>
      <h2 id="refund-judul">Kredit lo sudah kembali.</h2>
      <p>
        {adaNoResult
          ? "Sumber RDAP belum menemukan catatan yang cukup untuk hasil layak. Itu bukan bukti bahwa domain ini aman—cuma berarti data yang tersedia belum cukup."
          : "Sumber belum memberi hasil yang memenuhi standar JEJAK. Nggak ada hasil yang dipaksakan, dan kredit pemeriksaan ini dikembalikan penuh."}
      </p>
    </section>
  );
}

export default async function HasilPemeriksaanPage({
  params,
}: {
  params: Promise<{ ref: string }>;
}) {
  const { ref: rawRef } = await params;
  const ref = rawRef.trim().toUpperCase();

  if (!/^SCN[A-Z0-9]{8,32}$/.test(ref)) notFound();

  const hasil = await bacaHasil(ref);

  if (hasil.jenis === "tidak-ada") notFound();

  if (hasil.jenis === "galat") {
    return (
      <div className={`ruang ${styles.halaman}`}>
        <section className={styles.hasilKhusus} data-tone="gagal" aria-labelledby="galat-judul">
          <p className={styles.hasilKhususLabel}>Status belum tersambung</p>
          <h1 id="galat-judul">Hasilnya lagi nggak bisa dibuka.</h1>
          <p>
            Data lo nggak hilang. JEJAK cuma belum bisa membaca status terbaru dari server sekarang.
          </p>
          <PembaruanHasil otomatis={false} />
        </section>
      </div>
    );
  }

  const { scan, target, runs, sources, detailBermasalah } = hasil;
  const statusCopy = STATUS_COPY[scan.status];
  const otomatis = STATUS_BELUM_TERMINAL.has(scan.status);
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const rdapRun =
    runs.find((run) => sourcesById.get(run.source_id)?.code === "core_rdap") ??
    runs.find((run) => maknaMetadata(run.safe_metadata) === "public_registration_record");
  const adaNoResult = runs.some((run) => run.status === "no_result");
  const score = cakupan(scan.coverage_score);

  return (
    <div className={`ruang ${styles.halaman}`}>
      <header className={styles.kepala} data-tone={statusCopy.nada}>
        <div className={styles.kepalaAtas}>
          <div>
            <p className="mata-kicker">Pemeriksaan domain · {scan.public_ref}</p>
            <p className={styles.target}>{target?.display_value_masked ?? "Target tersamarkan"}</p>
          </div>
          <span className={styles.statusBadge} data-tone={statusCopy.nada}>
            {statusCopy.label}
          </span>
        </div>

        <div className={styles.kepalaIsi}>
          <h1>{statusCopy.judul}</h1>
          <p>{statusCopy.deskripsi}</p>
        </div>

        <PembaruanHasil
          otomatis={otomatis}
          refScan={scan.public_ref}
          pastikanAntrean={scan.status === "requested"}
        />
      </header>

      {scan.status === "completed" ? (
        <>
          <section className={styles.bagian} aria-labelledby="catatan-rdap-judul">
            <div className={styles.bagianKepala}>
              <div>
                <p className={styles.bagianLabel}>Sumber publik</p>
                <h2 id="catatan-rdap-judul">Catatan pendaftaran RDAP</h2>
              </div>
              {score !== null ? (
                <p className={styles.cakupan}>
                  <span>Kelengkapan analisis</span>
                  <strong>{score}%</strong>
                </p>
              ) : null}
            </div>

            <HasilRdap metadata={rdapRun?.safe_metadata} />
          </section>

          <AnalisaDomain refScan={scan.public_ref} />
        </>
      ) : null}

      {scan.status === "refunded" ? <KartuRefund adaNoResult={adaNoResult} /> : null}

      {detailBermasalah ? (
        <p className={styles.peringatanDetail} role="status">
          Sebagian rincian sumber lagi nggak bisa dimuat. Status utama di atas tetap berasal dari
          server; coba segarkan lagi sebentar.
        </p>
      ) : null}

      {runs.length ? (
        <section className={styles.bagian} aria-labelledby="sumber-judul">
          <div className={styles.bagianKepala}>
            <div>
              <p className={styles.bagianLabel}>Jejak proses</p>
              <h2 id="sumber-judul">Sumber yang diperiksa</h2>
            </div>
          </div>

          <ul className={styles.sumberList}>
            {runs.map((run) => {
              const source = sourcesById.get(run.source_id);
              const status = STATUS_SUMBER[run.status] ?? {
                label: "Status sedang diselaraskan",
                nada: "netral" as NadaStatus,
              };
              const selesai = waktu(run.finished_at);
              const durasi = durasiSumber(run.latency_ms);

              return (
                <li key={run.id} className={styles.sumberItem}>
                  <div>
                    <p className={styles.sumberNama}>{namaSumber(source, run)}</p>
                    <p className={styles.sumberMeta}>
                      {[selesai ? `Selesai ${selesai}` : null, durasi ? `Durasi ${durasi}` : null]
                        .filter(Boolean)
                        .join(" · ") || "Menunggu pembaruan dari server"}
                    </p>
                  </div>
                  <span className={styles.sumberStatus} data-tone={status.nada}>
                    {status.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <footer className={styles.kaki}>
        <p>
          Diminta {waktu(scan.requested_at) ?? "baru saja"}. Hasil JEJAK adalah bahan untuk
          verifikasi lanjut, bukan vonis tentang orang atau bisnis.
        </p>
        <Link href="/periksa" className={styles.tautanLanjut}>
          Periksa hal lain
        </Link>
      </footer>
    </div>
  );
}
