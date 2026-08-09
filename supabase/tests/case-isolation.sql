-- Bukti isolasi Kasus antar pengguna, plus perlindungan nilai identifier.
--
-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/case-isolation.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.
--
-- Sama seperti uji RLS lain: menyamar sebagai pengguna sungguhan, berjalan dalam
-- satu transaksi, hanya menyentuh akun uji miliknya sendiri, dan memeriksa
-- jumlah baris kembali seperti semula.
do $$
declare
  id_a uuid := gen_random_uuid();
  id_b uuid := gen_random_uuid();
  kasus_a uuid;
  kasus_b uuid;
  entitas_a uuid;
  kasus_awal int;
  jumlah int;
  tersamar text;
  berhasil boolean;
begin
  select count(*) into kasus_awal from public.cases;

  insert into auth.users (id, email) values
    (id_a, 'uji-kasus-a@contoh.test'),
    (id_b, 'uji-kasus-b@contoh.test');

  ------------------------------------------------------------------
  -- A membuat kasus dan menambah petunjuk
  ------------------------------------------------------------------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  kasus_a := public.buat_kasus('Toko mencurigakan', 'fraud_check', false);

  -- Membuat kasus harus sekalian membuat keanggotaan owner.
  select count(*) into jumlah
  from public.case_members where case_id = kasus_a and user_id = id_a and role = 'owner' and status = 'active';
  if jumlah <> 1 then raise exception 'GAGAL 1: keanggotaan owner tidak dibuat bersama kasus'; end if;

  entitas_a := public.tambah_petunjuk(kasus_a, 'email', '  Budi@Contoh.CO.ID  ');

  -- Nilai mentah tidak disimpan apa adanya.
  execute 'reset role';
  select display_value_masked into tersamar from public.case_entities where id = entitas_a;
  if tersamar like '%budi@%' then
    raise exception 'GAGAL 2: nilai email tersimpan tanpa disamarkan (%)', tersamar;
  end if;
  if tersamar <> 'b***@contoh.co.id' then
    raise exception 'GAGAL 3: bentuk tersamar tidak sesuai harapan (%)', tersamar;
  end if;

  select count(*) into jumlah from public.case_entities
  where id = entitas_a and normalized_value_ciphertext is not null and normalized_value_hmac is not null;
  if jumlah <> 1 then raise exception 'GAGAL 4: ciphertext atau HMAC identifier tidak terisi'; end if;

  -- Ciphertext harus benar-benar bisa dibuka lagi oleh server.
  select count(*) into jumlah from public.case_entities
  where id = entitas_a
    and extensions.pgp_sym_decrypt(normalized_value_ciphertext, app.kunci('jejak_identifier_enc'))
        = 'budi@contoh.co.id';
  if jumlah <> 1 then raise exception 'GAGAL 5: nilai terenkripsi tidak dapat dipulihkan'; end if;

  -- Petunjuk yang sama tidak boleh masuk dua kali walau ditulis beda huruf.
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  if public.tambah_petunjuk(kasus_a, 'email', 'BUDI@contoh.co.id') <> entitas_a then
    raise exception 'GAGAL 6: petunjuk yang sama membuat entitas baru';
  end if;

  select count(*) into jumlah from public.case_entities where case_id = kasus_a;
  if jumlah <> 1 then raise exception 'GAGAL 7: ada % petunjuk di kasus A, harusnya 1', jumlah; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- B tidak boleh melihat atau menyentuh kasus A
  ------------------------------------------------------------------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_b, 'role', 'authenticated')::text, true);

  kasus_b := public.buat_kasus('Kasus milik B', 'self_check', false);

  select count(*) into jumlah from public.cases;
  if jumlah <> 1 then raise exception 'GAGAL 8: B melihat % kasus, harusnya hanya miliknya', jumlah; end if;

  select count(*) into jumlah from public.cases where id = kasus_a;
  if jumlah <> 0 then raise exception 'GAGAL 9: B bisa membaca kasus A'; end if;

  select count(*) into jumlah from public.case_entities where case_id = kasus_a;
  if jumlah <> 0 then raise exception 'GAGAL 10: B bisa membaca petunjuk di kasus A'; end if;

  select count(*) into jumlah from public.case_members where case_id = kasus_a;
  if jumlah <> 0 then raise exception 'GAGAL 11: B bisa membaca keanggotaan kasus A'; end if;

  -- B mencoba mengubah judul kasus A.
  update public.cases set title = 'diambil alih B' where id = kasus_a;
  if found then raise exception 'GAGAL 12: B berhasil mengubah kasus A'; end if;

  -- B mencoba menambah petunjuk ke kasus A lewat fungsi resmi.
  berhasil := true;
  begin
    perform public.tambah_petunjuk(kasus_a, 'phone', '081234567890');
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 13: B berhasil menambah petunjuk ke kasus A'; end if;

  -- B mencoba menyisipkan kasus langsung, melewati fungsi resmi.
  berhasil := true;
  begin
    insert into public.cases (public_ref, owner_user_id, title)
    values ('UJICOBA', id_b, 'lewat pintu belakang');
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 14: kasus bisa dibuat tanpa lewat buat_kasus()'; end if;

  -- B mencoba mengangkat dirinya jadi anggota kasus A.
  berhasil := true;
  begin
    insert into public.case_members (case_id, user_id, role) values (kasus_a, id_b, 'owner');
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 15: B berhasil menambahkan dirinya ke kasus A'; end if;

  -- Ciphertext dan blind index tidak boleh terbaca client mana pun.
  berhasil := true;
  begin
    perform normalized_value_ciphertext from public.case_entities limit 1;
  exception
    when insufficient_privilege then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 16: ciphertext identifier terbaca oleh client'; end if;

  berhasil := true;
  begin
    perform normalized_value_hmac from public.case_entities limit 1;
  exception
    when insufficient_privilege then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 17: blind index identifier terbaca oleh client'; end if;

  -- Kunci identifier tidak boleh bisa dipanggil dari client.
  berhasil := true;
  begin
    perform app.kunci('jejak_identifier_enc');
  exception
    when insufficient_privilege then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 18: client bisa membaca kunci identifier'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- A tetap utuh melihat kasusnya sendiri
  ------------------------------------------------------------------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  select count(*) into jumlah from public.cases;
  if jumlah <> 1 then raise exception 'GAGAL 19: A melihat % kasus setelah B membuat miliknya', jumlah; end if;

  select count(*) into jumlah from public.cases where id = kasus_b;
  if jumlah <> 0 then raise exception 'GAGAL 20: A bisa membaca kasus B'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Tamu tidak melihat kasus siapa pun
  ------------------------------------------------------------------
  execute 'set local role anon';
  perform set_config('request.jwt.claims', null, true);

  begin
    select count(*) into jumlah from public.cases;
    if jumlah <> 0 then raise exception 'GAGAL 21: tamu melihat % kasus', jumlah; end if;
  exception
    when insufficient_privilege then null;
  end;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Bersihkan
  ------------------------------------------------------------------
  delete from auth.users where id in (id_a, id_b);

  select count(*) into jumlah from public.cases;
  if jumlah <> kasus_awal then
    raise exception 'GAGAL 22: kasus tersisa %, sebelum uji %', jumlah, kasus_awal;
  end if;

  raise notice 'SEMUA INVARIANT KASUS LULUS';
end;
$$;
