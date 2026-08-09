# ARCHITECTURE RUNTIME — JEJAK

> **Status:** Kontrak runtime architecture untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Tujuan:** Menentukan boundary browser/server/database/jobs/source/AI/realtime/PWA supaya logic bisnis tidak tercecer dan tidak bertentangan  
> **Stack utama:** Next.js 16 + Supabase + Vercel + PWA  
> **Region utama:** Singapore-aligned  
> **Source of truth terkait:** `docs/PRD.md`, `docs/SCHEMA.md`, `docs/ROADMAP.md`, `docs/ENVIRONMENT_CONTRACT.md`, `docs/SECURITY_THREAT_MODEL.md`, `.notes/AGENTS.md`

---

# 0. KENAPA FILE INI ADA

`SCHEMA.md` menjawab:
> data apa yang disimpan dan invariant apa yang harus dijaga.

`WIRE_MAP.md` menjawab:
> user bergerak dari layar mana ke layar mana.

`ROADMAP.md` menjawab:
> urutan membangunnya.

File ini menjawab:
> **ketika Jejak sedang hidup, komponen mana mengerjakan apa, siapa boleh memanggil siapa, siapa jadi sumber kebenaran, dan apa yang terjadi saat satu bagian gagal.**

Tanpa kontrak runtime, Agent bisa membuat:
- credit logic setengah di client, setengah di route handler;
- payment approval di UI lalu sync belakangan;
- AI langsung memanggil database;
- source adapter memegang business pricing;
- realtime dianggap source of truth;
- service worker cache saldo lama;
- long-running scan mati saat tab ditutup;
- admin browser memegang privileged Supabase secret;
- Edge Function dan Vercel route menjalankan aturan bisnis berbeda.

Semua itu dilarang.

---

# 1. ARSITEKTUR BESAR

```text
┌──────────────────────────────────────────────────────────────┐
│                        USER DEVICE                           │
│                                                              │
│  PWA / Browser                                               │
│  ├─ App Shell                                                │
│  ├─ Local UI state                                           │
│  ├─ Safe cache                                               │
│  ├─ Supabase user session                                    │
│  └─ Realtime subscriber                                      │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS / Authenticated calls
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER                        │
│                                                              │
│  Next.js Server Runtime / Route Handlers / Server Actions    │
│  ├─ Auth boundary                                            │
│  ├─ Authorization gateway                                    │
│  ├─ Use-case orchestration                                   │
│  ├─ Input validation                                         │
│  ├─ Context builder                                          │
│  ├─ Source orchestration                                     │
│  ├─ AI orchestration                                         │
│  └─ Safe response shaping                                    │
└──────────────┬──────────────────────┬────────────────────────┘
               │                      │
               ▼                      ▼
┌───────────────────────────┐   ┌──────────────────────────────┐
│         SUPABASE          │   │       EXTERNAL SERVICES      │
│                           │   │                              │
│ Postgres                  │   │ RDAP                         │
│ ├─ RLS                    │   │ DNS                          │
│ ├─ business transactions  │   │ HIBP                         │
│ ├─ ledger                 │   │ GitHub/GitLab                │
│ ├─ audit                  │   │ Public Page Collector target │
│ └─ durable scan state     │   │ Gemini/Groq                  │
│                           │   └──────────────────────────────┘
│ Storage                   │
│ ├─ Case attachments       │
│ └─ Payment proofs         │
│                           │
│ Realtime                  │
│ └─ safe events            │
└──────────────┬────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                  DURABLE ASYNC WORK                          │
│                                                              │
│  Scan jobs / cleanup / expiry / aggregation / notifications │
│  ├─ idempotent                                               │
│  ├─ retryable                                                │
│  ├─ observable                                               │
│  └─ DB-backed state                                          │
└──────────────────────────────────────────────────────────────┘
```

---

# 2. RUNTIME PRINCIPLES

1. Browser mengatur pengalaman, bukan kebenaran bisnis.
2. Server mengorkestrasi use case.
3. Database menjaga invariant.
4. RLS menjaga tenant boundary.
5. Transaction-critical logic sedekat mungkin dengan Postgres.
6. Long-running work harus durable.
7. External source adalah dependency, bukan source of authority atas Jejak.
8. AI adalah reasoning service, bukan authority.
9. Realtime adalah notification channel, bukan database replacement.
10. PWA cache adalah optimization, bukan ledger.
11. Privileged secret tidak pernah berada di browser.
12. Failure satu subsystem tidak boleh blank seluruh app.
13. Core read path harus tetap tersedia saat AI/source optional gagal.
14. Semua high-value mutation idempotent.
15. Semua sensitive admin mutation audited.

---

# 3. RUNTIME OWNERSHIP MATRIX

| Concern | Browser | Next.js Server | Postgres | Async Job | External |
|---|---|---|---|---|---|
| UI state | OWNER | - | optional prefs | - | - |
| Auth session UX | participant | validate | auth truth via Supabase | - | Google |
| Role display | render | fetch/check | SOURCE OF TRUTH | - | - |
| Case authorization | no | enforce entry | SOURCE OF TRUTH via RLS | - | - |
| Credit balance | render | fetch | SOURCE OF TRUTH | expiry jobs | - |
| Credit reserve | request only | call transaction | OWNER | - | - |
| Payment approve | request only | authorize/call | OWNER transaction | notify/cleanup | bank human check |
| Scan create | request | orchestrate | durable truth | worker executes | sources |
| Source fetch | never direct | orchestrate | store normalized result | worker may execute | OWNER response |
| AI call | never direct | orchestrate | run metadata | worker may execute | Gemini/Groq |
| Evidence | render | shape | SOURCE OF TRUTH | correlate | source data |
| Realtime | subscribe | publish helper | state source | event producer | - |
| PWA cache | OWNER safe cache | headers/version | business truth | - | - |
| Deletion | request | authorize | lifecycle truth | OWNER cleanup | Storage |
| Feature flags | render | enforce | SOURCE OF TRUTH | - | - |
| Pricing | display | fetch/quote | SOURCE OF TRUTH | - | - |
| Bank config | display snapshot | fetch | SOURCE OF TRUTH | - | - |

---

# 4. BROWSER RESPONSIBILITY

Browser boleh:
- merender UI;
- menyimpan temporary presentation state;
- mengelola optimistic visual state yang aman;
- menyimpan draft aman;
- subscribe realtime;
- meminta server melakukan use case;
- memakai Supabase publishable client untuk query yang memang RLS-safe jika arsitektur memilih demikian;
- cache static assets;
- cache safe historical summary sesuai policy.

Browser tidak boleh menentukan:
- role;
- permission;
- saldo;
- harga final;
- discount final;
- payment approval;
- Case ownership;
- source reliability;
- scan settlement;
- entitlement;
- account block;
- admin capability.

---

# 5. CLIENT STATE VS SERVER STATE

## Client-local

Contoh:
- modal open;
- selected graph node;
- active graph layer;
- search input draft;
- current panel;
- transition state;
- UI preference.

## Server-authoritative

Contoh:
- wallet;
- role;
- Case;
- evidence;
- payment;
- scan;
- partner status;
- feature flag;
- account status.

## Cached server state

Boleh:
- Case list summary;
- old result summary;
- help content.

Tetap:
> invalidatable/refetchable.

---

# 6. NEXT.JS SERVER RESPONSIBILITY

Application server menjadi:
> **Use-Case Gateway**

Ia:
1. menerima request;
2. validate session;
3. validate input;
4. authorize use case;
5. memanggil database operation;
6. memanggil source/AI jika perlu;
7. membentuk response aman;
8. map error ke domain error.

Server tidak boleh:
- menyimpan balance dalam memory sebagai truth;
- memutus payment hanya dari AI;
- mengandalkan frontend role;
- memegang long-running scan hanya dalam request lifetime.

---

# 7. DATABASE RESPONSIBILITY

Postgres menjaga:
- tenant boundaries;
- credit invariant;
- payment settlement;
- voucher constraint;
- role assignment;
- config version;
- Case ownership;
- audit;
- durable job state.

Rule:
> kalau race-condition dapat menyebabkan uang/data salah, invariant utama harus punya guard di database.

---

# 8. WHEN TO USE DATABASE FUNCTION / RPC

Gunakan untuk high-value atomic operation:

- `reserve_scan_credits`
- `settle_scan_credits`
- `release_scan_credits`
- `approve_topup`
- `admin_adjust_credits`
- `redeem_voucher`
- `extend_eligible_credit_lots`

