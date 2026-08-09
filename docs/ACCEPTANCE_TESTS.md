# ACCEPTANCE TESTS — JEJAK

> **Status:** Kontrak penerimaan produk untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Tujuan:** Membuktikan bahwa fitur benar-benar bekerja, aman, konsisten, dan layak production  
> **Format utama:** Given / When / Then  
> **Dipakai bersama:** `docs/PRD.md`, `docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`, `docs/SCHEMA.md`, `docs/ROADMAP.md`, `.notes/AGENTS.md`  
> **Operational record:** `.notes/STATUS_PROJECT.md` + `.notes/DECISIONS.md`

---

# 0. CARA PAKAI FILE INI

File ini adalah **kontrak bukti**.

Sebuah fitur tidak boleh dianggap `DONE` hanya karena:
- layar sudah muncul;
- tombol bisa diklik;
- happy path sekali berhasil;
- build tidak error;
- Agent merasa implementasinya “harusnya aman”.

Untuk dianggap `DONE`, test yang relevan harus:
1. dijalankan;
2. punya hasil;
3. critical negative-path ikut diuji;
4. bukti dicatat;
5. failure diperbaiki atau dicatat jujur sebagai blocker/known issue.

`IMPLEMENTED` ≠ `DONE`.

---

# 0.1 LEVEL SEVERITY

## P0 — Stop Everything / Tidak Boleh Launch

Contoh:
- data user bocor;
- authorization bypass;
- double credit;
- double payment settlement;
- secret masuk client;
- user bisa baca Case orang lain;
- destructive action salah target.

Jika P0 gagal:
> hentikan release terkait dan bereskan dulu.

## P1 — Critical Product Blocker

Contoh:
- user kehilangan kredit;
- top-up approved tapi kredit tidak masuk;
- PWA update membuat app unusable;
- Case sendiri tidak bisa dibuka;
- payment proof public.

Tidak boleh launch dengan P1 aktif.

## P2 — Major Degradation

Contoh:
- satu browser tertentu rusak;
- source failure tidak dijelaskan;
- graph besar lambat;
- analytics penting salah.

Boleh lanjut development, tapi harus jelas sebelum launch.

## P3 — Polish / Minor

Contoh:
- copy kecil;
- microinteraction;
- visual alignment minor.

---

# 0.2 TEST MODE

Setiap test punya salah satu:

- **AUTO** — harus bisa dibuktikan lewat unit/integration/E2E.
- **MANUAL** — memang perlu observasi manusia/perangkat.
- **HYBRID** — automation + verifikasi manual.
- **REAL_DEVICE** — wajib perangkat nyata.

Agent jangan mengubah `REAL_DEVICE` menjadi `AUTO` hanya supaya checklist hijau.

---

# 0.3 STATUS

Gunakan:

- `NOT_RUN`
- `PASS`
- `FAIL`
- `BLOCKED_EXTERNAL`
- `NOT_AVAILABLE`
- `NOT_APPLICABLE`

`NOT_AVAILABLE` bukan `PASS`.

Contoh:
> Safari real iPhone belum tersedia → `NOT_AVAILABLE`.

---

# 0.4 BUKTI MINIMUM

Bukti dapat berupa:
- nama test otomatis + hasil;
- output assertion ringkas;
- migration/RLS test;
- screenshot/video QA;
- browser/device + versi;
- transaction IDs test;
- commit;
- deploy preview;
- log aman;
- database assertion.

Jangan menempel:
- API key;
- password;
- token;
- full payment proof;
- raw PII.

---

# 0.5 FORMAT RECORD DI STATUS_PROJECT

Contoh:

```md
## Acceptance Progress

| Suite | Passed | Failed | Not Run | Notes |
|---|---:|---:|---:|---|
| Auth | 12 | 0 | 0 | |
| RLS | 28 | 0 | 0 | |
| Ledger | 31 | 1 | 2 | Refund retry fail |
| Safari Real | 0 | 0 | 8 | Device belum tersedia |
```

Untuk failure critical:
> tulis ID test.

Contoh:
`AT-CREDIT-014 FAIL`.

---

# 0.6 TEST DATA

Gunakan data fiktif/test.

Dilarang memakai:
- target OSINT orang nyata tanpa kebutuhan;
- screenshot bank user nyata sebagai fixture;
- password asli;
- credential asli dalam snapshot test;
- PII produksi untuk convenience.

Owner boleh melakukan internal test production-like secara sadar, tetapi ditandai:
> `internal_test`.

---

# 0.7 ACCEPTANCE HIERARCHY

Urutan prioritas:

1. Security & authorization
2. Credit/payment integrity
3. Evidence truth
4. Data lifecycle
5. Reliability
6. PWA/update
7. Performance
8. UX
9. Partner/business
10. Visual polish

---

# 0.8 SUITE INDEX

1. Bootstrap & Secret Safety
2. Git & Environment
3. Google Auth & Session
4. RBAC & RLS
5. Storage Authorization
6. App Shell & Navigation
7. Mobile / Desktop Interaction
8. Input Detection & Normalization
9. Case
10. Entity / Relationship / Graph
11. Evidence / Timeline / Contradiction
12. Credit Ledger
13. Credit Expiry / Upgrade
14. Scan Orchestration
15. OSINT Sources
16. Password Exposure
17. AI / Grounding / Prompt Injection
18. Top-up User Flow
19. Payment Review & Settlement
20. Referral / Affiliate
21. Reseller / Voucher
22. Mitra / Workspace
23. Jejak Gue
24. Privacy / Retention / Deletion
25. Safe Share
26. PWA / Version Sentinel
27. Offline / Realtime / Multi-device
28. Brave / Safari / Motion
29. Admin / Ruang Kendali
30. Source Registry / Feature Flags / Maintenance
31. Observability / NADI
32. Security & Abuse
33. Performance
34. Accessibility
35. Analytics
36. Handoff / Agent Continuity
37. Production / Launch

---


# 1. EXECUTION RULE

Agent boleh menambahkan test baru bila menemukan edge case nyata.

Agent **tidak boleh menghapus test critical** hanya karena implementation memilih jalur berbeda.

Kalau sebuah test memang tidak relevan karena keputusan implementasi valid:
- tandai `NOT_APPLICABLE`;
- tulis alasan di `.notes/DECISIONS.md`;
- jangan diam-diam hapus.

---

# 2. TEST CASES

Di bawah ini adalah baseline acceptance suite.


# SUITE 01 — Bootstrap & Secret Safety


## AT-BOOT-001 — JEJAK.md tidak ikut Git

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
File bootstrap lokal `JEJAK.md` tersedia di root dan berisi credential.

### When
Agent menjalankan pemeriksaan Git sebelum commit pertama.

### Then
`JEJAK.md` tidak tracked, masuk ignore, dan tidak muncul pada staged files.

### Bukti minimum
`git check-ignore`, `git status`, secret scan.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-002 — .env lokal tidak ikut Git

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
Environment lokal sudah dibuat.

### When
Git status diperiksa.

### Then
`.env`, `.env.local`, dan secret env lain tidak tracked.

### Bukti minimum
Git ignore assertion.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-003 — Secret Supabase tidak masuk client bundle

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Server dan client Supabase client sudah dibuat.

### When
Production build dibuat dan bundle discan.

### Then
Secret/service/database credential tidak ditemukan pada client artifact.

### Bukti minimum
Bundle secret scan.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-004 — Gemini/Groq key server-only

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8`  
**Status:** `NOT_RUN`

### Given
AI provider dikonfigurasi.

### When
Build/client source diperiksa.

### Then
Tidak ada `GEMINI_API_KEY_*` atau `GROQ_API_KEY_*` pada client/runtime publik.

### Bukti minimum
Bundle/source scan.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-005 — Secret tidak tercetak log

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
Env tersedia.

### When
Startup/test provider dijalankan.

### Then
Log tidak mencetak raw key, auth header, database password, JWT secret.

### Bukti minimum
Log review + automated pattern scan.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-006 — Global skills diperiksa sebelum instalasi

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
Agent fresh session masuk project.

### When
Agent memulai bootstrap.

### Then
STATUS/DECISIONS mencatat tool/skill relevan yang ditemukan bila memengaruhi pekerjaan; tidak ada reinstall membabi buta.

### Bukti minimum
Session/handoff note.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-007 — Legacy secret tidak dipakai browser

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Bootstrap punya legacy anon/service/JWT data.

### When
Application runtime dibangun.

### Then
Legacy service/JWT/database password tidak terekspos ke browser.

### Bukti minimum
Source/bundle scan.

### Catatan eksekusi
- Belum diisi.

## AT-BOOT-008 — Missing required env gagal secara jelas

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Satu server-required env sengaja dihilangkan.

### When
Server/startup dijalankan.

### Then
App gagal dengan error konfigurasi terstruktur, bukan random runtime crash atau silent undefined.

### Bukti minimum
Environment validation test.

### Catatan eksekusi
- Belum diisi.


# SUITE 02 — Git & Environment


## AT-GIT-001 — Repo remote benar

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
Repository sudah diinisialisasi.

### When
Remote diperiksa.

### Then
Remote target mengarah ke repo Jejak yang benar dan tidak overwrite repo asing.

### Bukti minimum
`git remote -v`.

### Catatan eksekusi
- Belum diisi.

## AT-GIT-002 — Blueprint tidak terhapus saat init Next.js

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Folder awal berisi docs dan notes.

### When
Next.js diinisialisasi in-place.

### Then
Semua blueprint penting tetap ada dan utuh.

### Bukti minimum
File existence/hash.

### Catatan eksekusi
- Belum diisi.

## AT-GIT-003 — Production build reproducible

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Dependency lock tersedia.

### When
Fresh install + build dijalankan.

### Then
Build sukses tanpa state lokal tersembunyi.

### Bukti minimum
CI/local clean build.

### Catatan eksekusi
- Belum diisi.

## AT-GIT-004 — Package lock konsisten

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `1`  
**Status:** `NOT_RUN`

### Given
Package manager sudah dipilih.

### When
Dependency install dijalankan ulang.

### Then
Tidak terjadi uncontrolled lockfile churn.

### Bukti minimum
Git diff.

### Catatan eksekusi
- Belum diisi.

## AT-GIT-005 — Status project mencatat branch dan commit

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0`  
**Status:** `NOT_RUN`

### Given
Milestone selesai.

### When
Agent handoff.

### Then
STATUS menyebut branch, commit terakhir, migration head, next action.

### Bukti minimum
STATUS review.

### Catatan eksekusi
- Belum diisi.

## AT-GIT-006 — Tidak ada credential pada Git history baru

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `17`  
**Status:** `NOT_RUN`

### Given
Release candidate dibuat.

### When
Secret scanner dijalankan pada tracked history yang relevan.

### Then
Tidak ada credential aktif pada repository history.

### Bukti minimum
Secret scan result.

### Catatan eksekusi
- Belum diisi.


# SUITE 03 — Google Auth & Session


## AT-AUTH-001 — User baru login Google

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
User test belum punya profile.

### When
User memilih `Mulai dengan Google` dan menyelesaikan OAuth.

