# STATUS PROJECT — JEJAK

> **Fungsi:** Snapshot operasional lintas-agent.  
> **Tujuan utama:** Agent baru harus bisa tahu kondisi project dalam beberapa menit tanpa membaca ulang seluruh blueprint.  
> **Wajib dirawat oleh:** Semua Agent Coding.  
> **Jangan jadikan file ini:** changelog panjang, dump terminal, atau tempat menyalin seluruh PRD.

---

# 0. CARA PAKAI FILE INI

Setiap Agent Coding baru harus membaca file ini **sebelum** membaca dokumen blueprint besar.

Urutan takeover:

1. baca file ini;
2. baca `.notes/DECISIONS.md`;
3. cek `git status`;
4. cek branch dan commit terakhir;
5. cek migration head;
6. lihat `Current Phase`;
7. baca fase terkait di `docs/ROADMAP.md`;
8. baca hanya bagian blueprint yang relevan;
9. lanjut dari `Next Safe Action`.

Jika Agent baru membaca seluruh `PRD`, `DESIGN_SYSTEM`, `WIRE_MAP`, `SCHEMA`, dan `ACCEPTANCE_TESTS` dari awal padahal status ini sudah cukup:
> workflow Agent dianggap boros token.

---

# 1. SNAPSHOT SAAT INI

**Project:** Jejak  
**Domain produksi:** `https://www.cekjejak.my.id` (kanonik; apex `cekjejak.my.id` redirect ke sini — lihat DEC-0110)  
**Status besar:** Phase 0-3 selesai. Phase 4 hidup tapi belum visual-complete (landing belum ada). Phase 5 pola intinya sudah terbukti: Kasus, petunjuk terenkripsi, Evidence Passport, hubungan, dan linimasa — semuanya dijaga constraint database dan diuji.  
**Current Phase:** `PHASE 5 — Case + Entity + Evidence Core` (pola inti selesai; graph/merge/attachment belum)  
**Current Milestone:** `Landing page produksi + tutup sisa Phase 4/5, lalu Phase 6`  
**Current Branch:** `main`  
**Latest Commit:** `0d7d83d` — feat(bukti): Evidence Passport, relationships, and a timeline that cannot invent dates  
**Latest Deploy:** produksi otomatis dari `main` di `https://www.cekjejak.my.id`, region `sin1`. Cek versi live: `curl https://www.cekjejak.my.id/api/version`  
**Database Migration Head:** `20260809195402_decision_marker_survives_deletion`  
**App Version:** `0.1.0`  
**Environment:** `.env.local` terisi lengkap (Supabase URL/publishable/secret/JWKS, 4 Gemini, 4 Groq), file ignored  
**Production Status:** `BELUM PRODUCTION`  
**GitHub Quality Gate:** HIJAU di `main` (run 31332309272)  
**Last Updated By:** `Claude Code — stabilization sprint`  
**Last Updated At:** `2026-08-10`

---

# 2. STATUS BLUEPRINT

Semua blueprint utama sudah tersedia dan harus diperlakukan sebagai source of truth.

| File | Status | Fungsi |
|---|---|---|
| `docs/PRD.md` | READY | Product truth, scope, monetisasi, product rules |
| `docs/DESIGN_SYSTEM.md` | READY | Visual, interaction, motion, language, component behavior |
| `docs/WIRE_MAP.md` | READY | Peta layar, flow, state, navigation |
| `docs/SCHEMA.md` | READY | Data model, RLS, ledger, transaction, storage, authorization |
| `docs/ROADMAP.md` | READY | Urutan execution Phase 0–18 + gates |
| `docs/ACCEPTANCE_TESTS.md` | READY | 408+ acceptance tests, QA contract |
| `.notes/AGENTS.md` | READY | Kontrak kerja semua Agent |
| `PROMPT_PEMBUKA.md` | READY | Starter prompt untuk Claude/Codex/Antigravity |
| `.notes/STATUS_PROJECT.md` | READY | File ini |
| `.notes/DECISIONS.md` | READY | Decision memory lintas-agent |
| `JEJAK.md` | LOCAL SECRET BOOTSTRAP | Credential + metadata environment, jangan commit |

Dokumen turunan yang dibuat saat Phase 0/1 (bukan blueprint asli, boleh diubah agent bila implementasi berubah):

| File | Fungsi |
|---|---|
| `docs/ENVIRONMENT_CONTRACT.md` | Daftar env var, klasifikasi client-safe vs server-only |
| `docs/SECURITY_THREAT_MODEL.md` | Threat model + kontrol yang dipilih |
| `docs/ARCHITECTURE_RUNTIME.md` | Struktur folder + boundary runtime |
| `docs/API_CONTRACT.md` | Kontrak response/error API |
| `docs/RELEASE_RUNBOOK.md` | Prosedur rilis |

---

# 3. PRODUCT DIRECTION YANG SUDAH DIKUNCI

Jangan minta Product Owner mengulang keputusan berikut.

## Produk
- Jejak adalah produk OSINT/evidence intelligence.
- Fokus: periksa sebelum percaya.
- Bukan stalking/doxxing tool.
- Semua output harus evidence-first dan uncertainty-aware.

## Stack
- Next.js 16.
- Supabase.
- Vercel.
- Google OAuth.
- PWA.
- Singapore-aligned backend/database.

## Navigation user
- Beranda
- Periksa
- Kasus
- Jejak Gue

## Ruang Kendali
- Ringkasan
- Pembayaran
- Pengguna
- Partner
- Bisnis
- Sistem
- Analitik
- NADI

## Input V1
- Email
- Nomor HP
- Nama
- Username
- Domain
- Password Exposure terpisah

## Monetisasi
- Credit-based.
- Kredit lot + expiry.
- Ledger append-oriented.
- Paid operation reserve → settle/refund.
- Upgrade by difference jika analysis reusable.

## Payment V1
- Manual transfer bank.
- Rekening configurable dari admin.
- Payment proof private.
- Payment Sentinel hanya screening.
- Human approval final.
- Approval + credit settlement atomik.

## Partner
- Affiliate
- Reseller
- Mitra

## AI
- Analyst, bukan source of truth.
- Prompt injection resistance wajib.
- NADI = read/recommend/draft.
- AI tidak boleh autonomous financial/admin mutation.

## Security
- RLS deny-by-default.
- Frontend bukan authorization boundary.
- Finance tidak otomatis punya Case access.
- Support masked by default.
- Owner role database-driven.
- Secret tidak boleh masuk client/repo/log.

## PWA
- Installable.
- Version Sentinel.
- Internal Kembali + Segarkan.
- No clear-cache-as-normal-fix.
- No page scroll global.

## UI
- Bahasa Indonesia sehari-hari.
- Premium, humble, elegan.
- Agent bicara ke Product Owner pakai `lo/gue`.
- Product UI tanpa emoji sebagai visual utama.
- Luxury Digital Security / Obsidian Intelligence.

---

# 4. CURRENT IMPLEMENTATION STATE

