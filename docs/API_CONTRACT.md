# API CONTRACT — JEJAK

> **Status:** Kontrak use case, server action, RPC, route handler, dan error domain untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Tujuan:** Menyatukan cara browser, server, database, worker, admin, source, dan AI berinteraksi tanpa endpoint random atau business rule ganda  
> **Stack target:** Next.js 16 + Supabase + Vercel + PWA  
> **Source of truth terkait:** `docs/PRD.md`, `docs/SCHEMA.md`, `docs/WIRE_MAP.md`, `docs/ARCHITECTURE_RUNTIME.md`, `docs/SECURITY_THREAT_MODEL.md`, `docs/ACCEPTANCE_TESTS.md`

---

# 0. PRINSIP API

API Jejak bukan sekadar kumpulan URL.

API Jejak adalah:
> **kontrak use case.**

Setiap use case sensitif harus jelas:

- authentication;
- authorization;
- input;
- output;
- idempotency;
- transaction boundary;
- audit;
- error;
- acceptance test.

URL atau framework primitive boleh berubah.

Business contract:
> jangan berubah diam-diam.

---

# 1. TRANSPORT TIDAK DIKUNCI KAKU

Agent boleh memilih:

- Next.js Server Action;
- Route Handler;
- Supabase RPC;
- Supabase user-context query;
- internal job invocation;

sesuai current official guidance.

Tapi:
> contract use case tetap.

---

# 2. NAMING

Use case IDs:

```text
AUTH.*
CASE.*
ENTITY.*
EVIDENCE.*
GRAPH.*
CREDIT.*
SCAN.*
SOURCE.*
AI.*
PAYMENT.*
PARTNER.*
PRIVACY.*
PWA.*
ADMIN.*
SYSTEM.*
OBS.*
```

Database transaction/RPC names boleh snake_case.

---

# 3. STANDARD REQUEST CONTEXT

Server membangun context:

```text
request_id
user_id
session_id
account_status
permissions
workspace_context
client_version
app_version
ip/coarse network signal where allowed
user_agent/coarse browser metadata
```

Client tidak boleh menentukan:
- role;
- permission;
- credit;
- account status.

---

# 4. STANDARD RESPONSE SHAPE

Untuk internal server action:
> framework-native return boleh.

Untuk route-style response, conceptual:

```json
{
  "ok": true,
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "INSUFFICIENT_CREDIT",
    "message": "Kredit Lo belum cukup buat lanjut.",
    "jx": "JX-...."
  }
}
```

Raw stack/SQL/provider error:
> tidak ke browser.

---

# 5. STANDARD ERROR CODES

## Authentication

```text
AUTH_REQUIRED
SESSION_EXPIRED
ACCOUNT_BLOCKED
ACCOUNT_PAUSED
```

## Authorization

```text
PERMISSION_DENIED
CASE_ACCESS_DENIED
WORKSPACE_ACCESS_DENIED
STAFF_PERMISSION_DENIED
```

## Validation

```text
INVALID_INPUT
INVALID_IDENTIFIER
INVALID_FILE
FILE_TOO_LARGE
UNSUPPORTED_FILE
```

## Credit

```text
INSUFFICIENT_CREDIT
CREDIT_RESERVATION_FAILED
CREDIT_ALREADY_SETTLED
CREDIT_ALREADY_RELEASED
QUOTE_EXPIRED
QUOTE_CHANGED
```

## Scan

```text
SCAN_NOT_FOUND
SCAN_ALREADY_RUNNING
SCAN_ALREADY_COMPLETE
SCAN_UNAVAILABLE
SCAN_FAILED
SOURCE_UNAVAILABLE
```

## Payment

```text
PAYMENT_METHOD_UNAVAILABLE
TOPUP_ORDER_NOT_FOUND
TOPUP_ORDER_EXPIRED
PROOF_REQUIRED
PROOF_INVALID
PAYMENT_ALREADY_APPROVED
PAYMENT_ALREADY_REJECTED
PAYMENT_STATE_CONFLICT
```

## PWA/System

```text
CLIENT_UPDATE_REQUIRED
FEATURE_DISABLED
MAINTENANCE_ACTIVE
RATE_LIMITED
SYSTEM_BUSY
```

---

# 6. IDEMPOTENCY HEADER / FIELD

High-value mutation wajib punya idempotency.

Suggested logical field:

```text
idempotencyKey
```

Scope:
- user;
- operation;
- target.

Database unique constraint:
> final guard.

---

# 7. AUTH — `AUTH.START_GOOGLE`

**Tujuan:** mulai Google OAuth.

**Auth:** tidak perlu.

**Input:**
```text
returnTo? safe internal route
```

**Output:**
```text
redirect / auth URL
```

**Rules:**
- returnTo hanya route internal aman;
- tidak open redirect.

**Errors:**
- `INVALID_INPUT`
- provider unavailable

**Acceptance:**
- `AT-AUTH-001`
- `AT-AUTH-008`

---

# 8. AUTH — `AUTH.CALLBACK`

**Tujuan:** menyelesaikan OAuth callback.

**Auth:** callback state/session flow.

**Input:** provider callback params.

**Server does:**
- validate OAuth state;
- establish session;
- run idempotent initializer;
- resolve safe return route.

**Output:** redirect to onboarding/app.

**Acceptance:**
- `AT-AUTH-001`
- `AT-AUTH-002`
- `AT-AUTH-009`

---

# 9. AUTH — `AUTH.LOGOUT`

**Auth:** authenticated.

**Mutation:** session revoke/logout.

**Output:** success + route login/landing.

**Acceptance:**
- `AT-AUTH-005`

---

# 10. AUTH — `AUTH.ME`

**Tujuan:** current app identity summary.

**Output DTO:**
```text
userRef
displayName
avatarUrl
accountStatus
primaryCapabilities
partnerContexts
ownerContextAvailable
```

Jangan return:
- raw role internals unnecessary;
- secret claims.

---

# 11. AUTH — `AUTH.REFRESH_CONTEXT`

**Tujuan:** sinkronkan current role/account context untuk Segarkan.

**Output:**
- latest account state;
- capability summary;
- partner contexts;
- client update requirement if any.

---

# 12. AUTH — `AUTH.INIT_USER`

Biasanya internal setelah first login.

