-- Semua SECURITY DEFINER di schema public harus tertutup dari anon. Boundary
-- user lama tetap callable oleh authenticated setelah grant warisan dibuang.

do $$
declare
  fungsi regprocedure;
  boundary_user regprocedure[] := array[
    'public.buat_kasus(text,public.case_purpose,boolean)'::regprocedure,
    'public.tambah_petunjuk(uuid,public.entity_type,text,text)'::regprocedure,
    'public.catat_bukti(uuid,public.evidence_class,public.evidence_source_kind,text,text,uuid,public.evidence_reliability,timestamptz,boolean,text,jsonb)'::regprocedure,
    'public.putuskan_hubungan(uuid,boolean)'::regprocedure,
    'public.linimasa_kasus(uuid)'::regprocedure,
    'public.gabung_entitas(uuid,uuid,uuid)'::regprocedure,
    'public.pisahkan_entitas(uuid,uuid)'::regprocedure,
    'public.tambah_lampiran(uuid,public.attachment_type,text,text,bigint)'::regprocedure,
    'public.mulai_scan(text,public.scan_target_type_enum,text,text,uuid)'::regprocedure,
    'public.batalkan_scan_diminta(uuid)'::regprocedure,
    -- Ruang Kendali (read-only, cek izin internal) + Kasus sampah (cek kepemilikan).
    'public.ringkasan_kendali()'::regprocedure,
    'public.daftar_pengguna_kendali()'::regprocedure,
    'public.daftar_scan_kendali()'::regprocedure,
    'public.daftar_sumber_kendali()'::regprocedure,
    'public.hapus_kasus(uuid)'::regprocedure,
    'public.pulihkan_kasus(uuid)'::regprocedure,
    'public.daftar_sampah_kasus()'::regprocedure,
    -- Phase 9: kelola rekening (cek izin business.manage_payment_methods).
    'public.simpan_rekening(text,text,public.payment_method_type,text,text,text,text,boolean,boolean,integer)'::regprocedure,
    'public.daftar_rekening_kendali()'::regprocedure,
    'public.buat_order_topup(text,text)'::regprocedure,
    'public.submit_proof(text,text,text,text,integer,integer)'::regprocedure,
    'public.approve_topup(text,integer,text,text)'::regprocedure,
    'public.reject_topup(text,text,text)'::regprocedure,
    'public.daftar_topup_kendali()'::regprocedure,
    'public.ubah_status_pengguna(uuid,text)'::regprocedure,
    'public.beri_kredit_pengguna(uuid,integer,text,text)'::regprocedure,
    'public.simpan_paket(text,text,integer,integer,integer,integer,boolean,text,integer)'::regprocedure
  ];
  boundary_worker regprocedure[] := array[
    'public.grant_credits(uuid,integer,integer,public.origin_type,text,timestamptz,text,text)'::regprocedure,
    'public.reserve_scan_credits(uuid,uuid,uuid,text)'::regprocedure,
    'public.settle_scan_credits(uuid,integer,text)'::regprocedure,
    'public.release_scan_credits(uuid,text)'::regprocedure,
    'public.klaim_scan_dispatch(uuid,text)'::regprocedure,
    'public.selesaikan_scan_dispatch(uuid,text,text)'::regprocedure,
    'public.gagalkan_scan_dispatch(uuid,text,text)'::regprocedure,
    'public.siapkan_scan_worker(uuid,text)'::regprocedure,
    'public.klaim_source_run(uuid,text)'::regprocedure,
    'public.lepas_klaim_source(uuid,text,text)'::regprocedure,
    'public.catat_hasil_source(uuid,text,public.scan_source_run_status_enum,integer,integer,text,jsonb)'::regprocedure,
    'public.finalisasi_scan(uuid)'::regprocedure,
    'public.gagalkan_scan_worker(uuid,text)'::regprocedure
  ];
  privilege_permisif integer;
begin
  for fungsi in
    select p.oid::regprocedure
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prosecdef
  loop
    if has_function_privilege('anon', fungsi, 'execute') then
      raise exception 'SECURITY DEFINER masih terbuka ke anon: %', fungsi;
    end if;

    if has_function_privilege('authenticated', fungsi, 'execute')
      <> (fungsi = any(boundary_user))
    then
      raise exception 'EXECUTE authenticated tidak sesuai allowlist: %', fungsi;
    end if;
  end loop;

  foreach fungsi in array boundary_user
  loop
    if not has_function_privilege('authenticated', fungsi, 'execute') then
      raise exception 'Boundary user kehilangan EXECUTE: %', fungsi;
    end if;
  end loop;

  foreach fungsi in array boundary_worker
  loop
    if not has_function_privilege('service_role', fungsi, 'execute') then
      raise exception 'Boundary worker kehilangan EXECUTE service_role: %', fungsi;
    end if;
  end loop;

  if to_regprocedure('public.rls_auto_enable()') is not null then
    if has_function_privilege(
      'authenticated',
      to_regprocedure('public.rls_auto_enable()'),
      'execute'
    ) then
      raise exception 'Event-trigger helper terbuka sebagai RPC authenticated';
    end if;
  end if;

  select count(*)
  into privilege_permisif
  from pg_default_acl d
  cross join lateral aclexplode(d.defaclacl) x
  left join pg_roles penerima on penerima.oid = x.grantee
  left join pg_namespace n on n.oid = d.defaclnamespace
  where pg_get_userbyid(d.defaclrole) = 'postgres'
    and (d.defaclnamespace = 0 or n.nspname = 'public')
    and (x.grantee = 0 or penerima.rolname in ('anon', 'authenticated'));

  if privilege_permisif <> 0 then
    raise exception 'Default privilege public masih permisif: % grant', privilege_permisif;
  end if;

  if current_user <> 'postgres' then
    raise exception 'Probe default privilege wajib dijalankan sebagai postgres';
  end if;

  -- Bukti perilaku, bukan cuma introspeksi catalog. Function sementara dibuat
  -- oleh role postgres, diuji dari anon/authenticated, lalu dibuang di statement
  -- yang sama sehingga suite tidak meninggalkan object.
  execute $probe$
    create function public.jejak_default_privilege_probe()
    returns integer
    language sql
    as 'select 1'
  $probe$;

  if has_function_privilege(
    'anon',
    'public.jejak_default_privilege_probe()'::regprocedure,
    'execute'
  ) or has_function_privilege(
    'authenticated',
    'public.jejak_default_privilege_probe()'::regprocedure,
    'execute'
  ) then
    raise exception 'Function baru masih mewarisi EXECUTE client';
  end if;

  execute 'drop function public.jejak_default_privilege_probe()';

  raise notice 'PRIVILEGE SECURITY DEFINER + DEFAULT ACL LULUS';
end;
$$;
