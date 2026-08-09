# RELEASE RUNBOOK — JEJAK

> **Status:** Runbook resmi deployment, migration, canary, rollback, recovery, incident, dan production launch  
> **Produk:** Jejak — `jejak.my.id`  
> **Tujuan:** Membuat proses release Jejak aman, bisa diulang, bisa dibuktikan, dan tidak bergantung pada ingatan Agent  
> **Berlaku untuk:** V1 production launch dan semua release setelahnya  
> **Source of truth terkait:** `docs/ROADMAP.md`, `docs/ACCEPTANCE_TESTS.md`, `docs/ARCHITECTURE_RUNTIME.md`, `docs/API_CONTRACT.md`, `docs/ENVIRONMENT_CONTRACT.md`, `docs/SECURITY_THREAT_MODEL.md`, `.notes/AGENTS.md`, `.notes/STATUS_PROJECT.md`, `.notes/DECISIONS.md`

---

# 0. TUJUAN RUNBOOK

Runbook ini menjawab:

- kapan build boleh dianggap release candidate;
- urutan migration vs deploy;
- cara menjaga PWA lama tetap kompatibel;
- kapan feature flag dipakai;
- bagaimana Owner canary dilakukan;
- kapan release harus dihentikan;
- kapan rollback cukup lewat feature flag;
- kapan butuh redeploy;
- kapan migration harus forward-fix;
- bagaimana menghadapi payment/credit incident;
- bagaimana memastikan release tidak diam-diam membocorkan secret;
- bagaimana handoff Agent dilakukan setelah deploy.

Release Jejak bukan:
> `git push` lalu berharap semuanya aman.

Release Jejak adalah:
> **serangkaian gate yang menjaga data, uang, auth, PWA, dan operasional.**

---

# 1. RELEASE PRINCIPLES

1. Deploy ≠ release.
2. Release ≠ launch.
3. Migration harus backward-compatible sebisa mungkin.
4. Old PWA harus dipertimbangkan.
5. Feature flag memisahkan deployment dari exposure.
6. Financial mutation tidak boleh diaktifkan sebelum race test.
7. RLS tidak boleh “nanti setelah launch”.
8. Secret scan wajib sebelum production.
9. Owner canary sebelum audience luas.
10. Rollback paling aman adalah yang paling reversibel.
11. Data migration lebih sulit dibalik daripada code.
12. Payment/credit incident bisa menutup subsystem tanpa mematikan safe reads.
13. STATUS_PROJECT wajib diperbarui setelah release.
14. DECISIONS wajib diperbarui bila release mengubah architecture.
15. Safari real-device status harus jujur.
16. No P0/P1 unresolved saat broad launch.
17. Jika migration gagal, jangan promote incompatible server.
18. Jika server deploy gagal, production lama tetap lebih baik daripada partial upgrade.
19. Jika PWA stale incompatibility terjadi, minimum client version harus melindungi mutation.
20. Semua release punya bukti.

---

# 2. RELEASE TERMINOLOGY

## 2.1 BUILD

Code berhasil:
- install;
- compile;
- typecheck;
- lint;
- tests.

Build belum berarti deploy.

---

## 2.2 DEPLOY

Artifact dikirim ke:
- Preview;
- Production infrastructure.

Feature bisa masih OFF.

---

## 2.3 RELEASE

Deployment sudah:
- migration compatible;
- smoke tested;
- critical feature flags ready;
- canary eligible.

---

## 2.4 LAUNCH

Feature dibuka ke intended users.

---

## 2.5 CANARY

Audience kecil:
- Owner;
- internal test users;
- small cohort.

---

# 3. RELEASE ENVIRONMENTS

## LOCAL
Development.

## TEST / INTEGRATION
Critical automated tests.

## PREVIEW
Protected candidate review.

## PRODUCTION
Real users.

---

# 4. PRODUCTION CHANGE TYPES

## TYPE A — Static/UI only
Contoh:
- copy;
- visual polish;
- no schema/API change.

Risk rendah.

## TYPE B — Server-compatible
Contoh:
- new read endpoint;
- bugfix server;
- source adapter.

## TYPE C — Schema additive
Contoh:
- new nullable column;
- new table;
- new index.

## TYPE D — Business mutation
Contoh:
- credit;
- payment;
- role;
- voucher.

High-risk.

## TYPE E — Breaking compatibility
Contoh:
- remove old field;
- change RPC signature;
- incompatible client requirement.

Highest care.

---

# 5. RELEASE STRATEGY — EXPAND / MIGRATE / CONTRACT

Untuk breaking data/API change:

```text
1. EXPAND
   add new schema/API path while old still works

2. DEPLOY COMPATIBLE SERVER
   support old + new client

3. MIGRATE / BACKFILL
   convert existing data safely

4. DEPLOY NEW CLIENT
   new PWA starts using new path

5. MINIMUM VERSION
   only if old client cannot remain compatible

6. CONTRACT LATER
   remove old field/API in future release
```

Jangan:
> drop column lalu deploy client berharap semua PWA langsung update.

---

# 6. RELEASE BRANCH / GIT PRECHECK

Before release:

```text
[ ] git status understood
[ ] correct branch
[ ] correct remote
[ ] no uncommitted secret
[ ] latest relevant commit identified
[ ] no accidental generated junk
[ ] blueprint/notes not unintentionally deleted
```

---

# 7. SECRET PRECHECK

Wajib:

```text
[ ] JEJAK.md ignored
[ ] .env.local ignored
[ ] no provider key staged
[ ] no Supabase secret staged
[ ] no DB password staged
[ ] no PAT staged
[ ] client bundle secret scan
[ ] Git history relevant secret scan
```