**DB requirements:**
- one profile;
- one wallet;
- baseline user role;
- one sponsored benefit eligibility.

**Idempotent:** wajib.

---

# 13. CASE — `CASE.LIST`

**Auth:** user.

**Query:**
```text
status?
search?
cursor?
limit?
workspace?
```

**Output summary only:**
```text
caseRef
title/displayLabel
secretMasked?
status
updatedAt
entityCount
evidenceCount
riskSummary?
```

Jangan preload full evidence.

---

# 14. CASE — `CASE.CREATE`

**Auth:** user/Mitra based permission.

**Input:**
```text
title
purpose
secret?
workspaceRef?
clientRef?
```

**Server:**
- validate;
- create Case;
- create owner/member relation atomik.

**Output:** Case summary.

**Audit:** case create activity.

**Acceptance:**
- `AT-CASE-001`
- `AT-CASE-002`

---

# 15. CASE — `CASE.GET`

**Auth:** Case permission.

**Input:** `caseRef`

**Output initial DTO:**
- metadata;
- role in Case;
- entity summary;
- assessment summary;
- small graph subset;
- counts;
- recent activity.

---

# 16. CASE — `CASE.UPDATE`

**Auth:** owner/contributor capability.

**Input allowed:**
```text
title?
purpose?
secret?
```

Mass assignment:
> reject unknown sensitive fields.

---

# 17. CASE — `CASE.TRASH`

**Auth:** Case owner.

**Input:**
```text
caseRef
idempotencyKey
```

**Output:** trash state + scheduled hard-delete date.

---

# 18. CASE — `CASE.RESTORE`

**Auth:** owner.

**Output:** active Case.

**Acceptance:**
- `AT-CASE-006`

---

# 19. CASE — `CASE.DELETE_PERMANENT`

**Auth:** owner.

**Allowed:**
- Secret Case immediate confirmed path;
- normal Case after trash policy/admin cleanup.

**Server:**
- enqueue deletion lifecycle.

**Output:** deletion requested.

---

# 20. CASE — `CASE.MEMBERS_LIST`

**Auth:** Case owner/member view permission.

**Output:** membership summary.

---

# 21. CASE — `CASE.MEMBER_ADD`

V1 foundation / V1.5 UI.

**Auth:** Case owner.

**Input:**
```text
userRef
role = viewer|contributor
```

**Audit:** yes.

---

# 22. CASE — `CASE.MEMBER_REMOVE`

**Auth:** Case owner.

**Audit:** yes.

**Effect:** next request denied immediately from DB truth.

---

# 23. ENTITY — `ENTITY.DETECT_TYPE`

May be client-local + server authoritative.

**Input:** raw string.

**Output:**
```text
candidateTypes[]
confidence
needsUserChoice
```

No expensive provider call.

---

# 24. ENTITY — `ENTITY.ADD_TO_CASE`

**Auth:** Case edit permission.

**Input:**
```text
caseRef
type
rawValue
label?
```

**Server:**
- canonical normalize;
- encrypt/HMAC where relevant;
- duplicate check within Case;
- create entity.

**Output:** safe entity DTO.

---

# 25. ENTITY — `ENTITY.GET`

**Auth:** Case read.

**Output:**
- display-safe value;
- type;
- evidence count;
- relationship count;
- timestamps;
- current assessment.

---

# 26. ENTITY — `ENTITY.UPDATE_LABEL`

**Auth:** Case edit.

Only user-facing label/note fields.

No raw canonical identifier mutation via generic update.

---

# 27. ENTITY — `ENTITY.REMOVE_FROM_CASE`

**Auth:** Case owner/contributor per policy.

Must account:
- evidence linked;
- relationships;
- merge state.

Prefer soft unlink where evidence integrity requires.

---

# 28. GRAPH — `GRAPH.GET`

**Auth:** Case read.

**Input:**
```text
caseRef
focusEntityRef?
layers?
cursor?
depth?
```

**Output:**
```text
nodes[]
edges[]
clusters?
nextCursor?
```

No full graph by default for huge Case.

---

# 29. GRAPH — `GRAPH.RELATION_SUGGEST`

Usually system-generated.

**Input internal:**
- evidence refs;
- entity refs;
- relation type;
- confidence/signal;
- rationale.

Status:
> suggested.

---

# 30. GRAPH — `GRAPH.RELATION_ACCEPT`

**Auth:** Case edit.

**Input:**
```text
relationRef
idempotencyKey
```

**Audit/activity:** yes.

---

# 31. GRAPH — `GRAPH.RELATION_REJECT`

**Auth:** Case edit.

Keeps history if needed.

---

# 32. GRAPH — `GRAPH.MERGE_PREVIEW`

**Auth:** Case edit.

**Output:**
- entities affected;
- evidence impact;
- contradictions;
- reversible plan.

No mutation.

---

# 33. GRAPH — `GRAPH.MERGE_CONFIRM`

**Auth:** Case owner/editor.

**Input:**
```text
mergePlanRef
idempotencyKey
```

Must remain reversible.

---

# 34. GRAPH — `GRAPH.MERGE_UNDO`

**Auth:** Case owner/editor.

**Output:** restored logical split.

---

# 35. EVIDENCE — `EVIDENCE.LIST`

**Auth:** Case read.

**Filters:**
```text
entityRef?
source?
type?
strength?
timeRange?
cursor?
```

---

# 36. EVIDENCE — `EVIDENCE.GET`

**Auth:** Case read.

**Output Evidence Passport:**
```text
evidenceRef
classification
source
sourceType
retrievedAt
eventTime?
reliability
targetRef
facts
reverify
conflicts[]
```

---

# 37. EVIDENCE — `EVIDENCE.ADD_USER_NOTE`

**Auth:** Case edit.

**Classification:**
> user evidence/context.

Never verified fact automatically.

---

# 38. EVIDENCE — `EVIDENCE.UPLOAD_ATTACHMENT`

**Auth:** Case edit.

Potential transport:
> route handler/multipart.

**Input:**
- Case ref;
- file;
- label;
- idempotency key.

**Pipeline:**
- auth parent;
- size;
- MIME;
- decode;
- normalize;
- metadata strip;
- private Storage.

**Output:** attachment/evidence ref.

---

