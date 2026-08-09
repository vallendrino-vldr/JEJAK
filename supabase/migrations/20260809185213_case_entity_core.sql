-- Inti Kasus: cases, keanggotaan, dan identifier yang dilindungi.
--
-- Dua invariant yang dijaga migration ini:
--   1. Kasus hanya terbaca oleh pemilik dan anggota aktifnya. Staf tidak
--      mendapat akses menyeluruh; itu jalur terpisah yang belum dibuka.
--   2. Nilai identifier mentah tidak pernah disimpan apa adanya. Yang tersimpan
--      adalah ciphertext, HMAC untuk pencocokan, dan bentuk tersamar untuk
--      ditampilkan. Kuncinya hidup di Vault dan tidak pernah keluar dari database.
--
-- Referensi blueprint: docs/SCHEMA.md §8, §9; docs/ROADMAP.md Phase 5.

-- ---------------------------------------------------------------------------
-- Kunci identifier.
--
-- Dibangkitkan di dalam database dan disimpan di Vault, jadi tidak ada nilai
-- rahasia yang pernah ditulis di file migration ini maupun di environment.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'jejak_identifier_hmac') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'jejak_identifier_hmac',
      'Kunci HMAC untuk blind index identifier Kasus'
    );
  end if;

  if not exists (select 1 from vault.secrets where name = 'jejak_identifier_enc') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'jejak_identifier_enc',
      'Kunci enkripsi untuk nilai identifier Kasus'
    );
  end if;
end;
$$;

create function app.kunci(nama text)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select decrypted_secret from vault.decrypted_secrets where name = nama;
$$;

revoke all on function app.kunci(text) from public;

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------
create type public.case_purpose as enum (
  'self_check',
  'assisted_check',
  'fraud_check',
  'public_research',
  'mitra_client'
);

create type public.case_status as enum ('active', 'archived', 'trashed', 'deleting', 'deleted');
create type public.case_member_role as enum ('owner', 'contributor', 'viewer');
create type public.case_member_status as enum ('active', 'revoked');

create type public.entity_type as enum (
  'person_name',
  'email',
  'phone',
  'username',
  'domain',
  'public_profile',
  'business',
  'event',
  'other'
);

create type public.entity_ownership_state as enum ('unverified', 'claimed', 'disputed', 'historical');

-- ---------------------------------------------------------------------------
-- cases
-- ---------------------------------------------------------------------------
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  public_ref text not null unique,
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  purpose public.case_purpose not null default 'fraud_check',
  is_secret boolean not null default false,
  status public.case_status not null default 'active',
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  trash_expires_at timestamptz,
  constraint cases_title_terisi check (length(btrim(title)) between 1 and 120)
);

create index cases_milik_pengguna on public.cases (owner_user_id, last_activity_at desc)
  where status = 'active';

comment on column public.cases.is_secret is 'Kasus rahasia: pratinjau dan notifikasi harus disamarkan.';

