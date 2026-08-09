# JEJAK

> **Periksa sebelum percaya.**

Jejak adalah web app/PWA OSINT berbasis bukti untuk membantu pengguna:
- memeriksa jejak digital sendiri;
- mengecek sinyal sebelum percaya atau transfer;
- membantu keluarga/orang terdekat;
- mengelola investigasi publik/authorized melalui Case;
- memahami evidence, hubungan, kontradiksi, dan ketidakpastian tanpa mengubah AI menjadi sumber fakta.

Repository ini dirancang supaya bisa dikerjakan bergantian oleh:
- Claude Code;
- Codex;
- Antigravity;
- Agent Coding lain;

tanpa Product Owner harus menjelaskan project dari nol setiap kali agent berganti.

---

# 1. BACA INI DULU — AGENT CODING

Kalau lo Agent Coding yang baru masuk:

## Jangan langsung baca semua dokumen.

Urutan yang benar:

### Kalau project SUDAH pernah dikerjakan

1. `.notes/STATUS_PROJECT.md`
2. `.notes/DECISIONS.md`
3. `docs/ROADMAP.md` — hanya phase aktif
4. file source/test/migration yang disebut STATUS
5. bagian blueprint yang relevan saja
6. lanjut dari `Next Safe Action`

### Kalau project MASIH blueprint-only

1. `PROMPT_PEMBUKA.md`
2. `.notes/AGENTS.md`
3. `.notes/STATUS_PROJECT.md`
4. `.notes/DECISIONS.md`
5. `docs/ROADMAP.md` — Phase 0
6. `docs/SCHEMA.md` — bootstrap/security/env section
7. inspect global skills/tooling
8. inspect Git + secret safety
9. langsung mulai Phase 0

---

# 2. JANGAN BAKAR TOKEN

Dokumen Jejak sengaja detail.

Agent **tidak perlu** membaca:
- seluruh PRD;
- seluruh Design System;
- seluruh Wire Map;
- seluruh Schema;
- seluruh Acceptance Tests;

di setiap session.

Gunakan:

> `STATUS_PROJECT → DECISIONS → ROADMAP Phase → relevant blueprint section`

Ini adalah workflow resmi project.

---

# 3. STRUKTUR FOLDER TARGET

```text
JEJAK/
│
├─ README.md
├─ PROMPT_PEMBUKA.md
├─ JEJAK.md                    # LOCAL SECRET BOOTSTRAP — JANGAN COMMIT
│
├─ docs/
│  ├─ PRD.md
│  ├─ DESIGN_SYSTEM.md
│  ├─ WIRE_MAP.md
│  ├─ SCHEMA.md
│  ├─ ROADMAP.md
│  └─ ACCEPTANCE_TESTS.md
│
├─ .notes/
│  ├─ AGENTS.md
│  ├─ STATUS_PROJECT.md
│  └─ DECISIONS.md
│
├─ app/                        # setelah runtime dibuat
├─ components/
├─ features/
├─ lib/
├─ server/
├─ supabase/
├─ public/
├─ styles/
├─ tests/
│
├─ package.json
├─ tsconfig.json
├─ next.config.*
├─ .gitignore
└─ ...
```

Struktur implementasi boleh disesuaikan Agent jika ada alasan teknis nyata.

Struktur dokumentasi inti:
> **jangan diacak tanpa alasan.**

---

# 4. PETA DOKUMEN

## `PROMPT_PEMBUKA.md`

### Fungsi
Starter prompt utama untuk membuka project di Agent Coding.

### Baca kapan?
- fresh Agent;
- first run;
- agent belum tahu kontrak kerja Jejak.

### Jangan pakai untuk
- melihat status project terkini.

Status terkini:
> `.notes/STATUS_PROJECT.md`

---

## `.notes/AGENTS.md`

### Fungsi
Undang-undang kerja Agent Coding.

Mengatur:
- cara komunikasi;
- anti-rewel;
- kapan boleh bertanya;
- global skills;
- Git;
- secret;
- handoff;
- quality;
- autonomy.

### Aturan komunikasi
Ke Product Owner:
> Bahasa Indonesia gaul, natural, `lo/gue`.

Jangan kaku.

---

## `.notes/STATUS_PROJECT.md`

### Fungsi
Snapshot kondisi project **sekarang**.

Ini adalah file pertama yang dibaca Agent saat resume.

