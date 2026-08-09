# PRD — JEJAK

> **Product Requirements Document**  
> Produk: **Jejak**  
> Domain target: **jejak.my.id**  
> Status dokumen: **Source of truth produk**  
> Bahasa produk: **Bahasa Indonesia penuh, sehari-hari, humble, elegan, tidak kaku**  
> Fase: **Blueprint sebelum implementasi**

---

## 0. Cara Membaca Dokumen Ini

Dokumen ini menjelaskan **apa yang harus dibangun, untuk siapa, kenapa, bagaimana perilaku produk dari sudut pandang pengguna, apa yang tidak boleh diimprovisasi, dan apa yang masuk V1/V1.5/V2**.

Dokumen ini **bukan tempat detail teknis implementasi**, bukan tempat skema database rinci, dan bukan tempat desain visual pixel-level. Detail tersebut akan ada di dokumen lain:

- `docs/DESIGN_SYSTEM.md` → visual, motion, skeuomorphism, ikon, responsivitas, bahasa UI, accessibility, mobile vs desktop.
- `docs/WIRE_MAP.md` → struktur layar, panel, alur navigasi, keadaan loading/empty/error.
- `docs/SCHEMA.md` → struktur database, ledger, RLS, Storage, role/permission.
- `docs/ROADMAP.md` → urutan pengerjaan dan pembagian V1/V1.5/V2.
- `docs/ACCEPTANCE_TESTS.md` → kondisi yang wajib lulus sebelum fitur dianggap selesai.
- `.notes/AGENTS.md` → aturan kerja mutlak Agent Coding.
- `.notes/STATUS_PROJECT.md` → status implementasi lintas-agent, dibuat dan dirawat selama coding.
- `.notes/DECISIONS.md` → keputusan implementasi lintas-agent, dibuat dan dirawat selama coding.

Jika dokumen teknis berbeda dengan PRD dalam **tujuan produk atau perilaku pengguna**, PRD menang kecuali ada keputusan baru yang dicatat di `.notes/DECISIONS.md` dan secara eksplisit menggantikan keputusan lama.

---

# 1. Ringkasan Eksekutif

**Jejak** adalah web app OSINT dan perlindungan digital premium yang membantu pengguna:

1. mengecek paparan data diri sendiri;
2. memahami apakah identifier digital mereka memiliki jejak atau indikasi kebocoran;
3. membantu keluarga/teman/klien yang tidak cukup paham teknologi;
4. memeriksa seller, akun, nomor, username, email, atau domain sebelum mengambil keputusan penting seperti transfer uang;
5. menggabungkan beberapa petunjuk menjadi **Kasus**;
6. melihat hubungan antarpemberi petunjuk melalui **Relationship Graph**;
7. memisahkan **fakta, sinyal, korelasi, konflik, dan inferensi AI**;
8. mendapatkan penjelasan AI yang grounded pada bukti;
9. menggunakan kredit untuk membuka analisis yang lebih dalam;
10. mengoperasikan program Mitra, Affiliate, dan Reseller;
11. memungkinkan Owner menjalankan bisnis dari **Ruang Kendali** tanpa bongkar kode atau redeploy.

Jejak **bukan** mesin yang mengklaim bisa “menemukan semua data siapa pun”. Jejak harus lebih dipercaya karena selalu menunjukkan:

- apa yang benar-benar ditemukan;
- dari mana sumbernya;
- seberapa kuat hubungannya;
- apa yang masih belum diketahui;
- apa yang justru bertentangan;
- kapan hasil belum cukup untuk disimpulkan.

Brand promise inti:

> **Periksa sebelum percaya.**

Filosofi produk internal:

> **Jejak tidak mencari ketakutan. Jejak mencari kejelasan.**

---

# 2. Masalah yang Mau Diselesaikan

## 2.1 Masalah Pengguna Umum

Pengguna internet sering tidak tahu:

- apakah email, password, username, nomor, atau domain yang mereka gunakan punya paparan digital;
- apa arti sebuah kebocoran data;
- apakah satu seller/domain/akun punya sinyal risiko;
- apakah beberapa identifier yang mereka temukan saling berkaitan;
- apakah sebuah hasil OSINT benar-benar fakta atau hanya dugaan;
- apa langkah aman yang perlu dilakukan setelah menemukan masalah.

Tools yang ada sering terlalu teknis, terlalu “hacker”, terlalu banyak data mentah, atau justru terlalu percaya diri memberi kesimpulan.

Jejak harus mengubah proses itu menjadi:

> **Temukan → Pahami → Verifikasi → Tindak Lanjuti → Pantau**

## 2.2 Masalah Pengguna yang Membantu Orang Lain

Ada banyak kasus nyata di mana satu orang membantu:

- orang tua;
- pasangan;
- saudara;
- teman;
- klien;
- komunitas;
- orang yang tidak paham teknologi.

Jejak tidak boleh memaksa semua pemeriksaan pihak ketiga dianggap stalking. Produk harus menyediakan mode yang jelas untuk **Bantu Orang Terdekat / Pendampingan**, sambil tetap membatasi pola mass harvesting atau enumerasi otomatis.

## 2.3 Masalah Fraud Check

Pengguna sering menerima:

- nomor WhatsApp seller;
- username toko;
- alamat email;
- domain toko;
- nama pihak yang mengaku sebagai bisnis.

Mereka butuh alat untuk memeriksa **konsistensi dan sinyal risiko**, bukan alat yang asal melabeli seseorang sebagai penipu.

Jejak harus mampu mengatakan:

> “Ada ketidaksesuaian yang perlu Lo cek lagi.”

bukan otomatis:

> “Orang ini penipu.”

## 2.4 Masalah Operasional Owner

Owner bukan programmer. Karena itu bisnis Jejak **tidak boleh bergantung pada edit kode untuk operasi sehari-hari**.

Owner harus bisa mengubah langsung dari Ruang Kendali:

- harga paket;
- jumlah kredit;
- masa aktif kredit;
- bonus;
- biaya fitur;
- rekening/metode pembayaran;
- nomor rekening;
- nama pemilik rekening;
- instruksi transfer;
- status aktif/nonaktif rekening;
- prioritas metode pembayaran;
- referral;
- voucher;
- komisi;
- role user;
- role partner;
- feature flag;
- source aktif/nonaktif;
- mode perawatan;
- pengaturan bisnis penting lainnya.

Tidak boleh butuh redeploy hanya untuk melakukan perubahan operasional tersebut.

---

# 3. Visi Produk

Jejak harus terasa seperti **native intelligence app premium** yang kebetulan berjalan di web/PWA.

Ciri pengalaman:

- mobile-first tetapi desktop sangat optimal;
- App Shell penuh satu viewport;
- tidak ada page scroll panjang;
- scroll hanya di area konten internal bila memang dibutuhkan;
- perpindahan workspace terasa instan;
- motion selalu terasa hidup tetapi ringan;
- touch dan mouse memiliki pola interaksi yang berbeda namun fitur tetap setara;
- seluruh UI memakai Bahasa Indonesia;
- visual high-end skeuomorphism modern;
- maskot/identitas **Mata Jejak**;
- AI terasa terintegrasi ke konteks, bukan chatbot tempelan;
- performa adalah bagian dari kesan premium;
- setiap fitur kuat tetap punya provenance dan batas penggunaan.

---

# 4. Prinsip Produk yang Tidak Boleh Dilanggar

## 4.1 Evidence First

