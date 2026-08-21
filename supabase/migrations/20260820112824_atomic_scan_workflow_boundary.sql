-- Phase 7 vertical slice: boundary user atomik, target terlindungi, source RDAP
-- yang benar-benar implemented, dan operasi worker yang hanya bisa dipanggil
-- service_role. Orkestrasi durable dijalankan Vercel Workflow; database tetap
-- menjadi sumber kebenaran status, hasil, dan settlement.

--------------------------------------------------------------------------------
-- 1. Produk awal dan benefit scan pertama
--------------------------------------------------------------------------------

insert into public.scan_products (
  code,
  name,
  description,
  base_credit_cost,
  active,
  display_order,
  minimum_deliverable_score,
  config
) values (
  'quick_check',
  'Cek Cepat',
  'Validasi dan sinyal awal dari sumber publik yang didukung.',
  1,
  true,
  10,
  1,
  '{"target_types":["domain"]}'::jsonb
)
on conflict (code) do update
set minimum_deliverable_score = coalesce(
      public.scan_products.minimum_deliverable_score,
      excluded.minimum_deliverable_score
    ),
    config = case
      when coalesce(public.scan_products.config, '{}'::jsonb) ? 'target_types'
        then public.scan_products.config
      else coalesce(public.scan_products.config, '{}'::jsonb) || excluded.config
    end;

create function app.bump_scan_product_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.base_credit_cost is distinct from old.base_credit_cost
    or new.minimum_deliverable_score is distinct from old.minimum_deliverable_score
    or new.config is distinct from old.config
    or new.active is distinct from old.active
    or new.included_ai_questions is distinct from old.included_ai_questions
  then
    new.version := old.version + 1;
  end if;

  return new;
end;
$$;

create trigger scan_products_bump_version
  before update of base_credit_cost, minimum_deliverable_score, config, active, included_ai_questions
  on public.scan_products
  for each row execute function app.bump_scan_product_version();

revoke all on function app.bump_scan_product_version() from public, anon, authenticated;

create table public.benefit_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  benefit_code text not null,
  source_id text,
  idempotency_key text not null unique,
  claimed_at timestamptz not null default now(),
  constraint benefit_claims_code_filled check (
    length(btrim(benefit_code)) between 1 and 80
  ),
  unique (user_id, benefit_code)
);

create index benefit_claims_user_claimed
  on public.benefit_claims (user_id, claimed_at desc);

alter table public.benefit_claims enable row level security;

create policy benefit_claims_select_owner
  on public.benefit_claims for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy benefit_claims_service_all
  on public.benefit_claims for all
  to service_role
  using (true)
  with check (true);

revoke all on public.benefit_claims from anon, authenticated;
grant select (id, benefit_code, source_id, claimed_at)
  on public.benefit_claims to authenticated;

-- Outbox dibuat dalam transaksi yang sama dengan scan. Kalau proses web mati
-- setelah commit tapi sebelum Workflow berhasil dimulai, permintaan tetap punya
-- job durable yang dapat diklaim ulang tanpa membuat scan/charge baru.
create table public.scan_dispatch_jobs (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references public.scans (id) on delete cascade,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  claim_token text,
  lease_expires_at timestamptz,
  workflow_run_id text,
  next_attempt_at timestamptz not null default now(),
  last_error_code text,
  dispatched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scan_dispatch_jobs_status_valid check (
    status in ('pending', 'dispatching', 'dispatched', 'cancelled')
  ),
  constraint scan_dispatch_jobs_attempt_nonnegative check (attempt_count >= 0),
  constraint scan_dispatch_jobs_claim_pair check (
    (claim_token is null and lease_expires_at is null)
    or (claim_token is not null and lease_expires_at is not null)
  )
);

create index scan_dispatch_jobs_ready
  on public.scan_dispatch_jobs (next_attempt_at, created_at)
  where status in ('pending', 'dispatching');

create trigger scan_dispatch_jobs_touch_updated_at
  before update on public.scan_dispatch_jobs
  for each row execute function app.touch_updated_at();

alter table public.scan_dispatch_jobs enable row level security;

create policy scan_dispatch_jobs_service_all
  on public.scan_dispatch_jobs for all
  to service_role
  using (true)
  with check (true);

revoke all on public.scan_dispatch_jobs from public, anon, authenticated;
grant all on public.scan_dispatch_jobs to service_role;

--------------------------------------------------------------------------------
-- 2. Registry hanya mengekspos konfigurasi aman dan source implemented
--------------------------------------------------------------------------------

update public.source_registry
set status = 'active',
    experimental = false,
    included_in_scoring = true,
    priority = 10,
    reliability_base_score = 85,
    timeout_ms = 8000,
    health_state = 'unknown',
    config = coalesce(config, '{}'::jsonb) ||
      '{"implemented":true,"target_types":["domain"]}'::jsonb
where code = 'core_rdap';

update public.source_registry
set status = 'experimental',
    experimental = true,
    included_in_scoring = false,
    config = coalesce(config, '{}'::jsonb) || '{"implemented":false}'::jsonb
where code in (
  'core_cloudflare_dns',
  'core_google_dns',
  'core_libphonenumber',
  'core_hibp'
);

drop policy if exists source_registry_select on public.source_registry;
create policy source_registry_select_authenticated
  on public.source_registry for select
  to authenticated
  using (status in ('active', 'degraded'));

drop policy if exists scan_products_select on public.scan_products;
create policy scan_products_select_authenticated
  on public.scan_products for select
  to authenticated
  using (active);

