-- Bukti invariant FEFO dan transaksi atomik Credit Ledger.
--
-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/wallet-fefo-invariants.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.

do $$
declare
  id_a uuid := gen_random_uuid();
  dompet_a uuid;
  lot_1 uuid;
  lot_2 uuid;
  produk_id uuid;
  quote_id uuid;
  kasus_id uuid;
  scan_id uuid;
  hold_id uuid;
  saldo int;
  tersisa int;
  dicadangkan int;
  tersamar text;
  berhasil boolean;
begin
  -- 1. Siapkan Pengguna
  insert into auth.users (id, email) values (id_a, 'uji-wallet-a@contoh.test');

  -- Trigger harusnya sudah membuat wallet.
  select id, available_cached, reserved_cached into dompet_a, saldo, dicadangkan
  from public.credit_wallets where user_id = id_a;

  if dompet_a is null then raise exception 'GAGAL 1: Wallet tidak dibuat otomatis'; end if;
  if saldo <> 0 or dicadangkan <> 0 then raise exception 'GAGAL 2: Saldo awal tidak nol'; end if;

  -- 2. Siapkan Produk & Quote
  insert into public.scan_products (code, name, base_credit_cost)
  values ('TEST_SCAN', 'Test Scan', 10)
  on conflict (code) do update set name = excluded.name
  returning id into produk_id;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  kasus_id := public.buat_kasus('Kasus Uji', 'fraud_check', false);

  execute 'reset role';

  insert into public.scan_quotes (user_id, case_id, scan_product_id, quoted_credit_cost, final_credit_cost, config_version, expires_at)

  values (id_a, kasus_id, produk_id, 10, 10, 1, now() + interval '1 day')
  returning id into quote_id;

  insert into public.scans (user_id, case_id, purpose, product_code, quote_id, idempotency_key)
  values (id_a, kasus_id, 'fraud_check', 'TEST_SCAN', quote_id, 'scn_idemp_1')
  returning id into scan_id;

  -- 3. Coba Reserve Tanpa Saldo (Harus Gagal)
  berhasil := true;
  begin
    perform public.reserve_scan_credits(id_a, scan_id, quote_id, 'res_idemp_1');
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 3: Reserve berhasil padahal saldo nol'; end if;

  -- 4. Grant Credits (Admin)
  -- Lot 1: 5 credits, kedaluwarsa besok (FEFO pertama)
  perform public.grant_credits(dompet_a, 5, 0, 'admin_grant', null, now() + interval '1 day', 'test', 'grant_1');
  -- Lot 2: 15 credits, kedaluwarsa lusa (FEFO kedua)
  perform public.grant_credits(dompet_a, 15, 0, 'admin_grant', null, now() + interval '2 days', 'test', 'grant_2');

  select available_cached into saldo from public.credit_wallets where id = dompet_a;
  if saldo <> 20 then raise exception 'GAGAL 4: Saldo total bukan 20, tapi %', saldo; end if;

  -- 5. Reserve Credits (Harusnya berhasil & pakai Lot 1 duluan)
  hold_id := public.reserve_scan_credits(id_a, scan_id, quote_id, 'res_idemp_1');

  select available_cached, reserved_cached into saldo, dicadangkan from public.credit_wallets where id = dompet_a;
  if saldo <> 10 or dicadangkan <> 10 then raise exception 'GAGAL 5: Saldo available % reserved % tidak sesuai', saldo, dicadangkan; end if;

  -- Cek alokasi FEFO di Lots
  -- Lot 1 (5 credits) harus habis dipakai (reserved = 5)
  select reserved_credits into dicadangkan from public.credit_lots where wallet_id = dompet_a order by expires_at asc limit 1;
  if dicadangkan <> 5 then raise exception 'GAGAL 6: Lot 1 tidak ditarik penuh (FEFO gagal), reserved: %', dicadangkan; end if;

  -- Lot 2 (15 credits) harus ditarik 5 (reserved = 5)
  select reserved_credits into dicadangkan from public.credit_lots where wallet_id = dompet_a order by expires_at desc limit 1;
  if dicadangkan <> 5 then raise exception 'GAGAL 7: Lot 2 tidak ditarik sebagian, reserved: %', dicadangkan; end if;

  -- 6. Settle Scan (Partial Cost: bayar 8 dari 10 reserve)
  perform public.settle_scan_credits(scan_id, 8, 'set_idemp_1');

  select available_cached, reserved_cached into saldo, dicadangkan from public.credit_wallets where id = dompet_a;
  if saldo <> 12 or dicadangkan <> 0 then raise exception 'GAGAL 8: Settle salah hitung sisa saldo (10 - 8 = 2, total available 10+2 = 12). Dapat: available %, reserved %', saldo, dicadangkan; end if;

  -- Cek alokasi FEFO setelah Settle
  -- Lot 1 (5) harus terpakai 5, remaining jadi 0 (5 - 5), status exhausted.
  select remaining_credits, status into tersisa, tersamar from public.credit_lots where wallet_id = dompet_a order by expires_at asc limit 1;
  if tersisa <> 0 or tersamar <> 'exhausted' then raise exception 'GAGAL 9: Lot 1 settle salah. Tersisa: %, Status: %', tersisa, tersamar; end if;

  -- Lot 2 (15) harus terpakai 3, remaining jadi 12 (15 - 3), status active.
  select remaining_credits, status into tersisa, tersamar from public.credit_lots where wallet_id = dompet_a order by expires_at desc limit 1;
  if tersisa <> 12 or tersamar <> 'active' then raise exception 'GAGAL 10: Lot 2 settle salah. Tersisa: %, Status: %', tersisa, tersamar; end if;

  -- 7. Bersihkan
  delete from auth.users where id = id_a;
  delete from public.scan_products where code = 'TEST_SCAN';

  raise notice 'SEMUA INVARIANT CREDIT LEDGER LULUS';
end;
$$;
