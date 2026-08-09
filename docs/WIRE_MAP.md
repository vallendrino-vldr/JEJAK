# WIRE MAP — JEJAK

> **Status:** Blueprint UX/UI lintas-device untuk Agent Coding  
> **Produk:** Jejak — `jejak.my.id`  
> **Bahasa UI:** Bahasa Indonesia sehari-hari, humble, santai, elegan, tidak kaku, tidak kampungan  
> **Scope dokumen:** struktur layar, alur, state, navigasi, interaction contract, data dependency, permission, dan perilaku mobile/desktop  
> **Bukan:** spesifikasi warna/material detail, schema database, atau kode implementasi  
> **Source of truth terkait:** `docs/PRD.md`, `docs/DESIGN_SYSTEM.md`, `docs/SCHEMA.md`, `.notes/AGENTS.md`

---

# 0. Cara Membaca Dokumen Ini

Dokumen ini menjawab satu pertanyaan utama:

> **“Kalau seseorang membuka Jejak, apa yang dia lihat, apa yang bisa dia lakukan, apa yang terjadi setelah dia melakukan sesuatu, dan bagaimana pengalaman itu berubah antara HP, tablet, desktop, PWA, user biasa, user Power, Mitra, dan Owner?”**

`PRD.md` menjelaskan **apa dan kenapa** produk dibangun.

`DESIGN_SYSTEM.md` menjelaskan **seperti apa rasanya**.

`WIRE_MAP.md` ini menjelaskan **di mana setiap bagian hidup dan bagaimana semuanya tersambung**.

Agent Coding **dilarang** menganggap wire map sebagai saran opsional. Bila dokumen ini menentukan bahwa suatu aksi membuka panel, jangan mengubahnya menjadi halaman baru hanya karena lebih cepat dibuat.

Bila implementasi teknis membutuhkan variasi kecil, pertahankan:
- hierarchy informasi;
- intent pengguna;
- urutan tindakan;
- affordance mobile/desktop;
- state bisnis;
- permission;
- performa;
- bahasa;
- continuity antar-layar.

---

# 0.1 Prioritas Bila Ada Konflik Dokumen

Urutan keputusan:

1. Keamanan, ledger, permission, dan aturan bisnis pada PRD/SCHEMA.
2. Alur pengguna pada WIRE_MAP.
3. Rasa visual/interaksi pada DESIGN_SYSTEM.
4. Detail implementasi teknis dipilih Agent secara mandiri.
5. Keputusan baru yang belum diatur dicatat di `.notes/DECISIONS.md`.

Agent tidak boleh menyelesaikan konflik dengan diam-diam memilih interpretasi termudah.

---

# 0.2 Status Implementasi

Setiap layar/fitur diberi label:

- **V1 AKTIF** — harus bisa dipakai pada rilis pertama.
- **V1 FONDASI** — model data/permission/entry point harus siap, UI penuh boleh belum aktif.
- **V1.5** — dibangun setelah V1 stabil.
- **V2** — upgrade mesin/ekosistem setelah revenue membuktikan kebutuhan.

Agent harus mengikuti `ROADMAP.md`; keberadaan sebuah layar di dokumen ini **bukan izin** membangun V1.5/V2 sebelum Quality Gate V1 sehat.

---

# 1. Peta Besar Produk

## 1.1 Sebelum Login

```text
Landing satu viewport
    │
    ├── Demo fiktif interaktif
    ├── Pasang Jejak
    └── Mulai dengan Google
             │
             ▼
         Google OAuth
             │
             ▼
        Onboarding ringan
             │
             ▼
          Beranda
```

Demo **100% dummy/local**. Tidak boleh memanggil API OSINT, Gemini, Groq, atau sumber mahal.

## 1.2 Setelah Login — User App Shell

```text
┌─────────────────────────────────────────────┐
│ Kembali*        JEJAK       Kredit   Kabar  │
│                                             │
│               WORKSPACE                     │
│                                             │
│                                     Mata    │
├─────────────────────────────────────────────┤
│ Beranda   Periksa   Kasus   Jejak Gue       │
└─────────────────────────────────────────────┘
```

`Kembali` muncul ketika konteks memerlukan navigasi mundur.

`Kredit`, `Kabar Jejak`, dan `Mata Jejak` adalah kontrol global.

Tidak ada page scroll pada App Shell. Konten panjang memakai internal scrolling region.

## 1.3 Navigation User yang Dikunci

Empat navigasi utama:
1. **Beranda**
2. **Periksa**
3. **Kasus**
4. **Jejak Gue**

Bukan:
- Dompet sebagai tab utama;
- AI sebagai tab utama;
- Pengaturan sebagai tab utama;
- Riwayat sebagai tab utama.

Mereka hidup sebagai panel/workspace sekunder agar navigation tetap bersih.

## 1.4 Ruang Kendali Owner/Admin

```text
Ruang Kendali
    │
    ├── Ringkasan
    ├── Pembayaran
    ├── Pengguna
    ├── Partner
    ├── Bisnis
    ├── Sistem
    ├── Analitik
    └── NADI
```

Selalu tersedia aksi:
> **Kembali sebagai Pengguna**

Owner secara default tetap bisa memakai Jejak sebagai user sungguhan.

---

# 2. Kontrak App Shell Global

## 2.1 Tidak Boleh Remount Tanpa Alasan

Saat user berpindah:
> Beranda → Periksa → Kasus → Jejak Gue

bagian ini tetap hidup:
- session context;
- saldo kredit tampilan;
- navigation;
- Kabar Jejak;
- Mata Jejak;
- background/material shell;
- indikator pemeriksaan berjalan;
- state panel global yang aman.

Workspace yang berubah tidak boleh membuat browser terasa memuat situs baru.

## 2.2 No Page Scroll

Aturan final:
> **Tidak ada scroll halaman global. Scroll internal diperbolehkan.**

Contoh yang boleh scroll:
- daftar Kasus;
- daftar transaksi;
- evidence list;
- chat AI;
- admin payment queue;
- log;
- analytics table.

Contoh yang tidak boleh membuat whole-page scroll:
- App Shell;
- landing;
- top bar;
- bottom navigation;
- sidebar desktop.

## 2.3 Global Control Priority

Dari paling global:
1. sesi/user;
2. navigation;
3. saldo;
4. Kabar Jejak;
5. indikator pemeriksaan berjalan;
6. Mata Jejak;
7. Kembali;
8. Segarkan;
9. workspace content.

## 2.4 Saldo Kredit Global

Tap/click saldo:
> buka **Dompet Kredit**.

Jangan navigasi ke halaman baru.

Saldo tampilan boleh memakai last-known state untuk respons cepat, tetapi tindakan finansial selalu meminta kebenaran server terbaru.

## 2.5 Kabar Jejak Global

Tap/click:
> buka panel **Kabar Jejak**.

Mobile:
> bottom sheet tinggi adaptif.

Desktop:
> right drawer.

Panel tidak mereset workspace aktif.

## 2.6 Mata Jejak Global

Free:
> membuka **Panduan Jejak** kontekstual.

Premium/eligible:
> entry ke **Asisten AI Jejak** sesuai konteks aktif.

Tap maskot untuk bantuan tidak boleh mengubah route utama.

## 2.7 Indikator Pemeriksaan Berjalan

Jika ada proses server yang masih berjalan:
> tampilkan indikator global kecil, misalnya `1 pemeriksaan berjalan`.

Tap:
> buka **Pusat Aktivitas Pemeriksaan**.

User boleh meninggalkan layar scan; pekerjaan tetap berjalan di server.

## 2.8 Tombol Kembali

Di PWA standalone, tombol ini menggantikan ketergantungan ke toolbar browser.

Prioritas aksi:
1. tutup popover/modal paling atas;
2. tutup panel sekunder;
3. kembali ke sub-workspace sebelumnya;
4. kembali ke workspace induk;
5. baru history route.

Jangan keluar PWA karena `back` yang salah.

## 2.9 Tombol Segarkan

`Segarkan` bukan full browser reload.

Ia meminta:
- versi aplikasi;
- saldo;
- role/entitlement;
- Kabar Jejak;
- status scan;
- status pembayaran;
- data workspace aktif.

State visual yang aman seperti posisi graph sebisa mungkin dipertahankan.

---

# 3. Breakpoint Perilaku, Bukan Sekadar Ukuran

## 3.1 Mobile Touch-First

Default:
- bottom navigation;
- one-thumb priority;
- bottom sheet;
- single-primary-workspace;
- tap sebagai aksi utama;
- long-press hanya shortcut;
- touch target besar walau visual compact;
- keyboard layar tidak menutup CTA.

## 3.2 Desktop Pointer-First

Default:
- sidebar/rail compact;
- hover sebagai enhancement;
- multi-column bila mempercepat kerja;
- right-side detail drawer;
- contextual menu tersedia tapi tidak wajib;
- keyboard shortcut boleh memperkaya.

## 3.3 Tablet/Hybrid

Harus mendukung:
- touch;
- pointer;
- keyboard fisik;
- orientasi portrait/landscape.

Jangan menentukan input method dari `screen width` saja.

## 3.4 Hukum Interaction

> **Fitur penting tidak boleh hanya bisa ditemukan via hover, right-click, atau long-press.**

Shortcut boleh ada. Jalan utama selalu terlihat.

---

# 4. Routing Conceptual

Nama route implementasi boleh berbeda jika Agent punya alasan teknis, tetapi pengalaman harus setara.

```text
/
├── auth
├── app
│   ├── beranda
│   ├── periksa
│   ├── kasus
│   │   └── [case]
│   └── jejak-gue
├── ruang-kendali
│   ├── ringkasan
│   ├── pembayaran
│   ├── pengguna
│   ├── partner
│   ├── bisnis
│   ├── sistem
│   ├── analitik
│   └── nadi
└── safe-share/[token]
```

Panel seperti Dompet/Kabar/AI dapat memakai route state atau client state, tetapi deep-linking penting jangan hilang.

---

# 5. LANDING — V1 AKTIF

## 5.1 Tujuan

Dalam beberapa detik user harus memahami:
- Jejak membantu memeriksa jejak digital;
- bisa dipakai sebelum percaya/transfer;
- bisa mulai gratis;
- tidak membutuhkan kartu kredit;
- tersedia sebagai PWA.

## 5.2 Isi Satu Viewport