Harus menjawab:
- phase sekarang;
- milestone;
- branch;
- commit;
- deploy;
- migration head;
- quality gates;
- known issue;
- blocker;
- Next Safe Action;
- relevant files.

### Jangan
jadikan changelog panjang.

Git sudah menyimpan history.

---

## `.notes/DECISIONS.md`

### Fungsi
Memori alasan keputusan lintas-agent.

Contoh:
- kenapa pakai queue tertentu;
- kenapa library tertentu dipilih;
- workaround Safari;
- encryption mechanism;
- runtime split;
- caching model.

Keputusan lama:
> tidak dihapus.

Kalau berubah:
> `SUPERSEDED` + DEC baru.

---

## `docs/PRD.md`

### Fungsi
Source of truth produk.

Berisi:
- positioning;
- user;
- business model;
- credit;
- Case;
- AI;
- partner;
- payment;
- admin;
- safety;
- V1/V1.5/V2.

### Baca saat
butuh jawaban:
> **“Produk ini seharusnya melakukan apa dan kenapa?”**

---

## `docs/DESIGN_SYSTEM.md`

### Fungsi
Source of truth visual + interaction.

Berisi:
- Luxury Digital Security;
- black titanium;
- smoked glass;
- typography;
- responsive;
- motion;
- reduced motion;
- Search Console;
- Mata Jejak;
- mobile/desktop;
- microcopy;
- component behavior.

### Baca saat
mengerjakan UI/UX.

---

## `docs/WIRE_MAP.md`

### Fungsi
Peta seluruh layar dan alur.

Berisi:
- landing;
- auth;
- Beranda;
- Periksa;
- Result;
- Case;
- Graph;
- Wallet;
- top-up;
- admin;
- PWA;
- error;
- offline;
- partner.

### Baca saat
butuh jawaban:
> **“User dari sini pindah ke mana dan apa yang terjadi?”**

---

## `docs/SCHEMA.md`

### Fungsi
Kontrak data dan keamanan.

Berisi:
- Supabase;
- Auth;
- RLS;
- roles;
- permissions;
- Case;
- evidence;
- graph;
- ledger;
- credit lots;
- payment;
- partner;
- storage;
- audit;
- AI runs;
- deletion;
- source registry;
- concurrency.

### Baca saat
mengerjakan backend/data/security.

---

## `docs/ROADMAP.md`

### Fungsi
Urutan execution Agent.

Phase:
```text
0  Project Intake & Safety
1  Repository & Runtime
2  Supabase + Auth
3  RBAC + RLS
4  App Shell
5  Case + Evidence
6  Credit Ledger
7  Source + Scan
8  Result + AI
9  Payment
10 Ruang Kendali
11 Partner
12 Privacy
13 PWA
14 Observability + NADI
15 Security Hardening
16 QA
17 Production Readiness
18 Launch
```

### Baca
phase aktif saja saat resume.

---

## `docs/ACCEPTANCE_TESTS.md`

### Fungsi
Bukti bahwa fitur benar-benar selesai.

Baseline:
> 408 acceptance tests.

Mencakup:
- RLS;
- race condition;
- credit;
- payment;
- source;
- AI;
- PWA;
- Safari;
- Brave;
- partner;
- deletion;
- launch.

### Prinsip
`IMPLEMENTED ≠ DONE`

Done:
> acceptance relevant lulus.

---

## `JEJAK.md`

### Fungsi
Local secret bootstrap.

Berisi:
- metadata Supabase;
- API credentials;
- provider bootstrap;
- environment information.

### Status
**JANGAN COMMIT.**

Wajib:
- `.gitignore`;
- pindahkan secret ke env/secret store;
- jangan copy raw secret ke docs;
- jangan print raw secret;
- jangan masukkan client bundle.

---

# 5. SOURCE OF TRUTH ORDER

Kalau ada konflik:

1. `docs/SCHEMA.md` — security/data invariant
2. `docs/PRD.md` — business/product rule
3. `docs/WIRE_MAP.md` — UX flow
4. `docs/DESIGN_SYSTEM.md` — presentation/interaction
5. `docs/ROADMAP.md` — implementation dependency
6. `.notes/DECISIONS.md` — active implementation decision

Kalau tetap ambigu:
> pilih solusi paling aman + reversibel, catat DEC jika meaningful.

---

# 6. PRODUK DALAM 60 DETIK

## Brand

**Jejak**

