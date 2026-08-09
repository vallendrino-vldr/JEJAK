# DECISIONS — JEJAK

> **Fungsi:** Memori keputusan lintas-agent  
> **Wajib dirawat oleh:** Semua Agent Coding  
> **Bukan:** Changelog, status harian, atau tempat menyalin seluruh blueprint  
> **Aturan utama:** Keputusan lama tidak dihapus. Jika diganti, tandai `SUPERSEDED` dan buat keputusan baru.

---

# 0. CARA PAKAI

Agent baru wajib membaca file ini setelah `.notes/STATUS_PROJECT.md`.

Tujuan file:
- mencegah Agent mempertanyakan ulang keputusan yang sudah dikunci;
- menjelaskan rationale implementasi;
- menghindari rewrite lintas Claude/Codex/Antigravity;
- menyimpan keputusan teknis yang baru muncul saat implementasi.

Yang masuk:
- architecture/runtime/library decision penting;
- security decision;
- schema consolidation;
- workaround browser;
- provider routing;
- queue/background approach;
- caching model;
- deviation dari blueprint.

Yang tidak masuk:
- rename variable;
- margin 2px;
- typo;
- refactor kecil;
- log error harian.

---

# 1. STATUS KEPUTUSAN

Gunakan salah satu:

- `AKTIF`
- `SUPERSEDED`
- `DIBATALKAN`
- `EKSPERIMEN`
- `MENUNGGU VERIFIKASI`

Kalau keputusan berubah:
1. jangan hapus entry lama;
2. ubah status lama ke `SUPERSEDED`;
3. buat DEC baru;
4. referensikan `Menggantikan`.

---

# 2. PRIORITAS

Kalau DECISIONS bertentangan dengan blueprint:
- security invariant SCHEMA lebih tinggi;
- product rule PRD lebih tinggi;
- UX WIRE_MAP lebih tinggi;
- visual DESIGN_SYSTEM lebih tinggi;
- roadmap dependency tetap wajib.

DECISIONS terutama menjelaskan:
> **bagaimana implementasi aktual memenuhi blueprint.**

---

# 3. KEPUTUSAN AKTIF SAAT BLUEPRINT HANDOFF

## DEC-0001 — Project folder adalah sumber kebenaran lintas-agent

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Agent dapat berganti karena limit dan memory model tidak konsisten.

### Keputusan
Folder project, Git, STATUS_PROJECT, DECISIONS, blueprint, dan tests adalah source of truth. Jangan mengandalkan memory agent.

### Alasan
Agar Claude/Codex/Antigravity bisa saling lanjut tanpa reset konteks.

### Dampak
Agent baru wajib baca STATUS + DECISIONS dulu sebelum membuka blueprint besar.

### Blueprint terkait
`.notes/AGENTS.md`, `PROMPT_PEMBUKA.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0002 — STATUS_PROJECT harus ringkas dan current-state only

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Kalau STATUS jadi changelog panjang, tujuan hemat token gagal.

### Keputusan
STATUS menyimpan keadaan sekarang, bukan sejarah lengkap.

### Alasan
Git sudah menyimpan sejarah perubahan.

### Dampak
Agent harus merapikan STATUS dan menghapus blocker yang sudah resolved.

### Blueprint terkait
`.notes/STATUS_PROJECT.md`, `.notes/AGENTS.md`

### Menggantikan
Tidak ada

---

## DEC-0003 — DECISIONS adalah append-oriented decision memory

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Keputusan implementasi penting perlu bisa dilacak tanpa menulis ulang sejarah.

### Keputusan
Keputusan yang berubah ditandai superseded, bukan dihapus.

### Alasan
Agent berikutnya bisa memahami rationale dan perubahan arsitektur.

### Dampak
Jangan edit masa lalu supaya kelihatan seolah keputusan lama tidak pernah ada.

### Blueprint terkait
`.notes/DECISIONS.md`, `.notes/AGENTS.md`

### Menggantikan
Tidak ada

---

## DEC-0004 — Agent wajib cek global skills sebelum install apa pun

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Product Owner sudah memasang banyak skills/tooling secara global.

### Keputusan
Setiap fresh session inspect environment dan gunakan skill/tool yang relevan; jangan install ulang tanpa cek.

### Alasan
Menghemat waktu, token, dependency, dan mencegah konflik tooling.

### Dampak
Tool choice penting dicatat di file ini jika memengaruhi arsitektur/workflow.

### Blueprint terkait
`.notes/AGENTS.md`, `PROMPT_PEMBUKA.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0005 — Komunikasi Agent ke Product Owner pakai Indonesia gaul lo/gue

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Product Owner tidak mau jawaban teknis kaku dan rumit.

### Keputusan
Semua update normal ke Product Owner menggunakan bahasa Indonesia natural, gaul, lo/gue, seru tapi jelas.

### Alasan
Memudahkan komunikasi lintas-agent dan mengurangi beban teknis Product Owner.

### Dampak
Agent tetap profesional dan ringkas, tanpa jargon berlebihan.

### Blueprint terkait
`.notes/AGENTS.md`, `PROMPT_PEMBUKA.md`

### Menggantikan
Tidak ada

---

## DEC-0006 — Agent bertanya hanya jika blocker nyata

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Pertanyaan rutin membuat project lambat dan membebani Product Owner.

### Keputusan
Agent kerja mandiri dan hanya bertanya untuk credential/human-only action/destructive irreversible action/kontradiksi bisnis nyata.

### Alasan
Project bergerak terus tanpa babysitting.

### Dampak
Tidak boleh ada pertanyaan 'mau gue lanjut?' ketika Next Safe Action jelas.

### Blueprint terkait
`.notes/AGENTS.md`, `PROMPT_PEMBUKA.md`

### Menggantikan
Tidak ada

---

## DEC-0007 — Eksekusi mengikuti roadmap ber-gate

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Banyak fitur menarik dapat mengalihkan Agent dari fondasi critical.

### Keputusan
Roadmap Phase 0–18 wajib diikuti; gate security/ledger/payment/PWA tidak boleh dilompati.

### Alasan
Mencegah proyek terlihat ramai tapi fondasi production rusak.

### Dampak
Agent boleh reorder task kecil dalam phase, tidak boleh skip gate.

### Blueprint terkait
`docs/ROADMAP.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0008 — Stack utama Next.js 16 + Supabase + Vercel

**Status:** AKTIF  
**Phase:** 0–18  
**Tanggal:** 2026-08-09

### Masalah
Project perlu satu stack yang konsisten untuk web app/PWA/server/data.

### Keputusan
Gunakan Next.js 16, Supabase, dan Vercel sebagai fondasi.

### Alasan
Keputusan sudah dikunci agar agent tidak rewrite stack berdasarkan selera.

### Dampak
Refactor internal boleh; pindah stack butuh alasan nyata dan keputusan Product Owner.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0009 — Backend/database diarahkan ke Singapore

**Status:** AKTIF  
**Phase:** 0–18  
**Tanggal:** 2026-08-09

### Masalah
Target user utama Indonesia dan Supabase project berada di Singapore.

### Keputusan
Compute yang sering berbicara dengan database diarahkan ke Singapore bila practical.

### Alasan
Mengurangi latency dan menjaga arsitektur konsisten.

### Dampak
Agent mencatat jika runtime tertentu tidak bisa region-pin.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0010 — Google OAuth saja untuk V1

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-09

### Masalah
Product Owner memilih friction rendah dan tidak ingin auth provider lain.

### Keputusan
Login user memakai Google OAuth one-click.

### Alasan
Mengurangi complexity onboarding.

### Dampak
Tidak menambah email/password auth kecuali keputusan baru.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0011 — Owner memakai akun Google yang sama dengan user normal

**Status:** AKTIF  
**Phase:** 2/10  
**Tanggal:** 2026-08-09

### Masalah
Owner perlu bisa merasakan Jejak sebagai user sungguhan.

### Keputusan
Owner login menggunakan akun normal, default masuk User Mode, lalu dapat masuk Ruang Kendali.

### Alasan
Memungkinkan full-flow testing dan dual persona.

### Dampak
Tidak membuat akun admin terpisah.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0012 — Email Owner hanya bootstrap, authorization tetap database-driven

**Status:** AKTIF  
**Phase:** 2/3  
**Tanggal:** 2026-08-09

### Masalah
Frontend email condition mudah dibypass dan tidak fleksibel.

### Keputusan
Email owner dipakai hanya untuk bootstrap role awal; permission selanjutnya berasal dari DB.

### Alasan
Memisahkan identity bootstrap dan authorization.

### Dampak
Dilarang `if email === owner` sebagai security boundary.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0013 — UI user selalu Bahasa Indonesia everyday

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Product Owner menginginkan pengalaman lokal, natural, dan tidak kaku.

### Keputusan
Semua label/error/loading/admin/help/PWA memakai Bahasa Indonesia sehari-hari.

### Alasan
Brand terasa konsisten dan mudah dipahami.

### Dampak
Nama teknis provider boleh tetap resmi di detail teknis.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0014 — Empat navigation utama user

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Navigation harus tetap simpel walau fitur banyak.

### Keputusan
Primary nav: Beranda / Periksa / Kasus / Jejak Gue.

### Alasan
Dompet, AI, Kabar, Settings hidup sebagai panel/context, bukan tab utama.

### Dampak
Agent tidak menambah primary nav tanpa keputusan baru.

### Blueprint terkait
`docs/WIRE_MAP.md`, `docs/DESIGN_SYSTEM.md`

### Menggantikan
Tidak ada

---

## DEC-0015 — No global page scroll

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Jejak ditujukan terasa seperti aplikasi native/PWA.

### Keputusan
App Shell memenuhi viewport; konten panjang scroll di internal region.

### Alasan
Membuat navigation/global state tetap stabil.

### Dampak
Bukan berarti semua panel tidak boleh scroll.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0016 — Adaptive interaction mobile/desktop/hybrid

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Layout yang sekadar di-resize menghasilkan UX buruk.

### Keputusan
Mobile touch-first; desktop pointer-first; hybrid mendukung keduanya.

### Alasan
Fitur penting tidak boleh hanya hover/long-press.

### Dampak
Component implementation harus mempertimbangkan input capability, bukan hanya breakpoint.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0017 — Reduced motion tetap hidup, tidak static mode

**Status:** AKTIF  
**Phase:** 4/13/16  
**Tanggal:** 2026-08-09

### Masalah
Brave/reduced-motion sebelumnya dapat membuat pengalaman terasa mati.

### Keputusan
Kurangi motion besar namun pertahankan micro-feedback, lighting, press, elevation, haptic bila ada.

### Alasan
Accessibility dan rasa premium tetap berjalan.

### Dampak
Business/UI state tidak boleh bergantung pada animation completion.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0018 — Luxury Digital Security / Obsidian Intelligence

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Brand perlu terasa premium dan distinctive.

### Keputusan
Gunakan black titanium, charcoal, smoked glass, tactile depth, subtle 3D, precise lighting.

### Alasan
Membedakan Jejak dari SaaS generik dan hacker cliché.

### Dampak
Tidak Matrix green/skull/hoodie hacker.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`

