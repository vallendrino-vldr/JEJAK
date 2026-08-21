# HANDOFF — JEJAK

> **AGENT BARU: BACA FILE INI DULU, JANGAN FULL-AUDIT.**
> File ini cukup untuk paham kondisi proyek dari awal sampai sekarang tanpa membaca ulang seluruh kode/blueprint. Baru buka file lain kalau memang menyentuhnya.
> Urutan baca: file ini → `.notes/DECISIONS.md` (kalau butuh alasan arsitektur) → bagian blueprint yang relevan saja.
> Bahasa ke Product Owner: Indonesia gaul, `lo/gue`, singkat, jujur. Dia bukan programmer — jelaskan lewat dampak, bukan jargon. Jangan minta konfirmasi untuk hal yang sudah jelas di blueprint; kerja mandiri.

---

## 1. Apa itu JEJAK

Alat pemeriksaan jejak digital berbasis bukti — "Periksa sebelum percaya." User cek email/nomor HP/nama/username/domain, hasilnya evidence-first (jujur soal ketidakpastian), disimpan dalam Kasus. Monetisasi lewat kredit. Bukan alat stalking/doxxing.

Stack terkunci: **Next.js 16 (App Router) + Supabase + Vercel + Google OAuth**, backend region Singapore. UI 100% Bahasa Indonesia, tema gelap "Obsidian Aurora".

---

## 2. URL & akses penting

| Hal | Nilai |
|---|---|
| Produksi | `https://www.cekjejak.my.id` (apex `cekjejak.my.id` → redirect ke www) |
| Repo GitHub | `github.com/vallendrino-vldr/JEJAK` (branch produksi `main`, **publik**) |
| Vercel | team `vallendrino`, project `jejak` — auto-deploy dari `main` |
| Supabase (canonical) | project ref `tauyicvfhpfnohhgccvn`, region ap-southeast-1 |
| Cek versi live | `curl https://www.cekjejak.my.id/api/version` → `buildId` = SHA commit yang live |

**Akun git membingungkan (penting):** owner repo = `vallendrino-vldr`. User git lokal = `vadlyvldr` (akun beda, token-nya di git store TIDAK punya izin push). Yang bisa push adalah kredensial cache di Windows Credential Manager (GCM) = akun owner. Lihat cara push di §4.

**Ada project Supabase DUPLIKAT** (cadangan kosong) — canonical adalah yang LAMA (`tauyicvfhpfnohhgccvn`), lihat DEC-0125. `.env.local` dan Vercel sudah menunjuk canonical. Jangan tertukar.

---

## 3. Kredensial (JANGAN print isinya)

- Runtime lokal: `.env.local` (di root, gitignored) — sudah terisi lengkap dan menunjuk canonical.
- Bootstrap lengkap (semua API key, DB password, dll): file **`C:\Users\Administrator\Desktop\FOLDER TEXT PENTING\JEJAK.md`** (di luar repo). Ada juga `JEJAK.md` di root repo (gitignored).
- Password database canonical ada di field `Password Database` file itu. Dibutuhkan untuk apply migration (§4).
- Vercel env sudah berisi: `NEXT_PUBLIC_SUPABASE_URL/PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY/JWKS_URL`, 4×`GEMINI_API_KEY`, 4×`GROQ_API_KEY`, `APP_VERSION`, `BUILD_ID`. Kode hanya baca env-env itu (+ `NODE_ENV`/`VERCEL_ENV` bawaan). Tidak ada env baru yang perlu ditambah untuk kode saat ini.
- Perlakukan semua sebagai rahasia; jangan echo/commit/print.

---

## 4. CARA KERJA (OPS) — WAJIB TAHU

### Deploy
Push ke `main` → Vercel auto-deploy. **Jangan bikin project Vercel/repo baru, jangan ubah domain.**

### Push git (GCM suka munculin dialog GUI yang nge-block sesi headless)
Selalu pakai:
```bash
GCM_INTERACTIVE=never GIT_TERMINAL_PROMPT=0 git push origin main
```
Muncul pesan "Cannot prompt because user interactivity has been disabled" TAPI tetap push dari kredensial cache. Kalau `git push` biasa nge-hang, itu sebabnya — pakai perintah di atas.