revoke all on public.source_registry from anon, authenticated;
grant select (
  id,
  code,
  name,
  category,
  source_class,
  status,
  cost_class,
  priority,
  reliability_base_score,
  timeout_ms,
  health_state,
  experimental,
  included_in_scoring,
  created_at,
  updated_at
) on public.source_registry to authenticated;

--------------------------------------------------------------------------------
-- 3. Constraint eksekusi dan grant baca purpose-specific
--------------------------------------------------------------------------------

create unique index scan_source_runs_one_source_per_scan
  on public.scan_source_runs (scan_id, source_id);

alter table public.scan_quotes
  add column minimum_deliverable_score integer,
  add constraint scan_quotes_minimum_deliverable_valid check (
    minimum_deliverable_score is null
    or minimum_deliverable_score between 0 and 100
  );

alter table public.scans
  add column workflow_run_id text,
  add constraint scans_workflow_run_id_filled check (
    workflow_run_id is null or length(btrim(workflow_run_id)) between 1 and 500
  );

alter table public.scan_source_runs
  add column worker_claim_token text,
  add column worker_lease_expires_at timestamptz,
  add column result_fingerprint text,
  add constraint scan_source_runs_worker_claim_pair check (
    (worker_claim_token is null and worker_lease_expires_at is null)
    or (worker_claim_token is not null and worker_lease_expires_at is not null)
  ),
  add constraint scan_source_runs_result_fingerprint_valid check (
    result_fingerprint is null or length(result_fingerprint) = 64
  );

alter table public.scan_targets
  add constraint scan_targets_protected_value_present check (
    normalized_value_ciphertext is not null
    and length(normalized_value_ciphertext) > 0
    and normalized_value_hmac is not null
    and length(normalized_value_hmac) = 64
  ) not valid;

do $$
begin
  if exists (
    select 1
    from public.scan_targets
    where normalized_value_ciphertext is null
      or length(normalized_value_ciphertext) = 0
      or normalized_value_hmac is null
      or length(normalized_value_hmac) <> 64
  ) then
    raise exception 'Ada target scan lama tanpa ciphertext/HMAC; audit dan terminalkan dulu sebelum Phase 7 diterapkan'
      using errcode = '23514';
  end if;
end;
$$;

alter table public.scan_targets
  validate constraint scan_targets_protected_value_present;

revoke all on public.scan_products from anon, authenticated;
revoke all on public.scan_quotes from anon, authenticated;
revoke all on public.credit_wallets from anon, authenticated;
revoke all on public.credit_lots from anon, authenticated;
revoke all on public.credit_transactions from anon, authenticated;
revoke all on public.credit_transaction_allocations from anon, authenticated;
revoke all on public.scans from anon, authenticated;
revoke all on public.credit_holds from anon, authenticated;
revoke all on public.scan_targets from anon, authenticated;
revoke all on public.scan_source_runs from anon, authenticated;

grant select (
  id,
  code,
  name,
  description,
  base_credit_cost,
  active,
  display_order,
  minimum_deliverable_score,
  included_ai_questions,
  config,
  version,
  updated_at,
  created_at
) on public.scan_products to authenticated;

grant select (
  id,
  user_id,
  case_id,
  scan_product_id,
  quoted_credit_cost,
  upgrade_credit_discount,
  final_credit_cost,
  minimum_deliverable_score,
  config_version,
  expires_at,
  consumed_at,
  created_at
) on public.scan_quotes to authenticated;

grant select (
  id,
  user_id,
  available_cached,
  reserved_cached,
  version,
  updated_at,
  created_at
) on public.credit_wallets to authenticated;

grant select (
  id,
  wallet_id,
  origin_type,
  original_credits,
  remaining_credits,
  reserved_credits,
  purchased_credits,
  bonus_credits,
  starts_at,
  expires_at,
  grace_until,
  extendable,
  status,
  created_at,
  updated_at
) on public.credit_lots to authenticated;

grant select (
  id,
  wallet_id,
  transaction_type,
  delta_available,
  delta_reserved,
  reference_type,
  reference_id,
  reason_code,
  metadata_safe,
  created_at
) on public.credit_transactions to authenticated;

grant select (transaction_id, credit_lot_id, credits, created_at)
  on public.credit_transaction_allocations to authenticated;

grant select (
  id,
  public_ref,
  user_id,
  case_id,
  purpose,
  product_code,
  quote_id,
  status,
  requested_at,
  started_at,
  completed_at,
  failed_at,
  coverage_score,
  match_confidence,
  exposure_score,
  risk_signal,
  failure_reason_code,
  current_stage,
  client_version,
  created_at,
  updated_at
) on public.scans to authenticated;

grant select (
  id,
  wallet_id,
  scan_id,
  credits,
  status,
  created_at,
  settled_at,
  released_at
) on public.credit_holds to authenticated;

grant select (
  id,
  scan_id,
  case_entity_id,
  target_type,
  display_value_masked,
  created_at
) on public.scan_targets to authenticated;

grant select (
  id,
  scan_id,
  source_id,
  status,
  started_at,
  finished_at,
  latency_ms,
  coverage_contribution,
  error_code,
  retry_count,
  safe_metadata,
  created_at
) on public.scan_source_runs to authenticated;

--------------------------------------------------------------------------------
-- 4. Boundary user: quote + scan + target + source run dalam satu transaksi
--------------------------------------------------------------------------------

