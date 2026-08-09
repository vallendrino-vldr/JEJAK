# ROADMAP — JEJAK

> **Status:** Execution Roadmap untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Mode kerja:** autonomous-by-default, blocker-only questions, quality-gated delivery  
> **Source of truth:** `docs/PRD.md`, `docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`, `docs/SCHEMA.md`, `.notes/AGENTS.md`  
> **Operational state:** `.notes/STATUS_PROJECT.md`, `.notes/DECISIONS.md`

---

# 0. TUJUAN ROADMAP

Roadmap ini menjawab:

> **“Agent mulai dari folder `JEJAK` yang isinya blueprint dan credential bootstrap. Dalam urutan apa Agent harus bekerja sampai V1 production-ready, apa yang harus selesai di tiap fase, apa yang dilarang dikerjakan terlalu cepat, dan kapan sebuah fase boleh dianggap selesai?”**

Dokumen ini sengaja dibuat untuk:
- Claude Code;
- Codex;
- Antigravity;
- Agent Coding lain;
- pergantian agent karena limit;
- pekerjaan multi-sesi;
- continuation tanpa membaca ulang seluruh blueprint.

Roadmap ini **bukan timeline tanggal kalender**.

Yang dikunci adalah:
- urutan dependency;
- quality gate;
- definition of done;
- handoff state;
- prioritas bisnis;
- prioritas keamanan;
- prioritas performa.

Agent boleh bekerja cepat.

Agent **tidak boleh lompat dependency penting** hanya agar banyak fitur terlihat jadi.

---

# 1. PRINSIP EKSEKUSI UTAMA

## 1.1 Build Vertical Slice, Bukan Tumpukan Mockup

Prioritas:
> jalur yang benar-benar hidup end-to-end.

Lebih baik:
> Login → Case → Scan → Credit → Result → Payment → Admin approve

benar-benar bekerja,

daripada:
> 50 layar cantik dengan backend palsu.

---

## 1.2 Foundation Before Feature Count

Jika salah satu belum sehat:
- Auth;
- RLS;
- Credit ledger;
- Payment transaction;
- App Shell;
- PWA update;
- secure environment;
- migration;

Agent **tidak boleh mengalihkan perhatian dengan membuat fitur tambahan**.

---

## 1.3 V1 Dulu

Roadmap dikategorikan:
- **V1**
- **V1.5**
- **V2**

Agent tidak boleh membangun V1.5 hanya karena terlihat menarik jika V1 Quality Gate belum hijau.

---

## 1.4 Autonomous Default

Jika Agent dapat:
- membuat file;
- menjalankan command;
- install dependency yang memang belum ada;
- membuat migration;
- menjalankan test;
- memperbaiki error;
- push Git;
- deploy;
- update env;
- membaca dokumentasi;
- menggunakan global skill;

maka:
> **kerjakan sendiri.**

Jangan meminta Product Owner melakukan pekerjaan yang tool Agent mampu lakukan.

---

## 1.5 Blocker-Only Questions

Agent hanya bertanya jika:
- credential benar-benar tidak ada;
- tindakan external human-only diperlukan;
- keputusan bisnis blueprint benar-benar kontradiktif;
- provider/account membutuhkan persetujuan yang Agent tidak dapat lakukan;
- destructive irreversible action membutuhkan Product Owner.

Bukan blocker:
- nama komponen;
- warna;
- route;
- struktur table;
- mobile nav;
- harga seed;
- credit model;
- RLS philosophy;
- payment flow;
- source priority.

Semuanya sudah didokumentasikan.

---

# 2. FILE READ ORDER UNTUK AGENT BARU

Agent baru **jangan langsung membaca semua file penuh**.

Urutan:

1. `.notes/STATUS_PROJECT.md`
2. `.notes/DECISIONS.md`
3. bagian `ROADMAP.md` untuk fase aktif
4. file implementasi yang sedang disentuh
5. bagian blueprint yang relevan saja:
   - PRD untuk rule bisnis;
   - SCHEMA untuk data/RLS;
   - WIRE_MAP untuk flow;
   - DESIGN_SYSTEM untuk UI.

Jika status menunjukkan:
> “Phase 8 — Payment”

maka Agent tidak perlu membaca full Design System kecuali mengerjakan UI payment.

---

# 3. WAJIB MEMELIHARA STATUS PROJECT

Setelah bootstrap pertama Agent membuat:

`/.notes/STATUS_PROJECT.md`

Minimal template:

```md
# STATUS PROJECT — JEJAK

## Snapshot
Current phase:
Current milestone:
Current branch:
Latest commit:
Latest deploy:
Database migration head:
App version:

## Selesai
- ...

## Sedang Dikerjakan
- ...

## Belum
- ...

## Quality Gates
- Auth:
- RLS:
- Ledger:
- Payment:
- PWA:
- Performance:
- Brave:
- Safari real device:
- Security:

## Blocker
- Tidak ada / ...

## Last Verified
- ...

## Next Safe Action
1. ...

## Files Relevant
- ...
```

Update:
- setelah milestone;
- sebelum ganti fase;
- setelah deploy;
- setelah migration;
- setelah QA;
- sebelum sesi agent berhenti;
- jika blocker ditemukan.

---

# 4. WAJIB MEMELIHARA DECISIONS

`/.notes/DECISIONS.md`

Untuk keputusan implementation-level yang tidak sudah dikunci blueprint.

Format:

```md
## DEC-0001 — Judul

Tanggal:
Fase:
Status: Aktif / Diganti

### Masalah
...

### Keputusan
...

### Alasan
...

### Dampak
...

### Blueprint terkait
...

### Menggantikan
...
```

Jangan catat hal sepele.

Catat yang dapat membuat Agent berikutnya:
> “Kenapa implementasinya begini?”

---

# 5. GLOBAL SKILLS / TOOLING BOOTSTRAP

Product Owner sudah memasang banyak skills/tooling secara global.

Setiap Agent pada sesi awal:
1. inspect environment;
2. enumerate relevant global skills/tools;
3. gunakan yang relevan;
4. jangan install ulang jika sudah ada;
5. jangan berasumsi skill tertentu ada sebelum cek;
6. jika ada tool resmi yang lebih tepat, prefer itu;
7. tulis tool decision penting di DECISIONS.

Contoh kategori:
- Supabase;
- Next.js;
- Vercel;
- browser testing;
- accessibility;
- security;
- database;
- Git;
- lint/test;
- image optimization;
- PWA;
- performance.

---

# 6. HIGH-LEVEL PHASE MAP

```text
PHASE 0  Project Intake & Safety
   ↓
PHASE 1  Repository + Runtime Foundation
   ↓
PHASE 2  Supabase + Auth + Identity
   ↓
PHASE 3  RBAC + RLS + Storage Security
   ↓
PHASE 4  App Shell + Design Foundation
   ↓
PHASE 5  Case + Entity + Evidence Core
   ↓
PHASE 6  Credit Ledger + Pricing
   ↓
PHASE 7  Scan Engine + Source Registry
   ↓
PHASE 8  Result + Graph + AI
   ↓
PHASE 9  Top-up + Payment
   ↓
PHASE 10 Ruang Kendali
   ↓
PHASE 11 Partner Foundation
   ↓
PHASE 12 Jejak Gue + Privacy
   ↓
PHASE 13 PWA + Version Sentinel
   ↓
PHASE 14 Observability + NADI
   ↓
PHASE 15 Security/Abuse Hardening
   ↓
PHASE 16 QA Matrix
   ↓
PHASE 17 Production Readiness
   ↓
PHASE 18 Launch V1
```