### Then
Session valid dibuat, profile tersedia, user masuk onboarding.

### Bukti minimum
E2E auth.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-002 — User lama login ulang

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
User sudah pernah login.

### When
OAuth dilakukan lagi.

### Then
Tidak membuat profile/wallet/role duplicate.

### Bukti minimum
DB uniqueness + E2E.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-003 — Owner tetap masuk User Mode

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
Akun Owner punya role owner.

### When
Owner login.

### Then
Landing setelah login adalah user app, bukan Ruang Kendali otomatis.

### Bukti minimum
E2E.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-004 — Owner authorization bukan email frontend

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
Browser memodifikasi local state/email.

### When
User biasa mencoba route Owner.

### Then
Server menolak karena DB permission tidak ada.

### Bukti minimum
Authorization integration.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-005 — Logout memutus akses protected route

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
User login.

### When
Logout lalu buka route protected.

### Then
Dialihkan/login required dan data protected tidak diberikan.

### Bukti minimum
E2E.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-006 — Session expired preserving safe draft

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
User mengetik catatan aman yang belum submit.

### When
Session dibuat expired.

### Then
UI meminta login ulang dan draft aman bisa dipulihkan sesuai policy.

### Bukti minimum
E2E/manual.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-007 — Blocked user ditolak server walau UI cached

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
User login dan app terbuka.

### When
Admin memblokir user lalu user melakukan mutation sensitif dari tab lama.

### Then
Server menolak operation; cached UI tidak memberi hak.

### Bukti minimum
Integration.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-008 — OAuth failure human-readable

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
OAuth dibuat gagal/cancel.

### When
User kembali ke app.

### Then
UI menampilkan Bahasa Indonesia yang jelas, bukan raw OAuth error.

### Bukti minimum
UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-009 — Profile initialization idempotent

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
First-login initializer dipanggil bersamaan/retry.

### When
Dua request terjadi.

### Then
Hanya satu profile/wallet/default role/benefit baseline tercipta.

### Bukti minimum
Concurrency integration.

### Catatan eksekusi
- Belum diisi.

## AT-AUTH-010 — Owner bootstrap tidak reusable

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `2`  
**Status:** `NOT_RUN`

### Given
Owner sudah berhasil di-bootstrap.

### When
User lain mencoba mekanisme bootstrap.

### Then
Tidak bisa mengangkat diri menjadi Owner.

### Bukti minimum
Security test.

### Catatan eksekusi
- Belum diisi.


# SUITE 04 — RBAC & RLS


## AT-RLS-001 — User A tidak bisa membaca profile private User B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User A dan B ada.

### When
A query profile B.

### Then
Denied/masked sesuai endpoint.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-002 — User A tidak bisa membaca Case User B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
B punya Case privat.

### When
A query Case B by UUID/public ref.

### Then
Tidak ada data Case bocor.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-003 — User A tidak bisa membaca entity Case B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
B punya entity.

### When
A query subresource.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-004 — User A tidak bisa membaca evidence Case B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
B punya evidence.

### When
A query evidence ID.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-005 — User A tidak bisa membaca relationship Case B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
B punya graph.

### When
A query relation.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-006 — User tidak bisa update saldo sendiri

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User punya wallet.

### When
User direct update credit_wallets.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-007 — User tidak bisa insert ledger sendiri

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User authenticated.

### When
Direct insert credit transaction.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-008 — User tidak bisa approve top-up sendiri

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User punya pending order.

### When
Direct mutation status approved.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-009 — Finance tidak bisa membaca Case

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Finance login.

### When
Finance query Case user.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-010 — Finance bisa melihat queue pembayaran yang diizinkan

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Finance punya permission payment.

### When
Queue dibuka.

### Then
Data pembayaran minimum tersedia.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-011 — Support masked by default

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Support membuka user detail.

### When
Field sensitif diminta.

### Then
Hanya masked view tersedia.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-012 — Support raw reveal butuh permission

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Support tanpa reveal permission.

### When
Request raw identifier.

### Then
Denied dan tidak bocor.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-013 — Raw reveal diaudit

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Support punya reveal permission.

### When
Identifier direveal.

### Then
Sensitive access event tercatat.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-014 — Admin tidak bisa self-promote Owner

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Admin biasa login.

### When
Mencoba assign Owner ke dirinya.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-015 — Admin tanpa permission tidak bisa ubah rekening

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Admin tidak punya business payment permission.

### When
Mutation payment method.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-016 — Feature hidden tidak cukup—endpoint ikut deny

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Feature flag off.

### When
User memanggil endpoint langsung.

### Then
Server menolak.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-017 — Case viewer tidak bisa edit

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User jadi viewer Case.

### When
Update note/entity dicoba.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-018 — Case contributor bisa edit yang diizinkan

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User contributor aktif.

### When
Tambah note/clue.

### Then
Berhasil sesuai scope.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-019 — Case member revoked kehilangan akses

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Member punya access lalu dicabut.

### When
Query baru dilakukan.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-020 — Workspace Mitra A tidak bisa baca Mitra B

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Dua workspace berbeda.

### When
Mitra A query client/Case B.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-021 — Affiliate tidak bisa baca data Case referral

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Affiliate punya referral valid.

### When
Affiliate query referred user's Case.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-022 — Reseller tidak bisa baca wallet distribusi reseller lain

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Dua reseller.

### When
A query B distribution wallet.

### Then
Denied.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-023 — Anon tidak bisa query profile

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Tidak login.

### When
Query Data API profile.

### Then
Denied/no rows.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-024 — Anon tidak bisa query Case

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Tidak login.

### When
Query Case.

### Then
Denied/no rows.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-025 — Anon tidak bisa query wallet

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Tidak login.

### When
Query wallet.

### Then
Denied/no rows.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-026 — Blocked user baca safe owned data sesuai policy tapi mutation ditolak

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User blocked.

### When
Buka hasil lama lalu coba scan baru.

### Then
Read sesuai policy; mutation sensitif ditolak.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-027 — RLS helper tidak recursive/infinite

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
Policy helper aktif.

### When
Query representative tables.

### Then
Tidak ada recursion error/performance runaway.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.

## AT-RLS-028 — Security definer helper tidak privilege escalate

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3`  
**Status:** `NOT_RUN`

### Given
User biasa tahu nama RPC.

### When
Mencoba crafted args.

### Then
Tidak bisa bypass ownership/permission.

### Bukti minimum
RLS integration test.

### Catatan eksekusi
- Belum diisi.


# SUITE 05 — Storage Authorization


## AT-STOR-001 — Payment proof bucket private

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Proof test ada.

### When
Public URL/anonymous fetch dicoba.

### Then
Tidak bisa diakses tanpa authorized signed path.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-002 — Case attachment bucket private

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Attachment ada.

### When
Anonymous/public fetch dicoba.

### Then
Denied.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-003 — Guessed path tidak memberi akses

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
User A tahu path attachment B.

### When
A request file.

### Then
Denied.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-004 — Signed URL hanya setelah parent authorization

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
User tidak punya Case access.

### When
Request signed URL.

### Then
Tidak diterbitkan.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-005 — Revoked member tidak mendapat signed URL baru

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Member dicabut.

### When
Request file.

### Then
Denied.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-006 — Finance proof access sesuai permission

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Finance berizin.

### When
Buka proof order.

### Then
Signed access tersedia dan tercatat.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-007 — Support tidak otomatis lihat proof

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Support login.

### When
Buka proof route.

### Then
Denied.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-008 — Cleanup menghapus object nyata

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Proof masuk cleanup.

### When
Job selesai.

### Then
Storage object tidak ada, metadata lifecycle benar.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-009 — Orphan upload dibersihkan

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Upload abandoned dibuat.

### When
Cleanup job berjalan.

### Then
Object orphan hilang.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.

## AT-STOR-010 — Metadata file tidak bocor EXIF yang tidak perlu

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `3/9/12`  
**Status:** `NOT_RUN`

### Given
Foto ber-EXIF diupload.

### When
Normalization selesai.

### Then
EXIF sensitif dihapus.

### Bukti minimum
Storage policy/integration + object check.

### Catatan eksekusi
- Belum diisi.


# SUITE 06 — App Shell & Navigation


## AT-SHELL-001 — Empat nav user saja

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
User login.

### When
App Shell tampil.

### Then
Beranda, Periksa, Kasus, Jejak Gue adalah primary nav.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-002 — Dompet buka panel bukan primary page

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
User di Case.

### When
Tap saldo.

### Then
Dompet terbuka tanpa kehilangan Case.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-003 — Kabar buka drawer/sheet contextual

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
User di Result.

### When
Tap Kabar.

### Then
Panel terbuka dan workspace tetap.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-004 — Tab warm tidak remount shell

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
App loaded.

### When
Pindah nav beberapa kali.

### Then
Shell/session/global controls tetap; tidak full reload.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-005 — No global page scroll

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
Content panjang dibuka.

### When
Scroll dilakukan.

### Then
Hanya internal region yang scroll.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-006 — Back menutup layer teratas

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
Modal/panel aktif.

### When
Tap internal back.

### Then
Layer atas ditutup dulu.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-007 — Refresh sinkron bukan hard reload

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
State graph/panel aktif.

### When
Tap Segarkan.

### Then
Fresh data diambil tanpa membuang safe workspace state.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-008 — Running scan indicator global

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
Scan berjalan lalu user pindah nav.

### When
Nav berubah.

### Then
Indikator scan tetap terlihat.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-009 — Pusat aktivitas scan dapat dibuka

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
Ada scan berjalan.

### When
Tap indikator.

### Then
Status scan tampil tanpa hijack workspace.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.

## AT-SHELL-010 — Owner bisa kembali ke User Mode

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `4`  
**Status:** `NOT_RUN`

### Given
Owner di Ruang Kendali.

### When
Tap Kembali sebagai Pengguna.

### Then
User app kembali dengan identity yang sama.

### Bukti minimum
E2E + visual QA.

### Catatan eksekusi
- Belum diisi.


# SUITE 07 — Mobile / Desktop Interaction


## AT-UI-001 — Mobile pakai bottom navigation

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Viewport touch mobile.

### When
App Shell dibuka.

### Then
Primary nav cocok thumb, tidak desktop sidebar.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-002 — Desktop pakai rail/sidebar sesuai design

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Desktop pointer.

### When
App dibuka.

### Then
Navigation memanfaatkan desktop density.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-003 — Hover bukan satu-satunya jalan

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Desktop.

### When
Aksi yang punya hover ditemukan.

### Then
Aksi sama tersedia lewat visible path.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-004 — Long-press bukan satu-satunya jalan

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Mobile.

### When
Shortcut long-press tersedia.

### Then
Aksi sama tersedia lewat tap/menu.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-005 — Keyboard mobile tidak menutup CTA

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Search/note form dibuka.

### When
Keyboard muncul.

### Then
Input + CTA tetap usable.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-006 — Hybrid touch + mouse sama-sama bisa

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
Device hybrid.

### When
Gunakan touch lalu pointer.

### Then
Tidak ada mode saling mematikan.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-007 — Safe-area PWA dihormati

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
PWA mobile dengan notch/home indicator.

### When
App dibuka.

### Then
CTA/nav tidak tertutup safe-area.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.

## AT-UI-008 — No destructive swipe-only action

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `4/16`  
**Status:** `NOT_RUN`

### Given
List mobile.

### When
Swipe action ada.

### Then
Jalur visible/confirm tetap tersedia.

### Bukti minimum
Device/UI QA.

### Catatan eksekusi
- Belum diisi.


# SUITE 08 — Input Detection & Normalization


## AT-IN-001 — Email terdeteksi

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Input email valid.

### When
Dimasukkan ke Search Console.

### Then
Type email terdeteksi tanpa API mahal.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-002 — Nomor Indonesia dinormalisasi

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Input `0812...`.

### When
Diproses.

### Then
Dapat dinormalisasi sesuai library dan display tetap manusiawi.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-003 — Domain dengan scheme/path dinormalisasi

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Input `https://Example.com/path`.