Benefit:
- atomic;
- locking;
- unique constraint;
- rollback.

Jangan membuat satu mega-RPC untuk seluruh aplikasi.

---

# 9. WHEN TO USE SERVER ACTION / ROUTE HANDLER

Gunakan untuk:
- validate request;
- session;
- input;
- orchestrate multiple systems;
- source call;
- AI call;
- signed file access;
- admin actions;
- generate quote;
- create scan.

Business invariant tetap DB-backed.

---

# 10. SERVER ACTION VS ROUTE HANDLER

Agent bebas memilih berdasarkan current Next.js guidance.

Rule:
- mutation UI-centric bisa Server Action;
- public/API-style integration bisa Route Handler;
- file upload/streaming dipilih sesuai capability;
- long-running job tidak bergantung request lifetime.

Pilihan aktual:
> dicatat DEC jika significant.

---

# 11. PRIVILEGED SUPABASE CLIENT

Privileged client:
> hanya server/internal job.

Gunakan jika:
- cleanup Storage;
- administrative cross-tenant operation;
- scheduled job;
- system aggregation.

Sebelum privileged query:
- authenticate caller/service;
- permission check;
- scope target.

Tidak boleh:
> “karena service key bypass RLS jadi lebih gampang.”

---

# 12. USER-CONTEXT SUPABASE CLIENT

Prefer untuk:
- normal user Case query;
- user-owned data;
- RLS validation.

Benefit:
> DB security tetap aktif.

---

# 13. APPLICATION LAYER MODULE MAP

Recommended conceptual domains:

```text
features/
├─ auth/
├─ shell/
├─ search/
├─ cases/
├─ evidence/
├─ graph/
├─ credits/
├─ payments/
├─ sources/
├─ ai/
├─ partners/
├─ privacy/
├─ admin/
├─ pwa/
└─ observability/

server/
├─ auth/
├─ permissions/
├─ db/
├─ jobs/
├─ sources/
├─ ai/
├─ storage/
├─ security/
└─ events/
```

Agent boleh menyesuaikan.

Rule:
> domain boundaries lebih penting daripada folder exact.

---

# 14. DOMAIN LAYER RULE

`credits` tidak boleh import UI.

`payments` boleh memanggil credit settlement transaction, tapi tidak menduplikasi ledger rules.

`ai` tidak boleh mengubah evidence langsung.

`sources` tidak boleh menentukan user pricing.

`admin` menggunakan use case yang sama dengan system domain, bukan direct DB hacks.

---

# 15. AUTH RUNTIME FLOW

```text
User
→ Google OAuth
→ Supabase Auth
→ callback
→ session established
→ user initializer
→ profile
→ baseline role
→ wallet
→ sponsored-benefit eligibility
→ App Shell
```

Initializer:
> idempotent.

---

# 16. AUTH REQUEST FLOW

Protected request:

```text
Browser
→ Server
→ validate session
→ check account state
→ permission/case scope
→ execute
→ safe response
```

---

# 17. OWNER FLOW

Owner login:
> sama seperti user normal.

User mode:
> default.

Masuk Ruang Kendali:
```text
browser navigation
→ server checks owner/admin capability
→ admin context
```

Tidak ada session admin terpisah.

---

# 18. ROLE REVOCATION FLOW

```text
Owner changes role
→ DB assignment updated
→ audit
→ realtime/safe signal
→ client refetch
→ next sensitive mutation checks DB current state
```

Old JWT claim:
> tidak boleh mempertahankan permission.

---

# 19. CASE CREATE FLOW

```text
Browser
→ create Case request
→ server validate purpose/title/workspace
→ DB transaction
   ├─ cases row
   └─ owner membership
→ response summary
→ client opens Case
```

---

# 20. ADD IDENTIFIER FLOW

```text
input
→ client local detection
→ server canonical validation
→ normalize
→ encrypt/HMAC if needed
→ detect duplicate in Case
→ create/update entity
→ audit/activity
→ return safe node
```

Client detection:
> convenience.

Server normalization:
> truth.

---

# 21. CASE ATTACHMENT FLOW

```text
Browser upload
→ server/storage authorization
→ temporary object
→ validate MIME
→ decode
→ pixel limit
→ strip metadata
→ re-encode
→ final private object
→ DB attachment row
→ delete temporary/original if not needed
```

Failure:
> orphan cleanup.

---

# 22. CASE READ FLOW

Case page initial:
```text
Case metadata
+ summary counts
+ small graph focus
+ current assessment
```

Lazy:
- full evidence;
- attachments;
- large graph;
- timeline detail.

---

# 23. GRAPH DATA FLOW

Graph query:
- scope by Case;
- filter layer;
- focus;
- cluster;
- pagination.

Browser:
> visualization only.

Graph relationship truth:
> DB normalized model.

---

# 24. RELATIONSHIP SUGGESTION FLOW

```text
Evidence added
→ correlator evaluates
→ candidate relationship
→ AI optional explanation
→ relationship status suggested
→ user may accept/reject
```

No auto permanent merge.

---

# 25. EVIDENCE INGEST FLOW

```text
source adapter
→ validated normalized source result
→ evidence mapping
→ provenance metadata
→ reliability dimensions
→ entity link
→ contradiction/correlation engine
→ assessment
```

Raw source:
> temporary/minimized.

---

# 26. SOURCE ADAPTER CONTRACT

Each adapter exposes conceptual:

```text
supports(target)
validate(target)
estimateCost()
fetch()
normalize()
classifyResult()
health()
```

Result classes:
- success;
- no_result;
- timeout;
- malformed;
- blocked;
- rate_limited;
- budget_limited.

---

# 27. SOURCE ADAPTER MUST NOT

- mutate wallet;
- approve payment;
- assign role;
- create risk verdict alone;
- bypass Governor;
- log raw secret.

---

# 28. SOURCE REGISTRY RUNTIME

Before source call:

```text
registry lookup
→ enabled?
→ experimental eligibility?
→ budget?
→ circuit?
→ target supported?
→ execute
```

---

# 29. SOURCE GOVERNOR RUNTIME

Inputs:
- source;
- user;
- operation;
- target diversity;
- system load;
- daily budget.

Outputs:
- allow;
- skip;
- delay;
- degraded.

---

# 30. SCAN CREATE FLOW

```text
Browser
→ request scan quote
→ server computes product/cost
→ browser confirms
→ server create scan
→ DB reserve credit atomically
→ scan status credit_reserved
→ durable job enqueue
→ response immediately
```

PWA may close after durable job exists.

---

# 31. SCAN JOB FLOW

```text
Job claims scan
→ mark running
→ normalize target
→ choose sources
→ execute sources
→ persist source run states
→ evidence normalize
→ correlate
→ assess
→ AI optional
→ grounding
→ settlement decision
→ settle/refund credit
→ mark complete
→ notification/realtime
```

---

# 32. SCAN STATE MACHINE

```text
requested
→ credit_reserved
→ running
→ partial/completed

failure:
running
→ failed
→ refunded if required
```

No impossible:
> completed without settlement state defined.

---

# 33. SCAN JOB DURABILITY

Requirement:
- retryable;
- lease/lock;
- at-least-once execution safe;
- side effects idempotent.

Exact queue implementation:
> implementation decision.

---

# 34. JOB CLAIM

Worker must prevent two workers both processing same stage incorrectly.

Options:
- row lock;
- lease;
- queue platform semantics.

Result:
> side effects remain idempotent anyway.

---

# 35. SOURCE PARALLELISM

Source calls may parallelize if:
- independent;
- governor permits;
- provider concurrency permits.

Do not parallelize all sources blindly.

---

# 36. PARTIAL RESULT

If optional source fails:
> evidence from healthy sources remains.

Assessment completeness:
> lowered.

User:
> diberi explanation ringan.

---

# 37. ALL SOURCE FAILURE

If minimum deliverable unavailable:
- failed;
- release/refund credit according policy;
- user notified.

---

# 38. AI PIPELINE

```text
structured evidence
→ Context Pack
→ sensitive data gate
→ Analyst
→ Skeptic optional
→ grounding check
→ safe renderer
→ AI output row
```

---

# 39. CONTEXT PACK

Contains:
- evidence summary;
- source refs;
- contradiction;
- temporal info;
- user intent;
- minimum necessary identifiers.

Does not contain:
- entire database;
- API keys;
- unrelated Cases;
- password.

---

# 40. AI PROVIDER ROUTER

