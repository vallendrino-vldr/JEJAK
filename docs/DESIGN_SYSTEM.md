# DESIGN SYSTEM — JEJAK

> **Dokumen aturan visual, interaksi, motion, bahasa UI, responsivitas, PWA, dan kualitas pengalaman Jejak**  
> Produk: **Jejak**  
> Domain target: **jejak.my.id**  
> Status: **Source of truth desain**  
> Fase: **Blueprint sebelum implementasi**  
> Bahasa UI: **Bahasa Indonesia penuh, sehari-hari, humble, elegan, tidak kaku, tidak kampungan**

---

# 0. Tujuan Dokumen

Dokumen ini menentukan **bagaimana Jejak harus terlihat, terasa, bergerak, merespons, menjelaskan diri, dan beradaptasi di berbagai perangkat**.

Dokumen ini bukan katalog dekorasi. Semua keputusan visual harus mendukung minimal salah satu dari lima tujuan:

1. membuat Jejak terasa premium dan dipercaya;
2. membuat pengguna awam tetap cepat paham;
3. membuat interaksi terasa seperti native app;
4. menjaga performa tetap tinggi di perangkat/browser yang berbeda;
5. membuat data, risiko, dan ketidakpastian mudah dibaca tanpa sensasi berlebihan.

Jika implementasi secara teknis bekerja tetapi melanggar rasa, hierarchy, behavior, aksesibilitas, atau motion contract di dokumen ini, implementasi **belum dianggap selesai**.

Dokumen terkait:

- `docs/PRD.md` → tujuan produk dan perilaku fitur;
- `docs/WIRE_MAP.md` → struktur layar dan alur panel;
- `docs/SCHEMA.md` → data dan permission;
- `docs/ACCEPTANCE_TESTS.md` → kondisi yang wajib lulus;
- `.notes/AGENTS.md` → cara Agent Coding bekerja;
- `.notes/STATUS_PROJECT.md` → status implementasi lintas-agent;
- `.notes/DECISIONS.md` → keputusan implementasi yang dibuat selama coding.

Jika Agent Coding harus mengambil keputusan desain kecil yang tidak tercakup di sini, pilih opsi yang paling konsisten dengan prinsip dokumen ini dan catat keputusan penting di `.notes/DECISIONS.md`.

---

# 1. Identitas Visual Inti

## 1.1 Nama Produk

Nama publik:

> **Jejak**

Tulisan brand harus terasa tenang dan berkelas. Jangan dibuat seperti software militer palsu, game hacker, atau terminal cyberpunk.

Brand promise utama:

> **Periksa sebelum percaya.**

Filosofi internal:

> **Jejak tidak mencari ketakutan. Jejak mencari kejelasan.**

Kedua kalimat ini menjadi filter desain. Visual yang menakut-nakuti, bombastis, atau terlalu menyeramkan harus ditolak meskipun terlihat “keren”.

## 1.2 Arah Visual

Arah visual final:

> **Luxury Digital Security + Intelligence Instrument**

Campuran:

- high-end skeuomorphism modern;
- dark titanium;
- smoked glass;
- depth presisi;
- tactile controls;
- pencahayaan halus;
- motion ringan;
- sedikit aura ruang intelijen saat mode pemeriksaan/Case aktif;
- tetap ramah untuk pengguna awam.

Bukan:

- neumorphism lembek;
- cyberpunk hijau neon;
- “hacker hoodie” aesthetic;
- Matrix rain;
- dashboard enterprise generik;
- warna pelangi untuk setiap status;
- glassmorphism berlebihan;
- card SaaS putih dengan shadow default;
- efek 3D besar yang mengorbankan performa.

## 1.3 Kata Kunci Rasa

Setiap layar harus terasa minimal memenuhi sebagian besar kata berikut:

- presisi;
- tenang;
- taktil;
- mahal;
- modern;
- misterius secukupnya;
- jelas;
- aman;
- responsif;
- manusiawi.

Kata yang harus dihindari:

- norak;
- heboh;
- intimidatif;
- terlalu gamer;
- terlalu teknis;
- ramai;
- penuh gimmick;
- murahan;
- menipu.

---

# 2. Prinsip Desain yang Tidak Boleh Dilanggar

## 2.1 Native-App Feel

Setelah login, Jejak harus terasa seperti aplikasi native yang berjalan di web/PWA.

Artinya:

- satu App Shell memenuhi viewport;
- navigasi utama persisten;
- tidak ada page reload saat pindah workspace;
- perpindahan tab terasa instan;
- panel dan sheet terbuka lokal tanpa menunggu server;
- state yang sudah ada dipertahankan selama masuk akal;
- data terbaru menyusul tanpa menghalangi user;
- tombol Kembali dan Segarkan tersedia di UI PWA;
- main page tidak menjadi halaman panjang seperti landing page blog.

Hukum:

> **NO PAGE SCROLL, bukan NO SCROLL.**

Konten panjang boleh scroll di area internal yang jelas.

## 2.2 Core Layer Tidak Boleh Bergantung pada Luxury Layer

Setiap fitur visual dibagi mental menjadi tiga lapisan:

### Core Layer

Harus selalu bekerja:

- layout;
- text;
- button;
- navigation;
- input;
- status;
- graph dasar;
- feedback utama.

### Motion Layer

Memperkaya pengalaman:

- press animation;
- transisi panel;
- reveal;
- subtle fade;
- relationship node transition;
- progress motion.

### Luxury Layer

Dekorasi premium:

- reflection;
- dynamic light;
- parallax ringan;
- 3D depth tambahan;
- particle/radar dekoratif;
- glass distortion tertentu.

Jika Luxury Layer gagal, Motion + Core tetap bekerja.

Jika Motion Layer dibatasi browser/user/device, Core tetap terlihat dan usable.

Tidak boleh ada komponen yang default-nya `invisible` lalu hanya menjadi terlihat jika animation callback berhasil.

## 2.3 Kecepatan Adalah Bagian dari Desain

UI cantik tetapi lambat dianggap desain gagal.

Target rasa:

- feedback tap/click: seketika;
- panel lokal: langsung;
- perpindahan workspace hangat: terasa instan;
- data lama yang aman boleh tampil dahulu lalu revalidate;
- scan eksternal tidak membekukan UI;
- skeleton hanya untuk data yang belum pernah tersedia.

Jika update membuat interaksi yang sebelumnya instan menjadi terasa lambat secara konsisten, itu **performance regression dan harus dianggap bug**.

## 2.4 Touch dan Cursor Bukan Interaksi yang Sama

Jejak tidak boleh hanya responsive secara ukuran.

Jejak harus **adaptive secara cara interaksi**.

Mobile/touch:

- tap;
- long press sebagai shortcut opsional;
- swipe hanya jika mudah ditemukan dan punya alternatif tombol;
- bottom sheet;
- bottom navigation;
- thumb-friendly primary actions;
- touch target besar.

Desktop/pointer:

- click;
- hover enhancement;
- context menu sebagai shortcut opsional;
- sidebar;
- multi-panel;
- keyboard shortcut bila membantu.

Hukum:

> Tidak ada fitur penting yang hanya bisa ditemukan lewat hover, klik kanan, swipe tersembunyi, atau long press.

Hybrid device harus nyaman untuk touch dan pointer sekaligus.

## 2.5 Progressive Disclosure

Jejak kuat, tetapi tidak boleh menumpahkan seluruh informasi sekaligus.

Urutan umum:

1. jawab inti;
2. tunjukkan ringkasan;
3. tawarkan “Kenapa?”;
4. buka evidence;
5. buka detail teknis hanya jika diminta.

Ini berlaku untuk:

- skor;
- hasil scan;
- AI;
- graph;
- timeline;
- admin analytics;
- error;
- payment screening.

## 2.6 Jangan Menggunakan Ketakutan sebagai Conversion

Jangan memakai:

- merah berkedip hanya untuk menarik perhatian;
- animasi sirene;
- copy “BAHAYA!!!”;
- countdown palsu;
- risiko yang dibesar-besarkan;
- hasil sengaja dibuat menyeramkan untuk mendorong top-up.

Upsell harus lahir dari value nyata:

> “Ada 4 hubungan lain yang belum dianalisis.”

bukan:

> “Bayar sekarang sebelum terlambat.”

---

# 3. Bahasa Visual: Obsidian Intelligence

Nama internal bahasa desain:

> **Obsidian Intelligence**

Nama ini tidak perlu ditampilkan ke user.

## 3.1 Material Utama

### Dark Titanium

Dipakai untuk:

- struktur utama;
- navigation;
- primary controls;
- panel penting;
- search console.

Karakter:

- gelap;
- tidak pure black;
- sedikit metallic depth;
- refleksi sangat halus;
- terasa padat.

### Smoked Glass

Dipakai untuk:

- overlay;
- secondary surface;
- sheet;
- floating panel;
- locked/premium node;
- temporary reveal.

Glass tidak boleh digunakan di semua tempat.

Aturan:

> Glass adalah aksen material, bukan default untuk setiap container.

### Matte Carbon

Dipakai untuk:

- background area kerja;
- graph canvas;
- low-priority surfaces.

Tujuan:

- mengurangi visual noise;
- membuat object penting terasa lebih hidup.

## 3.2 Depth

Depth harus terasa dari kombinasi:

- tonal separation;
- border highlight;
- inner shadow ringan;
- outer shadow terkontrol;
- subtle specular highlight;
- motion press/release.

Jangan membuat semua card “mengambang”.

Hierarchy depth:

1. background;
2. embedded surface;
3. standard interactive surface;
4. focused/selected surface;
5. overlay/sheet;
6. critical modal.

## 3.3 Pencahayaan

Pencahayaan mengikuti prinsip:

- satu arah utama yang konsisten;
- tidak berubah liar per card;
- hover/pointer boleh menggeser highlight sedikit;
- touch press meredupkan highlight dan menekan depth;
- scan mode boleh menambah directional light lembut.

Tidak boleh:

- glow neon besar;
- RGB cycling;
- reflection berlebihan;
- continuous shimmer di semua card.

---

# 4. Warna

## 4.1 Filosofi Warna

Jejak harus dominan netral gelap.

Warna status digunakan hemat sehingga memiliki makna.

Kategori warna konseptual:

- **Obsidian / Charcoal** → background;
- **Titanium / Warm Silver** → struktur dan teks sekunder;
- **Soft Ivory** → teks utama;
- **Signal Amber** → perlu perhatian;
- **Controlled Crimson** → risiko tinggi/error serius;
- **Calm Green** → berhasil/normal/terverifikasi;
- **Cool Cyan/Steel Blue** → informasi teknis/aktif/fokus bila dibutuhkan.

Agent boleh menentukan nilai warna final saat implementasi awal, tetapi harus mempertahankan hubungan dan rasa di atas. Nilai final wajib dikonsolidasikan sebagai design tokens dan dicatat di `.notes/DECISIONS.md` jika berbeda dari seed awal.

## 4.2 Pure Black Dihindari

Background utama jangan `#000000` murni kecuali untuk situasi teknis tertentu.

Pure black cenderung:

- menghilangkan material depth;
- membuat glass sulit dibaca;
- memicu kontras terlalu keras;
- membuat desain terlihat generik.

Gunakan near-black dengan sedikit karakter tonal.

## 4.3 Status Warna

Warna tidak pernah menjadi satu-satunya pembeda status.

Contoh:

> **Sinyal Risiko — Tinggi**

harus punya:

- label teks;
- icon/symbol;
- hierarchy visual;
- warna pendukung.

Aksesibilitas warna wajib dijaga.

## 4.4 Premium Locked State

Node/fitur premium jangan ditutup dengan blur besar.

Gunakan:

- smoked silhouette;
- geometric placeholder;
- subtle lock glyph SVG;
- label seperti “3 hubungan lain”.

Tujuan:

- membuat user melihat ada value;
- tidak terasa seperti paywall murahan.

---

# 5. Tipografi

## 5.1 Karakter Tipografi

Tipografi harus:

- modern;
- human-readable;
- jelas pada layar kecil;
- tetap elegan;
- tidak sci-fi berlebihan;
- tidak decorative untuk body text.

Brand/logo boleh memiliki karakter lebih khas.

Body/UI text harus memakai font yang sangat terbaca.

Agent dilarang menggunakan font yang:

- terlalu sempit;
- terlalu tipis;
- susah dibaca di Android low-density;
- membuat angka finansial sulit dibedakan.

## 5.2 Hierarki

Gunakan hierarchy konseptual:

### Display

Untuk:

- hero landing;
- hasil reveal utama;
- skor besar.

### Title

Untuk:

- nama workspace;
- nama Kasus;
- sheet title.

### Section

Untuk:

- kelompok evidence;
- group settings.

### Body

Untuk:

- penjelasan;
- narasi AI;
- help.

### Label

