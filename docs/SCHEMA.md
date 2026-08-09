# SCHEMA — JEJAK

> **Status:** Kontrak data, Supabase, RLS, ledger, storage, transaction boundary, dan authorization untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Database:** Supabase Postgres  
> **Region project:** Singapore / `ap-southeast-1`  
> **Project ID:** `tauyicvfhpfnohhgccvn`  
> **Initial Owner:** `vadlyvldr@gmail.com`  
> **Repository target:** `https://github.com/vallendrino-vldr/JEJAK.git`  
> **Catatan:** Dokumen ini adalah blueprint schema. Agent Coding tetap membuat migration SQL yang rapi, terurut, reversible bila memungkinkan, dan diuji. Jangan menyalin secret mentah ke migration, source code, atau dokumentasi repo.

---

# 0. TUJUAN DOKUMEN

Dokumen ini memastikan Agent Coding tidak perlu “mendesain database sambil jalan”.

Schema Jejak harus dari awal mampu menangani:

- Google OAuth;
- user biasa dan Owner pada akun yang sama;
- multi-role / multi-entitlement;
- permission granular;
- RLS deny-by-default;
- Kasus pribadi;
- Kasus Mitra;
- kolaborasi Case di masa depan;
- entity dan Relationship Graph;
- Evidence Passport;
- timeline;
- contradiction;
- scan orchestration;
- source health;
- AI analysis;
- credit wallet;
- credit lot + expiry + grace;
- credit reservation;
- refund;
- upgrade bayar selisih;
- top-up manual transfer bank;
- screenshot pembayaran;
- Payment Sentinel;
- rekening yang dapat diubah Owner tanpa deploy;
- Affiliate;
- Reseller;
- Mitra;
- referral;
- voucher;
- campaign;
- feature flag;
- maintenance;
- incident;
- NADI;
- audit;
- access audit;
- logs;
- PWA versioning;
- deletion lifecycle;
- privacy export;
- analytics privacy-safe;
- V1.5 monitoring/collaboration tanpa redesign fundamental.

Schema harus **mendukung bisnis**, bukan sekadar membuat UI bisa menampilkan data.

---

# 1. HUKUM DATA JEJAK

## 1.1 Deny by Default

Jika akses tidak secara eksplisit diberikan:
> **tolak.**

Agent tidak boleh membuat policy:
> semua authenticated user dapat SELECT

lalu berharap frontend memfilter.

Frontend bukan boundary keamanan.

---

## 1.2 Browser Tidak Pernah Menentukan Kebenaran Bisnis

Browser boleh meminta:
> “mulai scan”.

Browser tidak boleh menentukan:
- saldo;
- role;
- biaya final;
- settlement;
- approval;
- status payment;
- credit grant;
- komisi;
- source score;
- entitlement.

Semua diputuskan server/database.

---

## 1.3 Ledger Tidak Diedit

Financial/credit history bersifat append-only secara logika.

Kesalahan:
> buat transaksi koreksi.

Jangan:
> UPDATE transaksi lama dari +5000 menjadi +50.

---

## 1.4 Evidence Tidak Diubah Jadi Fakta oleh AI

AI output disimpan terpisah dari evidence primer.

AI tidak boleh mengubah:
- source fact;
- timestamp source;
- evidence type;
- raw relationship menjadi verified relationship

tanpa rule/approval yang sesuai.

---

## 1.5 Delete Berarti Cleanup Nyata

Menghapus record database tidak cukup bila masih ada:
- Storage object;
- signed artifact;
- orphan attachment;
- stale safe-share;
- cached derived file.

Semua deletion memakai lifecycle job.

---

# 2. BOOTSTRAP ENVIRONMENT CONTRACT

## 2.1 File Lokal Rahasia

Root project menerima file bootstrap lokal:
> `JEJAK.md`

File tersebut berisi credential dan metadata project yang diberikan Product Owner.

**Aturan sebelum commit pertama:**
1. `JEJAK.md` harus dimasukkan ke `.gitignore`;
2. `.env`, `.env.local`, `.env.*.local` harus di-ignore;
3. file credential export lain harus di-ignore;
4. Agent memindahkan credential ke environment yang benar;
5. Agent tidak menghapus file bootstrap sebelum memastikan environment terset;
6. Agent tidak menyalin secret mentah ke `PRD`, `SCHEMA`, README, log, screenshot, issue, commit message, atau chat output;
7. Agent boleh menyimpan nama ENV, tidak nilainya;
8. Agent harus scan repo/client bundle sebelum push pertama untuk memastikan tidak ada secret bocor.

---

## 2.2 Metadata Environment yang Sudah Diketahui

Supabase:
- Project name: `JEJAK`
- Project ID: `tauyicvfhpfnohhgccvn`
- Region: `ap-southeast-1`
- Project URL: berasal dari bootstrap
- Auth/PostgREST/Postgres versions: tersedia di bootstrap sebagai snapshot saat diberikan

Repository:
- `https://github.com/vallendrino-vldr/JEJAK.git`

Initial Owner:
- `vadlyvldr@gmail.com`

---

## 2.3 Environment Variable Classes

### Client-safe / publishable

Gunakan hanya nilai yang memang dirancang Supabase untuk browser.

Nama yang direkomendasikan untuk Next.js:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Jika bootstrap menggunakan:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Agent boleh memetakan ke nama Next.js yang sesuai tanpa mengubah nilai.

**Publishable bukan berarti authorization bebas.**
RLS tetap wajib.

---

### Server-only

- `SUPABASE_SECRET_KEY`
- `SUPABASE_JWKS_URL` bila runtime membutuhkannya
- `GEMINI_API_KEY_1`
- `GEMINI_API_KEY_2`
- `GEMINI_API_KEY_3`
- `GEMINI_API_KEY_4`
- `GROQ_API_KEY_1`
- `GROQ_API_KEY_2`
- `GROQ_API_KEY_3`
- `GROQ_API_KEY_4`
- encryption/HMAC keys yang dibuat untuk identifier protection
- application signing secret;
- safe-share signing material bila digunakan;
- webhook/internal service secrets;
- GitHub credential/PAT jika Product Owner memberikannya terpisah.

Tidak satu pun masuk `NEXT_PUBLIC_*`.

---

### Legacy / restricted credentials

Bootstrap juga dapat berisi:
- legacy anon key;
- legacy service role;
- legacy JWT secret;
- database password.

Aturan:
1. prioritaskan key model modern sesuai dokumentasi Supabase saat implementasi;
2. jangan gunakan legacy `service_role` bila modern secret key sudah memenuhi kebutuhan;
3. jangan pernah masukkan database password/JWT secret ke browser;
4. jangan memakai database password untuk request aplikasi normal;
5. legacy secret hanya disentuh bila memang diperlukan untuk migrasi/compatibility dan harus dicatat di `.notes/DECISIONS.md`.

---

## 2.4 Supabase Package Contract

Next.js App Router / SSR auth:
- gunakan package resmi yang sesuai untuk SSR/session pada versi Supabase saat implementasi;
- jangan menganggap package Edge Function dan package Next.js SSR sama fungsinya.

Supabase server/Edge Function:
- package server boleh digunakan di runtime yang memang didukung dan relevan.

Agent wajib:
1. cek dokumentasi resmi Supabase saat implementasi;
2. cek skill global yang tersedia;
3. gunakan package paling tepat untuk runtime;
4. tidak install package tambahan hanya karena bootstrap lama menyebutnya bila environment sekarang sudah punya solusi yang lebih tepat;
5. catat keputusan package auth di `DECISIONS.md`.

---

# 3. NAMING CONVENTION

## 3.1 Database

- schema aplikasi utama: `public` bila menggunakan Data API dengan RLS ketat;
- helper internal yang tidak perlu diekspos dapat ditempatkan pada schema private/internal bila arsitektur Agent mendukungnya;
- table: `snake_case`, plural;
- column: `snake_case`;
- enum: `snake_case`;
- function/RPC: verb-first `snake_case`;
- index: `idx_<table>_<purpose>`;
- unique index: `uq_<table>_<purpose>`;
- policy: `<table>_<operation>_<rule>`;
- trigger: `trg_<table>_<purpose>`.

---

## 3.2 IDs

Default:
> UUID.

Public reference berbeda dari primary key.

Contoh:
- internal UUID: tidak tampil ke user;
- public Case ref: `JX-7Q41`;
- payment ref: `PAY-K7Q2`.

Jangan menganggap UUID/random public ref sebagai authorization.

---

## 3.3 Time

Semua timestamp database:
> `timestamptz`, UTC.

UI:
> format Indonesia/local timezone.

Jangan simpan timezone user sebagai bagian timestamp event kecuali dibutuhkan metadata.

---

## 3.4 Money

Rupiah:
> integer/bigint Rupiah.

Jangan float.

Contoh:
`49137` = Rp49.137.

---

## 3.5 Credits

Credit:
> integer.

Tidak ada fractional credit pada V1.

---

# 4. AUTH & IDENTITY MODEL

## 4.1 `profiles`

Satu row per `auth.users`.

Fields:
- `id uuid PK` = Auth user id
- `email text`
- `display_name text null`
- `avatar_url text null`
- `account_status enum`
- `assisted_mode boolean default false`
- `preferred_language text default 'id'`
- `last_seen_at timestamptz null`
- `created_at`
- `updated_at`
- `deleted_at null`
- `deletion_requested_at null`

`email` disalin untuk product use tetapi Auth tetap identity origin.

Account status:
- `active`
- `observed`
- `limited`
- `paused`
- `blocked`
- `deletion_pending`
- `deleted`

RLS:
- user SELECT own;
- user UPDATE field aman milik sendiri;
- user tidak dapat mengubah `account_status`;
- staff sesuai permission dapat membaca field yang diperlukan;
- masking dilakukan lewat view/API purpose-specific, bukan memberi raw SELECT ke Support.

---

## 4.2 Initial Owner Bootstrap

Pada migration/bootstrap:
- cari user dengan email `vadlyvldr@gmail.com` setelah login pertama;
- assign `owner` role melalui controlled bootstrap function/admin operation.

Jangan:
> membuat frontend `if email === ownerEmail`.

Email hanya bootstrap identity.

Setelah role assigned:
> DB role assignment source of truth.

---

# 5. RBAC & CAPABILITY MODEL

## 5.1 `roles`

Fields:
- `id uuid PK`
- `code text UNIQUE`
- `name text`
- `description text`
- `is_system boolean`
- `created_at`
- `updated_at`

Seed:
- `owner`
- `admin`
- `finance`
- `support`
- `user`

Partner status **bukan harus selalu role global**; affiliate/reseller/mitra menggunakan partner membership/capability agar satu user bisa banyak konteks.

---

## 5.2 `permissions`

Fields:
- `id`
- `code UNIQUE`
- `description`
- `sensitivity enum`
- `created_at`

Contoh:
- `payments.view_queue`
- `payments.view_proof`
- `payments.approve`
- `payments.reject`
- `payments.request_new_proof`
- `users.view_basic`
- `users.view_sensitive`
- `users.reveal_identifier`
- `credits.grant`
- `credits.correct`
- `roles.assign_admin`
- `roles.assign_finance`
- `roles.assign_support`
- `partners.manage`
- `business.manage_pricing`
- `business.manage_payment_methods`
- `business.manage_campaigns`
- `system.manage_sources`
- `system.manage_feature_flags`
- `system.manage_maintenance`
- `system.emergency_protection`
- `system.view_logs`
- `analytics.view`
- `owner.manage_ownership`

---

## 5.3 `role_permissions`

Fields:
- `role_id`
- `permission_id`
- `created_at`

PK:
> `(role_id, permission_id)`.

---

## 5.4 `user_roles`

Fields:
- `id`
- `user_id`
- `role_id`
- `status`
- `assigned_by`
- `assigned_at`
- `revoked_by null`
- `revoked_at null`
- `reason null`
- `created_at`

Unique active assignment:
> one active role code per user.

Audit every mutation.

---

## 5.5 Source of Truth

`user_roles` + `role_permissions`:
> authoritative.

JWT custom claim:
> optional performance hint only.

Security-sensitive mutation harus dapat memeriksa current DB permission agar role revocation tidak menunggu JWT lama kedaluwarsa.

---

## 5.6 Helper Authorization Functions

Conceptual DB helpers:
- `current_user_has_permission(permission_code)`
- `current_user_has_role(role_code)`
- `is_owner()`
- `is_active_user()`
- `can_access_case(case_id, required_level)`
- `can_access_workspace(workspace_id, required_level)`

Aturan function:
- minimal privilege;
- explicit `search_path`;
- no arbitrary dynamic SQL;
- execution grants minimal;
- security-definer hanya jika benar-benar diperlukan;
- tested against privilege escalation.

---

# 6. USER ENTITLEMENT / CAPABILITY

## 6.1 `user_capabilities`

Digunakan untuk:
- Power;
- Priority;
- AI access;
- advanced evidence;
- temporary promo feature;
- early access.

Fields:
- `id`
- `user_id`
- `capability_code`
- `source_type`
- `source_id null`
- `starts_at`
- `expires_at null`
- `status`
- `metadata jsonb`
- `created_at`

Source examples:
- top-up threshold;
- package;
- campaign;
- admin;
- Mitra;
- feature trial.

Entitlement tidak sama dengan saldo.

---

# 7. WORKSPACE / MITRA FOUNDATION

## 7.1 `workspaces`

Fields:
- `id`
- `public_ref`
- `type enum`
- `name`
- `owner_user_id`
- `status`
- `created_at`
- `updated_at`
- `deleted_at null`

Types:
- `personal` optional;
- `mitra`.

V1 personal Case boleh langsung owner user tanpa personal workspace, tetapi schema harus konsisten.

---

## 7.2 `workspace_members`

Fields:
- `id`
- `workspace_id`
- `user_id`
- `role enum`
- `status`
- `invited_by`
- `joined_at`
- `revoked_at null`
- `created_at`

Roles:
- `owner`
- `manager`
- `analyst`
- `viewer`

V1.5 UI team memakai tabel ini.

RLS:
- member hanya dapat melihat workspace yang dia aktif di dalamnya;
- viewer read;
- analyst Case work;
- manager member/client management sesuai permission;
- owner transfer/delete rules.