### Menggantikan
Tidak ada

---

## DEC-0019 — Mata Jejak + Search Console jadi signature objects

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Jejak butuh identitas visual yang mudah dikenali.

### Keputusan
Search Console/Search Orb menjadi hero interaction; Mata Jejak menjadi guardian/help motif.

### Alasan
Memberi continuity visual dan entry bantuan/AI.

### Dampak
Maskot tetap elegan, bukan kartun.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0020 — PWA adalah core product, bukan add-on

**Status:** AKTIF  
**Phase:** 13  
**Tanggal:** 2026-08-09

### Masalah
Product Owner ingin pengalaman installed app di semua perangkat.

### Keputusan
PWA install/update/back/refresh/versioning masuk V1 quality gate.

### Alasan
Menghindari stale installed app seperti pengalaman project sebelumnya.

### Dampak
Tidak boleh ditunda sebagai polish setelah launch.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0021 — Version Sentinel wajib

**Status:** AKTIF  
**Phase:** 13  
**Tanggal:** 2026-08-09

### Masalah
Installed PWA dapat terus memakai bundle lama setelah deploy.

### Keputusan
Aplikasi melakukan version check, memberi update prompt, dan dapat enforce minimum version untuk perubahan kritis.

### Alasan
Mencegah incompatibility dan keharusan clear cache manual.

### Dampak
Intent aman dipulihkan setelah update.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0022 — Segarkan adalah targeted sync, bukan hard reload

**Status:** AKTIF  
**Phase:** 4/13  
**Tanggal:** 2026-08-09

### Masalah
Hard reload membuang graph/panel/navigation state dan terasa seperti website.

### Keputusan
Segarkan menyinkronkan version, saldo, role, Kabar, scan, payment, workspace aktif.

### Alasan
Memberi recovery PWA tanpa merusak state.

### Dampak
Server tetap source of truth.

### Blueprint terkait
`docs/WIRE_MAP.md`, `docs/DESIGN_SYSTEM.md`

### Menggantikan
Tidak ada

---

## DEC-0023 — Safari real-device status harus jujur

**Status:** AKTIF  
**Phase:** 16  
**Tanggal:** 2026-08-09

### Masalah
Chromium iPhone emulation tidak sama dengan Safari/WebKit nyata.

### Keputusan
Tidak boleh menandai Safari PASS tanpa perangkat nyata.

### Alasan
Mencegah false confidence.

### Dampak
Gunakan NOT_AVAILABLE bila device belum ada.

### Blueprint terkait
`docs/ACCEPTANCE_TESTS.md`, `.notes/AGENTS.md`

### Menggantikan
Tidak ada

---

## DEC-0024 — Jejak adalah evidence intelligence, bukan stalking/doxxing

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
OSINT public data bukan berarti semua penggunaan otomatis aman/legal.

### Keputusan
Product framing fokus self-protection, fraud check, assisted check, authorized/public research.

### Alasan
Menjaga positioning, safety, dan trust.

### Dampak
Tidak membangun workflow untuk mass-harvesting target.

### Blueprint terkait
`docs/PRD.md`

### Menggantikan
Tidak ada

---

## DEC-0025 — Power membuka depth, bukan menghapus guardrail

**Status:** AKTIF  
**Phase:** 7+  
**Tanggal:** 2026-08-09

### Masalah
High-credit user dapat disalahartikan sebagai unlimited target access.

### Keputusan
Power/Sultan mendapat analytical depth, bukan exemption dari rate/abuse/access safeguards.

### Alasan
Monetization tidak mengalahkan safety.

### Dampak
Mass enumeration tetap bisa dibatasi walau saldo besar.

### Blueprint terkait
`docs/PRD.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0026 — No-result tidak berarti aman

**Status:** AKTIF  
**Phase:** 7/8  
**Tanggal:** 2026-08-09

### Masalah
Absence of evidence sering disalahartikan sebagai evidence of safety.

### Keputusan
UI/result engine harus mengatakan belum ditemukan/belum cukup evidence.

### Alasan
Mengurangi false reassurance.

### Dampak
Risk engine tidak menurunkan risiko hanya karena no-result kecuali semantics source valid.

### Blueprint terkait
`docs/PRD.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0027 — Nama selalu ambiguity-first

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Nama umum mudah menyebabkan false identity match.

### Keputusan
Nama saja tidak cukup untuk menyimpulkan identitas; minta clue tambahan.

### Alasan
Mengurangi salah sasaran.

### Dampak
Power user pun tidak mendapat bypass kebenaran evidence.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0028 — Nomor HP validation bukan ownership proof

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Library phone dapat memberi region/type tapi bukan pemilik.

### Keputusan
Hasil nomor hanya validitas/region/type + correlation evidence lain.

### Alasan
Mencegah klaim pemilik palsu.

### Dampak
Temporal ownership tetap dipertimbangkan.

### Blueprint terkait
`docs/PRD.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0029 — Username sama bukan identitas sama

**Status:** AKTIF  
**Phase:** 5/7/8  
**Tanggal:** 2026-08-09

### Masalah
Handle dapat dipakai orang berbeda di platform berbeda.

### Keputusan
Handle sama hanya signal/korelasi, tidak auto-merge.

### Alasan
Menjaga graph evidence-based.

### Dampak
AI hanya boleh mengusulkan hubungan.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0030 — Domain age bukan business age

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Tanggal RDAP sering disalahgunakan sebagai umur usaha.

### Keputusan
UI menyebut tanggal domain sesuai sumber, tidak menyimpulkan usia bisnis/pemilik.

### Alasan
Mengurangi false inference.

### Dampak
History domain ownership tetap uncertain.

### Blueprint terkait
`docs/PRD.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0031 — Evidence punya empat lapisan + user evidence

**Status:** AKTIF  
**Phase:** 5+  
**Tanggal:** 2026-08-09

### Masalah
Semua temuan tidak punya kekuatan epistemik yang sama.

### Keputusan
Pisahkan Fakta Terverifikasi / Sinyal / Korelasi / Inferensi AI / Bukti dari pengguna.

### Alasan
UI dan engine bisa menjelaskan reliability dengan jujur.

### Dampak
AI inference tidak pernah dipromosikan otomatis menjadi fact.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0032 — Evidence Passport wajib

**Status:** AKTIF  
**Phase:** 5+  
**Tanggal:** 2026-08-09

### Masalah
Temuan tanpa provenance sulit diverifikasi dan rawan AI hallucination.

### Keputusan
Setiap evidence menyimpan source, type, time, reliability, target, re-verifiability.

### Alasan
Membentuk foundation audit, graph, timeline, grounding.

### Dampak
Raw source retention tetap diminimalkan.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0033 — Counter-evidence wajib ditampilkan

**Status:** AKTIF  
**Phase:** 8  
**Tanggal:** 2026-08-09

### Masalah
Risk product mudah terjebak confirmation bias.

### Keputusan
Result menampilkan evidence yang mendukung dan yang mengurangi kecurigaan.

### Alasan
Jejak mengejar kejelasan, bukan ketakutan.

### Dampak
AI Skeptic mendukung prinsip ini.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0034 — AI adalah reasoning layer, bukan source of truth

**Status:** AKTIF  
**Phase:** 8+  
**Tanggal:** 2026-08-09

### Masalah
LLM dapat hallucinate dan tidak punya otoritas sumber.