V1.5 dan V2 baru setelah Phase 18 stabil.

---

# 7. PHASE 0 — PROJECT INTAKE & SAFETY

## Goal

Agent memahami project, mengamankan credential, dan memastikan dirinya tidak merusak repository sebelum coding.

## Read

- `PROMPT_PEMBUKA.md` jika sudah ada;
- `.notes/AGENTS.md` jika sudah ada;
- `docs/PRD.md` executive/product sections;
- `docs/SCHEMA.md` bootstrap/security sections;
- local `JEJAK.md`.

## Actions

### 0.1 Inspect Root

Cek:
- folder content;
- Git state;
- package files;
- env files;
- existing code;
- notes;
- global tooling.

### 0.2 Secret Safety

Sebelum commit:
- add `JEJAK.md` ke `.gitignore`;
- ignore `.env*` sesuai kebutuhan;
- ignore local credential files;
- jangan print secret ke output;
- jangan commit credential.

### 0.3 Secret Mapping

Pindahkan credential dari bootstrap lokal ke environment yang sesuai.

Class:
- client-safe publishable;
- server-only;
- legacy/restricted;
- local tooling only.

### 0.4 Validate Git Remote

Target:
> GitHub repo Jejak.

Jangan force overwrite repository existing tanpa inspect.

### 0.5 Create Operational Notes

Jika belum ada:
- `.notes/STATUS_PROJECT.md`
- `.notes/DECISIONS.md`

### 0.6 Environment Inventory

Record:
- Node version;
- package manager;
- Next.js version;
- Supabase CLI;
- Vercel CLI;
- browsers available;
- test framework;
- global skills.

## Exit Gate Phase 0

Must:
- secret file ignored;
- env naming planned;
- repo inspected;
- tooling inspected;
- STATUS_PROJECT exists;
- DECISIONS exists;
- no secret tracked by Git;
- no unresolved destructive ambiguity.

---

# 8. PHASE 1 — REPOSITORY & RUNTIME FOUNDATION

## Goal

Membuat project skeleton Next.js yang production-capable.

## Target

- Next.js 16;
- TypeScript;
- App Router;
- lint;
- formatting;
- test framework;
- environment validation;
- modular architecture.

## Actions

### 1.1 Initialize Project

Jika folder masih blueprint-only:
> initialize Next.js in-place carefully without deleting docs.

Preserve:
- docs;
- .notes;
- JEJAK local ignored file.

### 1.2 Project Structure

Recommended conceptual:

```text
app/
components/
features/
lib/
server/
supabase/
public/
styles/
tests/
docs/
.notes/
```

Agent bebas menyesuaikan selama domain boundaries jelas.

### 1.3 Environment Schema Validation

Runtime harus fail clearly jika server-required env missing.

Client bundle hanya receives publishable variables.

### 1.4 Git Hooks / Quality

Use existing global tooling if available.

Minimum:
- typecheck;
- lint;
- unit test.

### 1.5 Base Error Handling

Create:
- app error boundary;
- route error strategy;
- JX error mapping foundation.

### 1.6 App Version Foundation

Build exposes:
- app version;
- build id.

Needed later PWA/version sentinel.

## Exit Gate Phase 1

- production build passes;
- lint passes;
- typecheck passes;
- root loads;
- env validation works;
- secret not bundled;
- docs preserved;
- status updated.

---

# 9. PHASE 2 — SUPABASE + AUTH + IDENTITY

## Goal

User dapat login Google dengan aman dan mendapatkan profile/wallet baseline.

## Actions

### 2.1 Supabase Client Architecture

Create:
- browser client;
- server client;
- privileged server client only where justified.

Current official package/version checked first.

### 2.2 Google OAuth

Implement:
- OAuth;
- callback;
- PKCE/session handling;
- login failure;
- logout;
- refresh.

### 2.3 Profiles

Migration:
- profiles;
- baseline enums;
- timestamps.

### 2.4 User Initialization

On first login:
- profile;
- wallet foundation if credit tables already minimal;
- baseline user role;
- first scan eligibility foundation.

If full credit tables Phase 6:
> create minimal safe placeholder/initializer migration ordering accordingly.

### 2.5 Owner Bootstrap

Owner email:
> initial bootstrap only.

Secure operation:
- assign Owner DB role;
- lock bootstrap path.

### 2.6 Auth UX

Landing → Login → Onboarding → Beranda.

Owner still lands user mode.

## Tests

- first login;
- repeat login;
- logout;
- session refresh;
- failed OAuth;
- user initialization retry;
- Owner role;
- normal user not Owner.

## Exit Gate Phase 2

- Google login works;
- user identity persistent;
- no frontend owner-email authorization;
- session server validated;
- owner bootstrap safe;
- no service secret client-side;
- status updated.

---

# 10. PHASE 3 — RBAC, RLS & STORAGE SECURITY

## Goal

Security boundary established **before sensitive product features grow**.

## Actions

### 3.1 RBAC Tables

- roles;
- permissions;
- role_permissions;
- user_roles.

### 3.2 Permission Helpers

Implement tested helpers.

### 3.3 Account Status

Server enforcement foundation.

### 3.4 Storage Buckets

Create:
- private case attachment bucket;
- private payment proof bucket.

Even if payment not active yet.

### 3.5 Storage Policies

Deny-by-default.

### 3.6 RLS Negative Test Harness

Build test identities.

### 3.7 Staff Roles

Seed:
- Owner;
- Admin;
- Finance;
- Support;
- User.

### 3.8 No Blanket Staff Access

Support/Finance purpose-limited.

## Exit Gate Phase 3

Must prove:
- User A can't read User B;
- Finance not Case admin;
- Support no raw data;
- normal user cannot assign roles;
- storage not public;
- unauthorized path guessed => denied.

**No Case/payment production feature until this passes.**

---

# 11. PHASE 4 — APP SHELL & DESIGN FOUNDATION

## Goal

Jejak terasa seperti produk asli sebelum domain features ditumpuk.

## Read

- DESIGN_SYSTEM relevant shell sections;
- WIRE_MAP global sections.

## Actions

### 4.1 Design Tokens

Implement:
- typography;
- spacing;
- radii;
- surface;
- shadow;
- material;
- animation durations;
- safe-area.

### 4.2 App Shell

Persistent:
- navigation;
- saldo placeholder/live;
- Kabar;
- Mata;
- workspace;
- Back;
- Refresh.

### 4.3 Responsive Interaction

Mobile:
- bottom nav.

Desktop:
- rail/sidebar.

Hybrid:
- both input types.

### 4.4 No Page Scroll Contract