Failure:
> P0.

---

# 8. ENVIRONMENT PRECHECK

Production:

```text
[ ] Supabase project ref verified
[ ] production app URL correct
[ ] OAuth callback correct
[ ] server env present
[ ] crypto keys present
[ ] provider aliases configured
[ ] PWA version set
[ ] minimum client version understood
[ ] preview/production not mixed
```

---

# 9. SUPABASE TARGET PRECHECK

Before migration:

Output safe metadata only:
```text
Project ref
Environment label
Migration head
```

Never print DB password.

Agent must confirm:
> intended production project.

---

# 10. MIGRATION PRECHECK

```text
[ ] migration reviewed
[ ] additive/backward-compatible where possible
[ ] no accidental DROP
[ ] RLS included if new table
[ ] grants reviewed
[ ] index plan reviewed
[ ] backfill bounded
[ ] rollback/forward-fix plan known
[ ] fresh DB migration test pass
[ ] upgrade-from-current test pass
```

---

# 11. RLS MIGRATION RULE

New sensitive table:
> RLS in same release.

Do not leave:
> “table dulu, policy besok.”

---

# 12. INDEX MIGRATION

Large index on production:
- assess lock/runtime;
- use safer method where supported;
- avoid blocking peak traffic.

Exact strategy per Postgres/Supabase constraints.

---

# 13. BACKFILL

Backfill large data:
- bounded batch;
- resumable;
- observable;
- not one giant transaction if risky.

---

# 14. DATA MIGRATION IDPOTENCY

Backfill/reconciliation:
> rerunnable safely where practical.

---

# 15. DESTRUCTIVE MIGRATION

Production destructive schema change:
- explicit justification;
- verified backup/recovery;
- compatibility gate;
- Product Owner approval if irreversible.

Agent should prefer forward-compatible path.

---

# 16. PREVIEW DEPLOY

Preview candidate must:
- be protected;
- use correct environment;
- not expose admin/payment mutation publicly;
- pass smoke tests.

---

# 17. PREVIEW SMOKE

Minimum:

```text
Landing
Google auth
App Shell
Case open
Wallet read
Source mock/live safe test
Admin route permission
PWA version endpoint
```

---

# 18. PREVIEW FINANCIAL TEST

If testing payment:
- use internal/test order;
- no real user;
- exclude revenue.

---

# 19. PREVIEW RLS TEST

Use separate users.

Check:
- User A cannot read User B.

No mock-only acceptance.

---

# 20. RELEASE CANDIDATE DEFINITION

RC candidate requires:
- build pass;
- typecheck;
- lint critical;
- migration test;
- RLS critical;
- secret scan;
- no known P0/P1;
- acceptance suites relevant.

---

# 21. RC LABEL

Record in STATUS:

```text
RC Commit:
RC Preview URL:
Migration Head:
App Version:
Acceptance Summary:
Known Issues:
```

---

# 22. PRODUCTION DEPLOY ORDER — DEFAULT

Preferred:

```text
1. verify environment
2. apply backward-compatible migration
3. verify migration
4. deploy compatible server
5. smoke production
6. deploy client/PWA
7. run Owner canary
8. enable feature flag for Owner
9. observe
10. expand audience
```

---

# 23. WHY MIGRATION BEFORE SERVER

Only if:
> new server depends on additive schema.

If migration itself depends on server logic:
> adjust sequence, document DEC.

---

# 24. SERVER COMPATIBILITY

Production server should ideally support:
- current client;
- previous installed PWA client.

---

# 25. CLIENT DEPLOY

New PWA build:
- version;
- service worker update;
- Version Sentinel.

---

# 26. FEATURE FLAGS BEFORE EXPOSURE

High-risk feature:
- deployed OFF;
- Owner ON;
- small cohort;
- all.

Examples:
- paid scan;
- AI;
- new source;
- top-up;
- partner.

---

# 27. OWNER CANARY

Owner should perform as normal user:

```text
login
→ wallet
→ search
→ create Case
→ scan
→ result
→ top-up internal test if relevant
→ Ruang Kendali
```

---

# 28. OWNER PAYMENT CANARY

If payment feature changed:

```text
Owner User Mode
→ create internal top-up
→ upload proof
→ Ruang Kendali
→ approve
→ wallet realtime/refresh
→ proof cleanup scheduled
```

Check:
- one settlement;
- revenue excludes internal test;
- audit exists.

---

# 29. OWNER CREDIT CANARY

If ledger changed:
- grant test;
- spend;
- refund;
- verify ledger;
- no negative.

---

# 30. OWNER SOURCE CANARY

If source adapter changed:
- run known safe fixture;
- verify normalized evidence;
- no weird claim.

---

# 31. OWNER AI CANARY

If AI changed:
- ask grounded question;
- inject fake hostile content fixture;
- verify no prompt injection.

---

# 32. OWNER PWA CANARY

If PWA changed:
- installed old version;
- deploy new;
- Sentinel sees update;
- update;
- intent restored.

---

# 33. CANARY OBSERVATION WINDOW

No hardcoded time required.

Observe until:
- no P0/P1 signal;
- error rate normal;
- queue healthy;
- payment/credit correct;
- PWA version adoption sane.

---

# 34. CANARY METRICS

Watch:
- auth errors;
- RLS denial anomaly;
- credit mismatches;
- payment queue;
- provider failure;
- job stuck;
- client update errors;
- frontend exception;
- source latency.

---

# 35. EXPAND AUDIENCE

Suggested:

```text
Owner
→ internal/test users
→ 5–10%
→ 25%
→ 50%
→ 100%
```

Not mandatory exact percentages.

Use what feature flag system supports.

---

# 36. WHEN NOT TO RAMP

Do not expand if:
- P0/P1;
- growing error rate;
- stuck jobs;
- wallet mismatch;
- payment anomaly;
- source poison;
- client update loop.

---

# 37. BROAD LAUNCH GATE

Before 100%:

```text
[ ] Auth healthy
[ ] RLS critical pass
[ ] Storage private pass
[ ] Ledger race pass
[ ] Payment race pass
[ ] PWA update pass
[ ] Brave pass
[ ] Safari status honest
[ ] Source failure isolation pass
[ ] AI fallback pass
[ ] deletion lifecycle pass
[ ] security scan pass
[ ] no P0/P1
```

---

# 38. RELEASE EVIDENCE PACK

STATUS should point to:

- commit;
- migration head;
- preview;
- production URL;
- build result;
- acceptance result;
- canary result;
- browser result;
- secret scan;
- known issues.

---

# 39. DEPLOY FAILURE — BEFORE TRAFFIC

If deployment fails before activation:
> keep old production.

Fix candidate.

Do not rush feature exposure.

---

# 40. DEPLOY FAILURE — AFTER MIGRATION

If additive migration already applied:
> usually leave schema expanded.

Fix server and redeploy.

Don't rollback schema destructively just because code failed.

---

# 41. SERVER ERROR AFTER DEPLOY

First mitigation:
- feature flag off;
- subsystem maintenance;
- source pause.

Then fix.

---

# 42. UI REGRESSION

If server healthy:
- rollback client deploy or feature flag UI.

Ensure old client remains server compatible.

---

# 43. PWA UPDATE LOOP

Symptoms:
- app repeatedly asks update;
- blank after refresh;
- SW mismatch.

Actions:
1. stop ramp;
2. verify version endpoint;
3. verify worker lifecycle;
4. rollback client if needed;
5. keep server backward-compatible;
6. do not tell users clear cache as first solution.

---

# 44. OLD CLIENT INCOMPATIBLE

If unavoidable:
- set minimum version;
- server returns `CLIENT_UPDATE_REQUIRED`;
- UI gives update path;
- preserve safe intent.

---

# 45. DATABASE INCIDENT

Examples:
- migration error;
- RLS policy wrong;
- unexpected constraint failure.

Immediate:
- stop affected feature;
- assess data;
- forward-fix preferred.

---

# 46. RLS LEAK INCIDENT

Severity:
> SEV-0/P0.

Actions:
1. disable affected read path if possible;
2. tighten policy;
3. revoke unsafe endpoint;
4. run negative tests;
5. inspect access logs safely;
6. notify Product Owner clearly;
7. redeploy/restore only after proof.

---

# 47. CREDIT INCIDENT

Examples:
- negative balance;
- duplicate debit;
- duplicate refund;
- reserve race.

Immediate:
- disable new paid scans;
- preserve wallet/history read;
- snapshot affected transactions;
- fix/reconcile;
- run ledger race suite.

---

# 48. PAYMENT INCIDENT

Examples:
- double approval;
- approved without credit;
- wrong package credit.

Immediate:
- disable approval/top-up if needed;
- preserve pending/history;
- identify affected orders;
- reconcile ledger;
- fix transaction;
- run Payment Settlement suite.

---

# 49. BANK CONFIG INCIDENT

If bank account accidentally changed:
- disable new top-up order creation;
- restore correct config;
- audit who/when;
- old pending orders retain their own snapshot.

---

# 50. PAYMENT PROOF PRIVACY INCIDENT

If bucket public:
- disable proof access;
- set private;
- rotate URLs;
- investigate exposure;
- re-run Storage suite.

---

# 51. SECRET LEAK INCIDENT

Follow `ENVIRONMENT_CONTRACT`.

If pushed/client/log/AI:
- rotate;
- remove;
- redeploy;
- inspect usage;
- document.

---

# 52. AI INCIDENT

Examples:
- hallucination spike;
- prompt injection;
- unsafe markup.

Mitigation:
- disable affected AI feature/provider;
- core result remains.

No need whole app outage.

---

# 53. SOURCE INCIDENT

Examples:
- poisoned response;
- licensing issue;
- outage;
- malformed adapter.

Mitigation:
- pause source in Source Registry;
- exclude from score;
- continue other sources.

---

# 54. SOURCE COST INCIDENT

If provider burn:
- circuit breaker;
- budget tighten;
- pause optional source.

Credit-rich user does not bypass.

---

# 55. JOB QUEUE INCIDENT

If scans stuck:
- stop accepting new paid scans if durable queue cannot process safely;
- keep already reserved state visible;
- release/refund only after clear policy;
- fix worker;
- resume.

---

# 56. REALTIME INCIDENT

If realtime down:
- polling/Segarkan;
- no release rollback needed unless UX unusable.

---

# 57. STORAGE INCIDENT

If uploads unavailable:
- disable attachment/proof upload subsystem;
- Case text/read remains;
- payment review of existing proof remains if storage reads work.

---

# 58. AUTH INCIDENT

If Google login down:
- existing sessions may continue if valid;
- new login unavailable;
- show human message.

---

# 59. ANALYTICS INCIDENT

Analytics failure:
> do not rollback business transaction.

Fix separately.

---

# 60. NADI INCIDENT

NADI down:
> manual admin works.

---

# 61. INCIDENT SEVERITY

