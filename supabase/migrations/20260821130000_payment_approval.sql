-- Phase 9 (Top-up) slice F — Payment Review & Atomic Approval. SCHEMA §33.
-- approve_topup: dalam SATU transaksi kunci order, cegah double-approve, grant
-- kredit (via grant_credits yang idempotent), tautkan settlement, catat audit.
-- Double-click = 1 settlement, tanpa kredit ganda (DEC-0055/0121). Uang bergerak
-- HANYA di sini, dan hanya oleh pemegang payments.approve.

create type public.payment_review_decision as enum ('approve', 'reject', 'request_new_proof');

create table public.payment_reviews (
  id uuid primary key default gen_random_uuid(),
  topup_order_id uuid not null references public.topup_orders (id) on delete cascade,
  reviewer_user_id uuid references auth.users (id) on delete set null,
  decision public.payment_review_decision not null,
  sentinel_override boolean not null default false,
  reason_code text,
  notes text,
  created_at timestamptz not null default now()
);

create index payment_reviews_order on public.payment_reviews (topup_order_id, created_at desc);

-- Audit tertutup dari client; dibaca lewat fungsi admin (nanti) / service_role.
alter table public.payment_reviews enable row level security;
create policy payment_reviews_admin_all on public.payment_reviews
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Approve atomik. Return settlement transaction id (idempoten bila diulang).
-- ---------------------------------------------------------------------------
create function public.approve_topup(
  p_order_ref text,
  p_confirmed_amount int,
  p_reason_code text,
  p_notes text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_order record;
  v_wallet_id uuid;
  v_tx_id uuid;
  v_expires timestamptz;
begin
  if not (app.is_owner() or app.current_user_has_permission('payments.approve')) then
    raise exception 'Tidak berwenang menyetujui pembayaran' using errcode = '42501';
  end if;

  select * into v_order from public.topup_orders where public_ref = p_order_ref for update;
  if not found then raise exception 'Order tidak ditemukan' using errcode = 'P0002'; end if;

  -- Idempoten: sudah disetujui → kembalikan settlement yang sama, tanpa grant ulang.
  if v_order.status = 'approved' then
    return v_order.settlement_transaction_id;
  end if;

  if v_order.status not in ('proof_submitted', 'under_review', 'needs_new_proof') then
    raise exception 'Order tidak dalam status yang bisa disetujui (%)', v_order.status
      using errcode = '55000';
  end if;

  select id into v_wallet_id from public.credit_wallets
    where user_id = v_order.user_id for update;
  if not found then raise exception 'Dompet pengguna tidak ada' using errcode = 'P0002'; end if;

  v_expires := now() + (((v_order.package_snapshot->>'validity_days')::int) || ' days')::interval;

  -- Grant atomik + idempotent (key diturunkan dari order).
  v_tx_id := public.grant_credits(
    v_wallet_id,
    v_order.credits_base,
    v_order.credits_bonus,
    'purchase'::public.origin_type,
    v_order.public_ref,
    v_expires,
    'Top-up ' || v_order.public_ref,
    'topup_' || v_order.id::text
  );

  update public.topup_orders set
    status = 'approved',
    approved_at = now(),
    approved_by = v_uid,
    confirmed_amount_idr = coalesce(p_confirmed_amount, expected_amount_idr),
    settlement_transaction_id = v_tx_id
  where id = v_order.id;

  insert into public.payment_reviews (topup_order_id, reviewer_user_id, decision, reason_code, notes)
    values (v_order.id, v_uid, 'approve', nullif(btrim(coalesce(p_reason_code, '')), ''),
            nullif(btrim(coalesce(p_notes, '')), ''));

  return v_tx_id;
end;
$$;

revoke all on function public.approve_topup(text, int, text, text) from public;
grant execute on function public.approve_topup(text, int, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Reject. Tidak menggerakkan kredit. Idempoten.
-- ---------------------------------------------------------------------------
create function public.reject_topup(
  p_order_ref text,
  p_reason_code text,
  p_notes text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_order record;
begin
  if not (app.is_owner() or app.current_user_has_permission('payments.reject')) then
    raise exception 'Tidak berwenang menolak pembayaran' using errcode = '42501';
  end if;

  select * into v_order from public.topup_orders where public_ref = p_order_ref for update;
  if not found then raise exception 'Order tidak ditemukan' using errcode = 'P0002'; end if;

  if v_order.status = 'rejected' then return; end if;
  if v_order.status = 'approved' then
    raise exception 'Order sudah disetujui, tidak bisa ditolak' using errcode = '55000';
  end if;

  update public.topup_orders set
    status = 'rejected',
    rejected_at = now(),
    rejected_by = v_uid,
    rejection_reason = nullif(btrim(coalesce(p_reason_code, '')), '')
  where id = v_order.id;

  insert into public.payment_reviews (topup_order_id, reviewer_user_id, decision, reason_code, notes)
    values (v_order.id, v_uid, 'reject', nullif(btrim(coalesce(p_reason_code, '')), ''),
            nullif(btrim(coalesce(p_notes, '')), ''));
end;
$$;

revoke all on function public.reject_topup(text, text, text) from public;
grant execute on function public.reject_topup(text, text, text) to authenticated;
