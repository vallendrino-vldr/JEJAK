-- Phase 9 (Top-up) slice B — Payment Methods (rekening tujuan). SCHEMA §28.
-- Rekening bisnis tempat user transfer. Nomor akun & nama pemilik DIENKRIPSI
-- (Vault, pola identifier). User tidak pernah baca tabel ini langsung — mereka
-- dapat snapshot lewat order (slice berikutnya). RLS: service_role saja; kelola
-- lewat fungsi ber-izin `business.manage_payment_methods`.

create type public.payment_method_type as enum ('bank_transfer', 'ewallet', 'qris');

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  display_name text not null,
  method_type public.payment_method_type not null default 'bank_transfer',
  institution_name text not null,
  account_number_ciphertext bytea not null,
  account_number_last4 text not null,
  account_holder_name_ciphertext bytea not null,
  instructions text,
  is_active boolean not null default true,
  is_primary boolean not null default false,
  display_order int not null default 0,
  version int not null default 1,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  retired_at timestamptz,
  constraint payment_methods_last4_format check (account_number_last4 ~ '^[0-9]{2,4}$')
);

create trigger payment_methods_touch_updated_at
  before update on public.payment_methods
  for each row execute function app.touch_updated_at();

-- Hanya satu primary pada satu waktu.
create unique index payment_methods_single_primary
  on public.payment_methods (is_primary)
  where is_primary;

alter table public.payment_methods enable row level security;
create policy payment_methods_admin_all on public.payment_methods
  for all to service_role using (true) with check (true);
-- Sengaja tidak ada policy/grant untuk anon/authenticated: tertutup penuh.

-- ---------------------------------------------------------------------------
-- Kelola rekening (create/update by code). Cek izin sendiri, enkripsi di server.
-- ---------------------------------------------------------------------------
create function public.simpan_rekening(
  p_code text,
  p_display_name text,
  p_method_type public.payment_method_type,
  p_institution_name text,
  p_account_number text,
  p_account_holder_name text,
  p_instructions text,
  p_is_active boolean,
  p_is_primary boolean,
  p_display_order int
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
  v_digits text := regexp_replace(coalesce(p_account_number, ''), '[^0-9]', '', 'g');
  v_last4 text;
begin
  if not (app.is_owner() or app.current_user_has_permission('business.manage_payment_methods')) then
    raise exception 'Tidak berwenang mengelola metode pembayaran' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_code, ''))) = 0 or length(btrim(coalesce(p_display_name, ''))) = 0 then
    raise exception 'Kode dan nama tampilan wajib diisi' using errcode = '22023';
  end if;
  if length(v_digits) < 2 then
    raise exception 'Nomor rekening tidak valid' using errcode = '22023';
  end if;
  v_last4 := right(v_digits, 4);

  -- Primary tunggal: lepaskan primary lain lebih dulu.
  if p_is_primary then
    update public.payment_methods set is_primary = false, updated_by = v_uid
      where is_primary and code <> p_code;
  end if;

  insert into public.payment_methods (
    code, display_name, method_type, institution_name,
    account_number_ciphertext, account_number_last4, account_holder_name_ciphertext,
    instructions, is_active, is_primary, display_order, created_by, updated_by
  ) values (
    p_code, p_display_name, p_method_type, p_institution_name,
    extensions.pgp_sym_encrypt(v_digits, app.kunci('jejak_identifier_enc')),
    v_last4,
    extensions.pgp_sym_encrypt(coalesce(p_account_holder_name, ''), app.kunci('jejak_identifier_enc')),
    nullif(btrim(coalesce(p_instructions, '')), ''),
    coalesce(p_is_active, true), coalesce(p_is_primary, false),
    coalesce(p_display_order, 0), v_uid, v_uid
  )
  on conflict (code) do update set
    display_name = excluded.display_name,
    method_type = excluded.method_type,
    institution_name = excluded.institution_name,
    account_number_ciphertext = excluded.account_number_ciphertext,
    account_number_last4 = excluded.account_number_last4,
    account_holder_name_ciphertext = excluded.account_holder_name_ciphertext,
    instructions = excluded.instructions,
    is_active = excluded.is_active,
    is_primary = excluded.is_primary,
    display_order = excluded.display_order,
    updated_by = v_uid,
    version = public.payment_methods.version + 1
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.simpan_rekening(
  text, text, public.payment_method_type, text, text, text, text, boolean, boolean, int
) from public;
grant execute on function public.simpan_rekening(
  text, text, public.payment_method_type, text, text, text, text, boolean, boolean, int
) to authenticated;

-- ---------------------------------------------------------------------------
-- Daftar rekening untuk admin — TANPA nomor penuh (cukup last4 + metadata).
-- ---------------------------------------------------------------------------
create function public.daftar_rekening_kendali()
returns table (
  id uuid,
  code text,
  display_name text,
  method_type public.payment_method_type,
  institution_name text,
  account_number_last4 text,
  holder_name text,
  instructions text,
  is_active boolean,
  is_primary boolean,
  display_order int,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    m.id, m.code, m.display_name, m.method_type, m.institution_name,
    m.account_number_last4,
    extensions.pgp_sym_decrypt(m.account_holder_name_ciphertext, app.kunci('jejak_identifier_enc')),
    m.instructions, m.is_active, m.is_primary, m.display_order, m.updated_at
  from public.payment_methods m
  where m.retired_at is null
    and (app.is_owner() or app.current_user_has_permission('business.manage_payment_methods'))
  order by m.display_order, m.created_at;
$$;

revoke all on function public.daftar_rekening_kendali() from public;
grant execute on function public.daftar_rekening_kendali() to authenticated;
