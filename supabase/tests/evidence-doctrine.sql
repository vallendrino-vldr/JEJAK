-- Bukti bahwa Evidence Doctrine dijaga database, bukan cuma disepakati di UI.
--
-- Cara menjalankan:
--   pnpm exec supabase db query --db-url <connection-string> -f supabase/tests/evidence-doctrine.sql
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
  entitas_a uuid;
  entitas_a2 uuid;
  bukti_a uuid;
  hubungan uuid;
  kasus_awal int;
  jumlah int;
  berhasil boolean;
begin
  select count(*) into kasus_awal from public.cases;

  insert into auth.users (id, email) values
    (id_a, 'uji-bukti-a@contoh.test'),
    (id_b, 'uji-bukti-b@contoh.test');

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  kasus_a := public.buat_kasus('Kasus bukti A', 'fraud_check', false);
  entitas_a := public.tambah_petunjuk(kasus_a, 'domain', 'contoh-a.test');
  entitas_a2 := public.tambah_petunjuk(kasus_a, 'email', 'a@contoh-a.test');

  ------------------------------------------------------------------
  -- 1. Bukti wajib membawa paspornya
  ------------------------------------------------------------------
  bukti_a := public.catat_bukti(
    kasus_a, 'verified_fact', 'rdap', 'rdap.verisign.test', 'Domain terdaftar 2019',
    entitas_a, 'high', '2019-03-04T00:00:00Z', true, 'Ulangi kueri RDAP untuk domain yang sama'
  );

  execute 'reset role';
  select count(*) into jumlah from public.case_evidence
  where id = bukti_a and source_locator <> '' and observed_at is not null and occurred_at is not null;
  if jumlah <> 1 then raise exception 'GAGAL 1: paspor bukti tidak lengkap'; end if;

  -- Bukti yang mengaku bisa diverifikasi ulang tapi tanpa petunjuk caranya harus ditolak.
  berhasil := true;
  begin
    insert into public.case_evidence (case_id, evidence_class, source_kind, source_locator, summary, reverifiable)
    values (kasus_a, 'signal'::public.evidence_class, 'dns'::public.evidence_source_kind, 'dns.test', 'tanpa petunjuk verifikasi', true);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 2: bukti reverifiable tanpa petunjuk diterima'; end if;

  -- Inferensi AI tidak boleh masuk sebagai fakta terverifikasi.
  berhasil := true;
  begin
    insert into public.case_evidence (case_id, evidence_class, source_kind, source_locator, summary, created_by_kind)
    values (kasus_a, 'verified_fact'::public.evidence_class, 'ai_analysis'::public.evidence_source_kind, 'gemini', 'AI menyimpulkan', 'ai'::public.actor_kind);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 3: inferensi AI diterima sebagai fakta terverifikasi'; end if;

  ------------------------------------------------------------------
  -- 2. Hubungan: usulan mesin butuh bukti, keputusan butuh manusia
  ------------------------------------------------------------------
  berhasil := true;
  begin
    insert into public.entity_relationships (case_id, from_entity_id, to_entity_id, relationship_type, created_by_kind)
    values (kasus_a, entitas_a, entitas_a2, 'possible'::public.relationship_type, 'ai'::public.actor_kind);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 4: usulan mesin diterima tanpa bukti'; end if;

  berhasil := true;
  begin
    insert into public.entity_relationships (case_id, from_entity_id, to_entity_id, relationship_type, status, created_by_kind, evidence_id)
    values (kasus_a, entitas_a, entitas_a2, 'possible'::public.relationship_type, 'accepted'::public.relationship_status, 'ai'::public.actor_kind, bukti_a);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 5: hubungan diterima tanpa pemutus manusia'; end if;

  -- Entitas tidak boleh berhubungan dengan dirinya sendiri.
  berhasil := true;
  begin
    insert into public.entity_relationships (case_id, from_entity_id, to_entity_id, relationship_type, created_by_kind, evidence_id)
    values (kasus_a, entitas_a, entitas_a, 'direct'::public.relationship_type, 'ai'::public.actor_kind, bukti_a);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 6: entitas berhubungan dengan dirinya sendiri'; end if;

  insert into public.entity_relationships (case_id, from_entity_id, to_entity_id, relationship_type, created_by_kind, evidence_id)
  values (kasus_a, entitas_a, entitas_a2, 'possible'::public.relationship_type, 'ai'::public.actor_kind, bukti_a)
  returning id into hubungan;

  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  perform public.putuskan_hubungan(hubungan, true);

  execute 'reset role';
  select count(*) into jumlah from public.entity_relationships
  where id = hubungan and status = 'accepted' and decided_by = id_a and decided_at is not null;
  if jumlah <> 1 then raise exception 'GAGAL 7: keputusan manusia tidak tercatat'; end if;

  ------------------------------------------------------------------
  -- 3. Linimasa hanya memuat kejadian yang punya waktu
  ------------------------------------------------------------------
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_a, 'role', 'authenticated')::text, true);

  perform public.catat_bukti(
    kasus_a, 'signal', 'dns', 'cloudflare-dns', 'Tidak ada catatan MX', entitas_a, 'medium'
  );

  select count(*) into jumlah from public.linimasa_kasus(kasus_a);
  if jumlah <> 1 then
    raise exception 'GAGAL 8: linimasa memuat % kejadian, harusnya hanya yang berwaktu', jumlah;
  end if;

  ------------------------------------------------------------------
  -- 4. Bukti tidak boleh menyeberang antar kasus maupun antar pengguna
  ------------------------------------------------------------------
  kasus_b := public.buat_kasus('Kasus bukti A kedua', 'self_check', false);

  berhasil := true;
  begin
    perform public.catat_bukti(
      kasus_b, 'signal', 'dns', 'dns.test', 'menunjuk petunjuk kasus lain', entitas_a, 'low'
    );
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 9: bukti bisa menunjuk petunjuk dari kasus lain'; end if;

  execute 'reset role';
  execute 'set local role authenticated';
  perform set_config('request.jwt.claims', json_build_object('sub', id_b, 'role', 'authenticated')::text, true);

  select count(*) into jumlah from public.case_evidence;
  if jumlah <> 0 then raise exception 'GAGAL 10: B melihat % bukti milik A', jumlah; end if;

  select count(*) into jumlah from public.entity_relationships;
  if jumlah <> 0 then raise exception 'GAGAL 11: B melihat % hubungan milik A', jumlah; end if;

  select count(*) into jumlah from public.linimasa_kasus(kasus_a);
  if jumlah <> 0 then raise exception 'GAGAL 12: B bisa membaca linimasa kasus A'; end if;

  berhasil := true;
  begin
    perform public.catat_bukti(kasus_a, 'signal', 'dns', 'dns.test', 'disisipkan B');
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 13: B bisa mencatat bukti di kasus A'; end if;

  berhasil := true;
  begin
    perform public.putuskan_hubungan(hubungan, false);
  exception
    when others then berhasil := false;
  end;
  if berhasil then raise exception 'GAGAL 14: B bisa memutuskan hubungan di kasus A'; end if;

  execute 'reset role';

  ------------------------------------------------------------------
  -- Bersihkan
  ------------------------------------------------------------------
  delete from auth.users where id in (id_a, id_b);

  select count(*) into jumlah from public.cases;
  if jumlah <> kasus_awal then
    raise exception 'GAGAL 15: kasus tersisa %, sebelum uji %', jumlah, kasus_awal;
  end if;

  select count(*) into jumlah from public.case_evidence;
  if jumlah <> 0 then raise exception 'GAGAL 16: bukti tersisa % setelah kasus dihapus', jumlah; end if;

  raise notice 'SEMUA INVARIANT EVIDENCE DOCTRINE LULUS';
end;
$$;