Inputs:
- task type;
- sensitivity;
- provider health;
- model config;
- cost budget.

Outputs:
- selected permitted provider/model;
- fallback.

No quota-evasion rotation.

---

# 41. GROUNDING FLOW

```text
AI claim
→ parse factual claims
→ evidence link check
→ contradiction check
→ accepted / regenerate / fallback
```

Exact implementation may simplify, but invariant preserved.

---

# 42. AI FAILURE FLOW

If AI unavailable:
- source result persists;
- rule summary generated;
- graph/evidence still accessible.

No whole-app maintenance.

---

# 43. USER ASSISTANT FLOW

```text
user asks contextual question
→ determine current Case/result context
→ check included allowance / new cost
→ if paid new work: quote + confirm
→ build Context Pack
→ AI
→ grounding
→ answer
```

No implicit expensive call.

---

# 44. NADI FLOW

```text
Owner question
→ admin auth
→ Business Digest
→ scoped additional facts if needed
→ AI reasoning
→ recommendation/draft
```

Mutation:
```text
NADI draft
→ Owner confirm
→ regular admin use case
```

---

# 45. CREDIT READ FLOW

Browser wallet:
```text
fetch server/db summary
→ available
→ reserved
→ expiring soon
```

Never reconstruct ledger client-side as authority.

---

# 46. CREDIT RESERVE FLOW

```text
start paid operation
→ quote validate
→ DB transaction lock
→ FEFO allocation
→ hold
→ ledger
→ cache update
→ commit
```

---

# 47. CREDIT SETTLE FLOW

```text
scan minimum deliverable met
→ hold lock
→ reserved → settled
→ ledger
→ cache
```

Retry:
> idempotent.

---

# 48. CREDIT REFUND FLOW

```text
failed eligible scan
→ hold lock
→ release allocation
→ ledger
→ cache
```

---

# 49. CREDIT EXPIRY FLOW

Scheduled:
```text
find eligible lots
→ lock
→ exclude active reserved portion
→ expire available
→ ledger
→ notification
```

---

# 50. TOP-UP CREATE FLOW

```text
Browser selects package
→ server fetches current package/payment config
→ unique amount allocation
→ order snapshots
→ persist order
→ return user payment instruction
```

---

# 51. PAYMENT PROOF FLOW

```text
Browser upload
→ private Storage
→ normalize image
→ proof row
→ optional Payment Sentinel
→ under_review
→ admin queue notification
```

Sentinel result:
> signal.

---

# 52. PAYMENT REVIEW FLOW

Admin:
```text
open queue
→ safe user/order summary
→ on detail request signed proof URL
→ human checks bank mutation
→ approve/reject/request new proof
```

---

# 53. PAYMENT APPROVAL FLOW

```text
Owner/Finance clicks approve
→ server auth
→ permission
→ DB approve_topup transaction
   ├─ lock order
   ├─ ensure unapproved
   ├─ create credit lot
   ├─ ledger
   ├─ wallet cache
   ├─ order approved
   ├─ audit
   └─ commission qualification marker
→ commit
→ async notification
→ proof cleanup schedule
```

---

# 54. NOTIFICATION MUST NOT CONTROL MONEY

If notification fails after approval:
> payment stays approved.

Notification retries separately.

---

# 55. OUTBOX PATTERN

Agent may use outbox if needed for reliability.

Potential:
```text
transaction commit
→ event_outbox
→ worker
→ realtime/notification/analytics
```

Use if helpful.

Not mandatory if equivalent reliability achieved.

---

# 56. REALTIME ARCHITECTURE

Realtime should publish:
- scan status changed;
- wallet changed;
- payment changed;
- Kabar;
- admin queue changed.

Payload:
> minimal ref + state.

Client then refetches authorized detail.

---

# 57. REALTIME FALLBACK

If disconnected:
- polling where important;
- Segarkan;
- route refetch.

No user data lost.

---

# 58. REALTIME AUTH

Private topics must validate:
- user;
- Case membership;
- staff permission.

---

# 59. PWA SERVICE WORKER RESPONSIBILITY

Cache:
- shell assets;
- fonts;
- icons;
- safe static/help;
- selected safe historical response.

Do not authority-cache:
- balance;
- roles;
- payment state;
- block state.

---

# 60. VERSION SENTINEL FLOW

```text
app starts
→ shell loads
→ background latest-version check
→ compare current/minimum
→ update state
```

Noncritical:
> user can choose safe timing.

Critical:
> sensitive mutation blocked until update.

---

# 61. UPDATE APPLY FLOW

```text
save safe navigation intent
→ activate new worker/build
→ reload shell
→ restore safe route/context
→ refetch business truth
```

---

# 62. SEGARKAN FLOW

```text
user taps Segarkan
→ check app version
→ refetch wallet
→ refetch role/account
→ refetch notifications
→ refetch active scan/payment
→ refetch current workspace summary
```

Not:
> window.location.reload unless recovery fallback.

---

# 63. OFFLINE READ FLOW

Allowed:
- cached shell;
- safe history summary if previously cached.

Disallowed:
- fake current wallet;
- fake current payment;
- offline paid mutation queue.

---

# 64. OFFLINE PAID ACTION

If offline:
> show unavailable/reconnect.

Do not queue “spend credit later” silently.

---

# 65. ADMIN ARCHITECTURE

Admin browser:
> same public client/runtime trust level as user browser.

Admin UI calls:
> authorized server use cases.

Do not:
> expose database secret to simplify dashboard.

---

# 66. ADMIN READ MODEL

Use purpose-specific read models:

- Ringkasan → aggregate
- Payment → queue
- User → summary
- Source → health
- Analytics → aggregated
- NADI → digest

Avoid:
> SELECT giant raw database.

---

# 67. OWNER INBOX

Can be event/derived table.

Should aggregate actionable:
- pending payment;
- source issue;
- security alert;
- config problem;
- cleanup failure.

---

# 68. ADMIN CONFIG WRITE FLOW

```text
load config + version
→ edit
→ submit expected version
→ permission check
→ update if version match
→ audit
→ signal clients
```

Conflict:
> user reloads fresh version.

---

# 69. FEATURE FLAG RUNTIME

Server use case:
```text
check flag
→ check audience
→ continue/deny
```

UI:
> may hide/tease.

Server:
> final.

---

# 70. MAINTENANCE RUNTIME

Each major subsystem checks own control:
- scans;
- AI;
- top-ups;
- upload;
- monitoring.

No one giant global if not needed.

---

# 71. EMERGENCY PROTECTION FLOW

Owner enables:
```text
system control update
→ audit
→ realtime admin/user-safe signal
→ server governors tighten
```

No redeploy.

---

# 72. PARTNER RUNTIME

Partner membership:
> entitlement context.

User remains normal user.

Partner dashboard queries:
> scoped data.

---

# 73. AFFILIATE FLOW

```text
visitor referral
→ attribution
→ signup
→ approved qualifying topup
→ commission qualification
→ pending/review
→ paid manually/ops
```

No commission at click/signup alone.

---

# 74. RESELLER FLOW

```text
distribution balance
→ reserve voucher value
→ voucher issued
→ user redeem
→ atomic distribution settlement
→ user credit lot
```

---

# 75. MITRA FLOW

```text
Mitra membership
→ workspace
→ client
→ Case
→ scan
```

All tenant scoped.

---

# 76. PRIVACY DELETE FLOW

Case:
```text
request delete
→ trash or immediate secret delete
→ deletion job
→ remove attachments
→ delete DB children
→ verify
→ complete
```

---

# 77. ACCOUNT DELETE FLOW

```text
request
→ warn credit
→ stop new work
→ shared ownership checks
→ revoke access/session
→ data cleanup jobs
→ anonymize retained finance/audit
→ delete auth identity when safe
```

---

# 78. DATA EXPORT FLOW

```text
request
→ auth
→ scope user-owned data
→ generate artifact
→ private storage
→ short-lived signed access
→ expiry cleanup
```

---

# 79. OBSERVABILITY FLOW

Every subsystem emits safe metadata:
- operation;
- public error code;
- latency;
- status;
- version.

No secret/raw unnecessary PII.

---

# 80. ERROR ARCHITECTURE

Layer:

## Domain error
Examples:
- insufficient_credit
- quote_expired
- permission_denied

## System error
Mapped:
- JX code
- generic user message

Internal:
- error group
- safe diagnostics.

---

# 81. LOCAL ERROR BOUNDARY

UI:
- graph fail → graph error card
- NADI fail → NADI unavailable
- Kabar fail → panel retry

