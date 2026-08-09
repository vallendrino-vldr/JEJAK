-- Implementasi Phase 6: Credit Ledger & Pricing (Foundation)
--
-- Blueprint: docs/SCHEMA.md bab 12, 13 (scans), 21-25.
-- Menerapkan sistem dompet FEFO (First-Expired, First-Out), transaksi atomik,
-- dan reservasi saldo (holds) untuk investigasi.

--------------------------------------------------------------------------------
-- Enums
--------------------------------------------------------------------------------
create type public.origin_type as enum (
  'purchase', 'signup_bonus', 'campaign', 'referral', 'admin_grant', 'compensation', 'refund', 'reseller_voucher'
);
create type public.lot_status as enum (
  'active', 'grace', 'exhausted', 'expired', 'revoked'
);
create type public.transaction_type as enum (
  'lot_created', 'reserve', 'release', 'settle', 'refund', 'expire', 'admin_grant', 'admin_correction', 'extension', 'voucher_redeem', 'promo'
);
create type public.hold_status as enum (
  'reserved', 'settled', 'released', 'expired_internal'
);
create type public.scan_status as enum (
  'requested', 'credit_reserved', 'running', 'partial', 'completed', 'failed', 'refunded', 'cancelled'
);

--------------------------------------------------------------------------------
-- Skema Harga & Produk
--------------------------------------------------------------------------------

create table public.scan_products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  base_credit_cost int not null default 0,
  active boolean not null default true,
  display_order int not null default 0,
  minimum_deliverable_score int,
  included_ai_questions int default 0,
  config jsonb,
  version int not null default 1,
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create trigger scan_products_touch_updated_at
  before update on public.scan_products
  for each row execute function app.touch_updated_at();

-- RLS
alter table public.scan_products enable row level security;
create policy scan_products_select on public.scan_products for select using (true);
create policy scan_products_admin_all on public.scan_products for all to service_role using (true) with check (true);

create table public.scan_quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid references public.cases (id) on delete cascade,
  scan_product_id uuid not null references public.scan_products (id),
  quoted_credit_cost int not null,
  upgrade_credit_discount int not null default 0,
  final_credit_cost int not null,
  config_version int not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.scan_quotes enable row level security;
create policy scan_quotes_select_owner on public.scan_quotes for select using (auth.uid() = user_id);
create policy scan_quotes_admin_all on public.scan_quotes for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Skema Inti Wallet & Ledger
--------------------------------------------------------------------------------

create table public.credit_wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users (id) on delete cascade,
  available_cached int not null default 0,
  reserved_cached int not null default 0,
  version bigint not null default 1,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create trigger credit_wallets_touch_updated_at
  before update on public.credit_wallets
  for each row execute function app.touch_updated_at();

-- RLS
alter table public.credit_wallets enable row level security;
create policy credit_wallets_select_owner on public.credit_wallets for select using (auth.uid() = user_id);
create policy credit_wallets_admin_all on public.credit_wallets for all to service_role using (true) with check (true);

create table public.credit_lots (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.credit_wallets (id) on delete cascade,
  origin_type public.origin_type not null,
  origin_id text,
  original_credits int not null,
  remaining_credits int not null,
  reserved_credits int not null default 0,
  purchased_credits int not null default 0,
  bonus_credits int not null default 0,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  grace_until timestamptz,
  extendable boolean not null default false,
  status public.lot_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_credits check (remaining_credits >= 0 and reserved_credits >= 0 and original_credits >= 0)
);

create trigger credit_lots_touch_updated_at
  before update on public.credit_lots
  for each row execute function app.touch_updated_at();

-- RLS
alter table public.credit_lots enable row level security;
create policy credit_lots_select_owner on public.credit_lots for select using (
  wallet_id in (select id from public.credit_wallets where user_id = auth.uid())
);
create policy credit_lots_admin_all on public.credit_lots for all to service_role using (true) with check (true);

create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.credit_wallets (id) on delete cascade,
  transaction_type public.transaction_type not null,
  delta_available int not null,
  delta_reserved int not null,
  reference_type text,
  reference_id text,
  idempotency_key text unique not null,
  reason_code text,
  created_by_user_id uuid references auth.users (id) on delete set null,
  created_by_system text,
  metadata_safe jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.credit_transactions enable row level security;
create policy credit_transactions_select_owner on public.credit_transactions for select using (
  wallet_id in (select id from public.credit_wallets where user_id = auth.uid())
);
create policy credit_transactions_admin_all on public.credit_transactions for all to service_role using (true) with check (true);

create table public.credit_transaction_allocations (
  transaction_id uuid not null references public.credit_transactions (id) on delete cascade,
  credit_lot_id uuid not null references public.credit_lots (id) on delete cascade,
  credits int not null,
  created_at timestamptz not null default now(),
  primary key (transaction_id, credit_lot_id)
);

-- RLS
alter table public.credit_transaction_allocations enable row level security;
create policy ct_alloc_select_owner on public.credit_transaction_allocations for select using (
  transaction_id in (
    select id from public.credit_transactions
    where wallet_id in (select id from public.credit_wallets where user_id = auth.uid())
  )
);
create policy ct_alloc_admin_all on public.credit_transaction_allocations for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Scans & Holds
--------------------------------------------------------------------------------

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique default 'SCN' || upper(substr(md5(random()::text), 1, 8)),
  user_id uuid not null references auth.users (id) on delete cascade,
  case_id uuid references public.cases (id) on delete cascade,
  purpose text not null,
  product_code text not null references public.scan_products (code),
  quote_id uuid references public.scan_quotes (id),
  status public.scan_status not null default 'requested',
  idempotency_key text unique not null,
  -- credit_hold_id nullable initially; populated when hold is created
  credit_hold_id uuid, 
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  coverage_score int,
  match_confidence int,
  exposure_score int,
  risk_signal text,
  failure_reason_code text,
  current_stage text,
  client_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger scans_touch_updated_at
  before update on public.scans
  for each row execute function app.touch_updated_at();

-- RLS
alter table public.scans enable row level security;
create policy scans_select_owner on public.scans for select using (auth.uid() = user_id);
-- Insert allowed via API layer / RPC, but direct insert by user is disabled for now.
create policy scans_admin_all on public.scans for all to service_role using (true) with check (true);

create table public.credit_holds (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.credit_wallets (id) on delete cascade,
  scan_id uuid unique not null references public.scans (id) on delete cascade,
  credits int not null,
  status public.hold_status not null default 'reserved',
  idempotency_key text unique not null,
  created_at timestamptz not null default now(),
  settled_at timestamptz,
  released_at timestamptz
);

-- fk circle resolution
alter table public.scans add constraint scans_credit_hold_fkey
  foreign key (credit_hold_id) references public.credit_holds (id) on delete set null;

-- RLS
alter table public.credit_holds enable row level security;
create policy credit_holds_select_owner on public.credit_holds for select using (
  wallet_id in (select id from public.credit_wallets where user_id = auth.uid())
);
create policy credit_holds_admin_all on public.credit_holds for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Fungsi Wallet Autocreate (Trigger on auth.users)
--------------------------------------------------------------------------------

create or replace function public.handle_new_user_wallet()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.credit_wallets (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_wallet
  after insert on auth.users
  for each row execute function public.handle_new_user_wallet();

-- Buatkan untuk pengguna yang sudah ada.
insert into public.credit_wallets (user_id)
select id from auth.users
on conflict (user_id) do nothing;