## SEV-0
- data leak;
- auth bypass;
- exposed active secret;
- financial double settlement.

## SEV-1
- major broken core;
- wallet integrity;
- private storage exposure.

## SEV-2
- degraded feature;
- source/AI/provider outage.

## SEV-3
- cosmetic/minor.

---

# 62. INCIDENT COMMUNICATION

To Product Owner:
- Indonesia;
- lo/gue;
- concise.

Example:

> “Gue nemu double approval masih bisa kejadian pas dua reviewer klik barengan. Gue langsung matiin approval flow, pending order tetap aman. Fix transaksi + race test lagi gue jalanin sebelum dibuka lagi.”

---

# 63. ROLLBACK PRIORITY

Prefer:

1. feature flag OFF
2. source pause
3. maintenance subsystem
4. revert server/client deploy
5. forward-fix DB
6. destructive DB rollback last resort

---

# 64. WHY FEATURE FLAG FIRST

Fast.
Reversible.
Doesn't risk data.

---

# 65. CODE ROLLBACK

Allowed if:
- server remains schema-compatible;
- old code supports current DB.

Check before rollback.

---

# 66. CLIENT ROLLBACK

PWA caution:
> not all clients instantly rollback.

Version Sentinel and server compatibility matter.

---

# 67. DATABASE ROLLBACK

Avoid if data changed.

Prefer:
> forward migration.

---

# 68. FAILED BACKFILL

If partial:
- stop;
- inspect marker/progress;
- resume/fix idempotently.

Do not rerun blindly if non-idempotent.

---

# 69. MIGRATION RECOVERY

Record:
- migration applied?;
- partially?;
- transaction rolled back?;
- data changed?;
- next forward fix.

---

# 70. RELEASE DURING INCIDENT

Do not ship unrelated shiny feature during active SEV-0/1.

Stabilize first.

---

# 71. HOTFIX

Hotfix process still requires:
- secret check;
- build;
- relevant critical test;
- targeted canary.

No bypass security because urgent.

---

# 72. HOTFIX SCOPE

Smallest safe change.

Avoid refactor during incident.

---

# 73. POST-INCIDENT

After resolution:
- regression test;
- STATUS update;
- DEC if architecture changed;
- add acceptance test if missing;
- concise incident note.

---

# 74. DAILY RELEASE SAFETY

For ordinary release:
- current branch;
- status clean;
- build;
- relevant tests;
- migration state;
- deploy;
- canary;
- observe.

---

# 75. RELEASE CHECKLIST — UI ONLY

```text
[ ] build
[ ] typecheck
[ ] lint
[ ] visual regression relevant
[ ] Brave smoke
[ ] no business API break
[ ] PWA version if bundle changed
[ ] canary
```

---

# 76. RELEASE CHECKLIST — SOURCE ADAPTER

```text
[ ] source terms/current docs checked
[ ] adapter tests
[ ] malformed response test
[ ] timeout
[ ] budget
[ ] experimental canary
[ ] main score excluded until promoted
[ ] Owner source health
```

---

# 77. RELEASE CHECKLIST — AI

```text
[ ] provider current policy
[ ] prompt injection fixture
[ ] grounding
[ ] unsafe markup
[ ] fallback
[ ] cost behavior
[ ] sensitive data gate
[ ] Owner canary
```

---

# 78. RELEASE CHECKLIST — CREDIT

```text
[ ] migration
[ ] ledger reconciliation
[ ] 1 credit + concurrent tabs
[ ] settle retry
[ ] refund retry
[ ] no negative
[ ] expiry
[ ] wallet DTO
[ ] canary
```

---

# 79. RELEASE CHECKLIST — PAYMENT

```text
[ ] payment order snapshot
[ ] proof private
[ ] double approval race
[ ] rollback transaction
[ ] audit
[ ] internal test excluded revenue
[ ] cleanup
[ ] Finance permission
[ ] Owner canary
```

---

# 80. RELEASE CHECKLIST — RLS

```text
[ ] positive own data
[ ] negative cross-user
[ ] Finance no Case
[ ] Support masked
[ ] partner isolation
[ ] Storage parent authorization
```

---

# 81. RELEASE CHECKLIST — PWA

```text
[ ] manifest
[ ] install
[ ] old version
[ ] new deployment
[ ] Sentinel
[ ] update
[ ] intent restore
[ ] critical minimum version
[ ] Brave
[ ] Safari status
```

---

# 82. RELEASE CHECKLIST — ADMIN CONFIG

```text
[ ] version conflict
[ ] audit
[ ] preview
[ ] server permission
[ ] old order snapshot unaffected
[ ] realtime/config refresh
```

---

# 83. RELEASE CHECKLIST — PARTNER

```text
[ ] tenant isolation
[ ] affiliate commission source
[ ] voucher reserve
[ ] voucher race
[ ] freeze behavior
[ ] user account unaffected
```

---

# 84. RELEASE CHECKLIST — PRIVACY

```text
[ ] Case trash
[ ] Secret delete
[ ] Storage cleanup
[ ] orphan cleanup
[ ] export private
[ ] export expiry
[ ] account delete
[ ] financial minimal retention
```

---

# 85. V1 FINAL LAUNCH PRECHECK

Before V1 broad launch:

```text
[ ] Phase 0–17 gates satisfied
[ ] no P0
[ ] no P1
[ ] Auth PASS
[ ] RLS PASS
[ ] Storage PASS
[ ] Ledger PASS
[ ] Payment PASS
[ ] Source core PASS
[ ] AI fallback PASS
[ ] PWA PASS
[ ] Brave PASS
[ ] Safari status honest
[ ] Deletion PASS
[ ] Security PASS
[ ] Owner canary PASS
[ ] production URL correct
[ ] custom domain healthy
[ ] OAuth production callback healthy
[ ] support/admin operations usable
```

