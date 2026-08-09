# ENVIRONMENT CONTRACT — JEJAK

> **Status:** Kontrak environment, secret, provider credential, deployment environment, dan bootstrap runtime untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Tujuan:** Mencegah salah pasang secret, credential bocor, environment drift, dan perbedaan perilaku local/preview/production  
> **Berlaku untuk:** Semua Agent Coding dan seluruh runtime Jejak  
> **Source of truth terkait:** `docs/SCHEMA.md`, `docs/ROADMAP.md`, `.notes/AGENTS.md`, `.notes/STATUS_PROJECT.md`, `.notes/DECISIONS.md`, `PROMPT_PEMBUKA.md`  
> **Secret bootstrap lokal:** `JEJAK.md` — JANGAN COMMIT

---

# 0. TUJUAN DOKUMEN

Dokumen ini menjawab:

> **“Credential apa yang Jejak punya, mana yang boleh masuk browser, mana yang wajib server-only, di mana nilainya disimpan, bagaimana local/preview/production dibedakan, bagaimana Agent memverifikasi environment, dan apa yang harus dilakukan kalau secret bocor?”**

Environment bukan urusan tambahan.

Kalau environment salah:
- RLS bisa terlihat benar tapi server diam-diam pakai privileged key;
- secret bisa masuk browser;
- provider key bisa bocor ke source map;
- preview deployment bisa memakai production secret;
- PWA lama bisa memanggil endpoint baru dengan config lama;
- database migration bisa dijalankan ke project yang salah;
- Agent bisa tanpa sadar push credential ke Git.

Karena itu:
> **Environment correctness adalah bagian dari security dan production readiness.**

---

# 1. HUKUM UTAMA ENVIRONMENT

1. **Secret tidak pernah masuk browser.**
2. **Secret tidak pernah masuk repository.**
3. **Secret tidak pernah ditulis ulang di Markdown tracked.**
4. **`JEJAK.md` adalah local bootstrap, bukan source code.**
5. **Client-safe key tetap membutuhkan RLS.**
6. **Server secret bukan authorization model.**
7. **Preview tidak boleh otomatis memakai seluruh production secret tanpa alasan.**
8. **Local, Preview, Production harus jelas berbeda.**
9. **Environment harus divalidasi saat startup/build.**
10. **Credential rotation tidak boleh memerlukan code rewrite.**
11. **Provider key banyak bukan izin bypass quota/ToS.**
12. **Database target harus diverifikasi sebelum migration.**
13. **Git target harus diverifikasi sebelum push.**
14. **Secret leak dianggap incident, bukan typo biasa.**
15. **Agent wajib update STATUS jika environment state berubah.**

---

# 2. ENVIRONMENT TIERS

Jejak minimal mengenal:

## 2.1 LOCAL

Untuk:
- development;
- migration development;
- unit/integration test;
- local browser QA;
- provider test terbatas.

Karakteristik:
- developer machine/container;
- `.env.local` / secure local env;
- boleh memakai test provider credential;
- jangan memakai production data kalau tidak perlu.

---

## 2.2 TEST / INTEGRATION

Boleh berupa:
- dedicated Supabase test project;
- isolated schema;
- isolated database;
- CI test environment.

Digunakan untuk:
- RLS negative tests;
- ledger concurrency;
- payment race;
- destructive cleanup tests;
- migration fresh-DB test.

Jika belum punya dedicated test project:
> Agent harus memilih isolasi yang aman dan mencatat keputusan.

---

## 2.3 PREVIEW

Deployment Vercel branch/PR.

Digunakan untuk:
- UI review;
- E2E;
- PWA pre-release;
- browser/device QA;
- canary feature.

Rules:
- protected;
- jangan gunakan production secrets secara default;
- jangan mengarah ke production DB tanpa explicit reason;
- jangan menerima real user traffic terbuka.

---

## 2.4 PRODUCTION

User nyata.

Rules:
- secret production only;
- exact project target verified;
- feature flags/maintenance available;
- audit active;
- PWA versioning active;
- provider budgets active;
- error monitoring active.

---

# 3. BOOTSTRAP FILE — `JEJAK.md`

## 3.1 Fungsi

`JEJAK.md` diberikan Product Owner sebagai local bootstrap.

Isinya dapat mencakup:
- Supabase metadata;
- Supabase publishable/secret credentials;
- legacy Supabase credentials;
- database connection information;
- Gemini credentials;
- Groq credentials;
- GitHub repository information;
- provider notes;
- environment setup notes.

---

## 3.2 Status Keamanan

`JEJAK.md`:
> **LOCAL SECRET ONLY**

Wajib:
- `.gitignore`;
- tidak staged;
- tidak committed;
- tidak di-upload ke issue;
- tidak dikirim ke AI provider;
- tidak disalin ke docs tracked.

---

## 3.3 Sebelum Agent Menggunakannya

Agent:
1. cek file benar-benar ada;
2. jangan print seluruh isi;
3. baca hanya field yang diperlukan;
4. map nilai ke environment;
5. validate target;
6. jangan menyalin raw secret ke STATUS/DECISIONS.

---

## 3.4 Setelah Environment Berhasil Dibuat

Agent tidak wajib menghapus `JEJAK.md`.

Lebih aman:
> simpan lokal ignored sebagai emergency bootstrap sampai Product Owner memutuskan lain.

Tapi:
- jangan bergantung padanya setiap runtime;
- application runtime membaca secret store/env, bukan Markdown.

---

# 4. SUPABASE PROJECT IDENTITY

Known project metadata:

```text
Project: JEJAK
Project ID: tauyicvfhpfnohhgccvn
Region: ap-southeast-1
Target geography: Singapore
```

Sebelum migration atau production operation:
> verify project ID.

Jangan hanya mengandalkan:
> project name.

---

# 5. SUPABASE ENV CLASSIFICATION

## 5.1 Client-safe

Recommended public env:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Jika bootstrap memakai nama berbeda:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

Agent boleh map.

---

## 5.2 Server-only

```text
SUPABASE_SECRET_KEY
```

Jika runtime/tooling membutuhkan:
```text
SUPABASE_JWKS_URL
```

JWKS URL sendiri bukan secret kuat, tapi penggunaannya tetap server/runtime-oriented sesuai library.

---

## 5.3 Legacy / Restricted

Bootstrap mungkin memuat:

```text
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
SUPABASE_DB_PASSWORD
```

Rules:
- prefer current Supabase credential model;
- jangan expose service-role/JWT secret/DB password;
- legacy service key hanya jika benar-benar dibutuhkan;
- DB password hanya tooling/migration/admin connection;
- jangan jadikan application request credential normal.

---

# 6. SUPABASE CLIENT-SAFE TIDAK BERARTI PUBLIC DATA

Publishable key boleh di browser karena:
> authorization utama = user session + RLS.

Jangan pernah berpikir:
> “publishable berarti semua tabel aman dibuka.”

Anon/authenticated grants harus minimal.

---