---

## 7.3 `clients`

Untuk Mitra.

Fields:
- `id`
- `workspace_id`
- `display_name`
- `internal_notes_encrypted null`
- `status`
- `created_by`
- `created_at`
- `updated_at`
- `archived_at null`

Jangan wajib:
- KTP;
- NIK;
- official identity.

RLS:
> hanya member workspace yang diizinkan.

---

# 8. CASE MODEL

## 8.1 `cases`

Fields:
- `id uuid PK`
- `public_ref text UNIQUE`
- `owner_user_id uuid`
- `workspace_id uuid null`
- `client_id uuid null`
- `title text`
- `purpose enum`
- `relationship_context enum null`
- `is_secret boolean default false`
- `status enum`
- `risk_summary enum null`
- `match_confidence numeric/int null`
- `analysis_completeness numeric/int null`
- `latest_scan_id null`
- `last_activity_at`
- `created_at`
- `updated_at`
- `deleted_at null`
- `trash_expires_at null`

Purpose:
- `self_check`
- `assisted_check`
- `fraud_check`
- `public_research`
- `mitra_client`

Status:
- `active`
- `archived`
- `trashed`
- `deleting`
- `deleted`

---

## 8.2 `case_members`

Foundation collaboration.

Fields:
- `id`
- `case_id`
- `user_id`
- `role enum`
- `status`
- `invited_by`
- `created_at`
- `revoked_at null`

Roles:
- `owner`
- `contributor`
- `viewer`

When Case created:
> owner membership created atomically.

---

## 8.3 RLS Cases

SELECT:
- owner;
- active `case_members`;
- workspace member with allowed role if Case workspace-owned;
- authorized staff only through explicit support/admin path if needed.

INSERT:
- authenticated active user;
- workspace member with create permission.

UPDATE:
- owner;
- contributor only allowed fields/actions via controlled APIs;
- workspace role as defined.

DELETE:
- user does not physical DELETE;
- deletion request function changes lifecycle state.

Support:
> no blanket Case SELECT.

Finance:
> no Case access by default.

---

# 9. ENTITY / IDENTIFIER PROTECTION

## 9.1 `case_entities`

Fields:
- `id`
- `case_id`
- `entity_type enum`
- `label text null`
- `normalized_value_ciphertext text null`
- `normalized_value_hmac text null`
- `display_value_masked text`
- `public_value text null` only if legitimately public and safe
- `country_code null`
- `platform null`
- `first_observed_at null`
- `last_observed_at null`
- `ownership_state enum`
- `created_by`
- `created_at`
- `updated_at`
- `merged_into_entity_id null`
- `merge_state enum`

Entity types:
- `person_name`
- `email`
- `phone`
- `username`
- `domain`
- `public_profile`
- `business`
- `event`
- `other`

---

## 9.2 Identifier Encryption Contract

Raw normalized sensitive identifiers:
- email;
- phone;
- private username where applicable;
- sensitive notes

sebaiknya dienkripsi application-layer sebelum persistence bila arsitektur final Agent mendukung tanpa merusak product requirements.

For matching:
> use keyed HMAC/blind index, **not plain unsalted SHA** for low-entropy values.

Reason:
- phone/email hashes are guessable if plain hash;
- HMAC key stays server-only.

Display:
> store masked value separately.

AI:
> receives plaintext only when truly required and provider path approved.

---

## 9.3 Merge

`merged_into_entity_id`:
> reversible logical merge.

Do not delete source node.

Keep:
- original entity;
- evidence;
- merge decision;
- audit.

---

# 10. RELATIONSHIP GRAPH

## 10.1 `entity_relationships`

Fields:
- `id`
- `case_id`
- `from_entity_id`
- `to_entity_id`
- `relationship_type`
- `status`
- `confidence`
- `directional boolean`
- `valid_from null`
- `valid_to null`
- `created_by_type`
- `created_by_user_id null`
- `latest_evaluation_at`
- `created_at`
- `updated_at`

Relationship types:
- `direct`
- `possible`
- `pattern_similarity`
- `contradiction`
- additional domain-specific types may be metadata.

Status:
- `suggested`
- `accepted`
- `rejected`
- `superseded`

AI can create:
> `suggested`.

AI cannot directly create:
> permanent verified relationship.

---

## 10.2 `relationship_evidence_links`

Fields:
- `relationship_id`
- `evidence_id`
- `stance enum`
- `weight`
- `created_at`

Stance:
- `supports`
- `contradicts`
- `context_only`

Unique:
> relationship + evidence + stance.

---

# 11. SOURCE REGISTRY

## 11.1 `source_registry`

Fields:
- `id`
- `code UNIQUE`
- `name`
- `category`
- `source_class enum`
- `status enum`
- `environment enum`
- `license_status enum`
- `commercial_use_note text null`
- `cost_class enum`
- `priority`
- `reliability_base_score`
- `timeout_ms`
- `daily_internal_budget null`
- `per_user_budget null`
- `credential_alias null`
- `health_state`
- `experimental boolean`
- `included_in_scoring boolean`
- `config jsonb`
- `created_at`
- `updated_at`

Core source seeds:
- RDAP;
- Cloudflare DNS;
- Google DNS fallback;
- libphonenumber/local;
- HIBP Pwned Passwords;
- GitHub public optional;
- GitLab public optional;
- Public Page Collector.

No raw API secret values here.

`credential_alias` references env naming only.

---

## 11.2 Source Status

- `active`
- `experimental`
- `degraded`
- `paused`
- `disabled`
- `retired`

Experimental:
- Owner/test only;
- excluded main score until promoted.

---

## 11.3 `source_health_events`

Fields:
- `id`
- `source_id`
- `state`
- `latency_ms null`
- `error_code null`
- `error_group null`
- `occurred_at`
- `metadata_safe jsonb`

Retention shorter than financial/audit.

No sensitive target plaintext.

---

## 11.4 `source_usage_buckets`

Aggregated:
- source_id
- time_bucket
- request_count
- success_count
- error_count
- estimated_cost
- latency aggregates

Used by:
- Governor;
- NADI;
- admin health.

---

# 12. SCAN PRODUCT / PRICING MODEL

## 12.1 `scan_products`

Fields:
- `id`
- `code UNIQUE`
- `name`
- `description`
- `base_credit_cost`
- `active`
- `display_order`
- `minimum_deliverable_score`
- `included_ai_questions`
- `config jsonb`
- `version`
- `updated_by`
- `updated_at`

Codes:
- `quick_check`
- `deep_check`
- `fusion_analysis`
- `advanced_analysis`
- future professional case analysis.

---

## 12.2 `scan_quotes`

Immutable short-lived price quote.

Fields:
- `id`
- `user_id`
- `case_id null`
- `scan_product_id`
- `quoted_credit_cost`
- `upgrade_credit_discount`
- `final_credit_cost`
- `config_version`
- `expires_at`
- `created_at`
- `consumed_at null`

Purpose:
> user sees 7 credits, server won't silently charge 9 while quote valid.

---

# 13. SCAN JOBS

## 13.1 `scans`

Fields:
- `id`
- `public_ref`
- `user_id`
- `case_id null`
- `purpose`
- `product_code`
- `quote_id`
- `status`
- `idempotency_key UNIQUE`
- `credit_hold_id null`
- `requested_at`
- `started_at null`
- `completed_at null`
- `failed_at null`
- `coverage_score null`
- `match_confidence null`
- `exposure_score null`
- `risk_signal null`
- `failure_reason_code null`
- `current_stage`
- `client_version`
- `created_at`
- `updated_at`

Statuses:
- `requested`
- `credit_reserved`
- `running`
- `partial`
- `completed`
- `failed`
- `refunded`
- `cancelled`

---

## 13.2 `scan_targets`

Fields:
- `id`
- `scan_id`
- `case_entity_id null`
- `target_type`
- `normalized_value_ciphertext null`
- `normalized_value_hmac null`
- `display_value_masked`
- `created_at`

Do not store password target.

---

## 13.3 `scan_source_runs`

Fields:
- `id`
- `scan_id`
- `source_id`
- `status`
- `started_at`
- `finished_at`
- `latency_ms`
- `coverage_contribution`
- `error_code null`
- `retry_count`
- `safe_metadata jsonb`
- `created_at`

Status:
- queued;
- running;
- success;
- no_result;
- failed;
- skipped;
- budget_limited.

---

## 13.4 `scan_stages`

Optional event table if needed for true progress:
- scan_id;
- stage_code;
- status;
- started_at;
- completed_at.

Do not invent percent if no real progress.

---

# 14. EVIDENCE PASSPORT

## 14.1 `evidence_items`

Fields:
- `id`
- `case_id`
- `scan_id null`
- `entity_id null`
- `source_id null`
- `evidence_type`
- `title`
- `summary`
- `fact_payload jsonb`
- `source_locator text null`
- `source_locator_hash null`
- `observed_at null`
- `retrieved_at`
- `reliability_score`
- `specificity_score`
- `freshness_score`
- `independence_group null`
- `verification_state`
- `expires_at null`
- `created_by_type`
- `created_by_user_id null`
- `created_at`
- `deleted_at null`

Evidence types:
- `verified_fact`
- `signal`
- `correlation`
- `ai_inference`
- `user_evidence`

---

## 14.2 Evidence Payload

`fact_payload` stores structured minimum evidence.

Avoid:
- full scraped page;
- full HTML;
- large duplicated content;
- unnecessary third-party PII.

Public Page Collector:
> extract only needed facts/snippets.

---

## 14.3 `evidence_entity_links`

Many-to-many:
- evidence_id;
- entity_id;
- role;
- created_at.

---

## 14.4 Source Independence

Evidence from mirrored/copied sources may share:
> `independence_group`.

Risk engine should not count 20 copies as 20 independent confirmations.

---

# 15. MANUAL EVIDENCE / ATTACHMENT

## 15.1 `case_attachments`

Fields:
- `id`
- `case_id`
- `uploaded_by`
- `attachment_type`
- `storage_bucket`
- `storage_path`
- `mime_type`
- `size_bytes`
- `width null`
- `height null`
- `content_hash`
- `processing_status`
- `retention_policy`
- `expires_at null`
- `created_at`
- `deleted_at null`

Attachment type:
- `chat_screenshot`
- `profile_screenshot`
- `other_evidence`

Storage bucket:
> private.

---

## 15.2 `case_notes`

Fields:
- `id`
- `case_id`
- `author_user_id`
- `content_ciphertext`
- `created_at`
- `updated_at`
- `deleted_at null`

Never interpret user note as verified evidence.

---

# 16. CONTRADICTIONS

## 16.1 `contradictions`

Fields:
- `id`
- `case_id`
- `left_evidence_id`
- `right_evidence_id`
- `category`
- `severity`
- `summary`
- `status`
- `created_by_type`
- `created_at`
- `resolved_at null`

Status:
- `open`
- `explained`
- `superseded`
- `dismissed`

---

# 17. TIMELINE

## 17.1 `timeline_events`

Derived/materialized table if Agent judges useful.

Fields:
- `id`
- `case_id`
- `evidence_id null`
- `entity_id null`
- `event_type`
- `title`
- `event_at null`
- `time_precision`
- `source_reliability`
- `created_at`

Time precision:
- exact;
- date;
- month;
- year;
- approximate;
- unknown.

AI cannot fabricate `event_at`.

---

# 18. CASE SNAPSHOT & CHANGE FOUNDATION

## 18.1 `case_snapshots`

V1 foundation.

Fields:
- `id`
- `case_id`
- `scan_id`
- `snapshot_version`
- `summary_hash`
- `entity_count`
- `relationship_count`
- `evidence_count`
- `risk_signal`
- `match_confidence`
- `coverage`
- `created_at`

Avoid storing massive duplicate graph JSON if changes can be calculated from normalized tables.

---

## 18.2 `case_change_events`

V1.5 use.

Fields:
- `id`
- `case_id`
- `from_snapshot_id`
- `to_snapshot_id`
- `change_type`
- `subject_type`
- `subject_id`
- `summary`
- `created_at`

Types:
- new;
- removed;
- stronger;
- weaker;
- contradiction.

---

# 19. HYPOTHESES FOUNDATION

## 19.1 `hypotheses`

V1 foundation/V1.5 active.

Fields:
- `id`
- `case_id`
- `author_user_id`
- `statement`
- `status`
- `confidence`
- `created_at`
- `updated_at`

---

## 19.2 `hypothesis_evidence_links`

- hypothesis_id
- evidence_id
- stance
- weight
- created_at

AI challenge does not mutate original evidence.

---

# 20. AI RUNS

## 20.1 `ai_runs`

Fields:
- `id`
- `user_id null`
- `case_id null`
- `scan_id null`
- `purpose`
- `provider`
- `model`
- `prompt_template_version`
- `context_fingerprint`
- `status`
- `input_token_count null`
- `output_token_count null`
- `latency_ms null`
- `error_code null`
- `sensitive_context_class`
- `retention_class`
- `created_at`
- `completed_at null`

Do **not** default-store:
- entire prompt;
- entire Case plaintext;
- API key;
- password;
- bank screenshot raw.

If debug retention needed:
> explicit, bounded, redacted, audited.

---

## 20.2 `ai_outputs`

Fields:
- `id`
- `ai_run_id`
- `output_type`
- `content`
- `grounding_state`
- `created_at`
- `superseded_at null`

Types:
- summary;
- skeptic;
- narrative;
- explanation;
- proposed_relationship;
- payment_screening;
- admin_advice.

---

## 20.3 `ai_feedback`

Fields:
- `id`
- `ai_run_id`
- `user_id`
- `helpful boolean`
- `reason_code null`
- `comment null`
- `created_at`

No raw sensitive target in feedback analytics.

---

# 21. CREDIT WALLET

## 21.1 `credit_wallets`

One per user.

Fields:
- `id`
- `user_id UNIQUE`
- `available_cached integer`
- `reserved_cached integer`
- `version bigint`
- `updated_at`
- `created_at`

Cached balance:
> convenience/performance.

Ledger/lots:
> financial truth.

Every mutation transactional.

---

# 22. CREDIT LOTS