---

# 86. V1 LAUNCH SEQUENCE

Recommended:

```text
1. Production deploy
2. Owner canary
3. Internal test accounts
4. Invite small user set
5. Observe
6. Enable broader
7. Observe payment/credit
8. 100% V1
```

---

# 87. LAUNCH DAY WATCHLIST

Monitor:
- login conversion;
- first scan failures;
- credit reserve;
- top-up order creation;
- proof upload;
- payment queue;
- source failures;
- PWA update;
- error spikes;
- abuse rate.

---

# 88. LAUNCH DAY OWNER INBOX

Owner should see:
- pending payment;
- critical source problem;
- security incident;
- version issue.

Not noise.

---

# 89. LAUNCH DAY SAFE MODE

If load/abuse unexpected:
> Proteksi Darurat.

Prefer limit expensive work over crashing.

---

# 90. LAUNCH DAY SOURCE BUDGET

Start conservative.

Raise after observed cost/quality.

---

# 91. LAUNCH DAY AI BUDGET

Same.

---

# 92. LAUNCH DAY FREE BENEFIT

Watch abuse of sponsored first scan.

Do not disable reflexively unless signal meaningful.

---

# 93. LAUNCH DAY PAYMENT

Manual approval workload observed.

Owner/Finance must not be overwhelmed.

---

# 94. POST-LAUNCH 24H / FIRST PERIOD REVIEW

No exact hours required.

Review:
- incidents;
- source reliability;
- AI usefulness;
- payment delay;
- credit bugs;
- browser issues;
- PWA version adoption;
- conversion funnel.

---

# 95. POST-LAUNCH CLEANUP

Remove:
- temporary debug;
- test-only feature flags;
- unused preview resources;
- stale internal test data if safe.

Do not remove audit.

---

# 96. POST-LAUNCH DECISION

Only after stable V1:
> consider V1.5.

Do not immediately open all deferred scope.

---

# 97. V1.5 RELEASE PRINCIPLE

Same gates.

Monitoring/collab can create new privacy/credit risks.

Treat as real production feature.

---

# 98. V2 RELEASE PRINCIPLE

Payment gateway/broad search/premium breach:
> new threat/policy review required.

---

# 99. PROVIDER PROMOTION

Experimental source → active requires:
- reliability;
- terms;
- latency;
- cost;
- evidence quality;
- no major poison issue;
- admin health.

---

# 100. PROVIDER DEMOTION

Active source can become:
- degraded;
- paused;
- experimental;
- disabled.

No redeploy required.

---

# 101. AI MODEL PROMOTION

Canary new model:
- Owner;
- test set;
- grounding;
- cost;
- latency.

---

# 102. MODEL ROLLBACK

Config switch.

No code redeploy if architecture supports.

---

# 103. FEATURE FLAG LIFECYCLE

After feature stable:
- either remove flag in later cleanup;
- or keep as operational control if useful.

Avoid zombie flags.

---

# 104. MAINTENANCE FLAG LIFECYCLE

Always operational.

---

# 105. RELEASE NOTES

User-facing release notes:
- short;
- human;
- relevant.

No technical dump.

---

# 106. INTERNAL RELEASE NOTES

STATUS/DECISIONS:
- exact commit;
- migration;
- test;
- issue.

---

# 107. PWA RELEASE COPY

Example:
> “Jejak baru aja diperbarui. Pakai versi terbaru biar hasil dan saldo tetap sinkron.”

---

# 108. CRITICAL UPDATE COPY

Clear:
> update required before continuing sensitive action.

No fear tone.

---

# 109. RELEASE COMMUNICATION TO PRODUCT OWNER

Example:

> “Gas, V1 RC udah hijau. Migration aman, RLS/ledger/payment race lulus, Owner canary juga beres. Safari real masih belum tersedia jadi statusnya gue biarin NOT_AVAILABLE, bukan gue hijauin palsu. Gue siap buka cohort kecil.”

---

# 110. NO FALSE COMPLETION

Never say:
> “Production ready”

if:
- Safari claimed without real test;
- payment race not run;
- RLS negative incomplete;
- secret scan skipped.

---

# 111. STATUS_PROJECT AFTER DEPLOY

Update:

```text
Current Phase
Current Milestone
Latest Production Deploy
App Version
Migration Head
Feature Flags
Acceptance Summary
Browser QA
Known Issues
Blocker
Next Safe Action
```

---

# 112. DECISIONS AFTER DEPLOY

Add DEC only if release changed:
- queue;
- runtime;
- rollout;
- compatibility;
- migration strategy;
- provider choice.

---

# 113. RELEASE TAGGING

Use Git tags/releases if workflow supports.

Example:
```text
v1.0.0
```

Not mandatory before infrastructure ready.

---

# 114. VERSIONING

Semantic-style:
- major;
- minor;
- patch

may be used.

PWA build ID can be more granular.

---

# 115. MIGRATION VERSION

Migration files remain source of DB history.

---

# 116. CLIENT VERSION

Expose safe version for diagnostics.

---

# 117. SERVER VERSION

Can match build.

---

# 118. VERSION SENTINEL MINIMUM

Minimum client version should change only when necessary.

Don't force every cosmetic patch.

---

# 119. CUSTOM DOMAIN

Before launch:
- HTTPS;
- redirect;
- OAuth;
- PWA manifest scope;
- canonical.

---