### Keputusan
AI menerima Context Pack evidence, menjelaskan, mengorelasikan, menantang, tapi fakta tetap berasal dari evidence.

### Alasan
Menjaga trust dan reproducibility.

### Dampak
Core harus tetap bekerja ketika semua AI mati.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0035 — AI grounding check wajib

**Status:** AKTIF  
**Phase:** 8  
**Tanggal:** 2026-08-09

### Masalah
Narrative AI dapat menambahkan claim yang tidak didukung.

### Keputusan
Claim factual harus ditautkan ke evidence bila practical; contradiction menghasilkan regenerate/fallback.

### Alasan
Mengurangi hallucination user-facing.

### Dampak
AI output dapat diberi grounding state/version.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0036 — External content adalah data, bukan instruction

**Status:** AKTIF  
**Phase:** 7/8  
**Tanggal:** 2026-08-09

### Masalah
Public page, screenshot, atau user note dapat berisi prompt injection.

### Keputusan
Semua untrusted content diperlakukan sebagai quoted data pada AI pipeline.

### Alasan
Mencegah prompt injection mengambil alih agent/LLM.

### Dampak
Tidak ada instruction execution dari evidence content.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0037 — NADI non-autonomous

**Status:** AKTIF  
**Phase:** 14  
**Tanggal:** 2026-08-09

### Masalah
Admin AI punya akses konteks bisnis sehingga mutation otomatis berisiko tinggi.

### Keputusan
NADI hanya READ + RECOMMEND + DRAFT; human mengonfirmasi action melalui regular permissioned flow.

### Alasan
Mengurangi risiko financial/admin hallucination.

### Dampak
NADI tidak punya master key.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0038 — Source Registry modular dan runtime-configurable

**Status:** AKTIF  
**Phase:** 7/10  
**Tanggal:** 2026-08-09

### Masalah
Source provider dapat berubah, down, mahal, atau tidak lagi cocok.

### Keputusan
Semua source lewat registry/adapter dengan status, priority, reliability, budget, health.

### Alasan
Menghindari hardcoded provider logic.

### Dampak
Owner dapat pause/experimental tanpa redeploy.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0039 — Source Experimental tidak masuk main score

**Status:** AKTIF  
**Phase:** 7/10  
**Tanggal:** 2026-08-09

### Masalah
Source baru belum tentu reliable/licensed/consistent.

### Keputusan
Experimental hanya Owner/test dan excluded dari main assessment sampai dipromosikan.

### Alasan
Membuat canary source aman.

### Dampak
Promotion membutuhkan QA/policy review.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0040 — Core source V1 mengutamakan RDAP/DNS/local/HIBP Passwords

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Tidak ada proper free no-CC broad-search provider yang cocok sebagai foundation.

### Keputusan
V1 memakai source yang lebih reliable/modular: RDAP, DNS, libphonenumber, HIBP Pwned Passwords, plus optional GitHub/GitLab/Public Page.

### Alasan
Produk menang lewat evidence depth, bukan fake coverage.

### Dampak
Broad search tetap future adapter.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0041 — Google Places tidak digunakan

**Status:** AKTIF  
**Phase:** 7+  
**Tanggal:** 2026-08-09

### Masalah
Google Places tidak relevan dengan source doctrine yang disepakati.

### Keputusan
Jangan integrasikan Google Places.

### Alasan
Menghindari biaya/dependency yang tidak diperlukan.

### Dampak
Agent tidak perlu menanyakan ulang.

### Blueprint terkait
`docs/PRD.md`

### Menggantikan
Tidak ada

---

## DEC-0042 — Public Page Collector hanya known public URL

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Broad scraping/login bypass memperbesar legal/security risk.

### Keputusan
Collector hanya fetch public HTTP/HTTPS known URL, tanpa login/CAPTCHA/anti-bot bypass.

### Alasan
Membatasi scope dan menjaga compliance.

### Dampak
SSRF protection wajib.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0043 — Multiple API keys tidak boleh dipakai untuk quota evasion

**Status:** AKTIF  
**Phase:** 7/8  
**Tanggal:** 2026-08-09

### Masalah
Bootstrap memiliki beberapa Gemini/Groq key dari account berbeda.

### Keputusan
Credential banyak boleh dipakai hanya untuk compliant routing/failover sesuai current provider terms.

### Alasan
Mencegah arsitektur bergantung pada bypass limit/ToS.

### Dampak
Agent wajib verify current terms.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0044 — Credit ledger + lots, bukan integer profile

**Status:** AKTIF  
**Phase:** 6  
**Tanggal:** 2026-08-09

### Masalah
Credit punya expiry, promo, reserve, refund, correction, concurrency.

### Keputusan
Gunakan wallet cache + credit lots + append-oriented transactions + holds.

### Alasan
Model sederhana `credits=N` tidak mampu menjaga accounting.

### Dampak
Semua mutation server-side.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0045 — Credit mutation atomik dan idempotent

**Status:** AKTIF  
**Phase:** 6+  
**Tanggal:** 2026-08-09

### Masalah
Multi-tab/retry dapat double debit/credit.

### Keputusan
Reserve/settle/refund/grant/voucher/payment memakai transaction + idempotency + unique constraints.

### Alasan
Menjaga integrity.

### Dampak
Frontend disable button hanya UX enhancement.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0046 — FEFO untuk penggunaan credit lots

**Status:** AKTIF  
**Phase:** 6  
**Tanggal:** 2026-08-09

### Masalah
Credit lots punya expiry berbeda.

### Keputusan
Gunakan lot yang expire lebih cepat lebih dulu.

### Alasan
Meminimalkan user kehilangan credit karena urutan konsumsi buruk.

### Dampak
Reserved credit dilindungi selama scan aktif.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0047 — Kredit hanya dipakai untuk kerja baru

**Status:** AKTIF  
**Phase:** 6+  
**Tanggal:** 2026-08-09

### Masalah
User tidak boleh ditagih ulang hanya untuk membuka hasil lama.

### Keputusan
Charge hanya new scan/source refresh/heavy AI/new monitoring scope; old result/graph/evidence gratis.

### Alasan
Model monetisasi terasa fair.

### Dampak
Upgrade dapat reuse work.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0048 — Upgrade bayar selisih jika evidence reusable

**Status:** AKTIF  
**Phase:** 6/8  
**Tanggal:** 2026-08-09

### Masalah
User yang sudah membeli tier rendah tidak seharusnya selalu bayar penuh tier tinggi.

### Keputusan
Server menghitung delta berdasarkan freshness/reuse eligibility.

### Alasan
Mendorong upsell tanpa terasa menghukum.

### Dampak
Quote tetap server-authoritative.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0049 — Paket harga sedikit premium dan configurable

**Status:** AKTIF  
**Phase:** 6/10  
**Tanggal:** 2026-08-09

### Masalah
Brand ingin bernilai dan membiayai pengembangan.

### Keputusan
Seed harga sekitar 19K/49K/89K/149K dan package naming Mulai/Proteksi/Lanjutan/Power, tetapi semua configurable dari admin.

### Alasan
Mencegah hardcode business logic.

### Dampak
Seed bukan janji angka permanen.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0050 — First scan ditanggung Jejak

**Status:** AKTIF  
**Phase:** 6/7  
**Tanggal:** 2026-08-09

### Masalah
Free onboarding perlu memberi proof of value nyata.

### Keputusan
Pemeriksaan pertama user disponsori Jejak melalui benefit/claim idempotent.

### Alasan
Lebih natural daripada membuang random credit tanpa konteks.

### Dampak
Tetap dicatat untuk analytics/accounting.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0051 — V1 payment = manual bank transfer

**Status:** AKTIF  
**Phase:** 9  
**Tanggal:** 2026-08-09

### Masalah
Payment gateway belum tersedia/diinginkan untuk V1.

### Keputusan
User transfer manual ke payment method yang dikonfigurasi admin.

### Alasan
Memungkinkan monetisasi tanpa gateway.

### Dampak
Gateway baru V2 bila justified.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0052 — Payment method harus editable tanpa redeploy

**Status:** AKTIF  
**Phase:** 9/10  
**Tanggal:** 2026-08-09

### Masalah
Nomor rekening/bank dapat berubah.

### Keputusan
Owner dapat mengubah nama bank, nomor, holder, instruction, active/primary/order dari Ruang Kendali.

### Alasan
Business operation tidak bergantung developer.

### Dampak
Config versioning/audit wajib.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0053 — Top-up order menyimpan payment method snapshot

**Status:** AKTIF  
**Phase:** 9  
**Tanggal:** 2026-08-09

### Masalah
Mengubah rekening tidak boleh merusak pending order lama.

### Keputusan
Setiap order menyimpan snapshot payment method/package saat dibuat.

### Alasan
Historical instruction tetap konsisten.

### Dampak
New order mengikuti config baru.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0054 — Payment Sentinel hanya screening

**Status:** AKTIF  
**Phase:** 9  
**Tanggal:** 2026-08-09

### Masalah
Screenshot transfer/AI tidak bisa membuktikan uang benar-benar masuk.

### Keputusan
AI vision hanya menyaring amount/date/bank/reference/duplicate/anomaly.

### Alasan
Final approval tetap human setelah cek mutasi.

### Dampak
AI warning dapat dioverride Owner dengan audit.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0055 — Approval top-up + credit settlement satu transaksi atomik