### Package manager
pnpm 11 via corepack. Kalau `pnpm` not found: `corepack enable` sekali. Node v24.

### Quality gate (WAJIB hijau sebelum commit)
```bash
pnpm check
```
= format:check + secret:scan + lint + typecheck + test + build. Ini gate deterministik (tanpa kredensial) yang juga dijalankan CI GitHub Actions. **Jangan lolosin kalau merah.**

### Test yang butuh DB/kredensial (TIDAK jalan di CI publik — repo publik)
```bash
pnpm gate:integrasi   # vitest integration (butuh .env.local) + semua suite SQL
```

### Apply migration ke canonical DB
CLI Supabase `db query -f` cuma bisa **1 statement per panggilan**. Host langsung `db.<ref>.supabase.co` IPv6-only (ENOTFOUND) — JANGAN dipakai. Pakai **session pooler**:
```
postgresql://postgres.tauyicvfhpfnohhgccvn:<DB_PASSWORD_ENCODED>@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```
(`<DB_PASSWORD_ENCODED>` = percent-encode password dari file kredensial; `@` jadi `%40`.)

Pola yang dipakai (via node, tanpa print secret) — jalankan tiap statement terpisah:
```js
const {execFileSync}=require("node:child_process");
const {createRequire}=require("node:module");const {dirname,join}=require("node:path");
const cli=join(dirname(createRequire(process.cwd()+"/x.js").resolve("supabase/package.json")),"dist","supabase.js");
// tulis satu statement ke file .s.sql, lalu:
execFileSync(process.execPath,[cli,"db","query","--db-url",URL,"-f",".s.sql"],{stdio:["ignore","pipe","pipe"]});
```
Untuk `pnpm db:test`: set `JEJAK_DB_URL` = URL pooler di atas dulu (scriptnya sengaja nolak jalan tanpa itu, proteksi project duplikat).

**Docker tidak tersedia** → `supabase start`/`db diff`/local reset tidak jalan. Migration ditulis tangan → apply ke remote pakai cara di atas. Itu sebabnya migration head lokal = yang diterapkan (tidak pakai migration history table CLI).

> **⚠️ BLOCKER APPLY MIGRATION (per 2026-08-21):** Password Database di `JEJAK.md` **gagal auth** ke canonical (`FATAL 28P01 password authentication failed`) via pooler — kemungkinan stale/rotated atau milik project duplikat. MCP Supabase yang ke-connect **hanya punya akun project DUPLIKAT** (`gzmtzdvxerpvetfmqale` "JEJAK" + `hjdctzrvnhvarxoxixrn` "Malesan") — BUKAN canonical `tauyicvfhpfnohhgccvn`. Jadi **DDL ke canonical belum bisa** sampai Product Owner kasih salah satu: (a) DB password canonical yang benar, (b) reset password di dashboard Supabase → kasih yang baru, atau (c) access token / connect MCP ke akun pemilik canonical. Service key (`SUPABASE_SECRET_KEY`) tetap jalan untuk RPC/PostgREST (mis. `grant_credits` sukses), tapi itu tidak bisa DDL. Semua kerja schema (Phase 9 dst) nunggu ini.

---

## 5. STATUS PER FITUR (per 2026-08-21, commit `cfaea29`, migration head `20260821080000`)

Empat tingkat: **acceptance-proven** (ada test) · **production-functional** (jalan, teruji manual) · **wired** (nyambung, belum diuji tuntas) · **belum**.