AI tidak boleh menjadi sumber fakta utama. Fakta harus berasal dari sumber/data yang bisa dijelaskan.

Setiap temuan masuk salah satu kelas:

1. **Fakta Terverifikasi**
2. **Sinyal**
3. **Korelasi**
4. **Inferensi AI**

AI boleh:

- merangkum;
- membandingkan;
- menjelaskan;
- mencari kontradiksi;
- menantang hipotesis;
- memberi second opinion;
- membuat simulasi skenario.

AI tidak boleh:

- menciptakan fakta yang tidak ada di evidence;
- menganggap kesamaan username otomatis berarti satu orang;
- menyebut seseorang penipu hanya karena sinyal lemah;
- melakukan pencarian baru diam-diam tanpa persetujuan jika itu memakan kredit;
- menjalankan tindakan finansial/admin tanpa konfirmasi manusia.

## 4.2 Explainable OSINT

User harus bisa menjawab:

> “Kenapa Jejak bilang begini?”

Setiap skor/kesimpulan penting punya akses ke penjelasan:

- bukti pendukung;
- konflik;
- sumber;
- waktu ditemukan;
- tingkat keandalan;
- ketidakpastian.

## 4.3 Kedalaman Berbayar, Bukan Hak Tanpa Batas

User dengan kredit besar boleh membuka:

- analisis lebih dalam;
- lebih banyak Case;
- AI premium;
- timeline;
- Mode Bukti;
- graph lebih kaya;
- perbandingan historis;
- pemantauan;
- workspace Mitra;
- laporan lebih lengkap.

Tetapi kredit besar **tidak menghapus guardrail** terhadap:

- mass harvesting;
- enumerasi ribuan target;
- abuse otomatis;
- akses data user lain;
- bypass permission.

## 4.4 Server Menentukan Kebenaran Bisnis

Frontend tidak boleh menentukan:

- saldo;
- role;
- harga final;
- settlement;
- approval;
- entitlement;
- refund;
- akses Kasus;
- akses partner.

UI boleh terasa instan, tetapi server/database adalah sumber kebenaran final.

## 4.5 Privacy by Default

Jejak tidak boleh berubah menjadi gudang data sensitif yang tidak perlu.

Prinsip:

- simpan minimum yang dibutuhkan;
- lampiran sensitif private;
- lifecycle deletion jelas;
- bukti pembayaran berumur pendek;
- data Kasus hanya bertahan sesuai kebutuhan;
- log tidak boleh menjadi salinan PII;
- AI menerima konteks minimum yang relevan.

## 4.6 Bahasa Manusia

UI tidak menggunakan jargon jika tidak perlu.

Contoh:

- bukan `ERROR 429` → **Mesin pencarian lagi padat.**
- bukan `PENDING` → **Sedang Dicek**
- bukan `NO RESULTS` → **Belum nemu jejak yang cukup.**
- bukan `CONFIDENCE SCORE` → **Tingkat Kecocokan**

Tone:

- santai;
- humble;
- elegan;
- gaul secukupnya;
- sehari-hari;
- tidak kaku;
- tidak kampungan;
- tidak lebay;
- tidak menakut-nakuti.

Emoji tidak dipakai sebagai bahasa visual utama. Ikon memakai SVG berkelas dan konsisten.

---

# 5. Target Pengguna

## 5.1 User Pribadi

Kebutuhan:

- cek data sendiri;
- cek password;
- lihat paparan digital;
- cek seller sebelum transfer;
- buat Case sederhana;
- memahami hasil dengan bahasa mudah.

## 5.2 User Power / “Sultan”

Karakter:

- top-up besar;
- penggunaan intensif;
- sering membantu orang lain;
- butuh graph, timeline, AI, history, dan analisis lebih dalam.

Kebutuhan:

- semua fitur terlihat sejak awal;
- fitur premium jelas manfaatnya;
- tidak dipaksa berlangganan;
- kredit menentukan kedalaman penggunaan;
- benefit lebih besar daripada sekadar diskon.

## 5.3 Pendamping / Pembantu Digital

Use case:

- anak membantu orang tua;
- saudara membantu keluarga;
- teman membantu teman;
- admin komunitas;
- jasa pendampingan sah;
- orang yang membantu klien.

Kebutuhan:

- Mode Bantu Orang Terdekat;
- Kasus terpisah;
- catatan;
- timeline;
- penyimpanan yang rapi;
- audit.

## 5.4 Mitra Jejak

Kebutuhan:

- Workspace Klien;
- banyak Kasus;
- kredit volume;
- laporan;
- Pantau Jejak;
- fitur profesional;
- potensi Tim Mitra.

Mitra tetap dapat menggunakan Jejak sebagai user biasa melalui Mode Pribadi.

## 5.5 Affiliate

Kebutuhan:

- kode/link referral;
- statistik klik/registrasi/top-up;
- komisi persentase dari transaksi valid;
- status komisi;
- campaign.

## 5.6 Reseller

Kebutuhan:

- membeli Saldo Distribusi;
- membuat voucher;
- melihat penggunaan voucher;
- menjual kredit dengan margin mereka sendiri;
- tidak bisa menciptakan kredit dari nol.

## 5.7 Support / Finance / Admin / Owner

Role internal berbeda berdasarkan kebutuhan operasional.

### Owner

Owner awal/bootstrapped:

`vadlyvldr@gmail.com`

Owner:

- akses tertinggi;
- bisa memberi/mencabut role;
- bisa mengubah bisnis;
- bisa mengelola source;
- bisa mengelola pembayaran;
- bisa mengelola kredit;
- bisa memakai produk sebagai user biasa.

Default setelah login tetap **User Mode**, bukan langsung Ruang Kendali.

---

# 6. Jobs To Be Done

## 6.1 Cek Diri Sendiri

> “Gue mau tahu seberapa jauh data gue terekspos dan apa yang harus gue lakukan.”

## 6.2 Cek Sebelum Transfer

> “Gue mau tahu apakah seller/domain/akun ini punya sinyal yang bikin gue harus lebih hati-hati.”

## 6.3 Bantu Orang Terdekat

> “Gue mau bantu keluarga/teman yang nggak ngerti teknologi buat cek paparan atau risiko.”

## 6.4 Bangun Kasus

> “Gue punya beberapa petunjuk dan pengen lihat apakah semuanya saling berhubungan.”

## 6.5 Jalankan Bisnis

> “Gue sebagai Owner mau bisa mengelola Jejak tanpa bongkar kode.”

## 6.6 Dapat Penghasilan dari Ekosistem

> “Gue mau jadi Mitra/Affiliate/Reseller dan dapat value yang jelas.”

---

# 7. Struktur Produk User

Navigasi utama user harus tetap sederhana:

1. **Beranda**
2. **Periksa**
3. **Kasus**
4. **Jejak Gue**

Global elements:

- Saldo Kredit;
- Kabar Jejak;
- Mata Jejak;
- tombol Kembali;
- tombol Segarkan;
- akses Pasang Jejak/PWA bila relevan;
- akun/settings sebagai panel sekunder.

Tidak ada halaman panjang seperti website marketing setelah login.

---

# 8. Landing Page Sebelum Login

Landing page wajib:

- satu viewport;
- premium;
- tidak berupa sales page panjang;
- punya Search Console signature;
- punya demo Kasus fiktif interaktif;
- punya Google login;
- punya tombol/ikon Pasang Jejak jika tersedia;
- tidak memanggil API OSINT/AI mahal untuk demo.

Copy arah:

> **Periksa sebelum percaya.**

Subcopy:

> Cek paparan data, telusuri sinyal risiko, dan pahami jejak digital dengan lebih jelas.

CTA:

> **Mulai dengan Google**

Bawah:

> Bisa mulai gratis. Nggak perlu kartu kredit.

Demo sebelum login harus 100% dummy/local agar bot/traffic tidak membakar resource.

---

# 9. Onboarding

## 9.1 Tidak Ada Tutorial Panjang

Tidak memakai onboarding 7 slide yang wajib diswipe.

Pertama login:

> **Selamat datang di Jejak.**
>
> Lo bisa mulai dari email, nomor HP, nama, username, atau domain.
>
> Kalau bingung, coba cek data Lo sendiri dulu.

CTA:

- **Cek data gue**
- **Gue mau lihat-lihat dulu**

## 9.2 Pemeriksaan Pertama Ditanggung Jejak

User baru harus mendapat pengalaman pertama yang cukup bernilai.

Bukan sekadar diberi kredit lalu bingung.

Konsep:

> **Pemeriksaan pertama Lo kami tanggung.**
>
> Biar Lo bisa lihat sendiri cara Jejak bekerja.

Sisa bonus awal boleh ada, tetapi harus dikelola lewat campaign/credit config.

## 9.3 Mode Dibantu

Jejak bisa menawarkan Mode Dibantu bila user terlihat sering membuka bantuan atau kesulitan memahami alur.

Mode Dibantu:

- tombol lebih deskriptif;
- penjelasan lebih sering;
- Mata Jejak lebih aktif;
- tetap satu produk, bukan mode UI terpisah total.

---

# 10. Search / Periksa

## 10.1 Input Universal

Jejak menerima 5 input utama:

1. Nama
2. Nomor HP
3. Email
4. Username
5. Domain

Search Console mencoba mengenali tipe input secara otomatis.

Contoh:

> **Nomor HP terdeteksi**

Lalu user memilih konteks pemeriksaan.

## 10.2 Tujuan Pemeriksaan

Pilihan utama:

- **Cek Data Gue**
- **Bantu Orang Terdekat**
- **Cek Dugaan Penipuan**
- **Kasus / Pendampingan**

Jangan ada tombol “iseng cek orang”.

Intent digunakan untuk:

- wording;
- disclosure;
- pricing/credit;
- guardrail;
- rekomendasi langkah selanjutnya.

## 10.3 Progressive Trust

User tidak dipaksa KTP/selfie/OTP untuk sekadar mencoba.

Namun semakin sensitif tindakan, semakin tinggi konteks/kepercayaan yang dibutuhkan.

Sistem boleh membedakan:

- tidak terverifikasi;
- kemungkinan milik user;
- terverifikasi.

Tetapi UX tidak boleh dibuat terlalu ketat sampai menghambat penggunaan normal.

---

# 11. Tingkat Pemeriksaan dan Kredit

Semua biaya harus admin-configurable. Agent dilarang hardcode.

Seed awal yang direkomendasikan:

| Tingkat | Seed biaya | Tujuan |
|---|---:|---|
| Cek Cepat | 1 Kredit | validasi/sinyal awal |
| Pemeriksaan Mendalam | 3 Kredit | beberapa sumber + analisis lebih lengkap |
| Analisis Gabungan | 7 Kredit | multi-identifier + relationship + contradiction |
| Analisis Lanjutan | 15 Kredit | bukti, timeline, AI lebih dalam, second opinion |
| Analisis Kasus Profesional | 25 Kredit | Case kompleks / Mitra / Power |

Seed ini adalah **default bisnis yang dapat diubah Owner**, bukan angka permanen.

## 11.1 Kredit Hanya untuk Kerja Baru

Tidak boleh memotong kredit saat user hanya:

- membuka hasil lama;
- membuka graph lama;
- membaca evidence lama;
- melihat timeline lama;
- membuka Case.

Kredit dipakai saat:

- scan baru;
- refresh sumber;
- ekspansi analisis;
- AI reasoning baru yang memang berat;
- monitoring;
- pencarian sumber tambahan.

## 11.2 Upgrade Bayar Selisih

Jika hasil masih cukup baru:

> Cek Cepat → Pemeriksaan Mendalam → Analisis Gabungan

user hanya membayar **selisih** ke tingkat berikutnya.

Jangan membuat user membayar ulang seluruh proses yang sudah selesai.

## 11.3 Credit Preview

Sebelum mulai scan:

- biaya terlihat;
- apa yang akan dilakukan terlihat;
- saldo terlihat;
- kredit belum dipotong sebelum user konfirmasi.

Jika harga berubah setelah modal dibuka, user tidak boleh tiba-tiba dipotong lebih tinggi tanpa reconfirm.

---

# 12. Credit Ledger dan Masa Aktif

Saldo bukan satu angka mentah yang diedit.

Setiap kredit punya sumber/lifecycle.

Status konsep:

- Tersedia
- Dicadangkan
- Digunakan
- Dikembalikan
- Kedaluwarsa

## 12.1 Credit Lot

Setiap top-up/campaign menjadi lot kredit sendiri.

Contoh:

- 20 Kredit Paket Mulai — kedaluwarsa X
- 70 Kredit Paket Proteksi — kedaluwarsa Y
- 5 Bonus referral — kedaluwarsa Z

User melihat saldo total sederhana, tetapi engine menggunakan lot yang paling cepat kedaluwarsa terlebih dahulu.

## 12.2 Masa Berlaku

Kredit hasil top-up **tidak berlaku selamanya**.

Masa aktif bergantung pada besarnya paket.

Seed awal yang direkomendasikan, tetap admin-configurable:

| Paket | Seed masa aktif |
|---|---:|
| Mulai | 60 hari |
| Proteksi | 120 hari |
| Lanjutan | 240 hari |
| Power | 365 hari |
| Mitra | 365 hari atau lebih sesuai program |

Grace period seed awal:

> 7 hari

Kredit promo/gratis boleh punya masa berlaku sendiri.

## 12.3 Perpanjangan Saldo Lama

Top-up paket tertentu boleh memperpanjang kredit berbayar lama yang masih eligible.

Kredit promo tidak wajib ikut diperpanjang.

## 12.4 Transparansi Kedaluwarsa

UI harus jelas:

> 5 Kredit akan berakhir lebih dulu pada …

Ledger tetap mencatat:

> `-18 Kredit · Masa aktif berakhir`

Tidak boleh diam-diam menghapus history.

---

# 13. Paket dan Pricing

Positioning:

> **Accessible premium**

Bukan murah-meriah dan bukan enterprise mahal.

Seed harga awal:

- **Mulai** — Rp19.000
- **Proteksi** — Rp49.000
- **Lanjutan** — Rp89.000
- **Power** — Rp149.000
- **Mitra** — mulai volume lebih tinggi, admin-configurable

Jumlah kredit, bonus, masa aktif, dan harga wajib bisa diubah dari Ruang Kendali.

## 13.1 Proteksi sebagai Sweet Spot

Paket Proteksi harus menjadi pilihan yang secara alami terasa paling masuk akal melalui:

- bonus;
- estimasi pemakaian;
- masa aktif;
- value;
- bukan dark pattern.

## 13.2 Estimasi Pemakaian

Contoh:

> Dengan 36 Kredit, kira-kira Lo bisa melakukan beberapa Pemeriksaan Mendalam atau beberapa Analisis Gabungan, tergantung kebutuhan.