### When
Diproses sebagai domain.

### Then
Target canonical domain benar.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-004 — Username ambigu minta interpretasi

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Input ambiguous handle/name.

### When
Dimasukkan.

### Then
UI minta pilihan ringan, tidak auto-asumsi.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-005 — Nama whitespace dinormalisasi tanpa over-merge

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Nama dengan whitespace ganda.

### When
Diproses.

### Then
Whitespace rapih, identity semantics tidak diubah.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-006 — Invalid format tidak menghapus input

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Input malformed.

### When
Submit.

### Then
Human error tampil dan input tetap ada.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-007 — Password tidak dianggap universal identifier

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
User memasukkan string password-like di universal flow.

### When
Flow berjalan.

### Then
UI tidak otomatis membuat search password sebagai target orang.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.

## AT-IN-008 — Sensitive normalized value tidak disimpan plaintext bila design memakai encryption

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5/7`  
**Status:** `NOT_RUN`

### Given
Identifier sensitive disimpan.

### When
DB diperiksa.

### Then
Storage mengikuti encryption/HMAC contract yang diimplementasikan.

### Bukti minimum
Unit/integration + DB assertion.

### Catatan eksekusi
- Belum diisi.


# SUITE 09 — Case


## AT-CASE-001 — Create Case personal

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
User active.

### When
Buat Case.

### Then
Case + owner membership tercipta atomik.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-002 — Create Secret Case

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
User active.

### When
Buat Kasus Rahasia.

### Then
Flag secret aktif dan preview masking berlaku.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-003 — Duplicate clue tidak membuat duplicate node

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Clue sudah ada.

### When
Clue yang sama ditambah.

### Then
Tidak ada duplicate logical entity.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-004 — Case list hanya summary

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
User punya Case besar.

### When
Buka list.

### Then
Tidak memuat seluruh evidence/attachment.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-005 — Trash normal Case

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Case aktif.

### When
User hapus normal.

### Then
Masuk trash, belum hard-delete.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-006 — Restore sebelum expiry

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Case di trash.

### When
User restore.

### Then
Case aktif kembali dan data tetap.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-007 — Hard delete setelah trash expiry

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Trash expiry lewat.

### When
Cleanup berjalan.

### Then
Case child + Storage dibersihkan sesuai lifecycle.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-008 — Secret Case immediate delete option

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Secret Case.

### When
User pilih permanent delete.

### Then
Deletion job berjalan tanpa 3-day recovery bila confirmed.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-009 — Case notes tidak jadi verified fact

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
User menulis tuduhan di note.

### When
Analisis dilakukan.

### Then
Note tetap user context, bukan fact source.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-010 — Case owner dan contributor behavior berbeda

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Case punya contributor.

### When
Contributor bekerja.

### Then
Hanya capability yang diizinkan.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-011 — Last activity update meaningful

**Severity:** `P3`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
Case diubah.

### When
Tambah clue/evidence.

### Then
Ordering recent update konsisten.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-CASE-012 — Case deep link unauthorized tidak leak

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5`  
**Status:** `NOT_RUN`

### Given
User A punya URL Case B.

### When
A buka URL.

### Then
UI generic unavailable dan server tidak return payload.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 10 — Entity / Relationship / Graph


## AT-GRAPH-001 — Username sama tidak auto-merge

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Dua platform punya handle sama.

### When
Evidence masuk.

### Then
Node tetap terpisah/suggested relation.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-002 — AI hanya suggested merge

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
AI menduga dua node sama.

### When
Analysis selesai.

### Then
Status merge suggested, bukan verified permanent.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-003 — Human dapat reject merge

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Merge suggestion ada.

### When
User pilih tetap pisah.

### Then
Node tetap terpisah.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-004 — Merge dapat dibatalkan

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
User accept merge.

### When
User undo.

### Then
Entity asal/evidence dipulihkan logis.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-005 — Contradiction edge berbeda visual/semantik

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Evidence konflik.

### When
Graph dibuka.

### Then
Edge conflict terbaca dan tidak jadi direct link.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-006 — Focus mode meredupkan irrelevant nodes

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Graph >10 node.

### When
Fokus node dipilih.

### Then
Neighbor penting tetap, lainnya redup.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-007 — Large graph progressive

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Case punya ratusan node fixture.

### When
Graph dibuka.

### Then
Tidak render semua detail sekaligus.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-008 — Graph fallback tanpa WebGL

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
WebGL unavailable.

### When
Graph dibuka.

### Then
2D/2.5D usable.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-009 — Phone relationship punya temporal semantics

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Evidence lama A dan baru B untuk nomor sama.

### When
Graph/timeline dibuat.

### Then
Tidak auto-merge A/B; temporal conflict terlihat.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-GRAPH-010 — Domain age tidak jadi age bisnis

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
RDAP memberi tanggal domain.

### When
Result dibuat.

### Then
Copy tidak menyimpulkan usia bisnis.

### Bukti minimum
Integration + visual/result QA.

### Catatan eksekusi
- Belum diisi.


# SUITE 11 — Evidence / Timeline / Contradiction


## AT-EV-001 — Evidence punya source provenance

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Source menghasilkan fact.

### When
Evidence dibuat.

### Then
Source, retrieved_at, type, reliability tersedia.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-002 — AI inference terpisah dari verified fact

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
AI menghasilkan interpretasi.

### When
Result disimpan.

### Then
Evidence type/AI output tidak berubah jadi verified fact.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-003 — User evidence dilabeli

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
User upload screenshot.

### When
Evidence UI dibuka.

### Then
Label `Bukti dari pengguna` terlihat.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-004 — No-result tidak berarti aman

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Source mengembalikan no_result.

### When
Result dirender.

### Then
Copy `belum ditemukan`, bukan `aman`.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-005 — Mirror source tidak dihitung independen

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Fixture 5 pages copy source sama.

### When
Correlation dihitung.

### Then
Independence weighting mencegah 5 confirmations palsu.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-006 — Timeline hanya event punya temporal evidence

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Evidence tanpa waktu.

### When
Timeline dibuat.

### Then
Tidak diberi tanggal karangan.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-007 — Approximate time diberi precision

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Evidence hanya tahun.

### When
Timeline dibuat.

### Then
Event marked year/approx.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-008 — Contradiction menyimpan dua sisi

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Dua evidence conflict.

### When
Contradiction dibuat.

### Then
Keduanya tetap tersedia, tidak overwrite.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-009 — Counter-evidence tampil

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Ada evidence mengurangi risiko.

### When
Result dibuka.

### Then
Bagian kontra terlihat.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.

## AT-EV-010 — Evidence deletion mengikuti Case

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `5/8`  
**Status:** `NOT_RUN`

### Given
Case hard-delete.

### When
Cleanup selesai.

### Then
Evidence Case hilang sesuai lifecycle.

### Bukti minimum
DB + UI assertion.

### Catatan eksekusi
- Belum diisi.


# SUITE 12 — Credit Ledger


## AT-CREDIT-001 — Wallet dibuat satu per user

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
User initializer retry.

### When
Dua init terjadi.

### Then
Hanya satu wallet.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-002 — User tidak bisa direct balance mutation

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Authenticated user.

### When
Direct update.

### Then
Denied.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-003 — 1 kredit + 5 concurrent scans

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Wallet punya 1 credit; scan cost 1.

### When
5 requests paralel.

### Then
Satu reserve sukses; empat gagal/duplicate sesuai key; saldo tidak negatif.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-004 — Reserve atomik antar lot

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Beberapa lot aktif.

### When
Scan reserve.

### Then
Allocation FEFO konsisten dan transaction lengkap.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-005 — Settle hanya sekali

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Hold reserved.

### When
Settle dipanggil dua kali.

### Then
Satu settlement accounting.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-006 — Release/refund hanya sekali

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Hold eligible refund.

### When
Refund retry.

### Then
Satu release/refund.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-007 — Retry request idempotent

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Same idempotency key.

### When
Request diulang.

### Then
Tidak ada duplicate transaction.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-008 — Ledger correction append-only

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Admin salah grant.

### When
Dikoreksi.

### Then
Entry lama tetap, correction baru dibuat.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-009 — Available cache cocok ledger truth

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Banyak transaction.

### When
Reconciliation dijalankan.

### Then
Cached balance sesuai ledger/lots.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-010 — Reserved balance terlihat benar

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Scan berjalan.

### When
Wallet dibuka.

### Then
Reserved dipisah dari available.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-011 — Scan gagal sebelum minimum deliverable refund

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Reserve sukses, source critical fail.

### When
Settlement engine selesai.

### Then
Credit kembali sesuai policy.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-012 — Scan partial tapi memenuhi minimum settle

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Satu optional source gagal.

### When
Minimum deliverable terpenuhi.

### Then
Credit settle; completeness menunjukkan partial.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-013 — Opening old result tidak charge

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Old result ada.

### When
User buka ulang.

### Then
Tidak ada credit transaction baru.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-014 — Heavy new AI work meminta credit preview

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Question butuh source/compute baru.

### When
User bertanya.

### Then
Tidak ada charge sampai explicit confirm.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-015 — Admin grant butuh reason

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Owner grant credit.

### When
Submit tanpa reason.

### Then
Ditolak atau UI mewajibkan reason.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-016 — Owner self-grant tetap audited

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Owner grant ke diri sendiri.

### When
Action selesai.

### Then
Ledger + audit mencatat.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-017 — Blocked user credit tidak dihapus

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
User punya credit.

### When
User diblok.

### Then
Ledger/lots tetap.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.

## AT-CREDIT-018 — Negative balance constraint

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Concurrent/extreme mutation fixture.

### When
Operations dijalankan.

### Then
Tidak ada negative available/reserved.

### Bukti minimum
DB concurrency/integration assertions.

### Catatan eksekusi
- Belum diisi.


# SUITE 13 — Credit Expiry / Upgrade


## AT-EXP-001 — FEFO lot expiry terdekat digunakan dulu

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Dua lot expiry berbeda.

### When
Spend terjadi.

### Then
Lot expiry terdekat berkurang dulu.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-002 — Expired lot tidak bisa reserve baru

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Lot expired.

