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
| Latest Checkpoint | commit ini — `fix(supabase): lock canonical project boundary` |
| Working Tree | Bersih setelah checkpoint; preview/PR QA masih pending |
| Latest Deploy | app `0.1.0`, build ID `5b5fbd4d3e34`; lebih lama dari baseline lokal |
| Local Migration Head | `20260820150759_revoke_global_function_defaults.sql` |
| Applied Migration Head | Canonical lama: `20260820150759` (20 migration); duplikat baru tetap kosong |
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

- Preview SHA checkpoint, PR Quality Gate, dan signed-in browser QA.

## Audit Supabase 2026-08-20

- Project lama `tauyicvfhpfnohhgccvn` resmi canonical. Production OAuth terbukti mengarah ke ref ini; Google provider aktif dan handoff sampai `accounts.google.com` memakai callback ref yang sama.
- Database canonical PostgreSQL 17.6 sudah di-upgrade dari 15 ke 20 migration, head `20260820150759`. Seluruh 24 tabel public ber-RLS.
- State asli tetap bersih: 1 Auth user Google yang aktif sebagai Owner, 1 profile, 1 wallet, 2 bucket private kosong, dan 2 nama secret Vault identifier. Tidak ada case, scan, transaksi, storage object, atau fixture test tersisa.
- Ledger/worker RPC service-only; `mulai_scan` dan boundary user exact-allowlist. Semua SECURITY DEFINER public punya `anon EXECUTE = false`.
- Default privilege role postgres ditutup global **dan** per-schema. Suite membuat function probe sementara dan membuktikan anon/authenticated tidak mewarisi EXECUTE, lalu menghapus probe di statement yang sama.
- `.env.local` sekarang menunjuk canonical lama dan tetap ignored. CLI sengaja di-unlink karena login CLI milik akun project duplikat; `db-test` fail-closed kecuali DB URL/link match ref canonical.
- Project baru `gzmtzdvxerpvetfmqale` tetap Free, ACTIVE_HEALTHY, dan kosong. Ia cuma cadangan kosong sementara—bukan rollback siap pakai karena belum punya schema/data/OAuth/config production—sampai preview + production signed-in QA stabil; belum dihapus/di-pause.
- Production masih build lama `5b5fbd4d3e34`. Branch preview remote masih SHA `689e9f4`, jadi belum memuat hardening post-migration terbaru.

## Belum

- Flow login → scan Domain → hasil → settle/refund belum bisa dites dengan session asli.
- QA visual signed-in pada viewport HP dan desktop belum bisa dilakukan.
- Preview untuk SHA checkpoint dan Quality Gate PR belum diverifikasi.
- Production belum menjalankan vertical slice Phase 7 terbaru.
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
| Integration tests | PASS | 2026-08-20 | 28/28 terhadap project canonical lama |
| SQL database tests | PASS | 2026-08-20 | 9/9 suite live; isolation, ledger, workflow, SECURITY DEFINER, default ACL |
| Migration history | PASS | 2026-08-20 | Local/remote 20/20, head `20260820150759` |
| DB lint + Security Advisor | PASS | 2026-08-20 | Tidak ada issue level error/warn setelah migration |
| RLS + Ledger live | PASS | 2026-08-20 | Privilege matrix live + suite PostgreSQL hijau |
| Signed-in browser QA | PENDING | 2026-08-20 | Perlu preview SHA final dan session Google asli |
| Production deploy | NOT DEPLOYED | 2026-08-20 | Build live masih `5b5fbd4d3e34`; batch ini belum didorong |

## Known Issues dan Blocker

- CLI saat ini terautentikasi ke akun pemilik project duplikat dan sengaja tidak ditautkan. Operasi DB canonical harus memakai URL tervalidasi atau login akun lama.
- Preview Vercel dilindungi SSO dan remote masih SHA lama; QA signed-in belum mewakili working tree final.
- Production masih build lama. Jangan merge sebelum preview final membuktikan login → scan → hasil → settle/refund.
- Free plan dapat pause saat lama tidak aktif dan tidak memberi backup otomatis; tetapkan strategi backup sebelum menerima data user nyata.
- Docker Desktop tidak tersedia, jadi cache katalog/local reset Supabase CLI tidak jalan. Ini tidak memengaruhi migration/test remote yang sudah hijau.

## Next Safe Action

1. Pastikan preview Vercel baru berasal dari SHA checkpoint dan env-nya tetap menunjuk project canonical lama.
2. Browser QA akun asli pada HP + desktop: success, no-result/refund, insufficient credit, duplicate submit, tutup-buka browser, dan akses scan milik user lain.
3. Buka/cek PR supaya GitHub Quality Gate berjalan; merge/deploy production hanya setelah preview hijau.
4. Verifikasi production signed-in dan `/api/version`; observasi ledger/scan tanpa data fixture.
5. Setelah production stabil, hapus project duplikat baru untuk membebaskan slot Free dan bersihkan credential bootstrap lokalnya.
6. Lanjutkan Source Governor (budget, health, circuit breaker), lalu source berikutnya sesuai ROADMAP.

## Relevant Decisions

- DEC-0121 — Ledger kredit adalah boundary service-only dan idempotent.
- DEC-0122 — Workflow durable memakai Vercel Workflow + transactional outbox database.
- DEC-0123 — Domain/RDAP dipoles dulu; no-result tidak pernah dianggap aman.
- DEC-0124 — Harga, standar hasil, dan bonus pertama dibekukan atomik saat scan dibuat.
- DEC-0125 — Project Supabase lama adalah canonical; duplikat baru hanya cadangan kosong sementara.

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
- `supabase/migrations/20260820150210_lock_legacy_authenticated_rpcs.sql` — exact RPC allowlist lama.
- `supabase/migrations/20260820150759_revoke_global_function_defaults.sql` — default ACL global + per-schema.
- `supabase/tests/credit-function-privileges.sql` — privilege checks.
- `supabase/tests/wallet-fefo-invariants.sql` — ledger checks.
- `supabase/tests/scan-workflow-invariants.sql` — workflow boundary checks.
- `supabase/tests/security-definer-privileges.sql` — exact allowlist dan probe default privilege.
- `scripts/select-supabase-environment.ps1` — switch env canonical tanpa mencetak secret.

## Handoff Singkat

Saat user bilang `lanjut`, mulai dari preview SHA checkpoint + PR Quality Gate + signed-in QA di atas—jangan mengulang provisioning dan jangan push ke project duplikat. Database canonical sudah migrated dan terbukti hijau; Phase 7 tetap belum selesai sampai flow signed-in dilihat berjalan di preview lalu production.
