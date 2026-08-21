-- Phase 9 slice G — baca antrean top-up untuk admin (payments.view_queue).
-- Read-only. Email termasker. Menyertakan path bukti terakhir agar server bisa
-- membuat signed URL berumur pendek (isi file tetap di bucket privat).

create function public.daftar_topup_kendali()
returns table (
  public_ref text,
  email_masked text,
  package_name text,
  expected_amount_idr int,
  credits_base int,
  credits_bonus int,
  status public.topup_order_status,
  submitted_at timestamptz,
  created_at timestamptz,
  proof_bucket text,
  proof_path text,
  proof_mime text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    o.public_ref,
    left(split_part(pr.email, '@', 1), 1) || '***@' || split_part(pr.email, '@', 2),
    o.package_snapshot->>'name',
    o.expected_amount_idr,
    o.credits_base,
    o.credits_bonus,
    o.status,
    o.submitted_at,
    o.created_at,
    lp.storage_bucket,
    lp.storage_path,
    lp.mime_type
  from public.topup_orders o
  join public.profiles pr on pr.id = o.user_id
  left join lateral (
    select storage_bucket, storage_path, mime_type
    from public.payment_proofs p
    where p.topup_order_id = o.id and p.deleted_at is null
    order by p.created_at desc limit 1
  ) lp on true
  where (app.is_owner() or app.current_user_has_permission('payments.view_queue'))
    and o.status in ('proof_submitted', 'under_review', 'needs_new_proof')
  order by o.submitted_at asc nulls last, o.created_at asc
  limit 100;
$$;

revoke all on function public.daftar_topup_kendali() from public;
grant execute on function public.daftar_topup_kendali() to authenticated;