| Area | Tingkat | Catatan |
|---|---|---|
| Auth Google + sesi SSR | acceptance-proven | login nyata sukses; peran dari DB, bukan email frontend |
| RBAC + RLS (deny-by-default) | acceptance-proven | 24 permission; isolasi antar-user diuji (case-isolation, rls-cross-user, dll) |
| App Shell (nav 4 tab, panel, no-scroll) | production-functional | mobile bottom-nav + desktop rail; QA lintas-browser belum |
| Kasus: buat/daftar/buka/petunjuk | acceptance-proven | identifier terenkripsi (Vault) + blind index HMAC |
| Kasus: bukti + hubungan + linimasa | acceptance-proven | Evidence Doctrine ditegakkan constraint DB |
| Kasus: hapus→sampah + pulihkan | production-functional | reversibel ~3 hari; `/kasus/sampah` |
| Periksa DOMAIN | production-functional | scan penuh berbayar via RDAP, durable Vercel Workflow, settle/refund; hasil di `/periksa/[ref]` |
| Periksa HP / Email / Username | production-functional | cek INSTAN GRATIS di luar pipeline kredit (libphonenumber / DNS-MX / GitHub+GitLab API). Detail lengkap. Bukan scan berbukti. |
| Periksa NAMA | sengaja belum | nama ambigu — minta petunjuk, tidak menyimpulkan |
| Kredit ledger + Dompet | wired | wallet + lot + ledger + FEFO + hold (Codex, teruji SQL). Dompet nampilkan saldo asli. Trigger bikin wallet tiap user baru. |
| Ruang Kendali (admin) | production-functional | Ringkasan/Pengguna/Pemeriksaan/Sumber — owner-only, read-only |
| PWA install (manifest + ikon) | production-functional | installable. **Service worker + Version Sentinel BELUM** |
| **Analisa AI (Phase 8)** | wired | Analis DOMAIN jalan: bagian "Analisa" di `/periksa/[ref]` (scan completed) baca RDAP → ringkasan+observasi via Groq `openai/gpt-oss-20b` primary / Gemini `gemini-3.5-flash-lite` failover (~1.5s, keduanya smoke vs data RDAP asli), grounded + fallback rule-based, DI LUAR jalur kredit (route read-only RLS). Teruji: provider live + logika unit + gate hijau + analisa jalan vs data google.com asli. Skeptic/korelasi/graph/asisten belum. Cache: Next Data Cache (`unstable_cache`) 1 jam per-scan. DEC-0127. |
| **Pembayaran/top-up (Phase 9)** | **BELUM** | beli kredit, transfer manual, approval atomik. Belum ada. |
| Partner (11), Observability/NADI (14), Security hardening (15), QA (16), Rilis (17-18) | belum | |

CI GitHub Actions "Quality Gate" HIJAU di `main`.

---

## 6. ARSITEKTUR & POLA WAJIB (jangan langgar)

1. **RLS deny-by-default.** Frontend BUKAN batas keamanan. Owner/peran dari tabel `user_roles`, dibaca ulang tiap request (bukan klaim JWT), lihat `src/lib/auth/session.ts`.
2. **Tulis lewat fungsi, bukan INSERT client.** Tidak ada policy INSERT/UPDATE untuk client di tabel apa pun. Semua mutasi lewat fungsi `SECURITY DEFINER` yang cek izin sendiri + `set search_path=''` + grant execute ke `authenticated`. Contoh: `buat_kasus`, `tambah_petunjuk`, `catat_bukti`, `hapus_kasus`, `ringkasan_kendali`, dll (§8).
3. **Batasi kolom pakai GRANT per kolom, BUKAN `grant tabel` lalu `revoke kolom`** (Postgres nggak ngurangin hak tingkat tabel — ini pernah bocorin ciphertext, DEC-0116).
4. **Uang/kredit atomik + idempotent + service-only** (DEC-0121). Jangan sentuh ledger dari client. Jangan bikin `profiles.credits` integer.
5. **Kunci enkripsi identifier hidup di Supabase Vault**, dibaca `app.kunci()` (DEFINER, tak bisa dipanggil client). Jangan pindah ke env (DEC-0114).
6. **Evidence Doctrine ditegakkan constraint DB** (DEC-0120): bukti wajib bawa sumber/kelas/waktu/keandalan; inferensi AI tak boleh `verified_fact`; timeline cuma bukti berwaktu.
7. **Kolom atribusi** (`created_by` dll) `on delete set null` supaya hapus akun tidak terhalang (DEC-0117).
8. **Design token** di `src/app/globals.css` dua lapis (mentah → semantik). Komponen JANGAN nulis hex. Merek selalu `<Wordmark>` = "JEJAK" (uppercase). Emas hanya untuk warning.
9. **SSRF guard** `src/lib/security/public-network.ts` untuk semua fetch domain/URL user. Cek instan HP/email/username aman karena host tetap (api.github.com/gitlab.com) atau DNS-only.
10. **No global page scroll** — shell setinggi viewport, scroll internal saja.