### When
Start paid scan.

### Then
Expired credit tidak dihitung available.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-003 — Reserved sebelum expiry tetap bisa settle

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Hold dibuat sebelum expiry.

### When
Waktu lewat lalu scan settle.

### Then
Reserved portion settle normal.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-004 — Expiry menghasilkan ledger entry

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Lot mencapai expiry.

### When
Expiry job jalan.

### Then
Entry expiry terlihat, lot tidak dihapus.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-005 — Promo expiry terpisah paid

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
User punya paid + promo.

### When
Policy expiry berbeda.

### Then
Masing-masing mengikuti lot policy.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-006 — Grace eligibility jelas

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Lot masuk grace.

### When
Top-up qualifying approved.

### Then
Hanya lot eligible yang diperpanjang/rescue.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-007 — Top-up setelah grace tidak rescue

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Grace berakhir.

### When
Payment approved setelahnya.

### Then
Lot lama tetap expired.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-008 — Upgrade bayar selisih

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
User punya Deep 3 credit reusable, Fusion 7.

### When
Upgrade quote dibuat.

### Then
Final cost 4 bila freshness/eligibility terpenuhi.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-009 — Upgrade stale evidence tidak paksa reuse

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Base scan sudah stale.

### When
Upgrade dicoba.

### Then
Server hitung ulang cost sesuai policy dan UI transparan.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.

## AT-EXP-010 — Quote expiry tidak silent charge

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `6`  
**Status:** `NOT_RUN`

### Given
Quote cost 7 expired lalu config jadi 9.

### When
User confirm quote lama.

### Then
Server meminta reconfirm 9, tidak debit 9 diam-diam.

### Bukti minimum
Ledger/quote integration.

### Catatan eksekusi
- Belum diisi.


# SUITE 14 — Scan Orchestration


## AT-SCAN-001 — Scan record durable sebelum work

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
User memulai scan.

### When
Request accepted.

### Then
Durable scan row/status ada sebelum external work.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-002 — Close PWA tidak membatalkan scan

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Scan running.

### When
Browser/PWA ditutup.

### Then
Server job tetap selesai/refund.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-003 — Reconnect tidak membuat duplicate scan

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Network putus setelah start.

### When
Client reconnect/retry.

### Then
Idempotency mencegah scan duplicate.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-004 — Fake percentage tidak tampil

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Source tidak punya real percent.

### When
Scan berjalan.

### Then
UI memakai stages, bukan angka palsu.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-005 — One source malformed tidak crash whole scan

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Adapter fixture malformed.

### When
Scan berjalan.

### Then
Source run failed isolated; lainnya lanjut.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-006 — All AI down tidak menghentikan source scan

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
AI provider disabled.

### When
Scan source berjalan.

### Then
Evidence core/result fallback tetap.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-007 — All sources critical fail => refund

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Minimum deliverable tidak tercapai.

### When
Scan selesai.

### Then
Status failed/refunded.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-008 — Optional source budget-limited => completeness

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Optional source governor skip.

### When
Scan selesai.

### Then
Result menjelaskan completeness tanpa fake failure.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-009 — Blocked account cannot start new scan

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
User blocked.

### When
Direct scan endpoint.

### Then
Denied before reserve.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SCAN-010 — Client old incompatible rejected cleanly

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Old version di bawah minimum.

### When
Start operation.

### Then
Structured update-required response.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 15 — OSINT Sources


## AT-SRC-001 — RDAP valid domain

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Domain fixture valid.

### When
RDAP adapter jalan.

### Then
Normalized evidence + provenance.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-002 — RDAP no data

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Domain/source no result.

### When
Adapter jalan.

### Then
No-result state, bukan fabricated.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-003 — DNS primary success

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Domain resolvable.

### When
Cloudflare DNS berjalan.

### Then
Records normalized.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-004 — DNS fallback saat primary fail

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Primary DNS simulated fail.

### When
Scan jalan.

### Then
Google fallback dicoba sesuai policy.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-005 — Phone validation tidak klaim owner

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Valid Indonesian number.

### When
Phone result dibuat.

### Then
Hanya validity/region/type, bukan nama pemilik.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-006 — GitHub same username hanya signal

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Username ditemukan.

### When
Result dibuat.

### Then
Tidak auto identity merge.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-007 — GitHub rate budget governor

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Budget hampir habis.

### When
Low-priority lookup diminta.

### Then
Governor skip/defer tanpa melewati limit sengaja.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-008 — GitLab optional failure isolated

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
GitLab fail.

### When
Scan jalan.

### Then
Result sumber lain tetap.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-009 — Public page known URL allowed

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
URL public normal.

### When
Collector fetch.

### Then
Relevant facts extracted dengan provenance.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-010 — Public page login required tidak dibypass

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
URL redirect login/captcha.

### When
Collector jalan.

### Then
Stop/mark unavailable.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-011 — SSRF localhost blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
URL `http://127.0.0.1`.

### When
Collector diminta.

### Then
Blocked sebelum fetch.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-012 — SSRF private IP blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
URL private network.

### When
Collector diminta.

### Then
Blocked.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-013 — SSRF redirect private blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Public URL redirect private.

### When
Collector follow.

### Then
Redirect ditolak.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-014 — Non-http scheme blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
file/gopher/etc URL.

### When
Collector.

### Then
Blocked.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-015 — Source experimental Owner-only

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Source status experimental.

### When
Normal user scan.

### Then
Source tidak dipakai.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-016 — Experimental source excluded main score

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Owner test source experimental.

### When
Result generated.

### Then
Evidence terlihat test context, score utama tidak terpengaruh.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-017 — Paused source tidak dipanggil

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Owner pause source.

### When
Scan relevant.

### Then
No request source.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.

