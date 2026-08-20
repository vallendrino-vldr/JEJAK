-- Phase 6 hardening: nilai kredit tidak boleh negatif dan seluruh mutasi
-- bernilai harus aman ketika request/worker diulang.

alter table public.scan_products
  add constraint scan_products_cost_nonnegative check (base_credit_cost >= 0) not valid;

alter table public.scan_products
  add constraint scan_products_minimum_deliverable_valid check (
    minimum_deliverable_score is null
    or minimum_deliverable_score between 0 and 100
  ) not valid;

alter table public.scan_quotes
  add constraint scan_quotes_costs_valid check (
    quoted_credit_cost >= 0
    and upgrade_credit_discount >= 0
    and upgrade_credit_discount <= quoted_credit_cost
    and final_credit_cost >= 0
    and final_credit_cost <= quoted_credit_cost
  ) not valid;

alter table public.credit_wallets
  add constraint credit_wallets_cached_nonnegative check (
    available_cached >= 0 and reserved_cached >= 0
  ) not valid;

alter table public.credit_lots
  add constraint credit_lots_amounts_consistent check (
    purchased_credits >= 0
    and bonus_credits >= 0
    and original_credits = purchased_credits + bonus_credits
    and remaining_credits <= original_credits
    and reserved_credits <= remaining_credits
  ) not valid;

alter table public.credit_holds
  add constraint credit_holds_credits_nonnegative check (credits >= 0) not valid;

alter table public.scan_products validate constraint scan_products_cost_nonnegative;
alter table public.scan_products validate constraint scan_products_minimum_deliverable_valid;
alter table public.scan_quotes validate constraint scan_quotes_costs_valid;
alter table public.credit_wallets validate constraint credit_wallets_cached_nonnegative;
alter table public.credit_lots validate constraint credit_lots_amounts_consistent;
alter table public.credit_holds validate constraint credit_holds_credits_nonnegative;

create unique index credit_transactions_one_scan_stage
  on public.credit_transactions (reference_id, transaction_type)
  where reference_type = 'scan'
    and transaction_type in ('reserve', 'settle', 'release');

create or replace function public.grant_credits(
  p_wallet_id uuid,
  p_purchased integer,
  p_bonus integer,
  p_origin_type public.origin_type,
  p_origin_id text,
  p_expires_at timestamptz,
  p_reason text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_lot_id uuid;
  v_tx_id uuid;
  v_existing record;
  v_total integer := p_purchased + p_bonus;
begin
  if p_purchased < 0 or p_bonus < 0 or v_total <= 0 then
    raise exception 'Credit grant amount is invalid' using errcode = '22023';
  end if;

  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'Credit expiry must be in the future' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_idempotency_key, ''))) = 0 then
    raise exception 'Idempotency key is invalid' using errcode = '22023';
  end if;

  perform 1 from public.credit_wallets where id = p_wallet_id for update;
  if not found then
    raise exception 'Wallet not found' using errcode = 'P0002';
  end if;

  select
    t.id as transaction_id,
    t.wallet_id,
    t.transaction_type,
    l.origin_type,
    l.origin_id,
    l.purchased_credits,
    l.bonus_credits,
    l.expires_at
  into v_existing
  from public.credit_transactions t
  left join public.credit_transaction_allocations a on a.transaction_id = t.id
  left join public.credit_lots l on l.id = a.credit_lot_id
  where t.idempotency_key = p_idempotency_key
  limit 1;

  if found then
    if v_existing.wallet_id <> p_wallet_id
      or v_existing.transaction_type <> 'lot_created'
      or v_existing.origin_type is distinct from p_origin_type
      or v_existing.origin_id is distinct from p_origin_id
      or v_existing.purchased_credits is distinct from p_purchased
      or v_existing.bonus_credits is distinct from p_bonus
      or v_existing.expires_at is distinct from p_expires_at
    then
      raise exception 'Idempotency key conflicts with another grant' using errcode = '23505';
    end if;

    return v_existing.transaction_id;
  end if;

  insert into public.credit_lots (
    wallet_id,
    origin_type,
    origin_id,
    original_credits,
    remaining_credits,
    purchased_credits,
    bonus_credits,
    expires_at
  ) values (
    p_wallet_id,
    p_origin_type,
    p_origin_id,
    v_total,
    v_total,
    p_purchased,
    p_bonus,
    p_expires_at
  )
  returning id into v_lot_id;

  insert into public.credit_transactions (
    wallet_id,
    transaction_type,
    delta_available,
    delta_reserved,
    idempotency_key,
    reason_code,
    created_by_system
  ) values (
    p_wallet_id,
    'lot_created',
    v_total,
    0,
    p_idempotency_key,
    nullif(btrim(coalesce(p_reason, '')), ''),
    'grant_credits'
  )
  returning id into v_tx_id;

  insert into public.credit_transaction_allocations (
    transaction_id,
    credit_lot_id,
    credits
  ) values (
    v_tx_id,
    v_lot_id,
    v_total
  );

  update public.credit_wallets
  set available_cached = available_cached + v_total,
      version = version + 1
  where id = p_wallet_id;

  return v_tx_id;
