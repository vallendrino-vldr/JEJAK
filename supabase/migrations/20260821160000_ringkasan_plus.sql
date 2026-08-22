-- Ruang Kendali — Ringkasan diperkaya: cuan hari ini, pembayaran pending, kredit
-- beredar. Return jsonb (signature sama), read-only, owner/analytics.view.

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
    'sumber_terdaftar', (select count(*) from public.source_registry),
    'cuan_hari_ini', (
      select coalesce(sum(coalesce(confirmed_amount_idr, expected_amount_idr)), 0)::bigint
      from public.topup_orders
      where status = 'approved' and approved_at >= date_trunc('day', now())
    ),
    'pembayaran_pending', (
      select count(*) from public.topup_orders
      where status in ('proof_submitted', 'under_review', 'needs_new_proof')
    ),
    'kredit_beredar', (select coalesce(sum(available_cached), 0)::bigint from public.credit_wallets)
  );
end;
$$;

revoke all on function public.ringkasan_kendali() from public;
grant execute on function public.ringkasan_kendali() to authenticated;
