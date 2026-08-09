-- Implementasi Phase 5: Merge Entitas & Case Attachments
--
-- Migration ini menjaga 3 prinsip dari blueprint:
-- 1. Merge bersifat logis (reversible), entitas sumber tidak di-DELETE.
-- 2. Attachment case harus berada di private bucket, memiliki metadata yang jelas,
--    dan diakses melalui pre-signed URL yang dijaga RLS ketat.
-- 3. Client tidak bisa INSERT/UPDATE table secara langsung (Security Definer).

-- ---------------------------------------------------------------------------
-- 1. Fungsi Merge & Unmerge Entitas
-- ---------------------------------------------------------------------------

create function public.gabung_entitas(
  p_case_id uuid,
  p_sumber_id uuid,
  p_target_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sumber_case_id uuid;
  v_target_case_id uuid;
begin
  -- 1. Otorisasi
  if not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak mengubah kasus ini' using errcode = '42501';
  end if;

  if p_sumber_id = p_target_id then
    raise exception 'Tidak dapat menggabungkan entitas ke dirinya sendiri' using errcode = '22023';
  end if;

  -- 2. Validasi Entitas
  select case_id into v_sumber_case_id
  from public.case_entities
  where id = p_sumber_id and merged_into_entity_id is null;

  if v_sumber_case_id is null or v_sumber_case_id != p_case_id then
    raise exception 'Entitas sumber tidak valid atau sudah digabungkan' using errcode = '22023';
  end if;

  select case_id into v_target_case_id
  from public.case_entities
  where id = p_target_id and merged_into_entity_id is null;

  if v_target_case_id is null or v_target_case_id != p_case_id then
    raise exception 'Entitas target tidak valid atau sudah digabungkan' using errcode = '22023';
  end if;

  -- 3. Eksekusi Merge Logis
  update public.case_entities
  set 
    merged_into_entity_id = p_target_id,
    merge_state = 'merged'
  where id = p_sumber_id;

  update public.cases set last_activity_at = now() where id = p_case_id;
end;
$$;

create function public.pisahkan_entitas(
  p_case_id uuid,
  p_sumber_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sumber_case_id uuid;
begin
  if not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak mengubah kasus ini' using errcode = '42501';
  end if;

  select case_id into v_sumber_case_id
  from public.case_entities
  where id = p_sumber_id and merged_into_entity_id is not null;

  if v_sumber_case_id is null or v_sumber_case_id != p_case_id then
    raise exception 'Entitas tidak dalam keadaan tergabung' using errcode = '22023';
  end if;

  update public.case_entities
  set 
    merged_into_entity_id = null,
    merge_state = 'none'
  where id = p_sumber_id;

  update public.cases set last_activity_at = now() where id = p_case_id;
end;
$$;

revoke all on function public.gabung_entitas(uuid, uuid, uuid) from public;
revoke all on function public.pisahkan_entitas(uuid, uuid) from public;
grant execute on function public.gabung_entitas(uuid, uuid, uuid) to authenticated;
grant execute on function public.pisahkan_entitas(uuid, uuid) to authenticated;


-- ---------------------------------------------------------------------------
-- 2. Case Attachments
-- ---------------------------------------------------------------------------

create type public.attachment_type as enum (
  'chat_screenshot',
  'profile_screenshot',
  'other_evidence'
);

create type public.attachment_processing_status as enum (
  'pending',
  'processing',
  'ready',
  'failed'
);

create table public.case_attachments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  uploaded_by uuid references auth.users (id) on delete set null,
  attachment_type public.attachment_type not null default 'other_evidence',
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null,
  width int,
  height int,
  content_hash text,
  processing_status public.attachment_processing_status not null default 'pending',
  retention_policy text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique (storage_bucket, storage_path)
);

create index case_attachments_per_kasus on public.case_attachments (case_id, created_at desc);

-- Trigger updated_at
create trigger case_attachments_touch_updated_at
  before update on public.case_attachments
  for each row execute function app.touch_updated_at();

-- RLS Attachments Table
alter table public.case_attachments enable row level security;
revoke all on public.case_attachments from anon, authenticated;

grant select on public.case_attachments to authenticated;
-- No update granted directly to client.
-- Insert also forbidden directly, must go through API or function (if needed). But for files,
-- Supabase Storage requires the metadata record. Wait, we usually do a Security Definer function to register attachment.

create policy "attachment terbaca oleh yang berhak atas kasusnya"
  on public.case_attachments for select
  to authenticated
  using (app.bisa_akses_kasus(case_id));


-- Fungsi register attachment
create function public.tambah_lampiran(
  p_case_id uuid,
  p_attachment_type public.attachment_type,
  p_storage_path text,
  p_mime_type text,
  p_size_bytes bigint
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  id_attachment uuid;
begin
  if not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak mengubah kasus ini' using errcode = '42501';
  end if;

  if p_size_bytes <= 0 then
    raise exception 'Ukuran file tidak valid' using errcode = '22023';
  end if;

  insert into public.case_attachments (
    case_id,
    uploaded_by,
    attachment_type,
    storage_bucket,
    storage_path,
    mime_type,
    size_bytes
  )
  values (
    p_case_id,
    id_pengguna,
    p_attachment_type,
    'case-attachments',
    p_storage_path,
    p_mime_type,
    p_size_bytes
  )
  returning id into id_attachment;

  update public.cases set last_activity_at = now() where id = p_case_id;

  return id_attachment;
end;
$$;

revoke all on function public.tambah_lampiran(uuid, public.attachment_type, text, text, bigint) from public;
grant execute on function public.tambah_lampiran(uuid, public.attachment_type, text, text, bigint) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Storage Bucket Configuration
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'case-attachments',
  'case-attachments',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- RLS untuk Bucket Objects
-- Mengamankan bucket private 'case-attachments'.
create policy "object terbaca oleh yang berhak atas kasusnya"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'case-attachments' and 
    exists (
      select 1 from public.case_attachments a
      where a.storage_path = storage.objects.name
        and app.bisa_akses_kasus(a.case_id)
    )
  );

create policy "object dapat diunggah oleh yang berhak atas kasusnya"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'case-attachments' and
    exists (
      select 1 from public.case_attachments a
      where a.storage_path = storage.objects.name
        and app.bisa_ubah_kasus(a.case_id)
    )
  );