Tidak membuat user menghitung sendiri.

## 13.3 Tidak Ada Dark Pattern

Dilarang:

- countdown palsu;
- stok palsu;
- “orang lain sedang melihat” palsu;
- membuat skor risiko sengaja menakutkan untuk memaksa top-up;
- menyamarkan tombol tutup;
- menipu user bahwa template adalah AI real-time.

---

# 14. Kasus

Kasus adalah jantung Jejak sejak V1.

Contoh:

> **Kasus: Dugaan Penipuan Marketplace**

Kasus dapat berisi:

- nomor;
- email;
- username;
- domain;
- nama;
- bukti manual;
- catatan;
- hipotesis;
- timeline;
- relationship graph;
- hasil scan.

## 14.1 Entitas Tidak Otomatis Digabung

Setiap identifier adalah entitas terpisah sampai ada dasar cukup.

AI tidak boleh otomatis merge dua entitas.

Jika kemungkinan sama:

> **Kemungkinan entitas yang sama**

User dapat memilih:

- Gabungkan sementara
- Tetap pisah

Merge harus dapat dibatalkan.

## 14.2 Jenis Hubungan

Graph membedakan:

- hubungan langsung;
- kemungkinan hubungan;
- kesamaan pola;
- konflik/ketidaksesuaian.

Hubungan AI murni tidak boleh otomatis menjadi hubungan “terverifikasi”.

## 14.3 Focus Mode dan Layer

Graph tidak boleh jadi spaghetti.

Default:

- target utama;
- hubungan penting;
- neighborhood relevan.

Power/Sultan dapat mengaktifkan layer:

- Identitas
- Jejak Publik
- Domain
- Kebocoran
- Risiko
- Konflik
- Timeline

## 14.4 Hipotesis

Power user dapat membuat hipotesis seperti:

> “Nomor A dan akun B kemungkinan dikendalikan pihak yang sama.”

Jejak menampilkan:

- bukti mendukung;
- bukti bertentangan;
- belum diketahui.

## 14.5 Yang Belum Diketahui

Case harus punya bagian:

> **Yang masih belum jelas**

Jejak memberi saran petunjuk yang paling berguna berikutnya.

---

# 15. Evidence Passport

Setiap evidence harus menyimpan konsep minimal:

- sumber;
- jenis evidence;
- ditemukan kapan;
- target/identifier terkait;
- reliability;
- apakah masih bisa diverifikasi;
- ringkasan relevan;
- link/reference bila diizinkan;
- independence/duplication signal;
- source timestamp bila ada.

User Advanced/Power dapat membuka:

> **Mode Bukti**

untuk melihat sumber per sumber.

---

# 16. Skor dan Penilaian

Jejak tidak memakai satu skor universal yang membingungkan.

## 16.1 Tingkat Kecocokan

Menjawab:

> Seberapa kuat evidence menunjukkan beberapa identifier berkaitan?

Tidak berarti peluang seseorang kriminal.

## 16.2 Paparan Digital

Khusus self-check.

Menjawab:

> Seberapa besar permukaan data/credential user yang perlu diperhatikan?

## 16.3 Sinyal Risiko

Khusus fraud/risk check.

Kategori seperti:

- Rendah
- Sedang
- Tinggi

Tidak boleh diterjemahkan sebagai “persentase penipu”.

## 16.4 Kelengkapan Analisis

Menjawab:

> Berapa bagian pemeriksaan yang benar-benar berhasil dijalankan?

Contoh:

> **Kelengkapan Analisis: 78%**

1 sumber belum berhasil diperiksa.

---

# 17. Timeline dan Jejak Perubahan

Timeline adalah fondasi arsitektur sejak V1, tetapi event hanya boleh muncul jika ada evidence yang mendukung.

Jejak harus siap menampilkan:

- event paparan;
- perubahan domain;
- hubungan yang menguat/melemah;
- source yang menghilang;
- identifier baru.

## 17.1 Jejak Perubahan

Jika Case diperiksa ulang:

> **Ada 4 perubahan sejak terakhir Lo cek.**

Kategori:

- Baru
- Menghilang
- Lebih Kuat
- Lebih Lemah

Fitur monitoring penuh ada di V1.5, tetapi snapshot structure siap dari V1.

---

# 18. Sumber OSINT V1

## 18.1 Core Sources

V1 harus mampu berjalan tanpa broad web-search provider berbayar/no-CC.

Core:

- RDAP untuk domain;
- Cloudflare DNS;
- Google DNS sebagai fallback;
- libphonenumber/local phone normalization;
- HIBP Pwned Passwords;
- parser/normalizer internal.

## 18.2 Optional Public Presence

- GitHub public API;
- GitLab public API;
- Public Page Collector untuk URL/domain publik yang memang diketahui.

## 18.3 Public Page Collector

Boleh membaca halaman yang benar-benar publik.

Tidak boleh menjadi dependency pada:

- bypass login;
- CAPTCHA bypass;
- stealth anti-bot;
- token curian;
- endpoint yang sengaja dibatasi.

Jika sumber menolak akses:

> berhenti dan tandai source unavailable.

## 18.4 Source Registry

Setiap source memiliki:

- status Aktif/Nonaktif/Eksperimental;
- kategori;
- reliability;
- prioritas;
- health;
- failure rate;
- budget internal;
- gratis/berbayar;
- aturan pemakaian.

Owner bisa mengaktifkan source Eksperimental hanya untuk Owner/test account terlebih dahulu.

Jika source stabil, baru dipromosikan ke Aktif.

## 18.5 Tidak Ada Klaim Coverage Palsu

Jejak dilarang menulis seperti:

> “Scanning 97 databases…”

jika itu tidak benar.

Lebih baik menunjukkan 5 evidence yang benar-benar bisa dijelaskan.

---

# 19. Perilaku Per Input

## 19.1 Domain

Menjadi salah satu kemampuan paling kuat V1.

Dapat memeriksa:

- RDAP;
- DNS;
- nameserver;
- MX;
- website public page jika tersedia;
- contact cross-reference;
- contradiction.

Domain baru tidak otomatis berarti scam.

## 19.2 Username

Dapat memeriksa:

- GitHub/GitLab optional;
- public page yang diketahui;
- cross-link;
- kesamaan display name/domain/bio bila evidence tersedia.

Username sama tidak otomatis satu orang.

## 19.3 Nomor HP

Dapat memeriksa:

- format;
- normalisasi;
- region;
- tipe nomor jika tersedia;
- kemunculan di evidence public page yang sudah ditemukan.

Nomor dapat berpindah pemilik. Timestamp sangat penting.

## 19.4 Email

Dapat memeriksa:

- format;
- domain;
- MX/DNS;
- korelasi dengan evidence lain.

Timeline breach email lengkap **tidak boleh dijanjikan** sampai source yang layak tersedia.

## 19.5 Nama

Nama tidak pernah lookup satu hasil.

Jika terlalu umum:

> **Nama ini terlalu umum buat disimpulkan sendiri. Tambahkan nomor, email, username, atau domain supaya Jejak nggak salah orang.**

---

# 20. Password Exposure

Fitur V1 penting.

Prinsip:

- password asli tidak disimpan;
- password asli tidak masuk log;
- password asli tidak dikirim ke Gemini/Groq;
- gunakan pola privacy-preserving seperti k-anonymity pada source yang mendukung.

Hasil:

> **Password ini pernah ditemukan dalam kumpulan kebocoran.**

Jika tidak ditemukan:

