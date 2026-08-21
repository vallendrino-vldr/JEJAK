# STATUS PROJECT — JEJAK

> **AGENT BARU: baca `.notes/HANDOFF.md` DULU** — itu titik masuk lengkap (status, ops deploy, cara migration, yang belum, larangan). File ini cuma snapshot ringkas.


> Snapshot operasional lintas-agent. History ada di Git; file ini hanya memuat keadaan sekarang.

## Snapshot

| Item | Keadaan |
|---|---|
| Project | JEJAK — alat pemeriksaan jejak digital berbasis bukti |
| Domain produksi | `https://www.cekjejak.my.id` |
| Mode sesi | RESUME |
| Current Phase | Periksa 4/5 tipe live · 10 admin (4 view) · 12 hapus/pulihkan kasus · 13 PWA install — semua live |
| Current Milestone | Vertical slice Domain + RDAP yang durable, aman, dan refundable |
| Current Branch | `codex/phase7-domain-rdap-hardening` |
| Baseline Commit | `f996117` — `feat(scan): implement RDAP vertical slice with evidence wiring and settlement` |
| Latest Checkpoint | commit ini — `fix(workflow): keep internal runner outside auth redirect` |
| Working Tree | Bersih. Git push + DB access dua-duanya jalan (transient tempo hari sudah pulih). |
| Latest Deploy | Preview checkpoint `2d757b4` sukses; production tetap build lama `5b5fbd4d3e34` |
| Local Migration Head | `20260821080000_sampah_kasus.sql` |
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
- Namespace mesin `/.well-known/workflow/v1` sekarang melewati redirect login secara exact. Path tiruan tetap ditolak, sementara flow/step/webhook asli mencapai handler Workflow SDK.
- Dispatch memakai transactional outbox di database, dispatch langsung setelah submit, dan recovery dari halaman hasil. Menutup browser tidak membatalkan record scan.
- Claim source eksklusif memakai token + lease. Retry melepas claim; replay identik aman; hasil berbeda untuk run yang sama ditolak.
- `no_result` selalu bernilai coverage nol, tidak disebut aman, dan kredit dilepas/refund bila standar minimum tidak tercapai.
- Evidence Passport hanya menerima metadata RDAP yang sudah dinormalisasi dan aman. Hasil tanpa Case tetap tersimpan pada source run/scan.
- Halaman hasil `/periksa/[ref]` menampilkan status nyata tanpa persen palsu, berhenti polling saat terminal, dan punya copy eksplisit untuk selesai, gagal, batal, partial, serta refund.
- Form periksa dan halaman hasil responsif, keyboard/touch friendly, serta menghormati reduced motion.
- Navigasi Owner tidak lagi menawarkan Ruang Kendali Phase 10 yang belum punya halaman. Tombol Dompet/Kembali tetap punya nama aksesibel saat label visual disembunyikan di HP.
- Dependency transitive `nanoid` dan `undici` dipaksa ke versi aman; audit dependency bersih.

## Sedang Dikerjakan