Internal scrollers only.

### 4.5 Motion Modes

- Luxury;
- Balanced;
- Light;
- Accessible Motion.

Functional state independent of animation.

### 4.6 Search Console

Build signature object.

### 4.7 Landing

One-screen premium.

Demo:
> local dummy only.

### 4.8 Global Panels

Foundation:
- Dompet;
- Kabar;
- Mata/Guide;
- Account.

## QA

- Brave Android;
- Brave Desktop;
- Chrome;
- desktop resize;
- mobile keyboard;
- reduced motion;
- no page scroll.

## Exit Gate Phase 4

- navigation warm;
- app shell stable;
- mobile/desktop intentional;
- reduced motion non-static;
- demo no external API;
- no global loading spinner for tab switch.

---

# 12. PHASE 5 — CASE, ENTITY & EVIDENCE CORE

## Goal

Jejak punya workspace investigasi nyata bahkan sebelum source engine lengkap.

## Actions

### 5.1 Case Schema

- cases;
- case_members;
- entity model;
- relationship model;
- evidence model;
- notes;
- attachment.

### 5.2 Case CRUD

- create;
- list;
- open;
- rename;
- archive;
- trash;
- restore.

### 5.3 Case Secret Mode

Mask previews.

### 5.4 Entity Input

Support:
- email;
- phone;
- name;
- username;
- domain.

### 5.5 Normalization

Implement per schema.

### 5.6 Entity Protection

HMAC/encryption architecture.

### 5.7 Relationship

Manual/suggested relation.

### 5.8 Evidence Passport

UI + server model.

### 5.9 Attachment

Private upload/normalize.

### 5.10 Graph Foundation

- focus;
- nodes;
- edge types;
- detail panel;
- fallback renderer.

### 5.11 Timeline Foundation

Only evidence-backed events.

## Tests

- Case isolation;
- duplicate clue;
- secret masking;
- attachment access;
- merge/reversible;
- relation evidence;
- timeline no fabrication.

## Exit Gate Phase 5

User can:
> login → create Case → add clues → add evidence → see graph

with correct RLS.

---

# 13. PHASE 6 — CREDIT LEDGER & PRICING

## Goal

Membangun financial-quality credit engine sebelum scan berbayar.

## Actions

### 6.1 Wallet

- wallet;
- lot;
- transactions;
- allocations;
- holds.

### 6.2 Atomic Operations

Implement:
- reserve;
- release;
- settle;
- expire;
- extend;
- admin adjust.

### 6.3 Credit Package

Seed configurable packages.

### 6.4 Scan Product Config

Credit cost configurable.

### 6.5 Quote

Short-lived quote.

### 6.6 First Scan Benefit

One-time claim.

### 6.7 Expiry

- lot expiry;
- grace;
- FEFO;
- notification foundation.

### 6.8 Admin Adjustment

Owner testing grant supported.

## Required Tests

### Concurrency
1 credit + multiple requests.

### Idempotency
same scan repeated.

### Expiry
before/after boundary.

### Refund
failure.

### Correction
append-only.

### Upgrade
difference calculation.

## Exit Gate Phase 6

No scan integration until:
- ledger invariants pass;
- no direct user update;
- concurrency pass;
- negative balance impossible;
- idempotency pass.

---

# 14. PHASE 7 — SOURCE REGISTRY & SCAN ENGINE

## Goal

Jejak melakukan pemeriksaan nyata dari source modular.

## Actions

### 7.1 Source Registry

Seed:
- RDAP;
- Cloudflare DNS;
- Google DNS fallback;
- libphonenumber;
- HIBP Pwned Passwords;
- GitHub optional;
- GitLab optional;
- Public Page Collector.

### 7.2 Source Adapter Contract

Normalized output:
- source;
- fact;
- target;
- time;
- reliability;
- reverify;
- error/no-result.

### 7.3 Source Governor

- timeout;
- budget;
- health;
- circuit breaker;
- source priority.

### 7.4 Scan Orchestration

Durable scan record.

Stages:
- prepare;
- source;
- correlate;
- verify;
- summarize.

### 7.5 Credit Reserve Integration

Quote → reserve → scan.

### 7.6 Settlement

Minimum deliverable.

### 7.7 Refund

If below standard.

### 7.8 Domain

Polish first.

### 7.9 Username

Public presence.

### 7.10 Phone

Validation + correlation.

### 7.11 Email

DNS/domain.

### 7.12 Name

Ambiguity-first.

### 7.13 Password Exposure

Separate safe feature.

### 7.14 Public Page Collector

Public known URL only.

SSRF guard.

No anti-bot bypass.

## Exit Gate Phase 7

- scan durable;
- user can close browser;
- source failure isolated;
- no fake progress;
- no paid credit lost below deliverable;
- SSRF tests pass;
- source no-result != safe;
- password not persisted.

---

# 15. PHASE 8 — RESULT, GRAPH, CORRELATION & AI

## Goal

Raw evidence menjadi insight yang manusiawi tanpa mengubah AI menjadi sumber fakta.

## Actions

### 8.1 Correlation Engine

- dedupe;
- temporal;
- independent evidence;
- confidence.

### 8.2 Contradiction Engine

- supporting;
- conflicting;
- unknown.

### 8.3 Assessments

Separate:
- Match;
- Exposure;
- Risk;
- Completeness.

### 8.4 Result UI

- reveal;
- summary;
- why;
- evidence;
- uncertainty.

### 8.5 Graph Upgrade

- relation strength;
- conflict;
- focus;
- clusters.

### 8.6 AI Provider Layer

Server-only env credentials.

### 8.7 AI Analyst

Evidence context only.

### 8.8 AI Skeptic

Higher tier.

### 8.9 Grounding Check

Claims linked to evidence.

### 8.10 AI Fallback

Rule-based summary if AI fails.

### 8.11 Prompt Injection Boundary

External text:
> DATA.

Never instruction.

### 8.12 Contextual Assistant

No generic chatbot.

## Exit Gate Phase 8

- AI off => core works;
- hallucinated claim not accepted blindly;
- external prompt injection tests;
- no password;
- no raw sensitive context unless approved;
- AI output labeled;
- graph not auto-merging identity permanently.

---

# 16. PHASE 9 — TOP-UP & PAYMENT

## Goal

User bisa membayar manual dan credit settlement aman.

## Actions

### 9.1 Payment Method Config

Admin-configurable:
- bank;
- account;
- holder;
- instructions;
- active;
- primary.

### 9.2 Top-up Order

- package snapshot;
- payment snapshot;
- unique amount;
- order lifecycle.

### 9.3 User Checkout

- copy account;
- copy amount;
- upload proof.

### 9.4 Image Pipeline

- verify;
- resize;
- re-encode;
- strip metadata;
- target ~75 KB if readable.

### 9.5 Payment Sentinel

Screening only.

### 9.6 Admin Review

- approve;
- reject;
- request proof.

### 9.7 Atomic Approval

Payment + credit + audit.

### 9.8 Duplicate Proof

Fingerprint.

### 9.9 Cleanup

Approved proof cleanup.