Urutan visual:
1. logo Jejak;
2. Mata Jejak subtle;
3. tagline;
4. subcopy singkat;
5. Search Console demo;
6. demo fiktif interaktif;
7. tombol Google;
8. `Pasang Jejak` jika relevan;
9. legal/privacy link minimal.

Copy utama:
> **Periksa sebelum percaya.**

Subcopy:
> **Cek paparan data, telusuri sinyal risiko, dan pahami jejak digital dengan lebih jelas.**

CTA:
> **Mulai dengan Google**

Helper:
> **Bisa mulai gratis. Nggak perlu kartu kredit.**

## 5.3 Demo Fiktif

Demo harus diberi label:
> **Contoh pemeriksaan**

Data:
- bukan user nyata;
- bukan request provider;
- tidak menyimpan input pengunjung;
- tidak memotong kredit;
- tidak menjalankan AI.

Demo dapat memperlihatkan:
- satu node utama;
- dua hubungan;
- satu node misterius;
- risk summary;
- mini reveal.

Tujuannya adalah demonstrasi rasa produk, bukan search gratis anonymous.

## 5.4 Mobile

Tidak ada scroll panjang.

Jika viewport sangat pendek:
- prioritas tagline;
- demo compact;
- CTA Google selalu terjangkau;
- detail legal dipindah ke panel.

## 5.5 Desktop

Demo boleh berada berdampingan dengan copy.

Jangan membuat hero 3D berat yang menunda login.

## 5.6 State

- normal;
- installable;
- already installed;
- login working;
- login failed;
- offline;
- JavaScript unavailable;
- update required jika PWA lama membuka root.

---

# 6. LOGIN GOOGLE — V1 AKTIF

## 6.1 Entry

Dari:
> `Mulai dengan Google`

## 6.2 Working State

CTA langsung memberi feedback:
> **Menyambungkan akun…**

Jangan menampilkan loading page baru jika tidak perlu.

## 6.3 Success Routing

User lama:
> kembali ke workspace terakhir yang aman atau Beranda.

User baru:
> onboarding ringan.

Owner:
> tetap masuk sebagai user biasa, bukan otomatis Ruang Kendali.

## 6.4 Failure

Copy:
> **Login Google belum berhasil.**
>
> **Coba lagi. Kalau browser Lo memblokir bagian tertentu, buka lewat tombol di bawah.**

Actions:
- `Coba lagi`;
- bantuan singkat jika browser blocking.

Input/session tidak boleh meninggalkan halaman putih.

---

# 7. ONBOARDING PERTAMA — V1 AKTIF

## 7.1 Tidak Ada Carousel Panjang

Satu contextual card:
> **Selamat datang di Jejak.**
>
> **Lo bisa mulai dari email, nomor HP, nama, username, atau domain. Kalau bingung, coba cek data Lo sendiri dulu.**

CTA utama:
> **Cek data gue**

Sekunder:
> **Gue mau lihat-lihat dulu**

## 7.2 Pemeriksaan Pertama

Jika user memilih `Cek data gue`:
> arahkan ke flow pemeriksaan pertama yang ditanggung Jejak.

Copy:
> **Pemeriksaan pertama Lo kami tanggung. Biar Lo bisa lihat sendiri cara Jejak bekerja.**

Tidak perlu user memahami sistem kredit terlebih dulu.

## 7.3 Mode Dibantu

Tidak menjadi modal wajib.

Jejak dapat menawarkan setelah sinyal UX tertentu:
> **Mau Jejak bantu lebih banyak selama Lo pakai aplikasi?**

Pilihan:
- `Boleh, bantu gue`;
- `Nggak dulu`.

Mode Dibantu:
- helper copy lebih sering;
- istilah dijelaskan;
- CTA lebih deskriptif.

Tidak mengubah hak akses atau hasil.

---

# 8. BERANDA — V1 AKTIF

## 8.1 Tujuan

Beranda menjawab:
> **“Gue mau periksa sesuatu sekarang.”**

Bukan dashboard statistik.

## 8.2 Komposisi

1. greeting ringan bila perlu;
2. Search Console sebagai hero object;
3. shortcut tujuan;
4. `Lanjutkan Kasus` jika ada;
5. status pemeriksaan berjalan jika ada;
6. teaser Kabar penting bila relevan;
7. Mata Jejak.

## 8.3 Search Console

Placeholder:
> **Masukkan email, nomor HP, nama, username, atau domain**

Setelah input:
- deteksi tipe;
- tampilkan label deteksi;
- validasi lokal dulu;
- jangan langsung memanggil sumber mahal.

Contoh:
> **Nomor HP terdeteksi**

## 8.4 Shortcut

- **Cek data gue**
- **Cek sebelum transfer**
- **Bantu orang terdekat**
- **Lanjutkan Kasus terakhir**

Ikon berupa SVG Jejak, bukan emoji.

## 8.5 User Baru

Jika belum pernah scan:
> shortcut dan helper lebih prominent.

## 8.6 User Lama

Jika ada intent terakhir yang belum selesai:
> tawarkan `Lanjutkan`.

Jika top-up baru disetujui:
> tawarkan melanjutkan analisis yang sebelumnya tertahan.

## 8.7 Empty Tidak Relevan

Beranda tidak punya empty state generik. Ia selalu punya action.

---

# 9. SMART SEARCH COMPOSER — V1 AKTIF

## 9.1 Entry

Dari:
- Beranda;
- Periksa;
- tambah petunjuk di Kasus.

## 9.2 Deteksi Input

Jenis:
- Email;
- Nomor HP;
- Nama;
- Username;
- Domain.

Password **bukan** bagian universal search biasa; masuk dari Jejak Gue / fitur `Password ini pernah bocor?` agar user tidak salah memasukkan password sebagai identifier orang.

## 9.3 Ambiguous Input

Jika input bisa username/nama:
> minta user memilih interpretasi ringan.

Jangan memanggil AI hanya untuk menentukan tipe sederhana.

## 9.4 Validasi

Error:
> **Kayaknya formatnya belum pas.**
>
> **Coba cek lagi data yang Lo masukkan.**

Jangan hapus input.

## 9.5 Next Step

Setelah valid:
> buka **Tujuan Pemeriksaan**.

---

# 10. TUJUAN PEMERIKSAAN — V1 AKTIF

## 10.1 Tujuan

Mengambil intent tanpa terasa seperti formulir legal.

Pilihan:
1. **Cek data gue**
2. **Bantu orang terdekat**
3. **Cek dugaan penipuan**
4. **Riset informasi publik / Kasus**

Terminologi akhir boleh dipoles sesuai kamus UI, tetapi makna tidak berubah.

## 10.2 Bantu Orang Terdekat

Helper:
> **Cocok buat bantu orang tua, pasangan, saudara, teman, klien, atau orang yang kurang familiar dengan teknologi.**

Optional relation:
- Keluarga;
- Pasangan;
- Teman;
- Klien/orang yang gue bantu;
- Lainnya.

Tidak perlu KTP.

## 10.3 Fraud Check

Helper:
> **Gunakan buat menilai sinyal dari nomor, email, username, atau domain sebelum Lo percaya atau transaksi.**

## 10.4 Intent Tidak Menghapus Guardrail

Memilih `Cek data gue` tidak otomatis memberikan hak tanpa batas.

Risk engine boleh membandingkan pola penggunaan secara ringan.

---

# 11. PILIH KEDALAMAN PEMERIKSAAN — V1 AKTIF

## 11.1 Tampilan

Seluruh tier terlihat untuk semua user agar value jelas.

Contoh tier:
- **Cek Cepat**
- **Pemeriksaan Mendalam**
- **Analisis Gabungan**
- **Analisis Lanjutan** bila V1 tier ini diaktifkan sesuai ROADMAP.

Jangan gunakan gembok besar.

Gunakan:
- nama;
- ringkasan value;
- estimasi kredit;
- capability;
- indicator premium subtle.

## 11.2 Credit Preview

Contoh:
> **Analisis Gabungan · 7 Kredit**

Di bawah:
> **Yang bakal Jejak lakukan**
- bandingkan beberapa petunjuk;
- cari hubungan;
- cek ketidaksesuaian;
- susun graph;
- ringkas hasil.

Biaya final server authoritative.

## 11.3 Upgrade Selisih

Jika scan sebelumnya masih eligible:
> tampilkan **Naikkan analisis · +4 Kredit**

bukan charge penuh 7 lagi.

## 11.4 Saldo Kurang

Tampilkan:
> **Lo kurang 5 Kredit.**

Actions:
- `Tambah kredit`;
- `Pilih pemeriksaan lebih ringan`;
- `Batal`.

Simpan niat terakhir agar setelah top-up user kembali ke analisis yang ingin dijalankan.

---

# 12. KONFIRMASI PEMERIKSAAN — V1 AKTIF

## 12.1 Isi

- identifier/target ringkas;
- tujuan;
- tier;
- biaya;
- apa yang akan diperiksa;
- notice jika sumber tertentu optional;
- quote expiry jika harga/config berubah.

CTA:
> **Mulai · 7 Kredit**

## 12.2 Server Recheck

Saat CTA ditekan:
- saldo dicek ulang;
- entitlement dicek ulang;
- harga quote dicek;
- abuse/concurrency dicek;
- credit reserve dibuat atomik.

Frontend tidak menentukan hasil.

## 12.3 Price Changed

Jika quote berubah:
> **Harga analisis baru aja diperbarui. Sekarang 9 Kredit.**

Minta konfirmasi ulang.

## 12.4 Duplicate Tap

Feedback lokal pada tap pertama.

Request berikutnya tidak membuat scan baru.

---

# 13. PEMERIKSAAN BERJALAN — V1 AKTIF

## 13.1 Bukan Fake Percentage

Jika progress numerik tidak nyata, tampilkan tahap:
- **Menyiapkan pemeriksaan**
- **Memeriksa sumber**
- **Membandingkan temuan**
- **Memeriksa ketidaksesuaian**
- **Menyusun hasil**

## 13.2 User Boleh Pergi

CTA sekunder:
> **Lanjut pakai Jejak**

Scan menjadi indikator global.

Menutup PWA tidak membatalkan scan.

## 13.3 Partial Source Failure

Copy:
> **Satu sumber lagi nggak bisa dijangkau. Jejak tetap lanjut dengan bagian lain yang tersedia.**

## 13.4 Offline Setelah Start

UI:
> **Koneksi lagi kurang stabil. Pemeriksaan yang sudah dimulai tetap diproses.**

Saat online:
> sinkron status.