## AT-SRC-018 — No-result bukan risk reduction otomatis

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7`  
**Status:** `NOT_RUN`

### Given
Multiple no-result.

### When
Risk assessment.

### Then
Absence tidak dipakai sebagai safe evidence kecuali semantics valid.

### Bukti minimum
Adapter/security integration.

### Catatan eksekusi
- Belum diisi.


# SUITE 16 — Password Exposure


## AT-PWD-001 — Password plaintext tidak disimpan DB

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
User cek password.

### When
Flow selesai.

### Then
No plaintext/password hash full persisted.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PWD-002 — Password tidak masuk AI

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
User cek password.

### When
Trace ai_runs diperiksa.

### Then
Tidak ada AI run dengan password content.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PWD-003 — Password tidak masuk log

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
Check dijalankan.

### When
Logs diperiksa.

### Then
Tidak ada plaintext.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PWD-004 — Compromised result jelas

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
Fixture known compromised.

### When
Check.

### Then
UI menyarankan jangan pakai lagi.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PWD-005 — Not found tidak jadi jaminan aman

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
Fixture no match.

### When
Check.

### Then
Copy menyatakan belum ditemukan, bukan pasti aman.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PWD-006 — Universal search tidak menyimpan password

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `7/12`  
**Status:** `NOT_RUN`

### Given
String sensitif accidentally typed lalu cancelled.

### When
Flow dibatalkan.

### Then
Tidak masuk search history/server analytics raw.

### Bukti minimum
Security/unit/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 17 — AI / Grounding / Prompt Injection


## AT-AI-001 — AI summary hanya dari Context Pack

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Case punya evidence subset.

### When
AI dipanggil.

### Then
Input dibatasi context yang authorized/relevant.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-002 — Web content instruction diperlakukan data

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Evidence berisi `ignore previous instructions`.

### When
AI analysis.

### Then
Instruction tidak diikuti.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-003 — User note instruction tidak jadi system prompt

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Note berisi prompt injection.

### When
AI analysis.

### Then
Note dianggap data.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-004 — AI hallucinated date grounding gagal

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Model output tanggal tidak ada evidence.

### When
Grounding check.

### Then
Claim ditolak/regenerated/fallback.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-005 — AI output HTML/script disanitasi

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Model fixture output script.

### When
UI render.

### Then
Tidak execute.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-006 — AI relationship hanya suggestion

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Model proposes identity link.

### When
Graph ingest.

### Then
Status suggested.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-007 — AI failure fallback rule summary

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Provider timeout.

### When
Result dibuka.

### Then
Evidence/result core tetap dan copy failure jelas.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-008 — All AI disabled admin toggle

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
AI system control off.

### When
User buka old result.

### Then
Core accessible; AI unavailable message.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-009 — Heavy AI new work butuh confirm credit

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
User asks new source reasoning.

### When
Assistant.

### Then
Credit preview dulu.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-010 — Included AI allowance tidak double-charge

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Scan tier includes N question.

### When
User tanya dalam allowance.

### Then
Tidak ada new debit.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-011 — Skeptic menampilkan kontra tanpa mengubah fakta

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Advanced analysis.

### When
Skeptic run.

### Then
Output separate interpretation.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-012 — NADI tidak execute draft sendiri

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Owner asks NADI grant 50 credits.

### When
NADI responds.

### Then
Draft prepared; no ledger mutation before confirm.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-013 — NADI insufficient data jujur

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
Digest lacks reason for revenue drop.

### When
Owner asks why.

### Then
NADI says insufficient, tidak mengarang.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AI-014 — Provider secret tidak tersimpan ai_runs

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `8/14`  
**Status:** `NOT_RUN`

### Given
AI run complete.

### When
DB ai_runs diperiksa.

### Then
Provider/model metadata only, no key.

### Bukti minimum
AI fixture/integration + output assertions.

### Catatan eksekusi
- Belum diisi.


# SUITE 18 — Top-up User Flow


## AT-TOP-001 — Paket tampil dari config

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Admin packages active.

### When
User buka Dompet.

### Then
UI mencerminkan current config.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-002 — Masa aktif visible

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Package punya validity.

### When
User lihat package.

### Then
Validity terlihat sebelum beli.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-003 — Order snapshot package

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
User buat order.

### When
Admin kemudian ubah package.

### Then
Order lama tetap package snapshot.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-004 — Order snapshot rekening

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
User buat order BCA A.

### When
Admin ubah primary rekening B.

### Then
Order lama tetap menunjukkan A.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-005 — Unique amount tidak collision aktif

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Banyak active order.

### When
Order baru dibuat.

### Then
Expected amount tidak ambigu sesuai policy.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-006 — Salin rekening akurat

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Checkout.

### When
Tap copy.

### Then
Clipboard nilai yang benar.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-007 — Salin nominal akurat

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Checkout.

### When
Tap copy.

### Then
Clipboard expected exact amount.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-008 — Proof upload normal tanpa manual compression

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Screenshot besar valid.

### When
User upload.

### Then
Pipeline otomatis optimize.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-009 — Proof terlalu blur bisa diminta ulang

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Screenshot unreadable.

### When
Review.

### Then
Status needs_new_proof, bukan auto-ban.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-010 — User keluar setelah upload order tetap

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Proof submitted.

### When
User logout/close.

### Then
Order under review persisten.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-011 — Approved realtime update

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order approved saat wallet open.

### When
Realtime available.

### Then
Saldo/status update.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-012 — Realtime down fallback refresh

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Realtime disabled.

### When
Order approved.

### Then
Segarkan/polling mengambil status benar.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-013 — Resume intended premium action

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Top-up dimulai karena saldo kurang.

### When
Order approved.

### Then
UI menawarkan lanjut niat terakhir.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.

## AT-TOP-014 — Order expired tidak menerima proof normal

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order expired.

### When
User coba upload.

### Then
Ditolak/flow buat order baru.

### Bukti minimum
E2E + DB assertions.

### Catatan eksekusi
- Belum diisi.


# SUITE 19 — Payment Review & Settlement


## AT-PAY-001 — Payment proof tidak auto-approve dari AI

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Sentinel `likely_match`.

### When
Screening selesai.

### Then
Order tetap perlu human review.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-002 — Sentinel suspicious masih bisa Owner override

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Sentinel warning, bank mutasi confirmed.

### When
Owner approve manual.

### Then
Approval berhasil dengan override audit.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-003 — Dua admin approve bersamaan

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order under review.

### When
Dua reviewer approve concurrent.

### Then
Satu settlement, satu credit lot set.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-004 — Approve retry idempotent

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order sudah approved.

### When
Same operation retry.

### Then
No additional credit.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-005 — Approval DB failure rollback

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Simulate failure mid transaction.

### When
Approve.

### Then
Order/ledger/wallet tidak partial.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-006 — Wrong amount manual override audited

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Expected berbeda actual.

### When
Owner confirm actual.

### Then
confirmed_amount + reason + audit.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-007 — Overpay tidak buat rupiah wallet

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
User transfer lebih.

### When
Approve package.

### Then
Hanya package credits; no invented cash balance.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-008 — Duplicate proof fingerprint flag

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Proof sama dipakai order lain.

### When
Upload/screen.

### Then
Flag review, tidak auto-ban.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-009 — Rejected proof retained bounded

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order rejected.

### When
Retention berjalan.

### Then
Proof ada selama dispute period lalu cleanup.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-010 — Approved proof cleanup

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Order approved.

### When
Cleanup time tercapai.

### Then
Object removed; fingerprint/min metadata sesuai policy.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-011 — Finance approval audited

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Finance berpermission approve.

### When
Approve.

### Then
Actor/decision tercatat.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-012 — Support tidak bisa approve

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Support login.

### When
Call approve endpoint.

### Then
Denied.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-013 — Internal Owner test excluded revenue

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Owner internal test order.

### When
Approve.

### Then
Credits flow real; revenue aggregate excludes flagged test.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-PAY-014 — User status tidak approved sebelum settlement

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `9`  
**Status:** `NOT_RUN`

### Given
Approval transaction belum commit.

### When
User fetch.

### Then
Tidak ada approved+missing-credit transient committed state.

### Bukti minimum
Concurrency/integration/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 20 — Referral / Affiliate


## AT-AFF-001 — Referral attribution satu primary

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
User signup melalui valid code.

### When
Attribution dibuat.

### Then
Satu attribution aktif.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-002 — Signup saja tidak buat cash commission

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Referred user signup.

### When
No top-up.

### Then
No commission payout value.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-003 — Approved qualifying top-up buat pending commission

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Referred top-up approved.

### When
Qualification.

### Then
Commission pending/review dibuat sekali.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-004 — Retry settlement tidak duplicate commission

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Order qualification retry.

### When
Function dipanggil dua kali.

### Then
Satu commission.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-005 — Self referral tidak qualifying jika policy melarang

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
User memakai code sendiri.

### When
Top-up approved.

### Then
No commission, top-up user tetap valid.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-006 — Paused affiliate tidak hilang history

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Affiliate paused.

### When
Dashboard/history.

### Then
History tetap; new capability sesuai pause.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-007 — Affiliate tidak lihat payment details referral

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Affiliate dashboard.

### When
Inspect conversion.

### Then
Hanya aggregate/status minimum.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.

## AT-AFF-008 — Commission paid tidak editable menjadi hilang

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Commission paid.

### When
Admin correction.

### Then
History append/status trace, bukan erase.

### Bukti minimum
Partner integration.

### Catatan eksekusi
- Belum diisi.


# SUITE 21 — Reseller / Voucher


## AT-RES-001 — Distribution wallet terpisah personal

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Reseller active.

### When
Balances dibuka.

### Then
Personal credit dan distribution tidak bercampur.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-002 — Voucher tidak bisa melebihi distribution

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Distribution 10.

### When
Create voucher 20.

### Then
Denied.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-003 — Voucher reserve value atomik

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Distribution cukup.

### When
Voucher dibuat concurrent.

### Then
No over-commit.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-004 — Single-use voucher concurrent redeem

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Voucher 1 use.

### When
Dua user redeem bersamaan.

### Then
Satu sukses.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-005 — Voucher redemption buat user credit lot

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Valid voucher.

### When
Redeem.

### Then
Credit lot + ledger user dibuat.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-006 — Expired voucher ditolak

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Voucher expired.

### When
Redeem.

### Then
Denied cleanly.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-007 — Paused reseller tidak create voucher

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Membership paused.

### When
Create voucher.

### Then
Denied.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.

## AT-RES-008 — External resale price tidak mencemari accounting

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Reseller menjual eksternal.

### When
Jejak voucher flow.

### Then
Jejak hanya accounting distribution/value.

### Bukti minimum
Concurrency/partner tests.

### Catatan eksekusi
- Belum diisi.


# SUITE 22 — Mitra / Workspace


## AT-MIT-001 — Mitra application owner review

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
User apply.

### When
Owner approve.

### Then
Membership active.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-002 — Mitra tidak butuh KTP default

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
User apply.

### When
Form dibuka.

### Then
No mandatory KTP/NIK.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-003 — Client created in workspace only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Mitra active.

### When
Create client.

### Then
Client scoped workspace.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-004 — Workspace A/B strict isolation

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Dua Mitra.

### When
A query B.

### Then
Denied.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-005 — Mitra Case linked client

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Client exists.

### When
Create Case.

### Then
Case workspace/client ownership benar.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-006 — Partner freeze tidak block user mode

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Mitra paused.

### When
User buka normal Jejak.

### Then
User features normal tetap sesuai account status.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-007 — Freeze tidak delete Case

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
Mitra punya cases.

### When
Membership paused.

### Then
Data tetap.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-MIT-008 — Team foundation no shared account

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `11`  
**Status:** `NOT_RUN`

### Given
V1.5 membership test.

### When
Tambah member.

### Then
Identity per Google account, bukan shared credential.

### Bukti minimum
Workspace RLS/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 23 — Jejak Gue


## AT-JG-001 — Jejak Gue bukan profile page

**Severity:** `P3`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User buka tab.

### When
UI render.

### Then
Primary content exposure/action, bukan biodata.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-JG-002 — Paparan score punya explanation

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Exposure assessment ada.

### When
User tap.

### Then
Meaning + evidence context terlihat.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-JG-003 — Mark sudah diamankan tidak menghapus evidence

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User punya action.

### When
Tandai aman.

### Then
Remediation state berubah; source evidence tetap.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-JG-004 — Breach timeline kosong jujur

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
No valid breach source.

### When
Jejak Gue.

### Then
Tidak fabricate event.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-JG-005 — Password exposure shortcut ada

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User buka Jejak Gue.

### When
UI.

### Then
Entry feature dapat ditemukan.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.

## AT-JG-006 — Action recommendation tidak fear-based

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Risk signal tinggi.

### When
UI.

### Then
Action praktis, tidak sensational.

### Bukti minimum
UI/result QA.

### Catatan eksekusi
- Belum diisi.


# SUITE 24 — Privacy / Retention / Deletion


## AT-PRIV-001 — Data & Privasi menjelaskan storage

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User buka privacy.

### When
UI.

### Then
Plain Indonesian explanation.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-002 — Case trash recovery 3 hari seed

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Normal Case deleted.

### When
Within window restore.

### Then
Works.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-003 — Hard delete removes storage child

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Case with attachment hard-delete.

### When
Cleanup complete.

### Then
DB + Storage gone.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-004 — Account delete warns active credit

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User has credits.

### When
Start delete.

### Then
Warning exact consequence.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-005 — User boleh lanjut delete dengan credit

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Warning shown.

### When
Confirm.

### Then
Deletion proceeds per policy.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-006 — Shared ownership blocking handled

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User sole owner workspace/shared case.

### When
Delete account.

### Then
Flow meminta resolve ownership, tidak orphan.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-007 — Financial/audit minimum preserved safely

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Account deleted after payments.

### When
Cleanup.

### Then
Required ledger/audit retained with minimized identity.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-008 — Export tidak berisi internal abuse score

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User export.

### When
Artifact inspected.

### Then
Internal security/admin-only fields excluded.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-009 — Export temporary artifact expires

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Export generated.

### When
Expiry passed.

### Then
File cleaned.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-010 — Deletion job retry idempotent

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Cleanup fails first.

### When
Retry.

### Then
No duplicate corruption; eventually clean.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-011 — Proof retention tidak jadi forever

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Approved/rejected proof fixtures.

### When
Retention jobs.

### Then
Lifecycle sesuai config.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.

## AT-PRIV-012 — Technical logs bounded

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Old log beyond retention.

### When
Cleanup.

### Then
Raw logs removed/aggregates retained if intended.

### Bukti minimum
DB/Storage/job tests.

### Catatan eksekusi
- Belum diisi.


# SUITE 25 — Safe Share


## AT-SHARE-001 — Safe share pakai sanitized snapshot

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Case punya sensitive data.

### When
Share dibuat.

### Then
Payload tidak raw Case.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-002 — Token high entropy/hash lookup

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Share created.

### When
DB inspected.

### Then
Raw public token tidak disimpan sebagai plain lookup secret jika design hash.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-003 — Share preview wajib

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
User tap share.

### When
Before publish.

### Then
Preview tampil.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-004 — Sensitive identifier masked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Case punya email/phone.

### When
Share dibuka anon.

### Then
Sensitive fields masked/omitted.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-005 — Secret Case stricter

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Secret Case.

### When
Share attempt.

### Then
Disabled atau explicit strong safe flow with no target leak.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-006 — Revoked share tidak accessible

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Share revoked.

### When
Public link opened.

### Then
Unavailable.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.

## AT-SHARE-007 — Expired share tidak accessible

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `12`  
**Status:** `NOT_RUN`

### Given
Share expired.

### When
Open.

### Then
Unavailable.

### Bukti minimum
Public endpoint/security tests.

### Catatan eksekusi
- Belum diisi.


# SUITE 26 — PWA / Version Sentinel


## AT-PWA-001 — Manifest valid

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Production build.

### When
Manifest inspected.

### Then
Name/icons/display/start_url valid.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-002 — Android/Brave install flow

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Installable environment.

### When
Tap Pasang Jejak.

### Then
Native/browser install flow correct.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-003 — iOS guidance when no install prompt

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Safari iPhone.

### When
Tap Pasang Jejak.

### Then
Device-specific guidance, no fake prompt.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-004 — Installed app standalone shell

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
PWA installed.

### When
Launch icon.

### Then
Standalone app usable.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-005 — New version detected

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Old PWA open after deploy.

### When
Version Sentinel checks.

### Then
Update prompt appears.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-006 — Non-critical update controlled

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Update available.

### When
User delays.

### Then
Safe usage continues where compatible.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-007 — Critical minimum version enforced

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Client below minimum.

### When
Sensitive operation.

### Then
Blocked with update UI.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-008 — Update restores safe intent

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
User in Case before update.

### When
Apply update.

### Then
Returns near same Case/workspace.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-009 — Update during upload waits safely

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Upload in progress.

### When
Update detected.

### Then
No data loss; update delayed/handled.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-010 — Service worker tidak cache wallet authority

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Wallet changed server-side.

### When
PWA reload offline/online.

### Then
Stale cache tidak dianggap transaction truth.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-011 — Segarkan tidak full-cache purge

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
App open.

### When
Tap Segarkan.

### Then
Targeted sync.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.

## AT-PWA-012 — User tidak perlu clear cache normal update

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13`  
**Status:** `NOT_RUN`