## Sudah Selesai
- [x] Seluruh blueprint (PRD, Design System, Wire Map, Schema, Roadmap, Acceptance Tests, Agent contract)
- [x] Git repo JEJAK terpisah dari repo parent, remote `origin` = `github.com/vallendrino-vldr/JEJAK`
- [x] `.gitignore` menutup `JEJAK.md`, `.env*` (kecuali `.env.example`), credential/key files
- [x] `.env.local` dibootstrap dari `JEJAK.md` lewat `scripts/bootstrap-local-env.ps1`
- [x] Next.js 16 App Router + TypeScript strict, in-place tanpa menghapus docs
- [x] Environment validation zod: `parseClientEnv` / `parseServerEnv`, server-only dijaga `server-only`
- [x] Error foundation: `error.tsx`, `global-error.tsx`, `not-found.tsx`, katalog JX
- [x] App version + build id via `/api/version` (fondasi Version Sentinel)
- [x] Toolchain: pnpm 11.16.0 (corepack), ESLint, Prettier, Vitest, simple-git-hooks + lint-staged
- [x] Secret scanner `scripts/secret-scan.mjs` + unit test adversarial di `tests/secret-scan.test.ts`
- [x] CI GitHub Actions `Quality Gate` (format, secret scan, lint, typecheck, test, build, audit)
- [x] `vercel.json` region `sin1` (Singapore)
- [x] Checkpoint commit pertama `0465989`
- [x] Supabase CLI (devDependency) tersambung ke project lewat session pooler; koneksi terbukti
- [x] Migration `profiles` + `roles` + `user_roles`, RLS menyala di ketiganya
- [x] Trigger inisialisasi user baru (profile + peran dasar, idempotent) + bootstrap Owner sekali pakai
- [x] Supabase SSR client: browser, server, proxy — semuanya pakai kunci publishable lewat RLS
- [x] Alur Google OAuth di sisi aplikasi: start, callback PKCE, keluar, halaman `/masuk` dan `/beranda`
- [x] Test negatif RLS terhadap database sungguhan: tamu tidak bisa baca/insert/escalate
- [x] Phase 3 sebagian: 24 permission, pemetaan peran (owner 24 / admin 11 / finance 6 / support 1 / user 0)
- [x] Helper `app.current_user_has_permission` — akun non-`active` otomatis kehilangan kemampuan staf
- [x] Dua bucket privat (`case-attachments`, `payment-proofs`) tanpa satu pun policy client
- [x] Test negatif storage: tamu tidak bisa list, upload, maupun ambil lewat URL publik
- [x] Produksi hidup di domain kustom, region Singapore, auto-deploy dari `main`
- [x] Google provider aktif di Supabase; alur login terbukti sampai halaman Google (dicek lewat browser di produksi)
- [x] `/api/version` publik dan mengembalikan build id = SHA commit yang sedang live
- [x] Cookie Supabase bertanda `Secure` di produksi
- [x] Open redirect lewat `?lanjut=` ditolak di produksi (URL absolut, protocol-relative, backslash)
- [x] `/beranda` tanpa sesi dialihkan ke `/masuk`
- [x] Bundle klien produksi dipindai: nol secret server-only
- [x] Login Google sungguhan berhasil; Owner terbaca `active` dengan peran `owner` + `user` dari database
- [x] App Shell persisten: navigasi 4 tab, rail desktop, bottom nav mobile, panel Dompet/Kabar/Mata, no global scroll
- [x] Search Console dengan deteksi jenis identifier lokal + 9 test
- [x] Kasus: buat, daftar, buka, tambah petunjuk — UI sampai database
- [x] Identifier disimpan terenkripsi + blind index HMAC; kunci hidup di Vault, tidak pernah keluar dari database
- [x] Tiga suite SQL hijau: initializer, isolasi antar pengguna, isolasi Kasus

## Belum Dimulai / Belum Diverifikasi
- [ ] Google provider di Supabase (lihat Blocker) — login end-to-end belum bisa diuji
- [ ] Bukti Phase 3 yang butuh akun sungguhan: user A vs user B, Finance bukan Case admin, Support tanpa data mentah, user biasa tidak bisa menetapkan peran
- [ ] Policy storage per-bucket (menyusul bersama Case di Phase 5 dan Payment di Phase 9)
- [ ] Wallet/kredit awal saat user baru (dijadwalkan Phase 6, initializer server)
- [ ] RLS implementation
- [ ] Storage policies
- [ ] App Shell
- [ ] Case
- [ ] Credit ledger
- [ ] Scan engine
- [ ] Source Registry
- [ ] AI engine
- [ ] Payment
- [ ] Ruang Kendali
- [ ] Partner
- [ ] PWA
- [ ] Observability
- [ ] NADI
- [ ] Security hardening
- [ ] Browser QA
- [ ] Production deploy

---

# 5. CURRENT PHASE — DETAIL

## PHASE 2 — Supabase + Auth + Identity

### Tujuan
Menyambungkan aplikasi ke Supabase, membuat migration awal, dan menghidupkan Google OAuth dengan pola SSR/PKCE yang didukung resmi.

### Phase 2 Status
`IN_PROGRESS`

### Wajib Dibaca
- `docs/ROADMAP.md` Phase 2
- `docs/SCHEMA.md` bagian auth/identity/profile + RLS dasar
- `docs/ENVIRONMENT_CONTRACT.md`
- dokumentasi resmi Supabase SSR terbaru (jangan pakai blog acak)

### Tidak Perlu Dibaca Full
- seluruh `DESIGN_SYSTEM.md`
- seluruh `WIRE_MAP.md`
- seluruh `ACCEPTANCE_TESTS.md`

---

# 6. CURRENT PRIORITY

Urutan terdekat:

1. verifikasi koneksi Supabase project (region Singapore) dari credential yang sudah ada di `.env.local`;
2. buat struktur migration + migration pertama (identity/profile) sesuai `SCHEMA.md`;
3. pasang Supabase SSR client (browser + server) dengan pemisahan publishable vs secret;
4. implement Google OAuth sign-in/callback/sign-out;
5. bootstrap role Owner lewat DB, bukan kondisi email di frontend;
6. tulis test negatif dasar untuk session/authorization;
7. update file ini + migration head;
8. lanjut Phase 3 (RBAC + RLS + Storage Security).

---

# 7. NEXT SAFE ACTION

> **Ini bagian paling penting untuk Agent berikutnya. Harus selalu spesifik.**

## Tingkat kematangan tiap bagian

Jangan baca "ada menunya" sebagai "sudah jadi". Empat tingkat:

| Bagian | Tingkat | Catatan |
|---|---|---|
| Auth Google + sesi | acceptance proven | login sungguhan, 20 invariant RLS |
| Peran & permission | acceptance proven | 24 permission, pencabutan langsung berlaku |
| App Shell + navigasi | production functional | belum QA lintas browser/perangkat |
| Search Console | production functional | deteksi jenis jalan; belum memicu pemeriksaan |
| Kasus (buat/daftar/buka) | acceptance proven | 22 invariant isolasi |
| Petunjuk terenkripsi | acceptance proven | ciphertext + blind index tertutup dari client |
| Bukti + hubungan + linimasa | acceptance proven | 16 invariant; UI baru bukti dari pengguna |
| Dompet | visual shell | panel jujur bilang belum aktif; ledger belum ada |
| Kabar | visual shell | belum ada sumber notifikasi |
| Mata Jejak | visual shell | maskot + panduan statis; asisten AI belum |
| Ruang Kendali | belum ada | tautan rail mengarah ke route yang belum dibuat |
| Landing produksi | belum ada | lihat Known Issues |
| Graph, merge, attachment | belum ada | sisa Phase 5 |

