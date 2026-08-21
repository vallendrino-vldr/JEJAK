-- Ruang Kendali — Ringkasan (Phase 10 vertical slice, read-only).
--
-- Satu fungsi agregat owner-only. SECURITY DEFINER supaya bisa menghitung
-- lintas-pengguna (yang RLS biasa tutup), tapi memeriksa izin sendiri lebih
-- dulu: hanya owner atau pemegang analytics.view. Tidak ada mutasi, jadi tidak
-- ada risiko uang/keamanan — hanya angka ringkas.
create or replace function public.ringkasan_kendali()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (app.is_owner() or app.current_user_has_permission('analytics.view')) then
    raise exception 'Tidak berhak membuka Ruang Kendali' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'pengguna', (select count(*) from public.profiles where deleted_at is null),
    'kasus_aktif', (select count(*) from public.cases where status = 'active' and deleted_at is null),
    'scan_total', (select count(*) from public.scans),
    'scan_hari_ini', (select count(*) from public.scans where requested_at >= date_trunc('day', now())),
    'sumber_terdaftar', (select count(*) from public.source_registry)
  );
end;
$$;

revoke all on function public.ringkasan_kendali() from public;
grant execute on function public.ringkasan_kendali() to authenticated;