---

## 7. PIPELINE SCAN (baca ini sebelum nambah tipe scan)

Alur domain: `/periksa` (submit, `src/app/(app)/periksa/actions.ts`) → RPC `mulai_scan` (atomik: quote, scan, target terenkripsi, source-run, dispatch outbox — lahir/batal bersama) → dispatch (`src/lib/scan/dispatch.ts`, transactional outbox) → durable Vercel Workflow (`src/workflows/scan.ts`: klaim source, jalankan adapter, finalize/refund) → hasil `/periksa/[ref]`.

**PENTING:** `src/workflows/scan.ts` `runSourceStep` **HARDCODED ke `core_rdap` + `domain`** — melempar `FatalError("invalid_source_contract")` untuk selain itu. Nambah tipe scan berbukti-berbayar = harus: adapter baru (`src/lib/scan/adapters/`), entry `source_registry`, entry `scan_products`, mapping target-type→source di `mulai_scan`, dispatch adapter di workflow, lalu nyalain UI. Ini menyentuh jalur kredit → **bangun UTUH + uji lewat `scan-workflow-invariants.sql` SEBELUM nyalain UI**, jangan sepotong.

Cek instan HP/email/username sengaja DI LUAR pipeline ini (gratis, tanpa kredit) — pola aman untuk nambah nilai tanpa risiko uang. Filenya: `src/lib/periksa/{telepon,email,username}.ts`, dirender di `src/app/(app)/periksa/page.tsx`.

---

## 8. PETA FILE PENTING

```
src/app/(app)/            layout (auth gate + shell), beranda, periksa, kasus/*, jejak-gue, ruang-kendali/*
src/app/masuk, auth/*      login Google (GET link → /auth/masuk-google → callback PKCE)
src/proxy.ts               middleware Next 16 (refresh sesi, redirect tamu). RUTE_PUBLIK di src/lib/supabase/middleware.ts
src/lib/auth/              session.ts (baca peran dari DB), actions.ts (keluar), tujuan.ts (anti open-redirect)
src/lib/supabase/          client/server/middleware/admin (client admin = service key, hati-hati)
src/lib/kasus/             actions.ts, baca.ts, bukti.ts, bukti-actions.ts
src/lib/periksa/           deteksi.ts (tipe input), telepon/email/username.ts (cek instan)
src/lib/scan/              engine.ts (mulaiScan), dispatch.ts, adapters/rdap.ts
src/lib/ledger/service.ts  bacaDompetPengguna, riwayat
src/lib/security/public-network.ts  SSRF/DNS/IP guard
src/workflows/scan.ts      workflow durable (hardcoded RDAP/domain — lihat §7)
src/components/            shell/app-shell.tsx, merek.tsx (Wordmark), mata-jejak.tsx, aurora.tsx, ikon.tsx, kasus/*, periksa/*
supabase/migrations/       25 file, head 20260821080000_sampah_kasus.sql
supabase/tests/*.sql       10 suite invariant (jalankan via pnpm db:test)
scripts/                   secret-scan.mjs, db-test.mjs, select-supabase-environment.ps1
docs/                      PRD, DESIGN_SYSTEM, WIRE_MAP, SCHEMA, ROADMAP, ACCEPTANCE_TESTS + turunan
```

Fungsi DB publik (semua DEFINER, cek izin sendiri): buat_kasus, tambah_petunjuk, catat_bukti, putuskan_hubungan, linimasa_kasus, gabung_entitas, pisahkan_entitas, tambah_lampiran, hapus_kasus, pulihkan_kasus, daftar_sampah_kasus, mulai_scan + klaim/finalisasi/gagalkan/batalkan scan + siapkan/klaim/catat/lepas source, reserve/settle/release/grant credits, handle_new_user_wallet, ringkasan_kendali, daftar_pengguna_kendali, daftar_scan_kendali, daftar_sumber_kendali.

