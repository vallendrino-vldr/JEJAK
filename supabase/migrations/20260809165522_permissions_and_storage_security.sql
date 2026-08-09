-- Permission catalog, pemetaan peran, dan bucket privat.
--
-- Dibuat sebelum fitur sensitif tumbuh, sesuai gate Phase 3: batas keamanan dulu,
-- fitur belakangan. Bucket dibuat sekarang meski Case dan Payment belum ada,
-- supaya tidak ada momen di mana file sudah masuk tapi policy-nya menyusul.
--
-- Referensi blueprint: docs/SCHEMA.md §5.2, §5.3, §5.6; docs/ROADMAP.md Phase 3.

create type public.permission_sensitivity as enum ('normal', 'sensitive', 'critical');

create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null,
  sensitivity public.permission_sensitivity not null default 'normal',
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role_id uuid not null references public.roles (id) on delete cascade,
  permission_id uuid not null references public.permissions (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (role_id, permission_id)
);

insert into public.permissions (code, description, sensitivity) values
  ('payments.view_queue', 'Melihat antrean pembayaran', 'normal'),
  ('payments.view_proof', 'Membuka bukti transfer', 'sensitive'),
  ('payments.approve', 'Menyetujui pembayaran', 'critical'),
  ('payments.reject', 'Menolak pembayaran', 'critical'),
  ('payments.request_new_proof', 'Meminta bukti transfer baru', 'normal'),
  ('users.view_basic', 'Melihat data dasar pengguna', 'normal'),
  ('users.view_sensitive', 'Melihat data sensitif pengguna', 'sensitive'),
  ('users.reveal_identifier', 'Membuka identifier mentah pengguna', 'critical'),
  ('credits.grant', 'Memberi kredit', 'critical'),
  ('credits.correct', 'Membuat koreksi ledger', 'critical'),
  ('roles.assign_admin', 'Menetapkan peran admin', 'critical'),
  ('roles.assign_finance', 'Menetapkan peran finance', 'critical'),
  ('roles.assign_support', 'Menetapkan peran support', 'critical'),
  ('partners.manage', 'Mengelola partner', 'sensitive'),
  ('business.manage_pricing', 'Mengubah harga', 'sensitive'),
  ('business.manage_payment_methods', 'Mengubah metode pembayaran', 'critical'),
  ('business.manage_campaigns', 'Mengelola kampanye', 'normal'),
  ('system.manage_sources', 'Mengelola Source Registry', 'sensitive'),
  ('system.manage_feature_flags', 'Mengelola feature flag', 'sensitive'),
  ('system.manage_maintenance', 'Mengelola mode pemeliharaan', 'sensitive'),
  ('system.emergency_protection', 'Menyalakan Proteksi Darurat', 'critical'),
  ('system.view_logs', 'Melihat log sistem', 'sensitive'),
  ('analytics.view', 'Melihat analitik', 'normal'),
  ('owner.manage_ownership', 'Memindahkan kepemilikan', 'critical');

-- Owner memegang seluruh permission.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.code = 'owner';

-- Admin: operasional harian. Tidak menyentuh kepemilikan, tidak mengubah rekening,
-- tidak membuka identifier mentah, tidak memberi peran finance/support/admin.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'payments.view_queue',
  'payments.request_new_proof',
  'users.view_basic',
  'partners.manage',
  'business.manage_pricing',
  'business.manage_campaigns',
  'system.manage_sources',
  'system.manage_feature_flags',
  'system.manage_maintenance',
  'system.view_logs',
  'analytics.view'
)
where r.code = 'admin';

-- Finance: hanya pembayaran. Bukan investigator, jadi tidak diberi akses Case
-- maupun data pengguna di luar yang dibutuhkan untuk mencocokkan transfer.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in (
  'payments.view_queue',
  'payments.view_proof',
  'payments.approve',
  'payments.reject',
  'payments.request_new_proof',
  'users.view_basic'
)
where r.code = 'finance';

-- Support: bantuan pengguna dengan data termasker. Tidak boleh membuka bukti
-- transfer, tidak boleh menyentuh kredit, tidak boleh membuka identifier mentah.
insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.code in ('users.view_basic')
where r.code = 'support';

-- Peran `user` sengaja tidak punya baris sama sekali: kemampuan pengguna biasa
-- datang dari kepemilikan data lewat RLS, bukan dari permission staf.

-- ---------------------------------------------------------------------------
-- Helper permission
-- ---------------------------------------------------------------------------
create function app.current_user_has_permission(permission_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    join public.profiles pr on pr.id = ur.user_id
    where ur.user_id = (select auth.uid())
      and ur.status = 'active'
      and p.code = permission_code
      -- Akun yang dijeda atau diblokir kehilangan kemampuan staf seketika,
      -- tanpa perlu mencabut perannya satu per satu.
      and pr.account_status = 'active'
      and pr.deleted_at is null
  );
$$;

revoke all on function app.current_user_has_permission(text) from public;
grant execute on function app.current_user_has_permission(text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: katalog permission ikut aturan yang sama seperti katalog peran.
-- Isinya nama kemampuan, bukan siapa memilikinya.
-- ---------------------------------------------------------------------------
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

revoke all on public.permissions from anon;
revoke all on public.permissions from authenticated;
revoke all on public.role_permissions from anon;
revoke all on public.role_permissions from authenticated;

grant select on public.permissions to authenticated;

create policy "katalog permission dapat dibaca pengguna login"
  on public.permissions for select
  to authenticated
  using (true);

-- role_permissions tidak dibuka ke client sama sekali: pemetaan peran-ke-kemampuan
-- adalah peta serangan. Aplikasi menanyakannya lewat app.current_user_has_permission.

-- ---------------------------------------------------------------------------
-- Storage: dua bucket privat, dibuat lebih dulu daripada fiturnya.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'case-attachments',
    'case-attachments',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  ),
  (
    'payment-proofs',
    'payment-proofs',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

-- Tidak ada satu pun policy storage untuk anon/authenticated pada tahap ini.
-- storage.objects sudah ber-RLS bawaan Supabase, jadi tanpa policy artinya
-- tertutup penuh: akses file hanya lewat alur server yang terkontrol dan signed
-- URL berumur pendek. Policy per-bucket ditambahkan bersama fitur Case (Phase 5)
-- dan Payment (Phase 9), ketika model kepemilikan filenya sudah ada.