Tagline:
> **Periksa sebelum percaya.**

## User navigation

- Beranda
- Periksa
- Kasus
- Jejak Gue

## Core input

- Email
- Nomor HP
- Nama
- Username
- Domain

Password Exposure:
> flow terpisah.

## Core experience

```text
Input
→ Intent
→ Pilih kedalaman
→ Credit Preview
→ Scan
→ Evidence
→ Result
→ Graph/Case
→ Next Action
```

---

# 7. PRODUCT PRINCIPLES

Jejak harus:
- evidence-first;
- uncertainty-aware;
- mobile-first;
- PWA;
- premium;
- cepat;
- privacy-aware;
- monetizable;
- admin-operable;
- modular.

Jejak tidak boleh:
- jadi doxxing/stalking tool;
- bikin verdict “penipu”;
- bikin fake database coverage;
- fake AI;
- fake progress;
- dark pattern;
- mass-harvesting bypass;
- menganggap public data otomatis boleh dipakai apa saja.

---

# 8. EVIDENCE PRINCIPLES

Lapisan:

1. Fakta Terverifikasi
2. Sinyal
3. Korelasi
4. Inferensi AI
5. Bukti dari Pengguna

AI:
> bukan evidence primer.

No result:
> bukan berarti aman.

Name match:
> bukan identity proof.

Phone validity:
> bukan owner proof.

Username sama:
> bukan orang sama.

Domain age:
> bukan umur bisnis.

---

# 9. CREDIT PRINCIPLES

Credit bukan integer sederhana.

Gunakan:
- wallet;
- credit lots;
- ledger;
- reservation/hold.

Rules:
- server-only;
- atomic;
- idempotent;
- FEFO;
- expiry;
- grace;
- refund;
- upgrade by difference.

Old result:
> tidak charge.

New work:
> charge.

---

# 10. PAYMENT PRINCIPLES

V1:
> manual bank transfer.

Payment method:
> editable admin tanpa redeploy.

Order:
> snapshot rekening/package.

Payment proof:
> private Storage.

AI screening:
> bukan approval.

Final:
> Owner/Finance cek mutasi.

Settlement:
> atomik + idempotent.

---

# 11. CASE PRINCIPLES

Case adalah core V1.

Case menghubungkan:
- identifier;
- evidence;
- relationships;
- timeline;
- contradiction;
- notes;
- attachments.

AI:
> suggest relationship.

Human:
> accept/reject.

Merge:
> reversible.

---

# 12. AI PRINCIPLES

AI dipakai untuk:
- explanation;
- correlation;
- skeptic;
- narrative;
- contextual assistant;
- NADI.

Tidak untuk:
- membuat fakta;
- auto approve payment;
- auto mutate credit;
- auto block user;
- autonomous admin action.

External content:
> data, bukan instruction.

---

# 13. SOURCE PRINCIPLES

Core V1 direction:
- local normalization;
- libphonenumber;
- RDAP;
- Cloudflare DNS;
- Google DNS fallback;
- HIBP Pwned Passwords;
- GitHub optional;
- GitLab optional;
- Public Page Collector.

Broad web search:
> future proper provider.

Google Places:
> tidak dipakai.

Public Page Collector:
- public URL only;
- no login bypass;
- no CAPTCHA bypass;
- SSRF protection.

---

# 14. SECURITY PRINCIPLES

- RLS deny-by-default.
- Browser hostile.
- Server/database determines truth.
- User A tidak boleh baca User B.
- Finance tidak otomatis baca Case.
- Support masked.
- Owner role DB-driven.
- Storage private.
- Signed URLs short-lived.
- Audit sensitive admin action.
- Secret server-only.
- No raw secret in logs.

---

# 15. PWA PRINCIPLES

PWA adalah core V1.

Harus:
- installable;
- Version Sentinel;
- Kembali;
- Segarkan;
- survive stale client;
- critical minimum version;
- restore safe intent.

Jangan jadikan:
> clear cache

sebagai update strategy normal.

---

# 16. PERFORMANCE PRINCIPLES

- App Shell persistent.
- No global page scroll.
- Warm tab cepat.
- Local panel buka langsung.
- Graph progressive.
- Heavy modules lazy.
- Realtime selective.
- Cache UI, bukan business truth.

Performance regression:
> bug.

---

# 17. DESIGN PRINCIPLES

Arah:
> Luxury Digital Security / Obsidian Intelligence.