-- ---------------------------------------------------------------------------
-- case_members
-- ---------------------------------------------------------------------------
create table public.case_members (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.case_member_role not null default 'viewer',
  status public.case_member_status not null default 'active',
  invited_by uuid references auth.users (id),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index case_members_satu_aktif
  on public.case_members (case_id, user_id)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- case_entities
-- ---------------------------------------------------------------------------
create table public.case_entities (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  entity_type public.entity_type not null,
  label text,
  normalized_value_ciphertext bytea,
  normalized_value_hmac text,
  display_value_masked text not null,
  country_code text,
  platform text,
  first_observed_at timestamptz,
  last_observed_at timestamptz,
  ownership_state public.entity_ownership_state not null default 'unverified',
  created_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  merged_into_entity_id uuid references public.case_entities (id),
  merge_state text not null default 'none'
);

-- Petunjuk yang sama tidak perlu masuk dua kali ke satu kasus.
create unique index case_entities_tanpa_duplikat
  on public.case_entities (case_id, entity_type, normalized_value_hmac)
  where normalized_value_hmac is not null and merged_into_entity_id is null;

create index case_entities_per_kasus on public.case_entities (case_id, created_at desc);

comment on column public.case_entities.normalized_value_hmac is
  'Blind index berkunci untuk pencocokan. Bukan hash polos — nilai email/telepon terlalu mudah ditebak kalau begitu.';

-- ---------------------------------------------------------------------------
-- Helper akses Kasus.
--
-- SECURITY DEFINER supaya policy pada case_members tidak memanggil dirinya
-- sendiri secara rekursif. Fungsinya sempit: hanya menjawab "apakah pemanggil
-- boleh menyentuh kasus ini", dan selalu memakai auth.uid() milik pemanggil.
-- ---------------------------------------------------------------------------
create function app.bisa_akses_kasus(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cases c
    where c.id = p_case_id
      and c.deleted_at is null
      and (
        c.owner_user_id = (select auth.uid())
        or exists (
          select 1 from public.case_members m
          where m.case_id = c.id
            and m.user_id = (select auth.uid())
            and m.status = 'active'
        )
      )
  );
$$;

create function app.bisa_ubah_kasus(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cases c
    where c.id = p_case_id
      and c.deleted_at is null
      and (
        c.owner_user_id = (select auth.uid())
        or exists (
          select 1 from public.case_members m
          where m.case_id = c.id
            and m.user_id = (select auth.uid())
            and m.status = 'active'
            and m.role in ('owner', 'contributor')
        )
      )
  );
$$;

revoke all on function app.bisa_akses_kasus(uuid) from public;
revoke all on function app.bisa_ubah_kasus(uuid) from public;
grant execute on function app.bisa_akses_kasus(uuid) to authenticated;
grant execute on function app.bisa_ubah_kasus(uuid) to authenticated;

create trigger cases_touch_updated_at
  before update on public.cases
  for each row execute function app.touch_updated_at();

create trigger case_entities_touch_updated_at
  before update on public.case_entities
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Normalisasi dan penyamaran identifier
-- ---------------------------------------------------------------------------
create function app.normalkan_identifier(p_type public.entity_type, p_nilai text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case p_type
    when 'email' then lower(btrim(p_nilai))
    when 'phone' then regexp_replace(p_nilai, '[^0-9+]', '', 'g')
    when 'domain' then lower(regexp_replace(regexp_replace(btrim(p_nilai), '^https?://', ''), '/.*$', ''))
    when 'username' then lower(btrim(ltrim(btrim(p_nilai), '@')))
    else btrim(regexp_replace(p_nilai, '\s+', ' ', 'g'))
  end;
$$;

create function app.samarkan_identifier(p_type public.entity_type, p_nilai text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  bagian text[];
  nama text;
  ranah text;
  panjang int;
begin
  if p_type = 'email' then
    bagian := string_to_array(p_nilai, '@');
    nama := bagian[1];
    ranah := bagian[2];
    return left(nama, 1) || repeat('*', greatest(length(nama) - 1, 1)) || '@' || ranah;
  end if;

  if p_type = 'phone' then
    panjang := length(p_nilai);
    if panjang <= 6 then
      return repeat('*', panjang);
    end if;
    return left(p_nilai, 4) || repeat('*', panjang - 6) || right(p_nilai, 2);
  end if;

  -- Domain memang publik; menyamarkannya justru menyulitkan pengguna.
  if p_type = 'domain' then
    return p_nilai;
  end if;

  panjang := length(p_nilai);
  if panjang <= 2 then
    return left(p_nilai, 1) || '*';
  end if;
  return left(p_nilai, 2) || repeat('*', panjang - 2);
end;
$$;

-- ---------------------------------------------------------------------------
-- Operasi Kasus.
--
-- Client tidak boleh INSERT langsung: pembuatan kasus harus sekalian membuat
-- keanggotaan owner-nya, dan itu hanya terjamin kalau lewat satu fungsi.
-- ---------------------------------------------------------------------------
create function public.buat_kasus(
  p_judul text,
  p_purpose public.case_purpose default 'fraud_check',
  p_rahasia boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  id_kasus uuid;
  ref text;
begin
  if id_pengguna is null then
    raise exception 'Belum masuk' using errcode = '42501';
  end if;

  if not app.is_active_user() then
    raise exception 'Akun tidak aktif' using errcode = '42501';
  end if;

  if length(btrim(coalesce(p_judul, ''))) = 0 then
    raise exception 'Judul kasus tidak boleh kosong' using errcode = '22023';
  end if;

  loop
    ref := upper(substr(encode(extensions.gen_random_bytes(6), 'hex'), 1, 8));
    exit when not exists (select 1 from public.cases where public_ref = ref);
  end loop;

  insert into public.cases (public_ref, owner_user_id, title, purpose, is_secret)
  values (ref, id_pengguna, btrim(p_judul), p_purpose, coalesce(p_rahasia, false))
  returning id into id_kasus;

  insert into public.case_members (case_id, user_id, role, invited_by)
  values (id_kasus, id_pengguna, 'owner', id_pengguna);

  return id_kasus;
end;
$$;

create function public.tambah_petunjuk(
  p_case_id uuid,
  p_type public.entity_type,
  p_nilai text,
  p_label text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  normal text;
  sidik text;
  id_entitas uuid;
begin
  if id_pengguna is null or not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak mengubah kasus ini' using errcode = '42501';
  end if;

  normal := app.normalkan_identifier(p_type, p_nilai);

  if length(coalesce(normal, '')) = 0 then
    raise exception 'Petunjuk tidak boleh kosong' using errcode = '22023';
  end if;

  sidik := encode(
    extensions.hmac(normal, app.kunci('jejak_identifier_hmac'), 'sha256'),
    'hex'
  );

  -- Petunjuk yang sama cukup sekali per kasus; kembalikan yang sudah ada.
  select id into id_entitas
  from public.case_entities
  where case_id = p_case_id
    and entity_type = p_type
    and normalized_value_hmac = sidik
    and merged_into_entity_id is null;

  if id_entitas is not null then
    return id_entitas;
  end if;

  insert into public.case_entities (
    case_id,
    entity_type,
    label,
    normalized_value_ciphertext,
    normalized_value_hmac,
    display_value_masked,
    created_by
  )
  values (
    p_case_id,
    p_type,
    nullif(btrim(coalesce(p_label, '')), ''),
    extensions.pgp_sym_encrypt(normal, app.kunci('jejak_identifier_enc')),
    sidik,
    app.samarkan_identifier(p_type, normal),
    id_pengguna
  )
  returning id into id_entitas;

  update public.cases set last_activity_at = now() where id = p_case_id;

  return id_entitas;
end;
$$;

revoke all on function public.buat_kasus(text, public.case_purpose, boolean) from public;
revoke all on function public.tambah_petunjuk(uuid, public.entity_type, text, text) from public;
grant execute on function public.buat_kasus(text, public.case_purpose, boolean) to authenticated;
grant execute on function public.tambah_petunjuk(uuid, public.entity_type, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.cases enable row level security;
alter table public.case_members enable row level security;
alter table public.case_entities enable row level security;

revoke all on public.cases from anon;
revoke all on public.cases from authenticated;
revoke all on public.case_members from anon;
revoke all on public.case_members from authenticated;
revoke all on public.case_entities from anon;
revoke all on public.case_entities from authenticated;

grant select on public.cases to authenticated;
-- Kolom lifecycle sengaja tidak diberikan: perpindahan status lewat operasi terkontrol.
grant update (title, purpose, is_secret) on public.cases to authenticated;
grant select on public.case_members to authenticated;
grant select on public.case_entities to authenticated;

create policy "kasus terbaca oleh pemilik dan anggota"
  on public.cases for select
  to authenticated
  using (app.bisa_akses_kasus(id));

create policy "kasus dapat diubah pemilik dan kontributor"
  on public.cases for update
  to authenticated
  using (app.bisa_ubah_kasus(id))
  with check (app.bisa_ubah_kasus(id));

create policy "keanggotaan terbaca oleh yang berhak atas kasusnya"
  on public.case_members for select
  to authenticated
  using (app.bisa_akses_kasus(case_id));

create policy "petunjuk terbaca oleh yang berhak atas kasusnya"
  on public.case_entities for select
  to authenticated
  using (app.bisa_akses_kasus(case_id));

-- Tidak ada policy INSERT/DELETE untuk client pada ketiga tabel: penambahan
-- kasus dan petunjuk hanya lewat buat_kasus() dan tambah_petunjuk(), yang
-- menjaga keanggotaan owner dan enkripsi identifier tetap konsisten.

-- Ciphertext tidak boleh ikut terbaca client walau barisnya boleh dilihat.
revoke select (normalized_value_ciphertext, normalized_value_hmac)
  on public.case_entities from authenticated;
