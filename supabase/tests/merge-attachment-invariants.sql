-- Bukti bahwa Merge Entitas dan Case Attachments berjalan sesuai aturan.
--
-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/merge-attachment-invariants.sql
-- Keluaran `DO` tanpa error berarti seluruh invariant lulus.
--
-- Berjalan dalam satu transaksi, hanya menyentuh akun uji miliknya sendiri, dan
-- memeriksa jumlah baris kembali seperti semula di akhir.
do $$
declare
  id_a uuid := gen_random_uuid();
  id_b uuid := gen_random_uuid();
  kasus_a uuid;
  kasus_b uuid;
  entitas_sumber uuid;
  entitas_target uuid;
  attachment_id uuid;
  kasus_awal int;
  jumlah int;
  berhasil boolean;
begin
  select count(*) into kasus_awal from public.cases;

  insert into auth.users (id, email) values
    (id_a, 'uji-merge-a@contoh.test'),
    (id_b, 'uji-merge-b@contoh.test');

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  kasus_a := public.buat_kasus('Kasus Merge A', 'fraud_check', false);
  entitas_sumber := public.tambah_petunjuk(kasus_a, 'email', 'sumber@contoh.test');
  entitas_target := public.tambah_petunjuk(kasus_a, 'email', 'target@contoh.test');

  ------------------------------------------------------------------
  -- 1. Merge Entitas
  ------------------------------------------------------------------
  -- Bisa merge entitas valid di kasus yang sama
  perform public.gabung_entitas(kasus_a, entitas_sumber, entitas_target);

  select count(*) into jumlah from public.case_entities
  where id = entitas_sumber and merged_into_entity_id = entitas_target and merge_state = 'merged';
  if jumlah <> 1 then raise exception 'GAGAL 1: entitas sumber gagal dimerge'; end if;

  -- Entitas tidak bisa dimerge ke dirinya sendiri
  berhasil := true;
  begin
    perform public.gabung_entitas(kasus_a, entitas_target, entitas_target);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 2: entitas berhasil dimerge ke dirinya sendiri'; end if;

  -- Bisa membatalkan merge
  perform public.pisahkan_entitas(kasus_a, entitas_sumber);
  select count(*) into jumlah from public.case_entities
  where id = entitas_sumber and merged_into_entity_id is null and merge_state = 'none';
  if jumlah <> 1 then raise exception 'GAGAL 3: entitas sumber gagal dipisahkan'; end if;

  ------------------------------------------------------------------
  -- 2. Case Attachments
  ------------------------------------------------------------------
  attachment_id := public.tambah_lampiran(
    kasus_a,
    'chat_screenshot',
    'kasus_a/bukti.png',
    'image/png',
    1024
  );

  select count(*) into jumlah from public.case_attachments
  where id = attachment_id and case_id = kasus_a and uploaded_by = id_a;
  if jumlah <> 1 then raise exception 'GAGAL 4: attachment gagal dicatat'; end if;

  -- Tidak bisa attachment dengan ukuran 0 atau minus
  berhasil := true;
  begin
    perform public.tambah_lampiran(kasus_a, 'other_evidence', 'kasus_a/kosong.png', 'image/png', 0);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 5: attachment ukuran 0 diterima'; end if;

  ------------------------------------------------------------------
  -- 3. Isolasi antar user/kasus
  ------------------------------------------------------------------
  kasus_b := public.buat_kasus('Kasus Merge B', 'self_check', false);

  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_b, 'role', 'authenticated')::text, true);

  -- B mencoba merge entitas A
  berhasil := true;
  begin
    perform public.gabung_entitas(kasus_a, entitas_sumber, entitas_target);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 6: B berhasil mengubah kasus A'; end if;

  -- B tidak boleh melihat attachment kasus A
  select count(*) into jumlah from public.case_attachments;
  if jumlah <> 0 then raise exception 'GAGAL 7: B bisa melihat attachment A'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Bersihkan
  ------------------------------------------------------------------
  delete from auth.users where id in (id_a, id_b);

  select count(*) into jumlah from public.cases;
  if jumlah <> kasus_awal then
    raise exception 'GAGAL 8: kasus tersisa %, sebelum uji %', jumlah, kasus_awal;
  end if;

  raise notice 'SEMUA INVARIANT MERGE & ATTACHMENT LULUS';
end;
$$;