No whole-page blank.

---

# 82. EXTERNAL FAILURE ISOLATION

Source failure:
> source run failure.

AI failure:
> AI run failure.

Storage failure:
> upload failure.

Realtime failure:
> fallback.

Each independently observable.

---

# 83. CACHE LAYERS

## Browser/PWA
Static/safe summary.

## Framework/server
May cache safe read models.

## Database
Truth.

## External source cache
If implemented, must preserve freshness/provenance.

---

# 84. SERVER CACHE SAFETY

Never cache globally:
- user-specific private response without proper key;
- role;
- credit;
- payment.

If using framework cache:
> scope and invalidation explicit.

---

# 85. SOURCE CACHE

Potential:
- DNS result short TTL;
- RDAP moderate;
- GitHub public data short.

Evidence still stores:
> retrieved_at.

Cache does not erase provenance.

---

# 86. AI CACHE

Can reuse:
- same structured evidence fingerprint;
- same prompt version;
- same task.

But:
- sensitive policy;
- stale evidence;
- model/version semantics.

No blind reuse.

---

# 87. CREDIT QUOTE CACHE

Quote persisted short-lived.

Not browser-calculated.

---

# 88. PAYMENT CONFIG CACHE

Current payment method may cache short.

Order always uses DB snapshot generated server-side.

---

# 89. ROLE CACHE

Client may display cached role briefly.

Sensitive operation checks DB current.

---

# 90. ACCOUNT BLOCK CACHE

Never allow block status cache to authorize.

---

# 91. DEPLOYMENT TOPOLOGY

Primary:
- Vercel frontend/server;
- Supabase Singapore;
- external provider internet.

Agent should minimize cross-region DB chatter.

---

# 92. SERVER REGION

Routes/jobs frequently touching Supabase:
> Singapore-aligned where platform supports.

Static edge delivery:
> can remain global/CDN.

---

# 93. EDGE VS NODE

Use Edge only if:
- required latency;
- packages compatible;
- crypto compatible;
- no DB transaction limitation.

Use Node/server if:
- image processing;
- libraries need Node;
- crypto needs Node;
- provider SDK needs Node.

Do not force everything to Edge.

---

# 94. SUPABASE EDGE FUNCTIONS

Use when beneficial:
- close DB integration;
- scheduled/internal operations;
- platform feature.

But avoid duplicating same business rule in Vercel.

---

# 95. ONE BUSINESS RULE, ONE OWNER

Example:
`approve_topup`
> Postgres transaction owner.

Both Vercel and Supabase Function may call it.

Neither reimplements ledger math.

---

# 96. IMAGE PROCESSING RUNTIME

Payment proof:
- server-side/worker;
- bounded memory;
- normalize.

Case evidence:
- same conceptual pipeline;
- higher readability budget.

Browser may:
> preview/compress opportunistically.

Server still validates.

---

# 97. SIGNED URL FLOW

```text
browser requests file
→ server verifies parent authorization
→ server asks Storage signed URL
→ returns short-lived URL
```

Do not precompute permanent URL.

---

# 98. PAYMENT SENTINEL RUNTIME

```text
proof normalized
→ sensitive data gate
→ provider eligible?
→ vision screening
→ structured screening
→ store signal
```

If provider unsafe/unavailable:
> screening unavailable.

Manual review continues.

---

# 99. PASSWORD EXPOSURE RUNTIME

```text
user input password
→ local/server ephemeral hashing per HIBP design
→ range request
→ compare locally/server memory
→ return compromised count/status
→ discard password
```

Never persist raw/full hash.

---

# 100. PUBLIC PAGE COLLECTOR RUNTIME

```text
known URL
→ parse
→ validate scheme
→ DNS resolve
→ block private/link-local
→ fetch with timeout/size limit
→ validate redirects
→ extract relevant content
→ sanitize
→ evidence adapter
```

---

# 101. REQUEST CORRELATION ID

Each important request/job:
> safe correlation ID.

Used across:
- server logs;
- source runs;
- AI runs;
- errors.

Do not expose internal raw DB IDs unnecessarily.

---

# 102. IDEMPOTENCY KEY OWNERSHIP

Client may generate request id.

Server defines business idempotency scope.

Database unique constraint:
> final guard.

---

# 103. RETRY POLICY

## Safe reads
Retry reasonable.

## Source calls
Bounded retry.

## AI
Bounded fallback.

## Financial mutations
Retry only with same idempotency.

## Jobs
At-least-once safe.

---

# 104. TIMEOUT POLICY

Every external call:
> timeout.

No source can hang entire scan.

---

# 105. CIRCUIT BREAKER

Provider/source:
- repeated failures;
- open circuit;
- retry later.

Store runtime state in appropriate cache/DB.

Decision actual:
> implementation DEC.

---

# 106. RATE LIMIT LAYERS

1. network/platform firewall;
2. app operation limit;
3. account abuse state;
4. credit reserve;
5. source governor;
6. provider own rate.

Credit alone:
> not rate limit.

---

# 107. SECURITY EVENT PRODUCTION

Security event should not be emitted for every ordinary 403.

Aggregate meaningful pattern.

Examples:
- cross-Case enumeration pattern;
- repeated voucher abuse;
- suspicious provider burn.

---

# 108. ANALYTICS EVENT PRODUCTION

Events should not block primary flow.

If analytics fails:
> business action continues.

---

# 109. BUSINESS METRIC AGGREGATION

Prefer scheduled/delta aggregation.

NADI:
> read daily/hourly digest.

Avoid expensive raw event queries on each admin page.

---

# 110. NADI DATA ACCESS

NADI server tool boundaries:
- business digest;
- payment summary;
- source health;
- error aggregate;
- partner summary.

No arbitrary SQL.

---

# 111. USER ASSISTANT DATA ACCESS

Scope:
> current user + authorized Case only.

No global search by model.

---

# 112. SEARCH ORB FAILURE

If WebGL/visual enhancement fail:
> standard search input available.

Signature visual never blocks core.

---

# 113. MOTION FAILURE

Business action dispatch must happen independent of animation.

---

# 114. FORM SUBMISSION

Animation:
> feedback.

Server response:
> determines outcome.

---

# 115. OPTIMISTIC UI

Allowed for reversible visual:
- mark notification read;
- local note draft.

Avoid for:
- payment approved;
- credit balance;
- role change.

---

# 116. WALLET UI

After paid action:
- may show pending reserve only if server confirms.
- refetch after event.

Never decrement before server reserve result.

---

# 117. PAYMENT UI

Do not show approved until server transaction committed.

---

# 118. ADMIN CONFIG UI

Do not show saved until versioned update success.

---

# 119. CASE MERGE UI

Optimistic preview okay.

Permanent accepted state only after server save.

---

# 120. ERROR RECOVERY UX

Examples:

### source fail
> partial result.

### AI fail
> fallback explanation.

### network fail
> retry/Segarkan.

### expired session
> login + restore safe draft.

### outdated client
> update.

---

# 121. API RESPONSE SHAPING

Do not return DB row raw if:
- contains encrypted fields;
- internal status;
- audit data;
- sensitive metadata.

Use domain DTO/view.

---

# 122. DTO PRINCIPLE

Browser receives:
> minimum necessary fields.

Support receives:
> masked DTO.

Finance:
> payment DTO.

Owner:
> capability-dependent DTO.

---

# 123. VALIDATION

Use central schema validation for:
- identifiers;
- payment;
- config;
- admin mutation.

Do not rely HTML input validation.

---

# 124. SERIALIZATION

Never serialize:
- `BigInt` unsafely;
- Date ambiguously;
- encrypted bytes;
- secret.

Domain serializers should normalize.

---

# 125. DATE/TIME

DB:
> UTC timestamptz.

UI:
> localized Indonesia.

Server expiry:
> server clock.

---

# 126. MONEY

Server integer Rupiah.

No float.

---

# 127. CREDIT

Integer.

No float.

---

# 128. ERROR CODE MAP

Server domain errors:
```text
INSUFFICIENT_CREDIT
QUOTE_EXPIRED
PERMISSION_DENIED
PAYMENT_ALREADY_APPROVED
CLIENT_UPDATE_REQUIRED
```

UI:
> translate Indonesian.

---

# 129. DO NOT LEAK DB ERRORS

Unique violation should map to:
> domain error.

Not raw SQL.

---

# 130. TRANSACTION BOUNDARY — PAYMENT

One database transaction.