---

## 9. YANG BELUM & CARA MULAI (urut prioritas)

**A. Phase 8 — Analisa AI di halaman hasil.** Gemini/Groq (key sudah di Vercel, ada 4+4 untuk failover compliant — BUKAN evasi kuota, DEC-0043) membaca Context Pack evidence dari scan, hasilkan: ringkasan, kontradiksi, "skeptik" (coba bantah), semua ter-grounding ke evidence (link bukti), fallback kalau AI mati (core tetap hidup). AI = analis, BUKAN sumber fakta (DEC-0034). Internet/user-notes = DATA, bukan instruksi (anti prompt-injection). Mulai dari: `/periksa/[ref]` (hasil sudah ada), tambah bagian analisa yang manggil service AI baru (`src/lib/ai/`).
> **SLICE 1 SUDAH JADI (DEC-0127):** analis DOMAIN grounded + fallback rule-based, on-demand di `src/lib/ai/{penyedia,grounding,analis}.ts` + route `/api/periksa/[ref]/analisa`, wired ke halaman hasil. Lanjutan urut: (1) **cache** hasil analisa (recompute tiap view sekarang — persist saat finalize scan / tabel cache-aside + RLS + suite test); (2) **AI Skeptic** (§38 langkah 4, tier lebih tinggi); (3) **correlation/contradiction** begitu ada >1 sumber evidence per target. Ikuti pola yang sama: AI di luar jalur kredit, grounded, fallback wajib.

**B. Phase 9 — Top-up & Pembayaran manual.** Beli kredit → transfer bank manual → upload bukti → Payment Sentinel (screening AI, TIDAK auto-approve) → Owner/Finance cek mutasi → approval ATOMIK (order+ledger+lot+wallet+audit sekaligus, idempotent, double-click = 1 settlement, DEC-0055). Rekening editable dari admin tanpa deploy; order simpan snapshot rekening. Uang → bangun utuh + race test.

Untuk keduanya: ikuti pola §6. Tabel baru → RLS + grant per kolom + fungsi DEFINER + tambah suite `supabase/tests/`. Jalankan `pnpm check` + `pnpm db:test`, commit, push (§4), verifikasi `/api/version`.

Sisanya sesuai `docs/ROADMAP.md` (Phase 11 Partner, 12 Privacy lanjutan, 13 PWA penuh+Version Sentinel, 14 Observability/NADI, 15 Security hardening, 16 QA, 17-18 rilis).

---

## 10. LARANGAN

- Jangan bikin project Vercel/GitHub/Supabase baru; jangan ubah domain kanonik; jangan pakai project Supabase duplikat.
- Jangan tambah policy INSERT/UPDATE client; jangan `grant tabel` lalu `revoke kolom`.
- Jangan pindah kunci Vault ke env; jangan sentuh ledger dari client.
- Jangan nyalain tipe scan berbayar baru sebelum pipeline-nya utuh + teruji.
- Jangan matikan Vercel Authentication untuk preview (DEC-0112); jangan longgarkan RLS/scanner cuma biar hijau.
- Jangan klaim "selesai" tanpa `pnpm check` hijau + (untuk DB) `pnpm db:test` hijau.
- Jangan tulis ulang arsitektur karena selera. Refactor hanya untuk bug/security/perf nyata + catat DECISION.

---

## 11. Catatan operasional lain

- Secret sempat terekspos di transcript sesi sebelumnya. Product Owner memilih TIDAK merotasi untuk sekarang — hormati, jangan ungkit lagi.
- `.notes/STATUS_PROJECT.md` = snapshot (bisa lebih ringkas dari file ini). `.notes/DECISIONS.md` = DEC-0001..0126, alasan tiap keputusan (jangan hapus, tandai SUPERSEDED kalau berubah). File ini (HANDOFF.md) = titik masuk utama; rawat tetap akurat setelah milestone.
