-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/initializer-invariants.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.
--
-- Membuktikan trigger inisialisasi user tanpa perlu login Google sungguhan.
-- Semua user uji dibuat dan dihapus di dalam blok yang sama. Blok ini gagal
-- keras kalau ada satu invariant yang tidak terpenuhi, dan karena DO berjalan
-- dalam satu transaksi, kegagalan apa pun otomatis mengembalikan database.
--
-- Aman dijalankan kapan pun. Pemeriksaan bootstrap Owner menyesuaikan keadaan:
-- kalau Owner aktif belum ada, akun dengan email Owner harus mendapatkannya;
-- kalau sudah ada, akun baru justru tidak boleh mendapatkannya.
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
  owner_sudah_ada boolean;
begin
  select count(*) into profil_awal from public.profiles;
  select count(*) into peran_awal from public.user_roles;

  select id into peran_owner from public.roles where code = 'owner';

  select exists (
    select 1 from public.user_roles where role_id = peran_owner and status = 'active'
  ) into owner_sudah_ada;

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

  -- 2. Login berulang tidak menggandakan profil (trigger idempotent).
  update auth.users set updated_at = now() where id = id_biasa;
  begin
    insert into public.profiles (id, email) values (id_biasa, 'uji-biasa@contoh.test');
    raise exception 'GAGAL 2a: profil ganda untuk user yang sama berhasil dibuat';
  exception
    when unique_violation then null;
  end;

  select count(*) into jumlah from public.profiles where id = id_biasa;
  if jumlah <> 1 then raise exception 'GAGAL 2b: ada % profil untuk satu akun', jumlah; end if;

  -- 3. Bootstrap Owner, menyesuaikan keadaan database.
  if owner_sudah_ada then
    -- Kepemilikan sudah dipegang. Akun baru mana pun tidak boleh ikut jadi Owner,
    -- dan jumlah Owner aktif tidak boleh berubah.
    insert into auth.users (id, email) values (id_pemilik_lain, 'uji-pemilik-lain@contoh.test');

    select count(*) into jumlah
    from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = id_pemilik_lain and r.code = 'owner';
    if jumlah <> 0 then raise exception 'GAGAL 3a: akun baru ikut mendapat peran owner'; end if;

    select count(*) into jumlah
    from public.user_roles where role_id = peran_owner and status = 'active';
    if jumlah <> 1 then raise exception 'GAGAL 3b: ada % owner aktif, harusnya tetap 1', jumlah; end if;
  else
    -- Database masih baru. Akun dengan email Owner harus mendapat kepemilikan
    -- tepat sekali, sekaligus tetap memegang peran dasar.
    insert into auth.users (id, email) values (id_owner, email_owner);

    select count(*) into jumlah
    from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = id_owner and ur.status = 'active' and r.code = 'owner';
    if jumlah <> 1 then raise exception 'GAGAL 3c: akun owner dapat peran owner % kali, harusnya 1', jumlah; end if;

    select count(*) into jumlah
    from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = id_owner and ur.status = 'active' and r.code = 'user';
    if jumlah <> 1 then raise exception 'GAGAL 3d: akun owner tidak dapat peran user dasar'; end if;
  end if;

  -- 4. Penghapusan user membersihkan seluruh turunannya dan tidak terhalang
  --    kolom atribusi mana pun.
  delete from auth.users where id in (id_biasa, id_owner, id_pemilik_lain);

  select count(*) into jumlah from public.profiles;
  if jumlah <> profil_awal then
    raise exception 'GAGAL 4a: profil tersisa %, sebelum uji %', jumlah, profil_awal;
  end if;

  select count(*) into jumlah from public.user_roles;
  if jumlah <> peran_awal then
    raise exception 'GAGAL 4b: penugasan peran tersisa %, sebelum uji %', jumlah, peran_awal;
  end if;

  raise notice 'SEMUA INVARIANT INITIALIZER LULUS';
end;
$$;