Rejected bounded retention.

### 9.10 Resume Intent

After approval:
> return to intended premium action.

## Critical Tests

- double approval;
- wrong amount;
- bank changed after order;
- sentinel warning override;
- storage private;
- cleanup actual object;
- realtime failure fallback;
- order status concurrent.

## Exit Gate Phase 9

Must:
> complete a real internal test payment flow end-to-end without polluting revenue analytics.

---

# 17. PHASE 10 — RUANG KENDALI

## Goal

Owner mengoperasikan Jejak tanpa developer.

## Actions

### 10.1 Owner Entry

Navigation hidden/elegant.

Server permission.

### 10.2 Ringkasan

Action-oriented.

### 10.3 Owner Inbox

Operational.

### 10.4 Payment Queue

Complete.

### 10.5 User Management

- status;
- role;
- wallet;
- correction;
- audit.

### 10.6 Permission Simulator

UI preview only.

### 10.7 Business Config

- package;
- scan cost;
- expiry;
- payment method;
- campaign;
- partner commission.

### 10.8 Source Registry UI

- active;
- experimental;
- pause;
- health.

### 10.9 Feature Flag

Server enforced.

### 10.10 Maintenance

Subsystem toggles.

### 10.11 Emergency Protection

Owner-only.

### 10.12 Audit

Admin action trace.

## Exit Gate Phase 10

Owner can:
- change bank;
- change pricing;
- grant credit;
- approve payment;
- pause source;
- flag maintenance;
- manage role

without redeploy.

---

# 18. PHASE 11 — PARTNER FOUNDATION

## Goal

Affiliate, Reseller, Mitra punya sumber value yang jelas dan tidak bisa mint value dari nol.

## Actions

### 11.1 Partner Membership

- application;
- approve;
- pause;
- revoke.

### 11.2 Affiliate

- code;
- attribution;
- commission;
- qualification.

### 11.3 Reseller

- distribution wallet;
- transaction;
- voucher;
- redemption.

### 11.4 Mitra

- workspace;
- client;
- Case ownership.

### 11.5 Partner Freeze

Normal user access remains.

### 11.6 Partner Admin

Owner controls.

## Tests

- self-referral;
- retry commission;
- double voucher;
- reseller insufficient balance;
- Mitra A/B isolation;
- partner freeze.

## Exit Gate Phase 11

Foundation production-safe.

Full team collaboration:
> later V1.5.

---

# 19. PHASE 12 — JEJAK GUE, PRIVACY & RETENTION

## Goal

User punya personal security center dan kontrol data yang kredibel.

## Actions

### 12.1 Jejak Gue

- exposure summary;
- action suggestions;
- remediation state.

### 12.2 Password Exposure

Polished.

### 12.3 Data & Privacy

- storage explanation;
- Case;
- access;
- deletion;
- export foundation.

### 12.4 Case Trash

3-day recovery.

### 12.5 Secret Case Delete

Immediate option.

### 12.6 Account Deletion

- warning;
- credit;
- partner/shared;
- cleanup.

### 12.7 Data Export

If V1 UI included.

### 12.8 Retention Jobs

- proof;
- Case;
- logs;
- export.

## Exit Gate Phase 12

Deletion promise matches actual Storage/database behavior.

---

# 20. PHASE 13 — PWA & VERSION SENTINEL

## Goal

Installed Jejak tidak menjadi PWA stale yang rusak.

## Actions

### 13.1 Manifest

- name;
- icon;
- theme;
- display;
- start URL.

### 13.2 Service Worker

Cache matrix from Design/PRD.

### 13.3 Install UX

Chromium:
> native prompt where available.

iOS:
> guided instructions.

### 13.4 Version Sentinel

- build version;
- latest version;
- critical/minimum version;
- update prompt.

### 13.5 App Shell Cache

Aggressive static only.

### 13.6 Server Truth

No wallet/payment/role persistent stale source.

### 13.7 Back/Refresh

PWA navigation.

### 13.8 Update Resume

Restore intent.

## Tests

- install Android/Brave;
- standalone;
- new deploy;
- old PWA;
- update available;
- critical update;
- interrupted flow;
- offline;
- cache invalidation.

## Exit Gate Phase 13

No known stale PWA failure in supported test matrix.

---

# 21. PHASE 14 — OBSERVABILITY, ANALYTICS & NADI

## Goal

Owner tahu apa yang rusak, apa yang menghasilkan uang, dan apa yang harus ditangani.

## Actions

### 14.1 Error Codes

JX system.

### 14.2 Error Events

Safe diagnostics.

### 14.3 Pusat Masalah

Aggregate.

### 14.4 Security Events

Human language.

### 14.5 Performance Metrics

Privacy-safe.

### 14.6 Funnel

Login → first scan → premium → top-up → approved.

### 14.7 Business Digest

Aggregated.

### 14.8 NADI

Read/recommend/draft.

### 14.9 System Map

Human-first.

### 14.10 Storage Health

Cleanup queue.

### 14.11 PWA Version Adoption

Version breakdown.

## Exit Gate Phase 14

Owner can answer:
- cuan hari ini;
- pending payment;
- source down;
- error spike;
- conversion drop;
- PWA outdated;
- cleanup issue.

without database console.

---

# 22. PHASE 15 — SECURITY & ABUSE HARDENING

## Goal

Assume browser and external content hostile.

## Areas

### 15.1 Authorization
- IDOR/BOLA;
- RLS;
- role manipulation;
- partner isolation.

### 15.2 Credit Abuse
- multi-tab;
- retries;
- bot;
- farming.

### 15.3 Provider Burn
- rate;
- concurrency;
- source budget.

### 15.4 Public Collector
- SSRF;
- redirect;
- local/private IP;
- malformed content.

### 15.5 AI
- prompt injection;
- HTML injection;
- tool action boundary;
- raw evidence.

### 15.6 Upload
- MIME;
- extension mismatch;
- decompression bomb;
- oversized;
- malformed images.

### 15.7 Safe Share
- token;
- sanitize;
- revoke.

### 15.8 Admin
- privilege escalation;
- Owner protection;
- audit.

### 15.9 Secret Leak
- Git;
- client bundle;
- source map;
- logs.

### 15.10 Preview Deployment
Protect non-production.

## Exit Gate Phase 15

Critical security acceptance suite passes.

---

# 23. PHASE 16 — QA MATRIX

## Goal

Menguji bukan hanya happy path.

## Test Dimensions

### Browsers
- Brave Android;
- Brave Desktop;
- Chrome Android;
- Chrome Desktop;
- Safari real iPhone;
- Safari/iPad if available;
- Edge;
- Firefox.

### Modes
- browser;
- Android PWA;
- iOS PWA.

### Input
- touch;
- mouse;
- keyboard;
- hybrid.

### Motion
- normal;
- reduced.

### Network
- normal;
- slow;
- offline;
- reconnect.

### Session
- expired;
- two devices;
- blocked mid-session.

### Business
- zero credit;
- expiring;
- payment pending;
- approval;
- duplicate.

### Provider
- partial;
- all AI down;
- source down.