Untuk:

- form;
- tabs;
- metadata.

### Micro

Untuk:

- timestamp;
- source metadata;
- helper copy;
- ID internal user-facing tertentu.

## 5.3 Angka

Angka penting harus cepat dipindai:

- saldo kredit;
- nominal top-up;
- skor;
- jumlah temuan;
- revenue admin.

Gunakan tabular numbers jika pilihan font mendukung.

Rp harus ditampilkan konsisten.

Tidak perlu desimal untuk nilai rupiah normal jika tidak dibutuhkan.

## 5.4 Jangan Gunakan ALL CAPS Berlebihan

ALL CAPS boleh untuk:

- code/status teknis internal tertentu;
- tiny instrument label.

UI user sebaiknya menggunakan sentence/title case Indonesia normal.

Jangan:

> PEMBAYARAN BERHASIL

Lebih baik:

> **Pembayaran disetujui**

---

# 6. Ikonografi

## 6.1 SVG, Bukan Emoji

Emoji di brainstorming tidak menjadi bahasa visual produk.

Produk menggunakan:

- SVG;
- satu icon family;
- stroke konsisten;
- proporsi geometris;
- radius konsisten;
- bentuk sederhana;
- mudah dibaca pada 16–24 px.

## 6.2 Karakter Ikon

Ikon harus terasa:

- presisi;
- elegan;
- teknis secukupnya;
- tidak lucu;
- tidak terlalu tajam/agresif.

## 6.3 Daftar Ikon Inti

Minimal harus tersedia konsisten untuk:

- Beranda;
- Periksa;
- Kasus;
- Jejak Gue;
- Kembali;
- Segarkan;
- Pasang Jejak;
- Dompet Kredit;
- Kabar Jejak;
- Akun;
- Mata Jejak;
- Cari;
- Filter;
- Timeline;
- Bukti;
- Hubungan;
- Konflik;
- Peringatan;
- Berhasil;
- Informasi;
- AI;
- Mitra;
- Affiliate;
- Reseller;
- Admin;
- Pengaturan;
- Pembayaran;
- Salin;
- Upload;
- Hapus;
- Arsip/Tempat Sampah;
- Rahasia;
- Bagikan;
- Export;
- Source;
- Sistem;
- Analitik;
- NADI.

## 6.4 Ikon Tidak Menggantikan Label pada Aksi Penting

Untuk aksi berisiko/finansial:

> icon + text

Contoh:

> **Setujui pembayaran**

bukan tombol checkmark tanpa label.

---

# 7. App Shell dan Layout Global

## 7.1 Prinsip App Shell

Setelah login, seluruh pengalaman hidup dalam satu shell persisten.

Elemen yang sebisa mungkin tidak remount saat navigasi normal:

- background utama;
- navigation;
- header/top rail;
- saldo kredit;
- Kabar Jejak;
- Mata Jejak;
- session context;
- global running-scan indicator.

Yang berganti:

> **workspace utama.**

## 7.2 Viewport

Jejak harus mengikuti viewport aktual perangkat, termasuk:

- browser chrome mobile yang berubah tinggi;
- notch;
- safe area;
- standalone PWA;
- soft keyboard;
- landscape.

Tidak boleh mengandalkan fixed viewport assumption yang membuat elemen bawah tertutup toolbar/keyboard.

## 7.3 No Page Scroll

Root application shell tidak boleh menjadi halaman panjang.

Jika konten melebihi ruang:

- list scroll dalam pane;
- detail scroll dalam sheet;
- graph tetap punya canvas sendiri;
- table desktop punya viewport internal;
- mobile menggunakan panel bertingkat.

Scrollbar desktop harus halus dan tidak merusak material visual.

## 7.4 Mobile Navigation

Navigasi utama user:

1. **Beranda**
2. **Periksa**
3. **Kasus**
4. **Jejak Gue**

Pola:

- fixed/persistent bottom navigation;
- aman terhadap safe-area;
- maksimal empat item utama agar tidak penuh;
- active state jelas tanpa warna berlebihan;
- label tetap terlihat, bukan icon-only.

Dompet, Kabar, Akun, dan Mata Jejak adalah global controls, bukan tab utama tambahan.

## 7.5 Desktop Navigation

Desktop menggunakan sidebar/rail compact.

Karakter:

- tidak terlalu lebar;
- workspace menjadi fokus;
- navigation icon + label;
- active section tactile;
- collapse hanya jika benar-benar memberi value.

Jangan membuat sidebar enterprise 280 px penuh menu nested jika tidak dibutuhkan.

## 7.6 Tablet

Tablet boleh memakai split navigation antara:

- rail;
- workspace;
- detail panel.

Jangan hanya memperbesar versi mobile.

## 7.7 Admin App Shell

Ruang Kendali punya context shell sendiri tetapi masih memakai bahasa desain Jejak.

Selalu ada:

> **Kembali sebagai Pengguna**

Owner harus bisa berpindah konteks tanpa logout.

Admin visual sedikit lebih instrument-like, tetapi tidak berubah menjadi terminal developer.

---

# 8. Grid, Spacing, Density

## 8.1 Sistem Spacing

Gunakan sistem spacing konsisten berbasis langkah kecil.

Tujuan:

- rhythm kuat;
- mudah dipindai;
- tidak cramped;
- tidak boros ruang.

Mobile lebih lega pada touch target, bukan berarti semua jarak besar.

Desktop boleh lebih padat tetapi tetap premium.

## 8.2 Density Levels

Tiga density kontekstual:

### Relaxed

Untuk:

- landing;
- onboarding;
- result reveal;
- empty state.

### Standard

Untuk:

- user dashboard;
- Case;
- profile;
- wallet.

### Dense

Untuk:

- admin tables;
- evidence metadata;
- logs;
- analytics.

Dense tidak boleh berarti teks mini dan touch target sempit pada mobile.

## 8.3 Alignment

Semua angka finansial, status, dan metadata harus punya alignment yang membuat scanning cepat.

Jangan menaruh konten penting di posisi random hanya demi visual asymmetry.

---

# 9. Touch Target, Cursor, dan Input Method

## 9.1 Touch Target

Visual control boleh slim, tetapi interactive hit area mobile harus cukup luas.

Jangan membuat icon 18 px dengan hit area 18 px.

Target sentuhan harus punya breathing room.

## 9.2 Hover

Hover hanya enhancement.

Boleh:

- menambah highlight;
- preview metadata;
- mengangkat node;
- mengungkap shortcut sekunder yang juga tersedia di detail.

Tidak boleh:

- menjadi satu-satunya cara membuka fitur;
- menyembunyikan CTA inti sampai pointer hover.

## 9.3 Long Press

Long press boleh mempercepat:

- quick action node;
- context action evidence;
- item list.

Tetapi semua aksinya harus tersedia lewat jalur biasa.

## 9.4 Keyboard

Desktop boleh mendukung shortcut seperti:

- `/` atau command search;
- Escape untuk menutup overlay;
- arrow navigation pada list;
- Enter untuk memilih.

Shortcut jangan menghalangi input normal.

## 9.5 Fokus Keyboard

Semua interactive controls harus punya focus state yang terlihat dan elegan.

Jangan menghapus focus outline tanpa replacement.

---

# 10. Motion Contract

## 10.1 Prinsip Utama

Motion Jejak harus:

- memberi feedback;
- menjelaskan perubahan state;
- menambah rasa material;
- memberi continuity;
- tidak menjadi tontonan sendiri.

## 10.2 Motion Harus Punya Alasan

Setiap motion harus menjawab salah satu:

- apa yang baru terjadi?
- ke mana objek pindah?
- apa yang sedang diproses?
- apa yang aktif?
- apa yang selesai?

Kalau tidak ada jawaban, motion kemungkinan dekoratif dan harus dipertanyakan.

## 10.3 Durasi Rasa

Agent tidak boleh membuat semua transisi dengan satu durasi default.

Kategori:

### Micro

Untuk:

- press;
- hover;
- toggle;
- icon response.

Harus sangat cepat.

### Panel

Untuk:

- sheet;
- drawer;
- tab workspace.

Cepat tetapi masih bisa diikuti mata.

### Reveal

Untuk:

- hasil scan;
- graph expansion;
- cinematic moment.

Boleh sedikit lebih panjang, tetapi jangan membuat user menunggu hasil yang sebenarnya sudah siap.

## 10.4 Easing

Material terasa berat dan premium.

Hindari:

- bounce kartun;
- elastic overshoot besar;
- linear robotic transition.

Gunakan ease yang terasa natural dan terkendali.

## 10.5 Tactile Press

Primary tactile control saat ditekan harus memberi kombinasi halus:

- depth turun;
- highlight berkurang;
- shadow memendek;
- tiny scale/depression jika sesuai;
- haptic jika tersedia.

Jangan membuat tombol shrink ekstrem.

## 10.6 Haptic

Haptic adalah enhancement.

Gunakan terutama pada:

- primary confirmation;
- scan start;
- scan reveal;
- payment approval mobile;
- destructive confirmation tertentu;
- successful credit update.

Tidak setiap tap perlu getar.

Jika browser/device tidak mendukung:

> tidak ada error, visual feedback tetap lengkap.

## 10.7 Reduced Motion

Reduced motion **bukan Static Mode**.

Jika user/browser meminta motion dikurangi:

Kurangi/ganti:

- parallax besar;
- perjalanan objek jauh;
- zoom besar;
- rotasi kontinu;
- particle berlebih;
- continuous ambient motion.

Tetap pertahankan:

- tactile press;
- focus/selection;
- subtle opacity transition;
- lighting response;
- state progress;
- micro-feedback.

Jejak tetap hidup.

## 10.8 Device Performance Adaptation

Visual engine konseptual:

- **Luxury** → device kuat;
- **Balanced** → default;
- **Light** → device berat;
- **Accessible Motion** → reduced-motion preference.

Mode tidak perlu diumumkan ke user.

Yang boleh dikurangi otomatis:

- jumlah particle;
- backdrop blur kompleks;
- multi-layer reflection;
- continuous decor animation;
- depth sekunder;
- graph decoration.

Yang tidak boleh dikurangi:

- readability;
- core feedback;
- status clarity;
- navigation response.

## 10.9 Motion Health

Ruang Kendali boleh mengagregasi secara privacy-safe:

- full motion sessions;
- reduced motion sessions;
- simplified renderer sessions;
- animation-related errors.

Tujuan:

> mendeteksi device/browser yang bermasalah.

---

# 11. Search Console — Signature Object

## 11.1 Peran

Search Console adalah hero object Jejak.

Orang idealnya bisa melihat screenshot UI dan mengenali Jejak dari objek ini.

## 11.2 Bentuk

Bukan input rectangle SaaS biasa.

Karakter:

- titanium/glass instrument;
- center focus;
- tactile;
- cukup besar untuk terasa penting;
- tetap sederhana;
- icon Mata Jejak atau signal element terintegrasi halus.

## 11.3 State

Minimal:

### Idle

> **Apa yang mau Lo periksa?**

Helper:

> Email, nomor HP, nama, username, atau domain.

### Focus

Input aktif, light response meningkat.

### Detected Type

Contoh:

> **Nomor HP terdeteksi**

atau:

> **Domain terdeteksi**

### Invalid

> **Kayaknya formatnya belum pas.**

### Ready

Primary action tersedia.

### Working

Input tidak berubah menjadi fake progress; pindah ke flow scan yang tepat.

## 11.4 Mobile

Tap Search Console harus:

- langsung fokus ke input;
- keyboard muncul tanpa layout rusak;
- primary action tetap terlihat atau mudah dicapai;
- bottom nav tidak menutupi keyboard/CTA.

## 11.5 Desktop

Hover boleh memberi subtle specular shift.

Tidak boleh ada parallax besar yang membuat teks/input bergerak menjauh dari cursor.

---

# 12. Landing Page Sebelum Login

## 12.1 Satu Viewport

Landing bukan sales page panjang.

Harus menampilkan dalam satu viewport utama:

- logo/brand;
- Mata Jejak;
- tagline;
- subcopy singkat;
- signature Search Console/demo;
- demo Kasus fiktif;
- CTA Google;
- Pasang Jejak jika relevan;
- helper “Bisa mulai gratis. Nggak perlu kartu kredit.”

Jika layar kecil sekali, internal safe scroll kecil boleh terjadi daripada memotong konten penting, tetapi desain tetap tidak boleh berubah menjadi halaman panjang.

## 12.2 Copy Utama

Tagline:

> **Periksa sebelum percaya.**

Subcopy seed:

> Cek paparan data, telusuri sinyal risiko, dan pahami jejak digital dengan lebih jelas.

CTA:

> **Mulai dengan Google**

Helper:

> Bisa mulai gratis. Nggak perlu kartu kredit.

## 12.3 Demo