---

# 14. RESULT REVEAL — V1 AKTIF

## 14.1 Reveal

Setelah server benar-benar selesai:
> kartu ringkas muncul.

Contoh:
> **7 jejak ditemukan**
>
> **3 perlu perhatian**
>
> **2 perlu diverifikasi**
>
> **2 terlihat konsisten**

CTA:
> **Buka analisis**

Reveal cinematic pendek; bukan fake loading.

## 14.2 Haptic

Mobile jika tersedia:
> subtle.

Fallback:
> lighting/press/reveal tetap memberi feedback.

## 14.3 Result Partial

Jika minimum deliverable terpenuhi tapi beberapa source gagal:
> tampilkan **Kelengkapan Analisis**.

Jika minimum deliverable gagal:
> jangan reveal seolah hasil premium sukses;
> kredit direfund sesuai settlement engine.

---

# 15. RINGKASAN HASIL — V1 AKTIF

## 15.1 Hierarki

1. jawaban cepat;
2. skor yang relevan;
3. temuan utama;
4. yang belum jelas;
5. rekomendasi;
6. graph/timeline bila tersedia;
7. detail evidence.

## 15.2 Skor Dipisah

Jangan gabungkan:
- **Tingkat Kecocokan**
- **Paparan Digital**
- **Sinyal Risiko**
- **Kelengkapan Analisis**

Label selalu menjelaskan makna.

## 15.3 Risk Copy

Tidak:
> `91% PENIPU`.

Gunakan:
> **Sinyal Risiko: Tinggi**
>
> **Ada beberapa indikator yang sebaiknya Lo cek lebih lanjut.**

## 15.4 Counter Evidence

Area:
> **Yang mengurangi kecurigaan**

harus tampil bila ada.

Jejak bukan confirmation-bias machine.

---

# 16. PANEL “KENAPA?” — V1 AKTIF

Entry:
> `Kenapa hasil ini muncul?`

Isi:
- jumlah evidence mendukung;
- conflict;
- source category;
- confidence explanation;
- uncertainty.

Contoh:
> **Kami menemukan username yang sama pada beberapa sumber, tapi belum ada bukti langsung bahwa semuanya dipakai orang yang sama.**

User dapat membuka:
> **Lihat bukti pendukung**

---

# 17. MODE BUKTI — V1 UNTUK ELIGIBLE USER

## 17.1 Entry

Dari:
- hasil;
- Case;
- relationship detail;
- user Power/Mitra sesuai entitlement.

## 17.2 Isi Evidence Passport

Setiap item:
- ringkasan;
- sumber;
- ditemukan kapan;
- jenis evidence;
- target terkait;
- reliabilitas;
- apakah dapat diverifikasi ulang;
- contradiction jika ada.

Jenis:
- Fakta terverifikasi;
- Sinyal;
- Korelasi;
- Inferensi AI;
- Bukti dari pengguna.

## 17.3 AI Inferensi

Harus jelas:
> **Interpretasi AI**

Tidak dicampur visual dengan fakta primer.

---

# 18. FLOW DOMAIN — V1 AKTIF / PALING DIPOLISH

## 18.1 Hasil Dasar

Area potensial:
- identitas domain;
- status registrasi;
- registrar jika tersedia;
- tanggal relevan dengan wording hati-hati;
- nameserver;
- DNS;
- email-domain signals;
- public page evidence bila URL diketahui;
- contradiction.

## 18.2 Wording Umur

Jangan menyamakan:
> tanggal registrasi domain

dengan:
> umur bisnis/pemilik.

Jika ownership historical tidak diketahui, jelaskan ketidakpastian.

## 18.3 Domain Tidak Resolve

Tetap tampilkan RDAP jika ada.

Copy:
> **Domain ini saat ini nggak terlihat aktif di DNS. Data registrasinya masih bisa memberi beberapa petunjuk.**

## 18.4 Public Page

Jika halaman publik dapat diakses:
> tampilkan kontak/klaim yang relevan sebagai evidence.

Jika diblok:
> source unavailable; jangan bypass.

---

# 19. FLOW USERNAME — V1 AKTIF / DIPOLISH

## 19.1 Hasil

- presence signal;
- source/platform;
- display name bila publik;
- links publik relevan;
- hubungan dengan domain/evidence lain;
- confidence.

## 19.2 String Sama Bukan Orang Sama

Jika username sama di dua platform:
> tampilkan **Username sama**

bukan merge identity otomatis.

## 19.3 Public Presence Tidak Ditemukan

Copy:
> **Belum nemu jejak publik yang cukup. Bisa jadi username ini belum terindeks, berbeda di platform lain, atau memang jarang dipakai.**

Tidak:
> `Aman`.

---

# 20. FLOW NOMOR HP — V1 AKTIF

## 20.1 Hasil Dasar

- valid/tidak;
- region;
- format;
- jenis nomor jika available;
- public evidence yang ditemukan dari Case/page terkait.

## 20.2 Ownership

Jangan tampilkan pemilik kecuali evidence benar-benar mendukung.

## 20.3 Nomor Bisa Berganti Pemilik

Timeline/confidence mempertimbangkan waktu evidence.

Jika data lama dan baru bertentangan:
> **Ada perubahan identitas yang mungkin terjadi.**

---

# 21. FLOW EMAIL — V1 AKTIF

## 21.1 Hasil Dasar

- format;
- domain;
- DNS/MX;
- Case correlation;
- evidence publik relevan yang sudah ditemukan secara sah.

## 21.2 Breach Timeline

UI timeline siap, tetapi event breach hanya muncul jika provider yang sah benar-benar memberi data.

Jika belum:
> **Belum ada sumber yang cukup buat menyusun riwayat kebocoran lengkap.**

## 21.3 Jangan Klaim Coverage Palsu

Tidak:
> `Kami memeriksa 97 database`

kalau tidak benar.

---

# 22. FLOW NAMA — V1 AKTIF TAPI AMBIGUITY-FIRST

## 22.1 Nama Saja

Output awal:
> **Nama ini terlalu umum buat disimpulkan sendiri.**

CTA:
> **Tambah petunjuk**

Pilihan:
- nomor;
- email;
- username;
- domain.

## 22.2 Kandidat

Jika evidence Case menghasilkan kandidat:
> tampilkan beberapa kemungkinan, bukan satu orang pasti.

## 22.3 Power User

Boleh melihat kandidat lebih kaya sesuai evidence, tetapi probabilitas tetap tidak berubah menjadi fakta.

---

# 23. PASSWORD EXPOSURE — V1 AKTIF

## 23.1 Entry

Dari:
- Jejak Gue;
- Panduan keamanan;
- shortcut tertentu.

Label:
> **Password ini pernah bocor?**

## 23.2 Privacy Copy

Sebelum input:
> **Password Lo nggak disimpan Jejak dan nggak dikirim dalam bentuk aslinya ke layanan pemeriksaan.**

## 23.3 Result Found

> **Password ini pernah ditemukan dalam kumpulan kebocoran.**
>
> **Sebaiknya jangan dipakai lagi di akun mana pun.**

## 23.4 Result Not Found

> **Belum ditemukan dalam kumpulan yang diperiksa. Ini bukan jaminan password pasti aman.**

## 23.5 Never

Password asli:
- tidak masuk history;
- tidak masuk AI;
- tidak masuk log;
- tidak masuk database.

---

# 24. DAFTAR KASUS — V1 AKTIF

## 24.1 Entry

Navigation:
> **Kasus**

## 24.2 Empty

> **Belum ada Kasus.**
>
> **Kasus berguna kalau Lo punya beberapa petunjuk yang mau diperiksa bareng—misalnya nomor, username, dan domain dari seller yang sama.**

CTA:
> **Buat Kasus pertama**

## 24.3 Card

Minimal:
- nama Kasus;
- purpose/category;
- jumlah petunjuk;
- status;
- perubahan baru;
- last activity;
- secret indicator bila Rahasia.

## 24.4 Mobile

List internal scroll.

Tap:
> buka Case Workspace.

Swipe actions hanya shortcut; jangan wajib.

## 24.5 Desktop

List/table compact + preview optional.

Keyboard navigation boleh.

---

# 25. BUAT KASUS — V1 AKTIF

## 25.1 Fields

- nama Kasus;
- tujuan;
- mode normal/rahasia;
- petunjuk pertama optional jika flow berasal dari search.

Contoh nama otomatis boleh diusulkan:
> **Pemeriksaan Seller — 9 Agustus**

User tetap bisa edit.

## 25.2 Case Type

- diri sendiri;
- bantu orang terdekat;
- dugaan penipuan;
- riset publik;
- klien Mitra.

## 25.3 Secret Case

Toggle dengan penjelasan:
> **Sembunyikan detail sensitif dari preview dan notifikasi.**

---

# 26. CASE WORKSPACE — V1 AKTIF

## 26.1 Struktur Utama

Sub-area:
- **Ringkasan**
- **Petunjuk**
- **Temuan**
- **Peta Hubungan**
- **Timeline**
- **Ketidaksesuaian**
- **Catatan**
- **Laporan** sesuai entitlement/phase.

Jangan semuanya menjadi page baru.

## 26.2 Mobile

Satu workspace utama + segment/tab compact.

Detail node:
> bottom sheet.

## 26.3 Desktop

Graph/content center + detail side panel.

List evidence dapat hidup di side panel tanpa menutupi graph.

## 26.4 Case Header

- nama;
- secret status;
- last scan;
- kelengkapan;
- Kabar perubahan;
- `Tambah petunjuk`;
- `Periksa lagi`;
- `Bagikan ringkasan aman`.

## 26.5 Unknown State

Area:
> **Yang masih belum jelas**

Contoh:
> **Belum ada bukti kuat bahwa email dan nomor ini dipakai entitas yang sama.**

CTA:
> **Tambah petunjuk**

---

# 27. TAMBAH PETUNJUK KE KASUS — V1 AKTIF

## 27.1 Input

Universal input + type detection.

## 27.2 Duplicate

Jika petunjuk sudah ada:
> jangan buat node duplicate.

Copy:
> **Petunjuk ini sudah ada di Kasus.**

## 27.3 Relationship Suggestion

Setelah ditambahkan:
> jangan auto-merge.

Engine boleh membuat:
> **Usulan hubungan**

---

# 28. RELATIONSHIP GRAPH — V1 AKTIF

## 28.1 Node Types