**Status:** AKTIF  
**Phase:** 9  
**Tanggal:** 2026-08-09

### Masalah
Jika order approved dan credit grant terpisah, partial state dapat terjadi.

### Keputusan
Lock order, verify permission, create lot/ledger, update wallet, approve order, audit dalam atomic business operation.

### Alasan
Mencegah approved-without-credit atau double-credit.

### Dampak
Double approval test P0.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0056 — Payment proof private dan short-retention

**Status:** AKTIF  
**Phase:** 9/12  
**Tanggal:** 2026-08-09

### Masalah
Screenshot bank sensitif dan tidak perlu disimpan selamanya.

### Keputusan
Private Storage, normalization, approved cleanup cepat; rejected bounded dispute retention.

### Alasan
Mengurangi privacy risk.

### Dampak
Fingerprint/min metadata dapat dipertahankan bila justified.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0057 — User tidak disuruh compress screenshot pembayaran

**Status:** AKTIF  
**Phase:** 9  
**Tanggal:** 2026-08-09

### Masalah
Product Owner ingin UX sederhana.

### Keputusan
Upload normal; system optimize/re-encode otomatis, target sekitar 75 KB jika tetap readable.

### Alasan
Mengurangi friction.

### Dampak
Readability lebih penting daripada target byte absolut.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0058 — Case adalah core V1

**Status:** AKTIF  
**Phase:** 5  
**Tanggal:** 2026-08-09

### Masalah
Jejak perlu menyatukan multi-identifier/evidence menjadi investigation workspace.

### Keputusan
Case dibangun V1, bukan deferred feature.

### Alasan
Menjadi basis graph, evidence, timeline, paid analysis.

### Dampak
Collaboration penuh boleh V1.5, foundation V1.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0059 — Case merge reversible

**Status:** AKTIF  
**Phase:** 5/8  
**Tanggal:** 2026-08-09

### Masalah
Identity linking dapat salah dan evidence bisa berubah.

### Keputusan
Merge logical, source entity/evidence tetap disimpan, undo tersedia.

### Alasan
Mencegah destructive mistaken identity.

### Dampak
AI tidak boleh permanent auto-merge.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0060 — Case collaboration foundation V1, full UI V1.5

**Status:** AKTIF  
**Phase:** 5/11  
**Tanggal:** 2026-08-09

### Masalah
Future Mitra/team membutuhkan ownership model sejak awal, tapi scope V1 harus terkendali.

### Keputusan
Schema case_members/workspace siap V1; richer collaboration/team V1.5.

### Alasan
Menghindari redesign database.

### Dampak
Jangan bangun full collaboration sebelum V1 gate.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0061 — Affiliate/Reseller/Mitra punya source-of-value berbeda

**Status:** AKTIF  
**Phase:** 11  
**Tanggal:** 2026-08-09

### Masalah
Partner types memiliki economics berbeda.

### Keputusan
Affiliate commission dari approved qualified transaction; Reseller voucher backed distribution wallet; Mitra workspace/client analysis.

### Alasan
Mencegah creation value dari nol.

### Dampak
Jangan collapse semua partner menjadi satu generic role.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0062 — Partner freeze tidak memblokir user account

**Status:** AKTIF  
**Phase:** 11  
**Tanggal:** 2026-08-09

### Masalah
Partner capability dan normal user identity adalah context berbeda.

### Keputusan
Pause/revoke partner rights tanpa otomatis memblokir user normal.

### Alasan
Mencegah punishment berlebihan dan data loss.

### Dampak
Pending financial history tetap traceable.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0063 — Admin config runtime, bukan hardcode

**Status:** AKTIF  
**Phase:** 10  
**Tanggal:** 2026-08-09

### Masalah
Product Owner bukan programmer dan perlu mengelola bisnis sendiri.

### Keputusan
Pricing, payment methods, sources, campaigns, feature flags, maintenance dikontrol Ruang Kendali.

### Alasan
Mengurangi redeploy untuk operasi harian.

### Dampak
Critical config versioned + audited.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0064 — Permission Simulator bukan impersonation nyata

**Status:** AKTIF  
**Phase:** 10  
**Tanggal:** 2026-08-09

### Masalah
Owner perlu preview UX role tanpa risiko identity mutation.

### Keputusan
Simulator hanya preview UI/capability model; RLS testing tetap memakai test account nyata.

### Alasan
Mencegah false security confidence.

### Dampak
Tidak boleh mengeksekusi mutation sebagai simulated role.

### Blueprint terkait
`docs/WIRE_MAP.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0065 — Support masked server-side by default

**Status:** AKTIF  
**Phase:** 3/10  
**Tanggal:** 2026-08-09

### Masalah
CSS masking tidak mencegah raw data ada di browser.

### Keputusan
Support menerima purpose-specific masked response; reveal raw butuh permission dan audit.

### Alasan
Mengurangi unnecessary PII exposure.

### Dampak
Finance juga purpose-limited.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0066 — RLS deny-by-default sampai subresource dan Storage

**Status:** AKTIF  
**Phase:** 3+  
**Tanggal:** 2026-08-09

### Masalah
Mengamankan cases saja tidak cukup jika evidence/file bisa dibaca langsung.

### Keputusan
Parent Case/workspace authorization berlaku ke entity/evidence/relationship/attachment.

### Alasan
Mencegah IDOR/BOLA pada child data.

### Dampak
Negative test wajib.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0067 — Sensitive identifier menggunakan encryption + keyed HMAC bila perlu matching

**Status:** AKTIF  
**Phase:** 5  
**Tanggal:** 2026-08-09

### Masalah
Plain hash email/phone mudah ditebak karena entropy rendah.

### Keputusan
Raw sensitive normalized value dienkripsi bila practical; matching memakai keyed HMAC/blind index.

### Alasan
Meningkatkan protection at rest.

### Dampak
Detail implementasi crypto dipilih Agent dan dicatat bila meaningful.

### Blueprint terkait
`docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0068 — Deletion adalah lifecycle, bukan DELETE row saja

**Status:** AKTIF  
**Phase:** 12  
**Tanggal:** 2026-08-09

### Masalah
Data sensitif dapat tertinggal di Storage/export/safe-share/orphan.

### Keputusan
Gunakan deletion jobs yang membersihkan DB + object + derived artifact dengan retry.

### Alasan
Membuat privacy promise benar-benar nyata.

### Dampak
Jangan klaim deleted sampai cleanup selesai.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0069 — Normal Case trash sekitar 3 hari

**Status:** AKTIF  
**Phase:** 12  
**Tanggal:** 2026-08-09

### Masalah
User perlu recovery kecil tanpa retention terlalu lama.

### Keputusan
Normal Case masuk trash ~3 hari sebelum hard delete; Secret Case punya immediate permanent option.

### Alasan
Balance antara recovery dan privacy.

### Dampak
Duration seed dapat dikonfigurasi sesuai policy.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0070 — Logs tidak boleh menyimpan secret/full PII unnecessary

**Status:** AKTIF  
**Phase:** 14/15  
**Tanggal:** 2026-08-09

### Masalah
Observability dapat menjadi kebocoran sekunder.

### Keputusan
Technical/error/product logs hanya safe context, raw secret/password/token dilarang.

### Alasan
Mengurangi blast radius.

### Dampak
Audit safe before/after juga masked.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0071 — Feature flags kritis server-enforced

**Status:** AKTIF  
**Phase:** 10/15  
**Tanggal:** 2026-08-09

### Masalah
Menyembunyikan button tidak mencegah direct endpoint call.

### Keputusan
Feature flag sensitif dicek server juga.

### Alasan
Memungkinkan safe canary/rollback.

### Dampak
Acceptance test direct endpoint wajib.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0072 — Maintenance subsystem-specific

**Status:** AKTIF  
**Phase:** 10/15  
**Tanggal:** 2026-08-09

### Masalah
Satu subsystem gagal tidak boleh mematikan seluruh app.

### Keputusan
Scan/AI/top-up/upload/monitor dapat dipause independen.

### Alasan
User masih bisa baca data aman saat subsystem lain down.

### Dampak
Proteksi Darurat terpisah.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0073 — Proteksi Darurat reversible dan Owner-controlled

**Status:** AKTIF  
**Phase:** 10/15  
**Tanggal:** 2026-08-09

### Masalah
Incident membutuhkan mitigation cepat tanpa deploy.

### Keputusan
Owner dapat mengetatkan rate, pause expensive AI/OSINT, membatasi anonymous/expensive path sambil mempertahankan safe reads.

### Alasan
Mengurangi blast radius.

### Dampak
Semua perubahan audited.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0074 — Realtime selective, DB tetap truth

**Status:** AKTIF  
**Phase:** 4+  
**Tanggal:** 2026-08-09

### Masalah
Subscribe seluruh DB boros dan rentan leakage.

### Keputusan
Realtime hanya untuk wallet/payment/scan/Kabar/critical admin/case context, dengan refresh/poll fallback.

### Alasan
Meningkatkan scale dan resilience.

### Dampak
Payload realtime minimum, detail refetch authorized.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0075 — Cache tampilan, jangan cache kebenaran bisnis

**Status:** AKTIF  
**Phase:** 4/13  
**Tanggal:** 2026-08-09