# 39. EVIDENCE — `EVIDENCE.FILE_ACCESS`

**Auth:** parent Case read.

**Input:** attachment ref.

**Output:** short signed URL.

Never permanent public URL.

---

# 40. EVIDENCE — `EVIDENCE.REVERIFY`

**Auth:** Case edit/paid eligibility.

May require:
- quote;
- credit.

Do not perform paid source refresh implicitly.

---

# 41. EVIDENCE — `EVIDENCE.CONTRADICTIONS`

**Auth:** Case read.

**Output:**
- contradiction groups;
- supporting evidence;
- conflicting evidence;
- unresolved state.

---

# 42. EVIDENCE — `EVIDENCE.TIMELINE`

**Auth:** Case read.

**Input:**
```text
caseRef
from?
to?
precision?
cursor?
```

Only evidence-backed times.

---

# 43. CREDIT — `CREDIT.WALLET`

**Auth:** own user / authorized admin.

**User output:**
```text
available
reserved
expiringSoon
nextExpiry
```

Admin may get richer safe breakdown.

---

# 44. CREDIT — `CREDIT.LEDGER_LIST`

**Auth:** own user / capability.

**Output:**
- transaction summary;
- source;
- amount;
- time;
- expiry-related notes.

No mutable history.

---

# 45. CREDIT — `CREDIT.QUOTE_SCAN`

**Auth:** user.

**Input:**
```text
scanProduct
targetType
caseRef?
baseScanRef?
options?
```

**Server computes:**
- current cost;
- upgrade delta;
- operations;
- quote expiry;
- config version.

**Output:**
```text
quoteRef
cost
expiresAt
operations[]
reusedWork?
```

---

# 46. CREDIT — `CREDIT.RESERVE_FOR_SCAN`

Usually internal part of `SCAN.START`.

**DB RPC conceptual:**
`reserve_scan_credits`

**Input:**
```text
user_id
scan_id
quote_ref
idempotency_key
```

**Output:** hold/allocations.

---

# 47. CREDIT — `CREDIT.SETTLE_SCAN`

Internal worker.

**DB RPC:**
`settle_scan_credits`

Idempotent.

---

# 48. CREDIT — `CREDIT.RELEASE_SCAN`

Internal worker/refund path.

Idempotent.

---

# 49. CREDIT — `CREDIT.ADMIN_ADJUST`

**Auth:** Owner/admin with explicit capability.

**Input:**
```text
userRef
amount
kind = grant|correction|compensation
reason
idempotencyKey
```

Large grant:
> stronger confirmation UI.

**Audit:** mandatory.

---

# 50. CREDIT — `CREDIT.EXTEND_ELIGIBLE`

Usually internal after qualifying approved top-up.

Atomic lot rules.

---

# 51. SCAN — `SCAN.QUOTE`

Alias/orchestrated via credit quote.

**Output:** exact expected operations/cost.

---

# 52. SCAN — `SCAN.START`

**Auth:** user active.

**Input:**
```text
quoteRef
target
intent
caseRef?
idempotencyKey
clientVersion
```

**Server:**
1. validate version;
2. account/feature/maintenance;
3. validate quote;
4. create durable scan;
5. reserve/claim sponsored benefit;
6. enqueue job.

**Output:**
```text
scanRef
status
reservedCost
stage
```

**Acceptance:**
- `AT-SCAN-001`
- `AT-SCAN-003`
- credit race tests.

---

# 53. SCAN — `SCAN.GET`

**Auth:** scan owner/Case permission.

**Output:**
```text
status
stage
startedAt
completedAt?
sourceSummary
creditState
resultRef?
errorPublic?
```

No fake percentage.

---

# 54. SCAN — `SCAN.LIST_ACTIVE`

**Auth:** user.

Global App Shell indicator.

---

# 55. SCAN — `SCAN.RESULT`

**Auth:** owner/Case read.

**Output:**
- Match;
- Exposure;
- Risk;
- Completeness;
- evidence summary;
- contradictions;
- next actions.

AI narrative optional.

---

# 56. SCAN — `SCAN.RETRY`

Only if policy allows.

Must distinguish:
- retry technical failed stage without new charge;
- new refresh requiring quote.

Do not blindly create new paid operation.

---

# 57. SOURCE — `SOURCE.STATUS_PUBLIC_FOR_SCAN`

User-safe:
- source count;
- degraded note;
- completeness.

No internal cost/key health.

---

# 58. SOURCE — `SOURCE.ADMIN_LIST`

**Auth:** Owner/admin source capability.

**Output:**
```text
sourceRef
name
state
experimental
priority
reliability
health
lastSuccess
usage
costClass
```

No raw credential.

---

# 59. SOURCE — `SOURCE.ADMIN_UPDATE`

**Auth:** source config capability.

**Input:**
```text
sourceRef
expectedVersion
enabled?
experimental?
priority?
budget?
```

**Audit:** yes.

---

# 60. SOURCE — `SOURCE.ADMIN_TEST`

**Auth:** Owner/test capability.

Experimental/canary source only.

Must:
- cheap;
- safe fixture;
- not use arbitrary real target without explicit input.

---

# 61. AI — `AI.EXPLAIN_RESULT`

**Auth:** result access.

**Input:**
```text
resultRef
question?
```

If included allowance:
> no charge.

If new paid work:
> return quote-needed response.

---

# 62. AI — `AI.CHALLENGE_CONCLUSION`

V1.5 richer.

**Auth:** Case/result.

**Output:**
- strongest alternative;
- counter-evidence;
- unknowns;
- what would change conclusion.

---

# 63. AI — `AI.FIND_ANOMALIES`

**Auth:** Case.

**Output:** interpretation layer only.

No evidence mutation.

---

# 64. AI — `AI.SIMULATE_SCENARIO`

V1.5.

Must label:
> hypothetical.

No graph mutation.

---

# 65. AI — `AI.NADI_QUERY`

**Auth:** Owner/admin NADI capability.

**Input:**
```text
question
contextArea?
```

**Output:**
- answer;
- supporting aggregates;
- recommended action;
- draft action if applicable.

No mutation.

---

# 66. AI — `AI.NADI_DRAFT_ACTION`

**Auth:** Owner.

Examples:
- draft credit grant;
- draft source pause;
- draft announcement.

