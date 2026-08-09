-- Evidence Passport, hubungan antar entitas, kontradiksi, dan timeline.
--
-- Pola yang dikunci di sini dan wajib diikuti fitur berikutnya:
--   1. Tidak ada bukti tanpa paspor. Sumber, kelas, waktu, keandalan, dan cara
--      verifikasi ulang bukan kolom opsional — tanpa itu barisnya ditolak.
--   2. Inferensi AI tidak pernah setara fakta. Kelasnya tersimpan di data, jadi
--      UI tidak bisa diam-diam menyetarakannya.
--   3. Hubungan yang diusulkan mesin berhenti di `suggested`. Hanya manusia yang
--      memindahkannya ke `accepted`, dan itu bisa dibatalkan.
--   4. Timeline hanya menerima kejadian yang punya bukti berwaktu. Tidak ada
--      tanggal yang dikarang.
--
-- Referensi blueprint: docs/SCHEMA.md §10-11, docs/PRD.md Evidence Doctrine.

-- ---------------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------------

-- Lima kelas bukti dari Evidence Doctrine. Urutannya bermakna: makin ke bawah
-- makin lemah klaimnya, dan UI harus menghormati urutan itu.
create type public.evidence_class as enum (
  'verified_fact',
  'signal',
  'correlation',
  'ai_inference',
  'user_provided'
);

create type public.evidence_reliability as enum ('high', 'medium', 'low', 'unknown');

create type public.evidence_source_kind as enum (
  'rdap',
  'dns',
  'phone_format',
  'breach_index',
  'public_page',
  'code_host',
  'user_upload',
  'user_note',
  'ai_analysis',
  'internal_correlation'
);

create type public.relationship_type as enum (
  'direct',
  'possible',
  'pattern_similarity',
  'contradiction'
);

create type public.relationship_status as enum ('suggested', 'accepted', 'rejected', 'retracted');

create type public.actor_kind as enum ('user', 'system', 'ai');

-- ---------------------------------------------------------------------------
-- case_evidence — Evidence Passport
-- ---------------------------------------------------------------------------
create table public.case_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  entity_id uuid references public.case_entities (id) on delete set null,

  evidence_class public.evidence_class not null,
  source_kind public.evidence_source_kind not null,
  -- Dari mana persisnya: nama adapter, host, atau berkas. Bukan URL lengkap
  -- halaman supaya kita tidak menyalin internet ke dalam database.
  source_locator text not null,
  reliability public.evidence_reliability not null default 'unknown',

  summary text not null,
  detail jsonb not null default '{}'::jsonb,

  -- Kapan bukti diambil, dan kapan kejadian yang dirujuknya terjadi. Keduanya
  -- berbeda: RDAP yang diambil hari ini bisa menceritakan tahun 2019.
  observed_at timestamptz not null default now(),
  occurred_at timestamptz,

  -- Bisa diperiksa ulang atau tidak. Bukti yang tidak bisa diverifikasi ulang
  -- tetap boleh disimpan, tapi harus jujur mengaku begitu.
  reverifiable boolean not null default false,
  reverify_hint text,

  created_by_kind public.actor_kind not null default 'user',
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint evidence_ringkasan_terisi check (length(btrim(summary)) between 1 and 500),
  constraint evidence_sumber_terisi check (length(btrim(source_locator)) between 1 and 300),
  -- Inferensi AI tidak boleh menyamar sebagai fakta terverifikasi.
  constraint evidence_ai_bukan_fakta check (
    not (created_by_kind = 'ai' and evidence_class = 'verified_fact')
  ),
  -- Bukti yang mengaku bisa diverifikasi ulang harus memberi tahu caranya.
  constraint evidence_reverify_ada_petunjuk check (
    not reverifiable or length(btrim(coalesce(reverify_hint, ''))) > 0
  )
);

create index case_evidence_per_kasus on public.case_evidence (case_id, observed_at desc);
create index case_evidence_per_entitas on public.case_evidence (entity_id) where entity_id is not null;
-- Timeline membaca lewat indeks ini: hanya bukti yang punya waktu kejadian.
create index case_evidence_linimasa on public.case_evidence (case_id, occurred_at)
  where occurred_at is not null;