Demo harus jelas berlabel:

> **Contoh pemeriksaan**

Data 100% dummy/local.

Jangan memanggil AI/OSINT provider nyata.

Tujuan demo:

- memperlihatkan reveal;
- graph mini;
- score explanation;
- premium feel.

Jangan membuat demo seolah hasil nyata user.

---

# 13. Onboarding

## 13.1 Tanpa Carousel Panjang

Tidak ada onboarding 7 slide wajib.

First-run overlay kecil:

> **Selamat datang di Jejak.**
>
> Lo bisa mulai dari email, nomor HP, nama, username, atau domain.

Primary:

> **Cek data gue**

Secondary:

> **Gue mau lihat-lihat dulu**

## 13.2 Pemeriksaan Pertama

Copy:

> **Pemeriksaan pertama Lo kami tanggung.**
>
> Biar Lo bisa lihat sendiri cara Jejak bekerja.

Hindari:

> “FREE 100%!!!”

## 13.3 Mode Dibantu

Jika user sering membuka bantuan/terlihat mengalami friction, offer:

> **Mau Jejak bantu lebih banyak selama Lo pakai aplikasi?**

Mode Dibantu:

- helper text sedikit lebih sering;
- CTA lebih deskriptif;
- istilah teknis dijelaskan otomatis;
- tidak mengubah kemampuan produk.

User bisa:

> **Kurangi bantuan**

---

# 14. Navigasi dan Global Controls

## 14.1 Saldo Kredit

Saldo harus selalu mudah ditemukan setelah login.

Contoh:

> **27 Kredit**

Tap/click membuka Dompet Kredit sebagai panel/sheet.

Jangan membuat saldo seperti tombol iklan top-up.

## 14.2 Kabar Jejak

Gunakan icon SVG konsisten.

Unread indicator:

- titik kecil;
- tidak berkedip;
- tidak merah besar kecuali benar-benar urgent.

## 14.3 Mata Jejak

Mata Jejak adalah global assistant/help entry.

State:

- idle;
- notice;
- listening/assistant active;
- subtle reaction.

Jangan membuatnya terus mengikuti cursor secara agresif.

## 14.4 Kembali

PWA selalu memiliki tombol **Kembali** saat konteks membutuhkan.

Kembali harus mengikuti hierarchy aplikasi, bukan asal browser history jika itu membuat user keluar dari flow.

## 14.5 Segarkan

Button:

> **Segarkan**

Perilaku visual:

- immediate press feedback;
- small progress indicator;
- tidak reload seluruh shell jika tidak perlu.

Result copy:

> **Sudah paling baru.**

atau jika update:

> **Ada versi Jejak yang lebih baru.**

---

# 15. Panels, Sheets, Drawers, Modals

## 15.1 Mobile

Prefer:

- bottom sheet;
- full-height sheet jika detail kompleks;
- layered navigation.

Sheet harus:

- punya drag handle bila gesture didukung;
- punya tombol close/back yang nyata;
- tidak hanya mengandalkan swipe-down.

## 15.2 Desktop

Prefer:

- right-side detail pane;
- popover untuk hal kecil;
- modal hanya untuk blocking/critical confirmation.

## 15.3 Critical Modal

Digunakan untuk:

- hapus permanen;
- action finansial tertentu;
- perubahan rekening;
- role high privilege;
- destructive operation.

Critical modal harus menyebut konsekuensi, bukan sekadar “Yakin?”.

---

# 16. Tombol

## 16.1 Primary

Digunakan satu per konteks utama.

Contoh:

> **Mulai pemeriksaan**

> **Setujui pembayaran**

Visual:

- tactile titanium;
- clear text;
- cukup contrast;
- premium press.

## 16.2 Secondary

Untuk alternative action.

Contoh:

> **Lihat dulu**

## 16.3 Tertiary/Ghost

Untuk detail ringan:

> **Kenapa?**

> **Lihat sumber**

## 16.4 Destructive

Gunakan controlled crimson.

Label harus eksplisit:

> **Hapus Kasus**

bukan:

> **Lanjut**

## 16.5 Loading Button

Button yang sedang submit:

- tetap punya ukuran sama;
- text boleh berubah;
- spinner/progress kecil;
- mencegah duplicate click;
- UI bukan satu-satunya duplicate protection.

---

# 17. Form, Input, Validation

## 17.1 Bahasa Form

Label harus natural.

Jangan:

> `Account Identifier`

Lebih baik:

> **Email, nomor, nama, username, atau domain**

## 17.2 Placeholder

Placeholder membantu contoh, bukan menggantikan label.

Contoh:

> `nama@email.com`

> `0812...`

## 17.3 Validation

Validation muncul dekat sumber masalah.

Contoh:

> **Kayaknya format emailnya belum pas.**

Bukan:

> `Invalid input`.

## 17.4 Jangan Menghapus Input User saat Error

Jika server gagal:

- input tetap ada;
- catatan tidak hilang;
- selected Case tetap ada;
- user bisa retry.

## 17.5 Sensitive Input

Password exposure input:

- jelas bahwa password tidak disimpan;
- tidak ada logging value;
- tidak ada helper yang echo password kembali;
- visibility toggle jika dibutuhkan harus aman dan eksplisit.

Copy seed:

> **Password Lo nggak disimpan oleh Jejak.**

---

# 18. Feedback State

Setiap fitur wajib memiliki state yang didesain, bukan hanya happy path.

## 18.1 Idle

User belum melakukan tindakan.

## 18.2 Working

Sistem sedang bekerja.

## 18.3 Success

Action berhasil.

## 18.4 Partial Success

Sebagian source berhasil.

## 18.5 Empty

Tidak ada data/hasil.

## 18.6 Warning

Ada sesuatu yang perlu diperhatikan.

## 18.7 Error

Operasi belum berhasil.

## 18.8 Offline

Koneksi terganggu.

## 18.9 Stale

Data lama tampil sambil revalidate.

## 18.10 Permission Denied

User tidak berhak.

## 18.11 Maintenance

Fitur sementara tidak tersedia.

Agent tidak boleh menunggu QA menemukan state kosong yang tidak didesain.

---

# 19. Loading dan Progress

## 19.1 Tidak Ada Global Spinner untuk Operasi Lokal

Jika graph loading:

> graph yang loading.

Navigation tetap hidup.

## 19.2 Data Lama Lebih Baik daripada Skeleton jika Aman

Jika user pernah membuka Case:

- tampilkan state terakhir;
- tandai sedang menyegarkan bila perlu;
- revalidate diam-diam.

## 19.3 Skeleton

Gunakan hanya bila:

- data belum pernah tersedia;
- bentuk content cukup diketahui.

Skeleton tidak perlu shimmer besar terus-menerus.

Reduced motion menggunakan static/subtle placeholder.

## 19.4 Scan Progress

Jika progress persentase tidak nyata, jangan mengarang angka.

Gunakan tahapan:

1. **Menyiapkan pemeriksaan**
2. **Memeriksa sumber**
3. **Membandingkan temuan**
4. **Mencari ketidaksesuaian**
5. **Menyusun hasil**

Jika tahap tertentu tidak relevan, jangan tampilkan hanya demi animasi.

## 19.5 Running Scan Indicator

Jika user pindah workspace, ada indikator global halus:

> **1 pemeriksaan berjalan**

Tap membuka detail/progress.

---

# 20. Result Reveal

## 20.1 Reveal Bukan Fake Loading

Setelah scan benar-benar selesai, tampilkan cinematic reveal singkat.

Flow:

1. subtle pause;
2. haptic jika tersedia;
3. kartu hasil utama;
4. primary button **Buka hasil**;
5. graph/detail dibuka.

Contoh:

> **7 jejak ditemukan**
>
> 3 perlu perhatian  
> 2 perlu diverifikasi  
> 2 terlihat normal

Primary:

> **Buka hasil**

## 20.2 Jangan Memperpanjang Reveal

Reveal tidak boleh menjadi 3–5 detik hanya untuk gaya.

User sudah menunggu mesin bekerja.

## 20.3 Result Summary

Tampilkan maksimal informasi inti:

- satu headline;
- 2–4 facts;
- action jelas.

Detail masuk progressive disclosure.

---

# 21. Skor dan Risk UI

Jejak mempunyai konsep terpisah:

- Tingkat Kecocokan;
- Paparan Digital;
- Sinyal Risiko;
- Kelengkapan Analisis.

Jangan menggabungkan semua menjadi satu angka “risk score”.

## 21.1 Tingkat Kecocokan

Tujuan:

> seberapa kuat beberapa evidence mengarah ke hubungan/entitas yang sama.

Label:

> **Tingkat Kecocokan**

Copy penjelasan:

> Menunjukkan seberapa kuat bukti yang ditemukan mengarah ke hubungan yang sama. Bukan kepastian identitas.

## 21.2 Paparan Digital

Khusus konteks perlindungan diri.

Label:

> **Paparan Digital**

Jangan menyebut:

> “skor bahaya”.

## 21.3 Sinyal Risiko

Gunakan kategori manusia:

- Rendah;
- Sedang;
- Tinggi;
- Belum cukup data.

Hindari:

> “91% penipu”.

## 21.4 Kelengkapan Analisis

Contoh:

> **Kelengkapan analisis: 82%**

Ini memberi tahu coverage eksekusi, bukan kebenaran hasil.

## 21.5 Risk Visualization

Boleh menggunakan instrument gauge/bar tetapi:

- tidak seperti speedometer game;
- tidak terlalu banyak arc;
- label tetap prioritas;
- color + text.

---

# 22. Evidence Passport UI

Setiap evidence detail harus bisa menampilkan minimal:

- apa temuannya;
- sumber;
- jenis evidence;
- kapan ditemukan;
- hubungannya dengan target;
- kekuatan/keandalan jika relevan;
- apakah ada konflik.

## 22.1 Jenis Evidence

Visual categories:

### Fakta terverifikasi

Symbol paling solid.

### Sinyal

Lebih ringan.

### Korelasi

Relationship-oriented.

### Inferensi AI

Harus terlihat berbeda sehingga user tidak menganggapnya sumber primer.

### Bukti dari pengguna

Harus jelas bahwa berasal dari user.

## 22.2 Source Link

Jika user boleh membuka sumber:

> **Lihat sumber**

Jangan tampilkan URL panjang mentah sebagai body text kecuali Mode Bukti membutuhkan.

## 22.3 Evidence Conflict

Jika evidence bertentangan:

> **Ada yang nggak cocok**

atau dalam mode lebih formal:

> **Ketidaksesuaian ditemukan**

Jangan diam-diam memilih satu sumber.

---

# 23. Relationship Graph

## 23.1 Peran Visual

Relationship Graph adalah salah satu signature experiences Jejak.

Ia harus terasa seperti alat analisis, bukan dekorasi sci-fi.

## 23.2 Node Types

Minimal visual distinction untuk:

- Nama/identitas;
- Nomor HP;
- Email;
- Username;
- Domain;
- Public profile/source;
- Breach event jika source tersedia;
- User evidence;
- unknown/locked relationship.

Gunakan:

- glyph;
- shape variation halus;
- label;
- material treatment.

Jangan hanya mengandalkan warna.

## 23.3 Relationship Types

### Terhubung langsung

Garis solid.

### Kemungkinan terhubung

Garis putus/segmented.

### Kesamaan pola

Garis lebih tipis/lemah.

### Konflik

Visual relationship khusus yang jelas namun tidak alarmist.

## 23.4 Focus Mode

Default graph tidak menampilkan semua node sekaligus.

User pilih node:

- node menjadi fokus;
- neighborhood relevan muncul;
- node lain meredup;
- detail panel terbuka.

## 23.5 Layer Controls

Untuk tier yang berhak:

- Identitas;
- Jejak Publik;
- Domain;
- Kebocoran;
- Risiko;
- Konflik;
- Timeline.

Control harus compact.

Mobile bisa menggunakan bottom sheet filter.

Desktop bisa menggunakan floating rail/panel.

## 23.6 Large Graph

Jika graph besar:

- cluster;
- progressive expansion;
- viewport culling;
- jangan render semua node dekoratif sekaligus.

Cluster copy:

> **+27 jejak terkait**

Tap untuk expand.

## 23.7 Locked/Premium Nodes

Gunakan silhouette smoked-glass.

Contoh:

> **3 hubungan lain**

Tap:

> **Analisis hubungan ini**
>
> Jejak menemukan petunjuk tambahan yang bisa diperiksa lebih dalam.

CTA:

> **Analisis Gabungan · 7 Kredit**

Harga harus selalu berasal dari config server, bukan design doc hardcode.

## 23.8 Mobile Graph

Wajib mendukung:

- pan;
- pinch zoom jika renderer aman;
- tap node;
- selected state besar;
- reset/focus action.

Long press hanya shortcut.

## 23.9 Desktop Graph