## 22.1 `credit_lots`

Every top-up/bonus/admin grant creates a lot.

Fields:
- `id`
- `wallet_id`
- `origin_type`
- `origin_id null`
- `original_credits`
- `remaining_credits`
- `reserved_credits`
- `purchased_credits`
- `bonus_credits`
- `starts_at`
- `expires_at`
- `grace_until null`
- `extendable boolean`
- `status`
- `created_at`
- `updated_at`

Origin:
- purchase;
- signup_bonus;
- campaign;
- referral;
- admin_grant;
- compensation;
- refund;
- reseller_voucher.

Status:
- active;
- grace;
- exhausted;
- expired;
- revoked.

---

## 22.2 Consumption Rule

FEFO:
> lot dengan masa akhir paling dekat digunakan dahulu.

Expired:
> not selectable for new reserve.

Reserved before expiry:
> scan may complete.

Grace:
> policy-defined availability/extension behavior.

---

# 23. CREDIT TRANSACTIONS

## 23.1 `credit_transactions`

Immutable business ledger.

Fields:
- `id`
- `wallet_id`
- `transaction_type`
- `delta_available`
- `delta_reserved`
- `reference_type`
- `reference_id`
- `idempotency_key UNIQUE`
- `reason_code null`
- `created_by_user_id null`
- `created_by_system text null`
- `created_at`
- `metadata_safe jsonb`

Types:
- lot_created;
- reserve;
- release;
- settle;
- refund;
- expire;
- admin_grant;
- admin_correction;
- extension;
- voucher_redeem;
- promo.

No UPDATE after finalized except exceptional administrative metadata that does not alter accounting; preferred append-only.

---

## 23.2 `credit_transaction_allocations`

Fields:
- `transaction_id`
- `credit_lot_id`
- `credits`
- `created_at`

Shows which lot funded which debit/reserve/refund.

---

# 24. CREDIT HOLDS / SCAN RESERVATIONS

## 24.1 `credit_holds`

Fields:
- `id`
- `wallet_id`
- `scan_id UNIQUE`
- `credits`
- `status`
- `idempotency_key UNIQUE`
- `created_at`
- `settled_at null`
- `released_at null`

Statuses:
- reserved;
- settled;
- released;
- expired_internal.

Atomic reserve function:
1. lock wallet/lots;
2. verify available;
3. allocate FEFO;
4. update lots;
5. update cache;
6. append transaction;
7. create hold;
8. commit.

All or nothing.

---

# 25. REQUIRED CREDIT RPC / TRANSACTION BOUNDARIES

Agent must implement controlled server/database operations equivalent to:

### `reserve_scan_credits`
Input:
- user;
- scan;
- quote;
- idempotency.

Guarantees:
- balance check;
- quote check;
- concurrency;
- one hold per scan;
- atomic.

### `settle_scan_credits`
- hold -> settled;
- no second settle.

### `release_scan_credits`
- failed/refund;
- credits return to original eligible lots where practical;
- append refund/release transaction.

### `expire_credit_lots`
- scheduled;
- append expiry transaction;
- no silent deletion.

### `extend_eligible_credit_lots`
- top-up policy;
- only eligible paid lots;
- promo separate.

### `admin_adjust_credits`
- append grant/correction;
- requires permission;
- reason;
- audit.

No client direct update to balances/lots.

---

# 26. CREDIT EXPIRY

Rules stored in package/config snapshot.

Expiration process:
1. identify lot reaching expiration;
2. if reserve > 0, reserved portion remains tied to scan;
3. unreserved expires;
4. ledger entry;
5. grace state if policy;
6. user notification.

Never delete lot row just because expired.

---

# 27. CREDIT PACKAGE CONFIG

## 27.1 `credit_packages`

Fields:
- `id`
- `code UNIQUE`
- `name`
- `price_idr`
- `base_credits`
- `bonus_credits`
- `validity_days`
- `grace_days`
- `extends_existing_paid_credits`
- `extension_days null`
- `target_segment`
- `active`
- `display_order`
- `badge_text null`
- `version`
- `created_at`
- `updated_at`

Seed direction:
- Mulai;
- Proteksi;
- Lanjutan;
- Power.

Do not hardcode seed forever.

---

# 28. PAYMENT METHODS

## 28.1 `payment_methods`

Owner configurable.