### Masalah
PWA/browser cache dapat membuat saldo/role/payment stale.

### Keputusan
Static UI boleh aggressive cache; wallet/payment/role/block/entitlement tetap server-authoritative.

### Alasan
Mencegah stale business state.

### Dampak
Old safe summaries dapat cache+revalidate.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0076 — Performance regression adalah bug

**Status:** AKTIF  
**Phase:** 4–18  
**Tanggal:** 2026-08-09

### Masalah
Product premium akan gagal jika motion/graph/admin membuat interaction lambat.

### Keputusan
Performance gate menjadi requirement; heavy graph/chart/image/animation lazy/progressive.

### Alasan
Menjaga rasa native/premium.

### Dampak
Tidak boleh menutup regression dengan loading animation.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`, `docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0077 — V1 = production-grade smallest complete Jejak

**Status:** AKTIF  
**Phase:** 0–18  
**Tanggal:** 2026-08-09

### Masalah
MVP sering diterjemahkan sebagai prototipe throwaway.

### Keputusan
V1 tetap wajib punya RLS, ledger, payment integrity, PWA update, lifecycle data, browser QA.

### Alasan
Cut breadth, jangan integrity.

### Dampak
Advanced monitoring/collab dapat ditunda.

### Blueprint terkait
`docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0078 — V1.5 fokus retention/depth

**Status:** AKTIF  
**Phase:** Post-V1  
**Tanggal:** 2026-08-09

### Masalah
Monitoring/collaboration/advanced AI menambah scope besar.

### Keputusan
Pantau Jejak, Jejak Perubahan, richer Mitra, collaboration, advanced AI, richer NADI ditempatkan V1.5.

### Alasan
Menjaga V1 fokus namun schema future-proof.

### Dampak
Tidak dibangun sebelum V1 stable.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0079 — V2 fokus revenue-funded intelligence upgrades

**Status:** AKTIF  
**Phase:** V2  
**Tanggal:** 2026-08-09

### Masalah
Premium source/payment gateway menambah biaya dan dependency.

### Keputusan
Broad web search proper provider, premium breach/reputation, payment gateway, richer historical intel masuk V2.

### Alasan
Revenue membiayai source yang benar-benar bernilai.

### Dampak
Source architecture tetap modular dari V1.

### Blueprint terkait
`docs/PRD.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0080 — Acceptance tests adalah bukti, bukan checklist kosmetik

**Status:** AKTIF  
**Phase:** 0–18  
**Tanggal:** 2026-08-09

### Masalah
Agent dapat mengklaim selesai tanpa negative/race/device test.

### Keputusan
Setiap domain dianggap DONE hanya setelah relevant acceptance suite.

### Alasan
Membuat quality objective lintas-agent.

### Dampak
NOT_AVAILABLE tidak sama dengan PASS.

### Blueprint terkait
`docs/ACCEPTANCE_TESTS.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0081 — Critical race tests wajib sebelum production

**Status:** AKTIF  
**Phase:** 6/9/11  
**Tanggal:** 2026-08-09

### Masalah
Ledger/payment/voucher memiliki risiko concurrency nyata.

### Keputusan
Wajib test 1 credit + many tabs, double payment approval, double voucher redemption, config conflict.

### Alasan
Menjaga financial integrity.

### Dampak
P0 failure menghentikan release terkait.

### Blueprint terkait
`docs/ACCEPTANCE_TESTS.md`

### Menggantikan
Tidak ada

---

## DEC-0082 — Agent harus meninggalkan Next Safe Action sebelum handoff

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Handoff vague membakar token agent berikutnya.

### Keputusan
Sebelum sesi berhenti, STATUS mencatat next action spesifik + relevant files + test state + migration head.

### Alasan
Membuat continuation langsung.

### Dampak
Handoff dianggap gagal jika agent baru perlu wawancara ulang Product Owner.

### Blueprint terkait
`.notes/AGENTS.md`, `.notes/STATUS_PROJECT.md`

### Menggantikan
Tidak ada

---

## DEC-0083 — Agent tidak boleh rewrite arsitektur karena preferensi model

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Agent berbeda punya style/library favorit yang berbeda.

### Keputusan
Existing architecture dipertahankan kecuali ada bug, security, incompatibility, performance, atau maintainability nyata.

### Alasan
Mencegah churn Claude ↔ Codex ↔ Antigravity.

### Dampak
Perubahan meaningful wajib decision baru.

### Blueprint terkait
`.notes/AGENTS.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0084 — Current official docs diverifikasi untuk hal yang mudah berubah

**Status:** AKTIF  
**Phase:** Semua  
**Tanggal:** 2026-08-09

### Masalah
Next.js/Supabase/Vercel/provider/browser behavior dapat berubah.

### Keputusan
Agent menggunakan official primary docs untuk implementation current-sensitive.

### Alasan
Mengurangi keputusan berdasarkan memory lama.

### Dampak
Tidak perlu browse untuk rule bisnis internal yang sudah locked.

### Blueprint terkait
`PROMPT_PEMBUKA.md`, `.notes/AGENTS.md`

### Menggantikan
Tidak ada

---

## DEC-0085 — JEJAK.md adalah local secret bootstrap dan tidak boleh commit

**Status:** AKTIF  
**Phase:** 0  
**Tanggal:** 2026-08-09

### Masalah
Product Owner memberikan file berisi credential Supabase/Gemini/Groq dan metadata project.

### Keputusan
File digunakan hanya untuk bootstrap lokal lalu di-ignore Git; raw secret dipindah ke env/secret store.

### Alasan
Mencegah credential bocor melalui repo/docs.

### Dampak
Agent tidak menyalin secret mentah ke DECISIONS/STATUS/README.

### Blueprint terkait
`docs/SCHEMA.md`, `PROMPT_PEMBUKA.md`

### Menggantikan
Tidak ada

---

## DEC-0086 — Secret modern diprioritaskan daripada legacy credential

**Status:** AKTIF  
**Phase:** 0–3  
**Tanggal:** 2026-08-09

### Masalah
Bootstrap dapat memuat modern publishable/secret key dan legacy anon/service/JWT credentials.

### Keputusan
Gunakan current Supabase recommended credentials/package; legacy hanya jika benar-benar diperlukan.

### Alasan
Mengurangi exposure dan technical debt.

### Dampak
Decision penggunaan legacy wajib dicatat.

### Blueprint terkait
`docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0087 — Git secret exposure dianggap compromised setelah push

**Status:** AKTIF  
**Phase:** 0–18  
**Tanggal:** 2026-08-09

### Masalah
Menghapus file dari latest commit tidak mencabut secret yang sudah terekspos.

### Keputusan
Jika secret pernah pushed, rotate + clean history + verify.

### Alasan
Menetapkan incident response yang benar.

### Dampak
Git revert saja tidak cukup.

### Blueprint terkait
`.notes/AGENTS.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0088 — Password Exposure terpisah dari universal search

**Status:** AKTIF  
**Phase:** 7/12  
**Tanggal:** 2026-08-09

### Masalah
User dapat keliru memasukkan password sebagai target identity.

### Keputusan
Password checker punya flow sendiri dan privacy notice.

### Alasan
Mengurangi accidental persistence/logging.

### Dampak
Password plaintext tidak masuk DB/AI/log.

