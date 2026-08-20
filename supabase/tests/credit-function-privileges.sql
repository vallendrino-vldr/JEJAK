-- Bukti negatif: role browser tidak boleh mengeksekusi fungsi ledger yang
-- melewati RLS. Ini sengaja menguji privilege nyata, bukan cuma membaca ACL.

do $$
declare
  fungsi regprocedure;
  daftar_fungsi regprocedure[] := array[
    'public.grant_credits(uuid,integer,integer,public.origin_type,text,timestamptz,text,text)'::regprocedure,
    'public.reserve_scan_credits(uuid,uuid,uuid,text)'::regprocedure,
    'public.settle_scan_credits(uuid,integer,text)'::regprocedure,
    'public.release_scan_credits(uuid,text)'::regprocedure
  ];
  ditolak boolean := false;
begin
  foreach fungsi in array daftar_fungsi loop
    if has_function_privilege('anon', fungsi, 'execute') then
      raise exception 'GAGAL: anon masih dapat EXECUTE %', fungsi;
    end if;

    if has_function_privilege('authenticated', fungsi, 'execute') then
      raise exception 'GAGAL: authenticated masih dapat EXECUTE %', fungsi;
    end if;

    if not has_function_privilege('service_role', fungsi, 'execute') then
      raise exception 'GAGAL: service_role kehilangan EXECUTE %', fungsi;
    end if;
  end loop;

  execute 'set local role anon';
  begin
    perform public.release_scan_credits(
      '00000000-0000-0000-0000-000000000000'::uuid,
      'uji-privilege-anon'
    );
  exception
    when insufficient_privilege then ditolak := true;
    when others then
      raise exception 'GAGAL: anon mencapai isi release_scan_credits (SQLSTATE %)', sqlstate;
  end;
  execute 'reset role';

  if not ditolak then
    raise exception 'GAGAL: pemanggilan anon tidak ditolak';
  end if;

  ditolak := false;
  execute 'set local role authenticated';
  begin
    perform public.grant_credits(
      '00000000-0000-0000-0000-000000000000'::uuid,
      1,
      0,
      'admin_grant',
      null,
      now() + interval '1 day',
      'uji-privilege-authenticated',
      'uji-privilege-authenticated'
    );
  exception
    when insufficient_privilege then ditolak := true;
    when others then
      raise exception 'GAGAL: authenticated mencapai isi grant_credits (SQLSTATE %)', sqlstate;
  end;
  execute 'reset role';

  if not ditolak then
    raise exception 'GAGAL: pemanggilan authenticated tidak ditolak';
  end if;

  raise notice 'PRIVILEGE LEDGER AMAN: anon/authenticated ditolak, service_role tersedia';
end;
$$;