# 7. SUPABASE SECRET KEY

Secret key:
> privileged server credential.

Kalau dipakai:
- endpoint wajib authenticate;
- endpoint wajib permission check;
- input validate;
- audit jika sensitive;
- jangan expose raw DB object ke caller.

Secret key **tidak menggantikan permission system**.

---

# 8. DATABASE PASSWORD

Gunakan hanya untuk:
- migration tooling;
- admin DB connection;
- CLI operation;
- secure local/CI task.

Jangan gunakan:
- browser;
- API call normal;
- server request per user;
- client-side migration.

---

# 9. SUPABASE CLI LINK

Sebelum:

```text
supabase db push
supabase migration up
supabase functions deploy
```

Agent wajib verify:
- project ref;
- environment;
- branch;
- current migration head.

Kalau target belum jelas:
> jangan apply destructive migration.

---

# 10. GOOGLE OAUTH ENVIRONMENT

Google OAuth memerlukan per-environment callback/redirect awareness.

Track:
- local callback;
- preview callback bila used;
- production callback.

Jangan hardcode callback production di source jika framework/client dapat derive dengan aman.

---

# 11. OWNER BOOTSTRAP

Known initial Owner:
> `vadlyvldr@gmail.com`

Ini:
- bukan secret;
- boleh tercatat di blueprint;
- hanya bootstrap identity.

Authorization sesudah bootstrap:
> database role.

Jangan buat:

```text
if email == vadlyvldr@gmail.com then admin
```

sebagai production security.

---

# 12. GEMINI CREDENTIALS

Bootstrap menyediakan beberapa Gemini API key.

Recommended env aliases:

```text
GEMINI_API_KEY_1
GEMINI_API_KEY_2
GEMINI_API_KEY_3
GEMINI_API_KEY_4
```

Atau structured alternative jika runtime mendukung.

---

# 13. GROQ CREDENTIALS

Bootstrap menyediakan beberapa Groq API key.

Recommended aliases:

```text
GROQ_API_KEY_1
GROQ_API_KEY_2
GROQ_API_KEY_3
GROQ_API_KEY_4
```

---

# 14. PROVIDER KEY RULE

Jumlah key bukan business invariant.

Jangan hardcode:
> `for i in range(4)`.

Lebih baik:
- discover configured slots;
- build provider slot list dari env;
- skip empty;
- health check per slot jika needed.

Ini membuat rotation/add/remove tidak butuh rewrite.

---

# 15. MULTI-KEY COMPLIANCE

Multiple keys hanya boleh dipakai untuk:
- availability;
- failover;
- testing;
- compliant load separation;
- provider account isolation yang sah.

Tidak boleh dirancang untuk:
- circumvent rate limits;
- bypass quotas;
- evade billing;
- evade provider controls.

Agent wajib verify current terms.

---

# 16. PROVIDER SLOT MODEL

Conceptual runtime representation:

```text
provider
credential_alias
health
enabled
purpose
policy_mode
last_failure
```

Raw key:
> hanya environment.

DB:
> optional metadata, tidak raw key.

---

# 17. AI PROVIDER ENV

Potential optional config:

```text
AI_DEFAULT_PROVIDER
AI_ANALYST_PROVIDER
AI_SKEPTIC_PROVIDER
AI_NADI_PROVIDER
AI_PAYMENT_VISION_PROVIDER
```

Jangan implement semua env jika config DB/Source Registry lebih cocok.

Principle:
> provider selection configurable tanpa code rewrite besar.

---

# 18. MODEL ENV / CONFIG

Model name lebih baik:
- config;
- provider registry;
- feature flag;
- DB business/system config;

daripada hardcode tersebar.

Contoh alias:
```text
GEMINI_DEFAULT_MODEL
GROQ_DEFAULT_MODEL
```

Tapi Agent boleh memilih config DB.

---

# 19. SENSITIVE AI ROUTING

Jika operation melibatkan:
- payment proof;
- raw sensitive PII;
- secret Case;
- financial data;

provider route harus melewati:
> Sensitive Data Gate.

Jangan pilih provider hanya karena key tersedia.

---

# 20. HIBP PASSWORD FEATURE

HIBP Pwned Passwords dapat bekerja tanpa raw password persistence.

Jika API key diperlukan oleh current provider flow:
> server-only.

Raw password:
- tidak env;
- tidak DB;
- tidak log;
- tidak AI.

---

# 21. RDAP / DNS

Public source yang tidak membutuhkan secret:
> jangan invent secret env.

No need:
- `RDAP_API_KEY` jika source tidak memerlukannya.

Keep environment minimal.

---

# 22. GITHUB

Known repo target:

```text
https://github.com/vallendrino-vldr/JEJAK.git
```

Before push:
- verify remote;
- verify branch;
- verify staged files;
- secret scan.

---

# 23. GITHUB TOKEN

Jika Agent mendapat PAT/token:

Recommended local alias:
```text
GITHUB_TOKEN
```

atau credential manager.

Rules:
- jangan commit;
- jangan save ke Markdown;
- minimum scope;
- rotate jika leaked.

---

# 24. GITHUB CLI

Jika `gh` tersedia:
> gunakan secure credential store.

Jangan menyimpan token ke shell script tracked.

---

# 25. VERCEL

Recommended environment separation:
- Development
- Preview
- Production

Agent harus memastikan variable classification benar.

---

# 26. VERCEL ENV — PUBLIC

Examples:
```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_APP_VERSION
```

`NEXT_PUBLIC_APP_VERSION` boleh juga di-inject build.

---

# 27. VERCEL ENV — SERVER SECRET

Examples:
```text
SUPABASE_SECRET_KEY
GEMINI_API_KEY_1
...
GROQ_API_KEY_1
...
IDENTIFIER_HMAC_KEY
IDENTIFIER_ENCRYPTION_KEY
SAFE_SHARE_SIGNING_KEY
INTERNAL_JOB_SECRET
```

Jangan memasukkan secret ke public namespace.

---

# 28. APP URL

Recommended:

```text
NEXT_PUBLIC_APP_URL
```

Values:
- Local: `http://localhost:3000`
- Preview: preview URL generated/derived
- Production: `https://jejak.my.id`

Agent dapat derive preview hostname dari platform runtime bila lebih tepat.

---

# 29. APP VERSION

Need:
- semantic/version identifier;
- build ID.

Potential:
```text
NEXT_PUBLIC_APP_VERSION
APP_BUILD_ID
```

PWA Version Sentinel membutuhkan stable comparison.

---

# 30. ENV VALIDATION

Application harus punya centralized env validation.

Goal:
- missing server secret fail early;
- invalid URL fail early;
- malformed boolean/number fail early;
- no silent `undefined`.

---

# 31. CLIENT ENV VALIDATION

Only validate public env in client build context.

Do not import server env module into client component.

---

# 32. SERVER ENV MODULE

Recommended:
> satu module server-only untuk reading secret.

Benefits:
- centralized;
- typed;
- easier audit;
- reduces accidental client import.