Output only.

User then confirms via regular endpoint.

---

# 67. PASSWORD — `PASSWORD.CHECK_EXPOSURE`

**Auth:** user or allowed unauth? V1 preferably authenticated product feature.

**Input:** password in transient request context.

**Rules:**
- never log;
- never persist;
- never AI;
- k-anonymity/range lookup.

**Output:**
```text
found
occurrenceCount?
message
```

---

# 68. PAYMENT — `PAYMENT.PACKAGES`

**Auth:** user.

**Output active packages:**
```text
packageRef
name
price
credits
validity
bonus
recommended?
```

---

# 69. PAYMENT — `PAYMENT.METHODS_PUBLIC`

**Auth:** user.

Only active user-facing payment methods.

---

# 70. PAYMENT — `PAYMENT.TOPUP_CREATE`

**Auth:** active user.

**Input:**
```text
packageRef
idempotencyKey
intendedActionRef?
```

**Server:**
- fetch current config;
- unique amount;
- snapshot package;
- snapshot payment method;
- persist order.

**Output:**
```text
orderRef
expectedAmount
bankName
accountNumber
accountHolder
instructions
expiresAt
```

---

# 71. PAYMENT — `PAYMENT.TOPUP_GET`

**Auth:** order owner / Finance/Admin.

User DTO:
- status;
- expected amount;
- payment snapshot;
- proof state;
- timestamps.

---

# 72. PAYMENT — `PAYMENT.PROOF_UPLOAD`

**Auth:** order owner.

**Allowed states:** waiting proof / needs new proof.

**Input:** file.

**Pipeline:** private normalize.

**Output:**
- proof accepted;
- status `under_review`.

---

# 73. PAYMENT — `PAYMENT.PROOF_GET_SIGNED`

**Auth:** Finance/Owner with payment permission.

Not user public.

**Output:** short signed URL.

Audit access if policy requires.

---

# 74. PAYMENT — `PAYMENT.REVIEW_QUEUE`

**Auth:** Finance/Owner.

**Filters:**
- pending;
- needs proof;
- suspicious;
- oldest;
- amount.

Output summary no image preload.

---

# 75. PAYMENT — `PAYMENT.REVIEW_GET`

**Auth:** Finance/Owner.

Output:
- order summary;
- user summary;
- proof metadata;
- Sentinel signals;
- duplicate warnings;
- audit history.

---

# 76. PAYMENT — `PAYMENT.APPROVE`

**Auth:** Finance/Owner approve capability.

**Input:**
```text
orderRef
confirmedAmount
bankVerified = true
reason?
overrideWarnings?
idempotencyKey
```

**Server:**
- permission;
- call atomic `approve_topup`.

**Output:**
```text
approved
creditsAdded
walletSummary
```

**Acceptance:**
- `AT-PAY-003`
- `AT-PAY-004`
- `AT-PAY-005`
- `AT-PAY-014`

---

# 77. PAYMENT — `PAYMENT.REJECT`

**Auth:** Finance/Owner.

**Input:**
```text
orderRef
reasonCode
reasonText?
idempotencyKey
```

Does not delete proof immediately.

---

# 78. PAYMENT — `PAYMENT.REQUEST_NEW_PROOF`

**Auth:** Finance/Owner.

**Output:** order state + user notification.

---

# 79. PAYMENT — `PAYMENT.ADMIN_METHOD_LIST`

**Auth:** business/payment config capability.

Includes inactive methods.

---

# 80. PAYMENT — `PAYMENT.ADMIN_METHOD_CREATE`

**Input:**
```text
type
bankName
accountNumber
accountHolder
instructions
active
primary
displayOrder
```

**Audit:** yes.

Account number belongs DB config, not env.

---

# 81. PAYMENT — `PAYMENT.ADMIN_METHOD_UPDATE`

**Input includes:**
```text
expectedVersion
```

Stale:
> conflict.

Old orders unaffected.

---

# 82. PAYMENT — `PAYMENT.ADMIN_METHOD_DISABLE`

Server returns warning:
- pending order count.

Disabling affects new orders only.

---

# 83. PAYMENT — `PAYMENT.ADMIN_PACKAGE_LIST`

Auth business config.

---

# 84. PAYMENT — `PAYMENT.ADMIN_PACKAGE_UPDATE`

Versioned config.

Fields:
- name;
- price;
- credit amount;
- validity;
- bonus;
- active;
- ordering.

---

# 85. PARTNER — `PARTNER.MY_CONTEXTS`

User output:
- Affiliate active?;
- Reseller active?;
- Mitra active?;
- statuses.

---

# 86. PARTNER — `AFFILIATE.GET_CODE`

**Auth:** Affiliate.

Output referral code/link.

---

# 87. PARTNER — `AFFILIATE.STATS`

Output:
- clicks aggregate if tracked;
- signups;
- qualified topups;
- pending commission;
- paid commission.

No referred user Case/payment proof.

---

# 88. PARTNER — `AFFILIATE.ATTRIBUTION`

Usually pre-signup/internal.

Must avoid open abuse.

Attribution policy from PRD/Schema.

---

# 89. PARTNER — `RESELLER.WALLET`

Output:
- distribution available;
- reserved;
- history summary.

Separate personal credit.

---

# 90. PARTNER — `RESELLER.VOUCHER_CREATE`

**Auth:** active Reseller.

**Input:**
```text
creditValue
validity
count?
idempotencyKey
```

Atomic reserve distribution.

---

# 91. PARTNER — `RESELLER.VOUCHER_LIST`

Scoped reseller only.

---

# 92. PARTNER — `VOUCHER.REDEEM`

**Auth:** user.

**Input:**
```text
code
idempotencyKey
```

Atomic:
- lock;
- eligibility;
- user credit lot;
- reseller distribution settlement.

---

# 93. PARTNER — `MITRA.APPLY`

**Auth:** user.

Input minimal:
- display/business name;
- reason/use case;
- optional notes.

No mandatory KTP by default.

---

# 94. PARTNER — `MITRA.WORKSPACE_GET`

**Auth:** active Mitra membership.

---

# 95. PARTNER — `MITRA.CLIENT_LIST`

Tenant scoped.

---

# 96. PARTNER — `MITRA.CLIENT_CREATE`

