-- Bukti vertical slice domain: start idempotent, target terlindungi, worker
-- private, no-result eksplisit, dan kredit direfund persis sekali.

do $$
declare
  id_user uuid := gen_random_uuid();
  id_scan uuid;
  id_scan_retry uuid;
  ref_scan text;
  status_scan public.scan_status;
  harga integer;
  id_run uuid;
  claim_token text := 'uji-claim-source-workflow-0001';
  workflow_run_id text := 'uji-workflow-run-0001';
  konteks jsonb;
  ciphertext text;
  hmac text;
  tampilan text;
  jumlah integer;
  minimum_snapshot integer;
  status_job text;
  hak_outbox text;
  tersedia integer;
  dicadangkan integer;
  ditolak boolean := false;
begin
  foreach hak_outbox in array array[
    'select', 'insert', 'update', 'delete', 'truncate', 'references', 'trigger'
  ]
  loop
    if has_table_privilege('authenticated', 'public.scan_dispatch_jobs', hak_outbox)
      or has_table_privilege('anon', 'public.scan_dispatch_jobs', hak_outbox)
    then
      raise exception 'GAGAL 0: Outbox dispatch punya privilege client %', hak_outbox;
    end if;
  end loop;

  insert into auth.users (id, email)
  values (id_user, 'uji-scan-workflow@contoh.test');

  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text,
    true
  );

  select scan_id, scan_ref, scan_status, quoted_cost
  into id_scan, ref_scan, status_scan, harga
  from public.mulai_scan(
    'quick_check',
    'domain',
    'Example.COM',
    'uji-scan-workflow-idempotency-1',
    null
  );

  if status_scan <> 'requested' or harga <> 1 then
    raise exception 'GAGAL 1: Start scan tidak mengembalikan quote/status yang benar';
  end if;

  select q.minimum_deliverable_score
  into minimum_snapshot
  from public.scans s
  join public.scan_quotes q on q.id = s.quote_id
  where s.id = id_scan;
  if minimum_snapshot <> 1 then
    raise exception 'GAGAL 1A: Minimum deliverable tidak disnapshot ke quote';
  end if;

  -- Outbox memang private dari authenticated. Inspeksi invariant internal
  -- dilakukan sebagai runner test, lalu role user dipasang lagi untuk menguji
  -- idempotency dan penolakan worker boundary.
  execute 'reset role';

  select status into status_job
  from public.scan_dispatch_jobs
  where scan_id = id_scan;
  if status_job <> 'pending' then
    raise exception 'GAGAL 1B: Outbox scan tidak dibuat atomik';
  end if;

  execute 'set local role authenticated';

  select scan_id into id_scan_retry
  from public.mulai_scan(
    'quick_check',
    'domain',
    'example.com',
    'uji-scan-workflow-idempotency-1',
    null
  );

  if id_scan_retry <> id_scan then
    raise exception 'GAGAL 2: Retry start membuat scan baru';
  end if;

  begin
    perform public.siapkan_scan_worker(id_scan, workflow_run_id);
  exception
    when insufficient_privilege then ditolak := true;
  end;

  if not ditolak then
    raise exception 'GAGAL 3: authenticated dapat memanggil worker';
  end if;

  execute 'reset role';

  select normalized_value_ciphertext, normalized_value_hmac, display_value_masked
  into ciphertext, hmac, tampilan
  from public.scan_targets
  where scan_id = id_scan;

  if ciphertext is null or lower(ciphertext) like '%example.com%' then
    raise exception 'GAGAL 4: Nilai target tidak terenkripsi';
  end if;
  if length(hmac) <> 64 then raise exception 'GAGAL 5: Blind index tidak valid'; end if;
  if tampilan <> 'example.com' then raise exception 'GAGAL 6: Tampilan domain salah'; end if;

  select count(*) into jumlah
  from public.benefit_claims
  where user_id = id_user and benefit_code = 'first_quick_check';
  if jumlah <> 1 then raise exception 'GAGAL 7: Benefit pertama tidak exactly-once'; end if;

  select available_cached, reserved_cached
  into tersedia, dicadangkan
  from public.credit_wallets
  where user_id = id_user;
  if tersedia <> 1 or dicadangkan <> 0 then
    raise exception 'GAGAL 8: Benefit awal salah: available %, reserved %', tersedia, dicadangkan;
  end if;

  konteks := public.siapkan_scan_worker(id_scan, workflow_run_id);
  if konteks ->> 'state' <> 'ready' then
    raise exception 'GAGAL 9: Worker tidak siap: %', konteks;
  end if;

  select status into status_job
  from public.scan_dispatch_jobs
  where scan_id = id_scan;
  if status_job <> 'dispatched' then
    raise exception 'GAGAL 9A: Workflow tidak meng-ack outbox';
  end if;

  konteks := public.siapkan_scan_worker(id_scan, 'uji-workflow-run-duplikat');
  if konteks ->> 'state' <> 'duplicate' then
    raise exception 'GAGAL 9B: Workflow duplikat tidak ditolak: %', konteks;
  end if;

  select r.id into id_run
  from public.scan_source_runs r
  join public.source_registry sr on sr.id = r.source_id
  where r.scan_id = id_scan and sr.code = 'core_rdap';

  if id_run is null then raise exception 'GAGAL 10: Run RDAP tidak dibuat'; end if;

  konteks := public.klaim_source_run(id_run, claim_token);
  if konteks ->> 'targetValue' <> 'example.com'
    or konteks ->> 'sourceCode' <> 'core_rdap'
  then
    raise exception 'GAGAL 11: Konteks worker salah';
  end if;

  -- Success wajib punya object result dengan setidaknya satu fakta bermakna.
  ditolak := false;
  begin
    perform public.catat_hasil_source(
      id_run,
      claim_token,
      'success',
      12,
      100,
      null,
      '{"meaning":"public_registration_record","reverifiable":true}'::jsonb
    );
  exception
    when invalid_parameter_value then ditolak := true;
  end;

  if not ditolak then
    raise exception 'GAGAL 11A: Success tanpa result boleh meloloskan charge';
  end if;

  ditolak := false;
  begin
    perform public.catat_hasil_source(
      id_run,
      claim_token,
      'success',
      12,
      100,
      null,
      '{"result":{},"meaning":"public_registration_record","reverifiable":true}'::jsonb
    );
  exception
    when invalid_parameter_value then ditolak := true;
  end;

  if not ditolak then
    raise exception 'GAGAL 11B: Success dengan result kosong boleh meloloskan charge';
  end if;

  ditolak := false;
  begin
    perform public.catat_hasil_source(
      id_run,
      claim_token,
      'success',
      12,
      100,
      null,
      '{"result":{"statuses":[null,""],"events":[{}],"nameservers":[null]},"meaning":"public_registration_record","reverifiable":true}'::jsonb
    );
  exception
    when invalid_parameter_value then ditolak := true;
  end;

  if not ditolak then
    raise exception 'GAGAL 11C: Array sampah boleh dianggap fakta RDAP';
  end if;

  -- Coverage no-result tidak boleh ikut meloloskan charge.
  ditolak := false;
  begin
    perform public.catat_hasil_source(
      id_run,
      claim_token,
      'no_result',
      12,
      100,
      null,
      '{"result":null,"meaning":"not_found_is_not_safe","reverifiable":true}'::jsonb
    );
  exception
    when invalid_parameter_value then ditolak := true;
  end;

  if not ditolak then
    raise exception 'GAGAL 11D: No-result boleh menyumbang coverage';
  end if;

  perform public.catat_hasil_source(
    id_run,
    claim_token,
    'no_result',
    12,
    0,
    null,
    '{"result":null,"meaning":"not_found_is_not_safe","reverifiable":true}'::jsonb
  );

  konteks := public.finalisasi_scan(id_scan);
  if konteks ->> 'status' <> 'refunded' then
    raise exception 'GAGAL 12: No-result tidak direfund';
  end if;

  -- Retry finalisasi harus no-op dan tidak membuat ledger kedua.
  perform public.finalisasi_scan(id_scan);

  select available_cached, reserved_cached
  into tersedia, dicadangkan
  from public.credit_wallets
  where user_id = id_user;
  if tersedia <> 1 or dicadangkan <> 0 then
    raise exception 'GAGAL 13: Refund salah: available %, reserved %', tersedia, dicadangkan;
  end if;

  select count(*) into jumlah
  from public.credit_transactions
  where reference_type = 'scan'
    and reference_id = id_scan::text
    and transaction_type in ('reserve', 'release');
  if jumlah <> 2 then
    raise exception 'GAGAL 14: Reserve/release tidak exactly-once, jumlah %', jumlah;
  end if;

  select status into status_scan from public.scans where id = id_scan;
  if status_scan <> 'refunded' then raise exception 'GAGAL 15: Status terminal salah'; end if;

  delete from auth.users where id = id_user;

  raise notice 'INVARIANT SCAN WORKFLOW LULUS';
end;
$$;
