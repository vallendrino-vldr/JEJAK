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
**Domain target:** `jejak.my.id`  
**Status besar:** Phase 0 dan Phase 1 lulus exit gate. Runtime foundation hidup, quality gate hijau, belum ada Supabase/Auth.  
**Current Phase:** `PHASE 2 — Supabase + Auth + Identity`  
**Current Milestone:** `Koneksi Supabase + migration awal + Google OAuth SSR`  
**Current Branch:** `main`  
**Latest Commit:** `0465989` — feat(bootstrap): phase 0-1 foundation, quality gate, and secret scanner  
**Latest Deploy:** `BELUM ADA` (Vercel belum di-link)  
**Database Migration Head:** `NONE` (belum ada migration)  
**App Version:** `0.1.0`  
**Environment:** `.env.local` terisi lengkap (Supabase URL/publishable/secret/JWKS, 4 Gemini, 4 Groq), file ignored  
**Production Status:** `BELUM PRODUCTION`  
**Last Updated By:** `Claude Code — interrupted resume dari sesi Codex`  
**Last Updated At:** `2026-08-09`

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

## Belum Dimulai / Belum Diverifikasi
- [ ] Supabase runtime connection
- [ ] Google OAuth
- [ ] Database migrations
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

## Next Safe Action Saat Ini

**Sambungkan Supabase dan buat migration identity pertama.**

Konkret:

1. verifikasi project Supabase aktif memakai `SUPABASE_SECRET_KEY` dari server-side (jangan pernah dari client);
2. buat folder `supabase/migrations/` dan migration pertama untuk tabel identity/profile sesuai `docs/SCHEMA.md`, dengan RLS `enable` + deny-by-default sejak migration pertama (jangan tunda ke Phase 3);
3. tambahkan Supabase SSR client di `src/lib/supabase/` — pemisahan tegas browser client (publishable) dan server client (secret, `server-only`);
4. implement route Google OAuth: sign-in, callback, sign-out, memakai pola SSR/PKCE resmi Supabase versi saat ini;
5. bootstrap role Owner untuk `vadlyvldr@gmail.com` sebagai row di DB, bukan `if email === owner` di kode;
6. tulis test: session kosong tidak bisa baca profile orang lain (negative test dasar);
7. jalankan `pnpm check`, update `Migration Head` + Quality Gates di file ini, commit checkpoint.

### Relevant Files
- `docs/ROADMAP.md` Phase 2
- `docs/SCHEMA.md` bagian auth/identity/RLS
- `docs/ENVIRONMENT_CONTRACT.md`
- `src/lib/env/server.ts`, `src/lib/env/client.ts`
- `supabase/migrations/` (belum ada, akan dibuat)

---

# 8. BLOCKER

**Current blocker:** `TIDAK ADA`

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
Project metadata: tersedia via local bootstrap
Region: Singapore target
Connection: BELUM DIVERIFIKASI
CLI link: BELUM DIVERIFIKASI
Migration head: BELUM ADA / BELUM DIVERIFIKASI
RLS: NOT_IMPLEMENTED
Storage: NOT_IMPLEMENTED
Google Auth: NOT_IMPLEMENTED
Owner bootstrap: NOT_IMPLEMENTED
```

### Jangan simpan secret di file ini.

---

# 14. VERCEL STATUS

```text
Project linked: BELUM DIVERIFIKASI
Production URL: BELUM ADA / BELUM DIVERIFIKASI
Preview protection: BELUM DIVERIFIKASI
Region config: BELUM DIVERIFIKASI
Environment variables: BELUM DIVERIFIKASI
```

---

# 15. GOOGLE AUTH STATUS

```text
OAuth provider configured: BELUM DIVERIFIKASI
Production redirect: BELUM DIVERIFIKASI
PKCE/session flow: NOT_IMPLEMENTED
Owner role bootstrap: NOT_IMPLEMENTED
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
| Unit Tests | PASS | 2026-08-09 | 16 test |
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

- Supabase runtime connection belum pernah diuji dari kode (credential ada, koneksi belum dibuktikan).
- Google OAuth belum dikonfigurasi; redirect URI production belum didaftarkan.
- Vercel project belum di-link, jadi region `sin1` di `vercel.json` belum terbukti berlaku.
- CI Quality Gate belum pernah jalan di GitHub (baru ada setelah push pertama).
- Real Safari QA belum dilakukan — `NOT_AVAILABLE`, bukan PASS.
- `getClientEnv`/`getServerEnv` sudah ada tapi belum dipakai halaman mana pun, jadi env validation belum terbukti di jalur runtime nyata.

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
Migration strategy: defined in SCHEMA
Migration files: NONE (folder supabase/migrations belum dibuat)
Migration head: NONE
Fresh DB apply: NOT_RUN
Existing DB apply: NOT_RUN
RLS policies: NOT_IMPLEMENTED
Seed data: NOT_IMPLEMENTED
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
Latest Production:
Latest Preview:
Last Successful:
Last Rollback:
```

Initial:
> none / unverified.

---

# 37. LAST VERIFIED

Saat ini:

```text
Blueprint documents: VERIFIED READY
Implementation: VERIFIED sampai Phase 1 (pnpm check hijau, 2026-08-09)
Secret safety: VERIFIED (ignore + scan + client bundle)
Git: VERIFIED (repo terisolasi, remote benar, commit 0465989)
Supabase runtime: NOT VERIFIED
Vercel runtime: NOT VERIFIED
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
| 2 | Supabase + Auth + Identity | IN_PROGRESS |
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
V1 Implementation: Phase 0-1 DONE, Phase 2 IN_PROGRESS, Phase 3-18 NOT_STARTED
V1 Critical QA: build/lint/typecheck/unit/secret PASS; auth/RLS/ledger/payment belum ada
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

> **Phase 0 dan Phase 1 sudah beres dan terbukti (`pnpm check` hijau di commit `0465989`). Jangan init ulang project, jangan bikin app baru di subfolder, jangan ganti package manager. Lo mulai dari Phase 2: Supabase + Auth + Identity. Baca Next Safe Action di bagian 7, lalu langsung kerja.**

**END OF STATUS PROJECT**