Input:
```text
name
internalLabel?
notes?
```

No unnecessary KTP.

---

# 97. PARTNER — `MITRA.CLIENT_GET`

Tenant scoped.

---

# 98. PARTNER — `PARTNER.ADMIN_LIST`

**Auth:** Owner/partner admin capability.

---

# 99. PARTNER — `PARTNER.ADMIN_APPROVE`

Application → active.

Audit.

---

# 100. PARTNER — `PARTNER.ADMIN_PAUSE`

Pause partner right, not user account.

---

# 101. PARTNER — `PARTNER.ADMIN_REVOKE`

Preserve history/data ownership rules.

---

# 102. ADMIN — `ADMIN.OVERVIEW`

**Auth:** Owner/Admin capability.

Output action-oriented:
- pending payments;
- active incidents;
- source health;
- revenue summary;
- user/scan trend;
- storage/cleanup issue;
- version adoption.

---

# 103. ADMIN — `ADMIN.INBOX`

Output:
- needs action;
- important;
- info.

Read does not mark resolved.

---

# 104. ADMIN — `ADMIN.INBOX.RESOLVE`

Input:
```text
itemRef
resolution
```

Audit if sensitive.

---

# 105. ADMIN — `ADMIN.USER_SEARCH`

Auth staff capability.

Input:
- exact user ref;
- email/name search depending permission.

Support result masked.

---

# 106. ADMIN — `ADMIN.USER_GET`

Purpose-specific DTO based on staff capability.

Finance should not receive Case data.

---

# 107. ADMIN — `ADMIN.USER_STATUS_UPDATE`

Owner/Admin capability.

Input:
```text
userRef
newStatus
reason
idempotencyKey
```

Audit.

---

# 108. ADMIN — `ADMIN.ROLE_LIST`

Owner/admin permissions.

---

# 109. ADMIN — `ADMIN.ROLE_ASSIGN`

Owner capability depending target role.

Cannot self-promote to Owner if not Owner.

Audit.

---

# 110. ADMIN — `ADMIN.ROLE_REVOKE`

Cannot remove last/primary Owner improperly.

Audit.

---

# 111. ADMIN — `ADMIN.SENSITIVE_REVEAL`

Support/authorized staff.

Input:
```text
userRef/entityRef
field
reason?
```

Output:
- specific field only.

Audit:
> sensitive access.

---

# 112. ADMIN — `ADMIN.PERMISSION_SIMULATOR`

Owner only.

Output:
> preview capability/UI model.

No actual identity mutation.

---

# 113. SYSTEM — `SYSTEM.CONFIG_GET`

Auth depending config domain.

Returns current values + version.

---

# 114. SYSTEM — `SYSTEM.CONFIG_UPDATE`

Versioned.

Do not allow security invariant config.

---

# 115. SYSTEM — `SYSTEM.FEATURE_FLAGS_LIST`

Owner/admin.

---

# 116. SYSTEM — `SYSTEM.FEATURE_FLAG_UPDATE`

Input:
```text
flagRef
expectedVersion
enabled
audience
rollout?
```

Server enforcement mandatory.

---

# 117. SYSTEM — `SYSTEM.MAINTENANCE_GET`

Owner/admin.

---

# 118. SYSTEM — `SYSTEM.MAINTENANCE_UPDATE`

Subsystem-specific:
- scans;
- AI;
- topups;
- upload;
- monitoring.

Audit.

---

# 119. SYSTEM — `SYSTEM.EMERGENCY_PROTECTION_UPDATE`

Owner only.

Input:
```text
mode
reason
expectedVersion
```

Audit + Owner Inbox state.

---

# 120. SYSTEM — `SYSTEM.VERSION`

Public-safe endpoint.

Output:
```text
latestVersion
minimumVersion
criticalUpdate?
```

No secret.

---

# 121. SYSTEM — `SYSTEM.HEALTH_PUBLIC`

Minimal:
- app reachable;
- maybe degraded generic.

No internal details.

---

# 122. SYSTEM — `SYSTEM.HEALTH_ADMIN`

Owner/system capability.

Output:
- DB;
- Storage;
- queue;
- source;
- AI;
- cleanup;
- app version;
- PWA adoption.

---

# 123. SYSTEM — `SYSTEM.ISSUES`

Pusat Masalah.

Grouped incidents, safe summaries.

---

# 124. OBS — `OBS.REPORT_PROBLEM`

Auth optional depending context.

Input:
```text
jxCode?
description?
safeDiagnostics
```

Server strips unsafe fields.

---

# 125. OBS — `OBS.CLIENT_METRIC`

Privacy-safe:
- route class;
- timing;
- browser family;
- PWA;
- version.

No raw target.

---

# 126. OBS — `OBS.ANALYTICS_EVENT`

Semantic event.

No raw PII.

Critical business events preferably server emitted:
- payment approved;
- credit settled.

---

# 127. PRIVACY — `PRIVACY.SETTINGS_GET`

User.

Output:
- marketing consent;
- notification preference;
- privacy controls.

---

# 128. PRIVACY — `PRIVACY.SETTINGS_UPDATE`

User.

Only own preferences.

---

# 129. PRIVACY — `PRIVACY.EXPORT_REQUEST`

Auth user.

Input:
```text
idempotencyKey
```

Server:
- scope;
- create job.

Output:
- export ref/status.

---

# 130. PRIVACY — `PRIVACY.EXPORT_GET`

User own.

When ready:
> short signed URL.

---

# 131. PRIVACY — `PRIVACY.ACCOUNT_DELETE_PREVIEW`

Auth user.

Output:
- credit consequence;
- Cases;
- partner role;
- shared ownership;
- pending work.

No mutation.

---

# 132. PRIVACY — `PRIVACY.ACCOUNT_DELETE_CONFIRM`

Auth user.

Strong confirmation.

Server:
- freeze new work;
- resolve blockers;
- enqueue lifecycle.

---

# 133. SHARE — `SHARE.PREVIEW`

Auth Case owner/editor.

Server generates sanitized preview.

No public artifact yet.

---

# 134. SHARE — `SHARE.CREATE`

Input:
```text
caseRef
sanitizedConfig
expiresAt?
idempotencyKey
```

Server:
- create immutable/sanitized snapshot;
- opaque token/hash.

