-- Katalog peran boleh dibaca pengguna yang sudah login.
--
-- Alasannya: isi tabel ini hanya nama peran (owner/admin/finance/support/user)
-- yang memang sudah tertulis terbuka di blueprint, dan aplikasi perlu membacanya
-- lewat relasi user_roles -> roles untuk menampilkan peran milik pengguna sendiri.
--
-- Yang tetap tertutup: siapa memegang peran apa. Itu ada di user_roles dan
-- policy-nya hanya mengizinkan pengguna melihat barisnya sendiri.

grant select on public.roles to authenticated;

create policy "katalog peran dapat dibaca pengguna login"
  on public.roles for select
  to authenticated
  using (true);
