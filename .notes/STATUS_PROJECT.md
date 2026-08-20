# STATUS PROJECT — JEJAK

> Snapshot operasional lintas-agent. History ada di Git; file ini hanya memuat keadaan sekarang.

## Snapshot

| Item | Keadaan |
|---|---|
| Project | JEJAK — alat pemeriksaan jejak digital berbasis bukti |
| Domain produksi | `https://www.cekjejak.my.id` |
| Mode sesi | RESUME |
| Current Phase | Phase 7 — Source Registry & Scan Engine (`IN_PROGRESS`) |
| Current Milestone | Vertical slice Domain + RDAP yang durable, aman, dan refundable |
| Current Branch | `codex/phase7-domain-rdap-hardening` |
| Baseline Commit | `f996117` — `feat(scan): implement RDAP vertical slice with evidence wiring and settlement` |
| Latest Checkpoint | branch HEAD — `feat(scan): harden durable RDAP workflow` |
| Working Tree | Bersih setelah checkpoint; deterministic gates hijau, live DB gate blocked |
| Latest Deploy | app `0.1.0`, build ID `5b5fbd4d3e34`; lebih lama dari baseline lokal |
| Local Migration Head | `20260820112824_atomic_scan_workflow_boundary.sql` |
| Applied Migration Head | Belum bisa diverifikasi karena project Supabase tidak dapat dijangkau |
| Last Updated | 2026-08-20 oleh Codex |

## Selesai di Working Tree

- Ledger kredit diperketat: fungsi uang hanya bisa dipanggil worker tepercaya, biaya negatif ditolak, retry tidak menggandakan transaksi, dan urutan penguncian dibuat konsisten.
- Mulai scan sekarang satu transaksi utuh: cek akses, snapshot harga/standar hasil, bonus pertama, target terenkripsi, source run, dan pekerjaan dispatch lahir bersama atau batal bersama.
- Request ganda dengan nonce yang sama mengembalikan scan yang sama, termasuk saat datang bersamaan.
- Domain menjadi satu-satunya target yang benar-benar aktif. Tipe lain terlihat sebagai belum tersedia dan tidak memotong kredit.
- RDAP menjadi source live pertama. Adapter punya timeout, batas respons, klasifikasi retry, redirect guard, DNS/IP guard, dan normalisasi metadata aman.
- SSRF guard menolak localhost, jaringan privat/reserved, IPv6 terselubung, mapped IPv4, NAT64, 6to4, port/credential URL, serta redirect ke tujuan tidak aman.
- Workflow scan memakai Vercel Workflow. Payload durable hanya berisi ID; target asli baru dibuka di langkah server yang memerlukannya.
- Dispatch memakai transactional outbox di database, dispatch langsung setelah submit, dan recovery dari halaman hasil. Menutup browser tidak membatalkan record scan.
- Claim source eksklusif memakai token + lease. Retry melepas claim; replay identik aman; hasil berbeda untuk run yang sama ditolak.
- `no_result` selalu bernilai coverage nol, tidak disebut aman, dan kredit dilepas/refund bila standar minimum tidak tercapai.
- Evidence Passport hanya menerima metadata RDAP yang sudah dinormalisasi dan aman. Hasil tanpa Case tetap tersimpan pada source run/scan.
- Halaman hasil `/periksa/[ref]` menampilkan status nyata tanpa persen palsu, berhenti polling saat terminal, dan punya copy eksplisit untuk selesai, gagal, batal, partial, serta refund.
- Form periksa dan halaman hasil responsif, keyboard/touch friendly, serta menghormati reduced motion.
- Dependency transitive `nanoid` dan `undici` dipaksa ke versi aman; audit dependency bersih.

## Sedang Dikerjakan

- Tidak ada coding aktif yang aman dilanjutkan sebelum project Supabase yang benar bisa dijangkau dan migration diterapkan.

## Belum

- Tiga migration baru belum diterapkan ke database live.
- SQL invariant/RLS/ledger suite belum bisa dieksekusi ke database.
- Flow login → scan Domain → hasil → settle/refund belum bisa dites dengan session asli.
- QA visual signed-in pada viewport HP dan desktop belum bisa dilakukan.
- Source Governor Phase 7 belum lengkap: budget harian, health score, dan circuit breaker.
- Source dan target setelah Domain/RDAP (DNS, username, phone, email, name, password exposure, public page) belum diaktifkan.

## Quality Gates