Do not call AI inside DB transaction.

AI screening happens before human review.

---

# 131. TRANSACTION BOUNDARY — SCAN RESERVE

Reserve transaction short.

Do not hold DB lock while external sources run.

---

# 132. TRANSACTION BOUNDARY — VOUCHER

Redemption transaction short and atomic.

---

# 133. TRANSACTION BOUNDARY — CONFIG

Versioned update.

No external call in transaction.

---

# 134. ASYNC SIDE EFFECT RULE

Commit primary business state first.

Then:
- notification;
- analytics;
- email;
- realtime.

Use reliable event/outbox if needed.

---

# 135. EMAIL

Operational email:
> async.

Payment commit must not depend on SMTP success.

---

# 136. PUSH

Same.

---

# 137. BACKGROUND CLEANUP

Jobs:
- payment proofs;
- trashed Cases;
- exports;
- orphan files;
- expired safe shares.

---

# 138. JOB OBSERVABILITY

Each job:
- status;
- attempts;
- last error;
- processed count;
- next retry.

---

# 139. JOB DEAD LETTER

If repeated failure:
> incident/Owner Inbox.

Do not retry forever silently.

---

# 140. SOURCE HEALTH

Health combines:
- real call success;
- latency;
- failures;
- rate.

No expensive constant probes.

---

# 141. PROVIDER SLOT HEALTH

Separate:
- provider health;
- credential slot health;
- model health.

Never expose secret.

---

# 142. AI MODEL CHANGE

Config update:
- version;
- audit if admin-controlled;
- canary.

AI output stores model version.

---

# 143. SOURCE ADAPTER VERSION

Store parser/adapter version where useful.

---

# 144. ASSESSMENT VERSION

Risk/match/exposure method versioned.

---

# 145. CLIENT VERSION

Mutation can include client version.

Server may reject below minimum.

---

# 146. PREVIEW RUNTIME

Protected.

Prefer:
- test DB;
- test provider budgets;
- test data.

---

# 147. PRODUCTION CANARY

Feature flag:
- Owner;
- test accounts;
- small cohort.

---

# 148. DEPLOY ORDER

Typical:

```text
backward-compatible DB migration
→ server deploy
→ client/PWA deploy
→ feature flag enable
```

Avoid breaking old PWA.

---

# 149. BREAKING DB CHANGE

Use expand/contract:
1. add new;
2. dual compatible;
3. migrate;
4. update clients;
5. minimum version;
6. remove old later.

---

# 150. PWA + SCHEMA COMPATIBILITY

Old client:
> may call server.

Server:
> understands compatibility window or returns update-required.

---

# 151. RUNTIME FEATURE FLAGS

Use to decouple:
> deployment from release.

---

# 152. SYSTEM CONTROL VS FEATURE FLAG

Feature flag:
> audience/availability.

System control:
> operational subsystem health/maintenance.

Keep concept separate.

---

# 153. SECURITY CONTROL VS BUSINESS CONFIG

Security hard limit:
> code/system invariant.

Business config:
> editable.

Owner cannot configure RLS off.

---

# 154. SOURCE COST CONFIG

Editable budget can exist.

Hard safety ceiling may remain server invariant.

---

# 155. CREDIT PACKAGE CONFIG

DB runtime.

---

# 156. PAYMENT ACCOUNT CONFIG

DB runtime encrypted/restricted.

---

# 157. OWNER EMAIL

Bootstrap only.

---

# 158. APPLICATION VERSION

Build metadata.

---

# 159. MONITORING V1.5 RUNTIME

Future:

```text
subscription due
→ job
→ cheap signals
→ meaningful change?
→ deeper work if policy
→ credit
→ notification
```

Do not run full scan blindly every hour.

---

# 160. CASE COLLAB V1.5 RUNTIME

Member access:
> RLS.

Realtime:
> Case topic.

Mutation:
> role permission.

---

# 161. REPORT GENERATION

Future/current:
```text
Case snapshot
→ server/worker
→ template
→ private artifact
→ signed link
```

---

# 162. SAFE SHARE GENERATION

```text
user selects share
→ server sanitizes
→ user preview
→ token record
→ public safe endpoint
```

---

# 163. SEARCH HISTORY

Quick search not saved Case:
> minimal history.

Do not store full raw source forever.

---

# 164. CLIENT LOCAL STORAGE

Allowed:
- theme-like preference;
- safe UI mode;
- non-sensitive draft if policy.

Avoid:
- raw secret Case;
- token manual;
- wallet authority;
- payment proof.

---

# 165. SESSION STORAGE

Can hold ephemeral safe navigation intent.

---

# 166. SERVICE WORKER MESSAGE

May inform app:
- update ready;
- cache invalidated.

No business state.

---

# 167. PUSH MESSAGE

Payload minimal.

Fetch detail after app opens.

---

# 168. NOTIFICATION SECRET CASE

Generic:
> “Ada pembaruan di Kasus Rahasia.”

---

# 169. FILE DOWNLOAD

Reports/export:
- permission;
- signed URL;
- expiry.

---

# 170. EXPORT RATE LIMIT

Prevent mass extraction.

---

# 171. ADMIN BULK ACTION

If future:
- preview;
- bounded batch;
- per-item audit/reference;
- reversible where possible.

---

# 172. OWNER MOBILE APPROVAL

UI friction.

Server same transaction as desktop.

No separate insecure mobile endpoint.

---

# 173. STAFF ACCESS

Same API authorization whether UI or direct call.

---

# 174. CLIENT-SIDE ROUTE GUARD

Good for UX.

Not security.

---

# 175. SERVER MIDDLEWARE

Can perform:
- coarse auth;
- version;
- route gating.

Fine-grained object authorization:
> use case/DB.

---

# 176. MIDDLEWARE MUST NOT

- calculate credit;
- approve payment;
- decide Case ownership solely from cookie hint.

---

# 177. AUTH CALLBACK

Keep minimal.

Complex business initialization:
> idempotent server process.

---

# 178. STARTUP HEALTH

Server can validate:
- required env;
- DB connectivity.

Optional provider missing:
> degrade.

---

# 179. HEALTH ENDPOINT

If exposed:
- no secret;
- minimal status.

Internal detailed health:
> Owner protected.

---

# 180. ADMIN SYSTEM MAP

Human-facing map can query:
- deploy version;
- DB health;
- source status;
- queue;
- PWA adoption.

---

# 181. TRACE WITHOUT PII

Correlation:
- request ID;
- scan ID safe;
- source run ID.

Avoid raw target.

---

# 182. DATA CLASSIFICATION IN RUNTIME

Every response/caching/logging decision should know:
- public;
- account;
- sensitive;
- financial;
- secret_case;
- system_secret.

---

# 183. CACHE HEADER RULE

Sensitive/private:
> no-store/private as appropriate.

Static:
> long cache.

---

# 184. ATTACHMENT CDN

Private signed object delivery okay.

Do not public CDN Case attachments.

---

# 185. SECURITY HEADERS

Set at app server:
- CSP;
- frame controls;
- referrer;
- content-type.

Exact values based implementation.

---

# 186. CSRF

Use current Next/Supabase secure mutation pattern.

Don't create custom token system unless needed.

---

# 187. ORIGIN VALIDATION

Privileged cross-origin request:
> restricted.

---

# 188. SSRF RUNTIME LOCATION

Public Page Collector:
> server/job only.

Never browser.

---

# 189. DNS VALIDATION

Recheck after redirects.

---

# 190. SOURCE RESPONSE SIZE

Bound.

---

# 191. AI RESPONSE SIZE

Bound.

---

# 192. USER INPUT SIZE

Bound:
- notes;
- titles;
- names;
- URLs.

---

# 193. ADMIN NOTES SIZE

Bound.

---

# 194. IMAGE SIZE

Bound bytes + pixels.

---

# 195. CASE LARGE DATA

Use pagination/virtualization.

---

# 196. TIMELINE LARGE DATA

Window/pagination.

---

# 197. EVIDENCE LIST

Pagination + filter.

---

# 198. ADMIN PAYMENT QUEUE

Pagination/infinite list.

---

# 199. ANALYTICS QUERY

Aggregate.

---

# 200. NADI QUERY

Digest.

---

# 201. CLIENT QUERY LIBRARY

Implementation decision.

Must support:
- cache;
- invalidation;
- hydration;
- background refetch.

Do not duplicate with 3 libraries.

---

# 202. FORM LIBRARY

Implementation detail.

Use simple stable.

---

