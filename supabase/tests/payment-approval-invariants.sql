-- Alur uang penuh: order -> submit bukti -> approve (grant kredit atomik) ->
-- kredit masuk sekali. Idempotensi approve (double-click = 1 settlement, tak ada
-- kredit ganda). Reject tak menggerakkan kredit. Non-berwenang ditolak.
-- Cleanup andalkan cascade delete auth.users. Pulihkan primary lama.
do $$
declare
  id_owner uuid;
  id_user uuid := gen_random_uuid();
  kode_rek text := 'uji_rek_apr_' || substr(gen_random_uuid()::text, 1, 8);
  v_prev_primary uuid;
  v_ref text;
  v_ref2 text;
  v_wallet_id uuid;
  v_before int;
  v_after int;
  v_tx uuid;
  v_tx2 uuid;
  v_settlement uuid;
  v_status text;
  v_lots int;
  ditolak boolean;
begin
  select ur.user_id into id_owner
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where r.code = 'owner' and ur.status = 'active' limit 1;
  if id_owner is null then raise notice 'APPROVAL: tidak ada owner, skip'; return; end if;

  select id into v_prev_primary from public.payment_methods
    where is_primary and is_active and retired_at is null limit 1;

  insert into auth.users (id, email) values (id_user, 'uji-apr@contoh.test');
  select id into v_wallet_id from public.credit_wallets where user_id = id_user;
  if v_wallet_id is null then
    insert into public.credit_wallets (user_id) values (id_user) returning id into v_wallet_id;
  end if;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  perform public.simpan_rekening(kode_rek, 'Uji', 'bank_transfer', 'BCA',
    '5566778899', 'Owner', 'x', true, true, 1);
  execute 'reset role';

  -- User: order (proteksi = 25 + 3 = 28 kredit) + submit bukti.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  v_ref := public.buat_order_topup('proteksi', 'idem-apr-' || id_user::text);
  perform public.submit_proof(v_ref, 'payment-proofs/' || v_ref || '/a.jpg', 'hash123',
    'image/jpeg', 1000, 900);
  execute 'reset role';

  select status::text into v_status from public.topup_orders where public_ref = v_ref;
  if v_status <> 'proof_submitted' then raise exception 'GAGAL 1: submit tak ubah status (%)', v_status; end if;

  -- Non-berwenang tak bisa approve.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  ditolak := false;
  begin perform public.approve_topup(v_ref, null, null, null);
  exception when insufficient_privilege then ditolak := true; end;
  execute 'reset role';
  if not ditolak then raise exception 'GAGAL 2: user biasa bisa approve'; end if;

  select available_cached into v_before from public.credit_wallets where id = v_wallet_id;

  -- Owner approve, lalu approve lagi (idempoten).
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  v_tx := public.approve_topup(v_ref, null, 'ok', 'disetujui');
  v_tx2 := public.approve_topup(v_ref, null, 'ok', 'lagi');
  execute 'reset role';

  if v_tx is null then raise exception 'GAGAL 3: approve tak kembalikan settlement'; end if;
  if v_tx <> v_tx2 then raise exception 'GAGAL 4: idempotensi approve gagal'; end if;

  select available_cached into v_after from public.credit_wallets where id = v_wallet_id;
  if v_after - v_before <> 28 then raise exception 'GAGAL 5: kredit masuk bukan 28 (delta=%)', v_after - v_before; end if;

  select status::text, settlement_transaction_id into v_status, v_settlement
    from public.topup_orders where public_ref = v_ref;
  if v_status <> 'approved' then raise exception 'GAGAL 6: status bukan approved (%)', v_status; end if;
  if v_settlement <> v_tx then raise exception 'GAGAL 7: settlement tak tertaut'; end if;
  select count(*) into v_lots from public.credit_lots where wallet_id = v_wallet_id and origin_id = v_ref;
  if v_lots <> 1 then raise exception 'GAGAL 8: lot bukan tepat 1 (%)', v_lots; end if;

  -- Reject pada order lain: tak menggerakkan kredit.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text, true);
  v_ref2 := public.buat_order_topup('mulai', 'idem-rej-' || id_user::text);
  perform public.submit_proof(v_ref2, 'payment-proofs/' || v_ref2 || '/b.jpg', 'h2', 'image/png', 500, 400);
  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  perform public.reject_topup(v_ref2, 'bukti_tidak_cocok', 'tolak');
  execute 'reset role';
  select status::text into v_status from public.topup_orders where public_ref = v_ref2;
  if v_status <> 'rejected' then raise exception 'GAGAL 9: reject tak jalan (%)', v_status; end if;
  select available_cached into v_after from public.credit_wallets where id = v_wallet_id;
  if v_after - v_before <> 28 then raise exception 'GAGAL 10: reject menambah/mengurang kredit'; end if;

  -- Cleanup: hapus rekening, pulihkan primary lama, hapus user (cascade sisanya).
  delete from public.payment_methods where code = kode_rek;
  if v_prev_primary is not null then
    update public.payment_methods set is_primary = true where id = v_prev_primary;
  end if;
  delete from auth.users where id = id_user;
  raise notice 'PAYMENT APPROVAL LULUS';
end $$;