## QA Recording

STATUS_PROJECT includes:
- Tested;
- Failed;
- Not Available;
- Needs Real Device.

Agent must not mark real Safari validated if only Chromium emulation.

---

# 24. PHASE 17 — PRODUCTION READINESS

## Goal

Project benar-benar siap digunakan orang lain.

## Checklist

### Build
- production build;
- lint;
- typecheck;
- tests.

### Env
- production env set;
- no missing secret;
- client env safe.

### Supabase
- migrations applied;
- RLS active;
- Storage policy;
- Owner role.

### Git
- clean;
- no secrets;
- correct remote;
- safe branch.

### Vercel
- deployment region;
- protection;
- domain.

### Google OAuth
- production redirect.

### PWA
- manifest;
- icons;
- update.

### Payments
- live payment method configured;
- internal test complete.

### Sources
- source status verified;
- experimental excluded.

### AI
- provider health;
- sensitive gate.

### Admin
- emergency protection tested;
- maintenance tested.

### Monitoring
- error capture;
- system health.

## Exit Gate Phase 17

Production checklist signed in STATUS_PROJECT.

---

# 25. PHASE 18 — V1 LAUNCH

## Goal

Jejak bisa digunakan secara nyata.

## Launch Sequence

1. Owner-only canary;
2. test accounts;
3. small user group;
4. observe;
5. fix critical;
6. broader launch.

## Canary Focus

- login;
- scan;
- credit;
- payment;
- PWA;
- error;
- mobile.

## No Launch If

- RLS critical fail;
- payment double-credit risk;
- wallet race;
- stale PWA blocker;
- secret leak;
- auth instability;
- Case cross-access.

---

# 26. V1 FEATURE DEFINITION

V1 includes:
- Landing;
- Google Auth;
- App Shell;
- 5 identifiers;
- Password Exposure;
- Case;
- Evidence;
- Relationship Graph;
- Timeline foundation;
- Scan tiers;
- Domain/username focus;
- credit;
- expiry;
- top-up manual;
- Payment Sentinel;
- safe share;
- Jejak Gue;
- Admin;
- basic partner;
- Source Registry;
- AI contextual;
- NADI basic;
- PWA;
- observability;
- privacy/deletion;
- feature flags;
- maintenance.

---

# 27. V1.5 ROADMAP — ONLY AFTER V1 STABLE

Potential order:

## V1.5-1 Monitoring
- Pantau Jejak;
- credit cycle;
- notification.

## V1.5-2 Jejak Perubahan
- snapshot diff;
- timeline diff.

## V1.5-3 Collaboration
- Case invite;
- viewer/contributor.

## V1.5-4 Mitra Team
- member;
- roles.

## V1.5-5 AI Advanced
- Tantang Kesimpulan;
- Scenario Simulation;
- richer hypotheses.

## V1.5-6 Reporting
- exports;
- professional report.

## V1.5-7 Partner Analytics
- funnel;
- health.

## V1.5-8 NADI Advanced
- comparison;
- anomaly explanation;
- draft workflow.

Each still quality-gated.

---

# 28. V2 ROADMAP — REVENUE-FUNDED INTELLIGENCE

Possible:
- premium breach source;
- proper broad web search;
- reputation source;
- historical source;
- payment gateway;
- official reconciliation;
- richer monitoring;
- marketplace.

V2 provider adoption must pass:
- legal/commercial eligibility;
- privacy;
- cost;
- reliability;
- Source Registry experimental period.

---

# 29. DO NOT BUILD EARLY

Until V1 stable, avoid:
- marketplace;
- complex social features;
- gamification;
- streak;
- massive scraper fleet;
- custom browser automation;
- payment gateway abstraction for 20 providers;
- enterprise RBAC UI;
- full experiment platform;
- full data warehouse;
- native iOS/Android app;
- desktop Electron;
- blockchain/crypto;
- phone owner database;
- AI autonomous investigation;
- AI autonomous admin mutation.

---

# 30. AGENT TASK SLICING

Each task should be:
- coherent;
- verifiable;
- small enough to finish;
- large enough to deliver value.

Bad:
> “build all admin”.

Good:
> “build payment queue read + RLS + empty/loading/error + tests”.

---

# 31. COMMIT STRATEGY

Prefer meaningful commits.

Examples:
- `feat(auth): add google oauth bootstrap`
- `feat(cases): add case RLS and membership`
- `feat(credits): add atomic credit reserve`
- `feat(payment): add approval settlement`
- `fix(pwa): restore intent after update`

Don't make:
> 300 unrelated changes in one commit.

Before handoff:
> safe checkpoint commit if repository state is valid.

---

# 32. BRANCH STRATEGY

Agent may use:
- main;
- feature branches;
- worktree;

depending workflow.

But:
- avoid unmerged forgotten work;
- STATUS_PROJECT records active branch;
- before handoff note uncommitted changes.

---

# 33. AUTO-CONTINUE CONTRACT

After completing a task:
> choose next dependency-safe task.

Agent does not ask:
> “Mau saya lanjut?”

unless user explicitly requested step-by-step confirmation.

For this project:
> default continue autonomously.

---

# 34. ERROR RECOVERY CONTRACT

If build fails:
1. inspect;
2. fix;
3. rerun.

If migration fails:
1. inspect;
2. repair;
3. test clean;
4. test current DB.

If dependency fails:
1. check version;
2. check existing global tool;
3. official docs;
4. alternative.

Only report blocker when genuinely external.

---

# 35. EXTERNAL ACCOUNT ACTION

Examples requiring user:
- Google Cloud consent screen approval not accessible to Agent;
- adding payment method to provider;
- DNS registrar action Agent lacks access;
- security code sent only to user.

When needed:
> ask once, precisely.

Not:
> give 15 manual steps if Agent can handle most of them.

---

# 36. CREDENTIAL HANDLING ROADMAP

At Phase 0:
> local env.

Before deploy:
> production env.

After confirmed:
> no plaintext in repo.

If credential exposed:
1. stop using;
2. rotate;
3. remove from history if committed;
4. verify;
5. record incident safely.

---

# 37. SOURCE INTEGRATION ORDER

Recommended V1:

1. local normalization;
2. libphonenumber;
3. DNS;
4. RDAP;
5. HIBP Password;
6. GitHub;
7. GitLab;
8. Public Page Collector;
9. AI reasoning.

Reason:
> strongest reliable foundation first.

---

# 38. AI INTEGRATION ORDER

1. no-AI rule summary;
2. Analyst;
3. grounding;
4. Skeptic;
5. user assistant;
6. NADI.

Do not build chat before evidence pipeline.

---

# 39. CREDIT INTEGRATION ORDER

1. wallet;
2. lots;
3. ledger;
4. reserve;
5. settlement;
6. expiry;
7. package;
8. scan integration;
9. payment grant;
10. voucher/referral.

---

# 40. PAYMENT INTEGRATION ORDER

1. payment method config;
2. order;
3. snapshot;
4. unique amount;
5. upload;
6. screening;
7. admin review;
8. atomic approval;
9. realtime;
10. cleanup.

