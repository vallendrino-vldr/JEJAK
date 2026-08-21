-- topup_orders: buat order idempotent, jumlah unik dalam rentang, snapshot
-- rekening terdekripsi, RLS owner-only. Menyimpan+memulihkan primary lama agar
-- tidak mengganggu data asli. Satu transaksi, bersih sendiri.
do $$
declare
  id_owner uuid;
  id_user uuid := gen_random_uuid();
  id_lain uuid := gen_random_uuid();
  kode_rek text := 'uji_rek_ord_' || substr(gen_random_uuid()::text, 1, 8);
  v_prev_primary uuid;
  v_ref text;
  v_ref2 text;
  v_expected int;
  v_base int;
  v_acct text;
  v_status text;
  n int;
begin
  select ur.user_id into id_owner
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where r.code = 'owner' and ur.status = 'active' limit 1;
  if id_owner is null then
    raise notice 'TOPUP ORDERS: tidak ada owner, skip';
    return;
  end if;

  select id into v_prev_primary from public.payment_methods
    where is_primary and is_active and retired_at is null limit 1;

  insert into auth.users (id, email)
    values (id_user, 'uji-ord@contoh.test'), (id_lain, 'uji-ord2@contoh.test');

  -- Owner buat rekening primary uji.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  perform public.simpan_rekening(kode_rek, 'Uji Rek', 'bank_transfer', 'BCA',
    '1122334455', 'Owner Test', 'Transfer', true, true, 1);
  execute 'reset role';

  -- User buat order + uji idempotensi (key sama → ref sama).
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  v_ref := public.buat_order_topup('proteksi', 'idem-' || id_user::text);
  v_ref2 := public.buat_order_topup('proteksi', 'idem-' || id_user::text);
  execute 'reset role';
  if v_ref <> v_ref2 then raise exception 'GAGAL 1: idempotensi order gagal'; end if;

  select expected_amount_idr, base_amount_idr, status::text,
         payment_method_snapshot->>'account_number'
    into v_expected, v_base, v_status, v_acct
  from public.topup_orders where public_ref = v_ref;
  if v_status <> 'awaiting_proof' then raise exception 'GAGAL 2: status awal salah %', v_status; end if;
  if v_expected <= v_base or v_expected > v_base + 999 then
    raise exception 'GAGAL 3: jumlah unik di luar rentang (base=% exp=%)', v_base, v_expected;
  end if;
  if v_acct <> '1122334455' then
    raise exception 'GAGAL 4: snapshot rekening tidak terdekripsi (%)', v_acct;
  end if;

  -- RLS: user lain tak lihat; pemilik lihat.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_lain, 'role', 'authenticated')::text, true);
  select count(*) into n from public.topup_orders where public_ref = v_ref;
  execute 'reset role';
  if n <> 0 then raise exception 'GAGAL 5: user lain bisa lihat order (%)', n; end if;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  select count(*) into n from public.topup_orders where public_ref = v_ref;
  execute 'reset role';
  if n <> 1 then raise exception 'GAGAL 6: pemilik tak lihat ordernya (%)', n; end if;

  -- Cleanup + pulihkan primary lama.
  delete from public.topup_orders where public_ref = v_ref;
  delete from public.payment_methods where code = kode_rek;
  if v_prev_primary is not null then
    update public.payment_methods set is_primary = true where id = v_prev_primary;
  end if;
  delete from auth.users where id in (id_user, id_lain);
  raise notice 'TOPUP ORDERS LULUS';
end $$;
