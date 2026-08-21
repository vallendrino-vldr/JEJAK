-- payment_methods: user biasa tak bisa kelola/baca; owner bisa simpan (enkripsi
-- round-trip, last4 benar) + primary tunggal. Satu transaksi, bersih sendiri.
do $$
declare
  id_owner uuid;
  id_biasa uuid := gen_random_uuid();
  id_rek uuid;
  v_dec text;
  n int;
  ditolak boolean;
  kode text := 'uji_bca_' || substr(gen_random_uuid()::text, 1, 8);
begin
  select ur.user_id into id_owner
  from public.user_roles ur join public.roles r on r.id = ur.role_id
  where r.code = 'owner' and ur.status = 'active' limit 1;
  if id_owner is null then
    raise notice 'PAYMENT METHODS: tidak ada owner aktif, skip';
    return;
  end if;

  insert into auth.users (id, email) values (id_biasa, 'uji-rek@contoh.test');

  -- 1 & 2: user biasa ditolak kelola + tak punya grant baca tabel (tertutup penuh).
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_biasa, 'role', 'authenticated')::text, true);
  ditolak := false;
  begin
    perform public.simpan_rekening(kode, 'Uji', 'bank_transfer', 'BCA',
      '1234567890', 'Budi', null, true, false, 1);
  exception when insufficient_privilege then ditolak := true;
  end;
  if not ditolak then
    execute 'reset role';
    raise exception 'GAGAL 1: user biasa bisa simpan rekening';
  end if;
  ditolak := false;
  begin
    perform 1 from public.payment_methods;
  exception when insufficient_privilege then ditolak := true;
  end;
  execute 'reset role';
  if not ditolak then raise exception 'GAGAL 2: user biasa bisa baca payment_methods'; end if;

  -- 3: owner simpan; daftar admin memuat rekening, last4 benar, tanpa nomor penuh.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  id_rek := public.simpan_rekening(kode, 'Uji BCA', 'bank_transfer', 'BCA',
    '1234567890', 'Budi Test', 'Transfer ya', true, true, 1);
  select count(*) into n from public.daftar_rekening_kendali()
    where code = kode and account_number_last4 = '7890';
  execute 'reset role';
  if n <> 1 then raise exception 'GAGAL 3: owner tak lihat rekening / last4 salah'; end if;

  -- 4: enkripsi round-trip (baca sebagai postgres, bypass RLS).
  select extensions.pgp_sym_decrypt(account_number_ciphertext, app.kunci('jejak_identifier_enc'))
    into v_dec from public.payment_methods where id = id_rek;
  if v_dec <> '1234567890' then raise exception 'GAGAL 4: dekripsi nomor tidak cocok'; end if;

  -- 5: primary tunggal — rekening kedua jadi primary, yang pertama lepas.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims',
    json_build_object('sub', id_owner, 'role', 'authenticated')::text, true);
  perform public.simpan_rekening(kode || '_2', 'Uji 2', 'bank_transfer', 'BNI',
    '9998887776', 'Budi', 'x', true, true, 2);
  execute 'reset role';
  select count(*) into n from public.payment_methods
    where is_primary and code in (kode, kode || '_2');
  if n <> 1 then raise exception 'GAGAL 5: primary tidak tunggal (%)', n; end if;

  delete from public.payment_methods where code in (kode, kode || '_2');
  delete from auth.users where id = id_biasa;
  raise notice 'PAYMENT METHODS PRIVILEGES + ENKRIPSI LULUS';
end $$;