### Blueprint terkait
`docs/WIRE_MAP.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0089 — HIBP Pwned Passwords memakai privacy-preserving k-anonymity approach

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Password tidak boleh dikirim raw ke pihak ketiga.

### Keputusan
Gunakan range/k-anonymity design HIBP sesuai current official API behavior.

### Alasan
Memberi value tinggi dengan exposure rendah.

### Dampak
No-match bukan guarantee aman.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0090 — Safe Share adalah sanitized snapshot, bukan public Case

**Status:** AKTIF  
**Phase:** 12  
**Tanggal:** 2026-08-09

### Masalah
Public Case URL berisiko membocorkan data sensitif/permission model.

### Keputusan
Buat artefak sanitized terpisah dengan token revocable/expiry.

### Alasan
Memungkinkan viral loop tanpa membuka raw Case.

### Dampak
Secret Case lebih ketat.

### Blueprint terkait
`docs/PRD.md`, `docs/SCHEMA.md`

### Menggantikan
Tidak ada

---

## DEC-0091 — Library/runtime implementation detail belum dikunci sebelum inspect environment

**Status:** AKTIF  
**Phase:** 0/1  
**Tanggal:** 2026-08-09

### Masalah
Blueprint menentukan behavior, bukan semua package.

### Keputusan
Agent pertama harus inspect global skills, current Next/Supabase docs, dan existing project sebelum memilih auth/session/state/graph/queue libraries.

### Alasan
Menghindari premature dependency decisions.

### Dampak
Pilihan yang meaningful ditambahkan sebagai DEC baru, bukan mengubah keputusan ini.

### Blueprint terkait
`docs/ROADMAP.md`, `.notes/AGENTS.md`

### Menggantikan
Tidak ada

---

## DEC-0092 — Queue/background mechanism dipilih berdasarkan durability, bukan preferensi

**Status:** AKTIF  
**Phase:** 7  
**Tanggal:** 2026-08-09

### Masalah
Scan harus terus berjalan saat browser/PWA ditutup.

### Keputusan
Agent memilih durable mechanism yang didukung environment; tidak mengandalkan unsupported post-response background promise.

### Alasan
Menjamin scan reliability.

### Dampak
Pilihan aktual dicatat setelah implementasi.

### Blueprint terkait
`docs/SCHEMA.md`, `docs/ROADMAP.md`

### Menggantikan
Tidak ada

---

## DEC-0093 — Graph library belum dikunci; behavior contract yang dikunci

**Status:** AKTIF  
**Phase:** 5/8  
**Tanggal:** 2026-08-09

### Masalah
Library graph terbaik bergantung performance/touch/WebGL fallback.

### Keputusan
Agent boleh memilih library yang memenuhi focus, progressive rendering, touch/pointer, 2D fallback.

### Alasan
Menghindari lock-in tanpa bukti.

### Dampak
Pilihan aktual harus dicatat jika significant.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

## DEC-0094 — Animation library belum dikunci; interaction quality yang dikunci

**Status:** AKTIF  
**Phase:** 4  
**Tanggal:** 2026-08-09

### Masalah
Motion implementation dapat berbeda antar runtime/library.

### Keputusan
Agent bebas memilih implementasi paling ringan selama Brave/Safari/reduced-motion contract terpenuhi.

### Alasan
Memprioritaskan UX/performance daripada library brand.

### Dampak
Decision library aktual bila meaningful.

### Blueprint terkait
`docs/DESIGN_SYSTEM.md`

### Menggantikan
Tidak ada

---

## DEC-0095 — State/cache library belum dikunci; server truth rules yang dikunci

**Status:** AKTIF  
**Phase:** 1/4  
**Tanggal:** 2026-08-09

### Masalah
State management choice perlu mengikuti actual architecture.

### Keputusan
Agent memilih tool minimal yang menjaga App Shell continuity dan server-authoritative business state.

### Alasan
Menghindari overengineering.

### Dampak
Jangan cache business truth sebagai authority.

### Blueprint terkait
`docs/PRD.md`, `docs/WIRE_MAP.md`

### Menggantikan
Tidak ada

---

# 4. TEMPAT KEPUTUSAN IMPLEMENTASI BARU

Agent Coding berikutnya menambahkan keputusan di bawah ini dengan nomor lanjutan.

Contoh:

```md
## DEC-0096 — Gunakan X untuk durable scan queue

Status: AKTIF
Phase: 7
Tanggal: ...

### Masalah
Scan harus bertahan setelah request/browser selesai...

### Keputusan
Gunakan ...

### Alasan
...

### Dampak
...

### Blueprint terkait
SCHEMA §...
ROADMAP Phase 7