---

# 41. ADMIN INTEGRATION ORDER

1. Owner entry;
2. Ringkasan;
3. Payment;
4. Users;
5. Business;
6. Source;
7. System;
8. Partner;
9. Analytics;
10. NADI.

---

# 42. UI IMPLEMENTATION ORDER

1. tokens;
2. shell;
3. core component;
4. search;
5. result;
6. Case;
7. graph;
8. wallet;
9. payment;
10. admin;
11. secondary polish.

---

# 43. PERFORMANCE GATES

## Gate A — Shell
Warm nav should feel instant.

## Gate B — Case
Case metadata first.

## Gate C — Graph
No huge initial graph.

## Gate D — Admin
No giant dashboard payload.

## Gate E — Images
Optimization off blocking path.

Performance regression:
> bug.

---

# 44. ACCESSIBILITY GATES

Must:
- keyboard nav;
- visible focus;
- semantic labels;
- reduced motion;
- sufficient contrast;
- touch target;
- non-color-only status.

Premium aesthetic cannot override usability.

---

# 45. MOBILE GATES

Must:
- safe area;
- keyboard;
- thumb reach;
- no overflow;
- no hidden CTA;
- graph controls usable;
- admin approval friction.

---

# 46. DESKTOP GATES

Must:
- density;
- hover enhancement;
- keyboard;
- panel use;
- no mobile stretched UI.

---

# 47. BRAVE GATES

Test:
- motion;
- PWA;
- storage/cookie;
- install;
- autoplay/animation assumptions.

No app state depends on animation end.

---

# 48. SAFARI GATES

Real device:
- PWA install;
- standalone;
- safe area;
- service worker;
- update;
- input keyboard;
- Storage behavior;
- motion;
- viewport.

If unavailable:
> status `Belum divalidasi di Safari nyata`.

---

# 49. RELEASE CHECKPOINTS

Suggested:
- `v0.1-foundation`
- `v0.2-auth-shell`
- `v0.3-case`
- `v0.4-ledger`
- `v0.5-scan`
- `v0.6-payment`
- `v0.7-admin`
- `v0.8-pwa`
- `v0.9-rc`
- `v1.0`

Tag optional.

App version strategy chosen by Agent but consistent with Version Sentinel.

---

# 50. HANDOFF CHECKPOINT

Before agent limit/run ends:

1. finish safe unit if possible;
2. run relevant tests;
3. commit if stable;
4. update STATUS_PROJECT;
5. update DECISIONS;
6. note failing tests;
7. note branch;
8. note migration head;
9. note next safe command/action;
10. do not leave vague “continue later”.

Example:

```md
## Next Safe Action
Implement `reserve_scan_credits` integration in scan start server action.
Read:
- SCHEMA sections 21–25
- ROADMAP Phase 6
Files:
- ...
Tests currently passing:
- ...
```

---

# 51. NEXT AGENT TAKEOVER

New Agent:
1. inspect git status;
2. read STATUS;
3. read DECISIONS;
4. verify last commit;
5. run fast smoke;
6. continue Next Safe Action.

Do not:
> rewrite existing architecture because “I prefer another approach”.

Only change if:
- bug;
- incompatibility;
- security;
- clear quality improvement.

Record reason.

---

# 52. QUALITY GATE OWNERSHIP

Agent Coding itself owns:
- build;
- tests;
- lint;
- RLS;
- migration;
- browser automation;
- security check;
- performance check.

Product Owner should not need to remind it.

---

# 53. PROD VS TEST

Use:
- safe test data;
- internal test flag;
- non-production payment marker where applicable.

Owner production test:
> mark internal to analytics.

Do not delete accounting trail.

---

# 54. FEATURE FLAG RELEASE

New risky feature:
1. Owner;
2. test users;
3. small percentage;
4. all.

Server enforcement.

---

# 55. SOURCE EXPERIMENT RELEASE

New source:
1. add registry Experimental;
2. Owner test;
3. quality compare;
4. licensing verify;
5. promote active.

Experimental:
> excluded main score.

---

# 56. DATABASE MIGRATION RELEASE

Before production migration:
- backup awareness;
- migration dry-run;
- compatibility;
- old PWA consideration.

Breaking change:
> version gate.

---

# 57. SECURITY INCIDENT PRIORITY

If critical:
1. protect data;
2. disable affected path;
3. emergency protection;
4. investigate;
5. fix;
6. test;
7. restore.

Feature progress stops temporarily.

---

# 58. PAYMENT INCIDENT PRIORITY

If settlement integrity questionable:
> pause approval/new top-up if needed.

Do not continue accepting money on broken ledger.

Old wallet read remains.

---

# 59. CREDIT INCIDENT PRIORITY

If credit duplication:
1. disable affected mutation;
2. investigate ledger;
3. correction append-only;
4. audit.

Never manually edit history away.

---

# 60. PWA INCIDENT PRIORITY

If update bug:
- minimum version;
- critical update;
- clear recovery.

Do not tell user clear browser cache as normal primary solution.

---

# 61. SOURCE OUTAGE PRIORITY

If one source:
> degrade.

If all source:
> scan maintenance, old data accessible.

If AI:
> evidence core works.

---

# 62. RELEASE NOTES

Each significant deploy:
- user-facing changes;
- internal changes;
- migration;
- known issue.

Admin:
> NADI “Apa yang berubah setelah update terakhir?”

---

# 63. DEVELOPMENT DATA POLICY

Never use real target PII as fixture if unnecessary.

Fixtures:
- fake email;
- reserved domains;
- fake phone formats where valid;
- dummy usernames.

Owner personal test:
> explicit.

---

# 64. DOC MAINTENANCE

Blueprint stable.

Do not constantly rewrite PRD.

Operational changes:
> DECISIONS.

If Product Owner changes product rule:
> update relevant blueprint and Decisions.

---

# 65. WHAT AGENT MAY OPTIMIZE

Agent may improve:
- internal module split;
- naming;
- query plan;
- component composition;
- testing strategy;
- cache implementation;
- queue/runtime selection.

As long as:
> business/UX/security invariant preserved.

---

# 66. WHAT AGENT MAY NOT CHANGE SILENTLY

- 4 nav user;
- no-page-scroll philosophy;
- Indonesian UI;
- credit ledger;
- manual payment truth;
- Case evidence doctrine;
- AI not fact;
- Owner user mode;
- admin configurable bank/pricing;
- partner source-of-value;
- PWA version sentinel;
- RLS;
- privacy lifecycle.

---

# 67. ACCEPTANCE TEST HANDOFF

Later `docs/ACCEPTANCE_TESTS.md` is executable contract.

Roadmap gates should map to that file.

Agent must update STATUS:
> which acceptance groups pass.

---

# 68. STATUS QUALITY FORMAT

Recommended:

```md
## Quality Gates

| Area | Status | Last Verified | Notes |
|---|---|---|---|
| Build | ✅ | ... | |
| Auth | ✅ | ... | |
| RLS | 🟡 | ... | 2 tests left |
| Ledger | ❌ | ... | race test fails |
| Safari real | ⬜ | - | device not tested |
```