## Next Safe Action Saat Ini

**Bangun landing page produksi.** Ini satu-satunya bagian Phase 4 yang belum ada,
dan pengunjung yang belum login sekarang mendarat di halaman fondasi lama.

Lakukan berurutan, jangan lompat:

1. Ganti isi `src/app/page.tsx`. Pakai komponen yang sudah ada — jangan bikin
   sistem desain baru: `Wordmark` dari `src/components/merek.tsx` (ukuran
   `besar`), `Aurora` dari `src/components/aurora.tsx`, `MataJejak` dari
   `src/components/mata-jejak.tsx`. Token warna ambil dari `src/app/globals.css`;
   dilarang menulis kode hex baru di komponen.
2. Isi wajib landing, urut dari atas: wordmark `JEJAK`; kalimat
   `Periksa sebelum percaya.`; demo interaktif lokal; tombol masuk Google;
   ajakan `Pasang Jejak`; penutup
   `Bisa mulai gratis. Nggak perlu kartu kredit.`
3. Demo interaktif **wajib 100% lokal**. Pakai `deteksiIdentifier` dari
   `src/lib/periksa/deteksi.ts` untuk memperlihatkan deteksi jenis input secara
   nyata. Jangan panggil API apa pun, jangan tampilkan hasil pemeriksaan palsu,
   jangan bikin persentase karangan.
4. Tombol masuk harus berupa tautan `<a href="/auth/masuk-google?lanjut=%2Fberanda">`,
   bukan form. Alasannya di DEC-0113 — form POST ke Google diblokir CSP.
   Jangan ubah `next.config.ts` untuk mengakalinya.
5. `Pasang Jejak` untuk sekarang cukup tautan/tombol yang menjelaskan PWA
   menyusul di Phase 13. Jangan bikin service worker sekarang — itu Phase 13 dan
   punya gate sendiri.
6. Landing tidak boleh menyebabkan scroll halaman global. Ikuti pola
   `.foundation-shell` yang sudah ada, atau bikin region scroll internal.
7. Jalankan `pnpm check`, lalu `pnpm gate:integrasi`. Dua-duanya harus hijau.
8. Commit, push, tunggu GitHub Actions hijau, lalu cek
   `https://www.cekjejak.my.id` beneran berubah.

Sesudah landing beres, baru lanjut ke sisa Phase 5 (graph, merge entitas yang
bisa dibatalkan, attachment) — **bukan** ke Phase 6. Ikuti pola yang sudah ada:
tabel baru selalu RLS + grant per kolom, penulisan lewat fungsi SECURITY DEFINER,
lalu tambahkan invariant ke `supabase/tests/`.

### Yang TIDAK boleh diubah tanpa alasan kuat

- Jangan tambah policy INSERT/UPDATE untuk client di tabel mana pun. Penulisan
  lewat fungsi (DEC-0115).
- Jangan pakai `grant select on <tabel>` lalu `revoke` per kolom — tidak berfungsi
  di Postgres (DEC-0116).
- Jangan pindahkan kunci identifier ke environment. Kunci hidup di Vault (DEC-0114).
- Jangan bikin project Vercel atau repo baru, jangan ubah domain kanonik (DEC-0110).
- Jangan matikan Vercel Authentication untuk preview (DEC-0112).
- Jangan masukkan test yang butuh database ke CI publik (lihat `vitest.config.mts`).

### Cara menjalankan suite SQL

```bash
pnpm db:test
```

Menjalankan seluruh berkas di `supabase/tests`. Connection string dirakit sendiri
dari `JEJAK.md`, atau dari env `JEJAK_DB_URL` kalau disetel. Nilainya tidak pernah
dicetak.

Gate lengkap sebelum deploy:

```bash
pnpm check && pnpm gate:integrasi
```

`pnpm check` = gate deterministik yang juga dijalankan CI. `pnpm gate:integrasi` =
test yang menembak database sungguhan; sengaja tidak dijalankan CI publik.

### Cara menyambung ke database

Host langsung `db.<ref>.supabase.co` hanya punya AAAA (IPv6) dan tidak
resolve dari mesin ini. Pakai session pooler:

```text
postgresql://postgres.tauyicvfhpfnohhgccvn:<password>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

Password ada di `JEJAK.md` (`Password Database`), harus di-percent-encode.
Perintah: `pnpm exec supabase db push --db-url <url> --yes`.
Jangan pernah mencetak URL berisi password ke output.

### Relevant Files
- `supabase/migrations/20260809163905_identity_and_rbac_foundation.sql`
- `supabase/migrations/20260809164435_expose_role_catalog_read.sql`
- `src/lib/supabase/{client,server,middleware}.ts`, `src/proxy.ts`
- `src/lib/auth/{actions,session}.ts`
- `src/app/masuk/page.tsx`, `src/app/beranda/page.tsx`, `src/app/auth/callback/route.ts`
- `tests/rls-negative.test.ts`
- `docs/ROADMAP.md` Phase 2-3, `docs/SCHEMA.md` §4-5, §68, §123-127

---

# 8. BLOCKER

**Current blocker:** `TIDAK ADA`

Login Google sungguhan sudah berhasil. Akun Owner terbaca `active` dengan peran
`owner` + `user`, keduanya berasal dari database.

Yang sudah terverifikasi:
- credential lengkap di `.env.local` (belum diuji ke Supabase runtime);
- Git remote benar dan masih kosong sebelum commit pertama;
- dependency terinstall (pnpm 11.16.0 via corepack);
- Vercel belum di-link, dan itu belum dibutuhkan sampai deploy pertama.

---

# 9. GLOBAL SKILLS / TOOLING STATUS

Product Owner sudah memberi tahu bahwa banyak skills/tooling dipasang secara global.

## Status
`SUDAH DIINVENTARISASI` — 2026-08-09

```text
Node: v24.18.0
Package manager: pnpm 11.16.0 lewat corepack shim (bukan install global npm)
Git: 2.55.0.windows.3
GitHub CLI: TIDAK TERPASANG (belum dibutuhkan, push pakai git + credential manager)
Supabase CLI: TIDAK TERPASANG — pakai MCP Supabase yang tersedia di session
Vercel CLI: TIDAK TERPASANG — pakai MCP Vercel yang tersedia di session
Browser automation: MCP browser tersedia (in-app + Chrome)
Testing: Vitest 4.1.10 (lokal project)
Security tools: secret scanner lokal + `pnpm audit --prod`
Skill relevan: supabase, supabase-postgres-best-practices, modern-web-guidance
```

### Rule
Jangan install ulang sebelum cek. `corepack enable` sudah dijalankan supaya
`pnpm` bisa dipanggil langsung; ini shim resmi Node, bukan install pnpm global.

---

# 10. SECRET SAFETY STATUS

## Local secret bootstrap
`JEJAK.md`

### Status
`VERIFIED` — 2026-08-09

- [x] di `.gitignore` (`git check-ignore` mengonfirmasi `JEJAK.md`, `.env.local`, `.env`)
- [x] tidak tracked
- [x] tidak staged pada commit `0465989`
- [x] secret tidak masuk blueprint
- [x] env server/client dipisah (`server-only` di `src/lib/env/server.ts`)
- [x] secret tidak masuk client bundle (`.next/static` bersih dari nama env server-only)
- [x] secret scan baseline hijau + punya unit test sendiri

Jika salah satu gagal:
> Phase 0 belum boleh DONE.

---

# 11. GIT STATUS

**Repository:** `VERIFIED` — 2026-08-09

```text
Current branch: main
Remote: origin https://github.com/vallendrino-vldr/JEJAK.git
Latest commit: 0465989 feat(bootstrap): phase 0-1 foundation, quality gate, and secret scanner
Working tree: bersih selain notes yang sedang diupdate
Untracked files: tidak ada yang perlu di-track
Secret files tracked?: TIDAK
```

Catatan: repo ini pernah ikut terbaca sebagai bagian dari Git parent di
`C:\Users\Administrator` (remote DuitKita). Sudah diisolasi jadi repo sendiri.
Kalau agent berikutnya lihat file JEJAK muncul di `git status` repo lain,
itu regresi dan harus dibereskan sebelum commit apa pun.

### Rule
Jangan force push.
Jangan reset repo.
Jangan init ulang jika repo existing.

---

# 12. RUNTIME STATUS

```text
Node version: v24.18.0
Package manager: pnpm 11.16.0 (corepack)
Next.js: 16.3.0 (Turbopack), React 19.2
TypeScript: 6.0.3, strict
Build: PASS
Lint: PASS
Typecheck: PASS
Tests: PASS (4 file, 16 test)
Format check: PASS
Secret scan: PASS
Prod dependency audit: PASS (no known vulnerabilities)
```

Perintah gate lengkap: `pnpm check`

---

# 13. SUPABASE STATUS

```text
Project ref: tauyicvfhpfnohhgccvn
Region: ap-southeast-1 (Singapore) — sesuai target
Connection: PASS lewat session pooler aws-0-ap-southeast-1 (host langsung IPv6-only, tidak dipakai)
CLI: supabase 2.113.0 sebagai devDependency; belum `link` (butuh personal access token)
MCP Supabase: TIDAK punya akses ke project ini
Migration head: 20260809164435_expose_role_catalog_read
RLS: IMPLEMENTED untuk profiles/roles/user_roles
Storage: NOT_IMPLEMENTED (Phase 3)
Google Auth: provider belum aktif — auth provider yang menyala baru `email`
Owner bootstrap: IMPLEMENTED di trigger, belum pernah terpicu karena belum ada login
```

### Jangan simpan secret di file ini.

---

# 14. VERCEL STATUS

```text
Team: Vallendrino (team_sf6VCGvrhXzNgn7KIsNI8bxO)
Project: jejak (prj_ssDMLyWZZ5d6icSItlW4bkDm9fI9) — JANGAN bikin project baru
Git: vallendrino-vldr/JEJAK, branch produksi `main`, auto-deploy aktif
Production URL: https://www.cekjejak.my.id (apex redirect ke www)
Preview protection: Vercel Authentication AKTIF, all_except_custom_domains
  -> semua URL *.vercel.app tertutup, hanya domain kustom yang publik (DEC-0112)
Region config: sin1, terbukti dari header x-vercel-id produksi
Environment variables: 14 nama, semuanya dipakai atau dicadangkan phase berikutnya
```

## Audit nama ENV di Vercel (tanpa nilai)

| Nama | Kelas | Dipakai sekarang? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client-safe | ya |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | client-safe | ya |
| `SUPABASE_SECRET_KEY` | server-only | belum, dicadangkan alur privileged |
| `SUPABASE_JWKS_URL` | server-only | belum |
| `GEMINI_API_KEY_1..4` | server-only | belum, Phase 8 |
| `GROQ_API_KEY_1..4` | server-only | belum, Phase 8 |
| `APP_VERSION` | build metadata | ya, dipetakan di `next.config.ts` |
| `BUILD_ID` | build metadata | cadangan; produksi memakai `VERCEL_GIT_COMMIT_SHA` |

Yang **tidak** ikut ter-import dan memang tidak boleh ada di Vercel: password
database, legacy JWT secret, legacy service-role key, GitHub PAT. Sudah dicek per
nama — bersih. `SUPABASE_SECRET_KEY` memakai format `sb_secret_` baru, bukan
service-role JWT lama.

Pemetaan versi sudah benar dan tidak perlu rename di Vercel: `next.config.ts`
membaca `APP_VERSION`/`BUILD_ID` lalu mengeksposnya sebagai
`NEXT_PUBLIC_APP_VERSION`/`NEXT_PUBLIC_BUILD_ID`, dengan `VERCEL_GIT_COMMIT_SHA`
diprioritaskan untuk build id supaya tiap deploy punya penanda berbeda —
syarat Version Sentinel.

---

# 15. GOOGLE AUTH STATUS

```text
OAuth provider configured: AKTIF (Google). Email sign-in dimatikan — Jejak Google-only.
Google Authorized Redirect URI: https://tauyicvfhpfnohhgccvn.supabase.co/auth/v1/callback
Supabase Site URL: https://www.cekjejak.my.id
Supabase Redirect URLs: www + apex + localhost, masing-masing /auth/callback
PKCE/session flow: TERBUKTI sampai halaman Google. Cookie code verifier terpasang
  dengan Secure + SameSite=lax, dan Google menerima client tanpa redirect_uri_mismatch.
