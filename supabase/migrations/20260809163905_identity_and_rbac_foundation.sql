-- Fondasi identity + RBAC Jejak.
--
-- Invariant yang dijaga migration ini:
--   1. Semua tabel di schema public menyalakan RLS dan tidak punya policy permisif default.
--   2. Client hanya boleh membaca barisnya sendiri; tidak ada satu pun policy INSERT/DELETE untuk client.
--   3. account_status tidak bisa diubah user lewat Data API — dijaga column-level GRANT, bukan hanya UI.
--   4. Owner ditentukan oleh row di user_roles, bukan perbandingan email di frontend.
--
-- Referensi blueprint: docs/SCHEMA.md §4, §5, §68, §123, §124, §127.

-- ---------------------------------------------------------------------------
-- Schema privat untuk helper. Tidak diekspos ke Data API, sehingga function
-- SECURITY DEFINER di dalamnya tidak otomatis jadi endpoint publik.
-- ---------------------------------------------------------------------------
create schema if not exists app;

revoke all on schema app from public;
revoke all on schema app from anon;
revoke all on schema app from authenticated;
grant usage on schema app to authenticated;

-- Proyek Supabase baru masih bisa membawa default privilege Data API yang
-- permisif untuk object yang dibuat oleh role postgres. Kunci default-nya
-- sebelum migration ini membuat tabel, sequence, atau function pertama.
-- Akses client dibuka kembali secara eksplisit per-object setelah RLS siap.
-- Global REVOKE wajib ada: REVOKE per-schema tidak dapat membatalkan default
-- global PostgreSQL (termasuk EXECUTE bawaan PUBLIC pada function baru).
alter default privileges for role postgres
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres
  revoke all on functions from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
create type public.account_status as enum (
  'active',
  'observed',
  'limited',
  'paused',
  'blocked',
  'deletion_pending',
  'deleted'
);

create type public.user_role_status as enum ('active', 'revoked');

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  account_status public.account_status not null default 'active',
  assisted_mode boolean not null default false,
  preferred_language text not null default 'id',
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  deletion_requested_at timestamptz
);

comment on table public.profiles is 'Satu row per auth.users. Auth tetap identity origin; email disalin untuk keperluan produk.';
comment on column public.profiles.account_status is 'Hanya boleh diubah lewat operasi server terkontrol. Column-level GRANT menutup jalur Data API.';

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.roles (code, name, description) values
  ('owner', 'Owner', 'Pemilik produk. Akses tertinggi, tetap lewat permission eksplisit.'),
  ('admin', 'Admin', 'Operasional harian Ruang Kendali.'),
  ('finance', 'Finance', 'Terbatas pada pembayaran. Bukan investigator.'),
  ('support', 'Support', 'Bantuan pengguna. Data sensitif termasker secara default.'),
  ('user', 'Pengguna', 'Peran dasar setiap akun.');

-- ---------------------------------------------------------------------------
-- user_roles
-- ---------------------------------------------------------------------------
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role_id uuid not null references public.roles (id),
  status public.user_role_status not null default 'active',
  assigned_by uuid references auth.users (id),
  assigned_at timestamptz not null default now(),
  revoked_by uuid references auth.users (id),
  revoked_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

-- Satu assignment aktif per (user, role). Assignment yang dicabut tetap tersimpan sebagai jejak audit.
create unique index user_roles_one_active_assignment
  on public.user_roles (user_id, role_id)
  where status = 'active';

create index user_roles_active_by_user on public.user_roles (user_id) where status = 'active';

-- ---------------------------------------------------------------------------
-- Helper authorization
--
-- SECURITY DEFINER dipakai karena policy pada user_roles tidak boleh memanggil
-- dirinya sendiri secara rekursif. Ruang lingkupnya sempit: hanya membaca peran
-- milik pemanggil, tidak menerima user_id dari luar.
-- ---------------------------------------------------------------------------
create function app.current_user_has_role(role_code text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and ur.status = 'active'
      and r.code = role_code
  );
$$;

create function app.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app.current_user_has_role('owner');
$$;

create function app.is_active_user()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
      and p.deleted_at is null
  );
$$;

revoke all on function app.current_user_has_role(text) from public;
revoke all on function app.is_owner() from public;
revoke all on function app.is_active_user() from public;
grant execute on function app.current_user_has_role(text) to authenticated;
grant execute on function app.is_owner() to authenticated;
grant execute on function app.is_active_user() to authenticated;

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------
create function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function app.touch_updated_at();

create trigger roles_touch_updated_at
  before update on public.roles
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Inisialisasi user baru.
--
-- Sengaja minimal (profile + peran dasar) supaya login tidak pernah gagal
-- gara-gara logika produk yang berubah. Wallet, benefit scan pertama, dan
-- kebutuhan kampanye ditangani initializer server pada phase berikutnya.
-- ---------------------------------------------------------------------------
create function app.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  bootstrap_owner_email constant text := 'vadlyvldr@gmail.com';
  base_role_id uuid;
  owner_role_id uuid;
begin
  -- raw_user_meta_data berasal dari provider dan bisa dipengaruhi user.
  -- Dipakai hanya untuk tampilan, tidak pernah untuk otorisasi.
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  select id into base_role_id from public.roles where code = 'user';

  if base_role_id is not null and not exists (
    select 1 from public.user_roles
    where user_id = new.id and role_id = base_role_id and status = 'active'
  ) then
    insert into public.user_roles (user_id, role_id) values (new.id, base_role_id);
  end if;

  -- Bootstrap Owner sekali seumur hidup database: hanya berlaku jika belum ada
  -- Owner aktif sama sekali. Setelah itu kepemilikan hanya berpindah lewat
  -- operasi admin yang teraudit, bukan lewat email yang kebetulan cocok.
  if new.email = bootstrap_owner_email then
    select id into owner_role_id from public.roles where code = 'owner';

    if owner_role_id is not null and not exists (
      select 1 from public.user_roles
      where role_id = owner_role_id and status = 'active'
    ) then
      insert into public.user_roles (user_id, role_id, reason)
      values (new.id, owner_role_id, 'bootstrap owner pertama');
    end if;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_auth_user();

-- ---------------------------------------------------------------------------
-- RLS: deny-by-default, lalu buka seminimal mungkin.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;

-- Tabel roles tidak punya policy sama sekali: hanya server (secret key) yang membacanya.
revoke all on public.roles from anon;
revoke all on public.roles from authenticated;

revoke all on public.profiles from anon;
revoke all on public.profiles from authenticated;
grant select on public.profiles to authenticated;
-- account_status, deleted_at, dan kolom lifecycle lain sengaja tidak diberikan.
grant update (display_name, avatar_url, assisted_mode, preferred_language)
  on public.profiles to authenticated;

create policy "profil sendiri dapat dibaca"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profil sendiri dapat diubah"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.user_roles from anon;
revoke all on public.user_roles from authenticated;
grant select on public.user_roles to authenticated;

create policy "peran sendiri dapat dibaca"
  on public.user_roles for select
  to authenticated
  using ((select auth.uid()) = user_id);
