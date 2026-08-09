-- Menghapus akun tidak boleh terhalang kolom atribusi.
--
-- Kolom seperti `created_by`, `assigned_by`, dan `invited_by` menunjuk ke
-- auth.users tanpa aturan ON DELETE, sehingga Postgres menolak penghapusan
-- pengguna yang pernah tercatat di sana. Itu bertabrakan langsung dengan janji
-- privasi Jejak: penghapusan akun harus benar-benar bisa berjalan.
--
-- CASCADE bukan jawabannya — menghapus satu kontributor tidak boleh ikut
-- menghapus petunjuk di kasus milik orang lain. Yang benar adalah atribusinya
-- yang hilang, datanya tetap berada di kasus pemiliknya, dan kasus itu sendiri
-- sudah ikut terhapus lewat cascade dari pemiliknya.
--
-- Ditemukan oleh supabase/tests/case-isolation.sql saat membersihkan akun uji.

alter table public.case_entities alter column created_by drop not null;

alter table public.case_entities drop constraint case_entities_created_by_fkey;
alter table public.case_entities
  add constraint case_entities_created_by_fkey
  foreign key (created_by) references auth.users (id) on delete set null;

alter table public.case_members drop constraint case_members_invited_by_fkey;
alter table public.case_members
  add constraint case_members_invited_by_fkey
  foreign key (invited_by) references auth.users (id) on delete set null;

alter table public.user_roles drop constraint user_roles_assigned_by_fkey;
alter table public.user_roles
  add constraint user_roles_assigned_by_fkey
  foreign key (assigned_by) references auth.users (id) on delete set null;

alter table public.user_roles drop constraint user_roles_revoked_by_fkey;
alter table public.user_roles
  add constraint user_roles_revoked_by_fkey
  foreign key (revoked_by) references auth.users (id) on delete set null;