# 120. PREVIEW DOMAIN

Protected.

No indexing.

---

# 121. PUBLIC LANDING

Can index.

Authenticated routes noindex.

---

# 122. SAFE SHARE

Noindex.

---

# 123. HEALTH ENDPOINT

Public minimal.

Admin detailed protected.

---

# 124. BACKUP / RECOVERY

Use available Supabase backup mechanisms.

Before destructive change:
> know recovery capability.

Do not promise RPO/RTO not actually configured.

---

# 125. DATA EXPORT AS BACKUP? NO

User export is not database backup.

---

# 126. PAYMENT PROOF BACKUP

Short retention intentionally.

Don't keep permanent backup that defeats privacy.

---

# 127. INCIDENT SNAPSHOT

During financial incident:
- capture affected order/ledger refs safely;
- no raw proof copied into notes.

---

# 128. RECONCILIATION

After payment/credit incident:
- compare source transaction to ledger;
- append corrections;
- don't edit history.

---

# 129. MANUAL CREDIT CORRECTION

Through admin adjustment use case.

Reason mandatory.

---

# 130. MANUAL PAYMENT CORRECTION

Preserve order history.

Use audited correction/state resolution, not delete.

---

# 131. ROLLBACK AUDIT

Critical rollback/feature disable:
> audit/system event.

---

# 132. PROTEKSI DARURAT AUDIT

Always record:
- actor;
- reason;
- state;
- time.

---

# 133. SOURCE PAUSE AUDIT

Record if Owner-triggered.

---

# 134. RELEASE SECURITY REVIEW

For high-risk release ask:

- new privileged endpoint?
- new file upload?
- new source?
- new public route?
- new financial mutation?
- new partner entitlement?
- new cached private data?
- new AI data class?

If yes:
> relevant threat model review.

---

# 135. RELEASE PRIVACY REVIEW

Ask:
- new PII stored?
- retention?
- delete path?
- export path?
- AI provider?
- Storage?

---

# 136. RELEASE PERFORMANCE REVIEW

Ask:
- new heavy package?
- bundle size?
- graph?
- source latency?
- cold start?
- mobile memory?

---

# 137. RELEASE ACCESSIBILITY REVIEW

If UI changed:
- keyboard;
- focus;
- reduced motion;
- touch.

---

# 138. BROWSER MATRIX AFTER MAJOR UI CHANGE

At least:
- Brave;
- Chrome;
- Edge;
- Firefox;
- Safari status.

---

# 139. SAFARI REAL TEST

If device available:
- login;
- keyboard;
- PWA;
- safe area;
- update.

If not:
> NOT_AVAILABLE.

---

# 140. BRAVE

Priority because Product Owner uses Brave.

---

# 141. MOBILE ADMIN

Payment approve mobile flow must be smoke tested before launch.

---

# 142. OWNER USER MODE

Owner should test normal user after admin release.

---

# 143. TEST DATA CLEANUP

Internal test data may remain if audit/ledger needs trace.

Mark internal, don't fake delete financial history.

---

# 144. INTERNAL TEST REVENUE

Exclude from revenue.

---

# 145. FEATURE RELEASE CHECK — FIRST SCAN

Verify:
- one-time claim;
- multi-tab race;
- sponsored wording;
- no duplicate benefit.

---

# 146. FEATURE RELEASE CHECK — SAFE SHARE

Verify:
- sanitized;
- token entropy;
- revoke;
- noindex;
- secret Case policy.

---

# 147. FEATURE RELEASE CHECK — PASSWORD

Verify:
- no log;
- no DB;
- no AI;
- no result ≠ safe.

---

# 148. FEATURE RELEASE CHECK — CASE DELETE

Verify:
- Storage actual deletion;
- not just DB row.

---

# 149. FEATURE RELEASE CHECK — EXPORT

Verify:
- private;
- scoped;
- expiry;
- no internal abuse fields.

---

# 150. FEATURE RELEASE CHECK — SUPPORT

Verify:
- masked server DTO.

---

# 151. FEATURE RELEASE CHECK — FINANCE

Verify:
- no Case access.

---

# 152. FEATURE RELEASE CHECK — OWNER

Verify:
- no client secret.

---

# 153. FEATURE RELEASE CHECK — FEATURE FLAG

Direct endpoint must obey server flag.

---

# 154. FEATURE RELEASE CHECK — MAINTENANCE

Old results still read when scans paused.

---

# 155. FEATURE RELEASE CHECK — EMERGENCY

Safe reads preserved where practical.

---

# 156. RELEASE BLOCKERS

Hard blockers:
- missing production secret;
- wrong Supabase target;
- failed migration;
- failed RLS;
- failed ledger race;
- failed payment race;
- leaked secret;
- private Storage public;
- P0/P1 open.

---

# 157. NON-BLOCKING EXAMPLES

May ship if accepted:
- minor copy;
- cosmetic alignment;
- low-priority animation polish.

Record P3.

---

# 158. CONDITIONAL BLOCKER

Safari real unavailable:
> not automatically a hard blocker during development, but status must be explicit.

Broad public launch decision may choose stronger requirement later.

---

# 159. RELEASE FREEZE

During active SEV-0:
> freeze unrelated release.

---

# 160. CHANGE WINDOW

No mandatory clock-time rule.

Agent should avoid risky release when no one can observe/resolve.

If Owner explicitly chooses timing:
> follow.

---

# 161. AUTOMATED RELEASE PIPELINE — IDEAL

Potential:

```text
push
→ install
→ lint
→ typecheck
→ unit
→ integration
→ secret scan
→ build
→ preview
→ E2E
→ production approval
```

