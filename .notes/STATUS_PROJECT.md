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
**Status besar:** Blueprint selesai, implementasi aplikasi belum dimulai dari snapshot awal ini  
**Current Phase:** `PHASE 0 — Project Intake & Safety`  
**Current Milestone:** `Bootstrap Agent Coding pertama`  
**Current Branch:** `BELUM DIVERIFIKASI OLEH AGENT`  
**Latest Commit:** `BELUM DIVERIFIKASI OLEH AGENT`  
**Latest Deploy:** `BELUM ADA / BELUM DIVERIFIKASI`  
**Database Migration Head:** `BELUM ADA / BELUM DIVERIFIKASI`  
**App Version:** `BELUM DITETAPKAN IMPLEMENTASI`  
**Environment:** Blueprint + local bootstrap tersedia  
**Production Status:** `BELUM PRODUCTION`  
**Last Updated By:** `Blueprint handoff`  
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
| `.notes/DECISIONS.md` | NEXT | Decision memory lintas-agent |
| `JEJAK.md` | LOCAL SECRET BOOTSTRAP | Credential + metadata environment, jangan commit |

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

> Snapshot awal ini dibuat sebelum Agent Coding pertama mulai mengimplementasikan aplikasi.

## Sudah Selesai
- [x] Product brainstorming
- [x] Product scope V1/V1.5/V2
- [x] PRD
- [x] Design System
- [x] Wire Map
- [x] Schema blueprint
- [x] Roadmap
- [x] Agent contract
- [x] Acceptance test contract
- [x] Prompt pembuka
- [x] Local environment bootstrap disiapkan oleh Product Owner
- [x] Global tooling/skills sudah dipasang oleh Product Owner
- [x] Workflow lintas-agent dirancang

## Belum Dimulai / Belum Diverifikasi
- [ ] Git repository state
- [ ] `.gitignore` secret safety
- [ ] Next.js app initialization
- [ ] Dependency audit
- [ ] Global skill inventory actual
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

## PHASE 0 — Project Intake & Safety

### Tujuan
Pastikan Agent pertama:
- memahami project tanpa re-read semua docs;
- mengamankan secret;
- mengecek global skills;
- mengecek Git;
- membuat runtime baseline;
- tidak merusak file blueprint.

### Phase 0 Status
`NOT_STARTED`

### Wajib Dibaca
- `PROMPT_PEMBUKA.md`
- `.notes/AGENTS.md`
- `docs/ROADMAP.md` bagian Phase 0
- `docs/SCHEMA.md` bagian bootstrap/environment/secret
- file ini
- `.notes/DECISIONS.md` setelah dibuat

### Tidak Perlu Dibaca Full Saat Phase 0
- seluruh `DESIGN_SYSTEM.md`
- seluruh `WIRE_MAP.md`
- seluruh `ACCEPTANCE_TESTS.md`

---

# 6. CURRENT PRIORITY

Urutan terdekat:

1. pastikan `JEJAK.md` di-ignore Git;
2. pastikan env secret tidak tracked;
3. inspect Git remote dan existing state;
4. inspect global skills/tooling;
5. buat `.notes/DECISIONS.md` jika belum;
6. inspect Node/package manager;
7. verify Next.js/Supabase/Vercel tooling;
8. initialize runtime tanpa menghapus blueprint;
9. production build baseline;
10. update file ini;
11. lanjut Phase 1.

---

# 7. NEXT SAFE ACTION

> **Ini bagian paling penting untuk Agent berikutnya. Harus selalu spesifik.**

## Next Safe Action Saat Ini

**Jalankan bootstrap Phase 0.**

Urutan:

1. inspect root project;
2. inspect `git status`;
3. inspect `.gitignore`;
4. pastikan `JEJAK.md` tidak tracked;
5. pastikan `.env*` sensitif tidak tracked;
6. inspect global skills/tooling yang tersedia;
7. verify Git remote;
8. verify Node/package manager;
9. create `.notes/DECISIONS.md` jika belum ada;
10. update `Current Branch`, `Latest Commit`, dan environment info di file ini;
11. lanjut ke runtime initialization sesuai ROADMAP.