Login penuh: BELUM PERNAH — butuh manusia memilih akun & consent (lihat Blocker)
Owner role bootstrap: IMPLEMENTED (trigger, sekali pakai), belum pernah terpicu
```

---

# 16. QUALITY GATES

Legend:
- `NOT_RUN`
- `PASS`
- `FAIL`
- `PARTIAL`
- `NOT_AVAILABLE`
- `NOT_APPLICABLE`

| Area | Status | Last Verified | Notes |
|---|---|---|---|
| Production Build | PASS | 2026-08-09 | `next build` 3 route |
| Typecheck | PASS | 2026-08-09 | strict |
| Lint | PASS | 2026-08-09 | `--max-warnings=0` |
| Unit Tests | PASS | 2026-08-09 | 29 test |
| RLS (tamu ditolak) | PASS | 2026-08-09 | `tests/rls-negative.test.ts` lawan DB sungguhan |
| Storage tertutup | PASS | 2026-08-09 | 2 bucket privat, 0 policy client, URL publik gagal |
| Produksi hidup | PASS | 2026-08-10 | www.cekjejak.my.id, apex redirect, region sin1 |
| Deploy = commit benar | PASS | 2026-08-10 | `/api/version` buildId cocok SHA yang di-push |
| Secret bundle produksi | PASS | 2026-08-10 | 9 chunk diunduh dan dipindai, nol temuan |
| Protected route | PASS | 2026-08-10 | `/beranda` tanpa sesi -> `/masuk?lanjut=/beranda` |
| Open redirect | PASS | 2026-08-10 | absolut, protocol-relative, backslash semuanya ditolak |
| Cookie Secure | PASS | 2026-08-10 | code verifier: Secure + SameSite=lax |
| OAuth sampai Google | PASS | 2026-08-10 | halaman Sign in Google tampil, tanpa redirect_uri_mismatch |
| Initializer user baru | PASS | 2026-08-10 | `supabase/tests/initializer-invariants.sql`, database bersih lagi setelahnya |
| Google Auth (login penuh) | PASS | 2026-08-10 | Owner login sungguhan di produksi, sampai `/beranda` |
| Session SSR | PASS | 2026-08-10 | `/beranda` merender status + peran dari DB per request |
| Owner dari database | PASS | 2026-08-10 | 1 profil, `active`, peran `owner` + `user`; nol email check di `src/` |
| RLS (user A vs user B) | PASS | 2026-08-10 | `supabase/tests/rls-cross-user.sql`, 20 invariant |
| Role spoof dari browser | PASS | 2026-08-10 | insert `user_roles` dan ubah `account_status` sama-sama ditolak |
| Pencabutan peran langsung berlaku | PASS | 2026-08-10 | dibaca dari DB, bukan klaim JWT |
| Logout | NOT_RUN | - | Butuh sesi hidup di browser; tombolnya di Jejak Gue |
| Isolasi Kasus | PASS | 2026-08-10 | `supabase/tests/case-isolation.sql`, 22 invariant |
| Perlindungan identifier | PASS | 2026-08-10 | ciphertext + HMAC tertutup dari client, nilai bisa dipulihkan server |
| App Shell | PASS | 2026-08-10 | build hijau, 4 route utama; QA browser lintas perangkat belum |
| GitHub Quality Gate | PASS | 2026-08-10 | run 31332309272 hijau di `main` |
| Evidence Doctrine | PASS | 2026-08-10 | `supabase/tests/evidence-doctrine.sql`, 16 invariant |
| Format | PASS | 2026-08-09 | prettier check |
| Dependency Audit | PASS | 2026-08-09 | prod, level high |
| Google Auth | NOT_RUN | - | |
| Session | NOT_RUN | - | |
| RBAC | NOT_RUN | - | |
| RLS | NOT_RUN | - | |
| Storage RLS | NOT_RUN | - | |
| Case Isolation | NOT_RUN | - | |
| Ledger | NOT_RUN | - | |
| Ledger Race | NOT_RUN | - | |
| Expiry | NOT_RUN | - | |
| Scan | NOT_RUN | - | |
| Source Registry | NOT_RUN | - | |
| AI Grounding | NOT_RUN | - | |
| Prompt Injection | NOT_RUN | - | |
| Payment | NOT_RUN | - | |
| Double Approval | NOT_RUN | - | |
| Partner | NOT_RUN | - | |
| Deletion | NOT_RUN | - | |
| PWA Install | NOT_RUN | - | |
| PWA Update | NOT_RUN | - | |
| Offline | NOT_RUN | - | |
| Realtime Fallback | NOT_RUN | - | |
| Brave Android | NOT_RUN | - | |
| Brave Desktop | NOT_RUN | - | |
| Chrome Android | NOT_RUN | - | |
| Chrome Desktop | NOT_RUN | - | |
| Safari iPhone Real | NOT_RUN | - | Jangan PASS dari emulation |
| iOS PWA Real | NOT_RUN | - | |
| Edge | NOT_RUN | - | |
| Firefox | NOT_RUN | - | |
| Accessibility | NOT_RUN | - | |
| Performance | NOT_RUN | - | |
| Secret Scan | PASS | 2026-08-09 | 49 file kandidat, punya test sendiri |
| Client Bundle Secret | PASS | 2026-08-09 | `.next/static` bersih |
| Security Suite | NOT_RUN | - | |

---

# 17. ACCEPTANCE TEST PROGRESS

Baseline file:
> `docs/ACCEPTANCE_TESTS.md`

Total baseline:
> 408 acceptance tests.

Snapshot awal:
- `PASS: 0`
- `FAIL: 0`
- `NOT_RUN: seluruh baseline`
- `NOT_AVAILABLE: belum ditentukan`

Agent tidak perlu menyalin 408 test ke file ini.

Cukup summary per suite + failing IDs.

---

# 18. ACCEPTANCE SUITE SUMMARY

| Suite | Status | Catatan |
|---|---|---|
| Bootstrap & Secret Safety | PARTIAL | Secret ignore/scan/bundle PASS. Rotasi & incident drill belum. |
| Git & Environment | PARTIAL | Repo, remote, runtime, CI PASS. Deploy env Vercel belum. |
| Google Auth & Session | NOT_RUN | |
| RBAC & RLS | NOT_RUN | |
| Storage Authorization | NOT_RUN | |
| App Shell & Navigation | NOT_RUN | |
| Mobile/Desktop Interaction | NOT_RUN | |
| Input Detection | NOT_RUN | |
| Case | NOT_RUN | |
| Entity/Graph | NOT_RUN | |
| Evidence/Timeline | NOT_RUN | |
| Credit Ledger | NOT_RUN | |
| Credit Expiry/Upgrade | NOT_RUN | |
| Scan Orchestration | NOT_RUN | |
| OSINT Sources | NOT_RUN | |
| Password Exposure | NOT_RUN | |
| AI/Grounding | NOT_RUN | |
| Top-up User Flow | NOT_RUN | |
| Payment Settlement | NOT_RUN | |
| Referral/Affiliate | NOT_RUN | |
| Reseller/Voucher | NOT_RUN | |
| Mitra/Workspace | NOT_RUN | |
| Jejak Gue | NOT_RUN | |
| Privacy/Deletion | NOT_RUN | |
| Safe Share | NOT_RUN | |
| PWA/Version Sentinel | NOT_RUN | |
| Offline/Realtime | NOT_RUN | |
| Brave/Safari/Motion | NOT_RUN | |
| Ruang Kendali | NOT_RUN | |
| Source/Flags/Maintenance | NOT_RUN | |
| Observability/NADI | NOT_RUN | |
| Security/Abuse | NOT_RUN | |
| Performance | NOT_RUN | |
| Accessibility | NOT_RUN | |
| Analytics | NOT_RUN | |
| Handoff Continuity | NOT_RUN | |
| Production Launch | NOT_RUN | |

---

# 19. KNOWN ISSUES

- **Landing produksi belum dibangun.** `/` masih halaman fondasi lama. Phase 4 belum boleh dianggap visual-complete sampai landing memuat: wordmark `JEJAK`, kalimat `Periksa sebelum percaya.`, demo interaktif lokal, tombol masuk Google, ajakan `Pasang Jejak`, dan penutup `Bisa mulai gratis. Nggak perlu kartu kredit.`
- **Rail desktop menautkan `/ruang-kendali` yang belum ada** — Owner/Admin yang mengekliknya dapat 404. Route-nya milik Phase 10.
- Dompet, Kabar, dan Mata Jejak baru cangkang: panelnya jujur menyebut belum aktif, tapi belum tersambung ke apa pun.
- Sisa Phase 5 belum: graph, merge entitas yang bisa dibatalkan, attachment, kontradiksi sebagai fitur (jenis hubungannya sudah ada).
- QA lintas browser dan perangkat belum dilakukan sama sekali.
- **Repo GitHub berstatus publik.** Belum ada secret yang bocor (scanner bersih di tiap commit), tapi artinya seluruh kode dan blueprint terbaca siapa saja. Kalau itu bukan yang diinginkan, ubah ke privat di GitHub — tidak ada di kode yang bisa gue ubah untuk ini.
- MCP Supabase yang tersedia di session **tidak** punya akses ke project Jejak (`tauyicvfhpfnohhgccvn`); hanya melihat project lain. Semua kerja DB lewat Supabase CLI + connection string.
- `supabase db advisors` dan `supabase link` butuh personal access token yang belum ada, jadi security advisor Supabase belum pernah dijalankan.
- Docker tidak terpasang, jadi stack Supabase lokal dan `db diff` tidak tersedia. Migration ditulis tangan lalu di-push ke remote.
- Preview memakai database produksi, ditutup Vercel Authentication (DEC-0112). Wajib ditinjau ulang begitu ada data pengguna sungguhan.
- Real Safari QA belum dilakukan — `NOT_AVAILABLE`, bukan PASS.
- `getServerEnv` belum dipakai jalur runtime mana pun; validasi env server belum terbukti di produksi.
- CSP masih memakai `script-src 'unsafe-inline'`. Diperketat di Phase 15, dicatat supaya tidak terlupa.

Agent:
> hapus issue yang sudah benar-benar resolved dari current list.

Jangan jadikan bagian ini history.

---

# 20. CURRENT DECISIONS SUMMARY

Detail keputusan hidup di:
> `.notes/DECISIONS.md`

Ringkasan stable product decisions yang Agent tidak perlu mempertanyakan ulang:

- Next.js 16.
- Supabase.
- Vercel.
- Google OAuth only.
- Owner bootstrap by known Google account, authorization DB-driven.
- Manual payment V1.
- Payment method configurable from admin.
- Credit ledger + lots + expiry.
- Case core V1.
- Evidence Passport.
- Source Registry modular.
- AI not fact.
- NADI non-autonomous.
- PWA core.
- Version Sentinel.
- No page scroll global.
- Adaptive touch/pointer.
- Brave serious QA.
- Safari real status honest.
- V1 → V1.5 → V2 staged.
- Global skills must be checked and reused.
- STATUS + DECISIONS always maintained.
- Agent communication to Product Owner = Indonesian `lo/gue`.

---

# 21. SOURCE STATUS

Initial intended V1 source direction:

| Source | Planned State | Implementation |
|---|---|---|
| Local normalization | CORE | NOT_STARTED |
| libphonenumber | CORE | NOT_STARTED |
| RDAP | CORE | NOT_STARTED |
| Cloudflare DNS | CORE | NOT_STARTED |
| Google DNS fallback | CORE | NOT_STARTED |
| HIBP Pwned Passwords | CORE | NOT_STARTED |
| GitHub Public API | OPTIONAL | NOT_STARTED |
| GitLab Public API | OPTIONAL | NOT_STARTED |
| Public Page Collector | OPTIONAL | NOT_STARTED |
| Broad web search | FUTURE | NOT_STARTED |
| Premium breach intelligence | V2 | NOT_STARTED |

Do not mark active until actual adapter + QA works.

---

# 22. AI PROVIDER STATUS

```text
Gemini credentials: tersedia via local bootstrap, belum diverifikasi runtime
Groq credentials: tersedia via local bootstrap, belum diverifikasi runtime
Provider routing: NOT_IMPLEMENTED
Sensitive Data Gate: NOT_IMPLEMENTED
Grounding Check: NOT_IMPLEMENTED
Analyst: NOT_IMPLEMENTED
Skeptic: NOT_IMPLEMENTED
NADI: NOT_IMPLEMENTED
```

Never paste secret values here.

---

# 23. PAYMENT STATUS

```text
Manual bank transfer model: LOCKED
Payment method admin-configurable: LOCKED
Initial real payment config: belum diverifikasi runtime/admin
Top-up schema: NOT_IMPLEMENTED
Proof upload: NOT_IMPLEMENTED
Payment Sentinel: NOT_IMPLEMENTED
Manual review: NOT_IMPLEMENTED
Atomic settlement: NOT_IMPLEMENTED
Proof cleanup: NOT_IMPLEMENTED
```

---

# 24. CREDIT STATUS

```text
Wallet: NOT_IMPLEMENTED
Lots: NOT_IMPLEMENTED
Ledger: NOT_IMPLEMENTED
Holds: NOT_IMPLEMENTED
Reserve: NOT_IMPLEMENTED
Settle: NOT_IMPLEMENTED
Refund: NOT_IMPLEMENTED
Expiry: NOT_IMPLEMENTED
Grace: NOT_IMPLEMENTED
Upgrade difference: NOT_IMPLEMENTED
Admin correction: NOT_IMPLEMENTED
```

---

# 25. CASE STATUS

```text
Case CRUD: NOT_IMPLEMENTED
Case RLS: NOT_IMPLEMENTED
Secret Case: NOT_IMPLEMENTED
Entities: NOT_IMPLEMENTED
Relationships: NOT_IMPLEMENTED
Evidence: NOT_IMPLEMENTED
Attachments: NOT_IMPLEMENTED
Timeline: NOT_IMPLEMENTED
Contradictions: NOT_IMPLEMENTED
Graph: NOT_IMPLEMENTED
Safe Share: NOT_IMPLEMENTED
```

---

# 26. PWA STATUS

```text
Manifest: NOT_IMPLEMENTED
Service Worker: NOT_IMPLEMENTED
Install UX: NOT_IMPLEMENTED
Version Sentinel: NOT_IMPLEMENTED
Back: NOT_IMPLEMENTED
Segarkan: NOT_IMPLEMENTED
Offline policy: NOT_IMPLEMENTED
Old-client compatibility: NOT_IMPLEMENTED
```

---

# 27. ADMIN STATUS

```text
Owner entry: NOT_IMPLEMENTED
Ringkasan: NOT_IMPLEMENTED
Owner Inbox: NOT_IMPLEMENTED
Payment Queue: NOT_IMPLEMENTED
User Management: NOT_IMPLEMENTED
Role Management: NOT_IMPLEMENTED
Pricing Config: NOT_IMPLEMENTED
Payment Config: NOT_IMPLEMENTED
Partner Config: NOT_IMPLEMENTED
Source Registry UI: NOT_IMPLEMENTED
Feature Flags: NOT_IMPLEMENTED
Maintenance: NOT_IMPLEMENTED
Emergency Protection: NOT_IMPLEMENTED
Analytics: NOT_IMPLEMENTED
NADI: NOT_IMPLEMENTED
```

---

# 28. PARTNER STATUS

```text
Affiliate: FOUNDATION NOT_IMPLEMENTED
Reseller: FOUNDATION NOT_IMPLEMENTED
Mitra: FOUNDATION NOT_IMPLEMENTED
Workspace: FOUNDATION NOT_IMPLEMENTED
Referral: NOT_IMPLEMENTED
Voucher: NOT_IMPLEMENTED
Commission: NOT_IMPLEMENTED
Distribution Wallet: NOT_IMPLEMENTED
```

---

# 29. OBSERVABILITY STATUS

```text
JX Error Code: NOT_IMPLEMENTED
Error Events: NOT_IMPLEMENTED
Pusat Masalah: NOT_IMPLEMENTED
Security Events: NOT_IMPLEMENTED
Performance Metrics: NOT_IMPLEMENTED
Business Metrics: NOT_IMPLEMENTED
Storage Health: NOT_IMPLEMENTED
Version Adoption: NOT_IMPLEMENTED
NADI Digest: NOT_IMPLEMENTED
```

---

# 30. PERFORMANCE STATUS

Targets are product targets, not current measurements.

```text
Cold shell target: ~1–1.5s healthy conditions
Warm tab visual target: <~100ms
Local panel: no network wait for shell
Graph: progressive
Heavy modules: lazy
Realtime: selective
```

Actual measured:
> `NOT_MEASURED`

---

# 31. BROWSER QA STATUS

```text
Brave Android Real: NOT_RUN
Brave Desktop: NOT_RUN
Chrome Android: NOT_RUN
Chrome Desktop: NOT_RUN
Safari iPhone Real: NOT_RUN
Safari iOS PWA: NOT_RUN
Safari iPad Real: NOT_RUN
Edge: NOT_RUN
Firefox: NOT_RUN
```

Rule:
> Jangan ubah Safari Real menjadi PASS tanpa test perangkat nyata.

---

# 32. SECURITY STATUS

```text
RLS negative test: NOT_RUN
Storage negative test: NOT_RUN
IDOR/BOLA: NOT_RUN
Mass assignment: NOT_RUN
Secret bundle scan: NOT_RUN
XSS AI output: NOT_RUN
XSS evidence: NOT_RUN
SSRF: NOT_RUN
Upload validation: NOT_RUN
Safe Share enumeration: NOT_RUN
Role escalation: NOT_RUN
Provider burn/rate control: NOT_RUN
```

---

# 33. MIGRATION STATUS

```text
Migration strategy: imperative, ditulis tangan di supabase/migrations
Migration files:
  20260809163905_identity_and_rbac_foundation.sql
  20260809164435_expose_role_catalog_read.sql
  20260809165522_permissions_and_storage_security.sql
