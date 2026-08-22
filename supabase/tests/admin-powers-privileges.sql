-- Admin super-power: non-owner ditolak; owner bisa grant kredit (idempoten,
-- saldo naik), ubah status user, TAPI tak bisa ubah status owner, + simpan paket.
-- Cleanup andalkan cascade delete auth.users.
do $$
declare
  id_owner uuid;
  id_user uuid := gen_random_uuid();
  v_wallet uuid;
  v_before int;
  v_after int;
  ditolak boolean;
  kode_paket text := 'uji_pkt_' || substr(gen_random_uuid()::text, 1, 8);
  st text;
begin
  select ur.user_id into id_owner
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where r.code = 'owner' and ur.status = 'active' limit 1;
  if id_owner is null then raise notice 'ADMIN POWERS: tidak ada owner, skip'; return; end if;

  insert into auth.users (id, email) values (id_user, 'uji-admin@contoh.test');
  insert into public.profiles (id, email) values (id_user, 'uji-admin@contoh.test')
    on conflict (id) do nothing;
  select id into v_wallet from public.credit_wallets where user_id = id_user;
  if v_wallet is null then
    insert into public.credit_wallets (user_id) values (id_user) returning id into v_wallet;
  end if;

  -- Non-owner ditolak untuk ketiga aksi.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  ditolak := false;
  begin perform public.ubah_status_pengguna(id_user, 'paused');
  exception when insufficient_privilege then ditolak := true; end;
  if not ditolak then execute 'reset role'; raise exception 'GAGAL 1: non-owner ubah status'; end if;
  ditolak := false;
  begin perform public.beri_kredit_pengguna(id_user, 10, 'x', 'k1');
  exception when insufficient_privilege then ditolak := true; end;
  if not ditolak then execute 'reset role'; raise exception 'GAGAL 2: non-owner beri kredit'; end if;
  ditolak := false;
  begin perform public.simpan_paket(kode_paket, 'X', 1000, 5, 0, 30, true, null, 9);
  exception when insufficient_privilege then ditolak := true; end;
  execute 'reset role';
  if not ditolak then raise exception 'GAGAL 3: non-owner simpan paket'; end if;

  -- Owner: grant kredit (idempoten), ubah status, lindungi owner, simpan paket.
  select available_cached into v_before from public.credit_wallets where id = v_wallet;
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  perform public.beri_kredit_pengguna(id_user, 25, 'bonus uji', 'admin-grant-uji-' || id_user::text);
  perform public.beri_kredit_pengguna(id_user, 25, 'bonus uji', 'admin-grant-uji-' || id_user::text);
  perform public.ubah_status_pengguna(id_user, 'paused');
  ditolak := false;
  begin perform public.ubah_status_pengguna(id_owner, 'blocked');
  exception when insufficient_privilege then ditolak := true; end;
  perform public.simpan_paket(kode_paket, 'Uji Paket', 12345, 7, 1, 45, true, 'Uji', 9);
  execute 'reset role';

  select available_cached into v_after from public.credit_wallets where id = v_wallet;
  if v_after - v_before <> 25 then
    raise exception 'GAGAL 4: kredit masuk bukan 25 / tak idempoten (delta=%)', v_after - v_before;
  end if;
  if not ditolak then raise exception 'GAGAL 5: owner bisa ubah status owner'; end if;
  select account_status::text into st from public.profiles where id = id_user;
  if st <> 'paused' then raise exception 'GAGAL 6: status tak berubah (%)', st; end if;
  if not exists (select 1 from public.credit_packages where code = kode_paket and price_idr = 12345) then
    raise exception 'GAGAL 7: paket tak tersimpan';
  end if;

  delete from public.credit_packages where code = kode_paket;
  delete from auth.users where id = id_user;
  raise notice 'ADMIN POWERS LULUS';
end $$;