Contoh:
- nama/identity;
- email;
- phone;
- username;
- domain;
- public account;
- breach event jika provider tersedia;
- evidence/manual evidence;
- business entity.

## 28.2 Relationship Types

- **Terhubung langsung**
- **Kemungkinan terhubung**
- **Kesamaan pola**
- **Bertentangan**

Visual sesuai DESIGN_SYSTEM.

## 28.3 Focus Mode

Default:
> target utama + hubungan penting.

Tap node:
> fokus node;
> node tidak relevan meredup;
> related neighborhood muncul.

## 28.4 Large Graph

Jangan render ratusan node full detail.

Gunakan cluster:
> **+27 jejak terkait**

Expand atas tindakan user.

## 28.5 Free/Premium

Free:
> struktur dasar + node lanjutan berupa siluet.

Copy:
> **3 hubungan lain belum dianalisis**

Premium:
> layer penuh sesuai entitlement.

## 28.6 Mobile

- pinch/drag jika renderer mendukung;
- tap node;
- bottom detail;
- controls tidak menutup graph;
- fallback 2D/2.5D.

## 28.7 Desktop

- hover preview;
- click select;
- right-click optional shortcut;
- detail actions tetap dapat ditemukan via visible panel.

---

# 29. DETAIL NODE — V1 AKTIF

Isi:
- identifier type;
- sanitized display;
- current confidence;
- source count;
- relation summary;
- `Kenapa?`;
- `Lihat bukti`;
- `Tanya Jejak`;
- `Tambah catatan`;
- `Fokuskan peta`.

Jika sensitive:
> masking sesuai role/context.

---

# 30. USULAN MERGE NODE — V1 AKTIF

## 30.1 Trigger

AI/engine menduga dua entitas sama.

UI:
> **Kemungkinan entitas yang sama**

Actions:
- **Gabungkan sementara**
- **Tetap pisah**
- **Lihat alasannya**

## 30.2 Merge Reversible

Merge bukan penghancuran evidence asli.

Jika evidence berubah:
> dapat dipisah lagi.

## 30.3 AI Tidak Boleh Auto-Merge Permanen

Mutlak.

---

# 31. TIMELINE — V1 AKTIF SEBAGAI KOMPONEN

## 31.1 Isi

Event dari evidence dengan timestamp.

Event tanpa kepastian waktu:
> ditandai approximate/uncertain.

## 31.2 Interaction

Tap tahun/event:
> graph dapat menyesuaikan temporal view bila tersedia.

## 31.3 Empty

> **Belum cukup data waktu buat menyusun timeline yang berguna.**

Jangan membuat event AI karangan.

---

# 32. JEJAK PERUBAHAN — V1 FONDASI / V1.5 AKTIF

Kategori:
- **Baru**
- **Menghilang**
- **Lebih kuat**
- **Lebih lemah**
- **Bertentangan**

Entry:
> `Apa yang berubah sejak terakhir?`

V1 harus menyimpan snapshot/struktur yang memungkinkan fitur ini tanpa redesign data model.

---

# 33. HIPOTESIS — V1 FONDASI / V1.5

Power user dapat membuat:
> **Nomor A dan akun B kemungkinan dikendalikan entitas yang sama.**

Panel:
- evidence mendukung;
- evidence bertentangan;
- unknown;
- confidence;
- `Tantang hipotesis`.

Jangan aktifkan penuh sebelum ROADMAP mengizinkan.

---

# 34. BUKTI MANUAL USER — V1 AKTIF

## 34.1 Entry

Case → `Tambah bukti`

Types:
- screenshot chat;
- screenshot profil;
- gambar lain;
- catatan teks.

## 34.2 Label

Selalu:
> **Bukti dari pengguna**

Bukan fakta publik.

## 34.3 Upload

- preview;
- optimize;
- metadata strip;
- progress;
- private storage;
- case permission inherited.

## 34.4 AI

AI hanya membaca attachment jika user meminta analisis dan policy provider/context memperbolehkan.

---

# 35. KETIDAKSESUAIAN — V1 AKTIF

Area dedicated:
> **Yang nggak cocok**

Contoh:
- domain baru vs klaim bisnis lama;
- nomor website berbeda;
- lokasi berbeda;
- timestamp conflict.

Setiap contradiction punya:
- dua evidence;
- sumber;
- confidence;
- `Kenapa ini penting?`

Tidak otomatis menaikkan risk tanpa rule yang relevan.

---

# 36. BAGIKAN RINGKASAN AMAN — V1 AKTIF

## 36.1 Entry

Case/result:
> **Bagikan ringkasan aman**

## 36.2 Preview Wajib

Sebelum share:
- risk label;
- jumlah signal;
- data sensitif dimasking;
- Scan/Case public-safe reference;
- brand Jejak;
- disclaimer singkat.

## 36.3 No Raw Case

Safe Share adalah artefak tersanitasi, bukan URL Case asli.

## 36.4 Share Target

Native share sheet jika tersedia.

Fallback:
> salin tautan / simpan kartu sesuai kemampuan platform.

---

# 37. BAGIKAN KASUS — V1 FONDASI / V1.5

Collaboration roles:
- Pemilik;
- Kontributor;
- Pengamat.

Invitation:
> user harus login.

V1 data model/permission siap, UI penuh ditahan hingga V1.5.

---

# 38. JEJAK GUE — V1 AKTIF

## 38.1 Tujuan

Bukan halaman profile.

Ini pusat keamanan digital pribadi.

## 38.2 Komposisi

- **Paparan Digital Lo**
- hal yang perlu perhatian;
- hal yang sudah ditangani;
- timeline exposure jika ada source;
- password exposure shortcut;
- tindakan yang disarankan;
- pantauan jika nanti aktif.

## 38.3 Action

Contoh:
> **Yang bisa Lo lakukan sekarang**

- ganti password;
- aktifkan MFA;
- periksa akun terkait;
- tandai sudah ditangani.

## 38.4 Completion

User dapat:
> **Tandai sudah gue amankan**

Ini status user-action, bukan menghapus fakta evidence.

---

# 39. DOMPET KREDIT — V1 AKTIF

## 39.1 Entry

Tap saldo global.

## 39.2 Isi

- saldo aktif;
- reserved;
- kredit yang mendekati expiry;
- history ledger user-facing;
- `Tambah kredit`;
- voucher/referral entry;
- top-up pending.

## 39.3 Expiry

Copy:
> **5 Kredit akan berakhir lebih dulu pada 20 September.**

Tidak menyembunyikan masa aktif.

## 39.4 Zero Credit

> **Lo masih bisa pakai beberapa fitur dasar. Kalau butuh analisis lebih dalam, tambah kredit kapan aja.**

CTA:
> **Lihat pilihan kredit**

---

# 40. PILIH PAKET — V1 AKTIF

## 40.1 Seed Positioning

Paket awal secara arah:
- Mulai;
- Proteksi;
- Lanjutan;
- Power;
- Mitra terpisah.

Nominal seed PRD:
- kisaran Rp19K;
- Rp49K;
- Rp89K;
- Rp149K;
- Mitra volume.

Angka final configurable, bukan hardcode.

## 40.2 Proteksi

Visual:
> **Pilihan paling masuk akal**

Bukan badge norak.

## 40.3 Value Preview

Contoh:
> **Kurang lebih cukup untuk 10 Pemeriksaan Mendalam atau 4 Analisis Gabungan, tergantung penggunaan.**

## 40.4 Masa Aktif

Selalu visible:
> **Aktif 120 hari**

---

# 41. CHECKOUT TOP-UP — V1 AKTIF

## 41.1 Isi

- paket;
- kredit;
- bonus;
- expiry;
- harga;
- kode unik;
- total transfer;
- metode pembayaran snapshot.

## 41.2 Rekening

Display:
- jenis/bank;
- nomor;
- a.n.;
- instruction.

Actions:
- **Salin rekening**
- **Salin nominal**

Feedback:
> **Nomor rekening sudah disalin.**

## 41.3 Snapshot

Order mengunci detail payment method saat dibuat.

Perubahan admin setelah order tidak mengubah instruksi order lama.

---

# 42. UPLOAD BUKTI TOP-UP — V1 AKTIF

## 42.1 User Action

> **Kirim bukti pembayaran**

Upload normal; user tidak disuruh kompres manual.

## 42.2 Processing

> **Menyiapkan bukti pembayaran…**

Target hasil pembayaran:
> maksimal sekitar 75 KB bila tetap terbaca.

## 42.3 Success

> **Bukti sudah kami terima. Lagi kami cocokkan. Kredit belum masuk sampai pembayaran disetujui.**

## 42.4 Blur/Unreadable

Admin dapat meminta bukti baru.

User:
> **Buktinya sudah masuk, tapi beberapa bagian masih susah dibaca. Kirim screenshot yang lebih jelas ya.**

---

# 43. STATUS TOP-UP — V1 AKTIF

Status user-facing:
1. **Menunggu bukti**
2. **Sedang dicek**
3. **Perlu bukti baru**
4. **Disetujui**
5. **Ditolak**

Setiap status punya:
- penjelasan;
- next action;
- `Kenapa?` bila ditolak/perlu bukti.

## 43.1 Approved Moment

Realtime bila tersedia:
- saldo bertambah;
- subtle glow/haptic;
- copy:
> **Kredit Lo sudah masuk.**

Jika ada niat terakhir:
> **Lanjutkan Analisis Gabungan**

---

# 44. KABAR JEJAK — V1 AKTIF

## 44.1 Categories

- Informasi;
- Penting;
- Perlu perhatian;
- Mendesak.

## 44.2 Examples

- pembayaran approved;
- scan selesai;
- refund;
- update PWA;
- perubahan Case (V1.5);
- kredit hampir berakhir.

## 44.3 Secret Case

Notification:
> **Ada perubahan di satu Kasus Rahasia.**

Jangan bocorkan nama/identifier.

## 44.4 Read vs Done

User notification informational boleh ditandai baca.

Owner Inbox berbeda: item action tidak selesai hanya karena dibaca.

---

# 45. PANDUAN JEJAK — V1 AKTIF

## 45.1 Entry

- Mata Jejak free;
- help icon;
- Akun.

## 45.2 Categories

- Mulai dari sini;
- Cara cek data sendiri;
- Takut kena tipu?;
- Bantu keluarga;
- Cara membaca hasil;
- Cara bikin Kasus;
- Kredit & top-up;
- Privasi;
- PWA;
- Error/troubleshooting ringan.

