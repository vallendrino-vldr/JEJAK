-- Keputusan atas hubungan ditandai waktunya, bukan orangnya.
--
-- `hubungan_keputusan_ada_pemutus` mensyaratkan `decided_by` terisi untuk status
-- accepted/rejected. Tapi `decided_by` melepas acuannya jadi NULL ketika akun
-- dihapus (DEC-0117), sehingga menghapus akun akan melanggar constraint dan
-- penghapusan itu gagal — persis masalah yang sudah kita perbaiki sekali.
--
-- Yang sebenarnya ingin dijaga adalah "keputusan ini pernah diambil manusia,
-- bukan disetel mesin". Penandanya adalah `decided_at`, yang tidak ikut hilang
-- saat akun dihapus. Siapa yang memutuskan tetap dicatat selama akunnya ada.
--
-- Ditemukan oleh supabase/tests/evidence-doctrine.sql saat membersihkan akun uji.

alter table public.entity_relationships
  drop constraint hubungan_keputusan_ada_pemutus;

alter table public.entity_relationships
  add constraint hubungan_keputusan_ada_waktu check (
    status in ('suggested', 'retracted') or decided_at is not null
  );