---

# 135. SHARE — `SHARE.PUBLIC_GET`

Auth: none.

Input:
> opaque token.

Output:
> sanitized snapshot only.

Headers:
- noindex;
- safe cache policy.

---

# 136. SHARE — `SHARE.REVOKE`

Auth creator/Case owner.

Immediately blocks future public access.

---

# 137. PWA — `PWA.SYNC`

Can be composite server/client orchestrator.

Refetch:
- version;
- wallet;
- role/account;
- notifications;
- active scan;
- pending payment;
- current workspace.

---

# 138. PWA — `PWA.INSTALL_STATE`

Mostly client-side.

No business API required.

---

# 139. NOTIFICATION — `KABAR.LIST`

Auth user.

Filters:
- info;
- important;
- attention;
- urgent.

Secret Case safe copy.

---

# 140. NOTIFICATION — `KABAR.MARK_READ`

Low-risk idempotent.

---

# 141. NOTIFICATION — `KABAR.ACTION_RESOLVE`

For actionable items.

Read != resolved.

---

# 142. JEJAK GUE — `ME.EXPOSURE_SUMMARY`

Auth user.

Output:
- Paparan Digital;
- attention items;
- secured items;
- action recommendations.

---

# 143. JEJAK GUE — `ME.MARK_SECURED`

Auth user.

Input:
```text
actionRef
status
```

Does not delete source evidence.

---

# 144. JEJAK GUE — `ME.HISTORY`

Safe personal scan/activity history.

No full raw source preload.

---

# 145. JEJAK GUE — `ME.CREDIT_SUMMARY`

May reuse `CREDIT.WALLET`.

---

# 146. INTERNAL JOB — `JOB.SCAN_EXECUTE`

Not browser callable.

Auth:
> internal trusted worker/job token/platform.

Input:
```text
scanRef
jobRef
attempt
```

Must be idempotent.

---

# 147. INTERNAL JOB — `JOB.PROOF_CLEANUP`

Deletes eligible payment proofs.

Records success/failure.

---

# 148. INTERNAL JOB — `JOB.CASE_CLEANUP`

Processes hard-delete lifecycle.

---

# 149. INTERNAL JOB — `JOB.CREDIT_EXPIRY`

Expires eligible lots.

---

# 150. INTERNAL JOB — `JOB.EXPORT_CLEANUP`

Removes expired export artifacts.

---

# 151. INTERNAL JOB — `JOB.SAFE_SHARE_CLEANUP`

Expires/revokes old artifacts.

---

# 152. INTERNAL JOB — `JOB.AGGREGATE_METRICS`

Produces Business Digest.

---

# 153. INTERNAL JOB — `JOB.NOTIFICATION_DISPATCH`

Secondary effects.

Failure does not rollback money.

---

# 154. INTERNAL JOB — `JOB.SOURCE_HEALTH_RECOVERY`

Cheap recovery probe where appropriate.

---

# 155. RPC — `reserve_scan_credits`

**Caller:** trusted server/worker.

**Inputs conceptual:**
```text
p_user_id
p_scan_id
p_quote_id
p_idempotency_key
```

**Locks:** wallet/lots as needed.

**Returns:**
- hold id;
- reserved amount;
- allocations.

**Invariant:**
available never negative.

---

# 156. RPC — `settle_scan_credits`

Input scan/hold/idempotency.

One settlement only.

---

# 157. RPC — `release_scan_credits`

One release only.

---

# 158. RPC — `approve_topup`

Input:
- order;
- actor;
- confirmed amount;
- override;
- idempotency.

Atomic:
- order state;
- credit lot;
- ledger;
- wallet;
- audit;
- partner qualification marker.

---

# 159. RPC — `admin_adjust_credits`

Input:
- target;
- signed amount;
- reason;
- actor;
- idempotency.

Append-only correction.

---

# 160. RPC — `redeem_voucher`

Atomic:
- voucher;
- distribution;
- user lot;
- ledger.

---

# 161. RPC — `extend_eligible_credit_lots`

Called after qualifying top-up.

Grace/eligibility server rules.

---

# 162. RPC — `claim_first_scan_benefit`

One-time atomic claim.

---

# 163. RPC — `assign_role`

If implemented via RPC:
- actor capability;
- target;
- role;
- audit.

Never generic arbitrary role setter callable by user.

---

# 164. API SECURITY TEMPLATE

Setiap endpoint baru harus menjawab:

```text
Authentication:
Authorization:
Input validation:
Rate limit:
Idempotency:
Transaction:
Audit:
PII returned:
Cache:
Errors:
Acceptance:
```

---

# 165. CACHE CONTRACT

## `no-store`
Use for:
- wallet;
- payment status;
- role;
- admin queue;
- block state.

## private short cache/revalidate
Possible:
- Case summary;
- old result.

## public long cache
- static help;
- landing assets;
- manifest assets.

---

# 166. CLIENT VERSION CONTRACT

Sensitive mutations may include:
```text
clientVersion
```

Server:
- if below minimum → `CLIENT_UPDATE_REQUIRED`.

---

# 167. FEATURE FLAG CONTRACT

Every flagged endpoint must check server-side.

UI visibility is not enough.

---

# 168. MAINTENANCE CONTRACT

Affected endpoint returns:
```text
MAINTENANCE_ACTIVE
```

with subsystem-specific human copy.

---

# 169. RATE LIMIT CONTRACT

Rate limit response:
```text
RATE_LIMITED
retryAfter?
```

Don't reveal abuse scoring internals.

---

# 170. SOURCE COST CONTRACT

Paid source usage is tied to:
- scan product;
- explicit quote.

Source adapter does not independently debit user.

---

# 171. AI COST CONTRACT

If AI call is outside included allowance:
> return quote/confirmation requirement before work.

---

# 172. UPLOAD CONTRACT

All upload endpoints:
- auth;
- parent authorization;
- max bytes;
- MIME bytes;
- pixel limit;
- normalization;
- private storage;
- cleanup.

---

# 173. SIGNED URL CONTRACT

All signed URL endpoints:
- authorize parent;
- short expiry;
- log sensitive staff access if needed.

---

# 174. STAFF MASKING CONTRACT

Support endpoint returns masked DTO by default.

Never:
> full object then CSS mask.