Visual:
- black titanium;
- charcoal;
- smoked glass;
- tactile surfaces;
- precise lighting;
- subtle 3D.

Signature:
- Search Console / Search Orb;
- Mata Jejak.

Dilarang:
- Matrix green;
- skull;
- hoodie hacker cliché;
- generic SaaS dashboard.

---

# 18. COMMUNICATION CONTRACT

Ke Product Owner:

Gunakan:
> Indonesia gaul, `lo/gue`.

Contoh:

> “Gas, RLS udah aman. Gue lanjut ledger sekarang.”

Jangan:

> “Based on my assessment, I recommend…”

Product Owner:
> tidak perlu ikut debugging kalau Agent bisa handle sendiri.

---

# 19. AUTONOMY CONTRACT

Kalau Agent bisa:
- inspect;
- code;
- test;
- fix;
- migrate;
- deploy;
- push;
- use tooling;

maka:
> lakukan.

Tanya Product Owner hanya jika:
- credential hilang;
- human-only approval;
- irreversible destructive action;
- real business contradiction.

---

# 20. GLOBAL SKILLS CONTRACT

Product Owner sudah memasang banyak skills/tooling global.

Setiap fresh Agent:
1. inspect;
2. gunakan yang relevan;
3. jangan reinstall sebelum cek;
4. jangan assume skill ada;
5. catat choice penting di DECISIONS.

---

# 21. SECRET SAFETY FIRST RUN

Sebelum commit pertama:

```text
[ ] JEJAK.md ignored
[ ] .env secret ignored
[ ] no secret staged
[ ] client/server env separated
[ ] no raw API key in docs
[ ] no secret client bundle
[ ] Git remote verified
```

Jika gagal:
> Phase 0 belum selesai.

---

# 22. AGENT FIRST RUN

Kalau belum ada app:

```text
inspect
→ secure secrets
→ inspect global skills
→ create/verify STATUS + DECISIONS
→ inspect Git
→ initialize runtime
→ production build baseline
→ update STATUS
→ Phase 1
```

---

# 23. AGENT RESUME

Kalau app sudah jalan:

```text
STATUS
→ DECISIONS
→ git status
→ latest commit
→ migration head
→ ROADMAP phase
→ relevant source/test
→ relevant blueprint section
→ smoke test
→ Next Safe Action
```

---

# 24. HANDOFF

Sebelum Agent berhenti:

```text
[ ] relevant tests run
[ ] safe state
[ ] commit if appropriate
[ ] STATUS updated
[ ] DECISIONS updated
[ ] migration head updated
[ ] deploy recorded
[ ] failing test IDs recorded
[ ] blocker recorded
[ ] Next Safe Action specific
[ ] relevant files listed
```

---

# 25. NEXT SAFE ACTION FORMAT

Salah:

> Lanjut backend.

Benar:

> Implement atomic `reserve_scan_credits`, lalu run `AT-CREDIT-003`, `AT-CREDIT-004`, dan `AT-CREDIT-018`.

---

# 26. CURRENT PROJECT STATE

Lihat:
> `.notes/STATUS_PROJECT.md`

Saat blueprint handoff awal:
> Phase 0 — Project Intake & Safety.

Jangan percaya bagian README ini untuk status runtime setelah project berkembang.

**STATUS_PROJECT selalu lebih fresh.**

---

# 27. CURRENT DECISIONS

Lihat:
> `.notes/DECISIONS.md`

Saat blueprint handoff:
> sudah ada puluhan keputusan product/architecture yang locked.

Jangan reset berdasarkan preferensi Agent.

---

# 28. QUALITY GATES

Minimal sebelum V1 production:

```text
Build
Typecheck
Lint
Auth
RLS negative tests
Storage negative tests
Ledger concurrency
Payment double approval
Case isolation
Source failure handling
AI grounding
Prompt injection
PWA install/update
Brave QA
Safari status honest
Deletion lifecycle
Secret scan
Security suite
```

---

# 29. P0 — STOP RELEASE

Contoh:
- data leak;
- auth bypass;
- double credit;
- payment double settlement;
- secret exposure;
- cross-user Case access.

Jika ada:
> jangan lanjut release terkait.

---

# 30. P1 — LAUNCH BLOCKER

Contoh:
- credit hilang;
- approved top-up tanpa credit;
- PWA update unusable;
- private file public;
- Case core broken.