---

# 33. ENV NAMING RULE

Prefer:
- uppercase;
- clear provider prefix;
- suffix role.

Examples:

```text
SUPABASE_SECRET_KEY
GROQ_API_KEY_1
IDENTIFIER_HMAC_KEY
```

Avoid:
```text
KEY1
SECRET2
TOKEN_NEW
```

---

# 34. ENV COMMENT RULE

`.env.example` boleh ada.

Tapi hanya:
- variable names;
- dummy placeholders;
- explanation.

Tidak:
> nilai asli.

---

# 35. `.env.example`

Recommended tracked file:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SECRET_KEY=

GEMINI_API_KEY_1=
GEMINI_API_KEY_2=
GEMINI_API_KEY_3=
GEMINI_API_KEY_4=

GROQ_API_KEY_1=
GROQ_API_KEY_2=
GROQ_API_KEY_3=
GROQ_API_KEY_4=

IDENTIFIER_HMAC_KEY=
IDENTIFIER_ENCRYPTION_KEY=
SAFE_SHARE_SIGNING_KEY=

NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_VERSION=
```

Agent boleh menambah env yang benar-benar dipakai.

---

# 36. JANGAN MASUKKAN UNUSED ENV

Environment contract bukan daftar wishlist.

Jika variable tidak digunakan:
> jangan penuhi project dengan env dummy.

---

# 37. CRYPTO KEYS

Untuk identifier HMAC/encryption:

```text
IDENTIFIER_HMAC_KEY
IDENTIFIER_ENCRYPTION_KEY
```

Rules:
- strong random;
- separate keys;
- server-only;
- rotation strategy documented;
- not derived dari provider key.

---

# 38. HMAC KEY ROTATION

Kalau HMAC key berubah:
- existing blind index tidak lagi match.

Jadi rotation:
> butuh versioning/migration plan.

Possible:
- `hmac_key_version`;
- dual-read transition;
- reindex controlled.

Decision final:
> dicatat di DECISIONS saat implementation.

---

# 39. ENCRYPTION KEY ROTATION

Sama:
> tidak boleh rotate sembarang tanpa decrypt/re-encrypt plan.

Potential:
- key version per record;
- envelope encryption;
- staged re-encryption.

Agent pilih approach suitable dan record.

---

# 40. SAFE SHARE SIGNING

Jika safe share pakai signed token:
```text
SAFE_SHARE_SIGNING_KEY
```

Jika pakai random opaque token + hash DB:
> signing key mungkin tidak perlu.

Jangan create env unnecessary.

---

# 41. INTERNAL JOB AUTH

Jika internal job endpoint membutuhkan secret:

```text
INTERNAL_JOB_SECRET
```

Rules:
- server-only;
- rotateable;
- not same as Supabase key.

---

# 42. CRON SECRET

Jika platform cron membutuhkan secret:
```text
CRON_SECRET
```

Use only jika infrastructure membutuhkan.

---

# 43. WEBHOOK SECRET

Payment V1 manual:
> mungkin belum ada webhook.

Jangan create webhook env sebelum feature ada.

V2 gateway:
> per-provider signing secret.

---

# 44. ERROR MONITORING SECRET

Jika menggunakan service seperti Sentry/other:
- public DSN classification cek docs;
- auth token server/CI only.

Agent harus current-doc verify.

---

# 45. ANALYTICS

Jika third-party analytics digunakan:
- no raw PII;
- public write key classification sesuai provider;
- admin/management token server-only.

V1 boleh internal analytics tanpa external service.

---

# 46. ENVIRONMENT DRIFT

Problem:
> local works, preview fails, production differs.

Mitigation:
- `.env.example`;
- environment validation;
- STATUS records environment readiness;
- automated smoke per environment.

---

# 47. ENV MATRIX

Maintain conceptual table:

| Variable | Local | Test | Preview | Production | Public? |
|---|---|---|---|---|---|
| Supabase URL | ✓ | ✓ | ✓ | ✓ | Yes |
| Supabase publishable | ✓ | ✓ | ✓ | ✓ | Yes |
| Supabase secret | ✓ | ✓ | ✓ | ✓ | No |
| Gemini | optional | optional | optional | ✓ | No |
| Groq | optional | optional | optional | ✓ | No |
| HMAC key | ✓ | ✓ | ✓ | ✓ | No |
| Encryption key | ✓ | ✓ | ✓ | ✓ | No |
| App URL | ✓ | ✓ | ✓ | ✓ | Yes |

Actual values:
> never in tracked docs.

---

# 48. LOCAL ENV

Recommended:
> `.env.local`

Ignored.

Agent can generate from `JEJAK.md`.

---

# 49. TEST ENV

Recommended:
- CI secret variables;
- `.env.test.local` ignored.

Do not reuse production secret unless necessary.

---

# 50. PREVIEW ENV

Prefer:
- test/non-production Supabase;
- provider test slots;
- protected Vercel preview.

If preview must hit production DB for a specific reason:
> explicit DEC + restricted capabilities.

---

# 51. PRODUCTION ENV

Only production:
- real payment method;
- production provider budget;
- production Supabase;
- production domain.

---

# 52. ENVIRONMENT PROMOTION

Do not manually copy random values repeatedly.

Prefer:
- documented mapping;
- platform environment controls;
- scripted/CLI safe setup if possible.

---

# 53. SECRET ROTATION PRINCIPLE

Rotation should:
- not require code rewrite;
- update secret store;
- restart/redeploy safely;
- health-check provider;
- record status.

---

# 54. PROVIDER KEY ROTATION

If one provider key invalid:
- mark slot unhealthy;
- remove/replace secret;
- do not expose key;
- do not break all AI.

---

# 55. SUPABASE SECRET ROTATION

If privileged secret changes:
- update server env;
- redeploy;
- verify admin/cleanup jobs;
- no client change necessary.

---

# 56. DB PASSWORD ROTATION

After rotation:
- CLI/dev env update;
- app runtime should be unaffected if it doesn't use DB password directly.

Good architecture:
> app does not depend on DB password.

---

# 57. SECRET LEAK — LOCAL ONLY

If secret accidentally printed locally but not shared/persisted:
- assess exposure;
- clear logs/history if needed;
- rotate if uncertain.

---

# 58. SECRET LEAK — STAGED BUT NOT COMMITTED

If secret staged:
1. unstage;
2. ignore;
3. scan diff;
4. verify no commit;
5. rotate only if exposure path occurred.

---

# 59. SECRET LEAK — COMMITTED LOCAL, NOT PUSHED

1. remove from commit/history;
2. amend/rewrite local;
3. verify history;
4. consider rotation if local environment shared.

---

# 60. SECRET LEAK — PUSHED

Treat compromised.

1. rotate immediately;
2. remove from source;
3. clean Git history;
4. verify remote history;
5. redeploy;
6. secret scan;
7. audit incident;
8. update STATUS/DECISIONS if relevant.

---

# 61. SECRET LEAK — CLIENT BUNDLE

Treat compromised even if repo private.

1. rotate;
2. remove;
3. rebuild;
4. invalidate old deploy if possible;
5. check logs/provider usage;
6. deploy clean version.

---

# 62. SECRET LEAK — LOG

If logs store secret:
- rotate;
- purge logs if supported;
- fix logger;
- add redaction;
- add acceptance regression test.

---

# 63. SECRET LEAK — AI PROMPT

If secret sent to Gemini/Groq:
- rotate;
- investigate provider retention/policy;
- mark incident.

---

# 64. REDACTION

Logger should redact:
- Authorization;
- Cookie;
- Set-Cookie;
- API key headers;
- database URLs with password;
- tokens;
- request bodies containing sensitive password/payment data.

---

# 65. ERROR REPORTING

JX error:
> no secret.

Safe diagnostics:
- app version;
- browser family;
- PWA mode;
- operation;
- public error code.

No:
- raw env;
- raw request headers.

---

# 66. DATABASE CONNECTION STRING

If connection string stored:
> secret.

Never:
- print whole;
- include password in logs;
- put in README.

---

# 67. SUPABASE URL

Supabase project URL:
> public-safe.

Still avoid unnecessary spread into logs? Fine.

---

# 68. PUBLISHABLE KEY

Publishable key:
> client-safe by design.

Still:
- don't treat as admin;
- RLS mandatory.

---

# 69. SERVICE ROLE / SECRET KEY

Server-only.

---

# 70. JWKS

JWKS endpoint:
> public verification metadata.

Use current auth libraries.

Do not manually roll JWT verification unless needed.

---

# 71. APP DOMAIN

Production:
```text
https://jejak.my.id
```

Allowed origins/callbacks should match.

---

# 72. CORS

Do not set:
> `*`

for privileged endpoints unless endpoint truly public.

Prefer:
- same-origin;
- explicit allowed origin;
- platform defaults with correct auth.

---

# 73. CSP / SECURITY HEADERS

Environment may affect:
- API domains;
- image domains;
- connect-src.

Agent must avoid `unsafe-*` broadening just to make dev easy.

---

# 74. PREVIEW ORIGIN

Preview URLs vary.

If strict origin config:
> Agent needs safe wildcard/domain strategy for Vercel preview.

Never allow arbitrary origin to privileged API.

---

# 75. ENV IN EDGE RUNTIME

Some environment APIs differ in Edge.

Agent must verify:
- secret availability;
- Node APIs;
- package compatibility.

Record runtime split if significant.

---

# 76. NEXT.JS SERVER ACTIONS

Server actions:
> may access server env.

Never import server env module into client boundary.

---

# 77. ROUTE HANDLERS

Same:
> server-only env allowed.

But endpoint still:
- auth;
- permission;
- validation.

---

# 78. CLIENT COMPONENT

Client component:
> only public env.

---

# 79. SUPABASE EDGE FUNCTIONS

If used:
> secrets configured through Supabase secret management.

Do not copy Vercel `.env` file into repo.

---

# 80. VERCEL FUNCTIONS

Secrets:
> Vercel Environment Variables.

---

# 81. DUAL RUNTIME SECRET SYNC

If both Vercel and Supabase Functions use same provider:
> secret may need to exist in both platforms.

Track by alias, not raw value.

STATUS can say:
```text
GROQ slot env configured: Vercel ✓ / Supabase Functions ✓
```

No raw key.

---

# 82. SECRET INVENTORY

Agent should maintain conceptual inventory, not values.

Example STATUS/ops:

```text
Supabase publishable: configured
Supabase secret: configured
Gemini slots: 4 configured / 4 healthy
Groq slots: 4 configured / 3 healthy
HMAC key: configured
Encryption key: configured
```

---

# 83. HEALTH ≠ SECRET VALIDITY ONLY

Provider key health can fail due:
- revoked key;
- quota;
- billing;
- provider outage;
- model unavailable;
- region/policy.

Health status should not expose reason if sensitive.

---

# 84. PROVIDER BUDGET CONFIG

Budget values:
> system/business config.

Do not encode budget in secret env unless purely infra-specific.

---

# 85. SOURCE REGISTRY CREDENTIAL ALIAS

DB can store:

```text
credential_alias = "GROQ_API_KEY_1"
```

Never:
```text
credential_value = "gsk_..."
```

---

# 86. SECRET NAMING IN DB

Credential alias is okay.

But avoid exposing aliases to normal users.

Admin technical detail only.

---

# 87. PAYMENT METHOD DATA IS NOT ENV

Bank account config:
> database business config.

Do not put payment account number in `.env`.

Why:
- Owner must edit without redeploy;
- order snapshot;
- audit;
- versioning.

---

# 88. PRICING IS NOT ENV

Pricing:
> DB config.

Do not:
```text
PRICE_POWER=149000
```

as business source of truth.

---

# 89. SCAN CREDIT COST IS NOT ENV

DB config.

---

# 90. FEATURE FLAG IS NOT ENV BY DEFAULT

Feature flags:
> DB/runtime config.

Env may bootstrap emergency default, but not main control.

---

# 91. MAINTENANCE IS NOT ENV

Owner must toggle without redeploy.

---

# 92. SOURCE ENABLED/DISABLED IS NOT ENV

Source Registry.

---

# 93. MODEL NAME CAN BE CONFIG, NOT SECRET

Prefer admin/system config if changeable.

---

# 94. RETENTION POLICY IS NOT ENV

DB config with guardrails.

---

# 95. SECRET SHOULD BE SECRET, CONFIG SHOULD BE CONFIG

Rule:

> **Kalau Product Owner perlu mengubahnya dari Ruang Kendali tanpa redeploy, jangan jadikan env.**

---

# 96. ENVIRONMENT VALIDATION ERROR

User-facing:
> jangan tampilkan nama secret.

Admin/dev log:
> boleh bilang alias missing.

Example:
> `Missing server environment: GROQ_API_KEY_1`

Never print value.

---

# 97. PRODUCTION STARTUP CHECK

Before release:
- Supabase URL configured;
- publishable configured;
- server secret configured;
- at least required provider paths configured;
- HMAC/encryption configured;
- App URL correct;
- version set.

---

# 98. PROVIDER OPTIONALITY

If Gemini unavailable:
> core may still run via Groq/rule fallback depending feature.

If Groq unavailable:
> core may still run.

Do not make startup fail for optional providers unless feature requires them.

---

# 99. ENV REQUIREMENT CLASSES

Use categories:
- `required_core`
- `required_prod`
- `optional_provider`
- `dev_only`

This makes validation smarter.

---

# 100. EXAMPLE CLASSIFICATION

```text
NEXT_PUBLIC_SUPABASE_URL          required_core
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY required_core
SUPABASE_SECRET_KEY              required_prod/server workflows
GEMINI_API_KEY_1                 optional_provider
GROQ_API_KEY_1                   optional_provider
IDENTIFIER_HMAC_KEY              required_prod
IDENTIFIER_ENCRYPTION_KEY        required_prod
NEXT_PUBLIC_APP_URL              required_prod
```

---

# 101. LOCAL PROVIDER TEST

Use minimal requests.

Don't burn quota just to prove startup.

---

# 102. PROVIDER PROBE

Health probe should:
- cheap;
- infrequent;
- not expose user data;
- not burn paid search quota unnecessarily.

---

# 103. ENVIRONMENT TESTS

Agent should implement tests equivalent:

### ENV-001
Public bundle contains only approved `NEXT_PUBLIC_*`.

### ENV-002
Missing server secret fails safe.

### ENV-003
`JEJAK.md` ignored.

### ENV-004
`.env.local` ignored.

### ENV-005
Production app URL matches expected.

### ENV-006
Supabase project ref matches expected before migration.

### ENV-007
Provider key can be rotated without code change.

### ENV-008
Client cannot import server env module.

### ENV-009
Preview does not unintentionally use production payment/config.

### ENV-010
Secret scanner passes.

---

# 104. CI SECRET MANAGEMENT

If CI used:
- use platform secret store;
- never echo env;
- mask command output;
- avoid debug flags printing env.

---

# 105. CI PR FROM UNTRUSTED SOURCE

Do not expose production secrets to arbitrary PR/fork workflow.

Use:
- restricted jobs;
- no secrets for untrusted PR;
- safe preview.

---

# 106. BUILD LOGS

Avoid tools/plugins that print environment.

---

# 107. SOURCE MAP

Production source map may expose source but should not expose env if implementation correct.

Secret in source is still bug regardless source map.

---

# 108. NEXT_PUBLIC IS FOREVER PUBLIC

Any env prefixed `NEXT_PUBLIC_`:
> assume attacker can read it.

Never temporarily put secret there “buat testing”.

---

# 109. PUBLIC DEMO

Demo landing:
> no provider key.

100% local dummy.

---

# 110. ANONYMOUS ROUTES

Should not require provider secret for demo.

---

# 111. CLIENT-TO-PROVIDER DIRECT CALL

Dilarang untuk:
- Gemini;
- Groq;
- privileged Supabase;
- paid external sources.

All through server.

---

# 112. SUPABASE BROWSER CALL

Allowed using:
- publishable;
- user session;
- RLS.

---

# 113. SERVER PRIVILEGED CALL

Use only where needed.

Prefer user-context/RLS for normal owned data.

---

# 114. OWNER BROWSER

Owner browser still:
> user session.

Do not inject Supabase secret into Owner UI.

---

# 115. ADMIN ACTION

Owner/admin browser calls server endpoint.

Server:
- verifies session;
- checks permission;
- uses controlled DB operation.

---

# 116. PAYMENT PROOF AI

If provider key required:
> server route only.

Proof bytes:
> never through client provider call.

---

# 117. SOURCE FETCH

Server route/job.

---

# 118. SAFE SHARE

Public route should not require exposing server secret.

Server handles token lookup.

---

# 119. SECRET ENV ACCESS LOGGING

Do not log:
> “Loaded key xyz”.

Log only:
> provider configured/not configured.

---

# 120. PROVIDER KEY IDENTIFIER

If debugging:
> use slot alias.

Example:
> `groq-slot-2 failed`

not raw key suffix if avoidable.

---

# 121. SECRET STORAGE PREFERENCE

Order:
1. platform secret store;
2. local ignored env;
3. secure credential manager;
4. local bootstrap ignored file.

Never:
> tracked plaintext.

---

# 122. VERCEL ENV SYNC

If Agent can use Vercel CLI:
> set environment directly.

Do not ask Product Owner to copy/paste 12 values if tool access exists.

---

# 123. SUPABASE FUNCTION SECRET SYNC

Same:
> Agent handles if tool access exists.

---

# 124. BLOCKER RULE

If platform login/OTP blocks secret setup:
> ask Product Owner only for that human-only step.

Then continue everything independent.

---

# 125. ENVIRONMENT STATUS IN STATUS_PROJECT

Agent must update:

```text
Environment:
- Local: READY / PARTIAL / FAIL
- Preview: READY / PARTIAL / FAIL
- Production: READY / PARTIAL / FAIL