## 45.3 Contextual

Jika dibuka dari Risk Score:
> langsung buka artikel penjelasan skor.

Jangan lempar user ke home bantuan.

---

# 46. ASISTEN AI USER — V1 BASIC / PREMIUM

## 46.1 Free

Label:
> **Panduan Jejak**

Bisa menjawab hal rule-based:
- arti skor;
- cara baca hasil;
- fungsi Case;
- kredit;
- langkah keamanan umum.

Jangan berpura-pura memakai AI kalau jawabannya template.

## 46.2 Eligible Premium

Label:
> **Asisten AI Jejak**

Context-aware:
- Case aktif;
- node aktif;
- evidence relevant;
- result aktif.

Quick prompts:
- **Kenapa ini dianggap terhubung?**
- **Apa yang bikin hasil ini belum pasti?**
- **Ada yang janggal?**
- **Jelasin lebih gampang**
- **Apa langkah berikutnya?**

## 46.3 Additional Work

Jika pertanyaan butuh source baru:
> **Pertanyaan ini butuh pemeriksaan tambahan.**

Tampilkan biaya dan minta konfirmasi.

AI tidak boleh diam-diam membakar kredit.

## 46.4 Failure

> **Analisis AI belum berhasil disusun. Bukti utama tetap bisa Lo lihat di bawah.**

---

# 47. TANTANG KESIMPULAN — V1.5 / ELIGIBLE

Entry:
> **Tantang analisis Jejak**

AI:
> mencari alasan kesimpulan bisa salah.

Output:
- alternatif penjelasan;
- evidence conflict;
- unknown;
- what-would-change-my-mind.

Tidak mengubah graph fact otomatis.

---

# 48. SIMULASI SKENARIO — V1.5

Example:
> **Kalau domain ini ternyata baru dibeli orang lain, apa yang berubah?**

Result label:
> **Simulasi, bukan temuan baru.**

Tidak masuk Evidence Passport sebagai fakta.

---

# 49. AKUN & PENGATURAN — V1 AKTIF

Entry:
> avatar/profile control.

Isi:
- akun Google;
- appearance jika ada;
- Mode Dibantu;
- PWA;
- notifikasi;
- Data & Privasi;
- diagnosis;
- partner shortcuts jika eligible;
- logout.

Jangan menjadi navigation utama.

---

# 50. PASANG JEJAK — V1 AKTIF

## 50.1 Chromium/Brave

Jika install prompt available:
> button **Pasang Jejak**

gunakan browser install flow.

## 50.2 iOS/Safari

Jika custom prompt tidak tersedia:
> instruksi device-specific singkat.

Jangan menampilkan button palsu yang tidak bekerja.

## 50.3 Already Installed

Copy:
> **Jejak sudah terpasang di perangkat ini.**

---

# 51. VERSION SENTINEL — V1 AKTIF

## 51.1 Update Ready

> **Jejak baru aja diperbarui.**
>
> **Ada versi yang lebih baru dan siap dipakai.**

CTA:
> **Gunakan versi terbaru**

## 51.2 Critical Update

> **Pembaruan penting tersedia. Jejak perlu diperbarui dulu sebelum bagian ini dipakai.**

CTA:
> **Perbarui Jejak**

## 51.3 Restore Intent

Setelah update:
> kembali ke workspace/Case sedekat mungkin dengan posisi sebelumnya.

---

# 52. DIAGNOSIS — V1 AKTIF

Akun → Tentang/Diagnosis.

Display:
- versi Jejak;
- browser;
- PWA/browser mode;
- motion mode;
- connection;
- last sync;
- client compatibility;
- kode build.

Action:
> **Salin info diagnosis**

Tidak menampilkan token/secret.

---

# 53. DATA & PRIVASI — V1 AKTIF

Sections:
- **Apa yang Jejak simpan?**
- **Kasus & bukti gue**
- **Jejak Akses**
- **Ekspor data gue** (V1 foundation/optional UI)
- **Hapus data**
- **Hapus akun**

Copy non-legalese.

Legal terms tetap link terpisah.

---

# 54. HAPUS KASUS — V1 AKTIF

Preview:
> **Yang akan dihapus**
- isi Kasus;
- graph;
- catatan;
- attachment;
- analysis case-only.

> **Yang tetap tercatat**
- ledger kredit;
- audit minimum yang diperlukan.

Normal Case:
> masuk Tempat Sampah ±3 hari.

Secret Case:
> opsi **Hapus permanen sekarang**.

---

# 55. TEMPAT SAMPAH — V1 AKTIF

Internal area Data & Privasi.

Item:
- nama Case;
- waktu final deletion;
- `Pulihkan`;
- `Hapus sekarang`.

Tidak menjadi tempat penyimpanan 30 hari.

---

# 56. HAPUS AKUN — V1 AKTIF

Preview konsekuensi:
- Case personal dihapus;
- attachment diproses hapus;
- monitoring berhenti;
- partner access dicabut;
- sessions dihentikan;
- kredit aktif ikut berakhir setelah final deletion.

Jika kredit:
> **Lo masih punya 27 Kredit. Kalau akun dihapus, kredit ini ikut berakhir.**

User bebas lanjut.

Jika partner/workspace obligation:
> jelaskan action yang harus dibereskan sebelum final deletion bila memang shared ownership/financial obligation.

---

# 57. AFFILIATE AREA — V1 FOUNDATION + BASIC UI

Entry hanya jika entitlement Affiliate.

Isi dasar:
- kode/link;
- klik;
- signup;
- top-up approved;
- komisi menunggu;
- komisi valid;
- komisi dibayar;
- campaign terms.

Tidak melihat data pribadi referral di luar yang diperlukan.

---

# 58. RESELLER AREA — V1 FOUNDATION

Saldo terpisah:
- Kredit Pribadi;
- Saldo Distribusi.

Actions sesuai entitlement:
- lihat saldo distribusi;
- voucher;
- redemption;
- purchase history.

Reseller tidak dapat menciptakan kredit tanpa saldo sumber.

UI penuh dapat mengikuti ROADMAP.

---

# 59. MITRA AREA — V1 FOUNDATION / BASIC UI

## 59.1 Entry

Jika Mitra approved:
> **Area Mitra**

## 59.2 V1

Minimal:
- Workspace Klien foundation;
- daftar klien;
- Case terkait;
- kredit;
- status partner.

## 59.3 Client

Nama + catatan internal.

Tidak wajib KTP.

## 59.4 Team

Data model permission siap V1.

UI anggota tim penuh:
> V1.5.

---

# 60. MASUK RUANG KENDALI — V1 AKTIF UNTUK OWNER

Owner login lewat Google yang sama.

Default:
> User Mode.

Entry hidden/elegant boleh melalui Mata/brand interaction yang mudah ditemukan Owner.

Tetapi security:
> route/permission server-side.

Jika user biasa menemukan route:
> ditolak.

UI Easter Egg bukan authentication.

---

# 61. RUANG KENDALI — APP SHELL

## 61.1 Header

- Jejak / Ruang Kendali;
- role;
- status sistem;
- Owner Inbox;
- NADI;
- `Kembali sebagai Pengguna`.

## 61.2 Desktop

Sidebar:
- Ringkasan;
- Pembayaran;
- Pengguna;
- Partner;
- Bisnis;
- Sistem;
- Analitik;
- NADI.

## 61.3 Mobile

Navigation dipadatkan:
- primary admin areas accessible via compact rail/menu;
- action penting pembayaran reachable one-hand;
- tidak ada fitur hilang.

---

# 62. ADMIN RINGKASAN — V1 AKTIF

Pertanyaan:
> **Apa yang perlu gue urus sekarang?**

Cards:
- pembayaran menunggu;
- pembayaran perlu perhatian;
- source bermasalah;
- scan refund;
- partner flagged;
- pending Mitra;
- revenue hari ini;
- system health.

NADI briefing:
> 3 hal terpenting.

Jangan taruh 20 chart di sini.

---

# 63. OWNER INBOX — V1 AKTIF

Priority:
1. **Perlu Lo urus**
2. **Penting**
3. **Info**

Contoh:
- payment pending;
- Mitra application;
- partner flagged;
- critical error;
- source down;
- version issue;
- user report.

Actionable item tidak selesai hanya karena dibuka.

Actions:
- buka item;
- tandai selesai;
- snooze/hold bila masuk akal;
- route ke workspace terkait.

---

# 64. ADMIN PEMBAYARAN — V1 AKTIF

## 64.1 Desktop

Two-pane:
- queue kiri;
- order detail kanan.

## 64.2 Mobile

List → detail full workspace/bottom action area.

## 64.3 Order Detail

- order ID;
- user;
- paket;
- expected total;
- credit;
- created;
- screenshot;
- Payment Sentinel result;
- duplicate signal;
- payment method snapshot;
- audit.

Actions:
- **Setujui pembayaran**
- **Minta bukti baru**
- **Tolak**

## 64.4 Approve Mobile

Gesture/friction ringan agar tidak salah tap.

Desktop:
> confirm biasa.

## 64.5 Double Approval

Jika sudah approved:
> action hilang.

Admin kedua:
> **Pembayaran ini sudah disetujui beberapa detik lalu.**

## 64.6 AI Override

Jika sentinel warning tapi Owner yakin mutasi masuk:
> Owner boleh approve.

Audit:
> manual override + alasan.

---

# 65. ADMIN PENGGUNA — V1 AKTIF

## 65.1 Search

- nama;
- email;
- user ID.

## 65.2 Detail Tabs/Panels

- Akun;
- Dompet;
- Aktivitas;
- Akses;
- Audit;
- Partner info.

## 65.3 Actions

- tambah kredit;
- koreksi kredit;
- pause user;
- unblock;
- assign/cabut role;
- reset abuse flag;
- lihat error related.

## 65.4 Credit Adjustment

Preview:
> saldo sekarang;
> perubahan;
> saldo sesudah.

Large adjustment:
> stronger confirmation.

Tidak pernah edit ledger history.

---

# 66. ADMIN ROLE & ACCESS — V1 AKTIF

Role:
- Owner;
- Admin;
- Finance;
- Support;
- Mitra;
- Reseller;
- Affiliate;
- User.

Satu akun dapat beberapa entitlement.

Support default:
> identifier dimasking.

Reveal sensitif:
> permission khusus + audit.

Finance:
> payment data, bukan Case investigation.

Admin:
> tidak dapat mengambil alih Owner.

---