Migration head: 20260809195402_decision_marker_survives_deletion
Suite SQL: 4 berkas di supabase/tests — semuanya hijau, jalankan dengan `pnpm db:test`
Fresh DB apply: NOT_RUN (butuh Docker untuk stack lokal)
Existing DB apply: PASS (remote, 2026-08-09)
RLS policies: profiles 2, user_roles 1, roles 1, permissions 1, role_permissions 0 — RLS aktif di semuanya
Storage: bucket case-attachments + payment-proofs, keduanya privat, 0 policy client
Seed data: 5 peran sistem + 24 permission + pemetaan role_permissions
```

Setelah Agent membuat migration:
> update section ini dan top Snapshot.

---

# 34. ACTIVE FEATURE FLAGS

Snapshot:
> belum ada runtime feature flag implementation.

Jangan isi dari asumsi.

Setelah implementasi, catat hanya flags penting:
- AI;
- scans;
- top-ups;
- experimental source;
- emergency.

---

# 35. MAINTENANCE STATUS

```text
Global maintenance: NOT_IMPLEMENTED
Scan control: NOT_IMPLEMENTED
AI control: NOT_IMPLEMENTED
Top-up control: NOT_IMPLEMENTED
Upload control: NOT_IMPLEMENTED
Emergency Protection: NOT_IMPLEMENTED
```

---

# 36. DEPLOYMENT HISTORY — CURRENT SNAPSHOT ONLY

Tidak perlu semua deploy.

Format:

```text
Latest Production: 0cca0dd @ https://www.cekjejak.my.id (region sin1)
Latest Preview: tidak ada preview terpisah; semua deploy sejauh ini target production dari `main`
Last Successful: 0cca0dd
Last Rollback: belum pernah
```

Deploy dilakukan dengan cara push ke `main`. Jangan bikin jalur deploy kedua.

---

# 37. LAST VERIFIED

Saat ini:

```text
Blueprint documents: VERIFIED READY
Implementation: VERIFIED sampai Phase 2 minus login (pnpm check hijau, 2026-08-09)
Secret safety: VERIFIED (ignore + scan + client bundle)
Git: VERIFIED (repo terisolasi, remote benar, commit 0cca0dd)
Supabase runtime: VERIFIED untuk DB (migration + RLS negatif); login penuh BELUM
Vercel runtime: VERIFIED (domain kustom, region sin1, auto-deploy dari main, preview tertutup)
```

---

# 38. HANDOFF RULE

Sebelum Agent berhenti karena limit:

Wajib update:

```text
Current Phase
Current Milestone
Current Branch
Latest Commit
Latest Deploy
Migration Head
Quality Gates
Known Issues
Blocker
Last Verified
Next Safe Action
Relevant Files
```

Jika salah satu critical kosong:
> handoff belum siap.

---

# 39. NEXT AGENT START RULE

Agent berikutnya tidak boleh langsung bilang:
> “Gue akan membaca semua dokumentasi.”

Yang benar:

> “Gue baca STATUS + DECISIONS dulu, cek Git, terus fokus ke Phase aktif.”

---

# 40. WHEN TO READ FULL BLUEPRINT

Baca full blueprint hanya jika:
- first implementation of domain besar;
- status/decision tidak cukup;
- product rule conflict;
- security review penuh;
- release audit;
- Product Owner meminta review total.

Bukan setiap session.

---

# 41. RELEVANT FILE MAP

## Bootstrap
- PROMPT_PEMBUKA
- AGENTS
- ROADMAP Phase 0
- SCHEMA bootstrap

## Auth/RLS
- SCHEMA Auth/RBAC/RLS
- ROADMAP Phase 2–3
- Acceptance Auth/RLS

## App Shell
- DESIGN_SYSTEM shell
- WIRE_MAP global
- ROADMAP Phase 4

## Case
- SCHEMA Case
- WIRE_MAP Case
- Acceptance Case/Graph/Evidence

## Credit
- SCHEMA Credit
- PRD Credit
- Acceptance Ledger/Expiry

## Scan/Source
- PRD Source
- SCHEMA Scan/Source
- Acceptance Scan/Sources

## AI
- PRD AI
- SCHEMA AI
- Acceptance AI

## Payment
- SCHEMA Payment
- WIRE_MAP Payment/Admin
- Acceptance Payment

## Admin
- WIRE_MAP Ruang Kendali
- SCHEMA Admin/config
- Acceptance Admin/System

## PWA
- DESIGN_SYSTEM PWA
- WIRE_MAP PWA
- Acceptance PWA/Browser

---

# 42. AGENT COMMUNICATION CONTRACT

Semua Agent harus ngomong ke Product Owner:
- Indonesia;
- lo/gue;
- natural;
- gaul;
- ringkas;
- jelas.

Contoh status update bagus:

> “Gas, Phase 0 udah aman. `JEJAK.md` nggak ikut Git, global tools udah gue cek, dan build baseline hijau. Gue lanjut Auth sekarang.”

Contoh jelek:

> “Dear User, I have completed the initialization procedure.”

---

# 43. DO NOT ASK LIST

Jangan tanya Product Owner:
- “mau lanjut?”
- “boleh bikin migration?”
- “pakai library apa?”
- “mau Supabase?”
- “mau App Router?”
- “mau BCA?”
- “mau bahasa Indonesia?”

Blueprint sudah jawab.

---

# 44. BLOCKER FORMAT

Kalau butuh user:

```md
## BLOCKER