### Given
Repeated releases.

### When
Update path.

### Then
Works without manual cache clearing.

### Bukti minimum
PWA E2E + real-device evidence where required.

### Catatan eksekusi
- Belum diisi.


# SUITE 27 — Offline / Realtime / Multi-device


## AT-NET-001 — Internet putus setelah scan start

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Scan reserved/running.

### When
Client offline.

### Then
Server continues; UI explains.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-002 — Reconnect fetches final scan

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Scan finished while offline.

### When
Reconnect.

### Then
Result status sync.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-003 — Realtime payment event missed

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Realtime disabled.

### When
Order approved.

### Then
Refresh/polling recovers.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-004 — Two devices credit truth

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Both show 30 credits.

### When
Device A spend 20, B tries 20.

### Then
B denied/current 10.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-005 — Two devices pricing edit conflict

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Owner devices open same config.

### When
A saves then B saves stale version.

### Then
B gets conflict, no overwrite.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-006 — Realtime channel tidak broadcast secret

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Payment/Case event emitted.

### When
Payload inspected.

### Then
Only minimal safe refs/status.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-007 — Offline paid action not queued blindly

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
User offline.

### When
Tap start paid scan.

### Then
No local phantom debit/unsafe queued duplicate.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.

## AT-NET-008 — Old result safe cached read policy

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `13/16`  
**Status:** `NOT_RUN`

### Given
Offline and old safe result cached.

### When
Open.

### Then
Only policy-approved data visible.

### Bukti minimum
E2E/network simulation.

### Catatan eksekusi
- Belum diisi.


# SUITE 28 — Brave / Safari / Motion


## AT-BR-001 — Brave Android core flow

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Brave Android real.

### When
Login→Case→scan flow.

### Then
Usable.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-BR-002 — Brave Desktop core flow

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Brave desktop.

### When
Core flow.

### Then
Usable.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-BR-003 — Reduced motion tetap ada feedback

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
prefers-reduced-motion.

### When
Interact buttons/result.

### Then
Micro-feedback remains, large motion reduced.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-BR-004 — State tidak bergantung animationend

**Severity:** `P0`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Animations disabled/throttled.

### When
Complete transitions.

### Then
Business/UI state still completes.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-BR-005 — Haptic unavailable no error

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Browser no vibration.

### When
Tap tactile control.

### Then
Visual feedback works, no console spam.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-BR-006 — WebGL unavailable graph fallback

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Disable WebGL.

### When
Open graph.

### Then
Usable fallback.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-001 — Safari iPhone real login

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Real iPhone Safari.

### When
Login.

### Then
Works.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-002 — Safari iPhone PWA install

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Real iPhone.

### When
Add to Home Screen.

### Then
Standalone works.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-003 — Safari safe-area

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
iPhone notch/home indicator.

### When
Open installed PWA.

### Then
No overlap.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-004 — Safari keyboard search

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Real iPhone.

### When
Focus Search Console.

### Then
Input/CTA remain usable.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-005 — Safari PWA update

**Severity:** `P1`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Installed old PWA.

### When
Deploy new.

### Then
Version Sentinel flow works.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.

## AT-SAF-006 — Safari status tidak dipalsukan

**Severity:** `P0`  
**Mode:** `REAL_DEVICE`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
No real Safari device available.

### When
QA report.

### Then
Marked NOT_AVAILABLE, never PASS.

### Bukti minimum
Device/browser QA evidence.

### Catatan eksekusi
- Belum diisi.


# SUITE 29 — Admin / Ruang Kendali


## AT-ADM-001 — Owner entry server-protected

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Normal user tahu route.

### When
Open Ruang Kendali.

### Then
Denied.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-002 — Owner Ringkasan actionable

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner login.

### When
Open Ringkasan.

### Then
Prioritas action, bukan chart wall.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-003 — Owner ubah harga tanpa redeploy

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner permission.

### When
Change package/scan price.

### Then
User UI fresh config setelah sync.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-004 — Owner ubah rekening tanpa redeploy

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner permission.

### When
Change primary bank.

### Then
New orders use new method.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-005 — Old pending order survives bank disable

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Order lama pending.

### When
Bank disabled.

### Then
Order snapshot tetap valid.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-006 — Owner grant credit audited

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner grants.

### When
Confirm.

### Then
Ledger + audit.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-007 — Large grant stronger confirmation

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Grant besar.

### When
Submit.

### Then
Additional friction/preview.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-008 — Role change audited

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner assigns Finance.

### When
Save.

### Then
Role history/audit.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-009 — Permission Simulator no real mutation

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Owner enters preview Finance.

### When
Clicks action.

### Then
No actual privileged business mutation.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-010 — Owner Inbox read != resolved

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Action item open.

### When
Owner opens it.

### Then
Status remains open until resolved.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-011 — Mobile payment approve friction

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Admin mobile.

### When
Approve.

### Then
Accidental single tap mitigated.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.

## AT-ADM-012 — Admin panel no page scroll

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10`  
**Status:** `NOT_RUN`

### Given
Long payment queue.

### When
Scroll.

### Then
Internal region only.

### Bukti minimum
Admin E2E + DB audit.

### Catatan eksekusi
- Belum diisi.


# SUITE 30 — Source Registry / Feature Flags / Maintenance


## AT-SYS-001 — Source toggle without deploy

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Source active.

### When
Owner pause.

### Then
Subsequent scan skips source.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-002 — Source experimental Owner only

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Experimental source.

### When
Normal user scan.

### Then
Not called.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-003 — Feature flag UI + server

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Feature off.

### When
Direct endpoint attempt.

### Then
Denied.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-004 — Canary Owner only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Flag owner audience.

### When
Owner/non-owner compare.

### Then
Only Owner eligible.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-005 — Maintenance AI only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
AI disabled.

### When
App used.

### Then
Case/wallet/payment read still works.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-006 — Maintenance scan only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Scans disabled.

### When
Old result opened.

### Then
Read works; new scan blocked.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-007 — Maintenance top-up only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Top-up disabled.

### When
Wallet opened.

### Then
Wallet/history works; new order blocked.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-008 — Emergency protection activates without deploy

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Owner turns protection on.

### When
Traffic/actions.

### Then
Configured stricter limits active.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-009 — Emergency protection doesn't lock owned safe data

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Protection on.

### When
User opens own old Case.

### Then
Safe read remains if policy.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.

## AT-SYS-010 — Config stale version conflict

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `10/15`  
**Status:** `NOT_RUN`

### Given
Two edits.

### When
Stale save.

### Then
Conflict response.

### Bukti minimum
Integration/E2E.

### Catatan eksekusi
- Belum diisi.


# SUITE 31 — Observability / NADI


## AT-OBS-001 — Unhandled internal error dapat JX code

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Server error fixture.

### When
User action.

### Then
Human copy + JX code.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-002 — Error event tidak simpan secret

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Error terjadi pada provider call.

### When
Error row/log inspected.

### Then
No key/auth header/raw password.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-003 — Repeated errors aggregated

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Same error 100x.

### When
Admin Pusat Masalah.

### Then
Grouped actionable incident.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-004 — Source outage terlihat human-first

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
RDAP down fixture.

### When
System Health.

### Then
Owner sees affected source/impact.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-005 — Cleanup failure terlihat

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Deletion job fail.

### When
Admin health/NADI.

### Then
Alert actionable.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-006 — Performance regression segmented browser

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Brave slow metric fixture.

### When
Analytics.

### Then
Owner can see segment.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-007 — NADI revenue excludes internal tests

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Revenue + internal test data.

### When
Ask NADI cuan.

### Then
Uses valid aggregate.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-008 — NADI payment pending count benar

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Known queue fixture.

### When
Ask.

### Then
Count matches DB aggregate.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-009 — NADI source issue links to relevant admin area

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
Source degraded.

### When
NADI brief.

### Then
Navigation/action reference works.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.

## AT-OBS-010 — User issue report safe diagnostics

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14`  
**Status:** `NOT_RUN`

### Given
User report error.

### When
Payload inspected.

### Then
No full Case/secret/token auto-attached.

### Bukti minimum
Ops integration + dashboard QA.

### Catatan eksekusi
- Belum diisi.


# SUITE 32 — Security & Abuse


## AT-SEC-001 — IDOR random Case ref denied

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Attacker authenticated.

### When
Enumerate refs.

### Then
No data.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-002 — Mass role field injection ignored

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
User submits extra role/status fields.

### When
Profile update.

### Then
Sensitive fields unchanged.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-003 — Mass credit field injection ignored

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
User sends credit-like field.

### When
Mutation.

### Then
No wallet change.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-004 — Upload extension mismatch rejected/normalized

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Malicious file named .jpg.

### When
Upload.

### Then
Actual bytes validated.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-005 — Oversized upload blocked before expensive processing

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Huge file.

### When
Upload.

### Then
Rejected early.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-006 — Decompression/image bomb bounded

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Crafted image fixture.

### When
Decode.

### Then
Resource limits prevent crash.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-007 — XSS via evidence title blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Evidence has script payload.

### When
Render.

### Then
Escaped/sanitized.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-008 — XSS via AI output blocked

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
AI returns script.

### When
Render.

### Then
No execute.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-009 — Safe share token brute-force resistant

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Attacker guesses tokens.

### When
Requests.

### Then
Entropy/rate prevents practical enumeration.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-010 — Abnormal scan velocity state progression

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
User simulates suspicious enumeration.

### When
Governor evaluates.

### Then
Observed/limited etc, not automatic irreversible ban from one minor signal.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-011 — Clearly malicious request can block immediately

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Known malicious pattern fixture.

### When
Request.

### Then
Block according policy.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-012 — Credit-rich user still rate governed

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
User punya banyak credit.

### When
Fire thousands concurrent.

### Then
Provider/app concurrency limits enforced.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-013 — Preview deployment protected

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Preview URL public internet.

### When
Anonymous access.

### Then
Protected according deployment policy.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-014 — CSP/security headers baseline

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Production response.

### When
Headers inspected.