- Draft PR [#1](https://github.com/vallendrino-vldr/JEJAK/pull/1) sudah terbuka. Quality Gate dan preview checkpoint hijau; follow-up workflow ini perlu preview final sebelum PR diubah dari draft.
- Signed-in QA di preview masih menunggu akses melewati Vercel SSO. Runtime lokal sudah memakai sesi Google asli dan database canonical.

## Audit Supabase 2026-08-20

- Project lama `tauyicvfhpfnohhgccvn` resmi canonical. Production OAuth terbukti mengarah ke ref ini; Google provider aktif dan handoff sampai `accounts.google.com` memakai callback ref yang sama.
- Database canonical PostgreSQL 17.6 sudah di-upgrade dari 15 ke 20 migration, head `20260820150759`. Seluruh 24 tabel public ber-RLS.
- Sebelum browser QA, state asli berisi 1 Auth user Google aktif sebagai Owner, 1 profile, 1 wallet, 2 bucket private kosong, dan 2 nama secret Vault identifier; tidak ada case/scan/storage object.
- Sesudah QA ada dua jejak yang sengaja dipertahankan: satu selesai dengan RDAP `icann.org`, satu berakhir `refunded` untuk domain acak tanpa hasil. Tiga scan macet/gagal pra-patch sudah dihapus setelah dipastikan tidak punya hold atau potongan kredit. Kredit yang dipakai buat QA diganti lewat grant audit bernama `qa_browser_credit_restore`; saldo Owner kembali 1 dan reserved 0.
- Ledger/worker RPC service-only; `mulai_scan` dan boundary user exact-allowlist. Semua SECURITY DEFINER public punya `anon EXECUTE = false`.
- Default privilege role postgres ditutup global **dan** per-schema. Suite membuat function probe sementara dan membuktikan anon/authenticated tidak mewarisi EXECUTE, lalu menghapus probe di statement yang sama.
- `.env.local` sekarang menunjuk canonical lama dan tetap ignored. CLI sengaja di-unlink karena login CLI milik akun project duplikat; `db-test` fail-closed kecuali DB URL/link match ref canonical.
- Project baru `gzmtzdvxerpvetfmqale` tetap Free, ACTIVE_HEALTHY, dan kosong. Ia cuma cadangan kosong sementara—bukan rollback siap pakai karena belum punya schema/data/OAuth/config production—sampai preview + production signed-in QA stabil; belum dihapus/di-pause.
- Production masih build lama `5b5fbd4d3e34`. Preview dari checkpoint `2d757b4` sudah sukses, tetapi env dan runtime signed-in preview belum boleh dianggap tervalidasi sampai QA SHA final selesai.

## Belum

- Flow signed-in di preview belum bisa dites karena deployment preview dilindungi Vercel SSO. Lokal sudah membuktikan login/session asli → scan sukses → settle dan scan tanpa hasil → refund.
- Preview untuk SHA follow-up runner belum selesai.
- Production belum menjalankan vertical slice Phase 7 terbaru.
- Source Governor Phase 7 belum lengkap: budget harian, health score, dan circuit breaker.
- Source dan target setelah Domain/RDAP (DNS, username, phone, email, name, password exposure, public page) belum diaktifkan.

## Quality Gates

| Area | Status | Last Verified | Catatan |
|---|---|---|---|
| Format | PASS | 2026-08-20 | `pnpm format:check` |
| Lint | PASS | 2026-08-20 | `pnpm lint` |
| TypeScript | PASS | 2026-08-20 | `pnpm typecheck` |
| Unit tests | PASS | 2026-08-20 | 86/86 test, 9 file; termasuk 11 matcher/spoof route Workflow |
| Workflow tests | PASS | 2026-08-20 | 8/8 termasuk duplicate, lease, retry, refund |
| Production build lokal | PASS | 2026-08-20 | Next.js build; Workflow menemukan 9 steps / 1 workflow |
| Dependency audit | PASS | 2026-08-20 | Tidak ada advisory yang dikenal |
| Secret scan | PASS | 2026-08-20 | Semua candidate files bersih; `.env.local` dan `JEJAK.md` confirmed ignored |
| Local runtime smoke | PASS | 2026-08-20 | Endpoint mesin Workflow mencapai SDK; route user tetap redirect login tanpa sesi |
| Integration tests | PASS | 2026-08-20 | 28/28 terhadap project canonical lama |
| SQL database tests | PASS | 2026-08-20 | 9/9 suite live; isolation, ledger, workflow, SECURITY DEFINER, default ACL |
| Migration history | PASS | 2026-08-20 | Local/remote 20/20, head `20260820150759` |
| DB lint + Security Advisor | PASS | 2026-08-20 | Tidak ada issue level error/warn setelah migration |
| RLS + Ledger live | PASS | 2026-08-20 | Privilege matrix live + suite PostgreSQL hijau |
| Signed-in browser QA | PARTIAL PASS | 2026-08-20 | Lokal: sesi Google asli, desktop + HP 390×844, success/settle + no-result/refund, saldo 1/reserved 0; preview masih tertahan SSO |
| Production deploy | NOT DEPLOYED | 2026-08-20 | Build live masih `5b5fbd4d3e34`; batch ini belum didorong |

## Dikirim sesi ini (semua live di production)

- Phase 10 Ruang Kendali (owner-only, read-only): Ringkasan, Pengguna (email termasker), Pemeriksaan, Sumber.
- Phase 12: hapus kasus ke sampah (reversibel 3 hari) + halaman Sampah + pulihkan.
- Phase 13: manifest PWA + ikon JEJAK (installable). Service worker + Version Sentinel BELUM.
- Periksa: domain = scan penuh berbayar (RDAP). Nomor HP (libphonenumber), email (format+MX), username (GitHub API) = cek instan GRATIS di luar pipeline kredit (server-side, timeout, bukan SSRF). Nama = tetap ambigu (blueprint). Ini preview, bukan scan berbukti.

## Belum (butuh sesi fokus, jangan difragmentasi)

- Menjadikan cek instan HP/email/username sebagai scan BERBUKTI berbayar (masuk pipeline durable + Evidence Passport): butuh adapter + wiring + scan_products; menyangkut kredit, bangun utuh. Workflow saat ini FatalError untuk non-domain (src/workflows/scan.ts) — wajib diperluas dulu.
- Phase 8: halaman hasil + analisa AI (Gemini/Groq) dengan Context Pack + grounding.
- Phase 9: top-up + pembayaran manual (uang — hati-hati, atomic settlement).
- Phase 11 Partner, 14 Observability/NADI, 15 Security hardening, 16 QA, 17-18 rilis.

## CARA OPERASIONAL (sesi Agent) — penting

- Push reliabel (GCM suka munculin dialog GUI yang nge-block): `GCM_INTERACTIVE=never GIT_TERMINAL_PROMPT=0 git push origin main`. Pesan "Cannot prompt" muncul tapi tetap push dari kredensial cache.
- Apply migration ke canonical (CLI `db query` cuma 1 statement per panggilan): pakai session pooler `postgresql://postgres.tauyicvfhpfnohhgccvn:<db-pass>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`. Jalankan tiap statement terpisah. Host langsung `db.<ref>` IPv6-only, jangan dipakai.
- Pola fitur admin/aman: fungsi SECURITY DEFINER dengan cek `app.is_owner()`/permission di dalamnya + grant execute ke authenticated; route server-gated dari `bacaSesiPengguna().roleCodes`. Nol policy INSERT/UPDATE untuk client.

## Known Issues dan Blocker

- SECURITY: seluruh isi `JEJAK.md` (semua API key Gemini/Groq/Deepseek, DB password, Supabase secret + service_role JWT + legacy JWT, anon key) sempat terekspos di transcript sesi Agent. WAJIB rotasi semua lalu update Vercel env + `.env.local`.
- Production `main` sekarang `d2c14bd` (Ruang Kendali Ringkasan). Deploy otomatis dari `main`.

- CLI saat ini terautentikasi ke akun pemilik project duplikat dan sengaja tidak ditautkan. Operasi DB canonical harus memakai URL tervalidasi atau login akun lama.
- Preview Vercel dilindungi SSO; QA signed-in lokal belum menggantikan bukti runtime preview final.
- Production masih build lama. Jangan merge sebelum preview final membuktikan login → scan → hasil → settle/refund.
- Free plan dapat pause saat lama tidak aktif dan tidak memberi backup otomatis; tetapkan strategi backup sebelum menerima data user nyata.
- Docker Desktop tidak tersedia, jadi cache katalog/local reset Supabase CLI tidak jalan. Ini tidak memengaruhi migration/test remote yang sudah hijau.

## Next Safe Action

1. Push follow-up workflow, tunggu GitHub Quality Gate + preview Vercel dari SHA final, dan pastikan env tetap menunjuk canonical lama.
2. Jalankan signed-in preview QA lewat akses Vercel: success/refund, duplicate submit, tutup-buka browser, dan akses scan milik user lain.
3. Ubah PR dari draft lalu merge/deploy production hanya setelah preview final hijau.
4. Verifikasi production signed-in dan `/api/version`; observasi ledger/scan tanpa fixture tambahan.
5. Setelah production stabil, hapus project duplikat baru untuk membebaskan slot Free dan bersihkan credential bootstrap lokalnya.
6. Lanjutkan Source Governor (budget, health, circuit breaker), lalu source berikutnya sesuai ROADMAP.

## Relevant Decisions

- DEC-0121 — Ledger kredit adalah boundary service-only dan idempotent.
- DEC-0122 — Workflow durable memakai Vercel Workflow + transactional outbox database.
- DEC-0123 — Domain/RDAP dipoles dulu; no-result tidak pernah dianggap aman.
- DEC-0124 — Harga, standar hasil, dan bonus pertama dibekukan atomik saat scan dibuat.
- DEC-0125 — Project Supabase lama adalah canonical; duplikat baru hanya cadangan kosong sementara.
- DEC-0126 — Namespace mesin Workflow SDK melewati auth redirect user dengan matcher exact.

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

Saat user bilang `lanjut`, mulai dari checks + preview SHA final di PR #1 lalu signed-in preview QA—jangan mengulang provisioning dan jangan push ke project duplikat. Runtime lokal sudah membuktikan settle dan refund dengan sesi asli; Phase 7 tetap belum selesai sampai bukti yang sama terlihat di preview lalu production.