Actual UI/docs can use plain markers; no requirement emoji in product UI.

---

# 69. BLOCKER FORMAT

If Agent truly blocked:

```md
## BLOCKER

Needed:
Why:
What I already tried:
What remains independent:
Exact user action required:
```

Then continue independent work.

Do not halt whole project if one provider missing.

---

# 70. PHASE DEPENDENCY RULES

### Cannot start paid scan before:
- credit engine pass.

### Cannot open payment production before:
- atomic top-up approval pass.

### Cannot ship Case before:
- RLS Case pass.

### Cannot ship proof upload before:
- private Storage pass.

### Cannot ship AI conclusion before:
- evidence pipeline.

### Cannot ship NADI mutation before:
- never autonomous.

### Cannot ship PWA broadly before:
- update flow.

---

# 71. MVP MISINTERPRETATION WARNING

V1 is not:
> throwaway MVP.

It is:
> production-grade smallest complete Jejak.

Quality:
- security;
- ledger;
- PWA;
- UX;
- data lifecycle

are V1 features.

---

# 72. V1 CUT RULE

If scope must reduce:
> cut breadth, not integrity.

Can postpone:
- advanced AI;
- rich Mitra;
- monitoring;
- broad web source;
- fancy analytics.

Cannot postpone:
- RLS;
- ledger integrity;
- payment atomicity;
- update path;
- source provenance;
- deletion truth.

---

# 73. DESIGN POLISH PASS

After core functionality:
- microinteraction;
- lighting;
- graph;
- responsive;
- copy.

Don't spend hours on decorative particle before ledger.

---

# 74. COPY QA PASS

Search all user-facing strings for:
- English leakage;
- developer terms;
- harsh tone;
- emoji;
- inconsistent labels.

Follow Design System.

---

# 75. SECURITY COPY QA

Avoid:
> “Aman” when merely no result.

Avoid:
> “Penipu”.

Avoid:
> “Pemilik nomor”.

Unless source truth supports and wording permitted.

---

# 76. PAYMENT COPY QA

User must understand:
- transferred amount;
- account;
- proof;
- review;
- credit not yet settled.

No fake instant approval.

---

# 77. EXPIRY COPY QA

Always clear:
- valid until;
- what expires;
- grace if relevant.

No hidden expiry.

---

# 78. ADMIN COPY QA

Owner is non-programmer.

System health:
> human-first.

Technical detail:
> expandable.

NADI:
> concise.

---

# 79. TEST PYRAMID

Unit:
- normalization;
- scoring;
- ledger.

Integration:
- DB RPC;
- RLS;
- payment.

E2E:
- auth;
- Case;
- scan;
- top-up;
- admin;
- PWA.

Manual:
- Safari;
- tactile/visual QA.

---

# 80. DB TEST PRIORITY

Highest:
1. RLS;
2. ledger;
3. payment;
4. voucher/referral;
5. deletion.

---

# 81. E2E PRIORITY

Highest:
1. first user;
2. fraud check;
3. top-up;
4. owner approval;
5. Case;
6. PWA update.

---

# 82. PERFORMANCE TEST PRIORITY

- landing cold;
- Beranda interactive;
- nav warm;
- Case open;
- graph;
- admin payment;
- mobile.

---

# 83. OBSERVABILITY TEST

Simulate:
- provider down;
- payment error;
- source timeout;
- cleanup fail;
- PWA old;
- security event.

Verify Owner sees actionable signal.

---

# 84. NADI TEST

Questions:
- “Hari ini cuan berapa?”
- “Ada pembayaran pending?”
- “Source mana bermasalah?”
- “Kenapa conversion turun?”
- “Ada kredit janggal?”

If insufficient:
> say insufficient.

---

# 85. FINAL RELEASE CANDIDATE GATE

Before RC:
- all Critical acceptance tests;
- no P0/P1;
- production-like payment tested;
- no secrets;
- migration reproducible;
- App Shell stable;
- install/update stable;
- fallback provider tested.

---

# 86. BUG SEVERITY

P0:
- data leak;
- double credit;
- payment double settle;
- auth bypass.

P1:
- scan credit lost;
- PWA unusable;
- Case inaccessible incorrectly;
- admin critical broken.

P2:
- feature degraded;
- source fail handled poorly.

P3:
- cosmetic.

No launch with P0/P1.

---

# 87. ROLLBACK PHILOSOPHY

Feature:
> flag off.

Source:
> pause registry.

AI:
> disable.

Scan:
> maintenance toggle.

DB:
> backward-compatible migration preferred.

Payment:
> pause new payment rather than risk accounting.

---

# 88. FEATURE OWNERSHIP IN STATUS

Status can map domain:
- Auth;
- Case;
- Credit;
- Scan;
- Payment;
- Admin;
- Partner;
- PWA;
- Ops.

Each:
> planned / active / done / QA / blocked.

---

# 89. USER DATA MIGRATION

If schema changes:
- backfill;
- verify;
- not silent data loss.

Never delete evidence to simplify migration.

---

# 90. ANALYTICS ROLLOUT

Start minimal semantic events.

Add richer metrics only after:
> primary funnel stable.

Don't delay launch for BI perfection.

---

# 91. SEARCH SOURCE COST CONTROL

Paid/broad search later:
> feature flag + source budget.

V1 no hidden provider cost.

---

# 92. AI COST CONTROL

AI only where value.

No AI:
- input validation;
- simple DNS result;
- simple phone validation.

Use AI:
- correlation explanation;
- contradiction;
- advanced analysis.

---

# 93. FREE USER COST CONTROL

Free first scan:
> sponsored benefit.

Demo:
> local.

No anonymous API burn.

---

# 94. USER TOP-UP RETURN FLOW GATE

Must verify:
premium intent → insufficient → top-up → approve → return.

If broken:
> monetization broken.

Treat P1.

---

# 95. OWNER DAILY FLOW GATE

Must verify mobile:
- open;
- payment queue;
- proof;
- approve;
- return user.

This is owner operational core.

---

# 96. FINANCE ROLE GATE

Finance can:
- payment.

Finance cannot:
- Case.

Must test actual RLS account.

---

# 97. SUPPORT ROLE GATE

Support:
- masked.

Reveal only capability + audit.

---

# 98. MITRA ISOLATION GATE

Mitra Workspace:
- strict tenant.

No launch partner foundation if cross-workspace leakage.

---

# 99. RESELLER VALUE GATE

Cannot create voucher beyond distribution.

---

# 100. AFFILIATE VALUE GATE

Commission only qualified approved payment.

---

# 101. SOURCE QUALITY GATE

Each source:
- known input;
- no result;
- invalid;
- timeout;
- malformed.

Adapter must normalize.

---

# 102. DOMAIN QUALITY GATE

Domain flow should be best-polished source experience V1.

Verify:
- RDAP;
- DNS;
- page if known;
- contradiction;
- copy.

---

# 103. USERNAME QUALITY GATE

No identity merge based on same handle alone.

---

# 104. PHONE QUALITY GATE

No owner claim from validation alone.

---