### Menggantikan
Tidak ada
```

---

## DEC-0097 — Package manager final: pnpm 11.16.0 lewat corepack

**Status:** AKTIF  
**Phase:** 1  
**Tanggal:** 2026-08-09

### Masalah
`package.json` mengunci `packageManager: pnpm@11.16.0`, tapi `pnpm` tidak ada di PATH mesin ini sehingga script komposit `pnpm check` gagal memanggil sub-script-nya.

### Keputusan
Pakai pnpm sebagai package manager tunggal dan aktifkan lewat `corepack enable` (shim resmi Node), bukan install pnpm global via npm.

### Alasan
Versi pnpm mengikuti field `packageManager` sehingga lokal, CI, dan agent lain memakai versi yang sama. Menghindari drift lockfile.

### Dampak
Agent baru di mesin bersih cukup menjalankan `corepack enable` sekali. Jangan menambah `npm install -g pnpm`, dan jangan mencampur npm/yarn di repo ini.

### Blueprint terkait
`docs/ROADMAP.md` Phase 1, `.github/workflows/quality.yml`

### Menggantikan
Tidak ada

---

## DEC-0098 — pnpm build script allowlist, bukan mematikan proteksi

**Status:** AKTIF  
**Phase:** 1  
**Tanggal:** 2026-08-09

### Masalah
pnpm memblokir postinstall script dependency secara default. Ada dependency yang memang butuh build script agar berfungsi.

### Keputusan
Izinkan hanya dependency yang benar-benar membutuhkannya lewat allowlist di `pnpm-workspace.yaml`, dan biarkan proteksi default tetap menyala untuk sisanya.

### Alasan
Mematikan proteksi secara global akan membuat setiap dependency baru bisa menjalankan kode saat install tanpa ditinjau — jalur supply chain yang tidak mau kita buka.

### Dampak
Dependency baru yang butuh build script harus ditambahkan sadar-sadar ke allowlist, bukan dengan melonggarkan konfigurasi.

### Blueprint terkait
`pnpm-workspace.yaml`, `.notes/AGENTS.md` §10

### Menggantikan
Tidak ada

---

## DEC-0099 — Secret scan dijalankan sendiri, bukan menumpang layanan eksternal

**Status:** AKTIF  
**Phase:** 0/1  
**Tanggal:** 2026-08-09

### Masalah
Project menyimpan bootstrap credential lokal (`JEJAK.md`) dan banyak provider key. Ketergantungan pada scanner pihak ketiga berarti isi repo harus dikirim keluar dan hasilnya tidak bisa dijalankan tiap commit secara offline.

### Keputusan
Pakai `scripts/secret-scan.mjs` milik sendiri, dijalankan atas semua file yang Git lihat (tracked + untracked non-ignored), dan dipasang sebagai langkah wajib di `pnpm check` serta CI.

### Alasan
Cepat, offline, tidak mengirim kode ke luar, dan aturannya bisa disesuaikan dengan provider yang benar-benar dipakai Jejak.

### Dampak
Scanner harus dirawat: setiap provider/kredensial baru berarti aturan baru. Laporan hanya menyebut path + nama aturan, tidak pernah mencetak nilai secret.

### Blueprint terkait
`docs/SECURITY_THREAT_MODEL.md`, `.notes/AGENTS.md` §27–30

### Menggantikan
Tidak ada

---

## DEC-0100 — False positive secret scan diselesaikan dengan mempersempit sasaran, bukan melemahkan aturan

**Status:** AKTIF  
**Phase:** 0/1  
**Tanggal:** 2026-08-09

### Masalah
Scanner sempat menandai tiga hal yang bukan kebocoran: placeholder di `.env.example`, fixture test yang formatnya terlalu mirip secret asli, dan contoh env di dokumentasi. Godaannya adalah melonggarkan aturan sampai ketiganya lolos — dan ikut membuat secret asli lolos.

### Keputusan
Tiga langkah, tanpa mengendurkan deteksi:
1. aturan env hanya memicu kalau nilainya benar-benar terisi dan bukan placeholder (`<...`, `your-`, `change-me`, kosong);
2. `.env.example` diizinkan ada sebagai nama file, isinya tetap dipindai;
3. sampel secret di test dirakit dari potongan string saat runtime, sehingga tidak pernah muncul utuh di source, dan fixture-nya ditulis ke direktori temp di luar repo.

Scanner juga menerima path eksplisit sebagai argumen supaya test bisa memanggilnya tanpa menyentuh isi repo.

### Alasan
False positive dan deteksi lemah sama-sama merusak: yang pertama membuat orang mengabaikan alarm, yang kedua membuat alarm tidak berbunyi. Yang benar adalah memperjelas sasaran.

### Dampak
Aturan justru bertambah ketat: sekarang juga menangkap JWT bertanda tangan (bentuk legacy service-role key Supabase), connection string Postgres dengan password nyata, serta env key yang mengandung `SERVICE_ROLE` atau `CREDENTIAL`. `tests/secret-scan.test.ts` menjaga agar pelonggaran di masa depan langsung merah.

### Blueprint terkait
`scripts/secret-scan.mjs`, `tests/secret-scan.test.ts`, `docs/SECURITY_THREAT_MODEL.md`

### Menggantikan
Tidak ada

---

## DEC-0101 — Testing stack final: Vitest untuk unit/integration

**Status:** AKTIF  
**Phase:** 1  
**Tanggal:** 2026-08-09

### Masalah
`docs/DECISIONS` menyebut testing stack belum dikunci, sementara Phase 1 butuh bukti otomatis sejak awal.

### Keputusan
Vitest jadi test runner untuk unit dan integration, dengan pola file `src/**/*.test.ts` dan `tests/**/*.test.ts`. Browser/E2E dan RLS negative test ditentukan terpisah saat phase-nya tiba.

### Alasan
Satu runner, konfigurasi minimal, jalan cepat, dan cocok dipakai sebagai gate di setiap commit.

### Dampak
Test yang butuh browser nyata tidak dipaksa masuk Vitest; itu keputusan Phase 13/16.

### Blueprint terkait
`vitest.config.ts`, `docs/ROADMAP.md` Phase 1

### Menggantikan
Melengkapi DEC-0095 (belum dikunci) untuk bagian testing saja.

---

## DEC-0102 — Migration dijalankan lewat Supabase CLI + session pooler

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-09

### Masalah
Tiga jalur ke database ternyata tertutup: MCP Supabase pada session ini tidak punya izin ke project Jejak (`tauyicvfhpfnohhgccvn`) dan hanya melihat project lain; `supabase link` butuh personal access token yang belum ada; host langsung `db.<ref>.supabase.co` hanya punya record AAAA sehingga tidak resolve dari mesin ini.

### Keputusan
Supabase CLI dipasang sebagai devDependency dan migration didorong dengan `supabase db push --db-url` melalui session pooler `aws-0-ap-southeast-1.pooler.supabase.com:5432`, memakai password database dari `JEJAK.md` yang di-percent-encode saat itu juga.

### Alasan
Jalur ini bekerja tanpa token tambahan, tetap menghasilkan file migration yang ter-version di repo, dan port 5432 adalah mode session yang memang cocok untuk DDL.

### Dampak
Migration head ada di `supabase/migrations`, bukan di dashboard. `supabase db advisors`, `db diff`, dan stack lokal belum tersedia (butuh token dan Docker) — jadi review keamanan schema masih manual sampai salah satunya ada. Connection string berisi password tidak boleh dicetak ke output mana pun.

### Blueprint terkait
`supabase/migrations/`, `.notes/STATUS_PROJECT.md` §13

### Menggantikan
Tidak ada

---

## DEC-0103 — Owner di-bootstrap sekali oleh trigger, lalu pintunya tertutup

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-09

### Masalah
Owner pertama harus ada tanpa campur tangan manual, tapi mencocokkan email di aplikasi dilarang, dan aturan "email yang cocok dapat peran owner" kalau dibiarkan hidup akan jadi jalur pengambilalihan.

### Keputusan
Trigger `app.handle_new_auth_user` memberi peran `owner` hanya jika email pendaftar sama dengan email bootstrap **dan** belum ada satu pun assignment `owner` yang aktif di database. Setelah Owner pertama ada, cabang itu tidak akan pernah aktif lagi.

### Alasan
Email tetap sebatas identity bootstrap seperti mandat blueprint; sumber kebenaran otorisasi pindah ke `user_roles` sejak detik pertama.

### Dampak
Perpindahan kepemilikan berikutnya harus lewat operasi admin yang teraudit. Kalau database di-reset, bootstrap akan berjalan lagi — itu memang perilaku yang diinginkan untuk lingkungan baru.

### Blueprint terkait
`docs/SCHEMA.md` §4.2, `supabase/migrations/20260809163905_identity_and_rbac_foundation.sql`

### Menggantikan
Tidak ada

---

## DEC-0104 — Peran dibaca dari database, bukan dari klaim JWT

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-09

### Masalah
Menaruh peran di klaim JWT lebih murah, tapi klaim baru segar setelah token di-refresh. Artinya pencabutan peran bisa tertunda sampai token lama kedaluwarsa.

### Keputusan
`bacaSesiPengguna()` mengambil peran dari tabel `user_roles` pada setiap request server. Klaim JWT hanya dipakai proxy untuk memutuskan apakah seseorang sudah login.

### Alasan
Pencabutan peran harus berlaku seketika. Ini juga sejalan dengan `docs/SCHEMA.md` §5.5 yang menyebut klaim custom sekadar petunjuk performa.

### Dampak
Ada satu query tambahan per request yang butuh peran. Kalau nanti terbukti mahal, jalan keluarnya cache berumur pendek di sisi server, bukan memindahkan otoritas ke JWT.

### Blueprint terkait
`docs/SCHEMA.md` §5.5, §125; `src/lib/auth/session.ts`

### Menggantikan
Tidak ada

---

## DEC-0105 — Katalog peran boleh dibaca, kepemilikan peran tidak

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-09

### Masalah
Aplikasi perlu menampilkan peran pengguna lewat relasi `user_roles -> roles`, sementara `roles` awalnya ditutup rapat sehingga relasinya gagal.

### Keputusan
`public.roles` diberi hak baca untuk pengguna yang sudah login dengan policy `using (true)`. `public.user_roles` tetap hanya menampilkan baris milik pemanggil.

### Alasan
Isi `roles` cuma nama peran yang sudah tertulis terbuka di blueprint. Yang benar-benar sensitif adalah siapa memegang peran apa, dan itu tidak ikut terbuka.

### Dampak
Jangan pernah menyimpan data sensitif di tabel `roles` — tabel ini sekarang terbaca semua pengguna login.

### Blueprint terkait
`supabase/migrations/20260809164435_expose_role_catalog_read.sql`, `docs/SCHEMA.md` §68

### Menggantikan
Tidak ada

---

## DEC-0106 — Next.js 16: `middleware.ts` diganti `proxy.ts`

**Status:** AKTIF  
**Phase:** 1/2  
**Tanggal:** 2026-08-09

### Masalah
Next.js 16 menandai konvensi `middleware` sebagai deprecated dan memunculkan peringatan di setiap build.

### Keputusan
File dipindahkan ke `src/proxy.ts` dengan named export `proxy`, mengikuti konvensi resmi versi ini.

### Alasan
Mengikuti konvensi yang didukung sejak awal lebih murah daripada memigrasi setelah banyak kode bergantung padanya.

### Dampak
Peran file itu tidak berubah: menyegarkan session dan mengarahkan tamu ke `/masuk`. Ia tetap lapisan kenyamanan — otorisasi sebenarnya tetap di RLS.

### Blueprint terkait
`src/proxy.ts`, `src/lib/supabase/middleware.ts`

### Menggantikan
Tidak ada

---

## DEC-0107 — Bucket dibuat lebih dulu daripada fiturnya, tanpa policy client

**Status:** AKTIF  
**Phase:** 3  
**Tanggal:** 2026-08-09

### Masalah
Case dan Payment belum ada, jadi godaannya menunda pembuatan bucket sampai fiturnya jadi. Pola itu menciptakan jeda berbahaya: file sudah bisa masuk sementara policy-nya menyusul.

### Keputusan
`case-attachments` dan `payment-proofs` dibuat sekarang dalam keadaan privat, dengan batas ukuran dan daftar MIME, dan **tanpa satu pun policy** untuk `anon`/`authenticated`. Akses file hanya lewat alur server terkontrol dan signed URL berumur pendek. Policy per-bucket ditambahkan bersama Case (Phase 5) dan Payment (Phase 9), saat model kepemilikan filenya sudah ada.

### Alasan
`storage.objects` sudah ber-RLS bawaan, jadi tanpa policy artinya tertutup penuh — default paling aman yang bisa dipilih.

### Dampak
Selama belum ada policy, tidak ada upload dari browser sama sekali. Itu memang yang diinginkan pada tahap ini.

### Blueprint terkait
`supabase/migrations/20260809165522_permissions_and_storage_security.sql`, `docs/ROADMAP.md` Phase 3.4-3.5

### Menggantikan
Tidak ada

---

## DEC-0108 — Pemetaan permission staf ditulis eksplisit, bukan berjenjang

**Status:** AKTIF  
**Phase:** 3  
**Tanggal:** 2026-08-09

### Masalah
Model peran berjenjang (admin mewarisi semua milik support, owner mewarisi semua milik admin) terlihat rapi tapi menyembunyikan kemampuan: menambah satu permission ke peran bawah diam-diam menaikkan peran atas.

### Keputusan
Setiap peran mendapat daftar permission-nya sendiri secara eksplisit. Owner memegang seluruh 24 permission karena memang pemilik; Admin 11 tanpa kepemilikan/rekening/identifier mentah; Finance 6 khusus pembayaran; Support 1; peran `user` nol.

### Alasan
Kemampuan setiap peran bisa dibaca langsung dari satu tempat, dan penambahan permission baru memaksa keputusan sadar untuk tiap peran. Peran `user` sengaja kosong karena kemampuan pengguna biasa berasal dari kepemilikan data lewat RLS, bukan dari permission staf.

### Dampak
Permission baru harus ditambahkan ke tiap peran yang membutuhkannya — sedikit lebih berisik, tapi tidak pernah ada kenaikan hak yang tidak disengaja.

### Blueprint terkait
`docs/SCHEMA.md` §5.2-5.3, `.notes/AGENTS.md` §39-40

### Menggantikan
Tidak ada

---

## DEC-0109 — Status akun ikut menentukan kemampuan staf

**Status:** AKTIF  
**Phase:** 3  
**Tanggal:** 2026-08-09

### Masalah
Kalau staf dijeda atau diblokir, mencabut perannya satu per satu itu lambat dan mudah terlewat.

### Keputusan
`app.current_user_has_permission` ikut memeriksa `profiles.account_status = 'active'` dan `deleted_at is null`. Akun yang tidak aktif kehilangan seluruh kemampuan staf seketika, tanpa perannya perlu disentuh.

### Alasan
Satu tuas untuk menghentikan seseorang, dan jejak perannya tetap utuh untuk audit maupun pemulihan.

### Dampak
Mengaktifkan kembali akun otomatis mengembalikan kemampuannya. Kalau nanti ingin pencabutan permanen, itu tetap harus lewat pencabutan peran yang teraudit.

### Blueprint terkait
`supabase/migrations/20260809165522_permissions_and_storage_security.sql`, `docs/SCHEMA.md` §5.6

### Menggantikan
Tidak ada

---

## DEC-0110 — Domain produksi kanonik adalah `https://www.cekjejak.my.id`

**Status:** AKTIF  
**Phase:** 1/17  
**Tanggal:** 2026-08-10

### Masalah
Seluruh blueprint menyebut `jejak.my.id`, tetapi domain yang benar-benar dibeli dan dipasang Product Owner adalah `cekjejak.my.id`. Kalau perbedaan ini dibiarkan, agent berikutnya akan mengonfigurasi OAuth dan deploy ke domain yang tidak pernah ada.