# 67. PERMISSION SIMULATOR — V1 AKTIF UNTUK OWNER

Entry:
> Pengguna/Ruang Kendali → **Pratinjau sebagai…**

Options:
- User Gratis;
- Power;
- Mitra;
- Finance;
- Support;
- Admin.

Ini preview UI/permission model, bukan impersonation identity sungguhan.

Banner jelas:
> **Mode Pratinjau — tidak ada tindakan nyata.**

Agent tetap harus menyediakan test account nyata untuk RLS QA.

---

# 68. ADMIN PARTNER — V1 BASIC

Internal tabs:
- Affiliate;
- Reseller;
- Mitra.

Actions:
- approve;
- pause;
- restore;
- update rate;
- inspect health;
- view reward ledger.

Partner freeze:
> tidak otomatis memblokir user account.

---

# 69. PENGAJUAN MITRA — V1 AKTIF BASIC

Owner queue:
- applicant;
- account age/use;
- optional reason;
- risk signals;
- approve/reject.

No KTP requirement by default.

Approved:
> entitlement Mitra aktif.

---

# 70. BISNIS — HUB — V1 AKTIF

Sections:
- Harga & Kredit;
- Metode Pembayaran;
- Referral & Kampanye;
- Voucher;
- Pengaturan Bisnis;
- lifecycle payment proof;
- expiry/grace;
- partner commission settings.

Tidak perlu developer untuk perubahan bisnis normal.

---

# 71. HARGA & KREDIT ADMIN — V1 AKTIF

Admin dapat mengatur:
- paket;
- harga;
- kredit;
- bonus;
- masa aktif;
- grace period;
- biaya scan;
- AI add-on;
- eligible extension;
- display order;
- active/inactive.

Setiap config:
> versioned/audited.

## 71.1 Concurrent Edit

Jika config berubah dari device lain:
> **Pengaturan ini baru saja berubah di perangkat lain. Muat versi terbaru dulu.**

Jangan silent overwrite.

---

# 72. METODE PEMBAYARAN ADMIN — V1 AKTIF

Fields:
- nama metode;
- bank/jenis;
- nomor rekening;
- nama pemilik;
- instruksi;
- aktif/nonaktif;
- utama;
- urutan.

Preview:
> **Yang akan dilihat user**

Save confirmation untuk perubahan rekening.

Jika menonaktifkan metode dengan pending orders:
> **Ada 8 order aktif yang masih memakai rekening ini. Order lama tetap menggunakan detail sebelumnya.**

---

# 73. CAMPAIGN & REFERRAL ADMIN — V1 BASIC

Fields:
- nama;
- code;
- type;
- start/end;
- user target;
- benefit;
- usage cap;
- minimum top-up;
- partner;
- commission;
- active/pause.

Analytics basic:
- uses;
- approved top-ups;
- revenue;
- bonus cost.

---

# 74. SOURCE REGISTRY ADMIN — V1 AKTIF

Setiap source:
- nama;
- kategori;
- status;
- Gratis/Berbayar;
- license note;
- priority;
- health;
- usage;
- error;
- timeout;
- budget;
- active/experimental.

Actions:
- aktifkan;
- nonaktifkan;
- Experimental Owner-only;
- ubah priority.

Source baru eksperimental:
> tidak ikut skor utama sampai promoted.

---

# 75. SYSTEM HEALTH — V1 AKTIF

Human-first:
> **Jejak sehat**

atau:
> **Ada 1 bagian yang perlu perhatian**

Nodes:
- Database;
- Auth;
- Realtime;
- RDAP;
- DNS;
- Gemini;
- Groq;
- Storage;
- PWA update.

Technical detail collapsible.

---

# 76. SYSTEM MAP — V1 AKTIF RINGAN

Visual:
```text
USER
 │
VERCEL
 │
JEJAK ENGINE
 ├── SUPABASE
 ├── SOURCE
 ├── GEMINI
 └── GROQ
```

Node status:
- normal;
- lambat;
- gagal;
- disabled;
- maintenance.

Tap:
> detail health.

Bukan dekorasi hacker.

---

# 77. MODE PERAWATAN — V1 AKTIF

Independent toggles:
- Pemeriksaan baru;
- AI;
- Top-up;
- Upload;
- Pantauan;
- fitur lain yang relevant.

User copy:
> **Jejak lagi beresin beberapa bagian. Data Lo tetap aman. Beberapa fitur sementara belum tersedia.**

Jangan matikan seluruh app bila hanya satu subsystem bermasalah.

---

# 78. PROTEKSI DARURAT — V1 AKTIF

Owner control:
> **Proteksi Darurat**

Effect conceptual:
- stricter rate;
- AI heavy operation conservative/pause;
- expensive OSINT limits;
- anonymous/demo already local;
- normal users tetap bisa membaca safe owned data.

UI harus menunjukkan:
- status aktif;
- kapan diaktifkan;
- siapa;
- dampak.

---

# 79. FEATURE FLAGS — V1 AKTIF

Audience:
- Owner only;
- test accounts;
- Mitra;
- Power;
- percentage;
- all.

Critical flags checked server + UI.

Owner canary first.

---

# 80. PUSAT MASALAH — V1 AKTIF

List:

### Sedang terjadi
- issue;
- impact;
- affected users;
- start;
- status.

### Sudah pulih
- duration;
- fallback;
- resolution.

Entry detail:
- error code group;
- browsers;
- version;
- operation;
- technical detail.

---

# 81. SECURITY EVENT CENTER — V1 AKTIF

Human copy:
- **Percobaan akses Kasus tanpa izin**
- **Pola pemeriksaan tidak biasa**
- **Provider requests meningkat tajam**
- **Upload ditolak**

Detail:
- count;
- blocked/allowed;
- user/account if relevant;
- action;
- audit.

Do not claim no data leaked unless evidence supports.

---

# 82. STORAGE HEALTH — V1 AKTIF BASIC

Metrics:
- total usage;
- payment proof pending deletion;
- Case attachments;
- cleanup queue;
- orphan;
- upload compression;
- largest usage account/workspace.

NADI can summarize.

---

# 83. PERFORMANCE PANEL — V1 AKTIF BASIC

Human labels:
- Buka awal;
- Pindah menu;
- Buka Kasus;
- Graph;
- Upload;
- Scan.

State:
- Bagus;
- Mulai lambat;
- Bermasalah.

Expand:
> developer metrics.

Browser segmentation:
- Brave Android;
- Brave Desktop;
- Chrome;
- Safari;
- PWA;
- etc.

---

# 84. PWA VERSION ADOPTION — V1 AKTIF

Display:
- latest version;
- adoption %;
- old versions;
- minimum allowed version;
- update failure signals.

Owner may set minimum supported version for critical changes.

---

# 85. ANALITIK — V1 AKTIF BASIC

Sections:
- Pendapatan;
- Funnel;
- Kredit;
- Pemeriksaan;
- Premium conversion;
- Partner;
- Retention;
- Error;
- Browser/PWA.

Charts only when actionable.

Always provide:
- current value;
- comparison period;
- context.

No chart wallpaper.

---

# 86. FUNNEL ADMIN — V1 AKTIF

Core:
```text
Login
  ↓
Pemeriksaan pertama
  ↓
Lihat hasil
  ↓
Klik fitur premium
  ↓
Buka top-up
  ↓
Upload bukti
  ↓
Disetujui
```

Show:
- conversion each step;
- largest drop;
- trend.

NADI uses aggregated data.

---

# 87. NADI — V1 BASIC / BERKEMBANG

## 87.1 Presence

Small persistent admin assistant.

Brief:
> **Ada 3 hal yang menurut gue perlu Lo lihat.**

## 87.2 Capabilities

- summarize business;
- summarize errors;
- payment queue summary;
- source health;
- partner health;
- product funnel;
- suggest priorities;
- navigate to relevant admin section.

## 87.3 Draft Action

Owner:
> “Kasih Andi 50 kredit kompensasi.”

NADI may prepare:
- target;
- +50;
- reason.

Owner:
> **Konfirmasi**

NADI tidak execute financial/destructive actions itself.

## 87.4 Uncertainty

> **Gue belum punya cukup data buat nyimpulin itu.**

Required when needed.

---

# 88. PERINTAH CEPAT OWNER — V1 AKTIF RINGAN

Entry:
- shortcut desktop;
- icon mobile.

Input:
> **Mau ngapain?**

Examples:
- cari user amin;
- lihat pembayaran pending;
- ubah rekening;
- buat kode referral;
- cek error hari ini.

Primarily navigation/search.

No silent mutation.

---

# 89. ERROR USER — GLOBAL

## 89.1 Generic

> **Ada yang belum beres. Data Lo aman dan kredit belum dipotong. Coba lagi.**

Only say `kredit belum dipotong` if engine truly confirms that.

## 89.2 Error Code

> **Kode: JX-7K2P**

Action:
> **Laporkan masalah ini**

Auto-attach safe diagnostics.

## 89.3 Source Failure

> **Satu sumber lagi nggak bisa dijangkau. Jejak tetap lanjut dengan bagian lain yang tersedia.**

## 89.4 Permission

> **Bagian ini nggak tersedia buat akun Lo.**

Do not reveal existence of another user's object.

---

# 90. LAPORKAN MASALAH — V1 AKTIF

Entry from error.

Auto include:
- error code;
- app version;
- browser/device safe info;
- workspace;
- timestamp;
- operation.

User field:
> **Ceritain singkat apa yang Lo lakukan sebelum ini terjadi.**

Do not auto attach:
- full Case;
- secret;
- screenshot;
- token.

---

# 91. OFFLINE / KONEKSI BURUK — GLOBAL

Banner subtle:
> **Koneksi lagi kurang stabil. Data terbaru akan disinkronkan otomatis.**

Allowed:
- navigate warm app;
- read safe cached summaries;
- see old result if policy allows.

Blocked/needs online:
- start paid scan;
- top-up settlement;
- sensitive fresh fetch;
- admin mutations.

---

# 92. AI SEMUA MATI — GLOBAL

Jejak core tetap usable.

AI UI:
> **Analisis AI sementara belum tersedia. Bukti dan hasil utama tetap bisa Lo akses.**

Do not maintenance entire app.

---

# 93. REALTIME MATI — GLOBAL

Fallback:
- periodic sync;
- `Segarkan`.

UI should not show fatal error unless action needs fresh status.

---

# 94. MOTION FALLBACK — GLOBAL