end;
$$;

create or replace function public.reserve_scan_credits(
  p_user_id uuid,
  p_scan_id uuid,
  p_quote_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet_id uuid;
  v_cost integer;
  v_available integer;
  v_remaining_cost integer;
  v_lot record;
  v_reserve_amount integer;
  v_tx_id uuid;
  v_hold_id uuid;
  v_existing_hold record;
begin
  if length(btrim(coalesce(p_idempotency_key, ''))) = 0 then
    raise exception 'Idempotency key is invalid' using errcode = '22023';
  end if;

  select id into v_wallet_id
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'Wallet not found' using errcode = 'P0002';
  end if;

  select id, wallet_id, status, idempotency_key
  into v_existing_hold
  from public.credit_holds
  where scan_id = p_scan_id;

  if found then
    if v_existing_hold.wallet_id <> v_wallet_id
      or v_existing_hold.idempotency_key <> p_idempotency_key || '_hold'
      or v_existing_hold.status <> 'reserved'
    then
      raise exception 'Scan already has a conflicting credit hold' using errcode = '23505';
    end if;

    return v_existing_hold.id;
  end if;

  select q.final_credit_cost
  into v_cost
  from public.scans s
  join public.scan_quotes q on q.id = s.quote_id
  where s.id = p_scan_id
    and s.user_id = p_user_id
    and s.quote_id = p_quote_id
    and s.status = 'requested'
    and q.id = p_quote_id
    and q.user_id = p_user_id
    and q.consumed_at is null
    and q.expires_at > now()
  for update of s, q;

  if not found then
    raise exception 'Scan or quote is invalid' using errcode = '22023';
  end if;

  if v_cost < 0 then
    raise exception 'Quote cost cannot be negative' using errcode = '22023';
  end if;

  select coalesce(sum(remaining_credits - reserved_credits), 0)::integer
  into v_available
  from public.credit_lots
  where wallet_id = v_wallet_id
    and status = 'active'
    and expires_at > now();

  if v_available < v_cost then
    raise exception 'Insufficient credits' using errcode = 'J1001';
  end if;

  insert into public.credit_holds (
    wallet_id,
    scan_id,
    credits,
    status,
    idempotency_key
  ) values (
    v_wallet_id,
    p_scan_id,
    v_cost,
    'reserved',
    p_idempotency_key || '_hold'
  )
  returning id into v_hold_id;

  insert into public.credit_transactions (
    wallet_id,
    transaction_type,
    delta_available,
    delta_reserved,
    reference_type,
    reference_id,
    idempotency_key,
    created_by_system
  ) values (
    v_wallet_id,
    'reserve',
    -v_cost,
    v_cost,
    'scan',
    p_scan_id::text,
    p_idempotency_key || '_tx',
    'reserve_scan_credits'
  )
  returning id into v_tx_id;

  v_remaining_cost := v_cost;
  for v_lot in
    select id, remaining_credits - reserved_credits as available
    from public.credit_lots
    where wallet_id = v_wallet_id
      and status = 'active'
      and expires_at > now()
    order by expires_at, created_at, id
    for update
  loop
    exit when v_remaining_cost = 0;

    v_reserve_amount := least(v_remaining_cost, v_lot.available);
    if v_reserve_amount > 0 then
      update public.credit_lots
      set reserved_credits = reserved_credits + v_reserve_amount
      where id = v_lot.id;

      insert into public.credit_transaction_allocations (
        transaction_id,
        credit_lot_id,
        credits
      ) values (
        v_tx_id,
        v_lot.id,
        v_reserve_amount
      );

      v_remaining_cost := v_remaining_cost - v_reserve_amount;
    end if;
  end loop;

  if v_remaining_cost <> 0 then
    raise exception 'FEFO allocation failed' using errcode = 'J1002';
  end if;

  update public.scan_quotes
  set consumed_at = now()
  where id = p_quote_id and consumed_at is null;

  update public.scans
  set credit_hold_id = v_hold_id,
      status = 'credit_reserved'
  where id = p_scan_id and status = 'requested';

  if not found then
    raise exception 'Scan state changed during reserve' using errcode = '40001';
  end if;

  update public.credit_wallets
  set available_cached = available_cached - v_cost,
      reserved_cached = reserved_cached + v_cost,
      version = version + 1
  where id = v_wallet_id;

  return v_hold_id;
end;
$$;

create or replace function public.settle_scan_credits(
  p_scan_id uuid,
  p_final_cost integer,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hold record;
  v_wallet_id uuid;
  v_existing_tx record;
  v_alloc record;
  v_tx_id uuid;
  v_refund integer;
  v_cost_left integer;
  v_settle_amount integer;
begin
  if p_final_cost < 0 then
    raise exception 'Final cost cannot be negative' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_idempotency_key, ''))) = 0 then
    raise exception 'Idempotency key is invalid' using errcode = '22023';
  end if;

  select h.wallet_id into v_wallet_id
  from public.credit_holds h
  where h.scan_id = p_scan_id;

  if not found then
    raise exception 'Credit hold not found' using errcode = 'P0002';
  end if;

  -- Semua operasi ledger mengunci wallet sebelum hold/lot. Urutan tunggal ini
  -- mencegah reserve scan lain beradu deadlock dengan settle scan ini.
  perform 1
  from public.credit_wallets w
  where w.id = v_wallet_id
  for update;

  if not found then
    raise exception 'Credit wallet not found' using errcode = 'P0002';
  end if;

  select h.* into v_hold
  from public.credit_holds h
  where h.scan_id = p_scan_id
  for update;

  if not found or v_hold.wallet_id <> v_wallet_id then
    raise exception 'Credit hold changed during settlement' using errcode = '40001';
  end if;

  if p_final_cost > v_hold.credits then
    raise exception 'Final cost exceeds reserved credits' using errcode = '22023';
  end if;

  if v_hold.status = 'settled' then
    select id, delta_available into v_existing_tx
    from public.credit_transactions
    where reference_type = 'scan'
      and reference_id = p_scan_id::text
      and transaction_type = 'settle';

    if not found or v_hold.credits - v_existing_tx.delta_available <> p_final_cost then
      raise exception 'Scan settlement conflicts with completed settlement' using errcode = '23505';
    end if;

    return v_existing_tx.id;
  end if;

  if v_hold.status <> 'reserved' then
    raise exception 'Credit hold is no longer reservable' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.credit_transactions
    where idempotency_key = p_idempotency_key
  ) then
    raise exception 'Idempotency key conflicts with another transaction' using errcode = '23505';
  end if;

  v_refund := v_hold.credits - p_final_cost;

  update public.credit_holds
  set status = 'settled',
      settled_at = now()
  where id = v_hold.id;

  insert into public.credit_transactions (
    wallet_id,
    transaction_type,
    delta_available,
    delta_reserved,
    reference_type,
    reference_id,
    idempotency_key,
    created_by_system
  ) values (
    v_hold.wallet_id,
    'settle',
    v_refund,
    -v_hold.credits,
    'scan',
    p_scan_id::text,
    p_idempotency_key,
    'settle_scan_credits'
  )
  returning id into v_tx_id;

  v_cost_left := p_final_cost;
  for v_alloc in
    select a.credit_lot_id, a.credits as reserved_amount
    from public.credit_transaction_allocations a
    join public.credit_transactions t on t.id = a.transaction_id
    join public.credit_lots l on l.id = a.credit_lot_id
    where t.reference_type = 'scan'
      and t.reference_id = p_scan_id::text
      and t.transaction_type = 'reserve'
    order by l.expires_at, l.created_at, l.id
    for update of l
  loop
    v_settle_amount := least(v_cost_left, v_alloc.reserved_amount);

    update public.credit_lots
    set reserved_credits = reserved_credits - v_alloc.reserved_amount,
        remaining_credits = remaining_credits - v_settle_amount,
        status = case
          when remaining_credits - v_settle_amount = 0 then 'exhausted'::public.lot_status
          else status
        end
    where id = v_alloc.credit_lot_id;

    if v_settle_amount > 0 then
      insert into public.credit_transaction_allocations (
        transaction_id,
        credit_lot_id,
        credits
      ) values (
        v_tx_id,
        v_alloc.credit_lot_id,
        -v_settle_amount
      );
    end if;

    v_cost_left := v_cost_left - v_settle_amount;
  end loop;

  if v_cost_left <> 0 then
    raise exception 'Settlement allocation failed' using errcode = 'P0001';
  end if;

  update public.credit_wallets
  set available_cached = available_cached + v_refund,
      reserved_cached = reserved_cached - v_hold.credits,
      version = version + 1
  where id = v_hold.wallet_id;

  return v_tx_id;