# 203. SCHEMA VALIDATION LIBRARY

Choose maintained library.

Use shared client/server schemas where practical.

---

# 204. API CONTRACT FILE

Specific endpoint/request/response definitions hidup di:
> `docs/API_CONTRACT.md`

Runtime file only defines placement and flow.

---

# 205. SERVER MODULE DEPENDENCY RULE

Recommended dependency direction:

```text
UI
→ feature use-case client
→ server use-case
→ domain service
→ DB/source/AI adapter
```

Not:
```text
DB adapter → UI
```

---

# 206. CROSS-DOMAIN DEPENDENCY

Allowed:
`payments → credits transaction`

But use formal domain API.

Not:
`payments` edit credit tables manually.

---

# 207. ADMIN CROSS-DOMAIN

Admin calls domain service:
- credit grant service;
- payment service;
- source config service.

Admin is not “god module”.

---

# 208. AI CROSS-DOMAIN

AI receives read-only Context Pack.

No direct imported credit/payment mutation service.

---

# 209. SOURCE CROSS-DOMAIN

Source only returns normalized data.

---

# 210. PWA CROSS-DOMAIN

PWA sync orchestrator may trigger refetch, not write business state.

---

# 211. ERROR CROSS-DOMAIN

Shared error taxonomy.

---

# 212. AUDIT CROSS-DOMAIN

Sensitive use-case writes audit through shared audit service/DB operation.

---

# 213. SECURITY CROSS-DOMAIN

Permission helpers central.

Don't hand-roll admin checks in every component.

---

# 214. FEATURE FLAG CROSS-DOMAIN

Central server evaluation.

---

# 215. CONFIG CACHE INVALIDATION

Config update:
> version changes.

Server/client can invalidate.

---

# 216. PRICING QUOTE

Quote snapshot prevents race.

---

# 217. PAYMENT METHOD SNAPSHOT

Same.

---

# 218. SCAN PRODUCT SNAPSHOT

Quote can reference config version.

---

# 219. AI PROMPT TEMPLATE VERSION

Stored.

---

# 220. EVIDENCE NORMALIZATION VERSION

Stored if needed.

---

# 221. PUBLIC ERROR ID

Generated server.

Not predictable security token.

---

# 222. USER REF

Friendly ref may be separate internal UUID.

---

# 223. TRACE

Public ref not authorization.

---

# 224. JOB SCHEDULER

Possible:
- Supabase cron;
- Vercel cron;
- DB queue;
- external queue.

Agent chooses after inspect.

Must meet:
- durable;
- retry;
- visibility;
- region/cost.

---

# 225. SCAN QUEUE

Most important async decision.

Record actual choice as DEC.

---

# 226. CLEANUP QUEUE

Can share job framework.

---

# 227. AGGREGATION JOB

Can share.

---

# 228. JOB PRIORITY

Potential:
- payment cleanup low;
- scan user high;
- security cleanup high.

Do not overbuild if queue basic.

---

# 229. JOB CONCURRENCY

Limit by:
- provider;
- system load.

---

# 230. JOB CANCEL

User may not cancel after settlement? Product policy.

If cancellable:
> safe hold release rules.

Do not improvise.

---

# 231. PAYMENT CLEANUP JOB

Independent from credit settlement.

---

# 232. EXPIRY JOB

Must catch up after downtime.

---

# 233. AGGREGATE JOB

Can recompute.

---

# 234. SOURCE BUDGET RESET

Server time.

---

# 235. TIMEZONE

Business day analytics:
> Indonesia timezone display/aggregation policy as decided.

Store UTC.

---

# 236. REVENUE DAILY METRIC

Approved topups excluding internal tests.

---

# 237. WALLET RECONCILIATION

Periodic diagnostic can compare cache to ledger.

Mismatch:
> incident.

---

# 238. DISTRIBUTION RECONCILIATION

Same.

---

# 239. COMMISSION RECONCILIATION

Approved source order ↔ commission.

---

# 240. PAYMENT RECONCILIATION V1

Human.

No automatic bank API.

---

# 241. SUPPORT TOOL

Purpose-built.

No direct DB console in product.

---

# 242. FINANCE TOOL

Payment-only.

---

# 243. OWNER TOOL

Broad permission, still audited.

---

# 244. DEBUG MODE

Development only.

Never expose secrets.

---

# 245. OWNER CANARY

Feature audience flag.

---

# 246. TEST DATA

Fixtures isolated.

---

# 247. PROVIDER MOCK

Integration fixture for failure.

---

# 248. REAL PROVIDER SMOKE

Selective, not every test.

---

# 249. DATABASE INTEGRATION TEST

Run against real Postgres/Supabase-compatible environment.

---

# 250. RLS TEST

Use separate user sessions.

---

# 251. PAYMENT RACE TEST

Parallel DB requests.

---

# 252. CREDIT RACE TEST

Parallel.

---

# 253. PWA TEST

Browser + real device for specific cases.

---

# 254. BROWSER AUTOMATION

Can cover Chromium.

Not replacement Safari real.

---

# 255. PERFORMANCE TEST

Measure:
- shell;
- nav;
- Case;
- graph;
- admin.

---

# 256. BUNDLE ANALYSIS

Heavy visual libs watched.

---

# 257. SERVERLESS COLD START

Avoid giant dependency in every route.

---

# 258. PROVIDER SDK

Import server-only and lazy where helpful.

---

# 259. IMAGE LIBRARY

Keep out of user fast path if possible.

---

# 260. AI LIBRARY

Server.

---

# 261. SOURCE SDK

Server.

---

# 262. SHARED TYPES

Can share safe domain types.

Do not share server secrets/config values.

---

# 263. GENERATED SUPABASE TYPES

Safe if schema only.

---

# 264. MIGRATION FILES

Supabase directory.

---

# 265. RUNTIME CONFIG FILE

No secret.

---

# 266. ENV MODULE

Separated.

---

# 267. FEATURE FOLDER

Co-locate:
- UI;
- safe client hooks;
- domain schemas.

Server sensitive:
> server folder or server-only boundary.

---

# 268. SERVER-ONLY MARKER

Use framework mechanism to prevent accidental client import where available.

---

# 269. DATABASE CONNECTION

Use official client/pooling pattern.

---

# 270. CONNECTION BUDGET

Serverless DB connection behavior considered.

Supabase APIs/RPC may reduce direct connection complexity.

---

# 271. DIRECT SQL

Migration/testing/server functions only where appropriate.

---

# 272. SOURCE FETCH HTTP CLIENT

Central:
- timeout;
- headers;
- SSRF guard when URL user-controlled;
- retry.

---

# 273. AI HTTP CLIENT

Central provider adapter.

---

# 274. PROVIDER ERROR MAP

Map:
- timeout;
- quota;
- auth;
- model unavailable.

No raw provider error user-facing.

---

# 275. SOURCE ERROR MAP

Same.

---

# 276. STORAGE ERROR MAP

Same.

---

# 277. DB ERROR MAP

Same.

---

# 278. USER ERROR MAP

Human copy.

---

# 279. ADMIN TECH DETAIL

Expandable.

---

# 280. OPERATIONAL STATUS

`STATUS_PROJECT.md` records actual architecture choice.

This file stays contract.

---

# 281. DECISION RECORDS NEEDED DURING IMPLEMENTATION

Likely:
- package manager;
- Supabase SSR pattern;
- queue;
- Edge vs Node;
- graph renderer;
- state query library;
- image pipeline;
- encryption;
- realtime method;
- PWA strategy.

---

# 282. ANTI-PATTERN — FAT CLIENT

Bad:
```text
browser fetch source
browser asks AI
browser calculates risk
browser deducts credits
browser saves result
```

Forbidden.

---

# 283. ANTI-PATTERN — FAT ROUTE HANDLER

One endpoint:
- source;
- AI;
- ledger;
- payment;
- audit;
- image;
- analytics

in one 1000-line file.

Split domain services.

---

# 284. ANTI-PATTERN — GOD ADMIN

Admin module directly edits every table.

Use domain use cases.

---

# 285. ANTI-PATTERN — GOD DATABASE FUNCTION

Do not put entire application flow inside one PL/pgSQL function.

Only transaction-critical core.

---

# 286. ANTI-PATTERN — EVENTUAL FINANCIAL CONSISTENCY

Payment approved now, credits added “later”.

Forbidden.

Financial settlement:
> same transaction.

---

# 287. ANTI-PATTERN — REALTIME AUTHORITY

