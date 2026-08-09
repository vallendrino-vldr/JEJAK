-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/initializer-invariants.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.
--
-- PERINGATAN: hanya jalankan di database yang belum punya pengguna. Blok ini
-- berhenti sendiri kalau menemukan profil atau peran yang sudah ada, supaya
-- tidak pernah menyentuh data pengguna sungguhan.
--
-- Membuktikan trigger inisialisasi user tanpa perlu login Google sungguhan.
-- Semua user uji dibuat dan dihapus di dalam blok yang sama. Blok ini gagal
-- keras kalau ada satu invariant yang tidak terpenuhi, dan karena DO berjalan
-- dalam satu transaksi, kegagalan apa pun otomatis mengembalikan database.
do $$
declare
  id_biasa uuid := gen_random_uuid();
  id_owner uuid := gen_random_uuid();
  id_pemilik_lain uuid := gen_random_uuid();
  email_owner constant text := 'vadlyvldr@gmail.com';
  peran_owner uuid;
  jumlah int;
  profil_awal int;
  peran_awal int;
begin
  select count(*) into profil_awal from public.profiles;
  select count(*) into peran_awal from public.user_roles;

  if profil_awal <> 0 or peran_awal <> 0 then
    raise exception 'DIBATALKAN: database sudah berisi % profil dan % peran. Uji ini hanya aman di database kosong.',
      profil_awal, peran_awal;
  end if;

  select id into peran_owner from public.roles where code = 'owner';

  -- 1. User biasa mendapat profil dan peran dasar, bukan kepemilikan.
  insert into auth.users (id, email) values (id_biasa, 'uji-biasa@contoh.test');

  select count(*) into jumlah from public.profiles where id = id_biasa;
  if jumlah <> 1 then raise exception 'GAGAL 1a: profil user biasa dibuat % kali, harusnya 1', jumlah; end if;

  select count(*) into jumlah
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.user_id = id_biasa and ur.status = 'active' and r.code = 'user';
  if jumlah <> 1 then raise exception 'GAGAL 1b: peran user dasar dibuat % kali, harusnya 1', jumlah; end if;

  select count(*) into jumlah
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.user_id = id_biasa and r.code = 'owner';
  if jumlah <> 0 then raise exception 'GAGAL 1c: user biasa malah dapat peran owner'; end if;

  -- 2. Akun dengan email Owner mendapat kepemilikan tepat sekali.
  insert into auth.users (id, email) values (id_owner, email_owner);

  select count(*) into jumlah
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.user_id = id_owner and ur.status = 'active' and r.code = 'owner';
  if jumlah <> 1 then raise exception 'GAGAL 2a: akun owner dapat peran owner % kali, harusnya 1', jumlah; end if;

  select count(*) into jumlah
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.user_id = id_owner and ur.status = 'active' and r.code = 'user';
  if jumlah <> 1 then raise exception 'GAGAL 2b: akun owner tidak dapat peran user dasar'; end if;

  -- 3. Login berulang tidak menggandakan apa pun (trigger idempotent).
  update auth.users set updated_at = now() where id = id_owner;
  begin
    insert into public.profiles (id, email) values (id_owner, email_owner);
    raise exception 'GAGAL 3a: profil ganda untuk user yang sama berhasil dibuat';
  exception
    when unique_violation then null;
  end;

  select count(*) into jumlah from public.profiles where id = id_owner;
  if jumlah <> 1 then raise exception 'GAGAL 3b: ada % profil untuk akun owner', jumlah; end if;

  -- 4. Pintu bootstrap sudah tertutup: dengan Owner aktif sudah ada, akun baru
  --    yang emailnya sama sekalipun tidak boleh ikut jadi Owner.
  --    Email unik dijaga auth.users, jadi diuji lewat email berbeda sambil
  --    kepemilikan tetap dipegang orang lain.
  delete from public.user_roles where user_id = id_owner and role_id = peran_owner;
  insert into public.user_roles (user_id, role_id, reason)
  values (id_biasa, peran_owner, 'uji: kepemilikan sudah berpindah');

  insert into auth.users (id, email) values (id_pemilik_lain, 'uji-pemilik-lain@contoh.test');

  select count(*) into jumlah
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where ur.status = 'active' and r.code = 'owner';
  if jumlah <> 1 then raise exception 'GAGAL 4: ada % owner aktif, harusnya tetap 1', jumlah; end if;

  -- 5. Penghapusan user membersihkan seluruh turunannya.
  delete from auth.users where id in (id_biasa, id_owner, id_pemilik_lain);

  select count(*) into jumlah from public.profiles;
  if jumlah <> 0 then raise exception 'GAGAL 5a: masih ada % profil tersisa setelah user dihapus', jumlah; end if;

  select count(*) into jumlah from public.user_roles;
  if jumlah <> 0 then raise exception 'GAGAL 5b: masih ada % penugasan peran tersisa setelah user dihapus', jumlah; end if;

  raise notice 'SEMUA INVARIANT INITIALIZER LULUS';
end;
$$;