# 105. EMAIL QUALITY GATE

No breach history claim without source.

---

# 106. NAME QUALITY GATE

Ambiguity-first.

---

# 107. PASSWORD QUALITY GATE

No plaintext persistence.

---

# 108. GRAPH QUALITY GATE

Large graph:
> progressive.

No render explosion.

---

# 109. SAFE SHARE QUALITY GATE

Manual preview.

No sensitive leak.

---

# 110. SECRET CASE QUALITY GATE

Notifications masked.

---

# 111. DATA DELETE QUALITY GATE

DB + Storage actual cleanup.

---

# 112. UPDATE QUALITY GATE

User doesn't need browser cache purge.

---

# 113. REFRESH QUALITY GATE

Refresh syncs state, not reload shell.

---

# 114. OFFLINE QUALITY GATE

Paid action not accidentally duplicated after reconnect.

---

# 115. MULTI-DEVICE QUALITY GATE

Credit/server truth wins.

---

# 116. CONFIG CONFLICT QUALITY GATE

Two owner devices:
> version conflict.

---

# 117. ADMIN ACTION AUDIT GATE

Role/credit/bank/payment:
> audit.

---

# 118. EMERGENCY MODE GATE

Can enable without deploy.

---

# 119. FEATURE FLAG GATE

Direct endpoint denied when disabled.

---

# 120. SOURCE EXPERIMENT GATE

Experimental source:
> Owner only;
> no main score.

---

# 121. ROADMAP COMPLETE CONDITION

Roadmap V1 considered complete only if:

- Phase 0–18 done;
- Critical acceptance tests pass;
- no known P0/P1;
- real production deployment exists;
- Owner can operate payment/admin;
- RLS negative tests pass;
- ledger concurrency pass;
- PWA update pass;
- sources degrade safely;
- AI failure doesn't kill core;
- data deletion actual;
- STATUS_PROJECT up to date;
- DECISIONS up to date.

---

# 122. ROADMAP IS A GATE, NOT A SUGGESTION

Agent may:
> reorder small tasks within a Phase.

Agent may not:
> skip security/ledger gates.

If Product Owner says:
> “langsung bikin UI dulu”

Agent can prototype visual, but cannot call production-ready until gates pass.

---

# 123. STATUS TRANSITION

Recommended status:
- NOT_STARTED
- IN_PROGRESS
- BLOCKED
- IMPLEMENTED
- QA
- DONE

A feature:
> IMPLEMENTED ≠ DONE.

DONE:
> test + integration + acceptance.

---

# 124. FILE READING MAP BY PHASE

## Phase 0
- SCHEMA bootstrap;
- AGENTS.

## Phase 1
- AGENTS;
- PRD technical baseline.

## Phase 2–3
- SCHEMA Auth/RBAC/RLS.

## Phase 4
- DESIGN_SYSTEM;
- WIRE_MAP shell.

## Phase 5
- SCHEMA Case;
- WIRE_MAP Case.

## Phase 6
- SCHEMA Credit;
- PRD Credit.

## Phase 7
- SCHEMA Source/Scan;
- PRD source.

## Phase 8
- PRD evidence/AI;
- Design result;
- Wire result.

## Phase 9
- SCHEMA Payment;
- Wire payment.

## Phase 10
- Wire Admin;
- Schema admin.

## Phase 11
- PRD Partner;
- Schema Partner.

## Phase 12
- PRD privacy;
- Schema deletion.

## Phase 13
- Design PWA;
- Wire PWA.

## Phase 14+
- SCHEMA ops;
- Acceptance.

This saves tokens.

---

# 125. EXAMPLE TAKEOVER STATE

```md
Current Phase: Phase 7
Current Milestone: RDAP + DNS source adapter
Latest Commit: abc123
Migration Head: 20260810_004_scan_source
Done:
- Auth
- RLS
- Case
- Credit

In Progress:
- source registry
- RDAP

Blocker:
- none

Next Safe Action:
Implement DNS adapter using registry contract.
Read:
- SCHEMA §11–14
- ROADMAP Phase 7
- PRD Source Strategy
```

Agent baru:
> langsung lanjut.

---

# 126. FINAL AGENT RULES

1. Baca status dulu.
2. Jangan baca semuanya dari nol.
3. Cek global skills.
4. Jangan install ulang tanpa cek.
5. Jangan commit secret.
6. Kerjakan sendiri yang bisa dikerjakan.
7. Bertanya cuma blocker.
8. Jangan berhenti pada error pertama.
9. Jangan lompat quality gate.
10. Jangan menambah fitur untuk menutupi fondasi rusak.
11. Update STATUS.
12. Update DECISIONS.
13. Commit checkpoint sehat.
14. Tinggalkan Next Safe Action.
15. Jangan klaim selesai jika QA belum membuktikan.

---

# 127. FINAL PRODUCT PRIORITY

Urutan prioritas jika agent harus memilih:

1. keamanan user;
2. integritas kredit/payment;
3. kebenaran evidence;
4. reliabilitas;
5. performa;
6. usability;
7. conversion;
8. visual polish;
9. breadth fitur.

Visual premium penting.

Tetapi:
> **UI paling cantik di dunia tidak menyelamatkan ledger yang double-credit.**

---

# 128. V1 SUCCESS DEFINITION

V1 berhasil jika user bisa:

> buka Jejak → login Google → periksa identifier → mendapatkan evidence yang jujur → memahami hasil → membuat Kasus → membeli kredit → transfer → upload bukti → Owner approve → kredit masuk → lanjut analisis → install PWA → menerima update aplikasi → mengelola data sendiri.

Owner bisa:

> membuka Ruang Kendali → melihat apa yang perlu ditangani → approve pembayaran → mengelola user/role → mengubah bank/harga → memantau source/error → menggunakan NADI sebagai advisor → mengaktifkan proteksi darurat jika perlu.

Dan semuanya:
> tetap aman ketika user mencoba melakukan sesuatu yang tidak berhak.

---

# 129. END STATE HANDOFF

Ketika V1 launch selesai, `.notes/STATUS_PROJECT.md` harus memberikan agent masa depan cukup konteks untuk melanjutkan V1.5 tanpa membaca seluruh sejarah.

Minimum final V1 snapshot:
- production URL;
- current app version;
- current DB migration;
- active sources;
- active AI provider;
- active payment methods;
- package config;
- feature flags;
- known issues;
- browser QA;
- security QA;
- next V1.5 milestone.

---

# 130. PENUTUP

Roadmap ini sengaja memaksa satu disiplin:

> **Jejak dibangun sebagai produk production-grade sejak fondasi, bukan prototype yang berharap bisa diperbaiki nanti.**

Agent Coding boleh cepat.

Agent Coding boleh kreatif pada implementation detail.

Agent Coding boleh memanfaatkan semua tooling yang tersedia.

Tetapi Agent Coding tidak boleh:
- mengorbankan data;
- mengorbankan ledger;
- mengorbankan permission;
- mengorbankan updateability;
- mengorbankan evidence integrity;
- atau menghapus keputusan produk yang sudah dikunci.

**END OF ROADMAP**