### Relevant Files
- `PROMPT_PEMBUKA.md`
- `.notes/AGENTS.md`
- `docs/ROADMAP.md`
- `docs/SCHEMA.md`
- `JEJAK.md` lokal

---

# 8. BLOCKER

**Current blocker:** `TIDAK ADA YANG SUDAH TERKONFIRMASI`

Agent pertama harus inspect environment.

Jangan menganggap:
- credential valid;
- Git remote benar;
- Supabase connected;
- package terinstall;
- Vercel connected

sebelum diperiksa.

---

# 9. GLOBAL SKILLS / TOOLING STATUS

Product Owner sudah memberi tahu bahwa banyak skills/tooling dipasang secara global.

## Status
`BELUM DIINVENTARISASI OLEH AGENT`

Agent pertama wajib mengisi:

```text
Node:
npm/pnpm/yarn/bun:
Git:
GitHub CLI:
Supabase CLI:
Vercel CLI:
Browser automation:
Testing:
PWA tooling:
Security tools:
Other relevant global skills:
```

### Rule
Jangan install ulang sebelum cek.

---

# 10. SECRET SAFETY STATUS

## Local secret bootstrap
`JEJAK.md`

### Status
`BELUM DIVERIFIKASI AGENT`

Wajib cek:
- [ ] di `.gitignore`
- [ ] tidak tracked
- [ ] tidak staged
- [ ] secret tidak masuk blueprint
- [ ] env server/client dipisah
- [ ] secret tidak masuk client bundle
- [ ] secret scan baseline

Jika salah satu gagal:
> Phase 0 belum boleh DONE.

---

# 11. GIT STATUS

**Repository:** `BELUM DIVERIFIKASI AGENT`

Isi setelah inspect:

```text
Current branch:
Remote:
Latest commit:
Working tree:
Untracked files:
Secret files tracked?:
```

### Rule
Jangan force push.
Jangan reset repo.
Jangan init ulang jika repo existing.

---

# 12. RUNTIME STATUS

```text
Node version: BELUM DIVERIFIKASI
Package manager: BELUM DIVERIFIKASI
Next.js: BELUM DIVERIFIKASI
TypeScript: BELUM DIVERIFIKASI
Build: NOT_RUN
Lint: NOT_RUN
Typecheck: NOT_RUN
Tests: NOT_RUN
```

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
| Production Build | NOT_RUN | - | |
| Typecheck | NOT_RUN | - | |
| Lint | NOT_RUN | - | |
| Unit Tests | NOT_RUN | - | |
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
| Secret Scan | NOT_RUN | - | |
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
| Bootstrap & Secret Safety | NOT_RUN | |
| Git & Environment | NOT_RUN | |
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

Snapshot awal:

- Belum ada issue implementasi karena code belum diverifikasi/dimulai.
- Secret safety belum diverifikasi Agent.
- Real Safari QA belum dilakukan.
- Repository state belum diverifikasi.
- Supabase connection belum diverifikasi.
- Production deploy belum ada/dikonfirmasi.

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
Migration files: BELUM DIVERIFIKASI / NONE
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
Implementation: NOT VERIFIED
Secret safety: NOT VERIFIED
Git: NOT VERIFIED
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

Saat starter ini dibuat:
> tidak ada blocker terkonfirmasi.

Agent first run harus memverifikasi sendiri.

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
| 0 | Project Intake & Safety | NOT_STARTED |
| 1 | Repository & Runtime Foundation | NOT_STARTED |
| 2 | Supabase + Auth + Identity | NOT_STARTED |
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
V1 Implementation: 0%
V1 Critical QA: 0%
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

Untuk Agent Coding pertama:

> **Lo lagi masuk project Jejak pada kondisi blueprint-ready, belum implementation-ready. Mulai dari Phase 0. Jangan baca semua file dari awal. Amankan secret, cek Git, cek global skills, create/verify DECISIONS, isi nilai real di STATUS ini, lalu lanjut runtime foundation.**

**END OF STATUS PROJECT**
