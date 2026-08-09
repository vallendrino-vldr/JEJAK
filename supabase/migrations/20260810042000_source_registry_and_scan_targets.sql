-- Implementasi Phase 7: Source Registry & Scan Engine Core (Vertical Slice)
--
-- Blueprint: docs/SCHEMA.md bab 11 (Source Registry), 13 (scan_targets, scan_source_runs)
-- Menambahkan registri source OSINT, target scan, dan relasi execution (scan_source_runs).

--------------------------------------------------------------------------------
-- Enums
--------------------------------------------------------------------------------
create type public.source_class_enum as enum (
  'api', 'scraper', 'dns', 'local_parser', 'internal_db'
);
create type public.source_status_enum as enum (
  'active', 'experimental', 'degraded', 'paused', 'disabled', 'retired'
);
create type public.source_env_enum as enum (
  'production', 'sandbox', 'local'
);
create type public.source_license_enum as enum (
  'open', 'commercial', 'internal'
);
create type public.source_cost_class_enum as enum (
  'free', 'low', 'medium', 'high'
);
create type public.source_health_state_enum as enum (
  'healthy', 'degraded', 'down', 'unknown'
);
create type public.scan_target_type_enum as enum (
  'person_name', 'email', 'phone', 'username', 'domain', 'public_profile', 'business', 'event', 'other'
);
create type public.scan_source_run_status_enum as enum (
  'queued', 'running', 'success', 'no_result', 'failed', 'skipped', 'budget_limited'
);

--------------------------------------------------------------------------------
-- Source Registry
--------------------------------------------------------------------------------
create table public.source_registry (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text not null,
  source_class public.source_class_enum not null,
  status public.source_status_enum not null default 'active',
  environment public.source_env_enum not null default 'production',
  license_status public.source_license_enum not null default 'open',
  commercial_use_note text,
  cost_class public.source_cost_class_enum not null default 'free',
  priority int not null default 100,
  reliability_base_score int not null default 50,
  timeout_ms int not null default 5000,
  daily_internal_budget int,
  per_user_budget int,
  credential_alias text,
  health_state public.source_health_state_enum not null default 'unknown',
  experimental boolean not null default false,
  included_in_scoring boolean not null default true,
  config jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger source_registry_touch_updated_at
  before update on public.source_registry
  for each row execute function app.touch_updated_at();

-- RLS
alter table public.source_registry enable row level security;
-- Semua pengguna terautentikasi dapat membaca konfigurasi source yang aktif (untuk UI)
create policy source_registry_select on public.source_registry for select using (status != 'retired');
create policy source_registry_admin_all on public.source_registry for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Scan Targets
--------------------------------------------------------------------------------
create table public.scan_targets (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  case_entity_id uuid references public.case_entities (id) on delete set null,
  target_type public.scan_target_type_enum not null,
  normalized_value_ciphertext text,
  normalized_value_hmac text,
  display_value_masked text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.scan_targets enable row level security;
-- Owner scan bisa melihat targetnya
create policy scan_targets_select_owner on public.scan_targets for select using (
  scan_id in (select id from public.scans where user_id = auth.uid())
);
create policy scan_targets_admin_all on public.scan_targets for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Scan Source Runs
--------------------------------------------------------------------------------
create table public.scan_source_runs (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  source_id uuid not null references public.source_registry (id) on delete cascade,
  status public.scan_source_run_status_enum not null default 'queued',
  started_at timestamptz,
  finished_at timestamptz,
  latency_ms int,
  coverage_contribution int,
  error_code text,
  retry_count int not null default 0,
  safe_metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.scan_source_runs enable row level security;
create policy scan_source_runs_select_owner on public.scan_source_runs for select using (
  scan_id in (select id from public.scans where user_id = auth.uid())
);
create policy scan_source_runs_admin_all on public.scan_source_runs for all to service_role using (true) with check (true);

--------------------------------------------------------------------------------
-- Source Core Seeds (RDAP, DNS, dll)
--------------------------------------------------------------------------------
insert into public.source_registry (code, name, category, source_class, status)
values
  ('core_rdap', 'RDAP Domain Registration', 'domain', 'api', 'active'),
  ('core_cloudflare_dns', 'Cloudflare DNS', 'network', 'api', 'active'),
  ('core_google_dns', 'Google DNS Fallback', 'network', 'api', 'active'),
  ('core_libphonenumber', 'Local Phone Parsing', 'phone', 'local_parser', 'active'),
  ('core_hibp', 'HIBP Pwned Passwords', 'exposure', 'api', 'active')
on conflict (code) do nothing;