Tidak boleh broad launch.

---

# 31. V1

V1 adalah:
> production-grade smallest complete Jejak.

Bukan:
> prototype asal hidup.

Wajib kuat pada:
- security;
- money;
- data;
- PWA;
- UX.

---

# 32. V1.5

Setelah V1 stabil:
- Pantau Jejak;
- Jejak Perubahan;
- Case collaboration;
- Team Mitra;
- advanced AI;
- richer reports;
- richer NADI.

---

# 33. V2

Setelah revenue/need:
- premium breach intelligence;
- proper broad search provider;
- premium reputation sources;
- payment gateway;
- official reconciliation;
- richer monitoring.

---

# 34. DILARANG SHINY-OBJECT DEVELOPMENT

Jangan bangun:
- advanced AI;
- marketplace;
- complex collaboration;
- fancy particles;
- extra navigation;

sementara:
- RLS;
- ledger;
- payment;
- update;
- deletion

belum sehat.

---

# 35. ADMIN OPERATIONS

Owner harus bisa tanpa developer:
- approve payment;
- grant/correct credit;
- change pricing;
- change bank;
- manage role;
- manage partner;
- pause source;
- feature flag;
- maintenance;
- emergency protection.

---

# 36. OWNER MODE

Owner:
> normal user + Owner permission.

Default login:
> User Mode.

Ruang Kendali:
> additional context.

Always:
> `Kembali sebagai Pengguna`.

---

# 37. TESTS ADALAH BUKTI

Kalau test belum dijalankan:
> belum terbukti.

Kalau Safari hanya emulator:
> belum real Safari.

Kalau UI ada:
> belum tentu DONE.

Kalau build pass tapi RLS bocor:
> gagal.

---

# 38. DOCUMENTATION HYGIENE

Jangan duplicate seluruh blueprint ke README/source.

Gunakan reference.

Contoh code comment:

> `See SCHEMA credit reservation invariant.`

Bukan copy 50 baris PRD ke source.

---

# 39. REPO HYGIENE

Jangan commit:
- secrets;
- generated junk;
- debug dumps;
- giant local logs;
- personal artifacts.

Jangan reset:
- migrations;
- blueprint;
- Git history;

tanpa alasan nyata.

---

# 40. IMPLEMENTATION FREEDOM

Agent boleh memilih:
- package manager;
- internal module split;
- graph library;
- queue;
- cache library;
- animation library;
- testing stack;

setelah inspect environment.

Harus:
> memenuhi blueprint.

Keputusan meaningful:
> `.notes/DECISIONS.md`.

---

# 41. JIKA AGENT MAU REWRITE

Tanya diri sendiri:

> “Ada bug/security/compatibility/performance problem nyata?”

Kalau cuma:
> “gue lebih suka cara lain”

jangan rewrite.

---

# 42. JIKA ADA ERROR

Agent:
1. diagnose;
2. fix;
3. rerun;
4. lanjut.

Jangan panggil Product Owner untuk error normal.

---

# 43. JIKA ADA BLOCKER

Format ke Product Owner:

> “Gue butuh satu hal dari lo: …  
> Sisanya tetap gue lanjut.”

Bukan:
> tutorial manual 20 langkah.

---

# 44. FINAL AGENT CHECK

Sebelum kerja:

```text
[ ] Gue tahu ini FIRST RUN atau RESUME
[ ] Gue udah baca STATUS
[ ] Gue udah baca DECISIONS
[ ] Gue tahu Current Phase
[ ] Gue tahu Next Safe Action
[ ] Gue udah cek global skills
[ ] Gue udah cek Git
[ ] Gue nggak akan baca semua blueprint tanpa alasan
[ ] Gue nggak akan nanya hal yang sudah dikunci
[ ] Gue akan update STATUS + DECISIONS
```

---

# 45. FINAL RULE

Project Jejak sengaja dibuat supaya pergantian Agent terasa seperti:

> **pergantian shift engineer**

bukan:

> **mulai project dari nol.**

Kalau lo Agent baru:
> baca state, pahami keputusan, lanjut kerja.

Kalau lo Agent lama:
> tinggalkan state yang bersih.

Kalau lo bisa kerja:
> kerja.

Kalau lo bisa fix:
> fix.

Kalau lo bisa test:
> test.

Kalau lo bisa lanjut:
> lanjut.

**Gas bangun Jejak.**