Yang gue butuh:
...

Kenapa:
...

Yang udah gue coba:
...

Bagian lain yang tetap gue lanjut:
...

Begitu ini beres:
...
```

---

# 45. CURRENT BLOCKER DETAIL

Tidak ada blocker.

Yang berpotensi jadi blocker di Phase 2 dan hanya bisa diselesaikan Product Owner:
Google Cloud OAuth consent screen dan pendaftaran redirect URI production. Kalau
agent mentok di situ, bagian lain Phase 2 (migration, RLS dasar, Supabase client)
tetap harus dilanjutkan.

---

# 46. FIRST AGENT DONE CRITERIA

First Agent belum boleh bilang Phase 0 selesai sampai:

- [ ] root inspected;
- [ ] Git inspected;
- [ ] local secret bootstrap ignored;
- [ ] env secret policy implemented;
- [ ] global skills inspected;
- [ ] runtime tooling inspected;
- [ ] DECISIONS exists;
- [ ] this STATUS updated with real values;
- [ ] Git remote verified;
- [ ] no secret tracked;
- [ ] next phase clear.

---

# 47. PHASE STATUS TABLE

| Phase | Name | Status |
|---:|---|---|
| 0 | Project Intake & Safety | DONE |
| 1 | Repository & Runtime Foundation | DONE |
| 2 | Supabase + Auth + Identity | IN_PROGRESS (blocked: Google provider) |
| 3 | RBAC + RLS + Storage Security | IN_PROGRESS |
| 3 | RBAC + RLS + Storage Security | NOT_STARTED |
| 4 | App Shell + Design Foundation | NOT_STARTED |
| 5 | Case + Entity + Evidence Core | NOT_STARTED |
| 6 | Credit Ledger + Pricing | NOT_STARTED |
| 7 | Source Registry + Scan Engine | NOT_STARTED |
| 8 | Result + Graph + AI | NOT_STARTED |
| 9 | Top-up + Payment | NOT_STARTED |
| 10 | Ruang Kendali | NOT_STARTED |
| 11 | Partner Foundation | NOT_STARTED |
| 12 | Jejak Gue + Privacy | NOT_STARTED |
| 13 | PWA + Version Sentinel | NOT_STARTED |
| 14 | Observability + NADI | NOT_STARTED |
| 15 | Security/Abuse Hardening | NOT_STARTED |
| 16 | QA Matrix | NOT_STARTED |
| 17 | Production Readiness | NOT_STARTED |
| 18 | V1 Launch | NOT_STARTED |

---

# 48. CURRENT RELEASE READINESS

```text
V1 Product Blueprint: READY
V1 Implementation: Phase 0-1 DONE, Phase 2-3 IN_PROGRESS, Phase 4-18 NOT_STARTED
V1 Critical QA: build/lint/typecheck/unit/secret/RLS-tamu/storage PASS; login, RLS antar-user, ledger, payment belum
Production Readiness: NOT_READY
```

Jangan mempertahankan persentase manual kalau tidak berguna.
Agent boleh mengganti dengan phase/milestone status lebih akurat.

---

# 49. CHANGE THIS FILE, DON'T APPEND ENDLESSLY

Saat progress:

Salah:
> tambah 500 baris history di bawah.

Benar:
> update current snapshot.

Git sudah menyimpan history.

---

# 50. KEEP THIS FILE SMALL ENOUGH TO READ

Target:
> Agent baru bisa memahami state dalam beberapa menit.

Jika file ini mulai terlalu besar:
- ringkas;
- pindahkan historical explanation ke DECISIONS;
- hapus resolved issue dari current snapshot;
- jangan hapus decision history.

---

# 51. STATUS UPDATE EXAMPLE — PHASE 6

Contoh setelah project jauh berjalan:

```md
Current Phase: PHASE 6 — Credit Ledger
Current Milestone: Atomic reserve + settle
Latest Commit: 8bc2...
Migration Head: 20260814_007_credit_holds