Boleh:

- hover preview;
- pointer focus;
- context shortcut;
- wheel zoom.

Klik kanan bukan satu-satunya jalan ke action.

## 23.10 Renderer Fallback

Jika WebGL/3D tidak tersedia atau terlalu berat:

> fallback 2D/2.5D tetap premium.

Jangan tampilkan error “browser tidak didukung” hanya karena luxury renderer gagal.

---

# 24. Timeline dan Jejak Perubahan

## 24.1 Timeline Visual

Timeline harus terasa seperti sejarah evidence, bukan sekadar vertical list.

Mobile:

- horizontal/vertical hybrid sesuai ruang;
- tap titik waktu.

Desktop:

- timeline bisa sinkron dengan graph.

## 24.2 Timestamp Confidence

Jika waktu evidence tidak presisi, UI jangan berpura-pura presisi.

Contoh:

> **Sekitar 2024**

bukan tanggal exact yang tidak ada sumbernya.

## 24.3 Jejak Perubahan

Kategorikan:

- **Baru**;
- **Menghilang**;
- **Lebih kuat**;
- **Lebih lemah**;
- **Berubah**.

Visual tidak perlu warna berbeda untuk lima kategori jika membuat ramai. Gunakan icon + label.

---

# 25. Case Workspace

## 25.1 Character

Case Workspace adalah tempat Jejak terasa paling “intelligence”.

Tetapi hierarchy tetap jelas bagi user awam.

Bagian konseptual:

- Ringkasan;
- Petunjuk;
- Temuan;
- Graph;
- Timeline;
- Ketidaksesuaian;
- Hipotesis;
- Catatan;
- Laporan.

Tidak semuanya muncul sekaligus.

## 25.2 Empty Case

Copy:

> **Kasus ini masih kosong.**
>
> Tambahkan nomor, email, username, domain, atau nama yang mau Lo periksa bareng.

CTA:

> **Tambah petunjuk**

## 25.3 Unknown State

Panel:

> **Yang masih belum jelas**

Contoh:

> Belum ada bukti kuat bahwa email dan nomor ini dimiliki pihak yang sama.

Di bawah:

> **Petunjuk yang bisa membantu**

## 25.4 Hypothesis UI

Hipotesis terlihat sebagai objek analisis terpisah.

Jangan campur dengan fakta.

Tampilkan:

- pernyataan hipotesis;
- bukti mendukung;
- bukti bertentangan;
- belum diketahui;
- confidence bila tersedia.

---

# 26. Premium / Upsell UI

## 26.1 Prinsip

Upsell harus terasa seperti membuka alat yang memang sudah relevan.

## 26.2 Do

Contoh:

> **Ada 5 hubungan lain yang belum dianalisis.**
>
> Analisis Gabungan bisa memeriksanya lebih jauh.

CTA:

> **Lanjutkan · 7 Kredit**

## 26.3 Don't

Jangan:

- full-screen interstitial setiap beberapa menit;
- flashing badge;
- fake scarcity;
- countdown;
- hidden close button;
- menakut-nakuti user.

## 26.4 Locked Feature Visibility

Semua fitur besar boleh terlihat sehingga user tahu kemampuan Jejak.

Tetapi locked state harus:

- menjelaskan value;
- menjelaskan biaya;
- tidak membuat layar penuh gembok.

## 26.5 Upgrade Bayar Selisih

Jika user berhak upgrade berdasarkan hasil yang masih fresh:

> **Naikkan analisis · +4 Kredit**

Jangan charge penuh lagi.

---

# 27. Dompet Kredit

## 27.1 Bukan Halaman Utama

Dompet dibuka dari saldo global sebagai panel/sheet.

Isi:

- saldo aktif;
- kredit dicadangkan;
- kredit yang mendekati masa akhir;
- riwayat;
- top-up;
- voucher/referral bila relevan.

## 27.2 Saldo

User-facing saldo utama tetap sederhana:

> **95 Kredit tersedia**

Detail lot hanya jika dibuka.

## 27.3 Expiry

Copy:

> **5 Kredit akan berakhir lebih dulu pada 20 September.**

Grace period:

> **Sebagian kredit Lo lagi masuk masa tenggang.**

Jangan:

> `EXPIRED SOON!`

## 27.4 Zero Credit

Copy:

> **Kredit Lo lagi kosong.**
>
> Fitur dasar masih bisa dipakai. Kalau butuh analisis lebih dalam, tambah kredit kapan aja.

CTA:

> **Lihat pilihan kredit**

## 27.5 Top-up Value Preview

Contoh:

> **Dengan paket ini, kira-kira Lo bisa:**
>
> 10 Pemeriksaan Mendalam  
> atau 4 Analisis Gabungan  
> atau kombinasi sesuai kebutuhan.

Estimasi harus dihitung dari config aktual.

---

# 28. Paket dan Pricing UI

## 28.1 Nama Paket

Seed nama:

- **Mulai**
- **Proteksi**
- **Lanjutan**
- **Power**
- **Mitra**

Harga seed bisnis ada di PRD/config, bukan hardcode komponen.

## 28.2 Sweet Spot

Proteksi boleh mendapatkan visual emphasis lebih baik.

Label:

> **Pilihan paling masuk akal**

atau:

> **Nilai terbaik**

Jangan:

> `BEST SELLER!!!`

## 28.3 Bonus

Tampilkan:

> **30 Kredit + 6 Bonus**

lebih baik daripada diskon rumit jika memang model bisnis demikian.

## 28.4 Masa Aktif

Harus terlihat sebelum pembelian:

> **Aktif 120 hari**

Jangan sembunyikan hanya di S&K.

## 28.5 Price Recommendation

Jika user kurang kredit:

> **Lo kurang 5 Kredit.**

Lalu rekomendasi:

> **Paket Mulai sudah cukup buat analisis ini.**

Secondary:

> **Lihat semua paket**

---

# 29. Top-up dan Pembayaran Manual

## 29.1 Flow Material

Top-up harus terasa sederhana dan dipercaya.

Urutan visual:

1. pilih paket;
2. lihat nominal;
3. lihat metode pembayaran;
4. salin rekening/nominal;
5. upload bukti;
6. status;
7. kredit masuk.

## 29.2 Rekening

Card pembayaran harus menampilkan snapshot order:

> **Transfer Bank**  
> BCA  
> a.n. [nama pemilik]  
> [nomor rekening]

Actions:

> **Salin rekening**

> **Salin nominal**

Feedback:

> **Nomor rekening sudah disalin.**

## 29.3 Nominal Unik

Copy:

> **Transfer sesuai nominal ini biar pembayaran Lo gampang dicocokkan.**

Nominal utama harus besar dan sangat jelas.

## 29.4 Upload Bukti

User boleh memilih gambar normal.

Jangan memaksa user mengompres manual.

State:

> **Menyiapkan gambar…**

Setelah diterima:

> **Bukti sudah kami terima.**
>
> Lagi kami cocokkan. Kredit belum masuk sampai pembayaran disetujui.

## 29.5 Payment Status

Gunakan istilah final:

### Menunggu bukti

> Lo belum kirim bukti pembayaran.

### Sedang dicek

> Bukti sudah masuk dan lagi diperiksa.

### Perlu bukti baru

> Ada bagian yang belum bisa dicocokkan.

### Disetujui

> Kredit sudah masuk ke Dompet Lo.

### Ditolak

> Pembayaran ini belum bisa kami setujui.

## 29.6 Approved Moment

No confetti.

Gunakan:

- balance count update;
- subtle light response;
- haptic single pulse bila tersedia;
- Mata Jejak subtle reaction.

Copy:

> **Kredit Lo sudah masuk.**

Jika ada niat terakhir:

> **Lanjutkan Analisis Gabungan**

---

# 30. Upload Gambar Umum

## 30.1 Preview

Preview cepat lokal bila aman.

## 30.2 Processing

Gunakan teks:

> **Menyiapkan gambar…**

Bukan:

> `Compressing JPEG 62%`.

## 30.3 Too Large/Long

Copy:

> **Gambarnya terlalu panjang buat dibaca dengan jelas.**
>
> Coba potong jadi beberapa gambar ya.

## 30.4 Blur

Payment proof:

> **Buktinya sudah masuk, tapi beberapa bagian masih susah dibaca.**
>
> Kirim screenshot yang lebih jelas ya.

Action:

> **Kirim bukti baru**

---

# 31. Kabar Jejak

## 31.1 Tone

Kabar Jejak adalah inbox produk, bukan notifikasi marketing.

Kategori waktu:

- Hari ini;
- Minggu ini;
- Sebelumnya.

## 31.2 Priority

### Informasi

Contoh:

> Analisis selesai.

### Penting

> Pembayaran disetujui.

### Perlu perhatian

> Ada perubahan berarti pada pantauan.

### Mendesak

Sangat jarang dan hanya jika evidence kuat.

## 31.3 Secret Case

Notifikasi tidak boleh membocorkan detail.

Contoh:

> **Ada perubahan di satu Kasus Rahasia.**

Bukan nama target.

## 31.4 Unread

Unread indicator kecil.

Tidak ada badge 99+ merah menyala kecuali desain final benar-benar membutuhkannya.

---

# 32. Push Permission UX

Jangan langsung menampilkan browser permission prompt saat first visit.

Contextual ask:

> **Mau Jejak ngabarin kalau ada perubahan penting?**
>
> Jadi Lo nggak perlu buka aplikasi terus-terusan.

CTA:

> **Aktifkan notifikasi**

Secondary:

> **Nanti aja**

Jika browser tidak mendukung:

- jangan tampilkan broken action;
- guide yang relevan saja.

---

# 33. Jejak Gue

## 33.1 Tujuan

Jejak Gue bukan halaman profile.

Ini pusat keamanan digital pribadi user.

Default content:

- Paparan Digital;
- hal yang perlu perhatian;
- hal yang sudah ditangani;
- timeline jika data ada;
- tindakan berikutnya.

## 33.2 Action-Oriented

Jangan berhenti pada “data bocor”.

Tampilkan:

> **Yang bisa Lo lakukan sekarang**

Contoh:

- ganti password;
- aktifkan MFA;
- cek sesi login;
- tandai sudah diamankan.

## 33.3 Completion

Jika user menandai tindakan selesai:

> **Sudah gue amankan**

Visual risk node boleh meredup/berubah secara halus.

Jangan menjanjikan exposure hilang hanya karena user menekan checklist.

---

# 34. Panduan Jejak

## 34.1 Entry

Icon/help melalui Mata Jejak atau menu bantuan.

## 34.2 Struktur

Minimal:

- Mulai dari sini;
- Cara cek data sendiri;
- Cara cek seller;
- Cara bantu keluarga;
- Cara membaca hasil;
- Cara bikin Kasus;
- Cara top-up;
- Cara pakai AI;
- Tentang kredit;
- Data & privasi.

## 34.3 Tone

Seperti teman yang paham produk.

Jangan seperti manual compliance.

Contoh:

> **Kasus itu buat apa?**
>
> Kumpulin beberapa petunjuk dalam satu tempat biar Jejak bisa melihat hubungannya.

---

# 35. Asisten AI User

## 35.1 Free — Panduan Jejak

Jangan pura-pura AI.

Name surface:

> **Panduan Jejak**

Boleh memberi jawaban rule-based untuk:

- definisi skor;
- cara pakai;
- next step umum;
- arti status.

## 35.2 Premium — Asisten AI Jejak

Surface:

> **Asisten Jejak**

Premium indicator berupa simbol kecil/lighting, bukan crown/diamond.

## 35.3 Contextual Actions

Saat node/Case aktif:

> **Tanya Jejak**

Quick prompts:

- **Kenapa ini dianggap terhubung?**
- **Apa yang bikin hasil ini belum pasti?**
- **Ada yang janggal?**
- **Jelasin lebih gampang.**
- **Apa langkah berikutnya?**

## 35.4 Answer Layering

Jawaban default singkat:

> **Hubungan ini cukup kuat, tapi belum pasti.**
>
> Ada 3 bukti yang mendukung dan 1 hal yang bertentangan.

Actions:

> **Kenapa?**

> **Lihat sumber**

## 35.5 AI Fact Styling

Jika AI menyebut:

### Fakta

Terkait langsung dengan evidence.

### Interpretasi

Gunakan bahasa seperti:

> **Ini bisa jadi alasan tambahan buat lebih hati-hati.**

### Ketidakpastian

> **Belum cukup bukti buat memastikan.**

## 35.6 AI Failure

Copy:

> **Analisis AI belum berhasil disusun.**
>
> Bukti utama tetap bisa Lo lihat di bawah.

Jangan tampilkan raw provider error.

## 35.7 Additional Work

Jika pertanyaan membutuhkan search baru:

> **Pertanyaan ini butuh pemeriksaan tambahan.**