Supabase:
- project ref verified
- connection verified
- migrations head

Providers:
- Gemini slots healthy x/y
- Groq slots healthy x/y

Secret Scan:
- PASS/FAIL
```

No raw values.

---

# 126. DECISIONS TO RECORD

Create DEC if significant:
- secret manager choice;
- dual-runtime secret sync;
- encryption key versioning;
- HMAC rotation design;
- provider slot routing;
- test environment isolation;
- preview database strategy.

---

# 127. ENVIRONMENT ANTI-PATTERNS

Dilarang:

```text
const GROQ_KEY = "gsk_..."
```

Dilarang:
```text
NEXT_PUBLIC_GROQ_KEY
```

Dilarang:
```text
bank_account=... in .env
```

Dilarang:
```text
PRICE_POWER=149000 as source of truth
```

Dilarang:
```text
service role in localStorage
```

Dilarang:
```text
console.log(process.env)
```

Dilarang:
```text
commit .env.local
```

---

# 128. APP CONFIG VS ENV DECISION TREE

Pertanyaan:

### Apakah value harus rahasia?
Ya → env/secret store.

### Apakah Owner perlu edit tanpa deploy?
Ya → DB config.

### Apakah value public build metadata?
Ya → public env/build constant.

### Apakah value per environment?
Ya → env/config.

### Apakah value user-specific?
Ya → DB/user data.

---

# 129. EXAMPLES

## Supabase URL
Public + environment-specific
→ public env.

## Supabase secret
Secret + environment-specific
→ server env.

## BCA account
Business-editable
→ DB payment_methods.

## Credit package price
Business-editable
→ DB config.

## Gemini key
Secret
→ server env.

## Feature flag
Runtime-editable
→ DB config.

## App version
Public build metadata
→ public build env.

---

# 130. PRODUCTION SECRET SETUP CHECKLIST

```text
[ ] Supabase public URL
[ ] Supabase publishable
[ ] Supabase server secret
[ ] AI provider keys required
[ ] HMAC key
[ ] Encryption key
[ ] Safe share key if design uses signing
[ ] Internal job/cron secret if used
[ ] App URL
[ ] App version/build
[ ] Error monitoring secret if used
```

Only actual implemented variables.

---

# 131. PREVIEW SECRET SETUP CHECKLIST

```text
[ ] protected preview
[ ] non-production DB or explicitly constrained prod access
[ ] no production payment method mutation
[ ] no broad public access
[ ] provider budget low
[ ] feature canary flags
```

---

# 132. LOCAL SETUP CHECKLIST

```text
[ ] JEJAK.md ignored
[ ] .env.local ignored
[ ] public/server env separated
[ ] Supabase ref verified
[ ] global tools inspected
[ ] provider keys optional/valid
[ ] app boots
[ ] secret scan baseline
```

---

# 133. RELEASE ENV CHECKLIST

Before production deploy:
1. build with production env validation;
2. secret scan;
3. bundle scan;
4. Supabase ref verify;
5. migration head verify;
6. App URL verify;
7. OAuth callback verify;
8. PWA version verify;
9. provider health;
10. owner/admin smoke.

---

# 134. MIGRATION ENV SAFETY

Before DB mutation:
> print project ref/name only, not credentials.

Require explicit check:
- intended environment;
- migration head.

---

# 135. DANGEROUS COMMAND GUARD

Agent should be cautious with:
- `db reset`;
- `drop schema`;
- `supabase db reset`;
- destructive migration;
- force push.

Production destructive:
> requires stronger verification.

---

# 136. LOCAL RESET

Allowed on dedicated local/test DB if safe.

Never assume current linked Supabase is local.

---

# 137. SUPABASE LINK STATE

CLI can be linked to production project.

Agent must not run destructive command based on directory name.

---

# 138. ENV LOCKFILE

Do not create tracked file containing resolved secret.

---

# 139. ENV GENERATED TYPES

Type definition may list names.

Fine.

No values.

---

# 140. SECURITY REVIEW

Reviewer should search for:
- `process.env`;
- `NEXT_PUBLIC`;
- provider prefixes;
- known key patterns;
- database URLs;
- JWT-like strings.

---

# 141. PROVIDER PREFIX SECRET SCAN

Examples patterns:
- Gemini key style;
- Groq `gsk_`;
- Supabase JWT/service-like tokens;
- database URLs with password.

Agent uses tooling where available.

---

# 142. SECRET FALSE POSITIVE

If scanner flags dummy:
> verify.

Do not disable scanner globally.

---

# 143. ROTATION DRILL

Before launch, ideally simulate:
- replace one AI key;
- redeploy;
- system recovers.

This proves no hardcoding.

---

# 144. PROVIDER OUTAGE DRILL

Disable all Gemini:
> core continues.

Disable Groq:
> core/fallback.

Status:
> no secret details.

---

# 145. SUPABASE OUTAGE

App may show controlled unavailable state.

Do not attempt insecure local business truth.

---

# 146. ENVIRONMENT RECOVERY

If environment variable missing in production:
- affected feature degrades/maintenance;
- no secret fallback from client;
- admin health surfaces.

---

# 147. PAYMENT FEATURE WITHOUT AI PROVIDER

Payment Sentinel can be unavailable.

Manual payment review still works.

This is required resilience.

---

# 148. SCAN FEATURE WITHOUT AI

Evidence scan remains.

---

# 149. NADI WITHOUT PROVIDER

Admin manual UI remains.

---

# 150. ENVIRONMENT VERSIONING

Do not version secret values in Git.

Version:
- schema;
- config structure;
- env names;
- provider slot definitions.

---

# 151. `.env.example` UPDATE

Whenever new required env introduced:
> update `.env.example`.

Whenever env removed:
> remove from example.

---

# 152. STATUS ENV CHANGE

If required production env changes:
> note in STATUS + deploy checklist.

---

# 153. BACKWARD COMPAT ENV

If old deployed client references old public env behavior:
> PWA version gate protects incompatible changes.

---

# 154. PUBLIC CONFIG ENDPOINT

If needed:
> returns safe config only.

Never dump process.env.

---

# 155. DIAGNOSTICS

User diagnostics may show:
- app version;
- browser;
- PWA;
- connection;
- last sync.

Do not show:
- env names/value unnecessarily;
- project secret.

Admin diagnostics may show:
- provider configured/healthy;
- source enabled.

No raw key.

---

# 156. ERROR MESSAGE EXAMPLE

Good:
> `Groq provider belum tersedia. Core analysis tetap jalan.`

Bad:
> `GROQ_API_KEY_3 invalid: gsk_...`

---

# 157. OWNER VIEW PROVIDER HEALTH

Show:
- provider;
- model;
- slot health;
- last success;
- cost/budget aggregate.

Do not show raw key.

---

# 158. PROVIDER SLOT DISABLE

Owner may disable provider/source via config.

Secret still exists but unused.

---

# 159. KEY REVOCATION

When revoked:
- update secret store;
- mark old slot inactive;
- verify requests.

---

# 160. SECRET SCOPE

Where provider allows scoped keys:
> choose least privilege.

---

# 161. GITHUB PAT SCOPE

Minimum:
- repo operations required.

Don't grant org/admin if not needed.

---

# 162. DATABASE NETWORK RESTRICTION

If provider/platform supports secure networking:
> use practical secure default.

Not required to overcomplicate V1.

---

# 163. VERCEL PREVIEW PROTECTION

Required before exposing preview with any real connection.

---

# 164. LOCALHOST OAUTH

OAuth callback must be allowed only for dev.

Do not leave wildcard redirect if provider supports precise URLs.

---

# 165. PRODUCTION OAUTH

Exact:
> `jejak.my.id` route.

Agent verifies callback after deploy.

---

# 166. COOKIE/SESSION ENV

Secure cookie behavior depends environment.

Production:
- secure;
- same-site appropriate;
- correct domain.

Local:
- localhost-safe.

Use official Supabase/Next pattern.

---

# 167. SESSION SECRET

If Next/library requires own signing secret:
> server-only.

Do not create duplicate auth secret if framework doesn't require.

---

# 168. ENCRYPTION AT REST

Supabase already handles infrastructure encryption, but application-level protection still used for highly sensitive identifiers per SCHEMA where justified.

Keys:
> server-only.

---

# 169. KEY MATERIAL IN EDGE

Verify crypto library/algorithm works in selected runtime.

If not:
> move sensitive crypto operation to Node/server runtime.

Record DEC.

---

# 170. PROVIDER REQUEST LOG

Log:
- provider;
- model;
- latency;
- status;
- safe request id.

Not:
- secret;
- full prompt if sensitive;
- full target.

---

# 171. SOURCE REQUEST LOG

Same.

---

# 172. DATABASE MIGRATION CREDENTIAL

Migration command may use:
- DB password;
- access token;
- linked Supabase auth.

Store securely.

---

# 173. SUPABASE ACCESS TOKEN

CLI access token:
> secret.

Do not track.

---

# 174. VERCEL TOKEN

CLI token:
> secret.

Use credential store/env.

---

# 175. CI DEPLOY TOKEN

Same.

---

# 176. GITHUB ACTIONS

Store secrets in repository environment secrets.

Do not echo.

---

# 177. PRODUCTION APPROVAL

If CI supports protected environment:
> production deploy approval can be used.

Not required if workflow simple.

---

# 178. CONFIG SOURCE OF TRUTH

Environment:
> infrastructure secret/static per environment.

Database:
> operational business config.

Git:
> code/default schema.

---

# 179. SEED VS SECRET

Seed may contain:
- role names;
- package placeholder;
- source metadata.

Seed must not contain:
- raw API keys;
- real bank account;
- DB password.

---

# 180. INITIAL PAYMENT METHOD

Product Owner may configure after admin UI exists.

If bootstrap temporarily inserts real method:
> use secure server/admin script not committed migration.

---

# 181. INITIAL OWNER

Owner email can be seed/bootstrap condition.

Role assignment result:
> DB.

---

# 182. ENVIRONMENT MIGRATION BETWEEN AGENTS

Agent handoff must not require sharing raw secret in chat.

New Agent reads local env/secure bootstrap.

---

# 183. IF NEW AGENT CAN'T SEE SECRET

First inspect:
- local env;
- `JEJAK.md`;
- platform connection.

Only ask Product Owner if genuinely unavailable.

---

# 184. DO NOT RE-REQUEST KEYS ALREADY PRESENT

If `JEJAK.md` or env already contains required secret:
> use it.

---

# 185. SECRET OUTPUT TO PRODUCT OWNER

Never repeat secret back.

Say:
> `GROQ_API_KEY_2 sudah terpasang`.

Not value.

---

# 186. SECRET DIFFERENCE

If comparing:
> compare hash/fingerprint internally.

Do not print.

---

# 187. SECRET VALIDATION

Validate with minimal provider call or format check.

No full echo.

---

# 188. SECRET EXPIRY

If provider supports expiration:
> track status/rotation date without raw value.

---

# 189. KEY INVENTORY METADATA

Could track:
- alias;
- provider;
- environment;
- created/rotated date;
- health.

No secret.

---

# 190. ENV DOC OWNERSHIP

This file documents contract.

Actual environment state:
> STATUS_PROJECT.

Actual key values:
> secret stores / `JEJAK.md` local bootstrap.

---

# 191. DO NOT PUT CURRENT HEALTH HERE

This doc remains stable.

Use STATUS for:
- provider healthy count;
- production env ready;
- missing variable.

---

# 192. ACCEPTANCE TEST LINKS

Relevant acceptance:
- `AT-BOOT-001`
- `AT-BOOT-002`
- `AT-BOOT-003`
- `AT-BOOT-004`
- `AT-BOOT-005`
- `AT-GIT-006`
- `AT-LAUNCH-009`

Agent may add ENV-specific automated tests.

---

# 193. QUALITY GATE — LOCAL READY

Local READY when:
- app boots;
- public env correct;
- secret env loads server;
- bootstrap ignored;
- no secret staged;
- Supabase ref correct;
- smoke provider works if needed.

---

# 194. QUALITY GATE — PREVIEW READY

Preview READY when:
- protected;
- correct DB target;
- correct env;
- no production-only accidental mutation;
- build passes;
- OAuth works if used;
- PWA preview behavior known.

---

# 195. QUALITY GATE — PRODUCTION READY

Production env READY when:
- all required secrets configured;
- app URL correct;
- Supabase correct;
- OAuth correct;
- provider health acceptable;
- crypto keys present;
- secret scan pass;
- no secret in bundle;
- deployment canary pass.

---

# 196. P0 ENVIRONMENT FAILURES

P0:
- secret in browser;
- secret in Git;
- prod migration to wrong DB;
- preview public with production admin path;
- owner/admin privileged key client-side;
- database password leaked;
- provider key leaked to client.

Stop release.

---

# 197. P1 ENVIRONMENT FAILURES

P1:
- production missing required secret;
- OAuth callback broken;
- provider config breaks core;
- App URL wrong;
- preview connects wrong environment.

---

# 198. CONFIGURATION DRIFT DETECTION

Agent may implement diagnostics:
- expected project ref;
- current app version;
- environment label.

Server startup can assert:
> production domain should not target test DB.

---

# 199. ENVIRONMENT LABEL

Recommended server-only/public-safe label:

```text
APP_ENV=development|preview|production
```

If public needed:
```text
NEXT_PUBLIC_APP_ENV
```

Do not use it as security boundary.

---

# 200. SECURITY BOUNDARY

`APP_ENV=production`
> not authorization.

Never:
```text
if APP_ENV != production then allow admin
```

---

# 201. TEST FEATURE GUARDS

Internal test routes:
- feature flag;
- auth;
- owner/test user permission.

Not environment-only.

---

# 202. PREVIEW TEST USER

Use fake accounts.

---

# 203. PRODUCTION TEST OWNER

Owner can perform internal test with `internal_test` flag.

---

# 204. PAYMENT ACCOUNT ENV CONFUSION

Reiterate:
> bank account belongs DB business config, not env.

This is mandatory.

---

# 205. PROVIDER MODEL CONFIG CONFUSION

Models can change often.

Prefer config over env if owner/system must switch without deploy.

---

# 206. PROVIDER SECRET CONFIG CONFUSION

Secret stays env.

---

# 207. SOURCE ENABLED CONFIG CONFUSION

Source state stays Source Registry.

---

# 208. API BASE URL

If third-party provider has stable API:
> can hardcode official base URL or config.

No need env for every stable URL.

---

# 209. PUBLIC SOURCE URL

RDAP/DNS endpoints:
> config/source adapter.

Not secret.

---

# 210. RATE LIMIT

Rate/business policy:
> DB/system config/runtime constants.

Not secret.

---

# 211. USER CREDITS

Never env.

---

# 212. OWNER EMAIL

Bootstrap config can be constant/env/seed.

Not secret.

But authorization DB-driven.

---

# 213. REPOSITORY URL

Public metadata.

Can be README.

---

# 214. SUPABASE PROJECT ID

Public metadata.

Can be docs.

---

# 215. DATABASE PASSWORD

Never docs.

---

# 216. LEGACY JWT SECRET

Never docs.

---

# 217. SECRET CLEANUP BEFORE HANDOFF

Before ending session:
- no secret temp file newly tracked;
- shell history safe where possible;
- generated debug dump removed;
- STATUS updated.

---

# 218. `JEJAK.md` ACCESS

Agent should not copy file into subfolders.

One local bootstrap file enough.

---

# 219. TEMP FILES

If Agent needs generated config:
> create ignored temp location.

Delete after.

---

# 220. SECRET IN TEST FIXTURE

Never real.

Use:
```text
test-key-placeholder
```

---

# 221. SECRET IN SNAPSHOT

Never real.

---

# 222. SECRET IN SCREENSHOT

Redact.

---

# 223. SECRET IN TERMINAL CAPTURE

Redact.

---

# 224. SECRET IN ISSUE REPORT

Never.

---

# 225. SECRET IN DECISION

Use alias only.

---

# 226. SECRET IN STATUS

Use:
> configured / missing / unhealthy.

No value.

---

# 227. PROVIDER COST & KEY HEALTH

Admin may show:
- usage;
- cost;
- health.

Key alias maybe hidden technical detail.

---

# 228. OWNER UI SECRET MANAGEMENT

V1 does not need to show/edit provider secret from admin unless secure mechanism intentionally built.

Safer:
> provider secrets remain platform secret store.

Owner business config:
> runtime config.

---

# 229. FUTURE SECRET UI

If someday provider key edited in app:
- encrypt;
- never return raw after save;
- reveal not supported;
- audit;
- owner-only;
- server secret storage integration.

Not V1 requirement.

---

# 230. ENVIRONMENT CONTRACT FOR AGENT

Agent wajib:
1. inspect;
2. classify;
3. map;
4. validate;
5. test;
6. never echo;
7. never commit;
8. record state;
9. continue.

---

# 231. FIRST RUN EXECUTION

First Agent should:

```text
1. open .gitignore
2. ensure JEJAK.md ignored
3. ensure env files ignored
4. inspect JEJAK.md without dumping
5. map known values
6. create .env.local safely
7. create/update .env.example
8. validate Supabase project ref
9. inspect global tools
10. initialize runtime
11. build
12. secret scan
13. update STATUS
```

---

# 232. RESUME EXECUTION

Resume Agent:
1. read STATUS;
2. verify env only if relevant;
3. don't re-copy secrets;
4. don't recreate `.env.local` blindly;
5. continue Next Safe Action.

---

# 233. ENVIRONMENT DEBUGGING ORDER

If app can't connect:

1. check alias exists;
2. check environment tier;
3. check URL/project ref;
4. check provider health;
5. check runtime boundary;
6. check deployment env;
7. check permission/RLS;
8. only then suspect code.

Don't print raw key.

---

# 234. SUPABASE AUTH DEBUG

Check:
- callback;
- origin;
- cookie/session;
- publishable;
- user RLS.

Not:
> switch to service role client to “fix” auth.

---

# 235. RLS DEBUG ANTI-PATTERN

Never bypass RLS in browser to make feature work.

---

# 236. PAYMENT DEBUG ANTI-PATTERN

Never put bank config in env just because admin UI not done.

---

# 237. AI DEBUG ANTI-PATTERN

Never expose provider key client-side to test faster.

---

# 238. SOURCE DEBUG ANTI-PATTERN

Never hardcode key in adapter.

---

# 239. PREVIEW DEBUG ANTI-PATTERN

Never disable auth globally.

---

# 240. PRODUCTION DEBUG ANTI-PATTERN

Never log entire request environment.

---

# 241. ENVIRONMENT DOCUMENTATION IN CODE

Env module can document:
- purpose;
- required class.

No secret.

---

# 242. STARTUP DIAGNOSTICS

Server can report:
> `AI provider configured: yes`

not key.

---

# 243. ADMIN HEALTH

Same.

---

# 244. MISSING OPTIONAL PROVIDER

App:
> degrade.

NADI:
> unavailable.

Do not fail entire build if optional.

---

# 245. MISSING CORE CRYPTO KEY

Production:
> fail protected/sensitive feature startup.

Do not silently store plaintext.

---

# 246. LOCAL CRYPTO KEY

Can generate local development key.

Not production reused.

---

# 247. PROD CRYPTO KEY GENERATION

Generate securely.

Store platform secret.

---

# 248. KEY BACKUP

Product Owner should retain secure backup if necessary.

Agent should not store backup in repo.

---

# 249. PROVIDER KEY OWNER

Credential account ownership may differ.

System should use aliases, not personal account names in code.

---

# 250. CREDENTIAL ACCOUNT CHANGE

Adding/removing account:
> environment change + health verify.

Not code rewrite.

---

# 251. LOCAL SECRET BOOTSTRAP EVOLUTION

If `JEJAK.md` gains new credentials:
> Agent maps only needed values and updates env contract/example if variable names change.

---

# 252. SECRET DUPLICATION

Avoid same secret copied to many local files.

---

# 253. ENV PATH

One canonical local env file preferred.

---

# 254. TEST ISOLATION

Tests should mock env as needed.

Never use production provider for every unit test.

---

# 255. CI COST CONTROL

AI/source integration tests:
> limited, tagged, not every lint run.

---

# 256. ACCEPTANCE REAL PROVIDER

At least targeted smoke with real provider before production feature activation.

---

# 257. PROVIDER TERMS CHANGE

If provider terms change:
- update policy;
- Source Registry;
- DECISION if architecture affected.

---

# 258. SECRET REVOCATION CHECK

If suspected abuse:
- review provider dashboard usage;
- rotate affected key;
- disable slot.

---

# 259. RATE EXHAUSTION

Do not automatically cycle accounts to evade quota.

Degrade/circuit-break/failover only if compliant.

---

# 260. FINAL ENVIRONMENT CHECKLIST

Before any Agent claims environment ready:

```text
[ ] local bootstrap ignored
[ ] no secret tracked
[ ] no secret staged
[ ] .env.local ignored
[ ] .env.example safe
[ ] public env audited
[ ] server env audited
[ ] Supabase ref verified
[ ] repo remote verified
[ ] provider aliases configured
[ ] crypto keys configured where required
[ ] build passes
[ ] bundle secret scan passes
[ ] preview environment understood
[ ] production environment understood
[ ] OAuth URLs understood
[ ] STATUS updated
[ ] DECISIONS updated if implementation choice changed
```

---

# 261. FINAL PRINCIPLES

1. **Secret = environment/secret store.**
2. **Business config = database.**
3. **Public build metadata = public env.**
4. **`JEJAK.md` = local bootstrap only.**
5. **Never commit raw credential.**
6. **Never expose privileged Supabase credential to browser.**
7. **Never expose Gemini/Groq key to browser.**
8. **Never put bank account as primary source in env.**
9. **Never put pricing as primary source in env.**
10. **Never put feature flags solely in env if Owner needs runtime control.**
11. **Provider key count is not hardcoded architecture.**
12. **Multi-key does not mean quota bypass.**
13. **Preview is not production.**
14. **Migration target must be verified.**
15. **Git target must be verified.**
16. **Secret leak after push = rotate.**
17. **Secret leak in client = rotate.**
18. **Secret leak in AI/log = rotate and investigate.**
19. **Environment validation must fail early and clearly.**
20. **Client env module and server env module must stay separated.**
21. **Environment state lives in STATUS, not in this static contract.**
22. **Agent checks global tooling before manual setup.**
23. **Agent handles environment setup itself if tools permit.**
24. **Product Owner only called for real human-only blocker.**
25. **No raw secret is ever written into STATUS/DECISIONS/README.**
26. **Rotation should not require code rewrite.**
27. **Sensitive crypto key rotation needs migration/versioning plan.**
28. **Production release requires secret scan and bundle audit.**
29. **Optional provider failure must degrade gracefully.**
30. **Core security never depends on obscurity of environment variable names.**

---

# 262. HANDOFF NOTE

Agent berikutnya:
- jangan meminta Product Owner mengirim ulang API key bila local bootstrap/env sudah tersedia;
- jangan menyalin `JEJAK.md`;
- jangan memindahkan secret ke Markdown;
- baca STATUS untuk tahu environment mana yang sudah READY.

Jika Agent mengubah strategy environment:
> buat DEC baru.

**END OF ENVIRONMENT CONTRACT**
