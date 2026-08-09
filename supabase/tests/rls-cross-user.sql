-- Bukti isolasi antar pengguna pada lapisan RLS.
--
-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/rls-cross-user.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.
--
-- Pengujian dilakukan dengan menyamar sebagai pengguna sungguhan: peran Postgres
-- diturunkan ke `authenticated` dan klaim JWT diisi seperti yang dilakukan
-- PostgREST, sehingga policy yang diuji benar-benar policy yang dipakai aplikasi.
--
-- Aman dijalankan di database yang sudah berisi pengguna nyata: blok ini hanya
-- membuat dan menghapus akun uji miliknya sendiri, berjalan dalam satu
-- transaksi, dan memeriksa jumlah baris kembali seperti semula di akhir.
do $$
declare
  id_a uuid := gen_random_uuid();
  id_b uuid := gen_random_uuid();
  peran_owner uuid;
  peran_user uuid;
  profil_awal int;
  peran_awal int;
  jumlah int;
  berhasil boolean;
begin
  select count(*) into profil_awal from public.profiles;
  select count(*) into peran_awal from public.user_roles;

  select id into peran_owner from public.roles where code = 'owner';
  select id into peran_user from public.roles where code = 'user';

  insert into auth.users (id, email) values
    (id_a, 'uji-a@contoh.test'),
    (id_b, 'uji-b@contoh.test');

  -- Data milik B yang tidak boleh bocor ke A.
  update public.profiles set display_name = 'Rahasia Milik B' where id = id_b;

  ------------------------------------------------------------------
  -- A menyamar sebagai dirinya sendiri
  ------------------------------------------------------------------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  select count(*) into jumlah from public.profiles;
  if jumlah <> 1 then raise exception 'GAGAL 1: A melihat % profil, harusnya hanya miliknya sendiri', jumlah; end if;

  select count(*) into jumlah from public.profiles where id = id_b;
  if jumlah <> 0 then raise exception 'GAGAL 2: A bisa membaca profil B'; end if;

  select count(*) into jumlah from public.user_roles;
  if jumlah <> 1 then raise exception 'GAGAL 3: A melihat % penugasan peran, harusnya hanya miliknya', jumlah; end if;

  -- A mencoba mengangkat dirinya sendiri jadi Owner.
  berhasil := true;
  begin
    insert into public.user_roles (user_id, role_id) values (id_a, peran_owner);
  exception
    when insufficient_privilege or others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 4: A berhasil memberi dirinya peran owner'; end if;

  -- A mencoba mengubah status akunnya sendiri.
  berhasil := true;
  begin
    update public.profiles set account_status = 'active' where id = id_a;
  exception
    when insufficient_privilege or others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 5: A berhasil mengubah account_status miliknya'; end if;

  -- A mencoba mengubah nama tampilan milik B.
  update public.profiles set display_name = 'diambil alih A' where id = id_b;
  if found then raise exception 'GAGAL 6: A berhasil mengubah profil B'; end if;

  -- A boleh mengubah preferensinya sendiri.
  update public.profiles set display_name = 'Nama Pilihan A' where id = id_a;
  if not found then raise exception 'GAGAL 7: A tidak bisa mengubah nama tampilannya sendiri'; end if;

  -- Peta peran-ke-kemampuan tidak terbuka untuk klien.
  berhasil := true;
  begin
    perform 1 from public.role_permissions limit 1;
  exception
    when insufficient_privilege then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 8: role_permissions terbaca oleh pengguna biasa'; end if;

  -- Pengguna biasa tidak punya kemampuan staf.
  if app.current_user_has_permission('payments.approve') then
    raise exception 'GAGAL 9: pengguna biasa punya izin menyetujui pembayaran';
  end if;
  if app.is_owner() then raise exception 'GAGAL 10: pengguna biasa terbaca sebagai owner'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- A diangkat jadi Owner, lalu dicabut
  ------------------------------------------------------------------
  insert into public.user_roles (user_id, role_id, reason) values (id_a, peran_owner, 'uji');

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  if not app.is_owner() then raise exception 'GAGAL 11: peran owner dari database tidak terbaca'; end if;
  if not app.current_user_has_permission('payments.approve') then
    raise exception 'GAGAL 12: owner tidak mendapat izin menyetujui pembayaran';
  end if;
  -- Owner pun tetap tidak boleh melihat profil orang lain lewat query langsung.
  select count(*) into jumlah from public.profiles where id = id_b;
  if jumlah <> 0 then raise exception 'GAGAL 13: owner bisa membaca profil B lewat Data API'; end if;

  execute 'reset role';

  -- Pencabutan peran harus langsung berlaku, tanpa menunggu token kedaluwarsa.
  update public.user_roles set status = 'revoked', revoked_at = now()
  where user_id = id_a and role_id = peran_owner;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  if app.is_owner() then raise exception 'GAGAL 14: peran owner masih aktif setelah dicabut'; end if;
  if app.current_user_has_permission('payments.approve') then
    raise exception 'GAGAL 15: izin staf masih menempel setelah peran dicabut';
  end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Akun yang dijeda kehilangan kemampuan staf seketika
  ------------------------------------------------------------------
  update public.user_roles set status = 'active', revoked_at = null
  where user_id = id_a and role_id = peran_owner;
  update public.profiles set account_status = 'paused' where id = id_a;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  if app.current_user_has_permission('payments.approve') then
    raise exception 'GAGAL 16: akun dijeda masih punya izin staf';
  end if;
  if app.is_active_user() then raise exception 'GAGAL 17: akun dijeda masih terbaca aktif'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Tamu tanpa klaim JWT tidak melihat apa pun
  ------------------------------------------------------------------
  execute 'set local role anon';
  perform set_config('request.jwt.claims', null, true);

  berhasil := true;
  begin
    select count(*) into jumlah from public.profiles;
    if jumlah <> 0 then raise exception 'GAGAL 18: tamu melihat % profil', jumlah; end if;
  exception
    when insufficient_privilege then berhasil := false;
  end;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Bersihkan
  ------------------------------------------------------------------
  delete from auth.users where id in (id_a, id_b);

  select count(*) into jumlah from public.profiles;
  if jumlah <> profil_awal then
    raise exception 'GAGAL 19: profil tersisa % , sebelum uji %', jumlah, profil_awal;
  end if;

  select count(*) into jumlah from public.user_roles;
  if jumlah <> peran_awal then
    raise exception 'GAGAL 20: penugasan peran tersisa %, sebelum uji %', jumlah, peran_awal;
  end if;

  raise notice 'SEMUA INVARIANT ISOLASI ANTAR PENGGUNA LULUS';
end;
$$;