create function public.mulai_scan(
  p_product_code text,
  p_target_type public.scan_target_type_enum,
  p_target_value text,
  p_idempotency_key text,
  p_case_id uuid default null
)
returns table (
  scan_id uuid,
  scan_ref text,
  scan_status public.scan_status,
  quoted_cost integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_product record;
  v_existing record;
  v_entity_type public.entity_type;
  v_entity_id uuid;
  v_normalized text;
  v_hmac text;
  v_ciphertext text;
  v_masked text;
  v_wallet_id uuid;
  v_claim_id uuid;
  v_benefit_expires timestamptz;
  v_quote_id uuid;
  v_scan_id uuid;
  v_scan_ref text;
  v_run_count integer;
begin
  if v_user_id is null or not app.is_active_user() then
    raise exception 'Belum masuk atau akun tidak aktif' using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_idempotency_key, ''))) < 16
    or length(p_idempotency_key) > 200
  then
    raise exception 'Kunci permintaan tidak valid' using errcode = '22023';
  end if;

  if length(btrim(coalesce(p_target_value, ''))) = 0
    or length(p_target_value) > 500
  then
    raise exception 'Target tidak valid' using errcode = '22023';
  end if;

  if p_case_id is not null and not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak memakai kasus ini' using errcode = '42501';
  end if;

  -- Dua request dengan nonce sama diserialkan sebelum cek existing/insert.
  -- Request kedua akan mendapat scan yang sama, bukan error unique acak.
  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || p_idempotency_key, 0)
  );

  v_entity_type := p_target_type::text::public.entity_type;
  v_normalized := app.normalkan_identifier(v_entity_type, p_target_value);

  if p_target_type = 'domain' and (
    length(v_normalized) > 253
    or v_normalized !~
      '^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,63}|xn--[a-z0-9-]{2,59})$'
  )
  then
    raise exception 'Domain tidak valid' using errcode = '22023';
  end if;

  v_hmac := encode(
    extensions.hmac(v_normalized, app.kunci('jejak_identifier_hmac'), 'sha256'),
    'hex'
  );
  v_ciphertext := encode(
    extensions.pgp_sym_encrypt(v_normalized, app.kunci('jejak_identifier_enc')),
    'base64'
  );
  v_masked := app.samarkan_identifier(v_entity_type, v_normalized);

  select
    s.id,
    s.public_ref,
    s.status,
    s.user_id,
    s.case_id,
    s.product_code,
    q.final_credit_cost,
    t.target_type,
    t.normalized_value_hmac
  into v_existing
  from public.scans s
  join public.scan_quotes q on q.id = s.quote_id
  join public.scan_targets t on t.scan_id = s.id
  where s.idempotency_key = p_idempotency_key
  limit 1;

  if found then
    if v_existing.user_id <> v_user_id
      or v_existing.case_id is distinct from p_case_id
      or v_existing.product_code <> p_product_code
      or v_existing.target_type <> p_target_type
      or v_existing.normalized_value_hmac <> v_hmac
    then
      raise exception 'Kunci permintaan dipakai untuk pemeriksaan lain' using errcode = '23505';
    end if;

    return query
    select
      v_existing.id,
      v_existing.public_ref,
      v_existing.status,
      v_existing.final_credit_cost;
    return;
  end if;

  select id, base_credit_cost, version, minimum_deliverable_score, config
  into v_product
  from public.scan_products
  where code = p_product_code and active
  for share;

  if not found then
    raise exception 'Produk pemeriksaan tidak tersedia' using errcode = 'P0002';
  end if;

  if not (coalesce(v_product.config -> 'target_types', '[]'::jsonb) ? p_target_type::text) then
    raise exception 'Jenis target belum didukung produk ini' using errcode = '0A000';
  end if;

  if p_case_id is not null then
    v_entity_id := public.tambah_petunjuk(
      p_case_id,
      v_entity_type,
      v_normalized,
      null
    );
  end if;

  select id into v_wallet_id
  from public.credit_wallets
  where user_id = v_user_id
  for update;

  if not found then
    raise exception 'Dompet tidak ditemukan' using errcode = 'P0002';
  end if;

  if p_product_code = 'quick_check' then
    insert into public.benefit_claims (
      user_id,
      benefit_code,
      source_id,
      idempotency_key
    ) values (
      v_user_id,
      'first_quick_check',
      v_product.id::text,
      'first-quick-check:' || v_user_id::text
    )
    on conflict (user_id, benefit_code) do nothing
    returning id into v_claim_id;

    if v_claim_id is not null and v_product.base_credit_cost > 0 then
      v_benefit_expires := now() + interval '30 days';
      perform public.grant_credits(
        v_wallet_id,
        0,
        v_product.base_credit_cost,
        'signup_bonus',
        v_claim_id::text,
        v_benefit_expires,
        'first_scan_benefit',
        'first-quick-check:' || v_user_id::text
      );
    end if;
  end if;

  insert into public.scan_quotes (
    user_id,
    case_id,
    scan_product_id,
    quoted_credit_cost,
    final_credit_cost,
    minimum_deliverable_score,
    config_version,
    expires_at
  ) values (
    v_user_id,
    p_case_id,
    v_product.id,
    v_product.base_credit_cost,
    v_product.base_credit_cost,
    coalesce(v_product.minimum_deliverable_score, 1),
    v_product.version,
    now() + interval '15 minutes'
  )
  returning id into v_quote_id;

  insert into public.scans (
    user_id,
    case_id,
    purpose,
    product_code,
    quote_id,
    status,
    idempotency_key,
    current_stage
  ) values (
    v_user_id,
    p_case_id,
    case when p_case_id is null then 'self_check' else 'fraud_check' end,
    p_product_code,
    v_quote_id,
    'requested',
    p_idempotency_key,
    'prepare'
  )
  returning id, public_ref into v_scan_id, v_scan_ref;

  insert into public.scan_targets (
    scan_id,
    case_entity_id,
    target_type,
    normalized_value_ciphertext,
    normalized_value_hmac,
    display_value_masked
  ) values (
    v_scan_id,
    v_entity_id,
    p_target_type,
    v_ciphertext,
    v_hmac,
    v_masked
  );

  insert into public.scan_source_runs (scan_id, source_id, status)
  select v_scan_id, sr.id, 'queued'
  from public.source_registry sr
  where sr.status = 'active'
    and coalesce((sr.config ->> 'implemented')::boolean, false)
    and coalesce(sr.config -> 'target_types', '[]'::jsonb) ? p_target_type::text
  order by sr.priority, sr.code;

  get diagnostics v_run_count = row_count;
  if v_run_count = 0 then
    raise exception 'Belum ada sumber aktif untuk target ini' using errcode = '0A000';
  end if;

  insert into public.scan_dispatch_jobs (scan_id)
  values (v_scan_id);

  return query
  select v_scan_id, v_scan_ref, 'requested'::public.scan_status, v_product.base_credit_cost;