If reduced motion/device heavy/WebGL fails:
- keep micro-feedback;
- use 2D/2.5D;
- no static/dead interaction;
- no content hidden waiting on animation completion.

User does not need popup saying `mode ringan`.

---

# 95. PANEL STACK RULE

Maximum conceptual stack:
1. workspace;
2. drawer/sheet;
3. critical confirm.

Do not create:
> modal di atas modal di atas modal.

If new panel needed:
> replace current secondary layer or navigate within sheet.

Back closes top layer first.

---

# 96. MOBILE KEYBOARD RULE

When keyboard appears:
- primary form remains visible;
- CTA not permanently hidden;
- safe-area respected;
- bottom navigation may adapt/hide if needed;
- input state never lost.

Critical for:
- Search;
- Case notes;
- AI question;
- referral;
- admin search.

---

# 97. DEEP LINK RULE

Useful deep links:
- Case;
- safe share;
- admin payment item for authorized staff;
- Kabar item;
- error/incident internal.

Unauthenticated:
> login then resume intended safe destination.

Unauthorized:
> deny without leaking object content.

---

# 98. BACK STACK EXAMPLES

## 98.1 User

```text
Beranda
→ Kasus
→ Toko ABC
→ Node @seller
→ Bukti #3
```

Back:
```text
Bukti #3
→ Node @seller
→ Toko ABC
→ Kasus
→ Beranda
```

## 98.2 Top-up

```text
Result
→ Dompet
→ Paket
→ Checkout
→ Upload
```

Jika user closes Dompet mid-checkout:
> order draft/pending remains if already created.

Return:
> resume top-up status.

## 98.3 Admin

```text
Ringkasan
→ Pembayaran
→ PAY-X
→ Bukti
```

Back closes proof preview before leaving order.

---

# 99. REFRESH EXAMPLES

## 99.1 Case

`Segarkan`:
- current Case data;
- scan status;
- evidence updates;
- permission;
- version.

Do not rebuild app shell.

## 99.2 Payment

User:
- fetch status.

Admin:
- fetch current order state before approval.

## 99.3 Owner Config

Refresh should warn if local unsaved changes exist.

---

# 100. REALTIME SUBSCRIPTION MAP

Use realtime only where valuable.

## 100.1 User

Global:
- credit balance;
- payment status;
- running scan summary;
- Kabar critical.

Contextual when Case open:
- Case scan completion;
- collaboration later.

## 100.2 Admin

Ruang Kendali:
- pending payment count;
- critical Owner Inbox;
- health alerts.

Pembayaran workspace:
- payment queue updates.

Do not subscribe every table globally.

---

# 101. DATA PREFETCH MAP

## 101.1 Beranda Active

Warm:
- Periksa shell;
- Kasus list summary.

Do not warm:
- Admin analytics;
- heavy graph library unless likely.

## 101.2 Kasus List Active

Warm:
- selected/recent Case metadata.

Heavy graph:
> load when Case workspace/graph needed.

## 101.3 Payment Admin

Warm:
- next few payment summaries;
- do not preload every proof image.

---

# 102. SCREEN-LEVEL PERMISSION SUMMARY

## 102.1 User

Can:
- own profile;
- own wallet;
- own Cases;
- invited Cases;
- own payment;
- own notifications.

Cannot:
- another user data;
- admin configs;
- partner data not theirs.

## 102.2 Affiliate

User permissions +
- own referral dashboard;
- own commissions.

## 102.3 Reseller

User permissions +
- own distribution pool/vouchers.

## 102.4 Mitra

User permissions +
- own workspace/client Cases according to role.

## 102.5 Support

Admin support UI with masking.

No unrestricted payment proof/Case reveal by default.

## 102.6 Finance

Payment operational access.

No Case investigation by default.

## 102.7 Admin

Configured admin capabilities.

Cannot take over/remove Owner.

## 102.8 Owner

Highest product access.

Still uses audited actions.

---

# 103. SECRET CASE UI RULES

Where detail must be hidden:
- Case list preview;
- Kabar;
- recent activity;
- PWA notification;
- share preview;
- potentially app-switcher sensitive view where feasible.

Display:
> **Kasus Rahasia**

not target name.

---

# 104. SENSITIVE DATA REVEAL UI

For staff permissioned reveal:
- masked by default where defined;
- reveal action explicit;
- reason/context if required;
- audit event generated.

UI should not reveal full data via HTML hidden text/tooltip while visually masked.

---

# 105. LOADING STATE MATRIX

## Local Panel
Open instantly; content may refresh.

## First-ever data
Use skeleton matching component shape.

## Known old data
Show old safe data + subtle refresh state.

## Paid scan
Stage progress.

## AI
Answer container + processing indicator; rest of Case remains usable.

## Image upload
Preview + optimization progress.

Never use full-screen spinner for a local task.

---

# 106. EMPTY STATE MATRIX

## Kasus
Education + create CTA.

## Payment history
> **Belum ada top-up.**

## Kabar
> **Belum ada kabar baru.**

## Evidence
> **Belum ada bukti yang cukup di bagian ini.**

## Timeline
> **Belum cukup data waktu buat nyusun timeline yang berguna.**

## Graph
Should almost never be generic empty if Case has target; show target node + add clue guidance.

## Affiliate
> **Belum ada referral yang menghasilkan transaksi valid.**

---

# 107. PARTIAL SUCCESS MATRIX

Examples:
- 1 source failed;
- AI failed but evidence succeeded;
- timeline unavailable;
- public page blocked.

UI:
- show usable result;
- completeness;
- unavailable portion;
- no fake success;
- settlement policy from PRD.

---

# 108. PERMISSION DENIED MATRIX

User opening someone else's Case:
> generic unavailable.

Partner suspended:
> explain partner access paused, user app remains available.

Feature not entitled:
> show value/price if legitimate upsell.

Admin capability missing:
> explain role doesn't have access, not `404` if object is legitimately visible at admin level.

---

# 109. MAINTENANCE MATRIX

If AI off:
> core works.

If Scan off:
> old results/Case read works.

If Top-up off:
> wallet read works; new top-up unavailable.

If Upload off:
> evidence read works.

If Realtime off:
> sync fallback.

---

# 110. PERFORMANCE UX CONTRACT BY SCREEN

## Landing
Meaningful UI fast; demo local.

## Beranda
Search interactive immediately.

## Tab switch
Warm visual target <100 ms.

## Panel
Open local, no server prerequisite.

## Case
Metadata first; heavy graph progressive.

## Graph
Cluster/focus, no 300-node initial dump.

## Admin
Summary first; heavy analytics lazy-loaded.

## Upload
Processing off main interaction path.

Performance regression is a bug.

---

# 111. ANALYTICS EVENT MAP — PRODUCT LEVEL

Agent should instrument semantic events, not every mouse move.

Examples:
- login_started/succeeded/failed;
- onboarding_started/completed/skipped;
- scan_intent_selected;
- scan_quote_opened;
- scan_started;
- scan_completed/partial/refunded;
- result_revealed;
- premium_teaser_opened;
- topup_opened/order_created/proof_uploaded/approved;
- case_created;
- clue_added;
- safe_share_created;
- guide_opened;
- ai_question_started/completed/helpful;
- pwa_install_prompt/opened/completed where measurable;
- update_available/applied;
- error_reported.

Do not include raw sensitive identifier in analytics payload.

---

# 112. USER FIRST 60 SECONDS — CANONICAL FLOW

```text
Landing
  ↓
Google Login
  ↓
Welcome card
  ↓
Cek data gue
  ↓
Pilih/konfirmasi identifier
  ↓
Pemeriksaan pertama ditanggung Jejak
  ↓
Stage progress
  ↓
Reveal
  ↓
Result summary
  ↓
Premium relation teaser jika temuan nyata ada
```

Goal:
- user mengerti Jejak;
- melihat evidence-first behavior;
- memahami bahwa ada kedalaman premium;
- tidak merasa langsung dijualin.

---

# 113. FRAUD CHECK CANONICAL FLOW

```text
Beranda
  ↓
Masukkan nomor/username/domain
  ↓
Cek dugaan penipuan
  ↓
Pilih kedalaman
  ↓
Credit preview
  ↓
Scan
  ↓
Result
  ↓
Sinyal risiko + counter evidence
  ↓
Tambah ke Kasus
  ↓
Tambah identifier lain
  ↓
Analisis Gabungan
  ↓
Relationship Graph
```

Primary next action pada risiko tinggi:
> **Apa yang harus gue lakukan?**

Bukan langsung:
> `Scan lagi`.

---

# 114. BANTU KELUARGA CANONICAL FLOW

```text
Beranda
  ↓
Bantu orang terdekat
  ↓
Relation ringan
  ↓
Input identifier
  ↓
Pemeriksaan
  ↓
Hasil
  ↓
Simpan ke Kasus
  ↓
Tindakan perlindungan
```

No mandatory KTP/selfie.

Context tetap dicatat agar disclosure/abuse engine punya sinyal.

---

# 115. TOP-UP CANONICAL FLOW

```text
Premium feature
  ↓
Saldo kurang
  ↓
Lo kurang X Kredit
  ↓
Dompet
  ↓
Pilih paket
  ↓
Order + nominal unik + snapshot rekening
  ↓
Transfer BCA
  ↓
Upload bukti
  ↓
Sedang dicek
  ↓
Owner/Finance approve
  ↓
Ledger settlement
  ↓
Realtime update
  ↓
Lanjutkan niat terakhir
```

Ini harus diuji end-to-end.

---

# 116. OWNER PAYMENT CANONICAL FLOW

```text
Owner User Mode
  ↓
Hidden/elegant entry
  ↓
Ruang Kendali
  ↓
Owner Inbox / Pembayaran
  ↓
Order pending
  ↓
Lihat proof + Sentinel
  ↓
Cek mutasi BCA secara manual
  ↓
Setujui
  ↓
Atomic credit settlement
  ↓
Audit
  ↓
Proof cleanup lifecycle
```

---

# 117. MITRA CANONICAL FLOW — FOUNDATION

```text
User
  ↓
Daftar Mitra
  ↓
Owner review
  ↓
Approved
  ↓
Area Mitra
  ↓
Klien
  ↓
Kasus klien
  ↓
Analisis
```

V1.5:
> anggota tim, monitoring matang, collaboration penuh.

---

# 118. PWA UPDATE CANONICAL FLOW

