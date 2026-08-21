-- Ruang Kendali hanya untuk owner/analytics.view. Pengguna biasa & tamu ditolak.
-- Berjalan dalam satu transaksi, menyentuh akun uji sendiri, mengembalikan state.
do $$
declare
  id_biasa uuid := gen_random_uuid();
  id_owner uuid;
  ditolak boolean;
begin
  insert into auth.users (id, email) values (id_biasa, 'uji-kendali@contoh.test');

  -- Pengguna biasa: harus ditolak.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_biasa, 'role', 'authenticated')::text, true);
  ditolak := false;
  begin
    perform public.ringkasan_kendali();
  exception when insufficient_privilege then ditolak := true;
  end;
  execute 'reset role';
  if not ditolak then raise exception 'GAGAL 1: pengguna biasa bisa buka Ruang Kendali'; end if;

  -- Owner: harus dapat angka.
  select ur.user_id into id_owner from public.user_roles ur join public.roles r on r.id=ur.role_id
    where r.code='owner' and ur.status='active' limit 1;
  if id_owner is not null then
    execute 'set local role authenticated';
    perform set_config('request.jwt.claims', json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
    if public.ringkasan_kendali() is null then raise exception 'GAGAL 2: owner tidak dapat ringkasan'; end if;
    execute 'reset role';
  end if;

  -- Tamu: ditolak.
  execute 'set local role anon';
  ditolak := false;
  begin perform public.ringkasan_kendali(); exception when others then ditolak := true; end;
  execute 'reset role';
  if not ditolak then raise exception 'GAGAL 3: tamu bisa buka Ruang Kendali'; end if;

  delete from auth.users where id = id_biasa;
  raise notice 'RUANG KENDALI PRIVILEGES LULUS';
end $$;