Exact CI implementation later.

---

# 162. CI SHOULD NOT

- expose production secrets to untrusted PR;
- run expensive provider tests every commit;
- auto-apply destructive production migration from random branch.

---

# 163. MIGRATION CI

Could verify:
- syntax;
- fresh DB;
- schema diff;
- RLS checks.

Production apply remains protected.

---

# 164. PROVIDER TEST CI

Use mocks for routine.

Real smoke selectively.

---

# 165. BROWSER E2E CI

Chromium automation useful.

Not Safari-real replacement.

---

# 166. RELEASE OWNER APPROVAL

Agent should not ask “mau lanjut?” for every normal deploy step if roadmap authorizes.

But truly irreversible production destructive action:
> ask.

---

# 167. FIRST PRODUCTION DEPLOY

Special care:
- custom domain;
- OAuth;
- environment;
- DB migration;
- initial Owner;
- feature flags default OFF where risky.

---

# 168. INITIAL OWNER BOOTSTRAP

After first production auth:
- verify Owner role created correctly;
- normal user mode default;
- Ruang Kendali accessible.

---

# 169. INITIAL PAYMENT CONFIG

Owner configures/validates real bank method.

Agent should not hardcode.

---

# 170. INITIAL SOURCE CONFIG

Core sources enabled.

Experimental optional source remains owner-only.

---

# 171. INITIAL AI CONFIG

Provider available.
Optional if core can run without.

---

# 172. INITIAL PACKAGE CONFIG

Seed then Owner preview.

---

# 173. INITIAL FIRST-SCAN BENEFIT

Check atomic claim.

---

# 174. INITIAL PWA INSTALL

Test real Brave device.

---

# 175. INITIAL VERSION SENTINEL

Test before inviting broad users.

---

# 176. INITIAL SUPPORT/FINANCE

Only create/assign when needed.

Least privilege.

---

# 177. FIRST USER COHORT

Small.

Use feedback without bypassing logs/tests.

---

# 178. FIRST PAYMENT COHORT

Monitor manual review capacity.

---

# 179. FIRST ABUSE SIGNAL

Don't overreact to one weird user.

Use progressive abuse state.

---

# 180. FIRST SOURCE OUTAGE

Test degraded behavior.

---

# 181. FIRST AI OUTAGE

Confirm core remains.

---

# 182. FIRST PWA UPDATE AFTER LAUNCH

Important milestone.

Run full update check.

---

# 183. FIRST MIGRATION AFTER LAUNCH

Use expand/contract.

Consider installed stale clients.

---

# 184. RELEASE DOCUMENTATION MINIMUM

For each production release:

```text
Version
Commit
Migration head
Feature flags changed
Known issue
Acceptance suites
Canary result
Rollback path
```

---

# 185. RELEASE NOTES TO AGENT

Next Agent should see STATUS, not hunt Git manually.

---

# 186. ROLLBACK PATH FIELD

STATUS can include:
```text
Rollback:
- disable flag X
- revert deploy Y
- do not rollback migration Z
```

---

# 187. POST-RELEASE NEXT SAFE ACTION

Specific.

Example:
> “Observe Owner canary + payment queue for new top-up flow, then enable cohort 10% if no P0/P1.”

---

# 188. RELEASE SUCCESS CRITERIA

Release considered healthy when:
- critical error stable;
- no data/financial integrity issue;
- canary complete;
- queues healthy;
- version adoption normal;
- no unresolved P0/P1.

---

# 189. RELEASE FAILURE CRITERIA

Rollback/disable when:
- integrity compromised;
- auth broken;
- critical flow unusable;
- client update loop;
- storage leak;
- provider burn dangerous.

---

# 190. RELEASE DURABILITY

Production should continue serving old safe functionality while one new feature is disabled.

---

# 191. RELEASE DEPENDENCY GRAPH

Example:

```text
RLS
→ Case
→ Credit
→ Scan
→ AI
→ Payment
→ Admin
```

Do not launch downstream if upstream invariant fail.

---

# 192. PAYMENT BEFORE PARTNER COMMISSION

Commission only after payment settlement works.

---

# 193. SOURCE BEFORE AI

AI analysis needs structured evidence first.

---

# 194. PWA BEFORE BROAD MOBILE

Install/update quality before claiming app-like mobile experience.

---

# 195. OBSERVABILITY BEFORE BROAD LAUNCH

If Owner cannot see incidents:
> broad launch premature.

---

# 196. SECURITY HARDENING BEFORE V1

Not after.

---

# 197. BROWSER QA BEFORE LAUNCH

Required.

---

# 198. DELETION BEFORE PRIVACY CLAIM

Required.

---

# 199. FINAL V1 RELEASE GATE

All must be true:

```text
Foundation healthy
Auth healthy
RLS healthy
Case healthy
Ledger healthy
Scan durable
Sources honest
AI non-blocking
Payment atomic
Admin operable
PWA update healthy
Observability present
Privacy deletion real
Security critical pass
Browser QA reported
Owner canary pass
```

---

# 200. FINAL BROAD LAUNCH DECISION

If all critical gates pass:
> release.

If not:
> stay canary/private.

No shame in delaying broad exposure.

---

# 201. AFTER LAUNCH — DO NOT REWRITE

Stabilize before architecture churn.

Use metrics/incidents to justify changes.

---

# 202. AFTER LAUNCH — V1.5 ENTRY

Only when:
- V1 stable;
- payment usable;
- source cost understood;
- retention signal exists;
- no chronic P0/P1.

---