---

# 175. FINANCE CONTRACT

Finance APIs:
- payment only;
- no Case data;
- no unrelated entity/evidence.

---

# 176. OWNER CONTRACT

Owner has broad capability but every sensitive mutation still:
- server check;
- audit;
- idempotency/versioning.

---

# 177. PUBLIC ENDPOINT LIST

Expected public-safe:
- landing;
- OAuth start/callback;
- `SYSTEM.VERSION`;
- minimal `SYSTEM.HEALTH_PUBLIC`;
- `SHARE.PUBLIC_GET`;
- static manifest/assets.

Demo:
> local dummy, no provider API.

---

# 178. ENDPOINTS YANG TIDAK BOLEH PUBLIC

- Case;
- evidence;
- wallet;
- topup details;
- proof;
- role;
- source admin;
- NADI;
- user search;
- partner financial;
- exports.

---

# 179. ANTI-PATTERN — GENERIC UPDATE

Forbidden:

```text
POST /api/update-table
{ table, id, values }
```

Use specific use cases.

---

# 180. ANTI-PATTERN — GENERIC ADMIN SQL

Forbidden.

---

# 181. ANTI-PATTERN — CREDIT FROM CLIENT

Forbidden:

```text
POST /wallet
{credits: 999}
```

---

# 182. ANTI-PATTERN — PAYMENT AUTO SETTLE FROM SENTINEL

Forbidden.

---

# 183. ANTI-PATTERN — SOURCE DIRECT CLIENT

Gemini/Groq/source paid APIs never direct browser.

---

# 184. ANTI-PATTERN — SECRET IN RESPONSE

Never.

---

# 185. ANTI-PATTERN — RAW DB ERROR

Never.

---

# 186. ANTI-PATTERN — FULL PII ANALYTICS

Never.

---

# 187. ANTI-PATTERN — NO IDEMPOTENCY

Financial/high-value mutation without idempotency:
> not production-ready.

---

# 188. ANTI-PATTERN — FEATURE FLAG UI-ONLY

Not security.

---

# 189. ANTI-PATTERN — PAYMENT APPROVAL EVENTUAL

Not allowed.

---

# 190. ANTI-PATTERN — CROSS-USER CACHE

P0 risk.

---

# 191. API VERSIONING

Prefer backward-compatible use cases.

Breaking client/server contract:
- expand;
- support old;
- minimum version;
- remove later.

---

# 192. API DEPRECATION

If route/action renamed:
- keep compatibility window for installed PWA when needed.

---

# 193. API OBSERVABILITY

Each sensitive call logs safely:
- operation;
- actor ref;
- target safe ref;
- result;
- latency;
- request ID.

No raw secret.

---

# 194. API AUDIT VS LOG

Audit:
- security/business history.

Log:
- technical diagnostics.

Do not confuse.

---

# 195. ACCEPTANCE MAPPING

Before marking endpoint family done:

## Auth
- Auth suite.

## Case/Entity
- RLS + Case suite.

## Credit
- Credit Ledger + Expiry.

## Scan/Source
- Scan + Source.

## AI
- AI/Grounding.

## Payment
- Top-up + Payment Settlement.

## Partner
- respective partner suites.

## Admin/System
- Admin + Feature Flag/Maintenance.

## Privacy
- Deletion/Export.

## PWA
- PWA + browser/device.

---

# 196. FIRST IMPLEMENTATION ORDER

Recommended API build order:

1. `AUTH.ME`
2. `CASE.CREATE/LIST/GET`
3. core RLS reads
4. `CREDIT.WALLET`
5. quote/reserve RPC
6. `SCAN.START/GET`
7. source adapters
8. result/evidence
9. payment packages/order
10. payment proof
11. admin payment queue
12. `approve_topup`
13. admin config
14. partner
15. PWA version/sync
16. observability.

---

# 197. DTO EXAMPLE — CASE SUMMARY

```text
caseRef
titleDisplay
secret
status
updatedAt
entityCount
evidenceCount
assessmentSummary
viewerRole
```

Not:
- encrypted identifier;
- internal abuse flag;
- raw policy fields.

---

# 198. DTO EXAMPLE — WALLET

```text
availableCredits
reservedCredits
expiringSoonCredits
nextExpiryAt
```

Not:
- mutable balance field;
- lot internals unless requested.

---

# 199. DTO EXAMPLE — PAYMENT USER

```text
orderRef
packageName
expectedAmount
bankName
accountNumber
accountHolder
instructions
status
expiresAt
proofStatus
```

No internal Sentinel risk internals unless user-facing copy needed.

---

# 200. DTO EXAMPLE — PAYMENT ADMIN

```text
orderRef
userRef
expectedAmount
confirmedAmount?
package
proofMetadata
sentinelSignals
duplicateSignals
createdAt
status
```

Finance still no Case.

---

# 201. DTO EXAMPLE — RESULT

```text
match
exposure
risk
completeness
summary
why
evidenceHighlights
contradictions
unknowns
nextActions
```

No single “fraud score”.

---

# 202. DTO EXAMPLE — SOURCE ADMIN

```text
sourceRef
name
state
experimental
health
priority
reliability
usage
budget
lastSuccess
```

No raw API key.

---

# 203. DTO EXAMPLE — NADI

```text
answer
confidence/coverage
factsUsed
recommendations
draftActions[]
```

Draft action not executed.

---

# 204. ERROR COPY PRINCIPLE

Technical:
```text
PAYMENT_ALREADY_APPROVED
```

User:
> “Pembayaran ini udah disetujui sebelumnya.”

Support/Admin detail may include JX code.

---

# 205. DOMAIN ERROR MUST BE STABLE

UI should map codes, not parse English provider messages.

---

# 206. API DOCUMENTATION HYGIENE

Do not copy this whole contract into source comments.

Source comments:
> link use case ID / invariant.

---

# 207. STATUS_PROJECT INTEGRATION

When endpoint family implemented, STATUS should say:

```text
Implemented:
- SCAN.START
- SCAN.GET
- CREDIT.QUOTE_SCAN

Tests:
- AT-SCAN-001 PASS
- AT-CREDIT-003 PASS
```

---

# 208. DECISIONS INTEGRATION