comment on table public.case_evidence is
  'Evidence Passport. Setiap temuan membawa sumber, kelas, waktu, keandalan, dan cara verifikasi ulangnya.';

-- ---------------------------------------------------------------------------
-- entity_relationships
-- ---------------------------------------------------------------------------
create table public.entity_relationships (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  from_entity_id uuid not null references public.case_entities (id) on delete cascade,
  to_entity_id uuid not null references public.case_entities (id) on delete cascade,

  relationship_type public.relationship_type not null,
  status public.relationship_status not null default 'suggested',
  confidence numeric(3, 2) not null default 0.5,
  directional boolean not null default false,

  -- Bukti yang mendasari hubungan ini. Boleh kosong hanya untuk hubungan yang
  -- dibuat manusia secara sadar, dan itu dijaga constraint di bawah.
  evidence_id uuid references public.case_evidence (id) on delete set null,
  rationale text,

  valid_from timestamptz,
  valid_to timestamptz,

  created_by_kind public.actor_kind not null default 'user',
  created_by uuid references auth.users (id) on delete set null,
  decided_by uuid references auth.users (id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint hubungan_bukan_diri_sendiri check (from_entity_id <> to_entity_id),
  constraint hubungan_confidence_wajar check (confidence >= 0 and confidence <= 1),
  -- Usulan mesin wajib menunjuk bukti. Manusia boleh menghubungkan berdasarkan
  -- penilaiannya sendiri, asalkan alasannya ditulis.
  constraint hubungan_punya_dasar check (
    created_by_kind = 'user' or evidence_id is not null
  ),
  constraint hubungan_manual_punya_alasan check (
    created_by_kind <> 'user'
      or evidence_id is not null
      or length(btrim(coalesce(rationale, ''))) > 0
  ),
  -- Hanya manusia yang boleh menerima atau menolak sebuah hubungan.
  constraint hubungan_keputusan_ada_pemutus check (
    status in ('suggested', 'retracted') or decided_by is not null
  )
);

create unique index hubungan_tanpa_duplikat
  on public.entity_relationships (case_id, from_entity_id, to_entity_id, relationship_type)
  where status <> 'rejected';

create index hubungan_per_kasus on public.entity_relationships (case_id, status);

create trigger case_evidence_touch_updated_at
  before update on public.case_evidence
  for each row execute function app.touch_updated_at();

create trigger entity_relationships_touch_updated_at
  before update on public.entity_relationships
  for each row execute function app.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Operasi.
--
-- Sama seperti Kasus: tidak ada INSERT langsung dari client. Semua invariant
-- Evidence Doctrine dijaga di satu tempat.
-- ---------------------------------------------------------------------------
create function public.catat_bukti(
  p_case_id uuid,
  p_class public.evidence_class,
  p_source_kind public.evidence_source_kind,
  p_source_locator text,
  p_summary text,
  p_entity_id uuid default null,
  p_reliability public.evidence_reliability default 'unknown',
  p_occurred_at timestamptz default null,
  p_reverifiable boolean default false,
  p_reverify_hint text default null,
  p_detail jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  id_bukti uuid;
begin
  if id_pengguna is null or not app.bisa_ubah_kasus(p_case_id) then
    raise exception 'Tidak berhak mengubah kasus ini' using errcode = '42501';
  end if;

  -- Entitas yang dirujuk harus milik kasus yang sama; tanpa ini sebuah bukti
  -- bisa menunjuk petunjuk di kasus orang lain.
  if p_entity_id is not null and not exists (
    select 1 from public.case_entities where id = p_entity_id and case_id = p_case_id
  ) then
    raise exception 'Petunjuk tidak ada di kasus ini' using errcode = '22023';
  end if;

  insert into public.case_evidence (
    case_id, entity_id, evidence_class, source_kind, source_locator, reliability,
    summary, detail, occurred_at, reverifiable, reverify_hint, created_by_kind, created_by
  )
  values (
    p_case_id, p_entity_id, p_class, p_source_kind, btrim(p_source_locator), p_reliability,
    btrim(p_summary), coalesce(p_detail, '{}'::jsonb), p_occurred_at,
    coalesce(p_reverifiable, false), nullif(btrim(coalesce(p_reverify_hint, '')), ''),
    'user', id_pengguna
  )
  returning id into id_bukti;

  update public.cases set last_activity_at = now() where id = p_case_id;

  return id_bukti;
end;
$$;

create function public.putuskan_hubungan(p_relationship_id uuid, p_terima boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  id_kasus uuid;
begin
  select case_id into id_kasus from public.entity_relationships where id = p_relationship_id;

  if id_kasus is null or id_pengguna is null or not app.bisa_ubah_kasus(id_kasus) then
    raise exception 'Tidak berhak memutuskan hubungan ini' using errcode = '42501';
  end if;

  update public.entity_relationships
  set status = case when p_terima then 'accepted' else 'rejected' end,
      decided_by = id_pengguna,
      decided_at = now()
  where id = p_relationship_id;

  update public.cases set last_activity_at = now() where id = id_kasus;
end;
$$;

/**
 * Timeline kasus.
 *
 * Hanya membaca bukti yang punya `occurred_at`. Tidak ada tanggal yang
 * disimpulkan, ditebak, atau diisi dari waktu pengambilan data.
 */
create function public.linimasa_kasus(p_case_id uuid)
returns table (
  evidence_id uuid,
  occurred_at timestamptz,
  evidence_class public.evidence_class,
  summary text,
  source_kind public.evidence_source_kind
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, e.occurred_at, e.evidence_class, e.summary, e.source_kind
  from public.case_evidence e
  where e.case_id = p_case_id
    and e.occurred_at is not null
    and app.bisa_akses_kasus(p_case_id)
  order by e.occurred_at desc;
$$;

revoke all on function public.catat_bukti(
  uuid, public.evidence_class, public.evidence_source_kind, text, text, uuid,
  public.evidence_reliability, timestamptz, boolean, text, jsonb
) from public;
revoke all on function public.putuskan_hubungan(uuid, boolean) from public;
revoke all on function public.linimasa_kasus(uuid) from public;

grant execute on function public.catat_bukti(
  uuid, public.evidence_class, public.evidence_source_kind, text, text, uuid,
  public.evidence_reliability, timestamptz, boolean, text, jsonb
) to authenticated;
grant execute on function public.putuskan_hubungan(uuid, boolean) to authenticated;
grant execute on function public.linimasa_kasus(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.case_evidence enable row level security;
alter table public.entity_relationships enable row level security;

revoke all on public.case_evidence from anon;
revoke all on public.case_evidence from authenticated;
revoke all on public.entity_relationships from anon;
revoke all on public.entity_relationships from authenticated;

-- Daftar kolom disebut eksplisit, bukan grant tabel lalu revoke — lihat DEC-0116.
grant select (
  id, case_id, entity_id, evidence_class, source_kind, source_locator, reliability,
  summary, detail, observed_at, occurred_at, reverifiable, reverify_hint,
  created_by_kind, created_by, created_at, updated_at
) on public.case_evidence to authenticated;

grant select (
  id, case_id, from_entity_id, to_entity_id, relationship_type, status, confidence,
  directional, evidence_id, rationale, valid_from, valid_to, created_by_kind,
  created_by, decided_by, decided_at, created_at, updated_at
) on public.entity_relationships to authenticated;

create policy "bukti terbaca oleh yang berhak atas kasusnya"
  on public.case_evidence for select
  to authenticated
  using (app.bisa_akses_kasus(case_id));

create policy "hubungan terbaca oleh yang berhak atas kasusnya"
  on public.entity_relationships for select
  to authenticated
  using (app.bisa_akses_kasus(case_id));

-- Tidak ada policy INSERT/UPDATE/DELETE untuk client. Penulisan hanya lewat
-- catat_bukti() dan putuskan_hubungan().