# 203. AFTER LAUNCH — PRIORITY

1. bugs;
2. integrity;
3. performance;
4. retention;
5. advanced feature.

---

# 204. HANDOFF AFTER RELEASE

Agent must update:

```text
Latest Production
Latest Preview
App Version
Migration Head
Feature Flags
Quality Gates
Known Issues
Blocker
Next Safe Action
Relevant Decisions
```

---

# 205. FINAL RUNBOOK NON-NEGOTIABLES

1. Deploy ≠ release.
2. Release ≠ launch.
3. Migration target verified.
4. Secret scan always.
5. New table gets RLS immediately.
6. Financial race tests before exposure.
7. Payment approval atomic.
8. Credit reserve atomic.
9. Feature flags before risky rollout.
10. Owner canary first.
11. PWA stale compatibility considered.
12. Safari status honest.
13. Rollback most reversible first.
14. DB destructive rollback last.
15. Prefer forward-fix.
16. Source can be paused without deploy.
17. AI can be disabled without killing core.
18. Payment subsystem can pause without deleting history.
19. Credit subsystem can pause new spend while reads remain.
20. Incident communication clear.
21. No P0/P1 broad launch.
22. STATUS updated every release.
23. DECISIONS updated if architecture changes.
24. Internal tests excluded from revenue.
25. Old pending payment keeps snapshot.
26. User safe reads preserved where possible.
27. Critical migration uses expand/contract.
28. Secondary notification never controls money.
29. Release evidence is mandatory.
30. Agent never claims production-ready without proof.

---

# 206. MASTER RELEASE CHECKLIST

```text
GIT
[ ] branch correct
[ ] remote correct
[ ] working tree understood
[ ] commit identified

SECRETS
[ ] JEJAK.md ignored
[ ] env ignored
[ ] secret scan
[ ] bundle scan

ENV
[ ] Supabase ref
[ ] app URL
[ ] OAuth
[ ] server secrets
[ ] app version
[ ] minimum client version

DB
[ ] migration review
[ ] fresh apply
[ ] upgrade apply
[ ] RLS
[ ] constraints
[ ] backfill

BUILD
[ ] install
[ ] typecheck
[ ] lint
[ ] build

TEST
[ ] unit
[ ] integration
[ ] RLS negative
[ ] ledger race
[ ] payment race
[ ] Storage
[ ] PWA
[ ] security

PREVIEW
[ ] protected
[ ] smoke
[ ] E2E

PRODUCTION
[ ] migration
[ ] server deploy
[ ] smoke
[ ] client/PWA deploy
[ ] Owner canary
[ ] feature flags
[ ] observe

BROWSER
[ ] Brave
[ ] Chrome
[ ] Edge
[ ] Firefox
[ ] Safari real status

HANDOFF
[ ] STATUS
[ ] DECISIONS
[ ] migration head
[ ] deploy version
[ ] known issue
[ ] Next Safe Action
```

---

# 207. FINAL STATEMENT

> **Release Jejak harus terasa membosankan dari sisi engineering: terukur, bisa dibalik, punya bukti, dan tidak penuh kejutan.  
> Produk boleh terasa futuristik. Proses deploy jangan futuristik—harus disiplin.**

**END OF RELEASE RUNBOOK**


---

# APPENDIX A — RELEASE RECORD TEMPLATE

```md
# Release <version>

Date:
Commit:
Migration Head:
Production Deploy:
Preview:

## Scope
- ...

## Feature Flags
- ...

## Tests
- ...

## Canary
- ...

## Browser QA
- Brave:
- Chrome:
- Edge:
- Firefox:
- Safari Real:

## Known Issues
- ...

## Rollback
- ...

## Next Safe Action
- ...
```

---

# APPENDIX B — INCIDENT RECORD TEMPLATE

```md
# Incident <JX/INC-ID>

Severity:
Started:
Resolved:

## Impact
...

## Detection
...

## Containment
...

## Root Cause
...

## Fix
...

## Data/Financial Impact
...

## Regression Tests
...

## Follow-up Decisions
...
```

Jangan masukkan raw secret/PII.

---

# APPENDIX C — ROLLBACK DECISION TREE

```text
Is data integrity affected?
├─ YES
│  ├─ stop affected mutations
│  ├─ preserve records
│  ├─ forward-fix/reconcile
│  └─ only destructive rollback with verified plan
│
└─ NO
   ├─ Can feature flag disable?
   │  ├─ YES → disable
   │  └─ NO
   │      ├─ server rollback compatible?
   │      │  ├─ YES → rollback server
   │      │  └─ NO → hotfix forward
   │
   └─ client-only?
      └─ rollback client while preserving server compatibility
```

---

# APPENDIX D — FIRST PRODUCTION DAY CARD

```text
[ ] Owner login
[ ] Owner User Mode
[ ] Ruang Kendali
[ ] First sponsored scan
[ ] Paid scan
[ ] Case
[ ] Wallet
[ ] Internal top-up
[ ] Approve top-up
[ ] Wallet update
[ ] Source health
[ ] AI fallback
[ ] PWA install
[ ] PWA update
[ ] Brave mobile
[ ] Error dashboard
[ ] Owner Inbox
[ ] Proteksi Darurat available
```

---

# APPENDIX E — STOP CONDITIONS

Immediately stop/ramp down if:

- cross-user data visible;
- wallet negative;
- payment duplicate credit;
- service secret exposed;
- proof bucket public;
- migration targets wrong DB;
- old client mutation bypass;
- authentication bypass;
- voucher creates value from nowhere.

Use feature flag/maintenance/emergency first where safe.

