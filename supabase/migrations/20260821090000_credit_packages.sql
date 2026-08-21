-- Phase 9 (Top-up) slice 9A — Credit Package Config.
-- Blueprint: docs/SCHEMA.md §27. Paket kredit yang bisa dibeli user; harga &
-- kredit business-editable (nanti via admin, sekarang seed placeholder).
-- Tidak ada gerakan uang di sini — cuma katalog produk.

create table public.credit_packages (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  price_idr int not null,
  base_credits int not null,
  bonus_credits int not null default 0,
  validity_days int not null,
  grace_days int not null default 0,
  extends_existing_paid_credits boolean not null default false,
  extension_days int,
  target_segment text not null default 'all',
  active boolean not null default true,
  display_order int not null default 0,
  badge_text text,
  version int not null default 1,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_packages_amounts_valid check (
    price_idr >= 0
    and base_credits >= 0
    and bonus_credits >= 0
    and validity_days > 0
    and grace_days >= 0
    and (extension_days is null or extension_days >= 0)
  )
);

create trigger credit_packages_touch_updated_at
  before update on public.credit_packages
  for each row execute function app.touch_updated_at();

-- RLS: user hanya lihat paket aktif; tulis hanya lewat fungsi admin (nanti) /
-- service_role. Tidak ada policy INSERT/UPDATE untuk client (DEC-0116 pola).
alter table public.credit_packages enable row level security;

create policy credit_packages_select_active on public.credit_packages
  for select using (active);

create policy credit_packages_admin_all on public.credit_packages
  for all to service_role using (true) with check (true);

-- Kolom paket semua non-sensitif (info produk publik) → grant select tabel aman.
grant select on public.credit_packages to authenticated, anon;

-- Seed placeholder (Owner ubah nanti tanpa deploy). on conflict → re-run aman.
insert into public.credit_packages
  (code, name, price_idr, base_credits, bonus_credits, validity_days, grace_days, display_order, badge_text)
values
  ('mulai',    'Mulai',    15000,  10,  0,  30, 7, 1, null),
  ('proteksi', 'Proteksi', 35000,  25,  3,  60, 7, 2, 'Populer'),
  ('lanjutan', 'Lanjutan', 75000,  60, 10,  90, 7, 3, null),
  ('power',    'Power',   150000, 150, 30, 180, 7, 4, 'Paling Hemat')
on conflict (code) do nothing;