| Area | Status | Last Verified | Catatan |
|---|---|---|---|
| Format | PASS | 2026-08-20 | `pnpm format:check` |
| Lint | PASS | 2026-08-20 | `pnpm lint` |
| TypeScript | PASS | 2026-08-20 | `pnpm typecheck` |
| Unit tests | PASS | 2026-08-20 | 75/75 test, 8 file |
| Workflow tests | PASS | 2026-08-20 | 8/8 termasuk duplicate, lease, retry, refund |
| Production build lokal | PASS | 2026-08-20 | Next.js build; Workflow menemukan 9 steps / 1 workflow |
| Dependency audit | PASS | 2026-08-20 | Tidak ada advisory yang dikenal |
| Secret scan | PASS | 2026-08-20 | Semua candidate files bersih; `.env.local` dan `JEJAK.md` confirmed ignored |
| Local runtime smoke | PASS | 2026-08-20 | `/` dan `/api/version` = 200; protected routes = redirect login |
| Integration tests | PARTIAL | 2026-08-20 | 27/28 pass; satu private-bucket test gagal karena host Supabase `ENOTFOUND` |
| SQL database tests | BLOCKED | 2026-08-20 | 8/8 suite berhenti sebelum test: pooler menolak tenant/user project |
| Static migration audit | PASS | 2026-08-20 | Final verdict `GO`; eksekusi PostgreSQL tetap wajib setelah DB pulih |
| RLS + Ledger live | UNVERIFIED | 2026-08-20 | Test dan migration lokal tersedia, belum bisa dijalankan live |
| Signed-in browser QA | BLOCKED | 2026-08-20 | Endpoint Supabase project tidak resolve |
| Production deploy | NOT DEPLOYED | 2026-08-20 | Build live masih `5b5fbd4d3e34`; batch ini belum didorong |

## Known Issues dan Blocker

- Host API/DB untuk project ref yang tersimpan lokal mengembalikan `NXDOMAIN`; pooler mengembalikan tenant/user tidak ditemukan. Ini konsisten dari aplikasi, test integrasi, test SQL, DNS publik, dan CLI.
- Dashboard Supabase meminta login sehingga agent tidak bisa memastikan apakah project dihapus, pause, dipindah, atau credential lokal sudah basi.
- Migration atomic sengaja abort bila menemukan legacy `scan_targets` tanpa ciphertext/HMAC. Data lama harus diinspeksi dan diputuskan secara sadar; migration tidak boleh menghapus atau mengarang ulang target diam-diam.
- Karena database live belum di-migrate, push ke `main` berisiko membuat deployment memakai kontrak kode yang lebih baru daripada database.

## Next Safe Action

1. Pulihkan atau relink project Supabase yang benar dan pastikan ref/API/DB bisa dijangkau. Ini satu-satunya bagian yang mungkin butuh login/otoritas Product Owner.
2. Inspeksi legacy `scan_targets`; terminalisasi/bersihkan hanya data yang memang aman diubah.
3. Terapkan migration berurutan:
   - `20260820111139_secure_credit_ledger_functions.sql`
   - `20260820111918_harden_credit_ledger_invariants.sql`
   - `20260820112824_atomic_scan_workflow_boundary.sql`
4. Jalankan `pnpm db:test`, `pnpm test:integrasi`, serta privilege/RLS probes sampai hijau penuh.
5. Browser QA dengan akun asli pada HP + desktop: success, no-result/refund, insufficient credit, duplicate submit, tutup-buka browser, dan akses scan milik user lain.
6. Setelah vertical slice terbukti live, lanjutkan Source Governor (budget, health, circuit breaker), lalu source berikutnya sesuai ROADMAP.

## Relevant Decisions

- DEC-0121 — Ledger kredit adalah boundary service-only dan idempotent.
- DEC-0122 — Workflow durable memakai Vercel Workflow + transactional outbox database.
- DEC-0123 — Domain/RDAP dipoles dulu; no-result tidak pernah dianggap aman.
- DEC-0124 — Harga, standar hasil, dan bonus pertama dibekukan atomik saat scan dibuat.

## Relevant Files

- `docs/ROADMAP.md` — Phase 7 dan exit gate.
- `src/app/(app)/periksa/actions.ts` — submit scan terautentikasi.
- `src/app/(app)/periksa/[ref]/` — hasil dan recovery dispatch.
- `src/lib/scan/dispatch.ts` — dispatcher transactional outbox.
- `src/workflows/scan.ts` — workflow durable, claim, retry, finalize/refund.
- `src/lib/scan/adapters/rdap.ts` — adapter RDAP.
- `src/lib/security/public-network.ts` — SSRF/DNS/IP guard.
- `supabase/migrations/20260820111139_secure_credit_ledger_functions.sql` — privilege hardening.
- `supabase/migrations/20260820111918_harden_credit_ledger_invariants.sql` — invariant ledger.
- `supabase/migrations/20260820112824_atomic_scan_workflow_boundary.sql` — atomic scan, outbox, worker RPC.
- `supabase/tests/credit-function-privileges.sql` — privilege checks.
- `supabase/tests/wallet-fefo-invariants.sql` — ledger checks.
- `supabase/tests/scan-workflow-invariants.sql` — workflow boundary checks.

## Handoff Singkat

Jangan deploy atau menandai Phase 7 selesai hanya dari build lokal. Kode lokal sudah jauh lebih aman daripada baseline, tapi bukti live baru sah setelah Supabase pulih, migration diterapkan, SQL suite hijau, dan flow signed-in dilihat berjalan.