Websocket says balance 50:
> not enough.

Refetch server truth.

---

# 288. ANTI-PATTERN — PWA AUTHORITY

Cached role:
> not enough.

---

# 289. ANTI-PATTERN — AI AUTHORITY

AI “likely scam”:
> not verdict.

---

# 290. ANTI-PATTERN — SOURCE AUTHORITY

One source:
> not identity truth unless source semantics truly prove.

---

# 291. ANTI-PATTERN — SERVICE ROLE EVERYWHERE

Defeats RLS defense-in-depth.

---

# 292. ANTI-PATTERN — DUPLICATE BUSINESS LOGIC

Same credit formula in:
- client;
- route;
- RPC.

Keep one authoritative implementation.

---

# 293. ANTI-PATTERN — STATIC BUSINESS CONFIG

Bank/pricing in source/env.

Forbidden.

---

# 294. ANTI-PATTERN — ASYNC WITHOUT STATE

Calling source then hoping response finishes.

Create durable operation first.

---

# 295. ANTI-PATTERN — UNSCOPED CACHE

User A response cached and served User B.

Private data cache keys must include proper identity or no shared cache.

---

# 296. ANTI-PATTERN — RAW DB ROW CLIENT

DTO shaping required.

---

# 297. ANTI-PATTERN — PUBLIC ATTACHMENT

Forbidden.

---

# 298. ANTI-PATTERN — RAW PAYMENT PROOF URL

Short-lived signed.

---

# 299. ANTI-PATTERN — LOGGING FULL CONTEXT PACK

Sensitive.

---

# 300. ANTI-PATTERN — AI PROMPT WITH ENTIRE DB

Forbidden.

---

# 301. ARCHITECTURE QUALITY GATE

Before Phase 7+:

- domain boundaries clear;
- server/client env separated;
- RLS working;
- transaction RPCs defined;
- job mechanism chosen;
- source adapter contract stable;
- error taxonomy exists;
- realtime not authority;
- PWA cache policy exists.

---

# 302. ARCHITECTURE RELEASE GATE

Before production:

- no secret client;
- no cross-tenant cache;
- no financial eventual consistency;
- scan survives close;
- source/AI failure isolated;
- admin uses permissioned server operations;
- PWA stale client controlled;
- data deletion durable;
- observability safe.

---

# 303. SEQUENCE — QUICK CHECK

```text
User
→ Search Console
→ server detect/validate
→ scan quote
→ reserve credit/sponsored benefit
→ durable scan
→ local/core source
→ evidence
→ assessment
→ optional summary
→ settle
→ result
```

---

# 304. SEQUENCE — DEEP ANALYSIS

```text
User
→ quote
→ reserve
→ source plan
→ parallel permitted source jobs
→ evidence
→ correlate
→ contradictions
→ Analyst
→ grounding
→ settle
→ reveal
```

---

# 305. SEQUENCE — AI SKEPTIC

```text
existing evidence
→ eligible allowance/cost
→ Context Pack
→ Analyst baseline
→ Skeptic
→ grounding
→ combined explanation
```

---

# 306. SEQUENCE — TOPUP

```text
User
→ package
→ order snapshot
→ transfer
→ proof
→ screening
→ Finance/Owner review
→ atomic approval
→ realtime signal
→ wallet refetch
→ resume intent
```

---

# 307. SEQUENCE — ADMIN BANK CHANGE

```text
Owner
→ payment config
→ read version
→ edit
→ preview
→ confirm
→ versioned update
→ audit
→ future orders use new
→ old pending unchanged
```

---

# 308. SEQUENCE — CASE DELETE

```text
User
→ delete
→ preview consequences
→ confirm
→ trash/immediate
→ scheduled cleanup
→ Storage cleanup
→ DB cleanup
→ verify
```

---

# 309. SEQUENCE — PWA UPDATE

```text
Old app
→ Sentinel
→ new version available
→ save intent
→ update
→ new shell
→ fresh business state
→ restore intent
```

---

# 310. SEQUENCE — SOURCE OUTAGE

```text
source errors
→ adapter reports
→ health count increases
→ circuit opens
→ source skipped
→ scan continues partial
→ admin health alert
→ later recovery probe
```

---

# 311. SEQUENCE — AI OUTAGE

```text
AI fails
→ fallback
→ result evidence remains
→ NADI unavailable
→ no core outage
```

---

# 312. SEQUENCE — REALTIME OUTAGE

```text
event missed
→ UI stale
→ polling/Segarkan
→ server truth restored
```

---

# 313. SEQUENCE — OWNER ROLE REVOKE STAFF

```text
Owner
→ revoke Finance
→ DB role update
→ audit
→ signal
→ old tab attempts approval
→ current permission check denies
```

---

# 314. SEQUENCE — VOUCHER REDEEM

```text
User
→ voucher code
→ server
→ lock voucher/distribution
→ validate
→ credit lot
→ ledger
→ settle distribution
→ commit
```

---

# 315. SEQUENCE — SAFE SHARE

```text
User
→ generate
→ server sanitize
→ preview
→ confirm
→ opaque token/hash
→ public safe snapshot
```

---

# 316. RESILIENCE TABLE

| Failure | Expected Behavior |
|---|---|
| Gemini down | Groq/rule fallback; core survives |
| Groq down | Gemini/rule fallback; core survives |
| all AI down | evidence core survives |
| one source down | partial result |
| all critical sources down | fail/refund |
| realtime down | polling/Segarkan |
| WebGL down | 2D fallback |
| PWA stale | Version Sentinel |
| upload process fail | retry/error + orphan cleanup |
| notification fail | business transaction preserved |
| analytics fail | business transaction preserved |
| cleanup fail | retry + admin alert |
| staff role revoked | next mutation denied |

---

# 317. LATENCY BUDGET THINKING

User-perceived:
- shell first;
- local transition;
- server read;
- source async.

Do not block nav on source.

---

# 318. LOADING SCOPE

Local component loading.

Not:
> whole App Shell spinner because evidence detail fetch.

---

# 319. STREAMING

Can use if current Next supports and improves perception.

But:
- don't stream partial financial truth;
- don't render AI fact before grounding.

---

# 320. SUSPENSE

UI architecture choice.

Keep local boundary.

---

# 321. SERVER COMPONENTS

Can fetch read-only data efficiently.

Sensitive mutation:
> server action/route.

Agent verifies current Next patterns.

---

# 322. CLIENT COMPONENTS

Used for:
- interactive graph;
- forms;
- bottom sheet;
- realtime;
- motion.

---

# 323. STATIC LANDING

Prefer fast.

Demo local.

---

# 324. SEO

Landing can index.

Authenticated app:
> no need public index.

Safe Share:
> noindex.

---

# 325. CSP CONNECT SOURCES

Allow only needed:
- Supabase;
- own origin;
- specific asset sources.

Provider calls are server-side, so provider domains need not be client connect-src.

---

# 326. CORS

Same-origin app preferred.

---

# 327. OBSERVABILITY SOURCE

Server emits safe.

Client Web Vitals safe.

---

# 328. BROWSER PERFORMANCE

Measure:
- interaction;
- route;
- graph;
- memory.

---

# 329. DATA ACCESS LAYER

Centralize:
- Supabase clients;
- queries;
- RPC wrappers.

Avoid ad-hoc DB calls throughout UI.

---

# 330. SOURCE ACCESS LAYER

Centralize adapter registry.

---

# 331. AI ACCESS LAYER

Centralize provider router.

---

# 332. STORAGE ACCESS LAYER

Centralize signed access + upload pipeline.

---

# 333. PERMISSION LAYER

Centralize capability checks.

---

# 334. ERROR LAYER

Centralize mapping.

---

# 335. EVENT LAYER

Centralize safe events/outbox if adopted.

---

# 336. MODULE TESTABILITY

Domain service should accept interfaces/adapters to allow fixtures.

Don't tightly couple source SDK to UI.

---

# 337. DATABASE TESTABILITY

RPC integration tests on real DB.

---

# 338. JOB TESTABILITY

Worker stage can run deterministic fixture.

---

# 339. AI TESTABILITY

Provider adapter mock.

Grounding independent test.

---

# 340. PWA TESTABILITY

Version endpoint/config deterministic.

---

# 341. DEPENDENCY INJECTION

Use lightweight patterns.

No enterprise container required.

---

# 342. TRANSACTION SERVICE

Do not wrap DB transaction logic in fake in-memory transaction.

---

# 343. USER CONTEXT