### Keputusan
Domain produksi resmi adalah `https://www.cekjejak.my.id`. Apex `cekjejak.my.id` mengalihkan ke `www`. `jejak.my.id` di dokumen blueprint mana pun dianggap sudah tidak berlaku dan tidak perlu dikejar satu per satu — keputusan ini yang menang.

### Alasan
Domain sudah terpasang, Valid Configuration di Vercel, dan sudah dipakai sebagai Site URL di Supabase serta Authorized Origin di Google. Mengubahnya sekarang berarti mengulang seluruh konfigurasi OAuth tanpa manfaat.

### Dampak
`docs/ENVIRONMENT_CONTRACT.md` sudah diperbarui karena isinya diikuti secara harfiah saat deploy. Dokumen produk lain sengaja tidak disisir supaya diff-nya tidak melebar; entri ini adalah rujukannya.

### Blueprint terkait
`docs/ENVIRONMENT_CONTRACT.md` §28, `src/lib/url/origin.ts`

### Menggantikan
Menggantikan penyebutan `jejak.my.id` sebagai domain produksi di seluruh blueprint.

---

## DEC-0111 — Origin OAuth dipatok di produksi, diturunkan dari request di luar produksi

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-10

### Masalah
URL `redirectTo` untuk OAuth semula dibangun dari header `Host`/`X-Forwarded-Host`. Header itu datang dari klien, jadi permintaan dengan Host palsu bisa menggeser titik pulang alur login.

### Keputusan
Saat `VERCEL_ENV === "production"`, origin dipatok ke `https://www.cekjejak.my.id`. Di localhost dan preview, origin tetap diturunkan dari request.

### Alasan
Produksi hanya punya satu origin sah, jadi tidak ada alasan menanyakannya ke klien. Preview punya hostname yang berubah-ubah, jadi menurunkannya dari request tetap yang paling praktis di sana — dan preview sudah tertutup Vercel Authentication (lihat DEC-0112).

### Dampak
Allowlist Redirect URL di Supabase tetap lapis pertahanan kedua. Kalau nanti domain berubah, satu konstanta di `src/lib/url/origin.ts` yang diubah.

### Blueprint terkait
`src/lib/url/origin.ts`, `src/app/auth/masuk-google/route.ts`, `src/app/auth/callback/route.ts`

### Menggantikan
Tidak ada

---

## DEC-0112 — Preview diisolasi lewat Vercel Authentication, bukan lewat database terpisah

**Status:** AKTIF  
**Phase:** 1/17  
**Tanggal:** 2026-08-10

### Masalah
Environment variable di Vercel tersedia untuk Production maupun Preview, artinya deployment preview memegang kredensial Supabase produksi. Kalau preview bisa dibuka siapa saja, itu jalan pintas ke data produksi.

### Keputusan
Preview tetap memakai project Supabase yang sama, tetapi seluruh URL deployment ditutup Vercel Authentication (`ssoProtection` aktif, `all_except_custom_domains`). Hanya domain kustom yang publik; setiap URL `*.vercel.app` menuntut login anggota tim.

### Alasan
Membuat project Supabase kedua berarti dua schema yang harus dijaga tetap sinkron sejak Phase 2 — beban perawatan yang belum sebanding, sementara data produksi juga belum ada. Pengaman yang benar-benar mencegah kebocoran hari ini adalah menutup pintunya.

### Dampak
Kalau nanti sudah ada data pengguna sungguhan, keputusan ini harus ditinjau ulang: preview yang menulis ke database produksi menjadi risiko nyata. Itu pemicu untuk project Supabase terpisah, dicatat sebagai DEC baru saat waktunya. Sampai saat itu, jangan mematikan Vercel Authentication untuk preview.

### Blueprint terkait
`docs/ENVIRONMENT_CONTRACT.md`, `.notes/STATUS_PROJECT.md` §14

### Menggantikan
Tidak ada

---

## DEC-0113 — Login Google dimulai dari tautan GET, bukan form POST

**Status:** AKTIF  
**Phase:** 2  
**Tanggal:** 2026-08-10

### Masalah
Header keamanan kita memasang `form-action 'self'`. Browser ikut menerapkan aturan itu pada redirect yang menjadi tujuan submit form, sehingga tombol login berupa form POST yang berujung ke `accounts.google.com` akan diblokir di produksi.

### Keputusan
Login dimulai dari route GET `/auth/masuk-google` yang dibuka lewat tautan biasa. Navigasi tautan tidak tunduk pada `form-action`. Logout tetap server action karena redirect-nya sesama origin.

### Alasan
Pilihan lain adalah melonggarkan CSP dengan menambahkan `accounts.google.com` ke `form-action`. Mengubah bentuk tautan lebih murah dan tidak mengurangi proteksi. Memulai alur OAuth lewat GET juga praktik umum, dan perlindungan dari serangan lintas situs di sini datang dari PKCE.

### Dampak
`form-action 'self'` tetap ketat. Kalau nanti ada tombol lain yang harus menyeberang ke domain luar, pola yang sama yang dipakai — tautan, bukan form.

### Blueprint terkait
`next.config.ts`, `src/app/auth/masuk-google/route.ts`, `src/app/masuk/page.tsx`

### Menggantikan
Tidak ada

---

# 5. KEPUTUSAN YANG WAJIB DIBUAT SAAT IMPLEMENTASI BILA RELEVAN

Saat Agent benar-benar menjalankan project, keputusan berikut belum boleh diasumsikan dan harus dicatat jika significant:

- package manager final;
- Supabase SSR package/pattern final;
- runtime split Vercel vs Supabase Edge Functions;
- durable job/queue mechanism;
- identifier encryption implementation;
- graph library;
- animation library;
- client state/cache library;
- testing stack;
- browser automation stack;
- image processing pipeline;
- realtime implementation detail;
- analytics storage/aggregation implementation;
- deployment region config aktual;
- feature flag implementation detail;
- error monitoring service jika ada;
- PWA/service worker strategy detail;
- secret management destination aktual;
- source provider model/version choices;
- AI provider routing strategy;
- source circuit breaker storage/runtime;
- data export artifact format;
- report generation library;
- backup policy implementation.

Tidak semua harus punya DEC terpisah.

Buat hanya jika keputusan:
> akan membuat Agent berikutnya bertanya “kenapa begini?”

---

# 6. DECISION HYGIENE

## Jangan tulis secret
Dilarang memasukkan:
- API key;
- password;
- database password;
- JWT secret;
- full bank account secret bila tidak perlu;
- GitHub PAT.

Gunakan:
> nama env / alias.

## Jangan tulis stack trace
Taruh bug status di STATUS.

## Jangan duplicate blueprint
Reference section.

## Jangan delete history
Supersede.

## Jangan tulis teori
Decision harus konkret.

---

# 7. QUICK DECISION SUMMARY

Agent baru tidak perlu menghafal semuanya. Yang paling fundamental:

1. Project state hidup di folder, bukan memory model.
2. Baca STATUS + DECISIONS dulu.
3. Cek global skills sebelum install.
4. Komunikasi ke Product Owner pakai Indonesia gaul `lo/gue`.
5. Next.js 16 + Supabase + Vercel + Google OAuth + PWA.
6. RLS deny-by-default.
7. Owner = user normal + DB role.
8. Empat nav user.
9. Case core V1.
10. Evidence Passport.
11. AI bukan source fakta.
12. Credit = lots + ledger + holds.
13. Payment manual V1 + human final approval.
14. Payment config editable admin + order snapshot.
15. PWA Version Sentinel wajib.
16. Partner source-of-value tidak boleh dibuat dari nol.
17. Config bisnis runtime, bukan hardcode.
18. Delete harus benar-benar bersihkan Storage.
19. Acceptance tests adalah bukti.
20. V1 production-grade dulu, V1.5/V2 setelah stabil.

---

# 8. HANDOFF RULE

Sebelum Agent berhenti:
- jika ada keputusan baru significant, tulis di sini;
- update STATUS dengan pointer DEC yang relevan;
- jangan meninggalkan architecture change hanya di code tanpa rationale.

Contoh STATUS:

```md
Relevant Decisions:
- DEC-0096 durable scan queue
- DEC-0098 identifier encryption
```

---

# 9. STARTER NOTE UNTUK AGENT PERTAMA

Saat file ini pertama dibaca, project masih berada pada blueprint handoff.

Agent pertama **tidak perlu membuat keputusan teknis baru sebelum inspect environment**.

Urutan:
1. inspect global skills;
2. inspect existing code;
3. inspect Git;
4. inspect current official docs;
5. baru pilih implementation detail;
6. catat DEC baru bila meaningful.

Jangan memilih dependency hanya karena Agent familiar.

---

# 10. FINAL RULE

Kalau Agent baru ingin mengubah keputusan aktif hanya karena:
> “gue lebih suka cara lain,”

jangan.

Kalau ada:
- security problem;
- compatibility issue;
- measured performance issue;
- library unsupported;
- clear maintainability risk;

boleh ubah, tapi:
1. buktikan masalah;
2. buat DEC baru;
3. supersede yang lama;
4. update STATUS;
5. test regression.

**END OF DECISIONS**
