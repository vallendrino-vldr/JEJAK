-- Ruang Kendali — daftar pemeriksaan & sumber (owner-only, read-only).
create or replace function public.daftar_scan_kendali()
returns table (public_ref text, status text, purpose text, dibuat timestamptz)
language sql stable security definer set search_path = '' as $$
  select s.public_ref, s.status::text, s.purpose::text, s.requested_at
  from public.scans s
  where app.is_owner() or app.current_user_has_permission('analytics.view')
  order by s.requested_at desc
  limit 100;
$$;
revoke all on function public.daftar_scan_kendali() from public;
grant execute on function public.daftar_scan_kendali() to authenticated;

create or replace function public.daftar_sumber_kendali()
returns table (code text, name text, category text, status text, health text, priority int)
language sql stable security definer set search_path = '' as $$
  select sr.code, sr.name, sr.category::text, sr.status::text, sr.health_state::text, sr.priority
  from public.source_registry sr
  where app.is_owner() or app.current_user_has_permission('system.manage_sources')
  order by sr.priority, sr.code;
$$;
revoke all on function public.daftar_sumber_kendali() from public;
grant execute on function public.daftar_sumber_kendali() to authenticated;