CTA:

> **Periksa sekarang · 2 Kredit**

Harga dari config aktual.

No silent credit spending.

---

# 36. NADI — AI Admin

## 36.1 Positioning

NADI = Chief of Staff digital Owner.

Bukan chatbot generik.

## 36.2 Presence

Di Ruang Kendali, NADI hadir sebagai panel compact.

Contoh:

> **Ada 3 hal yang menurut gue perlu Lo lihat.**

Tap untuk expand.

## 36.3 Briefing

Copy pattern:

> **Jejak berjalan normal.**
>
> Ada 7 pembayaran menunggu, 2 perlu dicek lebih teliti, dan satu sumber data lagi melambat.

## 36.4 Action Draft

NADI boleh menyiapkan tindakan:

> Andi  
> +50 Kredit  
> Alasan: Kompensasi

Tetapi CTA final tetap:

> **Konfirmasi**

## 36.5 Uncertainty

NADI wajib boleh berkata:

> **Gue belum punya cukup data buat nyimpulin itu.**

Jangan membuat AI admin selalu terlihat yakin.

## 36.6 Technical Detail

Default bahasa manusia.

Expandable:

> **Lihat detail teknis**

Baru tampilkan informasi developer.

---

# 37. Mata Jejak — Maskot

## 37.1 Konsep

Gabungan:

- inspirasi tarsius Indonesia;
- mata besar pengamat;
- bentuk abstrak;
- fingerprint pada pupil;
- silhouette yang subtly membentuk huruf `J`.

Bukan tarsius kartun literal.

## 37.2 Personality

Mata Jejak terasa:

- observant;
- tenang;
- sedikit misterius;
- membantu;
- tidak cerewet.

## 37.3 Usage

Boleh muncul pada:

- Search Console;
- onboarding;
- Panduan Jejak;
- AI Assistant;
- scan progress;
- empty state tertentu;
- Easter Egg.

Jangan muncul di setiap card.

## 37.4 Ambient Behavior

Boleh:

- blink sesekali;
- sedikit mengarah ke focused object;
- response terhadap hover/tap.

Tidak boleh:

- mengikuti cursor terus-menerus secara creepy;
- animation tanpa henti yang boros;
- cartoon expression berlebihan.

---

# 38. Easter Egg — Jejak Cermin

## 38.1 Discovery

Harus gampang ditemukan.

Interaction sederhana dengan Mata Jejak.

Jangan puzzle rumit.

## 38.2 Experience

Membuka mini experience:

> **Jejak Cermin**

Menampilkan informasi aman yang website bisa ketahui dari sesi/browser, misalnya:

- browser family;
- kategori perangkat;
- timezone;
- PWA/browser mode;
- permission/state aman tertentu.

Tidak menunjukkan tracking creepy atau precise location tanpa alasan.

## 38.3 Closing Copy

> **Di internet, hampir semua hal ninggalin sedikit jejak.**

Tujuan:

- edukasi;
- memorable brand moment;
- bukan gimmick kosong.

---

# 39. Safe Share Card

## 39.1 Tujuan

Shareable artifact yang aman dan viral.

Tidak menampilkan PII sensitif.

## 39.2 Visual

Card branded Jejak dengan:

- logo;
- kategori pemeriksaan;
- signal level;
- jumlah indikator;
- short safe summary;
- scan/reference ID aman;
- tagline.

Seed:

> **Periksa sebelum percaya.**

## 39.3 Jangan

- expose email/phone penuh;
- full graph;
- evidence raw;
- private source notes;
- internal confidence detail jika bisa memicu misinterpretasi.

---

# 40. Kasus Rahasia

## 40.1 Visual

Secret state menggunakan subtle private material treatment.

Jangan skull/spy icon.

Gunakan icon privacy SVG.

## 40.2 Preview

Dashboard tidak menampilkan detail target.

Copy:

> **Kasus Rahasia**

## 40.3 Recent Apps / Notification

Hindari sensitive title pada preview.

## 40.4 Delete

Beri opsi:

> **Hapus permanen sekarang**

dengan konsekuensi jelas.

---

# 41. Error Language

## 41.1 Generic Error

> **Ada bagian yang belum beres.**
>
> Kredit Lo aman. Coba lagi.

Jika kredit memang belum dipotong/refund sudah berhasil.

Jangan menjanjikan “kredit aman” jika sistem belum dapat memastikan.

## 41.2 Source Error

> **Satu sumber lagi nggak bisa dijangkau.**
>
> Jejak tetap lanjut dengan sumber lain yang tersedia.

## 41.3 Format Error

> **Kayaknya formatnya belum pas.**
>
> Coba cek lagi data yang Lo masukkan.

## 41.4 Network

> **Koneksi lagi kurang stabil.**
>
> Jejak akan sinkron lagi saat koneksi membaik.

## 41.5 No Result

> **Belum nemu jejak yang cukup.**
>
> Bukan berarti data ini pasti aman. Coba tambahkan petunjuk lain kalau ada.

## 41.6 Permission

User:

> **Bagian ini nggak tersedia buat akun Lo.**

Jangan mengungkap detail policy internal.

## 41.7 Error Code

Jika error sistem:

> **Kode: JX-7K2P**

Button:

> **Laporkan masalah ini**

---

# 42. Empty States

Empty state selalu:

1. menjelaskan keadaan;
2. menjelaskan manfaat area;
3. memberi satu next action.

## 42.1 Kasus

> **Belum ada Kasus.**
>
> Kasus berguna kalau Lo punya beberapa petunjuk yang mau diperiksa bareng—misalnya nomor, username, dan domain dari seller yang sama.

CTA:

> **Buat Kasus pertama**

## 42.2 Riwayat

> **Belum ada pemeriksaan.**
>
> Mulai dari data Lo sendiri atau cek sesuatu yang lagi bikin Lo ragu.

CTA:

> **Mulai periksa**

## 42.3 Kabar

> **Belum ada kabar baru.**
>
> Kalau ada perubahan penting, Jejak bakal muncul di sini.

## 42.4 Partner

Role-specific dan tidak menjanjikan fitur yang belum aktif.

---

# 43. PWA Experience

## 43.1 Install Entry

Jejak harus punya action sendiri:

> **Pasang Jejak**

Jangan bergantung pada user menemukan menu browser.

## 43.2 Chromium/Brave

Jika custom install prompt tersedia:

- gunakan dari action user;
- jangan memunculkan popup otomatis tanpa konteks;
- jika app sudah terpasang, jangan terus tampilkan CTA install.

## 43.3 Safari/iOS

Jika direct prompt tidak tersedia:

Action **Pasang Jejak** membuka guide singkat sesuai device.

Guide harus:

- ringkas;
- visual bila perlu;
- Bahasa Indonesia;
- tidak menganggap user tahu istilah PWA.

Contoh:

> **Pasang Jejak di layar utama**
>
> Buka menu Bagikan di Safari, lalu pilih Tambahkan ke Layar Utama.

Wording harus disesuaikan dengan UI OS yang aktual saat implementasi/QA.

## 43.4 Standalone App Controls

Dalam standalone PWA:

- Kembali tersedia;
- Segarkan tersedia;
- update indicator tersedia;
- external links punya behavior aman;
- user tidak merasa kehilangan browser controls.

## 43.5 Version Sentinel

State:

### Up to date

Tidak perlu mengganggu user.

### Update ready

> **Jejak baru aja diperbarui.**
>
> Versi terbaru sudah siap dipakai.

CTA:

> **Gunakan versi terbaru**

### Critical update

> **Pembaruan penting tersedia.**
>
> Jejak perlu versi terbaru sebelum bagian ini bisa dilanjutkan.

CTA:

> **Perbarui sekarang**

## 43.6 Update While Busy

Jangan paksa normal update ketika:

- upload aktif;
- user mengisi form penting;
- destructive confirmation belum selesai.

Safe timing:

- setelah action selesai;
- saat user kembali idle;
- atau user memilih update sendiri.

## 43.7 Restore Intent

Setelah update, sebisa mungkin restore safe navigation intent:

- Case aktif;
- tab aktif;
- order/top-up flow;
- last relevant workspace.

Jangan restore secret/sensitive ephemeral state secara sembrono.

## 43.8 Old Version

Jika client terlalu lama:

> **Versi Jejak ini sudah terlalu lama.**
>
> Perbarui dulu biar semuanya tetap jalan dengan benar.

CTA:

> **Perbarui Jejak**

---

# 44. Browser Compatibility Design Rules

## 44.1 Target Browser Experience

Wajib dirancang untuk:

- Brave Android;
- Brave Desktop;
- Chrome Android;
- Chrome Desktop;
- Safari iPhone;
- Safari iPad jika tersedia;
- Safari Desktop bila test environment tersedia;
- Edge;
- Firefox;
- PWA standalone Chromium;
- PWA standalone iOS.

## 44.2 Safari

Jangan mengandalkan:

- Chromium-only visual behavior;
- hover assumptions;
- viewport fixed hacks;
- PWA lifecycle yang identik dengan Chrome.

## 44.3 Brave

Jejak harus tetap terlihat hidup ketika:

- motion preference berubah;
- tracking protections aktif;
- beberapa API browser tidak tersedia.

Tidak boleh ada blank/stuck UI hanya karena enhancement diblokir.

## 44.4 Fallback Hierarchy

Jika fitur browser tidak tersedia:

1. pertahankan core behavior;
2. gunakan fallback UI;
3. baru beri helper jika user memang perlu tahu.

Jangan menampilkan compatibility warning untuk enhancement kecil.

---

# 45. Responsive / Adaptive Behavior

## 45.1 Jangan Bergantung pada Breakpoint Saja

Layout boleh memakai breakpoint, tetapi interaction mode juga perlu mempertimbangkan kemampuan pointer/touch.

## 45.2 Mobile Portrait

Prioritas:

- one-thumb;
- primary CTA bawah/area nyaman;
- bottom sheet;
- single focus;
- graph fullscreen workspace bila dibutuhkan.

## 45.3 Mobile Landscape

Jangan hanya rotate portrait.

Gunakan ruang horizontal untuk:

- graph + compact detail;
- media preview;
- two-column ringan jika cukup.

## 45.4 Tablet Portrait

Bisa memakai:

- rail compact;
- workspace;
- slide-over detail.

## 45.5 Tablet Landscape

Boleh lebih mirip desktop:

- rail;
- main pane;
- secondary pane.

## 45.6 Desktop Small

Pastikan sidebar tidak mengambil ruang berlebihan.

## 45.7 Desktop Wide

Jangan stretch paragraph sepanjang layar.

Gunakan max content width untuk text, tetapi graph/analytics boleh memanfaatkan ruang.

## 45.8 Ultra-Wide

Jangan membuat UI terlalu tersebar.

Gunakan centered app frame atau adaptive panes.

---

# 46. Accessibility yang Tetap Premium

## 46.1 Prinsip

Aksesibilitas bukan “mode jelek”.

Fallback/accessibility state harus tetap punya material, hierarchy, dan brand character.

## 46.2 Contrast

Teks penting harus punya kontras yang cukup terhadap material gelap/glass.

Jangan menggunakan warm silver tipis untuk body copy panjang jika sulit dibaca.

## 46.3 Text Scaling

UI harus bertahan pada text scaling yang lebih besar.

Jangan hard-clip label.

Jika label panjang:

- reflow;
- wrap;
- adapt layout.

## 46.4 Screen Reader Labels

Icon-only controls wajib punya accessible name.

Graph perlu punya alternative textual representation minimum agar informasi inti tidak hanya visual.

## 46.5 Color Blindness

Risk/status selalu punya:

- label;
- symbol;
- color.

## 46.6 Motion Sensitivity

Ikuti Motion Contract reduced motion.

## 46.7 Focus Order

Mobile/desktop keyboard focus harus mengikuti hierarchy logical.

Jangan focus masuk ke decorative SVG.

## 46.8 Error Announcement

Form error penting harus terasosiasi ke field dan bisa dibaca assistive technology.

## 46.9 Modal Focus

Critical modal:

- focus trapped secara benar;
- Escape behavior sesuai risiko;
- focus kembali ke pemicu setelah ditutup.

---

# 47. Ruang Kendali — Visual System

## 47.1 Goal

Ruang Kendali adalah cockpit bisnis, bukan database viewer.

Default question:

> **Apa yang perlu Lo urus sekarang?**

## 47.2 Desktop Structure

Conceptual:

- compact navigation rail;
- top status strip;
- main workspace;
- optional NADI side panel;
- no page scroll.

## 47.3 Mobile Admin

Admin harus fully usable dari HP.

Payment approval flow harus bisa dilakukan one-handed dengan hati-hati.

## 47.4 Admin Density

Boleh lebih padat daripada user UI.

Tetapi tetap:

- Bahasa Indonesia;
- hierarchy jelas;
- touch-safe;
- material consistent.

## 47.5 Ringkasan Admin

Prioritaskan action cards:

- pembayaran menunggu;
- issue sistem;
- credit refund;
- partner review;
- revenue snapshot;
- health.

Jangan memulai dengan 15 chart.

---

# 48. Owner Inbox

## 48.1 Categories

- **Perlu Lo urus**
- **Penting**
- **Info**

## 48.2 Actionable Completion

Item actionable tidak otomatis selesai hanya karena dibuka.

State:

- belum dibaca;
- sudah dibaca;
- sedang ditangani;
- selesai.

## 48.3 Visual Priority

Gunakan hierarchy, bukan blinking red.

---

# 49. Admin Payment Approval UI

## 49.1 Desktop

Prefer split view:

- order list kiri;
- detail kanan.

## 49.2 Mobile

Flow satu order per view.

Action approval diletakkan dekat thumb zone tetapi aman dari accidental tap.

## 49.3 Mobile Confirmation Gesture

Untuk approval finansial mobile, gunakan friction ringan:

- press-and-hold singkat;
- atau swipe confirm yang jelas;
- atau confirmation sheet yang dirancang khusus.

Pilihan implementation final harus diuji pada device nyata.

Jangan membuat gesture eksotis.

## 49.4 Payment Sentinel Visual

AI state:

- **Terlihat sesuai**
- **Perlu dicek**
- **Ada yang janggal**

AI tidak boleh memakai label:

> “Valid transfer”.

Selalu tampilkan reminder:

> **Tetap cek mutasi rekening sebelum menyetujui.**

## 49.5 Override

Jika Owner approve meski sentinel warning:

UI meminta alasan singkat/quick reason.

Audit jelas.

---

# 50. Pengguna / Role Admin UI

## 50.1 User Detail

Sections:

- Akun;
- Dompet;
- Aktivitas;
- Akses;
- tindakan Owner/Admin sesuai permission.

## 50.2 Role Presentation

Role sebagai chips/badges subtle.

Jangan badge warna-warni terlalu banyak.

## 50.3 Sensitive Data Masking

Support default:

> `va•••@gmail.com`

> `0812••••721`

Reveal action jika punya permission harus:

- explicit;
- audited;
- tidak otomatis reveal seluruh halaman.

## 50.4 Permission Simulator

Owner:

> **Pratinjau sebagai…**

Options:

- User;
- Power;
- Mitra;
- Affiliate;
- Support;
- Finance.

Simulator UI harus jelas bahwa ini preview, bukan identity switch nyata.

---

# 51. Bisnis Admin UI

## 51.1 Configurable, Not Code

Area bisnis harus memungkinkan edit:

- pricing;
- credit amount;
- bonus;
- expiry;
- grace period;
- feature cost;
- payment methods;
- account number;
- account holder;
- instruction;
- campaigns;
- referral;
- partner rate.

## 51.2 Configuration Forms

Jangan autosave field kritis seperti rekening.

Gunakan:

> Edit → Preview → Simpan.

## 51.3 Payment Method Preview

Sebelum save:

> **Yang akan dilihat user**

Tampilkan card persis seperti user.

## 51.4 Existing Orders Warning

Jika metode dinonaktifkan:

> **Masih ada 8 order aktif yang memakai metode ini.**
>
> Order lama tetap memakai detail yang tersimpan saat dibuat.

Good.

---

# 52. Analytics Design

## 52.1 Chart Harus Menjawab Pertanyaan

Setiap chart harus punya decision value.

Jangan chart hanya karena data tersedia.

## 52.2 Chart Style

- clean;
- thin precise lines;
- minimal grid;
- readable tooltips;
- no rainbow palette;
- no 3D pie chart;
- no decorative gauges berlebih.

## 52.3 Comparison

Metrics utama selalu punya konteks bila tersedia:

> **12%**  
> naik 3 poin dari minggu lalu.

## 52.4 Funnel

Funnel bisa ditampilkan sebagai step flow, bukan funnel trapezoid klasik jika lebih jelas.

Example:

> Login → Pemeriksaan pertama → Hasil → Fitur premium → Top-up → Bukti → Disetujui

## 52.5 Browser/PWA Analytics

Tampilkan browser family dan PWA standalone sebagai segment.

Tujuan:

- cari regression;
- bukan tracking user individual.

---

# 53. System Health UI

## 53.1 Human First

Default:

> **Jejak sehat**

atau:

> **Ada satu bagian yang perlu perhatian.**

## 53.2 Source Health

Per source:

- status;
- jenis;
- success rate;
- latency summary;
- active/experimental;
- cost category.

## 53.3 System Map

Boleh gunakan visual topology:

User → Jejak → database/sources/AI.

Node status:

- normal;
- melambat;
- gagal.

Jangan hacker terminal styling.

## 53.4 Maintenance Controls

Toggles:

- Pemeriksaan baru;
- AI;
- Top-up;
- Upload;
- Pantauan.

Tiap toggle punya impact text.

## 53.5 Emergency Protection

Control:

> **Proteksi Darurat**

Harus menjelaskan:

- apa yang dibatasi;
- user masih bisa melakukan apa;
- kapan aktif;
- siapa mengaktifkan.

---

# 54. Tables dan Lists

## 54.1 Desktop Table

Untuk admin/log:

- sticky header bila internal scroll;
- sorting jelas;
- filter;
- row selection tidak terlalu tipis;
- status readable.

## 54.2 Mobile Table

Jangan horizontal table 12 kolom kalau bisa dihindari.

Ubah menjadi:

- stacked list;
- compact cards;
- drill-down detail.

## 54.3 Huge Lists

Gunakan virtualization/pagination sesuai kebutuhan.

Jangan render ribuan row hanya karena API mengembalikannya.

## 54.4 Empty Filter

> **Nggak ada hasil yang cocok dengan filter ini.**

CTA:

> **Reset filter**

---

# 55. Toast, Banner, Inline Feedback

## 55.1 Toast

Gunakan untuk:

- action ringan berhasil;
- copy to clipboard;
- non-critical transient update.

Contoh:

> **Nomor rekening sudah disalin.**

## 55.2 Banner

Gunakan untuk persistent state:

- koneksi buruk;
- maintenance;
- outdated version;
- permission issue.

## 55.3 Inline

Gunakan paling dekat dengan konteks:

- validation;
- source partial failure;
- credit insufficient.

## 55.4 Jangan Spam

Satu tindakan jangan memunculkan:

- toast;
- banner;
- modal;
- notification

sekaligus kecuali benar-benar dibutuhkan.

---

# 56. Confirmation Design

## 56.1 Low Risk

No modal.

## 56.2 Medium Risk

Confirmation sheet/popover.

## 56.3 High Risk

Explicit modal + consequence.

Contoh:

> **Lo akan menambahkan 5.000 Kredit ke akun ini.**
>
> Nilainya jauh di atas penambahan admin biasanya.

Input confirm value jika perlu.

## 56.4 Financial Action

Tidak boleh ambiguous.

Button:

> **Setujui pembayaran**

bukan:

> **Selesai**

---

# 57. Destructive Action dan Undo

## 57.1 Reversible

Contoh pause partner boleh punya toast:

> **Akses Mitra dijeda.**

Action:

> **Batalkan**

## 57.2 Ledger Action

Approval/credit mutation tidak “undo” dengan menghapus history.

UI menawarkan:

> **Buat koreksi**

## 57.3 Delete Case

Preview consequence.

Regular Case:

> tempat sampah sekitar 3 hari sesuai config.

Secret Case:

> pilihan hard delete.

---

# 58. Data & Privasi UI

## 58.1 Privacy Center

Menu:

> **Data & Privasi**

Sections:

- Apa yang Jejak simpan?;
- Kasus & bukti gue;
- Riwayat akses;
- Ekspor data gue;
- Hapus data tertentu;
- Hapus akun.

## 58.2 Delete Account

Copy harus jelas:

> **Kalau Lo lanjut:**
>
> Kasus pribadi akan dihapus.  
> Lampiran masuk proses penghapusan.  
> Pantauan berhenti.  
> Akses partner dicabut.  
> Kredit aktif ikut berakhir.

Jika user punya saldo:

> **Lo masih punya 27 Kredit. Kalau akun dihapus, kredit ini ikut berakhir.**

User boleh lanjut.

---

# 59. Mode Perawatan User UI

Jika fitur tertentu dimatikan:

> **Jejak lagi beresin beberapa bagian.**
>
> Data Lo tetap aman. Beberapa pemeriksaan sementara belum tersedia.

Jangan mematikan seluruh App Shell jika bagian lain masih aman digunakan.

Aksi disabled harus menjelaskan kenapa.

---

# 60. Offline / Connection Awareness

## 60.1 Offline Banner

> **Koneksi lagi kurang stabil.**
>
> Data terbaru akan disinkronkan otomatis.

## 60.2 Usable Offline-ish State

Jika data aman tersedia lokal/cached:

- user boleh melihat shell;
- history safe snapshot;
- result lama sesuai policy;
- navigation.

Jangan izinkan:

- financial mutation;
- privileged action;
- new scan

seolah berhasil saat offline.

## 60.3 Reconnect

Sync quietly.

Jika conflict:

jelaskan hanya jika user perlu tindakan.

---

# 61. Visual Performance Budget

## 61.1 Expensive Effects

Backdrop blur, dynamic shadow, particles, WebGL, 3D graph dianggap expensive.

Masing-masing harus punya budget.

## 61.2 Rule

> Satu efek mahal harus punya value yang jelas.

Jangan menumpuk:

- backdrop blur;
- multiple drop shadows;
- animated gradient;
- WebGL;
- particles

pada container yang sama hanya demi “wah”.

## 61.3 Continuous Animation

Minimalkan continuous animation.

Ambient Mata Jejak dan radar harus:

- sangat ringan;
- pause/slow saat tab tidak aktif;
- adaptif device.

## 61.4 Lazy Heavy Features

Graph/chart/image processor/AI UI berat dimuat saat dibutuhkan.

Jangan masuk initial bundle hanya karena mungkin dipakai nanti.

---

# 62. Asset Rules

## 62.1 SVG

Prefer SVG untuk:

- icons;
- logo;
- simple illustration;
- maskot vector components.

## 62.2 Raster Texture

Jika menggunakan texture:

- compress;
- responsive resolution;
- tidak terlalu besar;
- fallback solid material.

## 62.3 Background Video

Tidak digunakan untuk core design.

Boros dan mudah membuat UI murah/lambat.

## 62.4 Logo Variants

Minimal:

- full mark;
- icon/mask mark;
- monochrome;
- PWA icon-safe;
- favicon-safe.

---

# 63. PWA Icon & Splash Visual

## 63.1 App Icon

Icon harus:

- terbaca pada ukuran kecil;
- tidak bergantung pada text “Jejak”;
- memakai Mata Jejak/mark abstrak;
- aman terhadap masking/crop OS;
- tidak punya detail mikro berlebih.

## 63.2 Splash

Splash sederhana:

- brand mark;
- background material solid/near-solid;
- no fake loading animation panjang.

App Shell muncul secepat mungkin.

---

# 64. Microcopy Voice

## 64.1 Persona Bahasa

Jejak bicara seperti:

> teman yang paham teknologi, tenang, nggak sok tahu, dan nggak bikin user merasa bodoh.

Gunakan:

- Lo;
- bentuk sehari-hari;
- kalimat pendek;
- kata yang mudah dimengerti.

Tetap elegan.

## 64.2 Hindari

- bahasa terlalu baku;
- slang berlebihan;
- kata kasar;
- jargon developer;
- bahasa kampungan;
- emoji sebagai penopang tone;
- “bro/sis” berlebihan;
- “anjir” di produk;
- hype marketing.

Percakapan Owner dengan Agent boleh lebih gaul; UI publik tetap refined casual.

## 64.3 Humble Language

Jejak jangan berkata:

> “Kami memastikan…”

jika faktanya probabilistik.

Prefer:

> **Sejauh ini…**

> **Kami menemukan…**

> **Belum cukup bukti…**

> **Kemungkinan…**

## 64.4 Active Voice

Prefer:

> **Kirim bukti baru**

bukan:

> “Bukti baru dapat dikirimkan.”

## 64.5 Avoid Blame

Jangan:

> “Lo salah memasukkan nomor.”

Prefer:

> **Kayaknya format nomornya belum pas.**

---

# 65. Kamus Istilah Resmi Jejak

Agent wajib menggunakan istilah yang sama di seluruh produk.