> **Belum ditemukan dalam kumpulan yang diperiksa. Ini bukan jaminan password pasti aman.**

---

# 21. Asisten User

## 21.1 Free — Panduan Jejak

Free user mendapatkan assistant berbasis rule/template untuk:

- menjelaskan istilah;
- menjelaskan skor;
- membantu navigasi;
- memberi langkah dasar.

Tidak boleh pura-pura AI real-time bila memang bukan.

## 21.2 Power — Asisten AI Jejak

AI kontekstual dapat:

- menjelaskan Case;
- menjelaskan hubungan;
- mencari yang janggal;
- menantang kesimpulan;
- membandingkan dua petunjuk;
- menjawab “apa yang belum gue tahu?”;
- membuat simulasi skenario;
- menyederhanakan hasil untuk orang awam.

## 21.3 AI Context Boundary

AI hanya membaca konteks minimum yang dibutuhkan.

Case A tidak otomatis memberi akses ke Case B.

## 21.4 AI Tidak Boleh Menjalankan Search Tambahan Diam-Diam

Jika pertanyaan membutuhkan pemeriksaan baru:

> **Pertanyaan ini butuh pemeriksaan tambahan. Periksa sekarang · X Kredit**

User harus konfirmasi.

## 21.5 Kuota AI Termasuk Paket

Analisis premium harus menyertakan sejumlah pertanyaan AI kontekstual agar user tidak merasa dipotong kredit setiap chat kecil.

Jumlah kuota harus configurable.

---

# 22. Analyst + Skeptic

Jejak menggunakan konsep dua perspektif AI:

- **Analyst** → mencari hubungan dan menjelaskan evidence;
- **Skeptic** → mencari alasan kenapa kesimpulan bisa salah.

Tidak harus selalu model/provider tertentu secara permanen.

Provider routing boleh berubah berdasarkan:

- kesehatan provider;
- cost;
- privacy;
- ketersediaan;
- capability.

AI kedua tidak sekadar mengiyakan AI pertama.

---

# 23. Pagar Data Sensitif

Sebelum data dikirim ke provider AI:

Jejak harus mempertanyakan:

> Apakah model benar-benar perlu identifier mentah?

Jika tidak:

- pseudonymize;
- mask;
- gunakan ID kontekstual.

Provider AI tidak boleh menerima lebih banyak data daripada yang dibutuhkan.

Bukti transfer, screenshot bank, dan data finansial harus diperlakukan lebih sensitif.

---

# 24. Pembayaran V1

V1 menggunakan transfer bank manual.

Tidak ada payment gateway wajib saat launch.

## 24.1 Metode Pembayaran Configurable

Owner dapat mengubah dari Ruang Kendali:

- jenis metode pembayaran;
- nama bank;
- nomor rekening;
- nama pemilik rekening;
- instruksi;
- status aktif/nonaktif;
- prioritas;
- rekening utama.

Dukung beberapa metode sekaligus.

## 24.2 Snapshot Metode Pembayaran

Setiap order menyimpan snapshot rekening/metode saat order dibuat.

Jika Owner mengganti rekening setelah order dibuat:

- order lama tetap memakai data lama;
- order baru memakai data baru.

## 24.3 Nominal Unik

Order boleh memakai kode unik nominal agar mudah dicocokkan.

Contoh:

> Rp49.137

## 24.4 Upload Bukti

User upload screenshot normal.

Jejak sendiri yang:

- validasi;
- kompres;
- normalisasi;
- strip metadata yang tidak dibutuhkan;
- simpan private.

Target bukti transfer:

> maksimal sekitar 75 KB setelah optimasi, selama masih terbaca.

User tidak boleh diminta mengompres manual.

## 24.5 Payment Sentinel

AI/vision hanya screening awal.

Boleh membaca:

- nominal;
- bank;
- waktu;
- reference number;
- indikasi duplikasi;
- kecocokan dengan order;
- kualitas screenshot.

Output:

- Terlihat sesuai
- Perlu dicek
- Ada yang janggal

AI **tidak boleh auto-approve**.

Sumber kebenaran V1:

> Owner/Finance memeriksa mutasi bank lalu approve.

Owner boleh override peringatan AI jika pembayaran memang masuk.

Audit wajib mencatat override.

## 24.6 Status Pembayaran User

- Menunggu Bukti
- Sedang Dicek
- Perlu Bukti Baru
- Disetujui
- Ditolak

## 24.7 Setelah Disetujui

- kredit settlement satu kali;
- screenshot masuk lifecycle cleanup;
- metadata minimum tetap;
- duplicate fingerprint boleh dipertahankan untuk anti-reuse.

---

# 25. Affiliate

Affiliate:

- punya referral link/code;
- komisi persentase dari top-up yang benar-benar valid;
- komisi tidak cair hanya karena signup;
- anti self-referral;
- reward dapat berupa uang atau kredit sesuai campaign.

Status komisi:

- Menunggu
- Valid
- Sudah Dibayar
- Ditahan untuk Peninjauan

Seed komisi awal rekomendasi:

> 10%

Tetap configurable per program/per partner.

---

# 26. Reseller

Reseller memiliki dua nilai berbeda:

1. Kredit Pribadi
2. Saldo Distribusi

Reseller harus membeli Saldo Distribusi sebelum membuat voucher.

Voucher:

- punya asal;
- punya nilai;
- punya masa berlaku;
- tidak bisa dipakai dua kali;
- tidak bisa menciptakan kredit dari nol;
- redemption atomic.

Reseller bebas menentukan harga jual eksternal mereka sendiri. Jejak hanya mengontrol nilai kredit dan validitas voucher.

---

# 27. Mitra

Mitra membutuhkan approval Owner/Admin sesuai permission.

Mitra mendapatkan:

- Workspace Klien;
- nama klien;
- catatan internal;
- banyak Case;
- laporan;
- Pantau Jejak;
- kredit volume;
- fitur profesional.

Jejak tidak perlu mengumpulkan KTP klien hanya untuk membuktikan mereka klien.

Fondasi Tim Mitra disiapkan sejak V1, UI penuh dapat aktif di V1.5.

---

# 28. Role dan Permission

Role konsep:

- User
- Affiliate
- Reseller
- Mitra
- Support
- Finance
- Admin
- Owner

Satu akun dapat punya beberapa entitlement.

Contoh:

> User + Affiliate

Role tidak boleh hanya satu kolom `role = x` yang menghilangkan konteks lain.

Owner dapat menambah/mencabut akses partner dari Ruang Kendali.

Partner freeze tidak sama dengan block user.

---

# 29. Ruang Kendali

Ruang Kendali adalah cockpit bisnis Owner/Admin.

Area utama:

1. Ringkasan
2. Pembayaran
3. Pengguna
4. Partner
5. Bisnis
6. Sistem
7. Analitik
8. NADI

Owner tetap default masuk sebagai user biasa setelah login.

Akses Ruang Kendali adalah konteks terpisah.

Selalu ada:

> **Kembali sebagai Pengguna**

## 29.1 Ringkasan

Menjawab:

> “Apa yang perlu gue urus sekarang?”

Tampilkan:

- pembayaran menunggu;
- source bermasalah;
- scan gagal/refund;
- aktivitas partner yang perlu ditinjau;
- revenue hari ini;
- top-up;
- user baru;
- conversion;
- system health.

Jangan penuh grafik.

## 29.2 Pembayaran

Owner/Finance dapat:

- melihat order;
- melihat screenshot private;
- melihat hasil Payment Sentinel;
- approve;
- minta bukti baru;
- tolak.

Double approval harus mustahil secara ledger.

## 29.3 Pengguna

Owner dapat:

- cari user;
- lihat saldo;
- lihat expiry;
- lihat transaksi;
- tambah kredit;
- koreksi kredit;
- ubah role/entitlement;
- pause/block;
- lihat audit.

Tidak boleh edit ledger/history secara destruktif.

## 29.4 Bisnis

Configurable tanpa deploy:

- harga;
- paket;
- kredit;
- expiry;
- grace period;
- rekening;
- campaign;
- referral;
- voucher;
- biaya analisis;
- masa simpan file;
- bonus user baru;
- komisi.

## 29.5 Sistem

Owner dapat:

- melihat source health;
- aktif/nonaktif source;
- feature flags;
- Mode Perawatan;
- Proteksi Darurat;
- storage health;
- performance health;
- browser/PWA adoption;
- error center.

---

# 30. NADI — Asisten AI Admin

NADI bukan chat box kosong.

NADI adalah Chief-of-Staff digital Owner.

Kemampuan:

- briefing operasional;
- pembayaran pending;
- error;
- revenue;
- conversion;
- referral/partner health;
- provider health;
- product funnel;
- performance regression;
- PWA adoption;
- saran prioritas.

NADI default:

> **READ + RECOMMEND + DRAFT**

Bukan auto-action.

Contoh:

Owner:

> “Kasih Andi 50 kredit kompensasi.”

NADI boleh menyiapkan draft:

- Andi
- +50 Kredit
- Alasan: Kompensasi

Owner tetap menekan Konfirmasi.

NADI tidak boleh auto-approve pembayaran, auto-transfer, auto-delete, atau auto-role escalation.

---

# 31. Owner Inbox

Owner Inbox memiliki kategori:

- Perlu Lo Urus
- Penting
- Info

Item penting tidak dianggap selesai hanya karena dibaca.

Harus:

- ditindak;
- ditandai selesai;
- atau didismiss dengan alasan bila relevan.

---

# 32. Feature Flag dan Mode Perawatan

Semua fitur besar baru harus bisa diaktif/nonaktifkan dari Ruang Kendali.

Target:

- Owner saja;
- role tertentu;
- persentase user;
- semua user.

Mode Perawatan parsial:

- Scan OFF
- AI OFF
- Top-up OFF/ON
- Upload OFF/ON
- Pantauan OFF/ON

Tidak harus mematikan seluruh app.

---

# 33. Proteksi Darurat

Owner memiliki kontrol Proteksi Darurat.

Saat aktif:

- operasi mahal diperketat;
- rate lebih konservatif;
- AI/OSINT berat dapat dijeda;
- anonymous/demo tetap ringan;
- user normal sebisa mungkin tetap bisa membaca data miliknya.

Tidak sama dengan mematikan web.

---

# 34. PWA

Jejak wajib menjadi PWA yang jelas dan mudah dipasang.

## 34.1 Pasang Jejak

Harus ada tombol/icon **Pasang Jejak**.

Browser/platform menyesuaikan flow.

User tidak harus mencari menu browser sendiri.

## 34.2 Tombol Kembali dan Segarkan

Karena PWA standalone tidak selalu punya toolbar browser:

- **Kembali** wajib ada;
- **Segarkan** wajib ada.

Segarkan tidak berarti reload brutal seluruh app.

Segarkan melakukan sinkronisasi versi/data penting.

## 34.3 Version Sentinel

PWA harus mendeteksi versi baru.

Normal update:

> **Jejak baru aja diperbarui. Gunakan versi terbaru.**

Security-critical update boleh wajib.

Update harus sebisa mungkin mempertahankan safe navigation state.

## 34.4 Versi Terlalu Lama

Backend dapat menolak client yang terlalu lama secara manusiawi:

> **Versi Jejak ini sudah terlalu lama. Perbarui dulu biar semuanya tetap jalan dengan benar.**

---

# 35. Performa Produk

Performa adalah requirement produk.

Target rasa:

- feedback klik/tap terasa langsung;
- warm workspace navigation target visual <100 ms;
- panel lokal tidak menunggu network;
- app shell tidak remount tanpa alasan;
- meaningful cold-start target sekitar 1–1,5 detik dalam kondisi test standar;
- scan eksternal tidak mengunci UI;
- user boleh berpindah menu saat scan berjalan;
- graph memakai progressive rendering;
- realtime granular;
- motion adaptif.

Performance regression dianggap bug.

---

# 36. Mobile, Desktop, Touch, Cursor

Mobile dan desktop tidak boleh dianggap hanya beda ukuran layar.

## Mobile

- tap;
- hold;
- swipe;
- bottom navigation;
- bottom sheet;
- touch target luas;
- one-hand friendly.

## Desktop

- click;
- hover enhancement;
- context actions;
- sidebar;
- multi-panel.

Aturan mutlak:

> Tidak ada fitur penting yang hanya bisa ditemukan melalui hover atau long-press.

Hybrid touchscreen laptop/tablet harus tetap aman.

---

# 37. Motion

Jejak tidak punya Static Mode.

Reduced motion bukan berarti UI mati.

Jika motion dikurangi:

- parallax besar boleh hilang;
- continuous particle boleh hilang;
- zoom/rotation besar boleh hilang;
- tetapi tactile press, lighting, elevation, micro transition, progress feedback tetap ada.

State akhir UI tidak boleh bergantung pada animation completion.

WebGL/3D gagal → fallback 2D/2.5D, bukan app mati.

---

# 38. Maskot dan Easter Egg

Maskot:

> **Mata Jejak**

Inspirasi:

- tarsius Indonesia;
- mata besar;
- nokturnal;
- fingerprint;
- bentuk abstrak `J`.

Tidak berupa kartun bayi/lucu norak.

Easter Egg:

> **Jejak Cermin**

Mudah ditemukan melalui interaksi sederhana dengan Mata Jejak.

Menampilkan informasi aman yang memang dapat diketahui website dari sesi/browser, dengan pesan edukasi:

> **Di internet, hampir semua hal ninggalin sedikit jejak.**

Tidak menjadi puzzle rumit.

---

# 39. Kabar Jejak dan Monitoring

Kabar Jejak adalah Notification Center user.

Kategori:

- Hari ini
- Minggu ini
- Sebelumnya

Notifikasi dapat mencakup:

- pembayaran disetujui;
- scan selesai;
- kredit refund;
- perubahan Case;
- saldo hampir habis;
- kredit mendekati expiry.

Pantau Jejak penuh adalah V1.5, tetapi data model snapshot dan notification foundation disiapkan V1.

Permission push tidak boleh diminta di awal tanpa konteks.

---

# 40. Safe Share Card

User dapat membuat:

> **Bagikan Ringkasan Aman**

Kartu tidak menampilkan data sensitif penuh.

Isi contoh:

- Sinyal Risiko;
- jumlah indikator;
- Scan/Case ID aman;
- data sensitif disamarkan;
- branding Jejak.

Safe Share Card adalah growth loop bawaan.

---

# 41. Data Lifecycle

Data dibagi:

1. Data Akun
2. Data Investigasi
3. Lampiran Sensitif
4. Data Finansial
5. Log Teknis

## 41.1 Bukti Pembayaran

- private;
- lifecycle pendek;
- setelah approved masuk cleanup;
- rejected dapat bertahan singkat untuk dispute.