Create DEC if:
- use Server Action vs Route Handler materially matters;
- queue transport chosen;
- signed URL flow differs;
- API versioning strategy chosen.

---

# 209. ROUTE NAMING FREEDOM

Actual URLs may be:

```text
/api/scans
/api/topups
...
```

or Server Actions.

Do not obsess over URL if use-case contract is preserved.

---

# 210. RPC NAMING STABILITY

Transaction RPC names should be explicit and stable.

Avoid:
- `do_action`
- `process_data`.

---

# 211. RATE LIMIT KEYS

Possible:
- user;
- operation;
- workspace;
- target diversity;
- IP coarse.

Do not rely on IP alone.

---

# 212. REQUEST BODY LIMIT

Set per domain.

Uploads:
> separate larger bound.

Text forms:
> small.

---

# 213. QUERY PAGINATION

Use cursor where large:
- Case;
- evidence;
- payments;
- logs;
- analytics detail.

Avoid huge `limit=10000`.

---

# 214. SORT

Server whitelists sortable fields.

No raw SQL sort string.

---

# 215. SEARCH

User search/admin search:
- bounded;
- indexed;
- permission-scoped.

---

# 216. FILTERS

Whitelist.

---

# 217. FILE DOWNLOAD

No direct bucket path from client.

Use signed access endpoint.

---

# 218. PUBLIC SAFE SHARE CACHE

Can cache short/public based expiry if safe.

But revoke should take effect quickly.

---

# 219. WEBHOOK FUTURE

V2 payment gateway:
- verify signature;
- idempotency;
- map to same settlement invariant.

Do not create separate credit logic.

---

# 220. MONITORING V1.5 API

Future use cases:
- MONITOR.CREATE
- MONITOR.PAUSE
- MONITOR.RESUME
- MONITOR.STATUS
- MONITOR.EVENTS

All credit changes explicit.

---

# 221. COLLAB V1.5 API

Future:
- CASE.INVITE
- CASE.INVITE_ACCEPT
- CASE.MEMBER_ROLE_UPDATE

RLS remains parent truth.

---

# 222. REPORT V1.5 API

Future:
- REPORT.GENERATE
- REPORT.STATUS
- REPORT.DOWNLOAD

Private artifact.

---

# 223. FINAL API NON-NEGOTIABLES

1. Endpoint bukan security boundary; auth + DB permission yang menentukan.
2. Browser tidak kirim role authoritative.
3. Client tidak kirim final price authoritative.
4. Client tidak kirim final credit cost authoritative.
5. Payment approval human.
6. Payment settlement atomik.
7. Credit reserve atomik.
8. High-value mutation idempotent.
9. File private.
10. Signed URL parent-authorized.
11. Support masked server-side.
12. Finance payment-only.
13. Feature flags server-enforced.
14. Maintenance server-enforced.
15. Old client dapat ditolak dengan update-required.
16. Source call server-side.
17. AI call server-side.
18. AI output tidak mutate evidence otomatis.
19. No generic SQL/table update endpoint.
20. No raw secret in response/log.
21. DTO purpose-specific.
22. Errors domain-stable.
23. Analytics no raw PII.
24. Realtime payload minimal.
25. Public endpoints sangat sedikit.
26. PWA sync refetches business truth.
27. Admin config versioned.
28. User delete/export scoped.
29. Partner tenant isolation.
30. API family only DONE after acceptance proof.

---

# 224. FINAL STATEMENT

> **Use case dulu, transport belakangan.  
> Authorization selalu eksplisit.  
> Mutation bernilai selalu idempotent.  
> Money selalu atomik.  
> Data sensitif selalu scoped.  
> AI selalu dibatasi.  
> API Jejak harus mudah diuji, mudah diaudit, dan sulit disalahgunakan.**

**END OF API CONTRACT**


---

# APPENDIX A — ENDPOINT REVIEW CARD

Gunakan ini setiap kali Agent menambah API baru:

```text
Use Case ID:
Purpose:
Caller:
Authentication:
Authorization:
Input:
Output DTO:
Sensitive Data:
Rate Limit:
Idempotency:
Transaction Boundary:
External Calls:
Audit:
Realtime/Event:
Cache:
Domain Errors:
Acceptance Tests:
```

Kalau Agent tidak bisa mengisi bagian di atas:
> endpoint belum cukup matang.

---

# APPENDIX B — CRITICAL MUTATION MATRIX

| Operation | Auth | Permission | Idempotent | DB Atomic | Audit |
|---|---|---|---|---|---|
| Start paid scan | User | Own entitlement | Yes | Reserve yes | Scan event |
| Settle scan | Worker | Internal | Yes | Yes | Ledger |
| Refund scan | Worker | Internal | Yes | Yes | Ledger |
| Approve top-up | Finance/Owner | Payment approve | Yes | Yes | Yes |
| Admin credit grant | Owner/Admin cap | Credit adjust | Yes | Yes | Yes |
| Redeem voucher | User | Voucher eligible | Yes | Yes | Ledger |
| Role assign | Owner/Admin cap | Role manage | Yes | Yes | Yes |
| Bank config update | Owner/Business cap | Config manage | Versioned | Yes | Yes |
| Account block | Staff cap | User status | Yes | Yes | Yes |
| Safe share create | Case editor | Case access | Yes | Yes | Activity |

---

# APPENDIX C — READ CACHE MATRIX

| Read | Cache Policy |
|---|---|
| Wallet | no-store / refetch |
| Payment status | no-store / refetch |
| Role/account | no-store for sensitive decision |
| Case list | private revalidate |
| Old result | private revalidate |
| Evidence detail | private scoped |
| Static help | aggressive |
| Public landing | aggressive |
| Source admin health | short/internal |
| NADI digest | short/internal |
| Safe Share public | short + revoke-aware |

---

# APPENDIX D — PUBLIC SURFACE CHECK

Sebelum route dianggap public, tanyakan:

1. Apakah endpoint benar-benar perlu anonymous?
2. Bisa dipakai burn provider?
3. Bisa enumerate token?
4. Bisa leak PII?
5. Bisa menjadi open redirect?
6. Bisa di-cache publik dengan aman?
7. Punya rate limit?
8. Punya minimal response?
9. Apakah demo bisa dibuat lokal instead?
10. Apakah acceptance test anonymous abuse sudah ada?