### Then
Reasonable security headers configured.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.

## AT-SEC-015 — No open generic admin RPC

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `15`  
**Status:** `NOT_RUN`

### Given
Attacker enumerates RPC.

### When
Try `set_credit`/generic mutation style.

### Then
No unsafe generic operation exists.

### Bukti minimum
Security integration/scanner/manual review.

### Catatan eksekusi
- Belum diisi.


# SUITE 33 — Performance


## AT-PERF-001 — Search Console interactive cepat setelah shell

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Healthy mid-range target.

### When
Cold load.

### Then
Search becomes usable within agreed budget/measurement.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-002 — Warm nav visual switch cepat

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Workspace warmed.

### When
Switch nav.

### Then
Target <~100ms visual where healthy.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-003 — Panel opens locally

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
App loaded.

### When
Open Dompet/Kabar.

### Then
Panel shell opens without waiting network.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-004 — Case list no N+1

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
50 Case fixtures.

### When
Open list.

### Then
Query count bounded.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-005 — Evidence detail lazy

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Case with 500 evidence.

### When
Open Case summary.

### Then
Does not fetch all detail.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-006 — Payment queue no proof preload

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
100 proof orders.

### When
Admin queue.

### Then
Image bytes not fetched until detail.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-007 — Graph 300 nodes progressive

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Large fixture.

### When
Open graph.

### Then
No UI freeze from full initial render.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-008 — Heavy chart lazy

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Admin analytics.

### When
Open Ringkasan.

### Then
Chart libs not block core shell.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-009 — Decorative effects degrade under load

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
CPU throttled.

### When
Use app.

### Then
Core feedback remains; luxury effect reduced.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.

## AT-PERF-010 — Realtime subscriptions selective

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
App navigates contexts.

### When
Inspect connections/subscriptions.

### Then
No global subscribe-all tables.

### Bukti minimum
Profiler/query count/browser timing.

### Catatan eksekusi
- Belum diisi.


# SUITE 34 — Accessibility


## AT-A11Y-001 — Keyboard primary nav

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Desktop.

### When
Use keyboard only.

### Then
Primary nav reachable.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-002 — Visible focus

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Keyboard.

### When
Tab through controls.

### Then
Focus visible.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-003 — Dialog focus management

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Open confirm.

### When
Keyboard.

### Then
Focus trapped/returned appropriately.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-004 — Status tidak warna-only

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Risk/payment state.

### When
View grayscale/assistive.

### Then
Text/icon semantics remain.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-005 — Touch target adequate

**Severity:** `P2`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Mobile.

### When
Inspect key controls.

### Then
Usable touch size.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-006 — Reduced motion respected

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
OS reduce motion on.

### When
App.

### Then
Large motion reduced.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-007 — Form error associated field

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Invalid input.

### When
Submit.

### Then
Error accessible/near field.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.

## AT-A11Y-008 — SVG actionable punya label

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `16`  
**Status:** `NOT_RUN`

### Given
Icon-only controls.

### When
Screen reader semantics.

### Then
Accessible name present.

### Bukti minimum
Accessibility tooling + manual keyboard.

### Catatan eksekusi
- Belum diisi.


# SUITE 35 — Analytics


## AT-AN-001 — Analytics tidak kirim raw identifier

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Scan email/phone.

### When
Inspect events.

### Then
No raw target.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-002 — Login funnel event urut

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Test user flow.

### When
Complete login.

### Then
Semantic events reasonable.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-003 — Top-up funnel approved event satu kali

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Order approved retry.

### When
Analytics.

### Then
One business approved event logically.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-004 — Internal test excluded revenue

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Internal test order.

### When
Daily metric.

### Then
Excluded.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-005 — Refund reflected credit metrics

**Severity:** `P2`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Refund scan.

### When
Aggregate.

### Then
Usage/refund metrics consistent.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-006 — Secret Case title tidak analytics

**Severity:** `P0`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Secret Case.

### When
Navigate.

### Then
Title/identifier absent event payload.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-007 — PWA version observation privacy-safe

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Client reports.

### When
DB.

### Then
Only coarse browser/version/PWA mode.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.

## AT-AN-008 — NADI digest can reproduce dashboard totals

**Severity:** `P1`  
**Mode:** `AUTO`  
**Roadmap Phase:** `14/16`  
**Status:** `NOT_RUN`

### Given
Known aggregate fixtures.

### When
Generate digest.

### Then
Key totals align source metrics.

### Bukti minimum
Event payload/aggregate assertions.

### Catatan eksekusi
- Belum diisi.


# SUITE 36 — Handoff / Agent Continuity


## AT-HAND-001 — STATUS_PROJECT exists

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Project implementation started.

### When
Fresh agent takeover.

### Then
Status file tersedia.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-002 — DECISIONS exists

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Project implementation started.

### When
Fresh agent takeover.

### Then
Decision file tersedia.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-003 — STATUS punya Current Phase

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Handoff.

### When
Read status.

### Then
Phase jelas.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-004 — STATUS punya Next Safe Action

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Handoff.

### When
Read.

### Then
Next step spesifik.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-005 — STATUS punya migration head

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
DB sudah ada migration.

### When
Handoff.

### Then
Head jelas.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-006 — STATUS punya test state

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
QA sudah berjalan.

### When
Handoff.

### Then
Pass/fail/not available jelas.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-007 — DECISIONS menyimpan significant deviation

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Agent memilih queue/library penting.

### When
Handoff.

### Then
Decision tercatat.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-008 — Agent baru tidak perlu full reread

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Status lengkap.

### When
Takeover simulation.

### Then
Agent dapat lanjut dari relevant sections.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-009 — Global skills dicek fresh session

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
New agent session.

### When
Startup.

### Then
Skill check dilakukan sebelum reinstall.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-010 — Agent communication lo/gue

**Severity:** `P3`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Agent milestone selesai.

### When
Update user.

### Then
Bahasa Indonesia gaul natural, bukan corporate.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-011 — Agent tidak tanya mau lanjut bila next action jelas

**Severity:** `P2`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Milestone selesai dan autonomous mode.

### When
Agent response.

### Then
Agent continue/announce, tidak minta izin rutin.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.

## AT-HAND-012 — Before limit end state diselamatkan

**Severity:** `P1`  
**Mode:** `MANUAL`  
**Roadmap Phase:** `0-18`  
**Status:** `NOT_RUN`

### Given
Agent akan berhenti.

### When
Handoff.

### Then
Commit/test/status/decision/next action tersedia.

### Bukti minimum
Handoff review.

### Catatan eksekusi
- Belum diisi.


# SUITE 37 — Production / Launch


## AT-LAUNCH-001 — Production build hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Build.

### Then
Success.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-002 — Typecheck hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Typecheck.

### Then
Success.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-003 — Lint critical hijau

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Lint.

### Then
No blocking issue.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-004 — Migrations fresh DB hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Clean Supabase test DB.

### When
Apply all migrations.

### Then
Success.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-005 — Migrations current DB hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Pre-RC DB state.

### When
Upgrade.

### Then
Success no data corruption.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-006 — RLS critical suite hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Run RLS suite.

### Then
All P0 pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-007 — Ledger concurrency hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Run credit suite.

### Then
All P0 pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-008 — Payment double-approval hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Run.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-009 — Secret scan hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC Git/client.

### When
Scan.

### Then
No active secret.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-010 — Private Storage hijau

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Run storage negative tests.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-011 — PWA update flow hijau supported matrix

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Version test.

### Then
Pass where device available.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-012 — Brave core hijau

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Real Brave.

### When
Smoke.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-013 — Safari real status jujur

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
RC.

### When
Review status.

### Then
PASS only if real tested, else NOT_AVAILABLE.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-014 — Owner canary payment flow

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Production-like internal order.

### When
End-to-end.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-015 — Owner can change bank without deploy

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Production config.

### When
Change test.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-016 — Emergency protection tested

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Production/preview.

### When
Toggle test.

### Then
Pass.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-017 — No P0/P1 open

**Severity:** `P0`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
Launch decision.

### When
Review issue list.

### Then
Zero unresolved P0/P1.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

## AT-LAUNCH-018 — STATUS final snapshot lengkap

**Severity:** `P1`  
**Mode:** `HYBRID`  
**Roadmap Phase:** `17-18`  
**Status:** `NOT_RUN`

### Given
V1 ready.

### When
Handoff.

### Then
URL/version/migration/sources/known issues/QA recorded.

### Bukti minimum
Release checklist evidence.

### Catatan eksekusi
- Belum diisi.

# 3. CROSS-SUITE CRITICAL GATES

## Gate AUTHORIZATION

Tidak boleh lolos jika salah satu gagal:
- `AT-RLS-002`
- `AT-RLS-004`
- `AT-RLS-009`
- `AT-RLS-014`
- `AT-STOR-003`
- `AT-CASE-012`
- `AT-SEC-001`

---

## Gate CREDIT

Tidak boleh menjalankan paid scan production jika gagal:
- `AT-CREDIT-003`
- `AT-CREDIT-004`
- `AT-CREDIT-005`
- `AT-CREDIT-006`
- `AT-CREDIT-007`
- `AT-CREDIT-009`
- `AT-CREDIT-018`
- `AT-EXP-001`
- `AT-EXP-002`
- `AT-EXP-003`

---

## Gate PAYMENT

Top-up production harus off jika gagal:
- `AT-PAY-001`
- `AT-PAY-003`
- `AT-PAY-004`
- `AT-PAY-005`
- `AT-PAY-012`
- `AT-PAY-014`
- `AT-STOR-001`

---

## Gate EVIDENCE TRUTH

Tidak boleh menyebut evidence engine production-ready jika gagal:
- `AT-EV-001`
- `AT-EV-002`
- `AT-EV-004`
- `AT-EV-005`
- `AT-AI-002`
- `AT-AI-004`
- `AT-GRAPH-001`
- `AT-GRAPH-002`

---

## Gate PWA

Jangan menyebut PWA selesai jika gagal:
- `AT-PWA-001`
- `AT-PWA-004`
- `AT-PWA-005`
- `AT-PWA-007`
- `AT-PWA-010`
- `AT-PWA-012`

Safari real-device tetap status terpisah.

---

## Gate SECRET SAFETY

Tidak boleh deploy jika gagal:
- `AT-BOOT-001`
- `AT-BOOT-003`
- `AT-BOOT-004`
- `AT-BOOT-005`
- `AT-GIT-006`
- `AT-LAUNCH-009`

---

# 4. CANONICAL E2E FLOWS

Acceptance individual belum cukup. Flow berikut harus dites sebagai rangkaian.

## FLOW E2E-01 — First User

```text
Landing
→ Google Login
→ Profile initialized
→ Onboarding
→ Cek Data Gue
→ First sponsored scan
→ Result reveal
→ Evidence
→ Save to Case
```

Expected:
- no duplicate benefit;
- no unexpected credit debit;
- no English system leakage;
- result honest.

---

## FLOW E2E-02 — Fraud Check → Paid Upgrade