Seed retention rejected:

> 7 hari

Admin-configurable.

## 41.2 Lampiran Kasus

Bertahan selama Case ada, kecuali user/workspace memilih retention tertentu.

## 41.3 Tempat Sampah

Kasus biasa:

> 3 hari

Kasus Rahasia:

> user dapat memilih hapus permanen langsung.

## 41.4 Hapus Akun

User diberi peringatan jelas.

Jika masih punya kredit aktif:

> **Lo masih punya X Kredit. Kalau akun dihapus, kredit ini ikut berakhir.**

User tetap boleh lanjut.

## 41.5 Export Data

Fondasi `Ekspor Data Gue` disiapkan sejak V1.

Tidak termasuk:

- security signal internal;
- admin notes internal;
- data rahasia sistem.

---

# 42. Kasus Rahasia

Kasus Rahasia:

- preview disamarkan;
- notifikasi tidak menyebut identifier sensitif;
- tidak boleh offline-cache sembarangan;
- dapat dihapus permanen langsung;
- tetap mengikuti permission/RLS.

---

# 43. Support Masking

Support default melihat identifier yang disamarkan.

Contoh:

- `va•••@gmail.com`
- `0812••••721`

Reveal sensitif hanya jika permission memang ada.

Setiap reveal sensitif oleh staf masuk audit.

---

# 44. Audit

Audit wajib untuk tindakan seperti:

- role berubah;
- rekening berubah;
- pricing berubah;
- admin tambah/koreksi kredit;
- payment approved/rejected;
- partner freeze/unfreeze;
- data sensitif direveal;
- source diaktif/nonaktifkan;
- feature flag kritis berubah.

Audit tidak boleh diedit seperti catatan biasa.

Jika admin salah memberi kredit:

> buat transaksi koreksi

bukan menghapus history lama.

---

# 45. Error dan Observability

Setiap error penting punya **Kode Jejak**.

Contoh:

> `JX-7K2P`

User melihat pesan manusiawi.

Owner dapat mencari kode tersebut di Ruang Kendali.

Log dibagi:

- Catatan Operasional
- Catatan Teknis
- Jejak Audit

NADI membaca digest/agregat, bukan seluruh log mentah.

---

# 46. Error User

User harus punya tombol:

> **Laporkan masalah ini**

Jejak otomatis melampirkan informasi aman seperti:

- kode error;
- versi app;
- browser/device class;
- halaman;
- waktu.

Jangan minta user buka developer console.

---

# 47. Security Product Requirements

## 47.1 Deny by Default

Tidak punya izin eksplisit = tidak boleh.

## 47.2 UI Hidden Bukan Security

Tombol rahasia Owner hanya navigasi.

Server/database tetap memverifikasi role/permission.

## 47.3 Secret Tidak Boleh di Browser

Tidak boleh mengekspos:

- Gemini keys;
- Groq keys;
- Supabase service/secret credentials;
- internal signing secret;
- credential source premium.

## 47.4 AI Evidence Hostile

Teks dari internet, screenshot, catatan user, evidence lain:

> **DATA, bukan INSTRUKSI**

Tidak boleh bisa memerintah AI melakukan aksi.

## 47.5 Domain Checker Tidak Boleh Mengakses Internal Network

Alamat private/internal/localhost/metadata cloud/protokol aneh harus ditolak.

Redirect harus diperiksa ulang.

## 47.6 Suspicious User Lifecycle

Default:

> Normal → Diamati → Dibatasi → Dijeda → Diblokir

Tidak auto-ban Power/Mitra hanya karena penggunaan tinggi tanpa evidence abuse cukup.

---

# 48. Resource / API Abuse Protection

Satu user dengan 5.000 kredit tidak boleh menyalakan 5.000 scan bersamaan.

Harus ada:

- concurrency limit;
- request deduplication;
- credit reservation;
- provider budget;
- source circuit breaker;
- abuse governor;
- duplicate operation protection.

Satu request yang di-retry tidak boleh menciptakan scan/charge baru.

---

# 49. Scan Settlement

Scan memiliki minimal lifecycle:

1. Request
2. Validasi
3. Reserve kredit
4. Jalankan sumber
5. Hitung coverage
6. AI bila dibutuhkan
7. Grounding check
8. Finalize
9. Settle atau refund

Jika hasil tidak memenuhi standar paket:

> **Analisis belum memenuhi standar Jejak. Kredit Lo dikembalikan.**

Partial refund dapat disiapkan di arsitektur, tetapi V1 boleh menggunakan model refund penuh bila minimum deliverable tidak terpenuhi agar ledger tetap sederhana.

---

# 50. Failure Behavior

Jejak harus tetap usable jika:

- Gemini mati;
- Groq mati;
- realtime mati;
- satu source berubah format;
- AI mengembalikan jawaban kosong;
- WebGL gagal;
- haptic gagal;
- satu widget error;
- PWA lama;
- internet user putus.

AI bukan dependency untuk login, Case, wallet, payment, RDAP, DNS, phone validation, Pwned Passwords, dan hasil lama.

---

# 51. Performance Telemetry

Owner harus dapat melihat kesehatan pengalaman pengguna, bukan cuma server.

Metrik:

- app startup;
- workspace switch;
- Case open;
- graph ready;
- top-up panel;
- upload processing;
- scan duration;
- crash/error rate;
- browser split;
- PWA version adoption.

NADI dapat memberikan insight seperti:

> “Brave Android mulai lebih lambat membuka Graph setelah versi X.”

---

# 52. Browser dan PWA QA

Minimum matrix:

- Brave Android
- Brave Desktop
- Chrome Android
- Chrome Desktop
- Safari iPhone real-device bila tersedia
- Safari/iPad bila tersedia
- PWA standalone iOS
- PWA standalone Android/Chromium
- Edge
- Firefox

Agent tidak boleh mengklaim Safari real-device lulus jika belum diuji.

Status boleh:

> **Core selesai, Safari real-device masih perlu validasi.**

---

# 53. Metrics Produk

## 53.1 Acquisition

- landing visitor → login;
- referral → signup;
- demo interaction → login.

## 53.2 Activation

- login → first scan;
- first scan selesai;
- user buka hasil;
- user memahami hasil;
- user simpan Case.

## 53.3 Monetization

- free → top-up;
- top-up initiated → proof uploaded;
- proof uploaded → approved;
- average top-up;
- package mix;
- credit sold vs used;
- bonus credit ratio.

## 53.4 Retention

- user kembali;
- Case re-open;
- scan repeat;
- monitoring activation V1.5;
- Jejak Gue usage;
- partner repeat usage.

## 53.5 Product Quality

- scan success;
- refund rate;
- source failure;
- AI satisfaction;
- error rate;
- PWA update adoption;
- performance regression.

---

# 54. Funnel Utama

User baru:

> Landing → Google Login → Pemeriksaan pertama → Reveal → Hasil → Teaser premium → Top-up → Approval → Lanjut analisis → Simpan Kasus → Share Safe Card

NADI harus dapat membaca titik drop funnel.

---

# 55. Soft Selling

Soft selling Jejak harus datang dari **value nyata**.

Contoh:

> **Ada 5 hubungan lain yang belum dianalisis.**
>
> Buka dengan Analisis Gabungan · 7 Kredit

Bukan banner beli kredit terus-menerus.

Free user tetap melihat fitur premium.

Graph free dapat menampilkan siluet node:

> **3 jejak belum dianalisis**

Bukan blur paywall murahan.

---