end;
$$;

create or replace function public.release_scan_credits(
  p_scan_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_hold record;
  v_wallet_id uuid;
  v_existing_tx uuid;
  v_alloc record;
  v_tx_id uuid;
begin
  if length(btrim(coalesce(p_idempotency_key, ''))) = 0 then
    raise exception 'Idempotency key is invalid' using errcode = '22023';
  end if;

  select h.wallet_id into v_wallet_id
  from public.credit_holds h
  where h.scan_id = p_scan_id;

  if not found then
    raise exception 'Credit hold not found' using errcode = 'P0002';
  end if;

  perform 1
  from public.credit_wallets w
  where w.id = v_wallet_id
  for update;

  if not found then
    raise exception 'Credit wallet not found' using errcode = 'P0002';
  end if;

  select h.* into v_hold
  from public.credit_holds h
  where h.scan_id = p_scan_id
  for update;

  if not found or v_hold.wallet_id <> v_wallet_id then
    raise exception 'Credit hold changed during release' using errcode = '40001';
  end if;

  if v_hold.status = 'released' then
    select id into v_existing_tx
    from public.credit_transactions
    where reference_type = 'scan'
      and reference_id = p_scan_id::text
      and transaction_type = 'release';

    if v_existing_tx is null then
      raise exception 'Released hold has no ledger transaction' using errcode = '23514';
    end if;

    return v_existing_tx;
  end if;

  if v_hold.status <> 'reserved' then
    raise exception 'Credit hold cannot be released' using errcode = '55000';
  end if;

  if exists (
    select 1 from public.credit_transactions
    where idempotency_key = p_idempotency_key
  ) then
    raise exception 'Idempotency key conflicts with another transaction' using errcode = '23505';
  end if;

  update public.credit_holds
  set status = 'released',
      released_at = now()
  where id = v_hold.id;

  insert into public.credit_transactions (
    wallet_id,
    transaction_type,
    delta_available,
    delta_reserved,
    reference_type,
    reference_id,
    idempotency_key,
    created_by_system
  ) values (
    v_hold.wallet_id,
    'release',
    v_hold.credits,
    -v_hold.credits,
    'scan',
    p_scan_id::text,
    p_idempotency_key,
    'release_scan_credits'
  )
  returning id into v_tx_id;

  for v_alloc in
    select a.credit_lot_id, a.credits as reserved_amount
    from public.credit_transaction_allocations a
    join public.credit_transactions t on t.id = a.transaction_id
    join public.credit_lots l on l.id = a.credit_lot_id
    where t.reference_type = 'scan'
      and t.reference_id = p_scan_id::text
      and t.transaction_type = 'reserve'
    order by l.expires_at, l.created_at, l.id
    for update of l
  loop
    update public.credit_lots
    set reserved_credits = reserved_credits - v_alloc.reserved_amount
    where id = v_alloc.credit_lot_id;
  end loop;

  update public.credit_wallets
  set available_cached = available_cached + v_hold.credits,
      reserved_cached = reserved_cached - v_hold.credits,
      version = version + 1
  where id = v_hold.wallet_id;

  return v_tx_id;
end;
$$;