| Konsep internal/Inggris | Istilah UI Jejak |
|---|---|
| Home | Beranda |
| Search / Scan entry | Periksa |
| Quick Check | Cek Cepat |
| Deep Scan | Pemeriksaan Mendalam |
| Fusion Scan | Analisis Gabungan |
| Advanced Analysis | Analisis Lanjutan |
| Case | Kasus |
| Wallet | Dompet Kredit |
| Credits | Kredit |
| Reserved Credits | Kredit dicadangkan |
| History | Riwayat |
| Evidence | Bukti / Bukti Pendukung |
| Evidence Passport | Detail Bukti / Mode Bukti sesuai konteks |
| Relationship Graph | Peta Hubungan / Graph hanya bila konteks advanced/admin memerlukan |
| Confidence | Tingkat Kecocokan |
| Exposure | Paparan Digital |
| Risk Signal | Sinyal Risiko |
| Analysis Coverage | Kelengkapan Analisis |
| Timeline | Timeline / Riwayat Waktu; pilih konsisten per surface |
| Contradiction | Ketidaksesuaian |
| Unknown | Belum jelas |
| Source | Sumber |
| Public Footprint | Jejak Publik |
| Watch / Monitoring | Pantau Jejak / Pantauan |
| Notifications | Kabar Jejak |
| Refresh | Segarkan |
| Back | Kembali |
| Install App | Pasang Jejak |
| Update App | Perbarui Jejak |
| Admin Dashboard | Ruang Kendali |
| Owner Inbox | Kotak Masuk Owner / Owner Inbox hanya internal jika diputuskan; UI seed: Perlu Lo urus |
| Maintenance Mode | Mode Perawatan |
| Emergency Protection | Proteksi Darurat |
| Payment Pending | Sedang dicek / Menunggu sesuai state |
| Approved | Disetujui |
| Rejected | Ditolak |
| Need New Proof | Perlu bukti baru |
| Affiliate | Affiliate |
| Reseller | Reseller |
| Partner | Partner / Mitra sesuai konteks |
| AI Assistant | Asisten Jejak |
| Free Assistant | Panduan Jejak |
| Admin AI | NADI |
| Secret Case | Kasus Rahasia |
| Delete | Hapus |
| Permanent Delete | Hapus permanen |
| Export | Ekspor |
| Report Problem | Laporkan masalah ini |
| Feature Flag | Fitur Eksperimen / Pengaturan Rilis sesuai konteks admin |

Catatan:

- istilah resmi platform/provider boleh tetap nama aslinya;
- jangan campur “scan”, “check”, “pemeriksaan”, “analisis” secara random;
- jika Agent ingin mengganti istilah UI utama, wajib catat di `.notes/DECISIONS.md` dan pastikan seluruh produk ikut berubah konsisten.

---

# 66. Copy Pattern Library

## 66.1 Success

> **Sudah beres.**

> **Kredit Lo sudah masuk.**

> **Nomor rekening sudah disalin.**

## 66.2 Waiting

> **Lagi kami cek.**

> **Pemeriksaan masih berjalan. Lo tetap bisa pakai bagian lain.**

## 66.3 Partial

> **Sebagian pemeriksaan sudah selesai.**
>
> Satu sumber belum bisa dijangkau.

## 66.4 Insufficient Data

> **Belum cukup bukti buat disimpulkan.**

## 66.5 Upgrade

> **Ada beberapa petunjuk lain yang belum dianalisis.**

## 66.6 Credit Insufficient

> **Kredit Lo belum cukup buat analisis ini.**
>
> Lo kurang 5 Kredit.

## 66.7 Expiry

> **Sebagian kredit Lo akan berakhir dalam 12 hari.**

## 66.8 Abuse Limit

> **Pemeriksaan ini perlu dibatasi dulu.**
>
> Polanya berbeda dari penggunaan normal. Coba lagi nanti atau lanjutkan dari Kasus yang sudah ada.

Jangan menuduh user “stalker” atau “bot” di UI.

## 66.9 AI Uncertainty

> **Gue belum punya cukup data buat nyimpulin itu.**

## 66.10 Source Unavailable

> **Satu sumber lagi nggak bisa dijangkau.**

## 66.11 Old Version

> **Jejak perlu diperbarui dulu.**

---

# 67. Bahasa untuk Risiko dan Fraud

Jejak tidak boleh menampilkan label kriminal sebagai fakta tanpa dasar yang sesuai.

Dilarang sebagai system-generated conclusion:

- Penipu;
- Scammer;
- Pelaku;
- Tersangka;
- Kriminal.

Gunakan:

- **Sinyal Risiko Tinggi**;
- **Ada ketidaksesuaian yang perlu dicek**;
- **Belum cukup bukti**;
- **Identitas belum konsisten**;
- **Ada beberapa hal yang perlu Lo perhatikan**.

Jika user menamai Case sendiri “Dugaan Penipuan Marketplace”, UI boleh mempertahankan nama user tersebut sebagai user-generated label, tetapi sistem tetap netral dalam kesimpulan.

---

# 68. Bahasa untuk Self-Check dan Assisted Check

Mode:

### Cek data gue

Helper:

> Cari tahu seberapa jauh data Lo terekspos dan apa yang bisa Lo lakukan.

### Bantu orang terdekat

Helper:

> Cocok buat bantu orang tua, pasangan, saudara, teman, atau orang yang kurang familiar dengan teknologi.

### Cek dugaan penipuan

Helper:

> Bantu nilai konsistensi nomor, email, username, atau domain sebelum Lo mengambil keputusan.

### Riset informasi publik / Kasus

Helper disesuaikan ke entitlement dan scope.

---

# 69. Anti-Patterns Visual

Agent dilarang menggunakan pola berikut tanpa alasan kuat yang dicatat:

## 69.1 Cyberpunk Cliché

- green terminal rain;
- skull;
- hacker hoodie;
- giant red warning triangles;
- fake command-line text;
- excessive monospace.

## 69.2 Excessive Glass

Semua card glass = ditolak.

## 69.3 Excessive Blur

Blur berat di seluruh screen = performa dan readability buruk.

## 69.4 Full-screen Loading Logo

Jangan menutupi app dengan logo animation ketika data bagian kecil loading.

## 69.5 Fake Progress

Jangan angka random.

## 69.6 Hover-only UX

Ditolak.

## 69.7 Mobile Desktop Clone

Desktop table diperkecil ke HP = ditolak.

## 69.8 Emoji Status

Jangan mengganti icon system dengan emoji.

## 69.9 Random English

`Loading`, `Pending`, `Submit`, `Dashboard` muncul di UI user tanpa alasan = bug copy.

## 69.10 Giant Cards Everywhere

Setiap value tidak perlu card sendiri.

Gunakan grouping dan hierarchy.

## 69.11 Dark Pattern

Tidak boleh.

---

# 70. Performance-Oriented Design Acceptance

Desain belum valid jika hanya cantik di screenshot.

Wajib dicek:

- App Shell first meaningful render;
- tab switch;
- sheet open;
- input response;
- graph pan/zoom;
- long list scroll;
- upload processing;
- standalone PWA;
- reduced motion;
- simplified renderer;
- mobile keyboard.

Jika visual effect menyebabkan jank:

1. optimasi;
2. sederhanakan effect;
3. jangan mempertahankan effect hanya karena mockup terlihat keren.

---

# 71. State Preservation

## 71.1 Navigation

Kembali ke workspace hangat sebisa mungkin mempertahankan:

- selected Case;
- selected node;
- filter;
- scroll internal;
- graph focus;
- draft non-sensitive.

## 71.2 Jangan Preserve secara Berbahaya

Jangan simpan lama:

- password input;
- payment proof raw;
- sensitive secret;
- private token.

## 71.3 Version Update

Restore safe intent seperti Case ID/tab setelah update jika permission masih valid.

---

# 72. Error Boundary Visual

Komponen berat seperti:

- graph;
- analytics chart;
- AI panel;
- upload processor

harus punya local failure state.

Contoh:

> **Bagian ini belum bisa ditampilkan.**
>
> Bagian lain Jejak tetap bisa dipakai.

CTA:

> **Coba lagi**

Optional:

> **Laporkan masalah ini**

Jangan white-screen seluruh app.

---

# 73. Data Staleness Visual

Jika data cached tampil:

boleh ada helper kecil:

> **Terakhir diperbarui 18:42**

Saat revalidating, jangan mengganggu.

Jika data terlalu tua untuk tindakan penting:

> **Data ini perlu disegarkan dulu sebelum lanjut.**

CTA:

> **Segarkan**

---

# 74. Source Transparency UI

## 74.1 User Normal

Sumber disederhanakan.

Contoh:

> **3 sumber mendukung temuan ini.**

## 74.2 Mode Bukti / Power

Bisa melihat:

- source name;
- waktu;
- evidence type;
- reliability;
- conflict;
- link bila tersedia.

## 74.3 Experimental Source

Owner test UI:

> **Eksperimental**

Temuan experimental tidak bercampur visual seolah setara dengan active source.

---

# 75. Partner Surfaces

## 75.1 Affiliate

Focus:

- referral;
- signup;
- top-up valid;
- commission.

Jangan tampil seperti admin system.

## 75.2 Reseller

Pisahkan jelas:

> **Kredit Pribadi**

vs

> **Saldo Distribusi**

Jangan menggunakan satu saldo visual yang membuat user bingung.

## 75.3 Mitra

Focus:

- Klien;
- Kasus;
- Pantauan;
- Kredit;
- aktivitas.

Workspace client harus berasa profesional tetapi tetap brand Jejak.

## 75.4 Partner Freeze

Copy:

> **Akses Mitra lagi dijeda.**

Jelaskan fitur mana yang sementara tidak tersedia.

Akun user biasa tetap bisa digunakan jika status account normal.

---

# 76. Client Workspace Mitra

## 76.1 Client List

Client card minimal:

- nama label yang dibuat Mitra;
- jumlah Kasus;
- status perhatian;
- last activity.

Jangan memaksa KTP/avatar personal.

## 76.2 Privacy

Jangan tampilkan detail semua client di notification preview.

## 76.3 Team Foundation

Jika tim diaktifkan nanti, identity contributor terlihat di audit/detail yang relevan.

---

# 77. Referral, Voucher, Campaign UI

## 77.1 Referral Code

Tampilkan mudah disalin.

Feedback:

> **Kode referral sudah disalin.**

## 77.2 Commission State

- Menunggu;
- Valid;
- Sudah dibayar;
- Ditahan untuk peninjauan jika flagged.

## 77.3 Voucher

Redeem state:

> **Voucher berhasil dipakai.**

Expired:

> **Voucher ini sudah nggak aktif.**

Used:

> **Voucher ini sudah digunakan.**

## 77.4 Campaign Builder Admin

Form harus memisahkan:

- siapa targetnya;
- benefit;
- syarat;
- masa berlaku;
- limit;
- partner terkait.

Preview before publish.

---

# 78. Design Token Governance

Implementasi harus mengonsolidasikan:

- colors;
- spacing;
- radius;
- typography;
- shadows;
- transitions;
- z-index/layering;
- component states.

Jangan menulis styling ad-hoc berbeda di setiap screen.

Dokumen ini menentukan rasa dan semantics. Nilai teknis final harus menjadi token terpusat.

Jika token fundamental berubah:

- catat di `.notes/DECISIONS.md`;
- cek regression utama;
- jangan patch lokal di 20 komponen.

---

# 79. Layer / Z-Order Governance

Buat hierarchy konsisten untuk:

- App Shell;
- sticky nav;
- popover;
- sheet;
- modal;
- critical modal;
- toast;
- update banner.

Tidak boleh ada “z-index war” ad-hoc.

Mobile keyboard dan PWA safe area wajib diperhitungkan.

---

# 80. Design Review Checklist per Komponen

Sebelum komponen dianggap selesai, cek:

1. Apakah Bahasa Indonesia sudah benar?
2. Apakah istilah sesuai kamus?
3. Apakah ada emoji yang seharusnya SVG?
4. Apakah touch target cukup?
5. Apakah desktop cursor behavior bagus?
6. Apakah fitur tetap tersedia tanpa hover?
7. Apakah reduced-motion tetap hidup?
8. Apakah device light renderer tetap premium?
9. Apakah state loading ada?
10. Apakah state empty ada?
11. Apakah state error ada?
12. Apakah offline/stale relevan?
13. Apakah permission denied relevan?
14. Apakah copy tidak menyalahkan user?
15. Apakah warna bukan satu-satunya status?
16. Apakah keyboard focus benar?
17. Apakah modal/sheet bisa ditutup dengan jelas?
18. Apakah motion punya fungsi?
19. Apakah motion dapat gagal tanpa merusak UI?
20. Apakah visual effect cukup ringan?

---

# 81. Screen Review Checklist

Untuk setiap layar/workspace:

- satu primary goal jelas;
- satu primary CTA dominan;
- navigation context jelas;
- no page scroll;
- content internal scroll bila perlu;
- mobile thumb reach diuji;
- desktop hierarchy diuji;
- hybrid touch+mouse tidak rusak;
- loading lokal;
- no unnecessary remount;
- empty state punya CTA;
- error punya recovery;
- AI tidak menguasai layar jika tidak relevan;
- payment/credit values dari server/config;
- premium feature visibility tidak agresif;
- secret/private info tidak bocor di preview.

---

# 82. Browser QA Visual Checklist

## Brave Android

Cek:

- Search Console;
- bottom navigation;
- keyboard;
- reduced motion behavior;
- graph;
- upload;
- PWA install/update;
- back/refresh;
- safe area.

## Brave Desktop

Cek:

- hover;
- pointer precision;
- motion preference;
- graph;
- admin split pane;
- command navigation.

## Safari iPhone

Real device jika tersedia:

- login;
- add-to-home-screen;
- standalone launch;
- viewport;
- safe area;
- keyboard;
- bottom sheet;
- upload;
- version update;
- graph fallback;
- back/refresh.

## Chrome/Edge/Firefox

Cross-check core behavior dan rendering.

Agent dilarang menandai Safari sebagai tervalidasi hanya karena Chrome responsive mode terlihat benar.

---

# 83. Motion QA Checklist

Test minimal:

- normal motion;
- reduced motion;
- low-performance/simplified mode;
- tab background/foreground;
- browser yang haptic tidak tersedia;
- failed animation library/enhancement.

Core UI harus tetap usable di semua state.

---

# 84. PWA QA Visual Checklist

- install CTA muncul saat relevan;
- CTA tidak terus muncul setelah installed;
- iOS instruction benar;
- icon tidak terpotong;
- splash tidak lama;
- standalone layout safe;
- back ada;
- refresh ada;
- update ready UX ada;
- critical update UX ada;
- safe intent restore;
- outdated client UX;
- version visible pada Diagnostics.

---

# 85. Diagnostics UI

Path konseptual:

> Akun → Tentang Jejak → Diagnosis

Tampilkan:

- versi Jejak;
- browser;
- kategori perangkat;
- PWA/browser mode;
- motion mode;
- koneksi summary;
- last sync;
- error code terakhir bila relevan.

Action:

> **Salin info diagnosis**

Jangan sertakan:

- API key;
- access token;
- full sensitive identifier;
- secret data.

---

# 86. Visual Security Rules

## 86.1 Hidden Button Tidak Sama dengan Permission

Desain boleh menyembunyikan admin entry untuk estetika.

Tetapi visual tidak boleh memberi kesan itu security mechanism.

## 86.2 Sensitive Preview

Secret Case/payment proof/PII harus dihindari di:

- browser title jika tidak perlu;
- notification preview;
- share card;
- recent preview;
- cached thumbnail.

## 86.3 Support Reveal

Reveal sensitive field harus jelas sebagai action dan audited.

---

# 87. Owner Entry / Hidden Admin Navigation

Boleh menggunakan interaction elegan dengan Mata Jejak/logo sebagai discoverable admin shortcut untuk Owner.

Namun:

- jangan terlalu rumit;
- jangan satu-satunya cara akses Ruang Kendali;
- direct route tetap di-protect server-side;
- user biasa menemukan route tidak mendapatkan akses.

Entry effect boleh seperti iris/metal aperture ringan.

Jangan theatrical 5 detik.

---

# 88. Visual Tone per Context

## Landing

Misterius ringan + premium.

## User Home

Tenang + actionable.

## Scan

Intelligence instrument.

## Result

Clear + evidence-first.

## Case

Deep analysis.

## Jejak Gue

Protective + personal.

## Top-up

Trustworthy + financial clarity.

## Partner

Professional + operational.

## Ruang Kendali

Cockpit + calm urgency.

## Error

Humble + recovery-oriented.

---

# 89. Priority of Information

Jika layar mulai penuh, urutan yang dipertahankan:

1. primary decision/action;
2. risk/status;
3. evidence context;
4. next step;
5. secondary metadata;
6. decorative visual.

Decorative visual selalu yang pertama dikorbankan jika ruang/performa tidak cukup.

---

# 90. Definition of “Premium” untuk Jejak

Premium **bukan**:

- banyak blur;
- banyak animasi;
- banyak gradient;
- banyak card;
- banyak data.

Premium berarti:

- respons cepat;
- material konsisten;
- tipografi kuat;
- state lengkap;
- copy matang;
- data mudah dipahami;
- motion tepat;
- detail touch/cursor dipikirkan;
- tidak ada dead-end;
- tidak ada UI generik/error Inggris;
- tidak ada feature yang terasa setengah jadi.

---

# 91. Definition of Done — Design Layer

Sebuah fitur belum dianggap selesai dari sisi desain sampai:

- mengikuti visual tokens;
- Bahasa Indonesia konsisten;
- icon SVG konsisten;
- mobile/touch selesai;
- desktop/pointer selesai;
- hybrid input aman;
- loading/empty/error/partial state selesai;
- reduced-motion selesai;
- simplified rendering selesai jika fitur berat;
- keyboard/focus dasar selesai;
- no page scroll regression;
- PWA standalone tidak rusak;
- performance tidak regress;
- screenshot/PII preview aman;
- premium/locked state sesuai prinsip;
- copy tidak overclaim;
- QA critical terkait lulus.

---

# 92. Instruksi Mutlak untuk Agent Coding

Agent Coding wajib:

1. membaca dokumen ini sebelum membangun UI inti;
2. tidak mengganti bahasa desain dengan template dashboard favoritnya;
3. tidak memakai emoji sebagai icon system;
4. tidak meninggalkan English placeholder/error di UI final;
5. tidak membuat desktop lalu sekadar mengecilkan untuk mobile;
6. tidak membuat mobile lalu sekadar membesarkan untuk desktop;
7. tidak membuat feature penting hover-only;
8. tidak mengorbankan performa untuk efek dekoratif;
9. tidak membuat Core UI bergantung pada animation callback;
10. tidak memaksa reduced-motion menjadi UI mati;
11. tidak membuat global page scroll setelah login;
12. tidak hardcode harga, nomor rekening, biaya kredit, atau status bisnis ke komponen;
13. tidak membuat saldo/permission terasa benar hanya dari cache;
14. tidak memunculkan fake loading/progress;
15. tidak menyebut seseorang penipu sebagai system conclusion tanpa evidence yang memang mendukung dan wording policy yang sesuai;
16. merawat `.notes/STATUS_PROJECT.md` setelah milestone UI penting;
17. mencatat keputusan desain implementasi penting di `.notes/DECISIONS.md`;
18. memanfaatkan skills/tooling global yang relevan setelah memeriksa availability di environment;
19. tidak install ulang tooling global tanpa kebutuhan;
20. melakukan regression check sebelum menandai UI selesai.

---

# 93. Handoff Antar-Agent — Design Context

Agent baru yang melanjutkan UI **tidak perlu membaca semua file dari awal tanpa arah**.

Urutan minimum:

1. baca `.notes/STATUS_PROJECT.md`;
2. baca `.notes/DECISIONS.md`;
3. baca section relevan di `docs/DESIGN_SYSTEM.md`;
4. baca screen terkait di `docs/WIRE_MAP.md`;
5. baca requirement fitur terkait di `docs/PRD.md` jika perlu;
6. cek Acceptance Tests terkait;
7. lanjutkan dari state existing, jangan rewrite hanya karena preferensi pribadi.

Jika agent sebelumnya sudah memilih token/font/library yang valid dan dicatat, agent baru tidak boleh menggantinya tanpa alasan yang kuat.

---

# 94. Keputusan yang Boleh Agent Optimalkan

Agent boleh memilih:

- teknologi animasi;
- renderer graph;
- exact spacing token;
- exact neutral color values;
- font family yang legal/available;
- implementation strategy untuk sheet/modal;
- internal component architecture;

selama:

- rasa produk tidak berubah;
- performa memenuhi kontrak;
- browser compatibility tidak turun;
- design token terpusat;
- keputusan fundamental dicatat.

---

# 95. Keputusan yang Tidak Boleh Agent Improvisasi

Tanpa keputusan baru dari Owner/blueprint, Agent tidak boleh mengubah:

- full Bahasa Indonesia;
- tone Lo/Gue yang refined casual;
- tidak pakai emoji sebagai icon system;
- Obsidian Intelligence direction;
- Mata Jejak identity;
- no page scroll App Shell;
- empat navigasi user utama;
- adaptive touch vs cursor;
- reduced motion tetap hidup;
- PWA install/update/back/refresh experience;
- result reveal pattern;
- graph progressive disclosure;
- locked node silhouette, bukan blur paywall murahan;
- admin/User Mode separation;
- financial clarity;
- anti-dark-pattern;
- evidence-first wording;
- premium = speed + precision, bukan efek berlebihan.

---

# 96. Seed Visual Decisions untuk Implementasi Awal

Karena agent perlu memulai tanpa bertanya hal kecil, gunakan seed berikut sampai implementation review membuktikan perlu perubahan:

- dark-first appearance;
- near-black charcoal background;
- titanium primary surfaces;
- smoked glass only for overlays/premium silhouette;
- warm/off-white main text;
- restrained amber/crimson/green/steel-blue status accents;
- rounded geometry moderat, bukan bubbly;
- thin geometric SVG icons;
- one primary light direction;
- soft inner highlight pada tactile controls;
- no saturated neon;
- no animated gradient backgrounds;
- no wallpaper-heavy design;
- graph canvas matte/dark;
- user UI lower density than admin.

Seed ini boleh disempurnakan saat implementation, tetapi perubahan fundamental harus dicatat.

---

# 97. Quality Gate Desain Sebelum Rilis V1

Minimal harus dibuktikan:

## User App

- landing satu viewport matang;
- Search Console signature matang;
- onboarding matang;
- Beranda matang;
- Periksa matang;
- Kasus matang;
- Jejak Gue matang;
- Dompet/top-up matang;
- Kabar matang;
- Panduan matang;
- result reveal matang;
- Relationship Graph fallback matang;
- AI basic/premium surfaces matang.

## PWA

- Pasang Jejak jelas;
- standalone navigation jelas;
- Kembali;
- Segarkan;
- update UX;
- stale-version UX.

## Admin

- Ringkasan;
- pembayaran;
- user detail;
- bisnis/payment config;
- system health;
- NADI basic;
- Owner Inbox;
- mobile approval.

## Cross-device

- Brave Android;
- Brave Desktop;
- Chrome mobile/desktop;
- real Safari validation sesuai availability;
- PWA standalone;
- reduced motion;
- keyboard/focus basic.

Jika salah satu critical surface masih template/generic, desain V1 belum selesai.

---

# 98. Ringkasan 20 Hukum Desain Jejak

1. **Semua UI berbahasa Indonesia.**
2. **Bahasanya sehari-hari, humble, elegan.**
3. **Emoji bukan icon system.**
4. **Premium berarti cepat dan presisi.**
5. **App Shell tidak page-scroll.**
6. **Konten panjang scroll di area internal.**
7. **Mobile dan desktop punya interaction model berbeda.**
8. **Hover/long press hanya enhancement.**
9. **Core UI tidak bergantung pada motion.**
10. **Reduced motion tetap hidup.**
11. **Motion tidak boleh norak.**
12. **Glass digunakan hemat.**
13. **3D tidak boleh mengorbankan performa.**
14. **Graph menjelaskan hubungan, bukan dekorasi.**
15. **Risk UI tidak menuduh.**
16. **AI dibedakan dari evidence.**
17. **Upsell berdasarkan value nyata.**
18. **PWA punya install, back, refresh, dan update UX sendiri.**
19. **Admin cockpit tidak menjadi dashboard chart overload.**
20. **Setiap state gagal tetap terasa seperti bagian Jejak, bukan error page asing.**

---

# 99. Status Dokumen

Dokumen ini adalah **source of truth desain Jejak** untuk fase implementasi.

Setelah coding dimulai:

- perubahan implementasi penting dicatat di `.notes/DECISIONS.md`;
- progres dan QA dicatat di `.notes/STATUS_PROJECT.md`;
- Agent Coding berikutnya membaca status/decisions dulu sebelum mengulang konteks;
- jika ada konflik dengan PRD soal tujuan/perilaku produk, `docs/PRD.md` menang;
- jika ada konflik soal detail layar, `docs/WIRE_MAP.md` menjadi referensi struktur setelah dibuat;
- jika ada konflik soal acceptance, `docs/ACCEPTANCE_TESTS.md` menentukan apakah fitur lolos.

**Jangan mengubah karakter Jejak hanya karena library/template tertentu lebih cepat dipasang.**

Tujuan akhir desain:

> User membuka Jejak dan langsung merasa ini alat yang serius, mahal, cepat, dan jelas—tanpa harus merasa sedang menggunakan software teknis yang dibuat untuk programmer.

---

**END OF DESIGN SYSTEM**
