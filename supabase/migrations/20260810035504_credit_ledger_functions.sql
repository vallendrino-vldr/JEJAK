-- Implementasi Phase 6: Credit Ledger Functions (FEFO)
--
-- Blueprint: docs/SCHEMA.md bab 21-25.
-- Menerapkan sistem dompet FEFO, transaksi atomik, dan reservasi saldo (holds).

--------------------------------------------------------------------------------
-- 1. Grant Credits (Admin/System)
--------------------------------------------------------------------------------
create or replace function public.grant_credits(
  p_wallet_id uuid,
  p_purchased int,
  p_bonus int,
  p_origin_type public.origin_type,
  p_origin_id text,
  p_expires_at timestamptz,
  p_reason text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_lot_id uuid;
  v_tx_id uuid;
  v_total int := p_purchased + p_bonus;
begin
  if v_total <= 0 then
    raise exception 'Amount must be greater than 0';
  end if;

  -- 1. Insert Lot
  insert into public.credit_lots (
    wallet_id, origin_type, origin_id, original_credits, remaining_credits,
    purchased_credits, bonus_credits, expires_at
  ) values (
    p_wallet_id, p_origin_type, p_origin_id, v_total, v_total,
    p_purchased, p_bonus, p_expires_at
  ) returning id into v_lot_id;

  -- 2. Insert Transaction
  insert into public.credit_transactions (
    wallet_id, transaction_type, delta_available, delta_reserved,
    idempotency_key, reason_code, created_by_system
  ) values (
    p_wallet_id, 'lot_created', v_total, 0,
    p_idempotency_key, p_reason, 'grant_credits'
  ) returning id into v_tx_id;

  -- 3. Allocation
  insert into public.credit_transaction_allocations (
    transaction_id, credit_lot_id, credits
  ) values (
    v_tx_id, v_lot_id, v_total
  );

  -- 4. Update Wallet Cache
  update public.credit_wallets
  set available_cached = available_cached + v_total,
      version = version + 1
  where id = p_wallet_id;

  return v_tx_id;
end;
$$;

--------------------------------------------------------------------------------
-- 2. Reserve Scan Credits (FEFO)
--------------------------------------------------------------------------------
create or replace function public.reserve_scan_credits(
  p_user_id uuid,
  p_scan_id uuid,
  p_quote_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_wallet_id uuid;
  v_cost int;
  v_remaining_cost int;
  v_lot record;
  v_reserve_amount int;
  v_tx_id uuid;
  v_hold_id uuid;
begin
  -- 1. Lock Wallet
  select id into v_wallet_id
  from public.credit_wallets
  where user_id = p_user_id
  for update;

  if not found then
    raise exception 'Wallet not found for user %', p_user_id;
  end if;

  -- 2. Get Quote Cost
  select final_credit_cost into v_cost
  from public.scan_quotes
  where id = p_quote_id and user_id = p_user_id and consumed_at is null and expires_at > now();

  if not found then
    raise exception 'Quote invalid or expired';
  end if;

  if v_cost <= 0 then
    -- Free scan? Boleh saja, tapi ini bypass wallet logika dasar.
    -- Sesuai blueprint, even 0 cost might need transaction. 
    -- For now we allow 0.
  end if;

  -- 3. Cek Saldo
  declare
    v_avail int;
  begin
    select sum(remaining_credits - reserved_credits) into v_avail
    from public.credit_lots
    where wallet_id = v_wallet_id and status = 'active' and expires_at > now();

    v_avail := coalesce(v_avail, 0);
    if v_avail < v_cost then
      raise exception 'Insufficient funds. Available: %, Required: %', v_avail, v_cost;
    end if;
  end;

  -- 4. Create Hold & Transaction
  insert into public.credit_holds (
    wallet_id, scan_id, credits, status, idempotency_key
  ) values (
    v_wallet_id, p_scan_id, v_cost, 'reserved', p_idempotency_key || '_hold'
  ) returning id into v_hold_id;

  insert into public.credit_transactions (
    wallet_id, transaction_type, delta_available, delta_reserved,
    reference_type, reference_id, idempotency_key, created_by_system
  ) values (
    v_wallet_id, 'reserve', -v_cost, v_cost,
    'scan', p_scan_id::text, p_idempotency_key || '_tx', 'reserve_scan_credits'
  ) returning id into v_tx_id;

  -- 5. FEFO Allocation
  v_remaining_cost := v_cost;
  for v_lot in
    select id, (remaining_credits - reserved_credits) as avail
    from public.credit_lots
    where wallet_id = v_wallet_id and status = 'active' and expires_at > now()
    order by expires_at asc, created_at asc
    for update
  loop
    exit when v_remaining_cost <= 0;

    v_reserve_amount := least(v_remaining_cost, v_lot.avail);
    if v_reserve_amount > 0 then
      update public.credit_lots
      set reserved_credits = reserved_credits + v_reserve_amount
      where id = v_lot.id;

      insert into public.credit_transaction_allocations (
        transaction_id, credit_lot_id, credits
      ) values (
        v_tx_id, v_lot.id, v_reserve_amount
      );

      v_remaining_cost := v_remaining_cost - v_reserve_amount;
    end if;
  end loop;

  if v_remaining_cost > 0 then
    raise exception 'FEFO allocation failed. Integrity error.';
  end if;

  -- 6. Update Quote & Scan
  update public.scan_quotes set consumed_at = now() where id = p_quote_id;
  update public.scans set credit_hold_id = v_hold_id, status = 'credit_reserved' where id = p_scan_id;

  -- 7. Update Wallet Cache
  update public.credit_wallets
  set available_cached = available_cached - v_cost,
      reserved_cached = reserved_cached + v_cost,
      version = version + 1
  where id = v_wallet_id;

  return v_hold_id;
end;
$$;

--------------------------------------------------------------------------------
-- 3. Settle Scan Credits
--------------------------------------------------------------------------------
create or replace function public.settle_scan_credits(
  p_scan_id uuid,
  p_final_cost int,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_hold record;
  v_alloc record;
  v_tx_id uuid;
  v_refund int;
  v_cost_left int;
begin
  select h.* into v_hold
  from public.credit_holds h
  where h.scan_id = p_scan_id
  for update;

  if not found or v_hold.status <> 'reserved' then
    raise exception 'Active hold not found for scan %', p_scan_id;
  end if;

  if p_final_cost > v_hold.credits then
    raise exception 'Final cost % exceeds reserved amount %', p_final_cost, v_hold.credits;
  end if;

  v_refund := v_hold.credits - p_final_cost;

  update public.credit_holds
  set status = 'settled', settled_at = now()
  where id = v_hold.id;

  insert into public.credit_transactions (
    wallet_id, transaction_type, delta_available, delta_reserved,
    reference_type, reference_id, idempotency_key, created_by_system
  ) values (
    v_hold.wallet_id, 'settle', v_refund, -v_hold.credits,
    'scan', p_scan_id::text, p_idempotency_key, 'settle_scan_credits'
  ) returning id into v_tx_id;

  v_cost_left := p_final_cost;

  -- Iterate the allocations from the reserve transaction
  for v_alloc in
    select a.credit_lot_id, a.credits as reserved_amount, l.remaining_credits, l.reserved_credits
    from public.credit_transaction_allocations a
    join public.credit_transactions t on t.id = a.transaction_id
    join public.credit_lots l on l.id = a.credit_lot_id
    where t.reference_type = 'scan' and t.reference_id = p_scan_id::text and t.transaction_type = 'reserve'
    for update of l
  loop
    declare
      v_settle_amount int;
      v_lot_refund int;
    begin
      v_settle_amount := least(v_cost_left, v_alloc.reserved_amount);
      v_lot_refund := v_alloc.reserved_amount - v_settle_amount;

      update public.credit_lots
      set reserved_credits = reserved_credits - v_alloc.reserved_amount,
          remaining_credits = remaining_credits - v_settle_amount,
          status = case when (remaining_credits - v_settle_amount) <= 0 then 'exhausted'::public.lot_status else status end
      where id = v_alloc.credit_lot_id;

      if v_settle_amount > 0 then
        insert into public.credit_transaction_allocations (
          transaction_id, credit_lot_id, credits
        ) values (
          v_tx_id, v_alloc.credit_lot_id, -v_settle_amount
        );
      end if;

      v_cost_left := v_cost_left - v_settle_amount;
    end;
  end loop;

  update public.credit_wallets
  set available_cached = available_cached + v_refund,
      reserved_cached = reserved_cached - v_hold.credits,
      version = version + 1
  where id = v_hold.wallet_id;

  return v_tx_id;
end;
$$;

--------------------------------------------------------------------------------
-- 4. Release Scan Credits (Cancel/Fail)
--------------------------------------------------------------------------------
create or replace function public.release_scan_credits(
  p_scan_id uuid,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer set search_path = ''
as $$
declare
  v_hold record;
  v_alloc record;
  v_tx_id uuid;
begin
  select h.* into v_hold
  from public.credit_holds h
  where h.scan_id = p_scan_id
  for update;

  if not found or v_hold.status <> 'reserved' then
    raise exception 'Active hold not found for scan %', p_scan_id;
  end if;

  update public.credit_holds
  set status = 'released', released_at = now()
  where id = v_hold.id;

  insert into public.credit_transactions (
    wallet_id, transaction_type, delta_available, delta_reserved,
    reference_type, reference_id, idempotency_key, created_by_system
  ) values (
    v_hold.wallet_id, 'release', v_hold.credits, -v_hold.credits,
    'scan', p_scan_id::text, p_idempotency_key, 'release_scan_credits'
  ) returning id into v_tx_id;

  -- Iterate the allocations from the reserve transaction
  for v_alloc in
    select a.credit_lot_id, a.credits as reserved_amount
    from public.credit_transaction_allocations a
    join public.credit_transactions t on t.id = a.transaction_id
    join public.credit_lots l on l.id = a.credit_lot_id
    where t.reference_type = 'scan' and t.reference_id = p_scan_id::text and t.transaction_type = 'reserve'
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