```text
PWA lama dibuka
  ↓
App shell tampil
  ↓
Version Sentinel check
  ↓
Versi baru siap
  ↓
Prompt update
  ↓
User update
  ↓
Reload controlled
  ↓
Restore safe intent
```

Critical:
> update mandatory before sensitive feature if incompatible.

---

# 119. OFFLINE RETURN FLOW

```text
Scan sudah dimulai
  ↓
Internet putus
  ↓
UI offline indicator
  ↓
Server tetap kerja
  ↓
PWA ditutup
  ↓
User kembali online
  ↓
Sync
  ↓
Result / refund status
```

No duplicate scan.

---

# 120. ERROR RECOVERY FLOW

```text
Action
  ↓
Error
  ↓
Local area shows human error + JX code
  ↓
Retry available
  ↓
If repeated: Laporkan masalah
  ↓
Safe diagnostic attached
  ↓
Owner Pusat Masalah/NADI aggregates
```

No user asked to open dev console.

---

# 121. NAVIGATION ANTI-PATTERNS — DILARANG

Agent dilarang:
- membuat tiap subfitur menjadi halaman full reload;
- menambah navbar item karena malas membuat panel;
- menaruh AI chat sebagai home utama;
- menaruh pricing banner terus-menerus;
- membuka modal bertumpuk;
- membuat sidebar mobile desktop-style;
- membuat hover-only action;
- membuat long-press-only action;
- membuat bottom nav lebih dari yang diperlukan;
- memindahkan user ke Beranda setelah setiap success;
- kehilangan intent terakhir setelah top-up/update/login.

---

# 122. MOBILE ANTI-PATTERNS — DILARANG

- CTA terlalu dekat edge/notch;
- touch target visual/interactive terlalu kecil;
- keyboard menutup submit;
- graph controls terlalu kecil;
- table horizontal tanpa adaptation;
- desktop tooltip sebagai satu-satunya explanation;
- fixed element overlap browser/PWA safe-area;
- swipes destructive tanpa confirmation/undo;
- sticky banners memakan viewport.

---

# 123. DESKTOP ANTI-PATTERNS — DILARANG

- layout mobile dibesarkan begitu saja;
- seluruh screen satu kolom sempit;
- tidak memanfaatkan pointer/hover untuk preview;
- terlalu banyak modal;
- graph detail mengganti seluruh route;
- wasted whitespace yang mengurangi density operasional;
- forcing bottom navigation desktop.

---

# 124. ADMIN ANTI-PATTERNS — DILARANG

- raw DB editor sebagai admin UI;
- `credits = 999`;
- role dropdown tanpa permission logic;
- 20 chart di Ringkasan;
- Payment Sentinel auto-approve;
- screenshot payment public URL;
- button destructive tanpa audit;
- Owner action tidak tercatat;
- account ban sebagai satu-satunya enforcement;
- NADI melakukan mutasi sendiri;
- config bisnis hardcoded.

---

# 125. UI BAHASA — NON-NEGOTIABLE

Semua user-facing:
> Indonesia.

Termasuk:
- button;
- tooltip;
- placeholder;
- error;
- validation;
- loading;
- empty;
- toast;
- confirmation;
- PWA install/update;
- payment;
- admin;
- chart;
- AI;
- maintenance;
- privacy;
- diagnostics.

Nama provider resmi boleh tetap asli di detail teknis/admin.

Agent harus mengikuti kamus `DESIGN_SYSTEM.md`.

---

# 126. STATUS PROJECT & HANDOFF

Wire Map ini adalah blueprint stabil.

Selama implementasi Agent wajib memperbarui:
- `.notes/STATUS_PROJECT.md`
- `.notes/DECISIONS.md`

`STATUS_PROJECT.md` minimal memuat:
- layar sudah selesai;
- layar sedang dikerjakan;
- flow belum selesai;
- QA per browser;
- blockers;
- deploy;
- next action.

`DECISIONS.md` memuat deviasi/keputusan implementasi yang belum ditetapkan blueprint.

Agent baru saat mengambil alih:
1. baca STATUS_PROJECT;
2. baca DECISIONS;
3. baca bagian blueprint yang terkait pekerjaan aktif;
4. jangan membaca ulang ribuan baris semua dokumen tanpa kebutuhan.

---

# 127. GLOBAL SKILLS / TOOLING CONTRACT

User telah memasang banyak skills/tooling secara global.

Setiap Agent Coding saat mulai:
1. cek skill/tooling yang tersedia di environment;
2. gunakan yang relevan;
3. jangan install ulang tanpa kebutuhan;
4. jangan menganggap sebuah skill ada tanpa memeriksa;
5. bila pilihan skill/tool memengaruhi arsitektur atau workflow, catat di `DECISIONS.md`.

Ini bukan alasan menunda pekerjaan dengan menanyakan daftar skill ke user jika Agent dapat memeriksanya sendiri.

---

# 128. DEFINITION OF WIRE-FLOW DONE

Sebuah layar belum dianggap selesai hanya karena:
> kelihatan bagus.

Minimal:
- entry route benar;
- back benar;
- refresh benar;
- loading benar;
- empty benar;
- error benar;
- offline behavior ditentukan;
- mobile touch usable;
- desktop pointer usable;
- keyboard usable bila relevan;
- permission benar;
- realtime fallback ada bila relevan;
- no global remount;
- bahasa sesuai;
- analytics event relevan;
- security-sensitive action server-authoritative;
- test state tersedia.

---

# 129. QA CHECKLIST PER LAYAR

Agent wajib mengecek, sesuai relevansi:

### Visual
- tidak overflow;
- viewport tepat;
- safe-area;
- text wrapping;
- no page scroll.

### Interaction
- tap;
- mouse;
- keyboard;
- back;
- refresh;
- close;
- double tap/click.

### State
- first load;
- warm load;
- stale;
- success;
- partial;
- empty;
- error;
- offline;
- permission denied;
- maintenance.

### Performance
- immediate feedback;
- warm navigation;
- heavy dependency lazy;
- no rerender global.

### Security
- permission;
- masked data;
- no secret;
- no object leak.

### Business
- credit;
- pricing;
- payment;
- audit;
- expiry.

---

# 130. V1 SCREEN CHECKLIST

Harus ada/usable:
- Landing;
- Google Login;
- Onboarding;
- Beranda;
- Search Composer;
- Tujuan Pemeriksaan;
- Tier/credit preview;
- Scan progress;
- Result reveal;
- Result summary;
- Evidence basic;
- Domain;
- Username;
- Phone;
- Email;
- Name ambiguity;
- Password Exposure;
- Kasus list;
- Create Case;
- Case Workspace;
- Graph;
- Timeline component;
- Add clue;
- Manual evidence;
- Contradiction;
- Safe Share;
- Jejak Gue;
- Dompet;
- Packages;
- Top-up checkout;
- Upload proof;
- Payment status;
- Kabar Jejak;
- Panduan;
- AI/Panduan contextual;
- Account;
- PWA install;
- Version Sentinel;
- Diagnostics;
- Privacy/Delete;
- Affiliate basic foundation;
- Mitra foundation;
- Owner entry;
- Ruang Kendali;
- Ringkasan admin;
- Owner Inbox;
- Payment admin;
- User admin;
- Partner admin basic;
- Business config;
- Pricing config;
- Payment method config;
- Campaign basic;
- Source Registry;
- System Health;
- Maintenance;
- Emergency Protection;
- Feature Flags;
- Problems;
- Security Events;
- Storage/Performance basic;
- Analytics basic;
- NADI basic.

---

# 131. V1.5 SCREEN ACTIVATION

Fondasi V1 yang kemudian diperluas:
- Pantau Jejak;
- Jejak Perubahan matang;
- Case collaboration;
- Team Mitra;
- AI Challenge deeper;
- Scenario Simulation;
- richer exports;
- partner analytics;
- richer NADI;
- client monitoring.

---

# 132. V2 SCREEN/ENGINE EXTENSION

UI tidak perlu redesign besar ketika:
- breach provider premium masuk;
- broad web-search provider masuk;
- reputation source premium;
- payment gateway;
- automatic official reconciliation;
- richer monitoring;
- partner marketplace.

Source Registry dan capability layer harus membuat tambahan ini terasa sebagai upgrade mesin, bukan aplikasi baru.

---

# 133. FINAL INTERACTION LAWS

1. **Cepat dulu, cantik tanpa mengorbankan cepat.**
2. **App Shell tidak remount untuk pindah workspace.**
3. **No page scroll; internal scroll bila memang panjang.**
4. **Mobile dan desktop bukan layout yang sama dikecilkan/dibesarkan.**
5. **Touch dan cursor sama-sama first-class.**
6. **Hover/long-press cuma shortcut.**
7. **Motion tidak boleh menjadi syarat fungsi.**
8. **Reduced motion tetap hidup lewat micro-feedback.**
9. **Core tetap berjalan jika AI/Realtime/Luxury layer gagal.**
10. **User tidak kehilangan input/intent karena error, update, atau top-up.**
11. **Kredit hanya dipotong untuk kerja baru, server-side.**
12. **UI tidak memalsukan hasil/coverage/progress.**
13. **AI tidak menjadi sumber fakta primer.**
14. **Sensitive data dimasking sesuai context dan role.**
15. **Admin mengelola bisnis tanpa bongkar kode.**
16. **Owner tetap bisa memakai Jejak sebagai user sungguhan.**
17. **NADI mempercepat keputusan, bukan mengambil alih keputusan finansial/destruktif.**
18. **Semua UI berbahasa Indonesia yang manusiawi dan elegan.**
19. **Tidak ada emoji norak sebagai bahasa visual.**
20. **Setiap agent baru harus bisa melanjutkan kerja dari STATUS_PROJECT dan DECISIONS tanpa wawancara ulang.**

---

# 134. Status Wire Map

Dokumen ini mengunci struktur UX utama Jejak berdasarkan brainstorming Product Owner + arsitektur produk yang telah disetujui.

Agent Coding **tidak boleh menambah layar besar, mengubah navigation utama, mengubah payment flow, atau mengubah pola Case/Graph tanpa alasan yang tercatat**.

Jika implementasi menemukan kebutuhan baru:
1. pilih solusi paling kecil dan reversibel;
2. jangan merusak kontrak UX;
3. catat di `.notes/DECISIONS.md`;
4. update `.notes/STATUS_PROJECT.md`;
5. lanjut kerja jika bukan blocker nyata.

**END OF WIRE MAP**