end;
$$;

revoke all on function public.mulai_scan(
  text, public.scan_target_type_enum, text, text, uuid
) from public, anon, authenticated;
grant execute on function public.mulai_scan(
  text, public.scan_target_type_enum, text, text, uuid
) to authenticated;

-- Kompensasi sempit saat workflow gagal dienqueue. Pengguna cuma boleh
-- membatalkan scan miliknya yang masih requested, sebelum ada credit hold.
create function public.batalkan_scan_diminta(p_scan_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_scan record;
begin
  if v_user_id is null then
    raise exception 'Belum masuk' using errcode = '42501';
  end if;

  select s.id, s.user_id, s.status
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found or v_scan.user_id <> v_user_id then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.status = 'cancelled' then
    return true;
  end if;

  if v_scan.status <> 'requested' then
    return false;
  end if;

  update public.scan_source_runs
  set status = 'skipped',
      finished_at = now(),
      error_code = 'workflow_not_started'
  where scan_id = v_scan.id
    and status = 'queued';

  update public.scans
  set status = 'cancelled',
      failed_at = now(),
      failure_reason_code = 'workflow_not_started',
      current_stage = 'cancelled'
  where id = v_scan.id;

  update public.scan_dispatch_jobs
  set status = 'cancelled',
      claim_token = null,
      lease_expires_at = null,
      last_error_code = 'workflow_not_started'
  where scan_id = v_scan.id;

  return true;
end;
$$;

revoke all on function public.batalkan_scan_diminta(uuid)
  from public, anon, authenticated;
grant execute on function public.batalkan_scan_diminta(uuid) to authenticated;

create function public.klaim_scan_dispatch(
  p_scan_id uuid,
  p_claim_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_job record;
begin
  if length(btrim(coalesce(p_claim_token, ''))) not between 16 and 500 then
    raise exception 'Claim dispatch tidak valid' using errcode = '22023';
  end if;

  select s.id, s.status, s.workflow_run_id
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  select j.*
  into v_job
  from public.scan_dispatch_jobs j
  where j.scan_id = v_scan.id
  for update;

  if not found then
    raise exception 'Job dispatch tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.status in ('completed', 'failed', 'refunded', 'cancelled') then
    update public.scan_dispatch_jobs
    set status = 'cancelled',
        claim_token = null,
        lease_expires_at = null
    where id = v_job.id and status <> 'dispatched';

    return jsonb_build_object('state', 'terminal', 'status', v_scan.status);
  end if;

  if v_scan.workflow_run_id is not null or v_job.status = 'dispatched' then
    update public.scan_dispatch_jobs
    set status = 'dispatched',
        workflow_run_id = coalesce(v_scan.workflow_run_id, v_job.workflow_run_id),
        claim_token = null,
        lease_expires_at = null,
        dispatched_at = coalesce(dispatched_at, now())
    where id = v_job.id;

    return jsonb_build_object('state', 'dispatched');
  end if;

  if v_job.status = 'dispatching'
    and v_job.lease_expires_at > now()
    and v_job.claim_token <> p_claim_token
  then
    return jsonb_build_object('state', 'busy');
  end if;

  if v_job.next_attempt_at > now() then
    return jsonb_build_object('state', 'waiting');
  end if;

  update public.scan_dispatch_jobs
  set status = 'dispatching',
      attempt_count = attempt_count + 1,
      claim_token = p_claim_token,
      lease_expires_at = now() + interval '90 seconds',
      last_error_code = null
  where id = v_job.id;

  return jsonb_build_object('state', 'ready', 'scanId', v_scan.id);
end;
$$;

create function public.selesaikan_scan_dispatch(
  p_scan_id uuid,
  p_claim_token text,
  p_workflow_run_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_job record;
  v_effective_run_id text;
begin
  if length(btrim(coalesce(p_claim_token, ''))) not between 16 and 500
    or length(btrim(coalesce(p_workflow_run_id, ''))) not between 1 and 500
  then
    raise exception 'Ack dispatch tidak valid' using errcode = '22023';
  end if;

  select s.id, s.workflow_run_id
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  select j.*
  into v_job
  from public.scan_dispatch_jobs j
  where j.scan_id = v_scan.id
  for update;

  if not found then
    raise exception 'Job dispatch tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_job.status = 'dispatching' and v_job.claim_token <> p_claim_token then
    raise exception 'Claim dispatch sudah berpindah' using errcode = '40001';
  end if;

  v_effective_run_id := coalesce(v_scan.workflow_run_id, p_workflow_run_id);

  update public.scans
  set workflow_run_id = v_effective_run_id
  where id = v_scan.id and workflow_run_id is null;

  update public.scan_dispatch_jobs
  set status = 'dispatched',
      workflow_run_id = v_effective_run_id,
      claim_token = null,
      lease_expires_at = null,
      dispatched_at = coalesce(dispatched_at, now())
  where id = v_job.id;

  return jsonb_build_object(
    'state', case
      when v_effective_run_id = p_workflow_run_id then 'dispatched'
      else 'duplicate'
    end
  );
end;
$$;

create function public.gagalkan_scan_dispatch(
  p_scan_id uuid,
  p_claim_token text,
  p_error_code text default 'workflow_start_failed'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_job record;
begin
  select s.id, s.workflow_run_id
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  select j.*
  into v_job
  from public.scan_dispatch_jobs j
  where j.scan_id = v_scan.id
  for update;

  if not found then
    raise exception 'Job dispatch tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.workflow_run_id is not null then
    update public.scan_dispatch_jobs
    set status = 'dispatched',
        workflow_run_id = v_scan.workflow_run_id,
        claim_token = null,
        lease_expires_at = null,
        dispatched_at = coalesce(dispatched_at, now())
    where id = v_job.id;

    return jsonb_build_object('state', 'dispatched');
  end if;

  if v_job.status = 'dispatching' and v_job.claim_token = p_claim_token then
    update public.scan_dispatch_jobs
    set status = 'pending',
        claim_token = null,
        lease_expires_at = null,
        next_attempt_at = now() + interval '2 seconds',
        last_error_code = left(coalesce(nullif(btrim(p_error_code), ''), 'workflow_start_failed'), 80)
    where id = v_job.id;
  end if;

  return jsonb_build_object('state', 'pending');
end;
$$;

revoke all on function public.klaim_scan_dispatch(uuid, text)
  from public, anon, authenticated;
revoke all on function public.selesaikan_scan_dispatch(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.gagalkan_scan_dispatch(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.klaim_scan_dispatch(uuid, text) to service_role;
grant execute on function public.selesaikan_scan_dispatch(uuid, text, text) to service_role;
grant execute on function public.gagalkan_scan_dispatch(uuid, text, text) to service_role;

--------------------------------------------------------------------------------
-- 5. Boundary worker: prepare, claim, persist, finalize, compensate
--------------------------------------------------------------------------------

create function public.siapkan_scan_worker(
  p_scan_id uuid,
  p_workflow_run_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_runs jsonb;
begin
  if length(btrim(coalesce(p_workflow_run_id, ''))) not between 1 and 500 then
    raise exception 'Workflow run id tidak valid' using errcode = '22023';
  end if;

  select s.id, s.user_id, s.quote_id, s.status, s.idempotency_key, s.workflow_run_id
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.status in ('completed', 'failed', 'refunded', 'cancelled') then
    return jsonb_build_object('state', 'terminal', 'status', v_scan.status);
  end if;

  if v_scan.workflow_run_id is not null
    and v_scan.workflow_run_id <> p_workflow_run_id
  then
    return jsonb_build_object('state', 'duplicate', 'status', v_scan.status);
  end if;

  if v_scan.workflow_run_id is null then
    update public.scans
    set workflow_run_id = p_workflow_run_id
    where id = v_scan.id;
    v_scan.workflow_run_id := p_workflow_run_id;
  end if;

  update public.scan_dispatch_jobs
  set status = 'dispatched',
      workflow_run_id = p_workflow_run_id,
      claim_token = null,
      lease_expires_at = null,
      dispatched_at = coalesce(dispatched_at, now())
  where scan_id = v_scan.id;

  if v_scan.status = 'requested' then
    begin
      perform public.reserve_scan_credits(
        v_scan.user_id,
        v_scan.id,
        v_scan.quote_id,
        'scan:' || v_scan.id::text || ':reserve'
      );
    exception
      when sqlstate 'J1001' then
        update public.scans
        set status = 'failed',
            failed_at = now(),
            failure_reason_code = 'insufficient_credits',
            current_stage = 'failed'
        where id = v_scan.id;

        update public.scan_source_runs
        set status = 'skipped',
            finished_at = now(),
            error_code = 'insufficient_credits'
        where scan_id = v_scan.id and status = 'queued';

        return jsonb_build_object('state', 'rejected', 'reason', 'insufficient_credits');
      when sqlstate '22023' then
        update public.scans
        set status = 'failed',
            failed_at = now(),
            failure_reason_code = 'invalid_or_expired_quote',
            current_stage = 'failed'
        where id = v_scan.id;

        update public.scan_source_runs
        set status = 'skipped',
            finished_at = now(),
            error_code = 'invalid_or_expired_quote'
        where scan_id = v_scan.id and status = 'queued';

        return jsonb_build_object('state', 'rejected', 'reason', 'invalid_or_expired_quote');
    end;

    v_scan.status := 'credit_reserved';
  end if;

  if v_scan.status = 'credit_reserved' then
    update public.scans
    set status = 'running',
        started_at = coalesce(started_at, now()),
        current_stage = 'source'
    where id = v_scan.id;
    v_scan.status := 'running';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'runId', r.id,
        'sourceCode', sr.code
      )
      order by sr.priority, sr.code
    ),
    '[]'::jsonb
  )
  into v_runs
  from public.scan_source_runs r
  join public.source_registry sr on sr.id = r.source_id
  where r.scan_id = v_scan.id
    and r.status in ('queued', 'running');

  return jsonb_build_object('state', 'ready', 'runs', v_runs);
end;
$$;

create function public.klaim_source_run(
  p_run_id uuid,
  p_claim_token text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run record;
  v_target_value text;
  v_timeout_ms integer;
begin
  if length(btrim(coalesce(p_claim_token, ''))) not between 16 and 500 then
    raise exception 'Claim source tidak valid' using errcode = '22023';
  end if;

  select
    r.id,
    r.scan_id,
    r.status,
    r.retry_count,
    r.worker_claim_token,
    r.worker_lease_expires_at,
    sr.code as source_code,
    sr.status as source_status,
    sr.config as source_config,
    sr.timeout_ms,
    sr.reliability_base_score,
    s.status as scan_status,
    t.target_type,
    t.normalized_value_ciphertext
  into v_run
  from public.scan_source_runs r
  join public.source_registry sr on sr.id = r.source_id
  join public.scans s on s.id = r.scan_id
  join public.scan_targets t on t.scan_id = r.scan_id
  where r.id = p_run_id
  limit 1
  for update of r;

  if not found then
    raise exception 'Source run tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_run.status in ('success', 'no_result', 'failed', 'skipped', 'budget_limited') then
    return jsonb_build_object('state', 'terminal', 'status', v_run.status);
  end if;

  if v_run.scan_status <> 'running' then
    return jsonb_build_object('state', 'terminal', 'status', v_run.scan_status);
  end if;

  if v_run.source_status <> 'active'
    or not coalesce((v_run.source_config ->> 'implemented')::boolean, false)
  then
    update public.scan_source_runs
    set status = 'skipped',
        finished_at = now(),
        error_code = 'source_not_active',
        worker_claim_token = null,
        worker_lease_expires_at = null
    where id = v_run.id;

    return jsonb_build_object('state', 'terminal', 'status', 'skipped');
  end if;

  if v_run.normalized_value_ciphertext is null then
    raise exception 'Target worker tidak punya ciphertext' using errcode = '23514';
  end if;

  if v_run.status = 'running'
    and v_run.worker_lease_expires_at > now()
  then
    return jsonb_build_object(
      'state', 'busy',
      'retryAfterMs', greatest(
        250,
        least(15000, floor(extract(epoch from (v_run.worker_lease_expires_at - now())) * 1000)::integer)
      )
    );
  end if;

  v_timeout_ms := greatest(1000, least(v_run.timeout_ms, 15000));

  update public.scan_source_runs
  set status = 'running',
      started_at = coalesce(started_at, now()),
      retry_count = retry_count + 1,
      worker_claim_token = p_claim_token,
      worker_lease_expires_at = now() + make_interval(secs => (v_timeout_ms + 5000)::double precision / 1000)
  where id = v_run.id;

  v_target_value := extensions.pgp_sym_decrypt(
    decode(v_run.normalized_value_ciphertext, 'base64'),
    app.kunci('jejak_identifier_enc')
  );

  return jsonb_build_object(
    'state', 'claimed',
    'scanId', v_run.scan_id,
    'sourceCode', v_run.source_code,
    'targetType', v_run.target_type,
    'targetValue', v_target_value,
    'timeoutMs', v_timeout_ms,
    'reliabilityScore', v_run.reliability_base_score
  );
end;
$$;

create function public.lepas_klaim_source(
  p_run_id uuid,
  p_claim_token text,
  p_error_code text default 'retryable_source_error'
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.scan_source_runs
  set status = 'queued',
      worker_claim_token = null,
      worker_lease_expires_at = null,
      error_code = left(coalesce(nullif(btrim(p_error_code), ''), 'retryable_source_error'), 80)
  where id = p_run_id
    and status = 'running'
    and worker_claim_token = p_claim_token;

  return found;
end;
$$;

create function public.catat_hasil_source(
  p_run_id uuid,
  p_claim_token text,
  p_status public.scan_source_run_status_enum,
  p_latency_ms integer,
  p_coverage integer,
  p_error_code text default null,
  p_safe_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_run record;
  v_reliability public.evidence_reliability;
  v_fingerprint text;
begin
  if length(btrim(coalesce(p_claim_token, ''))) not between 16 and 500 then
    raise exception 'Claim source tidak valid' using errcode = '22023';
  end if;

  if p_status not in ('success', 'no_result', 'failed') then
    raise exception 'Status hasil source tidak valid' using errcode = '22023';
  end if;

  if p_latency_ms is null or p_latency_ms < 0 or p_latency_ms > 120000 then
    raise exception 'Latency source tidak valid' using errcode = '22023';
  end if;

  if p_coverage is null or p_coverage < 0 or p_coverage > 100 then
    raise exception 'Coverage source tidak valid' using errcode = '22023';
  end if;

  if p_status <> 'success' and p_coverage <> 0 then
    raise exception 'Source tanpa hasil tidak boleh menambah coverage' using errcode = '22023';
  end if;

  if p_status = 'failed' and length(btrim(coalesce(p_error_code, ''))) = 0 then
    raise exception 'Source gagal wajib punya error code' using errcode = '22023';
  end if;

  if p_error_code is not null and length(p_error_code) > 80 then
    raise exception 'Error code source terlalu panjang' using errcode = '22023';
  end if;

  if p_status <> 'failed' and p_error_code is not null then
    raise exception 'Source non-gagal tidak boleh punya error code' using errcode = '22023';
  end if;

  if p_safe_metadata is null
    or jsonb_typeof(p_safe_metadata) <> 'object'
    or octet_length(p_safe_metadata::text) > 16384
  then
    raise exception 'Metadata source terlalu besar' using errcode = '22023';
  end if;

  if p_safe_metadata - array['result', 'meaning', 'reverifiable']::text[] <> '{}'::jsonb then
    raise exception 'Metadata source punya field yang tidak diizinkan' using errcode = '22023';
  end if;

  if p_status = 'success' then
    if p_safe_metadata ->> 'meaning' is distinct from 'public_registration_record'
      or p_safe_metadata -> 'reverifiable' is distinct from 'true'::jsonb
      or jsonb_typeof(p_safe_metadata -> 'result') is distinct from 'object'
    then
      raise exception 'Metadata hasil source tidak sesuai kontrak aman' using errcode = '22023';
    end if;

    if (p_safe_metadata -> 'result') - array[
        'handle',
        'statuses',
        'events',
        'nameservers',
        'registrar',
        'registrantName',
        'registrantOrganization',
        'delegationSigned'
      ]::text[] <> '{}'::jsonb
    then
      raise exception 'Metadata hasil source tidak sesuai kontrak aman' using errcode = '22023';
    end if;

    if not (
      case
        when jsonb_typeof(p_safe_metadata -> 'result' -> 'handle') = 'string'
        then length(btrim(p_safe_metadata -> 'result' ->> 'handle')) > 0
        else false
      end
      or case
        when jsonb_typeof(p_safe_metadata -> 'result' -> 'statuses') = 'array'
        then exists (
          select 1
          from jsonb_array_elements(p_safe_metadata -> 'result' -> 'statuses') as status_item(value)
          where jsonb_typeof(status_item.value) = 'string'
            and length(btrim(status_item.value #>> '{}')) > 0
        )
        else false
      end
      or case
        when jsonb_typeof(p_safe_metadata -> 'result' -> 'events') = 'array'
        then exists (
          select 1
          from jsonb_array_elements(p_safe_metadata -> 'result' -> 'events') as event_item(value)
          where jsonb_typeof(event_item.value) = 'object'
            and jsonb_typeof(event_item.value -> 'action') = 'string'
            and length(btrim(event_item.value ->> 'action')) > 0
            and jsonb_typeof(event_item.value -> 'date') = 'string'
            and length(btrim(event_item.value ->> 'date')) > 0
        )
        else false
      end
      or case
        when jsonb_typeof(p_safe_metadata -> 'result' -> 'nameservers') = 'array'
        then exists (
          select 1
          from jsonb_array_elements(p_safe_metadata -> 'result' -> 'nameservers') as nameserver_item(value)
          where jsonb_typeof(nameserver_item.value) = 'string'
            and length(btrim(nameserver_item.value #>> '{}')) > 0
        )
        else false
      end
      or case
        when jsonb_typeof(p_safe_metadata -> 'result' -> 'registrar') = 'string'
        then length(btrim(p_safe_metadata -> 'result' ->> 'registrar')) > 0
        else false
      end
    )
    then
      raise exception 'Metadata hasil source tidak sesuai kontrak aman' using errcode = '22023';
    end if;
  elsif p_status = 'no_result' then
    if p_safe_metadata ->> 'meaning' is distinct from 'not_found_is_not_safe'
      or p_safe_metadata -> 'reverifiable' is distinct from 'true'::jsonb
      or p_safe_metadata -> 'result' is distinct from 'null'::jsonb
    then
      raise exception 'Metadata no-result tidak sesuai kontrak aman' using errcode = '22023';
    end if;
  else
    if p_safe_metadata ->> 'meaning' is distinct from 'source_failed'
      or p_safe_metadata -> 'reverifiable' is distinct from 'false'::jsonb
      or p_safe_metadata -> 'result' is distinct from 'null'::jsonb
    then
      raise exception 'Metadata failure tidak sesuai kontrak aman' using errcode = '22023';
    end if;
  end if;

  v_fingerprint := encode(
    extensions.digest(
      jsonb_build_object(
        'status', p_status,
        'coverage', p_coverage,
        'errorCode', p_error_code,
        'safeMetadata', p_safe_metadata
      )::text,
      'sha256'
    ),
    'hex'
  );

  select
    r.id,
    r.status,
    r.scan_id,
    r.worker_claim_token,
    r.result_fingerprint,
    sr.code as source_code,
    sr.reliability_base_score,
    s.case_id,
    t.case_entity_id,
    t.display_value_masked
  into v_run
  from public.scan_source_runs r
  join public.source_registry sr on sr.id = r.source_id
  join public.scans s on s.id = r.scan_id
  join public.scan_targets t on t.scan_id = r.scan_id
  where r.id = p_run_id
  limit 1
  for update of r;

  if not found then
    raise exception 'Source run tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_run.status in ('success', 'no_result', 'failed') then
    if v_run.status <> p_status or v_run.result_fingerprint is distinct from v_fingerprint then
      raise exception 'Hasil source bertentangan dengan hasil tersimpan' using errcode = '23505';
    end if;
    return;
  end if;

  if v_run.status <> 'running' or v_run.worker_claim_token <> p_claim_token then
    raise exception 'Claim source sudah tidak aktif' using errcode = '40001';
  end if;

  if v_run.source_code = 'core_rdap' and p_status = 'success' and p_coverage <> 100 then
    raise exception 'Coverage RDAP sukses harus 100' using errcode = '22023';
  end if;

  update public.scan_source_runs
  set status = p_status,
      finished_at = now(),
      latency_ms = p_latency_ms,
      coverage_contribution = p_coverage,
      error_code = case when p_status = 'failed' then left(p_error_code, 80) else null end,
      safe_metadata = p_safe_metadata,
      worker_claim_token = null,
      worker_lease_expires_at = null,
      result_fingerprint = v_fingerprint
  where id = v_run.id;

  if p_status = 'success'
    and v_run.case_id is not null
    and v_run.source_code = 'core_rdap'
  then
    v_reliability := case
      when v_run.reliability_base_score >= 80 then 'high'::public.evidence_reliability
      when v_run.reliability_base_score >= 60 then 'medium'::public.evidence_reliability
      else 'low'::public.evidence_reliability
    end;

    insert into public.case_evidence (
      case_id,
      entity_id,
      evidence_class,
      source_kind,
      source_locator,
      reliability,
      summary,
      detail,
      reverifiable,
      reverify_hint,
      created_by_kind,
      created_by
    ) values (
      v_run.case_id,
      v_run.case_entity_id,
      'verified_fact',
      'rdap',
      'rdap.org',
      v_reliability,
      'Catatan pendaftaran domain ' || v_run.display_value_masked || ' ditemukan.',
      coalesce(p_safe_metadata -> 'result', '{}'::jsonb),
      true,
      'Jalankan ulang pemeriksaan RDAP untuk domain yang sama.',
      'system',
      null
    );

    update public.cases
    set last_activity_at = now()
    where id = v_run.case_id;
  end if;
end;
$$;

create function public.finalisasi_scan(p_scan_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_pending integer;
  v_success integer;
  v_coverage integer;
  v_minimum integer;
  v_cost integer;
begin
  select s.id, s.status, s.product_code, s.quote_id, s.credit_hold_id
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.status in ('completed', 'failed', 'refunded', 'cancelled') then
    return jsonb_build_object('status', v_scan.status, 'alreadyFinal', true);
  end if;

  select
    count(*) filter (where r.status in ('queued', 'running')),
    count(*) filter (where r.status = 'success'),
    least(
      100,
      coalesce(sum(r.coverage_contribution) filter (where r.status = 'success'), 0)
    )::integer
  into v_pending, v_success, v_coverage
  from public.scan_source_runs r
  where r.scan_id = v_scan.id;

  if v_pending > 0 then
    raise exception 'Source scan belum terminal' using errcode = 'J2001';
  end if;

  select
    coalesce(q.minimum_deliverable_score, 1),
    q.final_credit_cost
  into v_minimum, v_cost
  from public.scan_quotes q
  where q.id = v_scan.quote_id;

  if v_scan.credit_hold_id is null then
    raise exception 'Scan tidak punya credit hold' using errcode = '23514';
  end if;

  if v_success > 0 and v_coverage >= v_minimum then
    perform public.settle_scan_credits(
      v_scan.id,
      v_cost,
      'scan:' || v_scan.id::text || ':settle'
    );

    update public.scans
    set status = 'completed',
        completed_at = now(),
        coverage_score = v_coverage,
        failure_reason_code = null,
        current_stage = 'complete'
    where id = v_scan.id;

    return jsonb_build_object('status', 'completed', 'coverage', v_coverage);
  end if;

  perform public.release_scan_credits(
    v_scan.id,
    'scan:' || v_scan.id::text || ':release'
  );

  update public.scans
  set status = 'refunded',
      completed_at = now(),
      coverage_score = v_coverage,
      failure_reason_code = 'minimum_deliverable_not_met',
      current_stage = 'complete'
  where id = v_scan.id;

  return jsonb_build_object('status', 'refunded', 'coverage', v_coverage);
end;
$$;

create function public.gagalkan_scan_worker(
  p_scan_id uuid,
  p_reason text default 'workflow_failed'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_scan record;
  v_has_reserved_hold boolean;
begin
  select s.id, s.status
  into v_scan
  from public.scans s
  where s.id = p_scan_id
  for update;

  if not found then
    raise exception 'Scan tidak ditemukan' using errcode = 'P0002';
  end if;

  if v_scan.status in ('completed', 'failed', 'refunded', 'cancelled') then
    return jsonb_build_object('status', v_scan.status, 'alreadyFinal', true);
  end if;

  update public.scan_source_runs
  set status = 'failed',
      finished_at = now(),
      error_code = 'workflow_failed',
      worker_claim_token = null,
      worker_lease_expires_at = null
  where scan_id = v_scan.id
    and status in ('queued', 'running');

  select exists (
    select 1 from public.credit_holds
    where scan_id = v_scan.id and status = 'reserved'
  ) into v_has_reserved_hold;

  if v_has_reserved_hold then
    perform public.release_scan_credits(
      v_scan.id,
      'scan:' || v_scan.id::text || ':compensate'
    );

    update public.scans
    set status = 'refunded',
        completed_at = now(),
        failure_reason_code = left(coalesce(p_reason, 'workflow_failed'), 80),
        current_stage = 'failed'
    where id = v_scan.id;
  else
    update public.scans
    set status = 'failed',
        failed_at = now(),
        failure_reason_code = left(coalesce(p_reason, 'workflow_failed'), 80),
        current_stage = 'failed'
    where id = v_scan.id;
  end if;

  return jsonb_build_object(
    'status', case when v_has_reserved_hold then 'refunded' else 'failed' end
  );
end;
$$;

revoke all on function public.siapkan_scan_worker(uuid, text)
  from public, anon, authenticated;
revoke all on function public.klaim_source_run(uuid, text)
  from public, anon, authenticated;
revoke all on function public.lepas_klaim_source(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.catat_hasil_source(
  uuid, text, public.scan_source_run_status_enum, integer, integer, text, jsonb
) from public, anon, authenticated;
revoke all on function public.finalisasi_scan(uuid)
  from public, anon, authenticated;
revoke all on function public.gagalkan_scan_worker(uuid, text)
  from public, anon, authenticated;

grant execute on function public.siapkan_scan_worker(uuid, text) to service_role;
grant execute on function public.klaim_source_run(uuid, text) to service_role;
grant execute on function public.lepas_klaim_source(uuid, text, text) to service_role;
grant execute on function public.catat_hasil_source(
  uuid, text, public.scan_source_run_status_enum, integer, integer, text, jsonb
) to service_role;
grant execute on function public.finalisasi_scan(uuid) to service_role;
grant execute on function public.gagalkan_scan_worker(uuid, text) to service_role;