Fields:
- `id`
- `code UNIQUE`
- `display_name`
- `method_type`
- `institution_name`
- `account_number_ciphertext`
- `account_number_last4`
- `account_holder_name_ciphertext`
- `instructions`
- `is_active`
- `is_primary`
- `display_order`
- `version`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`
- `retired_at null`

Account details are business-sensitive:
> don't expose to unauthorized staff.

User only sees currently applicable snapshot via order/checkout.

---

## 28.2 Multiple Methods

Database supports multiple active methods.

Only one primary at a time unless product later allows route selection.

Changing primary:
> future orders only.

---

# 29. TOP-UP ORDERS

## 29.1 `topup_orders`

Fields:
- `id`
- `public_ref UNIQUE`
- `user_id`
- `package_id`
- `package_snapshot jsonb`
- `base_amount_idr`
- `unique_code_amount`
- `expected_amount_idr`
- `confirmed_amount_idr null`
- `credits_base`
- `credits_bonus`
- `status`
- `payment_method_id`
- `payment_method_snapshot jsonb`
- `campaign_id null`
- `referral_attribution_id null`
- `created_at`
- `proof_due_at null`
- `submitted_at null`
- `approved_at null`
- `approved_by null`
- `rejected_at null`
- `rejected_by null`
- `rejection_reason null`
- `settlement_transaction_id null UNIQUE`
- `idempotency_key UNIQUE`
- `updated_at`

Status:
- awaiting_proof;
- proof_submitted;
- under_review;
- needs_new_proof;
- approved;
- rejected;
- expired;
- cancelled.

---

## 29.2 Payment Snapshot

Store safe snapshot:
- bank/method;
- account number display/necessary encrypted copy;
- holder;
- instructions;
- version.

Why:
> existing order unaffected by later admin changes.

---

# 30. UNIQUE PAYMENT AMOUNT

Use unique amount code within configured range.

Need collision management:
- scope active orders;
- unique index or reservation table;
- avoid reusing same amount in overlapping reconciliation window if it creates ambiguity.

Do not rely on amount as authentication.

---

# 31. PAYMENT PROOFS

## 31.1 `payment_proofs`

Fields:
- `id`
- `topup_order_id`
- `uploaded_by`
- `storage_bucket`
- `storage_path`
- `content_hash`
- `perceptual_hash null`
- `mime_type`
- `original_size_bytes`
- `stored_size_bytes`
- `status`
- `created_at`
- `delete_after null`
- `deleted_at null`

Status:
- uploaded;
- processing;
- ready;
- invalid;
- pending_cleanup;
- deleted.

Private bucket.

---

## 31.2 Proof Retention

Approved:
> short cleanup queue after settlement.

Rejected/needs dispute:
> bounded retention configurable, e.g. seed 7 days.

No forever storage.

---

# 32. PAYMENT SENTINEL

## 32.1 `payment_screenings`

Fields:
- `id`
- `proof_id`
- `provider`
- `ai_run_id null`
- `status`
- `confidence_class`
- `detected_amount_idr null`
- `detected_bank null`
- `detected_reference_ciphertext null`
- `detected_reference_hmac null`
- `duplicate_signal boolean`
- `visual_integrity_signal`
- `matching_summary jsonb`
- `created_at`

Confidence:
- likely_match;
- review;
- suspicious;
- unavailable.

Never:
> auto approve solely from this.

---

# 33. PAYMENT REVIEW / APPROVAL

## 33.1 `payment_reviews`

Fields:
- `id`
- `topup_order_id`
- `reviewer_user_id`
- `decision`
- `sentinel_override boolean`
- `reason_code`
- `notes null`
- `created_at`

Decision:
- approve;
- reject;
- request_new_proof.

---

## 33.2 Atomic `approve_topup`

Must guarantee in one transaction:
1. order lock;
2. verify not approved;
3. validate reviewer permission;
4. create credit lot(s);
5. create ledger transaction;
6. update wallet cache;
7. set order approved;
8. link settlement transaction;
9. create audit;
10. queue proof cleanup;
11. trigger/broadcast user update;
12. create referral commission pending if applicable.

Double click:
> returns already-approved result, no duplicate credits.

---

# 34. ADMIN PAYMENT OVERRIDE

If received amount differs:
- `confirmed_amount_idr` records actual confirmed;
- review `reason_code`;
- audit.

Do not create “wallet rupiah” in V1.

---

# 35. REFERRAL / CAMPAIGN

## 35.1 `campaigns`

Fields:
- `id`
- `code`
- `name`
- `campaign_type`
- `status`
- `starts_at`
- `ends_at`
- `max_uses null`
- `per_user_limit`
- `minimum_topup_idr null`
- `benefit_type`
- `benefit_value`
- `bonus_validity_days null`
- `targeting jsonb`
- `created_by`
- `created_at`
- `updated_at`

---

## 35.2 `referral_codes`

Fields:
- `id`
- `code UNIQUE`
- `campaign_id null`
- `owner_user_id null`
- `partner_membership_id null`
- `status`
- `max_uses null`
- `uses_count_cached`
- `starts_at`
- `ends_at`
- `created_at`

Reserved namespace:
- JEJAK;
- ADMIN;
- OFFICIAL;
- SUPPORT;
- Owner brand codes as configured.

---

## 35.3 `referral_attributions`

One primary registration attribution.

Fields:
- `id`
- `referred_user_id UNIQUE`
- `referral_code_id`
- `referrer_user_id null`
- `attribution_model`
- `attributed_at`
- `qualified_at null`
- `status`

Default:
> last valid referral before/signup event as product rule.

---

# 36. PARTNER MEMBERSHIP

## 36.1 `partner_memberships`

Allows one user multiple partner types.

Fields:
- `id`
- `user_id`
- `partner_type`
- `status`
- `tier_code null`
- `commission_rate_bps null`
- `approved_by null`
- `approved_at null`
- `paused_at null`
- `paused_by null`
- `reason null`
- `created_at`
- `updated_at`

Partner types:
- affiliate;
- reseller;
- mitra.

Status:
- applied;
- active;
- paused;
- rejected;
- revoked.

Unique:
> user + partner_type active/history model.

---

## 36.2 `partner_status_history`

Append-only history:
- membership_id;
- from_status;
- to_status;
- actor_user_id;
- reason;
- created_at.

---

# 37. PARTNER APPLICATIONS

## 37.1 `partner_applications`

Fields:
- `id`
- `user_id`
- `partner_type`
- `reason null`
- `status`
- `reviewed_by null`
- `reviewed_at null`
- `review_note null`
- `created_at`

No KTP required by default.

---

# 38. AFFILIATE COMMISSIONS

## 38.1 `affiliate_commissions`

Fields:
- `id`
- `partner_membership_id`
- `topup_order_id`
- `referral_attribution_id`
- `commission_rate_bps`
- `commission_amount_idr`
- `status`
- `abuse_review_state`
- `qualified_at null`
- `validated_at null`
- `paid_at null`
- `paid_by null`
- `idempotency_key UNIQUE`
- `created_at`

Statuses:
- pending;
- review;
- valid;
- paid;
- cancelled;
- reversed.

Unique:
> order + affiliate program source.

Signup alone:
> no cash commission.

---

# 39. RESELLER DISTRIBUTION

## 39.1 `distribution_wallets`

One per reseller membership.

Fields:
- `id`
- `partner_membership_id UNIQUE`
- `available_credits`
- `reserved_credits`
- `version`
- `created_at`
- `updated_at`

Separate from personal credit wallet.

---

## 39.2 `distribution_transactions`

Immutable:
- id;
- distribution_wallet_id;
- type;
- delta;
- reference;
- idempotency;
- created_at.

Types:
- purchase;
- voucher_reserve;
- voucher_redeem;
- voucher_release;
- correction.

---

# 40. VOUCHERS

## 40.1 `vouchers`

Fields:
- `id`
- `code UNIQUE`
- `issuer_type`
- `issuer_user_id null`
- `reseller_membership_id null`
- `campaign_id null`
- `credit_value`
- `status`
- `starts_at`
- `expires_at`
- `max_redemptions`
- `redemptions_count_cached`
- `created_at`

Reseller voucher:
> backed by distribution value.

---

## 40.2 `voucher_redemptions`

Fields:
- `id`
- `voucher_id`
- `user_id`
- `credits`
- `credit_lot_id`
- `idempotency_key UNIQUE`
- `redeemed_at`

Unique policy:
> voucher/user depending campaign.

Redeem transaction atomic:
- lock voucher;
- lock distribution balance if needed;
- verify limits;
- create credit lot;
- ledger;
- increment count;
- commit.

---

# 41. NOTIFICATIONS — KABAR JEJAK

## 41.1 `notifications`

Fields:
- `id`
- `user_id`
- `category`
- `priority`
- `title`
- `body`
- `action_type null`
- `action_ref null`
- `is_secret_safe boolean`
- `read_at null`
- `created_at`
- `expires_at null`

No sensitive Case title in secret notification.

---

# 42. OWNER INBOX

## 42.1 `owner_inbox_items`

Fields:
- `id`
- `category`
- `priority`
- `title`
- `summary`
- `reference_type`
- `reference_id`
- `status`
- `assigned_to null`
- `created_at`
- `read_at null`
- `resolved_at null`
- `resolved_by null`

Status:
- open;
- in_progress;
- resolved;
- dismissed.

Read != resolved.

---

# 43. USER SECURITY ACTIONS

## 43.1 `user_remediation_actions`

For Jejak Gue.

Fields:
- `id`
- `user_id`
- `case_id null`
- `action_type`
- `status`
- `marked_at`
- `created_at`

Examples:
- password_changed;
- mfa_enabled;
- old_email_retired.

This is user-reported action status, not verified fact unless evidence exists.

---

# 44. PANTAU JEJAK FOUNDATION

## 44.1 `monitoring_subscriptions`

V1 foundation / V1.5 active.

Fields:
- `id`
- `user_id`
- `case_id`
- `mode`
- `status`
- `credit_cost_per_cycle`
- `frequency_policy`
- `next_check_at`
- `last_check_at null`
- `auto_pause_policy`
- `created_at`
- `updated_at`

Status:
- active;
- paused;
- insufficient_credit;
- stopped.

Monitoring third-party:
> context/permission rules apply.

---

# 45. SAFE SHARE

## 45.1 `safe_shares`

Fields:
- `id`
- `owner_user_id`
- `case_id null`
- `scan_id null`
- `token_hash UNIQUE`
- `safe_payload jsonb`
- `status`
- `expires_at null`
- `revoked_at null`
- `created_at`

Do not use raw Case row as public payload.

Public route:
> token lookup -> sanitized snapshot only.

---

# 46. FEATURE FLAGS

## 46.1 `feature_flags`

Fields:
- `id`
- `code UNIQUE`
- `description`
- `enabled`
- `server_enforced boolean`
- `default_variant`
- `version`
- `created_at`
- `updated_at`
- `updated_by`

---

## 46.2 `feature_flag_rules`

Fields:
- `id`
- `feature_flag_id`
- `audience_type`
- `audience_ref null`
- `percentage null`
- `variant`
- `priority`
- `starts_at null`
- `ends_at null`
- `created_at`

Audience:
- owner;
- test_user;
- role;
- capability;
- partner_type;
- percentage;
- all.

Critical:
> enforce on server, not frontend only.

---

# 47. MAINTENANCE & EMERGENCY

## 47.1 `system_controls`

Fields:
- `code PK`
- `enabled`
- `mode`
- `message`
- `updated_by`
- `updated_at`
- `version`

Examples:
- scans_enabled;
- ai_enabled;
- topups_enabled;
- uploads_enabled;
- monitoring_enabled;
- emergency_protection_enabled.

RLS:
> user read only safe public state if needed;
> mutation permissioned admin/owner only.

---

# 48. APP VERSION / PWA

## 48.1 `app_versions`

Fields:
- `version`
- `build_id`
- `released_at`
- `minimum_supported boolean`
- `is_critical_update`
- `release_notes_safe`
- `created_at`

---

## 48.2 `client_version_observations`

Privacy-safe aggregate/raw limited.

Fields:
- `id`
- `user_id null`
- `version`
- `browser_family`
- `pwa_mode`
- `motion_mode`
- `observed_at`

Retention limited.

Do not fingerprint excessively.

---

# 49. ERROR EVENTS

## 49.1 `error_events`

Fields:
- `id`
- `public_error_code`
- `error_group`
- `severity`
- `user_id null`
- `case_id null`
- `operation`
- `app_version`
- `browser_family`
- `pwa_mode`
- `safe_context jsonb`
- `occurred_at`
- `resolved_incident_id null`

Do not store:
- auth token;
- secret;
- password;
- full identifier by default;
- full AI context.

---

# 50. INCIDENTS

## 50.1 `incidents`

Fields:
- `id`
- `title`
- `severity`
- `status`
- `started_at`
- `resolved_at null`
- `impact_summary`
- `technical_summary null`
- `created_by_type`
- `created_at`

Status:
- investigating;
- identified;
- monitoring;
- resolved.

---

# 51. SECURITY EVENTS

## 51.1 `security_events`

Fields:
- `id`
- `event_type`
- `severity`
- `user_id null`
- `session_fingerprint_safe null`
- `object_type null`
- `object_id null`
- `blocked boolean`
- `safe_context jsonb`
- `occurred_at`

Examples:
- unauthorized_case_access;
- abnormal_scan_velocity;
- invalid_upload;
- provider_burn_pattern;
- referral_abuse_signal.

No aggressive invasive fingerprint as default.

---

# 52. AUDIT EVENTS

## 52.1 `audit_events`

Append-only.

Fields:
- `id`
- `actor_user_id null`
- `actor_type`
- `action`
- `target_type`
- `target_id null`
- `before_safe jsonb null`
- `after_safe jsonb null`
- `reason_code null`
- `request_id null`
- `created_at`

Must audit:
- role change;
- sensitive reveal;
- payment approval;
- payment override;
- credit grant/correction;
- payment method change;
- pricing change;
- campaign change;
- partner freeze;
- source config;
- maintenance;
- emergency protection;
- feature flags;
- deletion action.

Do not store raw secret in before/after.

---

# 53. SENSITIVE ACCESS EVENTS

## 53.1 `sensitive_access_events`

Fields:
- `id`
- `actor_user_id`
- `permission_code`
- `target_type`
- `target_id`
- `access_type`
- `reason null`
- `created_at`

Examples:
- support reveals phone;
- finance views proof;
- admin views sensitive Case detail.

User-facing Access History may expose a safe subset where product policy allows.

---

# 54. USER REPORTS

## 54.1 `user_issue_reports`

Fields:
- `id`
- `user_id`
- `error_event_id null`
- `description`
- `safe_diagnostics jsonb`
- `status`
- `created_at`
- `resolved_at null`

No automatic full Case attachment.

---

# 55. ANALYTICS EVENTS

## 55.1 `product_events`

Fields:
- `id`
- `user_id null`
- `event_name`
- `session_id_safe null`
- `properties_safe jsonb`
- `occurred_at`

No raw:
- email target;
- phone target;
- password;
- API key;
- bank proof.

Use semantic events.

---

# 56. AGGREGATED BUSINESS METRICS

Prefer aggregation tables/materialized views for NADI/dashboard rather than AI reading raw transactions.

Examples:
- `daily_business_metrics`
- `daily_scan_metrics`
- `daily_payment_metrics`
- `daily_partner_metrics`
- `daily_error_metrics`
- `daily_performance_metrics`

Agent may implement via:
- scheduled aggregation;
- views;
- materialized views;
- query layer

depending scale.

Views exposed through Data API:
> `security_invoker` / RLS-aware behavior as appropriate.

---

# 57. NADI DIGEST

## 57.1 `admin_digests`

Fields:
- `id`
- `period_start`
- `period_end`
- `digest_type`
- `facts jsonb`
- `generated_at`

Facts:
- pending payments;
- revenue;
- errors;
- source health;
- funnel;
- partner signals.

NADI reads digest first.

Raw DB access:
> scoped on demand.

---

# 58. STORAGE BUCKETS

Required conceptual buckets:

## `payment-proofs`
- private;
- short retention;
- user own upload/read policy;
- Finance/authorized reviewer read;
- no public URL.

## `case-attachments`
- private;
- access inherits Case permission;
- no public URL.

## `generated-safe-assets` optional
- preferably private with controlled delivery;
- public only if artifact itself is intentionally sanitized and exposure policy explicit.

Do not use public bucket for sensitive file convenience.

---

# 59. STORAGE OBJECT PATH CONVENTION

Payment:
> `user/<user_id>/order/<order_id>/<file_id>.<ext>`

Case:
> `case/<case_id>/attachment/<attachment_id>.<ext>`

Do not rely on path secrecy.

Storage RLS checks ownership/membership.

---

# 60. STORAGE RLS

Payment proof INSERT:
- authenticated;
- order belongs to auth.uid;
- order accepts proof;
- path ownership correct.

Payment proof SELECT:
- owner user for active proof if product permits;
- Finance/Owner with permission;
- not Support by default.

Case attachment SELECT:
- `can_access_case(case_id, 'view')`.

Case attachment INSERT:
- owner/contributor with write capability.

DELETE:
- controlled cleanup/service operation;
- user deletion uses application workflow, not arbitrary storage delete if audit/lifecycle required.

---

# 61. DELETION JOBS

## 61.1 `deletion_jobs`

Fields:
- `id`
- `job_type`
- `owner_user_id null`
- `target_type`
- `target_id`
- `status`
- `attempt_count`
- `next_attempt_at`
- `last_error_code null`
- `created_at`
- `completed_at null`

Types:
- payment_proof_cleanup;
- case_hard_delete;
- account_delete;
- orphan_cleanup;
- safe_share_cleanup;
- export_cleanup.

---

# 62. CASE TRASH

When user deletes normal Case:
- `status = trashed`;
- `deleted_at`;
- `trash_expires_at ~3 days`.

Restore:
- clear trash state if still allowed.

Scheduled hard delete:
- queue job.

Secret Case:
- optional immediate hard deletion queue.

---

# 63. ACCOUNT DELETION

## 63.1 `account_deletion_requests`

Fields:
- `id`
- `user_id`
- `status`
- `requested_at`
- `finalize_after`
- `active_credit_at_request`
- `blocking_reason null`
- `completed_at null`

Flow:
1. user confirms;
2. warn active credits;
3. stop new operations;
4. partner/shared ownership checks;
5. queue data cleanup;
6. revoke app access;
7. remove Storage objects;
8. anonymize/retain only required financial/audit data;
9. delete Auth user when storage ownership/requirements allow;
10. mark completed.

Financial ledger obligations:
> retained minimally/anonymized as required.

---

# 64. DATA EXPORT FOUNDATION

## 64.1 `data_export_jobs`

Fields:
- `id`
- `user_id`
- `status`
- `storage_path null`
- `expires_at null`
- `created_at`
- `completed_at null`

Export includes user-facing own data.

Exclude:
- internal abuse score;
- security secrets;
- unrelated admin notes;
- other users' data.

Artifact temporary/private.

---

# 65. RATE / ABUSE STATE

## 65.1 `user_risk_states`

Fields:
- `user_id PK`
- `state`
- `score_internal`
- `reason_summary_safe`
- `updated_at`

State:
- normal;
- observed;
- limited;
- paused;
- blocked.

Internal score:
> not user-facing “criminal score”.

---

## 65.2 `operation_counters`

May be Redis/runtime instead of Postgres if available.

If DB:
- user;
- operation;
- window;
- count;
- target_diversity;
- concurrency.

Agent chooses performant implementation and records decision.

---

# 66. IDEMPOTENCY

All high-value mutations require idempotency.

Required:
- scan create/reserve;
- scan settle/refund;
- topup approve;
- credit grant/correction;
- voucher redeem;
- referral commission;
- reseller transaction;
- deletion request;
- safe-share create where duplicate costly.

Database unique constraint:
> ultimate guard.

Frontend disabled button:
> only UX enhancement.

---

# 67. CONCURRENCY TEST CONTRACT

Must prove:

### Credits
1 credit + 5 concurrent scan requests:
> only eligible work reserved.

### Payment
2 staff approve same order:
> one credit settlement.

### Voucher
1-use voucher + 2 redeems:
> one succeeds.

### Referral
retry settlement:
> one commission.

### Config
two owner devices edit:
> version conflict detected.

---

# 68. RLS POLICY MATRIX — PROFILES

### SELECT
User:
> own row.

Support:
> via scoped view/API returning masked fields unless sensitive permission.

Finance:
> minimal identity needed for payment.

Admin:
> according permission.

Owner:
> full authorized.

### UPDATE
User:
> allowed profile preferences only.

Server/admin:
> status via controlled operations.

### DELETE
No direct client delete.
Use deletion flow.

---

# 69. RLS POLICY MATRIX — CASES

### SELECT
Allowed if:
- owner;
- active case member;
- authorized workspace member.

Staff:
> only explicit product-purpose permissions.

### INSERT
Authenticated active user;
authorized workspace member.

### UPDATE
Owner/contributor according field/action.
Prefer controlled functions for sensitive state.

### DELETE
No direct physical delete.

---

# 70. RLS POLICY MATRIX — ENTITIES / RELATIONSHIPS / EVIDENCE

Every subresource must verify parent Case access.

Never:
> authenticated user SELECT all evidence.

Entity insert/update:
- Case write permission.

Evidence source-generated:
- trusted server operation.

User evidence:
- Case contributor.

Relationship:
- user can create manual suggestion if feature;
- AI/server creates suggested;
- acceptance per Case write permission.

---

# 71. RLS POLICY MATRIX — WALLET / CREDIT

User SELECT:
- own wallet;
- own user-facing ledger/lots.

User INSERT/UPDATE/DELETE:
> none directly.

All mutation:
> server RPC/action with auth context + transaction.

Staff:
- Support view safe balance if permission;
- credit grant/correct specific permission.

---

# 72. RLS POLICY MATRIX — TOPUP

User:
- SELECT own orders;
- create order through controlled operation;
- upload proof to own eligible order;
- cannot approve/reject.

Finance:
- queue;
- proof;
- review according permission.

Support:
- status, not proof by default.

Affiliate:
- cannot read referred user's payment details.

---

# 73. RLS POLICY MATRIX — PARTNER

User:
> own applications/membership/dashboard.

Owner/Admin with permission:
> manage.

Partner A:
> cannot see Partner B.

Affiliate:
> sees aggregated referral result, not unrelated user Case.

Reseller:
> own distribution/vouchers.

Mitra:
> own workspace/client data.

---

# 74. RLS POLICY MATRIX — ADMIN CONFIG

Tables:
- payment_methods;
- credit_packages;
- scan_products;
- source_registry;
- feature_flags;
- system_controls;
- campaigns.

Regular users:
> read safe active subset only where needed.

Mutation:
> permissioned admin/Owner only.

Secret/config values:
> not stored in exposed rows.

---

# 75. RLS POLICY MATRIX — AUDIT/SECURITY

Regular user:
> no raw internal audit/security SELECT.

User-facing Access History:
> purpose-built filtered view/table/function.

Admin:
> based on permission.

Audit mutation:
> server only.

No client:
> UPDATE/DELETE.

---

# 76. RLS POLICY MATRIX — NOTIFICATIONS

User:
> SELECT own;
> update own read_at only via scoped operation.

Server:
> INSERT.

No user arbitrary notification creation if it could spoof system message.

---

# 77. PUBLIC / ANON ACCESS

Anon should have minimal access.

Allowed:
- landing static;
- demo static local;
- public safe-share lookup via controlled token route if feature;
- public app version/maintenance safe info if needed.

Anon should not directly query:
- cases;
- profiles;
- wallets;
- payments;
- evidence;
- audit;
- source internals.

---

# 78. SAFE SHARE SECURITY

Do not expose Case via RLS anon.

Use:
> high-entropy token + token hash server lookup.

`safe_payload`:
- sanitized snapshot;
- no sensitive identifier;
- no raw internal IDs;
- no attachment unless explicitly safe.

Revocable.

---

# 79. SUPPORT MASKING

Prefer purpose-specific masked view/function:
- email -> `va•••@gmail.com`
- phone -> `0812••••721`

Do not:
> SELECT raw then hide with CSS.

Sensitive reveal:
- explicit backend request;
- permission check;
- sensitive_access_event.

---

# 80. REALTIME CONTRACT

Recommended:
> Broadcast for events needing scalable/security-aware realtime where practical.

Realtime topics examples:
- `user:<id>:wallet`
- `user:<id>:notifications`
- `user:<id>:scans`
- `case:<id>`
- `admin:payments` permissioned
- `admin:alerts` permissioned

Do not broadcast:
- API key;
- payment proof path to unauthorized client;
- raw secret Case info to generic channel.

RLS/Realtime Authorization required.

---

# 81. REALTIME IS NOT SOURCE OF TRUTH

If event missed:
> refresh query recovers state.

Database:
> source of truth.

UI cannot settle credit based on websocket event.

---

# 82. DATABASE TRIGGER USE

Triggers appropriate for:
- `updated_at`;
- safe audit fanout where controlled;
- broadcast change event;
- cleanup queue creation;
- profile creation after Auth user if stable pattern;
- invariant enforcement that belongs DB-side.

Avoid:
- giant hidden business workflow in 20 triggers impossible to debug.

Critical financial workflow:
> explicit transactional function preferable.

---

# 83. VIEWS

Views for:
- user wallet summary;
- Support masked user;
- admin dashboard safe aggregate;
- source health aggregate;
- partner performance aggregate.

If exposed:
> RLS/security invoker behavior must preserve caller authorization.

Do not accidentally create privileged security-definer view that bypasses RLS.

---

# 84. INDEX STRATEGY — AUTH / CASE

Required candidate indexes:
- profiles email normalized where needed;
- user_roles user/status;
- case_members user/status;
- cases owner/status/last_activity;
- cases workspace/status;
- case_entities case/type;
- case_entities normalized_value_hmac where cross-case lookup is intentionally allowed by server;
- relationships case/from/to;
- evidence case/entity/source;
- timeline case/event_at.

Do not index ciphertext for searching.

---

# 85. INDEX STRATEGY — BUSINESS

- topup_orders user/created_at;
- topup_orders status/created_at;
- topup_orders expected_amount + active window if reconciliation needs;
- payment_proofs order;
- credit_transactions wallet/created_at;
- credit_lots wallet/status/expires_at;
- affiliate_commissions membership/status;
- vouchers code/status;
- referral_codes code/status;
- partner_memberships user/type/status.

---

# 86. INDEX STRATEGY — OPS

- error_events error_group/occurred_at;
- security_events event_type/occurred_at;
- audit_events actor/created_at;
- audit_events target/created_at;
- source_health_events source/occurred_at;
- notifications user/read/created_at;
- deletion_jobs status/next_attempt_at.

Use indexes based on actual query plans; avoid index explosion.

---

# 87. UNIQUE CONSTRAINTS — CRITICAL

Examples:
- profiles.id;
- user+role active assignment;
- wallet user;
- one credit hold per scan;
- idempotency key per financial operation;
- topup settlement transaction unique;
- referral attribution one primary per referred user;
- commission per qualifying order/program;
- voucher code;
- redemption rules;
- Case public ref;
- payment public ref;
- source code;
- feature flag code.

Database uniqueness is final race-condition guard.

---

# 88. CHECK CONSTRAINTS

Examples:
- credits >= 0 where appropriate;
- reserved >= 0;
- remaining + reserved <= original allowed accounting model;
- price >= 0;
- commission rate bounds;
- score 0..100;
- validity dates logical;
- one primary payment method partial unique index if implemented;
- topup approved requires settlement transaction;
- trashed Case has deleted_at/trash_expires_at;
- active source config valid.

---

# 89. FOREIGN KEY DELETION POLICY

Do not blindly `ON DELETE CASCADE` everything.

Use CASCADE only where lifecycle makes sense.

Financial/audit:
> preserve/minimally anonymize.

Case children:
> cleanup workflow/hard delete may cascade after attachments cleaned.

User deletion:
> controlled workflow before auth user deletion.

Payment proof:
> record may remain tombstone after Storage deletion if audit requires.

---

# 90. RAW SOURCE ARTIFACT RETENTION

If source response must temporarily be stored for processing:
> separate short-lived encrypted/raw-artifact table or object storage.

Fields:
- scan/source;
- encrypted payload;
- expires_at;
- processing status.

Default:
> do not retain raw indefinitely.

Evidence extraction remains.

Agent should avoid storing raw source unless needed.

---

# 91. AI SENSITIVE DATA GATE

Before AI context assembly, classify:
- public;
- personal;
- financial;
- secret-case;
- credential/password.

Rules:
- password never AI;
- bank proof only approved vision route/policy;
- Gemini free-tier sensitive usage requires provider policy decision;
- Groq sensitive route only under configured retention/privacy settings;
- identifier redaction by default where raw not needed.

Database can store:
> `sensitive_context_class` on `ai_runs`.

---

# 92. PROVIDER CREDENTIAL ROUTING

Credentials stay environment.

Source/provider table may store:
- credential alias;
- provider account label;
- active;
- purpose;
- policy note.

It may **not** store secret.

Multiple credentials in bootstrap:
> availability does not authorize bypassing provider terms/rate limits.

Agent must implement compliant routing/failover based on current provider rules.

---

# 93. PUBLIC PAGE COLLECTOR DATA

Store:
- source URL/reference;
- fetched timestamp;
- HTTP status;
- content fingerprint;
- extracted relevant facts;
- short relevant snippet if allowed;
- provenance.

Do not store:
- full website clone;
- login-protected content;
- captcha bypass output;
- malicious scripts.

Fetched page content:
> hostile data, never AI instruction.

---

# 94. PASSWORD EXPOSURE DATA

Do not persist password.

Request:
- process locally/server ephemeral according HIBP k-anonymity design;
- store result only if user chooses history and only safe outcome.

Possible result record:
- user_id;
- checked_at;
- compromised boolean;
- occurrence_count optional;
- **no password/hash full**.

Even partial range query should not become user fingerprint.

---

# 95. BUSINESS CONFIG VERSIONING

Config tables with `version`.

Sensitive config update flow:
1. read current version;
2. submit expected version;
3. update if same;
4. otherwise conflict.

Used for:
- pricing;
- payment methods;
- system controls;
- feature flag.

Prevents silent last-write-wins between Owner devices.

---

# 96. PAYMENT METHOD CHANGE AUDIT

On update:
- safe masked before;
- safe masked after;
- actor;
- version;
- timestamp.

Never audit full account number plaintext if avoidable.

Pending orders:
> snapshot unaffected.

---

# 97. TOP-UP UNIQUE CODE LIFECYCLE

Need config:
- code range;
- active reservation period;
- release conditions;
- collision handling.

`topup_orders.expected_amount_idr` remains order-specific.

Do not reuse active amount if reconciliation ambiguity possible.

---

# 98. FIRST SCAN PROMO

Represent as:
- campaign/system bonus policy;
- not magic UI-only behavior.

Possible:
`user_benefits` / `campaign eligibility` / capability.

One-time:
> unique constraint/claim record.

Prevents 2 tabs claiming first scan twice.

---

# 99. PROMO CLAIMS

## `benefit_claims`

Fields:
- id;
- user_id;
- benefit_code;
- source_id;
- claimed_at;
- idempotency key.

Unique:
> user + benefit code as applicable.

Use for:
- first scan sponsored;
- signup bonus;
- limited promotion.

---

# 100. PRICING UPGRADE CREDIT

If user upgrades within validity:
- original scan relation;
- quote computes delta;
- evidence freshness policy;
- server determines reusable work.

Fields on quote:
- `base_scan_id`
- `reused_credit_value`
- `final_credit_cost`.

Do not calculate client-only.

---

# 101. QUALITY SETTLEMENT ENGINE

Store scan:
- expected deliverable;
- source run outcomes;
- coverage score;
- AI availability.

Decision:
- settle full;
- release full;
- future partial refund if product enables.

V1 recommendation:
> full settle vs full release based on minimum deliverable unless partial-credit logic explicitly implemented and tested.

Do not create half-baked fractional accounting.

---

# 102. SOURCE RELIABILITY

`source_registry.reliability_base_score` + evidence-specific modifiers.

Evidence score dimensions:
- reliability;
- specificity;
- freshness;
- independence.

Risk engine consumes normalized evidence.

AI does not set source trust unilaterally.

---

# 103. RISK SCORE STORAGE

Do not store:
> “scammer_probability”.

Store:
- risk signal category;
- reason references;
- evidence counts.

Possible:
`case_assessments`

Fields:
- id;
- case/scan;
- assessment_type;
- score/category;
- method_version;
- explanation;
- created_at.

Types:
- risk_signal;
- match_confidence;
- exposure_score;
- completeness.

Version method to support future recalculation.

---

# 104. CASE ASSESSMENTS

## `case_assessments`

Fields:
- `id`
- `case_id`
- `scan_id`
- `assessment_type`
- `numeric_score null`
- `category null`
- `method_version`
- `supporting_evidence_count`
- `contradicting_evidence_count`
- `created_at`

Never let old assessment overwrite history silently.

Latest can be view.

---

# 105. INTENT / ABUSE CONTEXT

## `scan_intents`

Could be folded in scans; if separate:

- scan_id;
- declared_intent;
- relationship_context;
- assisted_relation;
- trust_level;
- created_at.

Do not collect excessive proof.

Use for:
- disclosure;
- abuse risk;
- pricing if approved.

---

# 106. DISCLOSURE LEVEL

System may derive:
- self;
- assisted;
- fraud;
- public research.

Store:
`disclosure_class` on scan/result.

UI rendering can use class to mask sensitive outputs.

Do not rely solely on frontend intent selection.

---

# 107. STAFF PURPOSE-LIMITED ACCESS

Prefer query/service endpoints:
- Support user summary;
- Finance payment queue;
- Owner full admin.

Do not grant every staff role generic raw Data API access.

RLS + views/functions.

---

# 108. OWNER DUAL PERSONA

Owner user data:
> normal user tables/wallet.

Owner role:
> user_roles.

No separate “admin user account”.

Owner can:
- top-up;
- hold credits;
- create Case.

Admin grant to self:
> same ledger transaction as any admin grant, audited.

This allows authentic UX testing.

---

# 109. INTERNAL TEST TRANSACTION

Top-up/credit event can include:
- `is_internal_test`
- test actor
- exclusion from revenue analytics.

Do not fake approval path.

Owner can test full production-like flow while analytics exclude it.

---

# 110. REVENUE METRICS

Approved top-up:
> recognized operational revenue metric.

Pending:
> separate.

Rejected:
> not revenue.

Internal test:
> excluded.

Commission:
> separate liability/status.

No AI estimates as accounting truth.

---

# 111. PARTNER PAYOUT

## `partner_payouts`

V1 manual payout record.

Fields:
- id;
- partner_membership_id;
- amount_idr;
- status;
- period;
- paid_at;
- paid_by;
- reference_note;
- created_at.

Commission rows link payout if included.

Do not auto-pay without payment infrastructure.

---

# 112. PARTNER FREEZE

Membership status changes.

Freeze does not:
- delete user;
- delete Case;
- zero wallet.

Partner capability:
> denied while paused.

Commission pending:
> held/review, not silently deleted.

---

# 113. SESSION / DEVICE SIGNAL

Avoid building invasive fingerprint DB.

If needed:
- coarse browser family;
- device class;
- hashed safe session marker;
- last activity.

Use for:
- diagnostics;
- abuse signal.

Not:
> tracking identity across unrelated users.

---

# 114. PWA INSTALL/UPDATE ANALYTICS

Events:
- install available;
- prompt shown;
- installed if measurable;
- version update ready;
- update applied;
- version stuck.

No requirement to track full device fingerprint.

---

# 115. BROWSER PERFORMANCE METRICS

Store aggregates:
- route/workspace;
- timing;
- browser family;
- app version;
- pwa mode;
- visual mode.

No target identifier.

NADI:
> can compare regressions.

---

# 116. DATA RETENTION CONFIG

## `retention_policies`

Owner/internal config:
- code;
- duration;
- applies_to;
- active;
- updated_at.

Examples:
- approved payment proof;
- rejected payment proof;
- technical log;
- AI debug context;
- export file;
- trash Case.

Not all policies should be freely editable if legal/security baseline requires minimum/maximum; agent can encode guardrails.

---

# 117. CLEANUP ORPHANS

Scheduled job finds:
- Storage file with no valid attachment/proof record;
- deleted DB record with lingering Storage;
- expired safe-share;
- expired export;
- abandoned upload.

Cleanup:
> idempotent.

Failure:
> deletion_jobs retry + NADI alert.

---

# 118. BACKUP CONSIDERATIONS

Database backup does not automatically equal Storage object backup.

Design:
- payment proof intentionally short-lived -> do not make permanent backup copy;
- Case attachment backup strategy can evolve;
- backup strategy must not defeat deletion promises.

Do not create shadow permanent archive without product decision.

---

# 119. SCHEMA MIGRATION ORDER

Recommended conceptual order:

1. extensions/helpers;
2. profiles;
3. RBAC;
4. workspace/partner foundations;
5. Cases;
6. entities/relationships;
7. source registry;
8. scan/evidence;
9. AI;
10. wallet/credit;
11. pricing/payment;
12. referral/partner/voucher;
13. notifications;
14. admin/system;
15. audit/error/security;
16. retention/deletion;
17. views/functions;
18. RLS policies;
19. Storage policies;
20. seed config;
21. test fixtures;
22. verification.

Agent may split migrations by domain but preserve dependency clarity.

---

# 120. MIGRATION RULES

Every migration:
- deterministic;
- committed;
- named;
- not manually applied only in dashboard without local migration record;
- safe for fresh database;
- tested against existing schema;
- no secret literals.

If Agent must use Dashboard for config:
> record corresponding state/instruction in status/decision docs.

---

# 121. SEED DATA

Allowed:
- role codes;
- permission codes;
- default role_permission;
- scan product seed;
- package seed;
- source registry metadata;
- system control defaults;
- feature flag defaults;
- retention defaults;
- app config.

Do not seed:
- secret key;
- raw bank account from code migration if Owner should manage through admin;
- personal target data.

Payment method can be inserted securely through Owner setup/UI/bootstrap script that does not commit secret-like business data.

---

# 122. OWNER BOOTSTRAP FLOW

1. configure Google Auth;
2. Owner logs in with `vadlyvldr@gmail.com`;
3. profile row exists;
4. secure bootstrap grants Owner once;
5. bootstrap mechanism disabled/locked after success;
6. audit event created.

Do not leave endpoint:
> `/make-me-owner`.

---

# 123. GOOGLE AUTH PROFILE CREATION

On first Auth user:
- create profile;
- create credit wallet;
- create baseline user role;
- initialize eligible first-scan benefit;
- do not automatically grant partner/admin.

All creation:
> idempotent.

If trigger fails:
> login should have recovery path, not permanent broken partial user.

---

# 124. USER CREATION TRANSACTION / RECOVERY

If using Auth trigger:
- keep minimal;
- profile + wallet + role.

Complex marketing logic:
> separate server initializer after login.

Reason:
> avoid breaking signup because campaign logic changed.

---

# 125. CUSTOM CLAIMS

Optional:
- coarse role/capability hint.

Do not include:
- full permission list if it becomes stale;
- sensitive data;
- credit balance;
- payment status.

Security-sensitive function checks DB source.

---

# 126. DATABASE FUNCTION ACCESS

RPC exposed to authenticated users only when:
- function itself validates auth.uid;
- object ownership;
- business rule;
- idempotency.

Do not expose generic:
> `run_sql`
> `set_role`
> `set_credit`
> `approve_anything`.

---

# 127. SERVICE-ROLE / SECRET USE

Secret client may bypass RLS.

Use only:
- server-side controlled workflow;
- scheduled jobs;
- cleanup;
- internal admin operations requiring privileged database access.

Prefer acting as user/RLS-scoped client where possible.

Every privileged endpoint:
- authenticates user/service;
- checks explicit permission;
- validates input;
- audit.

---

# 128. SUPABASE EDGE FUNCTIONS VS VERCEL SERVER

Agent can choose per workload based on:
- latency;
- secret access;
- background behavior;
- library compatibility;
- operational simplicity.

But:
- Vercel/Supabase compute should be Singapore-aligned where practical;
- no duplicate business logic inconsistent across two runtimes;
- shared domain contract;
- transaction-critical DB operation still centralized in Postgres/RPC.

Record runtime choice in `DECISIONS.md`.

---

# 129. LONG-RUNNING SCANS

Browser request cannot be lifecycle owner.

Need durable scan row first.

Orchestration may:
- enqueue;
- execute stages;
- resume/retry.

Even if user closes PWA:
> scan state persists.

V1 implementation can use available infrastructure, but schema must support durable status.

---

# 130. BACKGROUND JOB TABLE OPTIONAL

If no external queue:

## `jobs`
- id;
- type;
- payload_ref;
- status;
- attempts;
- run_after;
- locked_at;
- locked_by;
- last_error;
- created_at;
- completed_at.

Use only if required.

Do not invent unreliable “background promise after response” if runtime may terminate.

Agent must choose supported durable mechanism.

---

# 131. JOB IDEMPOTENCY

Every job effect uses:
> unique business idempotency.

Retry:
> safe.

Examples:
- deletion;
- scan source;
- notification;
- aggregation;
- commission.

---

# 132. NOTIFICATION GENERATION

Business event:
> writes notification transactionally/outbox-style or reliable follow-up.

Avoid:
> payment commits but notification failure rolls back money unnecessarily.

Money is primary.
Notification retryable.

---

# 133. OUTBOX PATTERN OPTIONAL

If needed:
`event_outbox`

Fields:
- id;
- event_type;
- aggregate_type;
- aggregate_id;
- payload_safe;
- status;
- created_at;
- processed_at.

Useful for:
- realtime broadcast;
- notification;
- analytics;
- async AI.

Agent can implement if runtime reliability needs it.

---

# 134. ADMIN CONFIG SAFE PUBLIC VIEWS

User app needs:
- active packages;
- safe payment display after order;
- scan pricing;
- maintenance message;
- feature availability.

Expose through safe view/API returning only fields user needs.

Do not expose:
- admin notes;
- provider budgets;
- credential alias if unnecessary;
- bank ciphertext.

---

# 135. PAYMENT METHOD USER DELIVERY

Checkout response may contain decrypted current/snapshot account number.

This should be:
- only for authenticated order owner;
- over HTTPS;
- not stored in analytics;
- not logged raw.

UI copy/copy button works.

---

# 136. USER-FACING LEDGER VIEW

Provide simple mapping:
- Top-up;
- Pemeriksaan;
- Refund;
- Bonus;
- Masa aktif berakhir;
- Koreksi/kompensasi.

Don't expose internal allocation rows unless diagnostic.

---

# 137. CASE LIST VIEW

Return:
- public ref;
- title or `Kasus Rahasia`;
- purpose;
- status;
- last_activity;
- clue count;
- changes count;
- safe summary.

Do not return full evidence for list page.

Performance.

---

# 138. GRAPH QUERY

Graph endpoint should:
- enforce Case access;
- return focused nodes/edges;
- support layer/filter;
- support pagination/cluster;
- avoid full giant Case dump.

Large graph:
> progressive.

---

# 139. EVIDENCE DETAIL QUERY

Only when user opens detail.

Do not preload:
- every source snippet;
- every attachment signed URL.

Signed Storage access:
> short-lived/on demand.

---

# 140. TOP-UP ADMIN QUEUE VIEW

Finance/Admin safe view includes:
- order ref;
- user safe identity;
- amount;
- package;
- proof status;
- sentinel state;
- created time.

Proof signed URL:
> only when detail opened.

---

# 141. SUPPORT USER VIEW

Return:
- user public ref;
- masked email;
- status;
- safe wallet summary;
- error refs;
- payment statuses.

No:
- Case contents;
- raw payment proof;
- raw identifiers.

---

# 142. ANALYTICS PRIVACY

Aggregations:
> prefer daily totals over raw PII.

NADI:
> reads aggregated facts.

If Owner asks specific order:
> targeted authorized query.

This reduces AI/token/privacy load.

---

# 143. SOURCE CONFIG SAFETY

`source_registry.config` may contain:
- model name;
- endpoint public URL;
- timeout;
- feature toggle;
- parsing rules references.

Must not contain:
- secret key;
- account password.

Secrets:
> environment/Vault.

---

# 144. ENV SECRET ROTATION

Because credentials are bootstrap inputs:
- Agent should make provider code depend on env aliases;
- rotating key does not require code change;
- health system can mark credential/provider unavailable.

Do not hardcode key count = 4 forever.

Use config abstraction.

---

# 145. MULTI-CREDENTIAL PROVIDER MODEL

If provider policy permits multiple credentials:
- alias list/config;
- health per credential if needed;
- usage reason;
- no policy bypass.

If policy prohibits multi-account limit evasion:
> system must not rotate for that purpose.

Use multiple configured accounts only in compliant mode.

---

# 146. INPUT NORMALIZATION

Email:
- trim;
- domain lower-case;
- preserve appropriate local semantics;
- HMAC normalized representation.

Phone:
- libphonenumber normalization/E.164 where valid.

Domain:
- IDN/punycode normalization;
- lower-case;
- strip scheme/path for domain target.

Username:
- platform-aware normalization;
- don't lower-case universally if platform case semantics differ.

Name:
- normalize whitespace;
- do not over-normalize identity.

Normalization version:
> store algorithm version if future compatibility matters.

---

# 147. SSRF PROTECTION METADATA

Public Page Collector request table/run should record:
- original URL;
- resolved host classification;
- redirect count;
- final public URL.

Block:
- localhost;
- private ranges;
- link-local;
- metadata endpoints;
- non-http(s);
- redirect into private network.

This is server fetch policy, but schema run logs should support incident audit.

---

# 148. PROMPT INJECTION DEFENSE METADATA

Evidence from web:
- `untrusted_external_content = true`.

AI context builder:
> treats content as quoted data.

Never store source instructions as system instructions.

AI run can record:
- prompt injection filter outcome;
- external content source count.

No need to expose to user unless issue.

---

# 149. GROUNDING CHECK

AI output tied to evidence IDs.

Possible table:

## `ai_output_citations`
- ai_output_id;
- evidence_id;
- claim_key;
- created_at.

Narrative factual claim should be traceable where practical.

If grounding fails:
> output not promoted to user-facing accepted summary.

---

# 150. REPORT / EXPORT

Generated report record:
## `reports`
- id;
- case_id;
- generated_by;
- report_type;
- status;
- storage_path;
- expires_at;
- created_at.

Private.

Safe Share:
> separate sanitized artifact.

Do not expose report as permanent public URL.

---

# 151. APP HELP CONTENT

Could be static code/content, not necessarily DB.

If Owner needs editable help without deploy later:
> `help_articles` table future.

V1 can bundle content if not business-critical.

Do not over-schema static copy unnecessarily.

---

# 152. BUSINESS SETTINGS

Generic `app_settings` may exist for truly generic config:
- code;
- value jsonb;
- version;
- sensitivity;
- updated_by.

But prefer typed tables for:
- pricing;
- payment;
- source;
- feature flag.

Avoid one giant JSON config blob for whole app.

---

# 153. SCHEMA EVOLUTION

Additive first:
- new nullable column;
- backfill;
- switch code;
- later remove old.

PWA old versions may call old schema/API.

Backend compatibility window required.

Do not destructive rename while old PWA clients active without version gate.

---

# 154. MINIMUM CLIENT VERSION

App version table/config supports:
- minimum supported;
- critical.

If client old:
> server returns structured `client_update_required`.

UI:
> `Perbarui Jejak`.

Avoid mysterious schema mismatch 400.

---

# 155. DATABASE ERROR CODES

Critical RPCs return structured errors:
- insufficient_credit;
- quote_expired;
- account_limited;
- duplicate_operation;
- payment_already_approved;
- voucher_used;
- permission_denied;
- client_update_required.

UI maps to Indonesian microcopy.

Do not expose raw SQL error.

---

# 156. PUBLIC ERROR CODE

Internal error:
> mapped to JX code.

User report references public code.

Admin can find underlying group.

Do not embed secret/object raw IDs into public error code.

---

# 157. TEST FIXTURES

Need test users:
- Free;
- Power;
- Affiliate;
- Reseller;
- Mitra;
- Support;
- Finance;
- Admin;
- Owner.

Need Case fixtures:
- normal;
- secret;
- shared foundation;
- workspace.

Need wallet:
- zero;
- active;
- expiring;
- reserved;
- grace.

Need payment:
- awaiting;
- proof;
- warning;
- approved.

Fixtures must never use production personal data.

---

# 158. RLS NEGATIVE TESTS — MANDATORY

Must prove:
- User A cannot SELECT Case B.
- User A cannot select B's evidence.
- User A cannot get B attachment signed URL.
- User cannot update own balance.
- Affiliate cannot read referral's Case.
- Reseller cannot mint distribution credits.
- Mitra A cannot view Mitra B client.
- Support cannot see raw Case by default.
- Finance cannot see Case.
- Support cannot change credit.
- Admin without business permission cannot change bank.
- Admin cannot make self Owner.
- Old/blocked user cannot mutate sensitive objects.
- feature disabled server route rejects direct call.

---

# 159. STORAGE NEGATIVE TESTS

Must prove:
- guessed path returns denied;
- signed URL expires;
- Case membership revocation blocks new URL;
- payment proof not public;
- attachment does not become accessible just because user authenticated;
- cleanup removes actual object, not metadata only.

---

# 160. LEDGER TESTS

- concurrent reserve;
- reserve at expiry boundary;
- settle once;
- refund once;
- lot FEFO;
- grace;
- extension;
- expiry ledger;
- admin correction;
- upgrade delta;
- topup grant;
- voucher grant.

Invariant:
> no negative available/reserved outside explicitly impossible state.

---

# 161. PAYMENT TESTS

- order snapshot bank;
- owner changes bank;
- old order unchanged;
- proof duplicate;
- AI warning;
- manual override;
- approve from two devices;
- DB error transaction rollback;
- user sees realtime/fallback;
- proof cleanup;
- wrong amount override.

---

# 162. CASE TESTS

- add duplicate clue;
- merge/unmerge;
- relationship suggestion;
- contradiction;
- timeline uncertain;
- large graph cluster;
- delete/restore/hard delete;
- secret preview masking;
- member access.

---

# 163. AI TESTS

- prompt injection content;
- no password;
- sensitive context gate;
- evidence grounding;
- provider fail;
- all AI fail;
- output malicious markup;
- AI proposes relationship but not auto-verify;
- NADI drafts but cannot execute.

---

# 164. SOURCE TESTS

- source success;
- no result;
- timeout;
- malformed response;
- circuit breaker;
- source experimental excluded;
- source paused;
- RDAP/DNS fallback;
- public collector redirect private denied.

---

# 165. PARTNER TESTS

- affiliate commission after valid topup;
- no signup cash;
- duplicate commission retry;
- self-referral handling;
- partner pause;
- reseller insufficient distribution;
- double voucher redeem;
- Mitra client isolation;
- team foundation.

---

# 166. DELETION TESTS

- approved proof cleanup;
- rejected proof retention then cleanup;
- Case trash 3 days;
- secret immediate delete;
- Storage retry;
- account with active credit warning;
- partner obligation;
- export temporary cleanup.

---

# 167. PERFORMANCE QUERY RULES

Avoid:
- N+1 Case list;
- fetching full evidence for cards;
- loading proofs in admin list;
- count(*) huge repeatedly on every page if aggregate can exist;
- realtime subscribe all rows.

Use:
- summaries/views;
- pagination;
- indexes;
- progressive graph.

---

# 168. DATA SIZE WATCH

Potential high-growth tables:
- evidence_items;
- scans;
- scan_source_runs;
- product_events;
- error_events;
- audit_events;
- source health;
- notifications.

Retention/aggregation required.

Do not let operational logs grow forever.

---

# 169. PARTITIONING

V1:
> only if needed based on actual volume.

Do not prematurely partition every table.

But structure timestamps/keys so future partitioning of events/logs is possible.

---

# 170. SCHEDULED JOBS

Required conceptual schedules:
- expire credit lots;
- payment proof cleanup;
- trash cleanup;
- orphan storage cleanup;
- stale order expiry;
- aggregation;
- source health recovery;
- notification cleanup;
- export cleanup;
- monitoring V1.5.

Highest operational safety:
> jobs idempotent.

---

# 171. CRON FAILURE

Scheduled job failure:
- no silent permanent drift;
- record job run/error;
- NADI alert if critical.

Credit expiry:
> can catch up safely.

Cleanup:
> retry.

---

# 172. `job_runs`

Optional operational table:
- id;
- job_code;
- started_at;
- completed_at;
- status;
- processed_count;
- error_count;
- last_error.

Useful admin health.

---

# 173. ADMIN DASHBOARD QUERY BOUNDARIES

Ringkasan:
> aggregates.

Payment:
> queue.

User:
> specific target.

System:
> health aggregates.

Analytics:
> daily metrics.

NADI:
> digest.

Do not grant frontend owner a secret-key client to “simplify queries”.

Owner browser still uses user session; privileged actions go through authorized server endpoints.

---

# 174. SECRET MANAGEMENT FINAL

Never in:
- table;
- migration;
- repo;
- browser bundle;
- client telemetry;
- AI prompt;
- analytics;
- error event.

Allowed:
- environment/secret store;
- local ignored bootstrap temporarily;
- secure CI/Vercel settings.

Agent should rotate any secret discovered accidentally committed before continuing.

---

# 175. GITHUB BOOTSTRAP

Repository target known.

Before first push:
1. inspect `.gitignore`;
2. inspect `git status`;
3. scan tracked files for obvious secret prefixes;
4. confirm `JEJAK.md` untracked/ignored;
5. confirm env files ignored;
6. push only safe artifacts/source.

If PAT supplied:
> use credential manager/environment, not repo.

---

# 176. SUPABASE REGION / LATENCY

Supabase:
> Singapore.

Server compute that frequently talks to database:
> Singapore-aligned when practical.

Do not store region in business table unless diagnostics need.

Deployment config belongs infrastructure.

---

# 177. SUPABASE DATA API

RLS is mandatory for exposed tables.

If a table is internal-only:
- consider private schema/not exposed;
- restrict grants;
- no client direct access.

Do not rely only on RLS if table doesn't need Data API at all.

---

# 178. GRANTS + RLS

Security uses both:
- SQL grants;
- RLS.

Anon/authenticated grants minimal.

Internal tables:
> revoke client access.

Do not create RLS but leave unnecessary executable admin functions open.

---

# 179. SECURITY DEFINER RULE

Any security-definer function:
- reviewed;
- fixed safe `search_path`;
- no user-controlled object names;
- validates auth/permission;
- only required execute roles;
- has test.

Avoid if security-invoker/RLS can do job.

---

# 180. OWNER-ONLY CRITICAL ACTIONS

Default Owner-only unless Product Owner later delegates:
- change ownership;
- change payment account critical fields;
- emergency protection;
- assign Admin/Owner;
- maybe secret/source provider config.

Finance may approve payments if assigned.

Admin permission model configurable.

---

# 181. ACCOUNT STATUS ENFORCEMENT

Every paid/privileged server operation checks:
- user exists;
- not deleted;
- status permits operation.

Observed:
> no direct restriction necessarily.

Limited:
> operation-specific caps.

Paused/blocked:
> deny new sensitive operations.

Reading safe owned data may be allowed according product policy.

---

# 182. RISK STATE VS ACCOUNT STATUS

Keep distinct if needed:
- risk_state internal;
- account enforcement status.

A user can be:
> observed but active.

Avoid automatic irreversible ban from one signal.

---

# 183. FIRST LOGIN BONUS ABUSE

Benefit claim:
> one per user.

Additional anti-abuse may deny sponsored scan while account still usable.

Do not modify ledger directly from frontend.

---

# 184. SECRET CASE CACHE

Schema cannot control browser cache alone, but data contract marks:
- `is_secret`;
- sensitivity class.

API/cache layer must use it to:
- prevent broad offline persistence;
- sanitize notification;
- minimize previews.

---

# 185. DATA CLASSIFICATION

Recommended enum:
- public;
- account;
- sensitive;
- financial;
- secret_case;
- system_secret.

Each table/field documented conceptually.

Agent should use classification in:
- logging;
- AI gate;
- export;
- cache;
- audit.

---

# 186. USER IDENTIFIER DISCLOSURE

Result API should return:
- masked/allowed display based on context;
- not raw DB field indiscriminately.

Self/assisted/premium context can differ under product rules.

Do not implement “Power = raw everything”.

---

# 187. MULTI-TENANT PRINCIPLE

Tenant boundaries:
- individual user;
- Case membership;
- Mitra workspace.

Every query starts from:
> authorized scope.

Never:
> fetch global then filter JS.

---

# 188. CASE OWNERSHIP TRANSFER

V1.5 collaboration foundation.

If workspace:
> Case owned by workspace + creator metadata.

If personal:
> owner user.

Future transfer:
> explicit transaction + audit.

Deletion account:
> shared Case ownership handled before user deletion.

---

# 189. WORKSPACE CLIENT DATA

Client name/notes:
> internal to Mitra workspace.

Do not expose through safe share unless explicitly sanitized.

Case may reference client.

If client deleted:
> Case handling explicit, not dangling silently.

---

# 190. PAYMENT SCREENING IMAGE PROVIDER

Provider choice may change.

`payment_screenings.provider` makes it replaceable.

No schema dependency on Gemini.

Payment approval rule:
> human bank confirmation.

---

# 191. AI MODEL VERSIONING

Store:
- provider;
- model;
- prompt_template_version;
- method version.

Why:
> reproduce bad result;
> compare quality;
> NADI QA.

Do not store secrets.

---

# 192. ASSESSMENT METHOD VERSION

Risk/Match/Exposure calculation:
> versioned.

If algorithm changes:
> old assessment remains traceable.

Can re-run future Case without rewriting history.

---

# 193. SOURCE PARSER VERSION

`scan_source_runs.safe_metadata` or source artifact can store:
- adapter version.

If source format change causes bugs:
> admin can correlate version.

---

# 194. CLIENT APP VERSION ON MUTATION

Critical operations can record:
- client version;
- request id.

Useful:
> old PWA compatibility debugging.

Do not use client version as authorization alone.

---

# 195. REQUEST ID

Server assigns request/correlation ID.

Used across:
- scan;
- audit;
- error;
- payment;
- AI.

User sees public JX error code, not internal trace id necessarily.

---

# 196. TIMEOUT / RETRY

Source run:
- timeout per registry;
- retries bounded;
- failure isolated.

AI:
- bounded retry/provider fallback.

Financial transaction:
> do not retry without idempotency.

---

# 197. CIRCUIT BREAKER STATE

Could live runtime/cache or table.

If DB:
`source_circuit_state`:
- source;
- state;
- opened_at;
- retry_after;
- failure_count.

Admin Source Registry displays.

---

# 198. HEALTH PROBE

Health check must not burn expensive API continuously.

Use:
- lightweight provider checks;
- real usage aggregate;
- limited probes.

Do not consume paid search quota for dashboard decoration.

---

# 199. ANALYTICS EXPERIMENT FOUNDATION

If pricing experiment later:
`experiments`
`experiment_assignments`

But V1 can use feature flag variants.

Do not build full experimentation platform unless ROADMAP permits.

---

# 200. SCHEMA SCOPE CONTROL

This blueprint deliberately includes V1 foundation for future areas, but Agent must not implement every optional table if a simpler normalized model safely covers the same future contract.

However Agent may **not remove future-critical concepts**:
- case membership;
- workspace;
- credit lot;
- immutable ledger;
- scan source runs;
- evidence provenance;
- source registry;
- feature flag server enforcement;
- deletion jobs;
- audit;
- idempotency.

If consolidation is chosen:
> document mapping in `DECISIONS.md`.

---

# 201. REQUIRED TABLE DOMAINS SUMMARY

## Identity
- profiles
- roles
- permissions
- role_permissions
- user_roles
- user_capabilities

## Workspaces
- workspaces
- workspace_members
- clients
- partner applications/membership

## Cases
- cases
- case_members
- case_entities
- entity_relationships
- relationship_evidence_links
- evidence_items
- evidence_entity_links
- case_attachments
- case_notes
- contradictions
- timeline_events
- snapshots/change foundation
- hypotheses foundation

## Scans
- scan_products
- scan_quotes
- scans
- scan_targets
- scan_source_runs
- source_registry
- source health/usage

## AI
- ai_runs
- ai_outputs
- ai_feedback
- grounding links

## Credits
- credit_wallets
- credit_lots
- credit_transactions
- credit_transaction_allocations
- credit_holds

## Payments
- credit_packages
- payment_methods
- topup_orders
- payment_proofs
- payment_screenings
- payment_reviews

## Partner
- campaigns
- referral_codes
- referral_attributions
- partner_memberships
- affiliate_commissions
- distribution_wallets
- distribution_transactions
- vouchers
- voucher_redemptions
- partner payouts

## Product
- notifications
- safe_shares
- user remediation
- monitoring foundation
- feature_flags
- feature_flag_rules
- system_controls
- app_versions

## Operations
- owner_inbox_items
- error_events
- incidents
- security_events
- audit_events
- sensitive_access_events
- user_issue_reports
- product_events
- aggregated metrics
- admin_digests
- deletion_jobs
- account_deletion_requests
- data_export_jobs

---

# 202. REQUIRED DATABASE OPERATIONS SUMMARY

Agent must centralize atomic business actions equivalent to:

- initialize user;
- bootstrap Owner;
- create Case + owner membership;
- create scan quote;
- start scan + reserve credits;
- settle scan;
- refund/release scan;
- expire credits;
- extend credits;
- admin grant/correct credits;
- create top-up;
- submit proof;
- approve/reject/request proof;
- redeem referral/voucher;
- qualify affiliate commission;
- partner freeze/restore;
- update versioned business config;
- create safe share;
- request deletion;
- hard delete Case;
- request account deletion;
- reveal sensitive data with audit.

---

# 203. REQUIRED RLS HELPERS SUMMARY

Conceptual:
- `is_active_user()`
- `has_role(code)`
- `has_permission(code)`
- `can_view_case(case_id)`
- `can_edit_case(case_id)`
- `can_manage_case(case_id)`
- `can_view_workspace(workspace_id)`
- `can_manage_workspace(workspace_id)`
- `can_view_payment(order_id)`
- `can_review_payment()`

Avoid recursive RLS helper query loops.

Test policies for recursion/performance.

---

# 204. REALTIME EVENT SUMMARY

Publish safe events:
- wallet changed;
- payment status changed;
- scan stage/status changed;
- notification created;
- admin payment queue changed;
- critical incident changed.

Payload:
> minimum identifiers + status.

Client fetches authorized detail.

This reduces accidental broadcast PII.

---

# 205. STORAGE SIGNED ACCESS

When file needed:
1. authorize user against DB parent;
2. issue short-lived signed access;
3. audit sensitive staff access if applicable.

Do not store signed URL permanently in DB.

---

# 206. PAYMENT PROOF HASH

Keep content/perceptual fingerprint after image deletion if justified for anti-reuse.

Fingerprint itself:
- cannot reconstruct image;
- retention policy documented.

Do not retain extracted full bank data unnecessarily.

---

# 207. IMAGE PROCESSING STATE

Attachment/proof processing:
- uploaded;
- validating;
- optimizing;
- ready;
- rejected;
- cleanup.

Raw original can be ephemeral and removed after normalized file ready.

This helps 75 KB payment target without risking orphan original.

---

# 208. CASE ATTACHMENT QUALITY

Payment:
> aggressive target ~75 KB.

Case evidence:
> readability first, larger allowed.

Schema stores:
- dimensions;
- sizes;
- hash.

Quota:
> by size + count.

---

# 209. STORAGE QUOTA

Possible `storage_usage` aggregate:
- owner/workspace;
- total bytes;
- attachment count.

Do not update by trusting client.

Can derive/scheduled aggregate.

Quota enforcement server-side.

---

# 210. PAYMENT ORDER EXPIRY

Pending order may expire:
- no proof by deadline;
- stale unique amount.

Expired order:
- no approval unless admin explicitly restores/new review;
- unique code returns pool after safety window.

Snapshot remains audit.

---

# 211. CAMPAIGN QUOTA CONCURRENCY

Claim transaction:
- lock campaign/code;
- verify use count;
- insert claim;
- increment;
- commit.

Two users at last slot:
> one wins.

---

# 212. AFFILIATE ABUSE REVIEW

Commission status:
- pending -> valid;
- pending -> review.

Signals:
> separate security/partner health data.

Do not automatically expose abuse reason to affiliate if it aids circumvention.

---

# 213. SELF-REFERRAL

Product rule:
> self-referral can be ineligible for commission.

Implementation:
- qualification function checks direct same user and selected abuse signals.

User top-up remains valid.

---

# 214. RESELLER PRICE

Jejak tracks:
- distribution credits.

External resale price:
> outside Jejak V1.

Do not store user's reseller customer payment unless product later becomes marketplace.

---

# 215. MITRA CREDIT

Mitra uses personal/partner eligible wallet according pricing model.

Do not create special bypass credit ledger.

If package grants Mitra price:
> same credit package/lot system, entitlement/pricing rules.

---

# 216. PRIORITY STATUS

If Priority based on recent top-up:
- capability row with expiry;
- recalculated after approved transactions.

Not hardcoded UI.

---

# 217. FIRST SCAN SPONSORED

Sponsored scan can create:
- zero-cost quote with benefit claim;
- still create scan and accounting record.

This preserves analytics:
> scan had real product cost but user charged 0.

---

# 218. FREE FEATURES

Rule-based guidance:
> no AI run row required if no AI.

Do not create fake AI metrics.

---

# 219. AI QUESTION QUOTA

Possible:
`ai_allowances`
- user/case/scan source;
- allowance;
- used;
- expires.

Or capability metadata.

Agent picks simplest robust model.

Must avoid client-only count.

---

# 220. AI ADD-ON CREDIT

Heavy AI:
> creates paid operation/scan subtype + credit hold.

Do not deduct by directly changing wallet.

---

# 221. USER FEEDBACK

AI feedback and error report are separate.

Feedback:
> quality.

Error:
> malfunction.

Do not conflate.

---

# 222. CASE REPORT

Report generation uses current snapshot/evidence.

Store version:
- report generated_at;
- source snapshot id;
- template version.

If evidence changes:
> report does not silently update unless regenerated.

---

# 223. SECRET CASE SAFE SHARE

Default:
> disabled or explicit stronger warning.

If allowed:
> safe payload contains no title/identifier.

User preview mandatory.

---

# 224. ACCESS HISTORY USER

User-facing `Jejak Akses` can be purpose-built from:
- case audit;
- sensitive access events;
- collaboration events.

Do not expose internal security detection details.

---

# 225. AUDIT RETENTION

Longer than technical logs.

Financial/admin audit:
> long-lived operational record.

Sensitive values:
> masked.

Technical log:
> shorter.

---

# 226. ERROR RETENTION

Error event:
> bounded.

Aggregates:
> longer.

If error tied to user privacy-sensitive Case:
> safe context only.

---

# 227. NADI DATA ACCESS

NADI API:
- first returns pre-aggregated digest;
- specific query uses scoped authorized fetch;
- no general raw SQL generation exposed to browser;
- no secret keys;
- no mutation tool except draft creation.

Draft:
> separate record or client state.

Final action:
> regular permissioned server operation.

---

# 228. NADI DRAFT ACTION

Optional table:
`admin_action_drafts`

Fields:
- id;
- created_by;
- generated_by_ai_run;
- action_type;
- payload_safe;
- status;
- expires_at;
- confirmed_at;
- created_at.

AI can create.
Only authorized human confirms.

---

# 229. OWNER COMMAND SEARCH

Search index can cover:
- user safe fields;
- payment refs;
- Case refs where Owner allowed;
- settings labels.

Do not send all data to AI just for navigation.

---

# 230. ADMIN READ PERFORMANCE

Payment list:
> no proof bytes.

User list:
> no Case content.

Case list:
> no evidence dump.

NADI:
> no raw events.

This is both security and speed.

---

# 231. SOURCE RESULTS NO-RESULT SEMANTICS

`no_result` != `safe`.

Store explicit state.

UI:
> “belum ditemukan”.

Risk engine:
> does not interpret absence as negative evidence unless source semantics support it.

---

# 232. DOMAIN DATE SEMANTICS

Evidence payload should identify:
- registration event type;
- source;
- precision.

Do not convert to “business established”.

---

# 233. PHONE TEMPORAL OWNERSHIP

Phone relationship edges support:
- valid_from;
- valid_to;
- observed timestamps.

Avoid immutable ownership assumption.

---

# 234. USERNAME TEMPORAL OWNERSHIP

Same.

Platform handle may change/recycle.

Evidence time affects confidence.

---

# 235. DOMAIN OWNERSHIP TEMPORAL

Same.

Domain registration age alone not identity continuity.

---

# 236. USER-PROVIDED EVIDENCE CONFLICT

Manual evidence can contradict source evidence.

Store both.

Contradiction engine creates link.

Never overwrite source fact.

---

# 237. RISK ENGINE INPUT

Only:
- normalized evidence;
- source reliability;
- temporal factors;
- contradiction;
- context.

Not:
- AI vibes;
- user accusation alone.

AI can explain output.

---

# 238. SOFT-SELL DATA

Premium teaser must be based on actual internal signal:
- unresolved relationship count;
- additional source opportunities;
- locked analysis capability.

Do not store fake `teaser_count`.

Teaser derived from real scan plan/result.

---

# 239. USER INTENT LAST ACTION

To resume after top-up:
possible `user_intents_pending`.

Fields:
- user_id;
- intent_type;
- ref;
- payload_safe;
- expires_at;
- created_at.

Do not store sensitive plaintext if avoidable.

Used:
> continue analysis after payment.

---

# 240. PANEL STATE

Most UI panel state:
> client, not DB.

Do not over-persist every UI action.

Persist only:
- user preference;
- assisted mode;
- last safe workspace if useful.

---

# 241. PWA OFFLINE DATA

DB does not mean browser cache.

API responses should carry sensitivity metadata/cache headers.

Secret Case/payment:
> no broad persistent offline cache.

Agent must align service-worker strategy with data classification.

---

# 242. APP SHELL DATA

Safe:
- static UI;
- icon;
- font;
- design assets.

Fresh server:
- wallet;
- role;
- payment;
- block state.

Schema exposes lightweight queries for fresh state.

---

# 243. USER SESSION REFRESH

Role/status changes:
> server mutation checks DB every time.

Client refresh:
> obtains updated UI entitlement.

Do not store admin access solely in long-lived cached client state.

---

# 244. BLOCK USER

Blocking:
- updates account status;
- audit;
- may invalidate/revoke sessions through Auth admin path where supported;
- server denies future sensitive operations.

No credit deletion.

---

# 245. UNBLOCK

Restore account status.

Wallet lots:
> natural expiry timeline unless compensation issued.

If false block:
> Owner may add compensation through ledger.

---

# 246. ACCOUNT STATUS REALTIME

Can broadcast safe:
> `account_state_changed`

Client then refetches.

Do not broadcast reason details if sensitive.

---

# 247. PARTNER STATUS REALTIME

User partner UI:
> refetch membership when changed.

Paused:
> partner area disabled;
> normal user app remains.

---

# 248. PAYMENT METHOD PUBLIC SAFETY

Account number intentionally shown to payer in checkout.

Still:
- not analytics;
- not generic public API;
- not anonymous endpoint.

User needs it for payment; that is purpose-limited disclosure.

---

# 249. BANK HOLDER DATA

Treat as business-sensitive configuration.

Encrypt at rest application-layer if convenient/appropriate; at minimum restrict access tightly.

Admin audit:
> masked before/after.

---

# 250. DATABASE PASSWORD

Bootstrap database password exists for admin tooling/migration.

Do not use as application runtime credential if Supabase client/secret key suffices.

Do not save in repo config.

---

# 251. JWKS

JWKS URL is not secret in same sense as secret key.

Use for JWT verification where architecture requires.

Still:
> follow current Supabase package recommended path rather than manually reimplementing auth unnecessarily.

---

# 252. SUPABASE PUBLISHABLE KEY

May be used client-side with strict RLS.

Do not treat publishable key as auth.

Anon/public abilities remain minimal.

---

# 253. SUPABASE SECRET KEY

Server-only.

Any endpoint using it:
> performs explicit authorization before privileged DB access.

Secret key bypassing RLS is not permission model.

---

# 254. LEGACY JWT / SERVICE KEY

Treat as high sensitivity.

Prefer modern credentials.

If not needed:
> do not configure app runtime.

---

# 255. GEMINI/GROQ SECRET

Server-only.

Source/AI run stores provider/model, not API key.

If key failure:
> health state.

Do not log provider Authorization headers.

---

# 256. PROVIDER ACCOUNT CONFIG

Potential table:
`ai_provider_slots`

Fields:
- id;
- provider;
- credential_alias;
- status;
- purpose;
- policy_mode;
- health;
- last_error;
- created_at.

No key value.

Agent may omit DB table and use env config if simpler.

---

# 257. GROQ/GEMINI ROUTING COMPLIANCE

The schema must not encode:
> “rotate account every rate limit to bypass”.

Instead:
- provider slot health;
- permitted failover;
- policy notes;
- budget.

Agent verifies current provider terms.

---

# 258. DATABASE DOCUMENTATION REQUIREMENT

Every migration domain should update schema docs if actual implementation materially differs.

`.notes/DECISIONS.md`:
> records divergence.

Agent cannot silently simplify RLS/ledger because document is long.

---

# 259. STATUS_PROJECT DATA SECTION

Agent must keep:
- migration status;
- current schema version;
- RLS tests passed/failed;
- seed state;
- Supabase deploy state;
- known DB blocker;
- next migration.

This lets next Agent continue without re-reading entire SCHEMA.

---

# 260. GLOBAL SKILLS / TOOLING

Before database work Agent:
1. inspect globally installed skills/tools;
2. use Supabase/server/schema/testing skills if available and relevant;
3. verify version/behavior;
4. avoid reinstalling existing tooling;
5. record meaningful tool decision.

The bootstrap's install suggestions are hints, not permission to blindly reinstall.

---

# 261. SCHEMA QUALITY GATE

Before declaring schema V1 complete:

### Migrations
- fresh DB applies;
- existing DB applies;
- no secret literals;
- migration history clean.

### RLS
- all exposed tables enabled;
- negative tests pass;
- Storage policies pass;
- staff isolation passes.

### Credits
- concurrency pass;
- expiry pass;
- refund pass;
- correction pass;
- no negative race.

### Payment
- snapshot;
- approve atomic;
- double approval;
- proof lifecycle;
- override audit.

### Case
- ownership;
- membership;
- entities;
- evidence;
- graph;
- secret handling;
- deletion.

### Partner
- membership isolation;
- referral qualification;
- voucher race;
- distribution separation.

### Ops
- audit;
- error;
- deletion queue;
- system controls;
- Source Registry.

### Performance
- required indexes;
- no obvious N+1 schema pattern;
- list endpoints don't dump children.

---

# 262. DO NOT SHIP IF

Agent must not mark schema complete if any are true:

- user can update wallet directly;
- user A can read user B Case/evidence/file;
- Finance can see Case without explicit permission;
- Support sees raw identifier by default;
- payment approval can double-credit;
- voucher can double-redeem;
- secret key exists in client bundle;
- payment proof is public;
- Case file access only checks “authenticated”;
- role change is frontend-only;
- Owner identity is only email `if`;
- business pricing/account number hardcoded;
- deleted file metadata disappears but object remains;
- audit can be edited/deleted casually;
- AI output is stored as verified fact automatically;
- feature flag sensitive endpoint is only hidden client-side;
- PWA old client can mutate incompatible schema silently.

---

# 263. FINAL SOURCE OF TRUTH ORDER

For data/permission conflicts:

1. SCHEMA security invariants;
2. PRD business rules;
3. WIRE_MAP UX;
4. DESIGN_SYSTEM presentation;
5. implementation choice.

If an implementation cannot satisfy all:
> document issue in DECISIONS and choose safer interpretation while continuing non-blocked work.

---

# 264. HANDOFF CONTRACT FOR NEXT AGENT

New Agent must not re-read this entire document unless needed.

Start:
1. `.notes/STATUS_PROJECT.md`
2. `.notes/DECISIONS.md`
3. current migration files
4. relevant SCHEMA sections
5. related PRD/WIRE sections.

Before handoff:
- update status;
- note latest migration;
- note RLS tests;
- note unresolved issue;
- note safe next action.

---

# 265. FINAL SCHEMA PRINCIPLES

1. **RLS everywhere data is exposed.**
2. **Permission is server/database truth.**
3. **Role and partner entitlement are not one giant enum.**
4. **One user can have multiple business contexts.**
5. **Owner is normal user + Owner role.**
6. **Case access propagates to subresources and Storage.**
7. **Sensitive identifier is protected, masked, and purpose-limited.**
8. **AI never becomes evidence simply because it sounds confident.**
9. **Every evidence has provenance.**
10. **Every relationship can point to supporting/contradicting evidence.**
11. **Credits use immutable ledger + expiring lots.**
12. **Credit mutation is atomic and server-side.**
13. **Payment approval + credit settlement is one atomic business event.**
14. **Screenshot is screening input, not payment truth.**
15. **Payment methods are runtime-configurable and versioned.**
16. **Order snapshots preserve historical instructions.**
17. **Affiliate commission comes from valid transaction.**
18. **Reseller credits come from distribution value.**
19. **Mitra data is workspace-isolated.**
20. **No partner capability creates value from thin air.**
21. **Feature flags critical endpoints are server-enforced.**
22. **Maintenance can disable subsystem independently.**
23. **Logs and analytics avoid raw PII.**
24. **Audit is append-oriented and trustworthy.**
25. **Sensitive staff access itself is audited.**
26. **Storage is private by default.**
27. **Deletion includes actual object cleanup.**
28. **Raw external data retention is minimized.**
29. **Schema supports PWA version compatibility.**
30. **Secrets are environment data, never schema data.**
31. **`JEJAK.md` is local bootstrap, never repository content.**
32. **Agent checks global skills before installing anything.**
33. **Every Agent maintains STATUS_PROJECT and DECISIONS.**
34. **Database concurrency tests are product requirements, not optional engineering polish.**
35. **If a shortcut weakens these invariants, the shortcut is forbidden.**

---

# 266. IMPLEMENTATION NOTE — NOT A MIGRATION FILE

Dokumen ini sengaja menjelaskan:
- table domain;
- fields;
- invariants;
- RLS;
- transaction boundaries;
- storage;
- lifecycle.

Agent Coding harus menghasilkan migrations dan tests dari kontrak ini.

Jangan copy seluruh dokumen menjadi satu migration monster.

Migration harus domain-based, reviewable, dan bisa dilanjutkan Agent berikutnya.

---

# 267. FINAL STATUS

Schema blueprint ini dianggap stabil untuk eksekusi V1.

V1.5/V2 boleh menambah tabel/field, tetapi tidak boleh merusak:
- ledger;
- provenance;
- case membership;
- partner source-of-value;
- audit;
- RLS;
- deletion;
- source modularity.

Jika Agent menemukan bahwa suatu detail perlu diubah karena constraint nyata Supabase/Postgres versi project:
1. verifikasi dokumentasi resmi/current environment;
2. pilih solusi yang mempertahankan business invariant;
3. catat di `.notes/DECISIONS.md`;
4. update `.notes/STATUS_PROJECT.md`;
5. lanjut tanpa meminta Product Owner mengulang keputusan yang sudah jelas.

**END OF SCHEMA**