# 56. V1 — Harus Bisa Dijual

V1 wajib mencakup setidaknya:

## Product Core

- Landing satu layar
- Demo fiktif interaktif lokal
- Google OAuth
- App Shell
- Beranda
- Periksa
- Kasus
- Jejak Gue
- Dompet Kredit
- Kabar Jejak
- Mata Jejak
- PWA install/update
- Kembali
- Segarkan

## OSINT Core

- 5 input
- RDAP
- DNS
- libphonenumber/local validation
- Pwned Passwords
- GitHub/GitLab optional public presence
- Public Page Collector untuk URL publik diketahui
- Source Registry
- Evidence Passport
- contradiction
- Relationship Graph
- score separation

## Credit & Business

- server-side credit ledger
- reservation
- settlement/refund
- expiry
- grace period
- price config
- package config
- manual BCA payment
- upload proof
- Payment Sentinel screening
- admin approval

## Admin

- Ruang Kendali
- Ringkasan
- Pembayaran
- Pengguna
- Partner basic
- Bisnis config
- Sistem
- Analitik dasar
- NADI basic operational briefing
- feature flag
- maintenance
- Proteksi Darurat

## Partner Foundation

- Affiliate dasar
- Reseller dasar
- Mitra approval
- role/entitlement
- partner freeze

## Quality

- RLS
- Storage private
- deletion lifecycle
- audit
- logging
- error codes
- performance telemetry
- PWA versioning
- QA browser

---

# 57. V1.5 — Retention dan Profesionalisasi

V1.5 diarahkan untuk:

- Pantau Jejak;
- snapshot comparison;
- Jejak Perubahan;
- Mitra Workspace lebih matang;
- collaboration Case;
- Tim Mitra;
- laporan/export lebih matang;
- AI Simulasi Skenario;
- AI Tantang Kesimpulan lebih dalam;
- Partner analytics;
- NADI advisor lebih kuat;
- weekly summary;
- monitoring center;
- Client Workspace penuh.

Fondasi datanya disiapkan dari V1 agar tidak perlu redesign besar.

---

# 58. V2 — Upgrade Otak dari Revenue

V2 hanya dilakukan setelah V1 menghasilkan modal/demand.

Target upgrade:

- breach intelligence email premium;
- broad web-search API proper;
- premium reputation sources;
- richer historical intelligence;
- payment gateway;
- bank reconciliation resmi jika tersedia;
- monitoring lebih kaya;
- partner marketplace bila terbukti dibutuhkan;
- advanced business intelligence.

---

# 59. Non-Goals V1

V1 tidak bertujuan menjadi:

- database tuduhan crowdsourced;
- marketplace jasa Mitra;
- mass people-search engine;
- bulk enumeration tool;
- full SIEM;
- full accounting system;
- payment gateway otomatis;
- browser stealth scraping framework;
- social network;
- CRM enterprise kompleks.

---

# 60. Keputusan yang Tidak Boleh Diimprovisasi Agent

Agent dilarang mengubah sendiri prinsip berikut:

1. seluruh UI Bahasa Indonesia;
2. tidak ada page scroll panjang;
3. touch vs cursor adaptive;
4. motion tidak boleh mati total hanya karena reduced-motion;
5. saldo dipotong server-side;
6. credit ledger tidak boleh satu angka mutable tanpa transaksi;
7. Owner default tetap bisa menjadi user biasa;
8. rekening/metode pembayaran admin-configurable;
9. payment proof tidak auto-approve oleh AI;
10. source/AI tidak boleh mengarang fakta;
11. user dengan kredit besar tetap tidak boleh mass harvest tanpa batas;
12. source registry modular;
13. PWA harus punya Pasang Jejak, Kembali, Segarkan, version update;
14. RLS deny-by-default;
15. secret tidak boleh ada di frontend;
16. semua fitur besar baru harus feature-flag-able;
17. error/performance regression dianggap bug;
18. agent tidak boleh menyatakan selesai bila quality gates kritis belum lulus.

Jika perlu menyimpang karena blocker nyata, keputusan harus dicatat di `.notes/DECISIONS.md` dengan alasan dan dampaknya.

---

# 61. Definition of Product Success

Jejak dianggap berhasil secara produk jika:

1. user baru memahami fungsi utama tanpa manual panjang;
2. pemeriksaan pertama memberi wow moment yang nyata;
3. user memahami perbedaan fakta, sinyal, dan dugaan;
4. top-up terasa natural, bukan agresif;
5. Owner bisa menjalankan bisnis dari HP tanpa buka kode;
6. perpindahan menu terasa seperti native app;
7. PWA tidak stale setelah deployment baru;
8. user dengan device/browser berbeda tetap mendapat pengalaman premium;
9. satu provider mati tidak membuat Jejak mati;
10. satu user tidak bisa melihat data user lain;
11. kredit tidak bisa double-spend/double-credit;
12. pembayaran manual dapat diaudit;
13. partner program tidak bisa menciptakan value dari udara;
14. agent berikutnya dapat melanjutkan proyek tanpa wawancara ulang panjang;
15. produk bisa menghasilkan revenue untuk membiayai upgrade source/API berikutnya.

---

# 62. Handoff Requirement untuk Agent Coding

Sebelum mengimplementasikan fitur apa pun, Agent Coding wajib memahami bahwa:

- PRD adalah source of truth produk;
- detail visual ada di DESIGN_SYSTEM/WIRE_MAP;
- detail permission/RLS di SCHEMA;
- urutan kerja di ROADMAP;
- syarat selesai di ACCEPTANCE_TESTS;
- aturan agent di AGENTS;
- status lintas-agent di STATUS_PROJECT;
- keputusan lintas-agent di DECISIONS.

Agent harus memanfaatkan skill/tool global yang tersedia di environment setelah memeriksanya terlebih dahulu.

Agent wajib menghindari membaca ulang seluruh blueprint tanpa alasan pada setiap sesi. Alur handoff ideal:

1. baca `.notes/STATUS_PROJECT.md`;
2. baca `.notes/DECISIONS.md`;
3. baca bagian blueprint yang relevan dengan pekerjaan saat ini;
4. lanjut kerja;
5. update status/decisions setelah milestone, blocker, QA, deploy, atau sebelum pindah agent.

---

# 63. Ringkasan Prinsip Jejak

Jejak harus selalu terasa seperti ini:

> **Powerful tanpa sok tahu.**  
> **Premium tanpa norak.**  
> **Cepat tanpa ceroboh.**  
> **Menguntungkan tanpa dark pattern.**  
> **Membantu investigasi tanpa mengubah dugaan menjadi fakta.**  
> **AI membantu manusia memahami evidence, bukan menggantikan evidence.**  
> **Owner dapat menjalankan bisnis tanpa bongkar kode.**  
> **Setiap agent dapat melanjutkan pekerjaan tanpa membuat Bos mengulang semuanya dari nol.**

---

# 64. Status Keputusan PRD

Dokumen ini dianggap **locked sebagai PRD awal** untuk implementasi Jejak.

Perubahan setelah coding dimulai harus:

1. tidak diam-diam mengubah prinsip inti;
2. dicatat di `.notes/DECISIONS.md`;
3. mencantumkan alasan;
4. mencantumkan dampak;
5. mencantumkan dokumen/fitur yang terdampak;
6. bila perubahan besar, sinkronkan kembali PRD/Design/Schema/Roadmap agar source of truth tetap konsisten.

---

**END OF `docs/PRD.md`**