Done:
- Auth
- RLS
- Case
- Wallet/Lots

In Progress:
- reserve_scan_credits

Quality:
- RLS PASS
- Ledger basic PASS
- Ledger race FAIL: AT-CREDIT-003

Blocker:
- none

Next Safe Action:
Fix row locking in reserve flow, rerun AT-CREDIT-003 and AT-CREDIT-018.

Relevant:
- supabase/migrations/...
- server/credits/...
- tests/credits/...
- SCHEMA Credit §§...
```

Agent baru tidak perlu baca seluruh project.

---

# 52. STATUS UPDATE EXAMPLE — PAYMENT

```md
Current Phase: PHASE 9 — Top-up + Payment

Done:
- order snapshot
- proof upload
- Sentinel screening

In Progress:
- approve_topup atomic transaction

Failing:
- AT-PAY-003 double approval
- AT-PAY-005 rollback

Next:
Implement transaction lock/idempotency, rerun Payment Settlement suite.
```

---

# 53. STATUS UPDATE EXAMPLE — HANDOFF

```md
Last session:
- fixed duplicate scan creation;
- committed;
- preview deploy healthy.

Uncommitted:
- none.

Blocker:
- none.

Next Safe Action:
Implement RDAP adapter normalization and run AT-SRC-001/002.
```

---

# 54. FINAL RULES

1. File ini harus selalu akurat.
2. File ini bukan log.
3. Agent baru baca ini dulu.
4. Product Owner tidak boleh disuruh mengulang project.
5. Next Safe Action wajib spesifik.
6. Failing test harus disebut ID.
7. Safari real status harus jujur.
8. Secret jangan pernah masuk file ini.
9. Migration head selalu update setelah DB change.
10. Branch/commit selalu update saat handoff.
11. Global skills status harus diisi first run.
12. Blocker jangan dibiarkan stale.
13. Resolved issue hapus dari current snapshot.
14. Decisions reasoning pindah ke DECISIONS.
15. Blueprint tetap source of truth.
16. Git adalah history.
17. Tests adalah bukti.
18. STATUS adalah keadaan sekarang.
19. Agent wajib merawatnya.
20. Handoff dianggap gagal jika Agent baru tetap perlu wawancara Product Owner tanpa blocker baru.

---

# 55. STARTER HANDOFF

Untuk Agent Coding berikutnya:

> **Phase 0-1 beres. Produksi sudah hidup di `https://www.cekjejak.my.id` dengan auto-deploy dari `main`. Phase 2 tinggal menunggu satu login Google oleh manusia, lalu hasilnya diverifikasi. Jangan init ulang project, jangan bikin project Vercel atau repo baru, jangan ganti package manager, jangan tulis ulang migration yang sudah dipush, jangan matikan Vercel Authentication untuk preview. Kalau login pertama belum terjadi, kerjakan Phase 4. Baca Next Safe Action di bagian 7, lalu langsung kerja.**

**END OF STATUS PROJECT**