Server builds:
```text
user_id
account_status
permissions
workspace context
client version
request id
```

No client claims trusted.

---

# 344. ADMIN CONTEXT

Extends:
```text
staff capabilities
```

Still scoped.

---

# 345. SOURCE CONTEXT

```text
scan id
target normalized
purpose
budget
source config
```

---

# 346. AI CONTEXT

```text
authorized evidence
task
sensitivity
allowance
```

---

# 347. JOB CONTEXT

```text
job id
attempt
lease
correlation id
```

---

# 348. NO GLOBAL MUTABLE SINGLETON BUSINESS STATE

Serverless runtimes not reliable for authoritative mutable state.

Caches okay as optimization.

---

# 349. IN-MEMORY CIRCUIT BREAKER

May reset on cold start.

If operationally insufficient:
> use shared DB/cache.

Record decision.

---

# 350. REGION FAILOVER

V1 doesn't need multi-region write complexity.

Prefer simple Singapore primary.

---

# 351. DATABASE BACKUP

Managed Supabase backup as available.

Storage retention separate.

---

# 352. QUEUE OUTAGE

New scans may remain queued/pending.

Do not consume/settle incorrectly.

---

# 353. DB OUTAGE

Reject new business mutation safely.

Cached display may show unavailable/stale label, never fake current truth.

---

# 354. SOURCE OUTAGE

Partial.

---

# 355. AI OUTAGE

Fallback.

---

# 356. STORAGE OUTAGE

Attachment upload disabled; core text Case may remain.

---

# 357. GOOGLE AUTH OUTAGE

Existing sessions may work if valid; new login unavailable.

---

# 358. VERCEL DEPLOY FAILURE

Old production remains.

---

# 359. MIGRATION FAILURE

Do not promote incompatible server.

---

# 360. FEATURE FLAG ROLLBACK

Preferred for feature regression.

---

# 361. APP VERSION ROLLBACK

Version Sentinel must understand current production version.

---

# 362. DB ROLLBACK

Prefer forward-fix/additive migrations.

---

# 363. PAYMENT INCIDENT

Can disable top-up subsystem.

Wallet/history remains.

---

# 364. CREDIT INCIDENT

Can disable paid scan start.

Old results remain.

---

# 365. SOURCE INCIDENT

Pause source.

---

# 366. AI INCIDENT

Disable AI.

---

# 367. SAFE READ PHILOSOPHY

Emergency changes should preserve:
- owned Case read;
- wallet history;
- approved old results;

where safe.

---

# 368. HEALTH CHECK MATRIX

## Public
- app reachable.

## Internal
- DB;
- Storage;
- queue;
- sources;
- AI;
- version.

Detailed health Owner-only.

---

# 369. ADMIN DIAGNOSTICS

Show:
- status;
- latency;
- last success;
- failure group.

No secrets.

---

# 370. SOURCE DIAGNOSTICS

Same.

---

# 371. AI DIAGNOSTICS

Same.

---

# 372. JOB DIAGNOSTICS

Queue depth/oldest job if available.

---

# 373. PWA DIAGNOSTICS

App version + service worker state.

---

# 374. CLIENT DIAGNOSTICS

User can copy:
- version;
- browser;
- PWA;
- motion;
- last sync.

---

# 375. SECURITY AUDIT

Architecture review should verify:
- privileged boundary;
- RLS;
- DTO;
- cache;
- event payload.

---

# 376. API CONTRACT RELATION

Next file:
> `docs/API_CONTRACT.md`

It will name actual use cases/endpoints.

---

# 377. RELEASE RUNBOOK RELATION

`docs/RELEASE_RUNBOOK.md` will define deploy/migrate/canary/rollback order.

---

# 378. STATUS PROJECT RELATION

Actual choices:
> STATUS.

Architecture file:
> stable target.

---

# 379. DECISION RELATION

If actual implementation diverges:
> DEC.

---

# 380. FINAL RUNTIME NON-NEGOTIABLES

1. Browser bukan business truth.
2. Database memegang financial invariant.
3. RLS memegang tenant boundary.
4. Server mengorkestrasi.
5. AI/source hanya external adapters.
6. AI tidak mutate high-risk domain.
7. Scan durable.
8. Financial mutation atomik.
9. Every valuable mutation idempotent.
10. Realtime bukan authority.
11. PWA cache bukan authority.
12. Config bisnis di DB.
13. Secret di environment.
14. Staff permission server-side.
15. Storage private.
16. File access parent-authorized.
17. External input hostile.
18. Source failure isolated.
19. AI failure isolated.
20. Local error boundary.
21. Admin uses domain services.
22. No duplicate business rules.
23. No service key browser.
24. No raw DB row browser by default.
25. No long transaction around external call.
26. Primary transaction before secondary notification.
27. Jobs retryable and observable.
28. Old PWA compatibility considered.
29. Feature rollout canary/flags.
30. Runtime decisions documented across STATUS + DECISIONS.

---

# 381. AGENT TAKEOVER

Kalau Agent sedang mengerjakan runtime:

1. baca STATUS;
2. baca DECISIONS;
3. baca phase ROADMAP;
4. baca section runtime terkait;
5. lihat API contract setelah tersedia;
6. implement;
7. run acceptance;
8. update STATUS.

Jangan membaca seluruh file ini kalau cuma memperbaiki satu adapter kecil.

---

# 382. FINAL ARCHITECTURE STATEMENT

Jejak harus memiliki satu pola yang konsisten:

> **Browser meminta.  
> Server memverifikasi dan mengorkestrasi.  
> Database menjaga kebenaran.  
> Worker menyelesaikan pekerjaan yang tahan lama.  
> Source memberi data.  
> AI membantu memahami.  
> Realtime memberi sinyal.  
> PWA mempercepat pengalaman.  
> Tidak ada satupun dari mereka boleh mengambil peran yang bukan miliknya.**

**END OF ARCHITECTURE RUNTIME**

---

# APPENDIX A — QUICK RUNTIME REFERENCE

## A.1 — Auth boundary

**Rule:** Session diverifikasi server; object permission tetap DB/RLS.

## A.2 — Account state

**Rule:** Blocked/paused user tidak boleh mengandalkan cached UI untuk mutation.

## A.3 — Case boundary

**Rule:** Semua entity/evidence/relation/file harus inherit parent authorization.

## A.4 — Credit quote

**Rule:** Quote short-lived, server-generated, config-version aware.

## A.5 — Credit hold

**Rule:** Reserve sebelum external work; settle/refund setelah quality decision.

## A.6 — Payment snapshot

**Rule:** Pending order tidak berubah saat rekening/package config berubah.

## A.7 — Payment cleanup

**Rule:** Cleanup asynchronous setelah settlement, tidak berada di atomic approval transaction.

## A.8 — Source run

**Rule:** Satu source punya status/error sendiri sehingga malformed provider tidak crash scan.

## A.9 — Source budget

**Rule:** Budget/governor terpisah dari saldo user.

## A.10 — AI context

**Rule:** Hanya authorized evidence dan minimum PII.

## A.11 — Grounding

**Rule:** AI narrative tidak boleh promoted bila bertentangan dengan structured evidence.

## A.12 — Realtime

**Rule:** Missed event harus recover lewat query.

## A.13 — PWA update

**Rule:** Client di bawah minimum version ditolak dengan error terstruktur.

## A.14 — Safe share

**Rule:** Public sanitized snapshot, bukan query Case dengan anon RLS.

## A.15 — Admin config

**Rule:** Optimistic concurrency/version check + audit.

## A.16 — Audit

**Rule:** Sensitive actor/action/target/reason, tanpa raw secret.

## A.17 — Analytics

**Rule:** Non-blocking dan privacy-safe.

## A.18 — Jobs

**Rule:** Retry tidak boleh menduplikasi side effect.

## A.19 — Cache

**Rule:** Private cache scoped; no cross-user cache key collision.

## A.20 — Uploads

**Rule:** Validate bytes, bound pixels, normalize, private.

## A.21 — Error

**Rule:** Domain error dapat dipahami UI; raw provider/SQL tidak bocor.

## A.22 — Security event

**Rule:** Pattern abnormal, bukan spam setiap 403.

## A.23 — Owner canary

**Rule:** Fitur berisiko dapat diuji Owner sebelum audience luas.

## A.24 — Rollback

**Rule:** Feature flag/pause source lebih disukai daripada destructive rollback.

## A.25 — Migration

**Rule:** Backward-compatible/additive dulu untuk menjaga PWA lama.
