-- Phase 9 (Top-up) slice D — Payment Proofs. SCHEMA §31.
-- Bukti transfer (screenshot) untuk sebuah order. Bucket privat `payment-proofs`
-- sudah dibuat di Phase 3. Baris ini menyimpan metadata + path; file diunggah
-- lewat server (slice UI). submit_proof memindahkan order ke proof_submitted.

create type public.payment_proof_status as enum (
  'uploaded', 'processing', 'ready', 'invalid', 'pending_cleanup', 'deleted'
);

create table public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  topup_order_id uuid not null references public.topup_orders (id) on delete cascade,
  uploaded_by uuid references auth.users (id) on delete set null,
  storage_bucket text not null default 'payment-proofs',
  storage_path text not null,
  content_hash text,
  perceptual_hash text,
  mime_type text not null,
  original_size_bytes int,
  stored_size_bytes int,
  status public.payment_proof_status not null default 'ready',
  created_at timestamptz not null default now(),
  delete_after timestamptz,
  deleted_at timestamptz,
  constraint payment_proofs_mime_allowed check (mime_type in ('image/jpeg', 'image/png', 'image/webp'))
);

create index payment_proofs_order on public.payment_proofs (topup_order_id, created_at desc);
create index payment_proofs_content_hash on public.payment_proofs (content_hash) where content_hash is not null;

-- RLS: user lihat bukti miliknya; tulis lewat DEFINER. Isi file tetap di bucket
-- privat (akses lewat signed URL server), baris ini cuma metadata.
alter table public.payment_proofs enable row level security;
revoke all on public.payment_proofs from anon, authenticated;
grant select on public.payment_proofs to authenticated;
create policy payment_proofs_select_owner on public.payment_proofs
  for select to authenticated using (uploaded_by = (select auth.uid()));
create policy payment_proofs_admin_all on public.payment_proofs
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- User submit bukti untuk ordernya. Order harus miliknya & masih menunggu bukti.
-- ---------------------------------------------------------------------------
create function public.submit_proof(
  p_order_ref text,
  p_storage_path text,
  p_content_hash text,
  p_mime_type text,
  p_original_size int,
  p_stored_size int
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_order record;
  v_proof_id uuid;
begin
  if v_uid is null then raise exception 'Harus login' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_storage_path, ''))) = 0 then
    raise exception 'Path bukti tidak valid' using errcode = '22023';
  end if;
  if p_mime_type not in ('image/jpeg', 'image/png', 'image/webp') then
    raise exception 'Jenis berkas tidak didukung' using errcode = '22023';
  end if;

  select * into v_order from public.topup_orders
    where public_ref = p_order_ref and user_id = v_uid
    for update;
  if not found then raise exception 'Order tidak ditemukan' using errcode = 'P0002'; end if;
  if v_order.status not in ('awaiting_proof', 'needs_new_proof') then
    raise exception 'Order tidak sedang menunggu bukti' using errcode = '55000';
  end if;

  insert into public.payment_proofs (
    topup_order_id, uploaded_by, storage_path, content_hash, mime_type,
    original_size_bytes, stored_size_bytes, status
  ) values (
    v_order.id, v_uid, p_storage_path, nullif(btrim(coalesce(p_content_hash, '')), ''),
    p_mime_type, p_original_size, p_stored_size, 'ready'
  )
  returning id into v_proof_id;

  update public.topup_orders
    set status = 'proof_submitted', submitted_at = now()
    where id = v_order.id;

  return v_proof_id;
end;
$$;

revoke all on function public.submit_proof(text, text, text, text, int, int) from public;
grant execute on function public.submit_proof(text, text, text, text, int, int) to authenticated;