```text
Beranda
→ Input domain/username
→ Cek dugaan penipuan
→ Cek Cepat
→ Result
→ Upgrade Analisis Gabungan
→ Credit quote
→ Reserve
→ Scan
→ Graph
→ Evidence
```

Expected:
- upgrade difference;
- no double charge;
- risk ≠ verdict.

---

## FLOW E2E-03 — Insufficient Credit → Top-up → Resume

```text
Premium action
→ Saldo kurang
→ Dompet
→ Pilih Proteksi
→ Order
→ Transfer test
→ Proof
→ Owner approve
→ Wallet update
→ Resume intended action
```

Ini monetization E2E **P1**.

---

## FLOW E2E-04 — Owner Daily Ops Mobile

```text
Owner User Mode
→ Ruang Kendali
→ Owner Inbox
→ Payment pending
→ Proof
→ Manual bank confirmation
→ Approve
→ Audit
→ Kembali sebagai Pengguna
```

Wajib mobile-friendly.

---

## FLOW E2E-05 — Case Investigation

```text
Create Case
→ Add domain
→ Add username
→ Scan
→ Evidence
→ Relationship suggestion
→ User accepts/rejects
→ Contradiction
→ Timeline
→ Safe Share
```

---

## FLOW E2E-06 — PWA Lifecycle

```text
Browser
→ Install
→ Standalone launch
→ Use app
→ Deploy new version
→ Sentinel detects
→ Update
→ Resume workspace
```

---

## FLOW E2E-07 — Offline Scan

```text
Start scan
→ Reserve credit
→ Network off
→ Close PWA
→ Server finishes
→ Reopen
→ Sync result
```

No duplicate.

---

## FLOW E2E-08 — Account Deletion

```text
User has Case + attachment + credit
→ Data & Privasi
→ Delete account
→ Credit warning
→ Confirm
→ Cleanup jobs
→ Storage cleanup
→ auth/session closure
→ retained minimal ledger/audit
```

---

## FLOW E2E-09 — Mitra Isolation

```text
Mitra A
→ Client A
→ Case A

Mitra B
→ attempts Case A
```

Expected:
> hard deny.

---

## FLOW E2E-10 — Emergency Protection

```text
Abnormal traffic
→ Owner activates Proteksi Darurat
→ New expensive work restricted
→ Safe user reads still work
→ Incident handled
→ Owner disables
```

---

# 5. COPY ACCEPTANCE

Global search pada user-facing strings wajib mencari leakage seperti:

- `Loading...`
- `Submit`
- `Cancel`
- `Retry`
- `Unauthorized`
- `Internal Server Error`
- `Pending`
- `Success`
- `Failed`

Provider/admin technical names boleh tetap jika memang context teknis.

User-facing copy:
> Indonesia.

Agent update ke Product Owner:
> bahasa Indonesia gaul `lo/gue`.

Produk:
> tidak menggunakan emoji sebagai visual utama.

---

# 6. NO-CLAIM TESTS

Agent wajib punya assertion/QA bahwa Jejak tidak mengatakan:

> “Aman”

hanya karena no-result.

Tidak mengatakan:
> “Penipu”

sebagai verdict Jejak.

Tidak mengatakan:
> “Pemilik nomor adalah X”

hanya dari phone validation.

Tidak mengatakan:
> “Bisnis berdiri sejak X”

hanya dari domain registration.

Tidak mengatakan:
> “Password pasti aman”

karena HIBP no match.

Tidak mengatakan:
> “Kami cek 97 database”

jika tidak benar.

---

# 7. TEST ENVIRONMENT MATRIX

Minimal:

| Environment | Wajib |
|---|---|
| Local dev | Ya |
| Preview deployment | Ya |
| Supabase test/staging equivalent | Ya bila tersedia |
| Production canary | Ya |
| Brave Android real | Ya sebelum broad launch |
| Brave Desktop | Ya |
| Chrome Android/Desktop | Ya |
| Safari iPhone real | Status wajib jujur |
| iOS PWA real | Status wajib jujur |
| Edge | Ya |
| Firefox | Ya |

---

# 8. NETWORK MATRIX

Run representative E2E under:
- normal connection;
- throttled;
- offline before action;
- offline after action;
- reconnect;
- provider timeout;
- realtime down.

---

# 9. USER ROLE MATRIX

Test accounts:
- Free User
- Power User
- Affiliate
- Reseller
- Mitra
- Support
- Finance
- Admin
- Owner

Setiap role:
- positive capability;
- negative capability.

Negative capability lebih penting daripada sekadar menu hidden.

---

# 10. PAYMENT STATE MATRIX

Test:
- awaiting proof;
- proof submitted;
- under review;
- needs new proof;
- approved;
- rejected;
- expired.

For each:
- user UI;
- admin UI;
- mutation allowed;
- mutation denied;
- cleanup.

---

# 11. CREDIT STATE MATRIX

Test wallet:
- zero;
- one;
- enough;
- multiple lots;
- expiring;
- grace;
- reserved;
- expired;
- promo;
- paid;
- admin compensation.

---

# 12. CASE STATE MATRIX

Test:
- normal;
- secret;
- empty;
- rich evidence;
- large graph;
- trashed;
- collaboration viewer;
- contributor;
- Mitra client.

---

# 13. SOURCE STATE MATRIX

Test each adapter:
- success;
- no result;
- invalid input;
- timeout;
- HTTP error;
- malformed payload;
- budget limited;
- paused;
- experimental;
- recovery.

---

# 14. AI STATE MATRIX

- success;
- timeout;
- malformed response;
- empty answer;
- unsafe markup;
- hallucinated fact;
- prompt injection evidence;
- all AI down;
- sensitive context denied;
- included allowance;
- paid extra work.

---

# 15. PWA CACHE MATRIX

### Aggressive static
- icons;
- fonts;
- shell assets.

### Cache + revalidate
- safe old Case summaries/history.

### Server authoritative
- wallet;
- role;
- payment;
- block status;
- entitlement.

### Do not casually persist
- payment proof;
- secret Case data;
- raw provider secret;
- password.

Acceptance:
> inspect actual service worker/cache behavior, bukan hanya konfigurasi yang “kelihatannya benar”.

---

# 16. DATABASE INVARIANT ASSERTIONS

Automated test suite harus dapat memverifikasi:

```text
available_credits >= 0
reserved_credits >= 0
one wallet per user
one settlement per topup
one hold per scan
one idempotent mutation effect
one qualifying commission per source order
no voucher over-redemption
no distribution negative
approved payment => settlement exists
unapproved payment => settlement absent
```

Jika cached wallet dapat direconcile:
> reconciliation test wajib.

---

# 17. STORAGE INVARIANT ASSERTIONS

```text
private bucket != public
case attachment requires parent access
payment proof requires purpose permission
signed URL short-lived
deleted object actually absent
orphan cleanup retryable
```

---

# 18. RELEASE EVIDENCE PACK

Sebelum V1 launch, STATUS harus menunjuk bukti:

- build;
- commit;
- migration head;
- RLS suite;
- ledger suite;
- payment concurrency;
- secret scan;
- PWA update;
- Brave evidence;
- Safari status;
- Owner canary;
- known issues.

Tidak perlu memasukkan raw log besar ke STATUS.
Cukup pointer/ringkasan.

---

# 19. BUG REOPEN RULE

Jika test yang sudah PASS kemudian regression:
> status test kembali FAIL.

Jangan mempertahankan hijau historis.

`Last Verified` penting.

---

# 20. AUTOMATION PRIORITY

Prioritaskan otomatisasi untuk:
1. RLS;
2. ledger;
3. payment;
4. voucher;
5. source adapters;
6. AI grounding fixtures;
7. deletion jobs;
8. critical E2E.

Manual fokus:
- visual;
- tactile;
- real Safari;
- copy;
- PWA installation device-specific.

---

# 21. FLAKY TEST RULE

Flaky bukan PASS.

Agent:
1. reproduce;
2. cari sumber;
3. perbaiki;
4. baru green.

Dilarang:
> skip critical test karena flaky.

---

# 22. MOCK RULE

Mocks boleh untuk:
- provider timeout;
- malformed source;
- AI unsafe output;
- bank screening fixture.

Tetapi critical integration juga harus punya:
> test terhadap real implementation boundary yang memang bisa diuji.

Jangan mock sampai transaksi database atomik tidak pernah benar-benar diuji.

---

# 23. PRODUCTION-LIKE PAYMENT TEST

Karena V1 pembayaran manual:
> minimal satu internal test end-to-end harus benar-benar mengikuti jalur user.

Order test ditandai internal.

Revenue analytics:
> exclude.

Ledger/audit:
> tetap nyata.

---

# 24. FINAL DEFINITION OF DONE

Sebuah domain `DONE` bila:

- code implemented;
- migration applied jika relevant;
- positive test;
- negative test;
- failure test;
- idempotency/race test bila mutation bernilai;
- UI states;
- Indonesian copy;
- browser/device test relevant;
- performance check relevant;
- security check;
- STATUS updated;
- DECISIONS updated jika ada deviation.

---

# 25. FINAL V1 ACCEPTANCE RULE

V1 tidak boleh diberi status `PRODUCTION READY` jika:

- ada P0 fail;
- ada P1 fail;
- RLS negative suite incomplete;
- ledger race suite incomplete;
- payment approval race incomplete;
- secret scan incomplete;
- PWA update belum diuji;
- Owner belum bisa mengoperasikan payment/admin;
- deletion hanya menghapus metadata;
- AI failure mematikan core;
- source failure mematikan app;
- browser matrix tidak dilaporkan jujur.

Safari real-device boleh `NOT_AVAILABLE` pada development milestone,
tetapi status itu harus eksplisit dan tidak boleh disamarkan menjadi PASS.

---

# 26. HANDOFF ACCEPTANCE

Sebelum Agent berhenti karena limit:

**Given**
Agent akan pindah/habis sesi.

**When**
handoff dilakukan.

**Then**
Agent berikutnya cukup membaca:
1. STATUS;
2. DECISIONS;
3. ROADMAP phase;
4. relevant files;

dan dapat melanjutkan tanpa meminta Product Owner mengulang keseluruhan project.

Kalau agent berikutnya masih harus bertanya:
> “Sekarang harus ngapain?”

padahal tidak ada blocker baru,

maka handoff sebelumnya:
> **FAIL.**

---

# 27. PENUTUP

Acceptance test Jejak punya satu prinsip:

> **Bukti lebih penting daripada klaim Agent.**

Kalau test belum dilakukan:
> belum terbukti.

Kalau real device belum ada:
> belum divalidasi.

Kalau AI bilang aman:
> bukan bukti.

Kalau UI kelihatan selesai:
> belum tentu sistem selesai.

Kalau build hijau tapi User A bisa membaca Case User B:
> produk gagal.

Kalau desain keren tapi payment bisa double-credit:
> produk gagal.

Kalau Agent berpindah dan Agent berikutnya kehilangan konteks:
> workflow gagal.

Target akhir:

> **Jejak terasa premium di luar, tapi disiplin, aman, dan bisa dibuktikan di dalam.**

**END OF ACCEPTANCE TESTS**
