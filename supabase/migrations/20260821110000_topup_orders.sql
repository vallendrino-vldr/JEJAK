-- Phase 9 (Top-up) slice C — Top-up Orders. SCHEMA §29-30.
-- Order menyimpan snapshot paket + rekening (nomor didekripsi ke snapshot agar
-- user tahu tujuan transfer) + jumlah unik anti-ambigu. TIDAK ada grant kredit di
-- sini — kredit baru masuk saat approval (slice F). Idempotent per key.

create type public.topup_order_status as enum (
  'awaiting_proof', 'proof_submitted', 'under_review', 'needs_new_proof',
  'approved', 'rejected', 'expired', 'cancelled'
);

create table public.topup_orders (
  id uuid primary key default gen_random_uuid(),
  public_ref text unique not null,
  user_id uuid not null references auth.users (id) on delete cascade,
  package_id uuid references public.credit_packages (id) on delete set null,
  package_snapshot jsonb not null,
  base_amount_idr int not null,
  unique_code_amount int not null,
  expected_amount_idr int not null,
  confirmed_amount_idr int,
  credits_base int not null,
  credits_bonus int not null default 0,
  status public.topup_order_status not null default 'awaiting_proof',
  payment_method_id uuid references public.payment_methods (id) on delete set null,
  payment_method_snapshot jsonb not null,
  campaign_id uuid,
  referral_attribution_id uuid,
  proof_due_at timestamptz,
  submitted_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references auth.users (id) on delete set null,
  rejected_at timestamptz,
  rejected_by uuid references auth.users (id) on delete set null,
  rejection_reason text,
  settlement_transaction_id uuid unique references public.credit_transactions (id) on delete set null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint topup_orders_amounts_valid check (
    base_amount_idr >= 0 and unique_code_amount >= 0
    and expected_amount_idr = base_amount_idr + unique_code_amount
    and credits_base >= 0 and credits_bonus >= 0
    and (confirmed_amount_idr is null or confirmed_amount_idr >= 0)
  )
);

create trigger topup_orders_touch_updated_at
  before update on public.topup_orders
  for each row execute function app.touch_updated_at();

-- Jumlah unik tidak boleh dobel di antara order yang masih menunggu rekonsiliasi.
create unique index topup_orders_active_amount_unique
  on public.topup_orders (expected_amount_idr)
  where status in ('awaiting_proof', 'proof_submitted', 'under_review', 'needs_new_proof');

create index topup_orders_user_created on public.topup_orders (user_id, created_at desc);

-- RLS: user baca order miliknya sendiri (termasuk snapshot rekening tujuan).
-- Tulis hanya lewat fungsi DEFINER.
alter table public.topup_orders enable row level security;
revoke all on public.topup_orders from anon, authenticated;
grant select on public.topup_orders to authenticated;
create policy topup_orders_select_owner on public.topup_orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy topup_orders_admin_all on public.topup_orders
  for all to service_role using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Buat order top-up. Snapshot paket + rekening primer (didekripsi), jumlah unik,
-- idempotent per key. Return public_ref.
-- ---------------------------------------------------------------------------
create function public.buat_order_topup(p_package_code text, p_idempotency_key text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_pkg record;
  v_method record;
  v_acct text;
  v_holder text;
  v_snapshot_method jsonb;
  v_ref text;
  v_code int;
  v_expected int;
  v_existing text;
  v_attempt int := 0;
begin
  if v_uid is null then raise exception 'Harus login' using errcode = '42501'; end if;
  if length(btrim(coalesce(p_idempotency_key, ''))) = 0 then
    raise exception 'Idempotency key tidak valid' using errcode = '22023';
  end if;

  select public_ref into v_existing from public.topup_orders
    where idempotency_key = p_idempotency_key and user_id = v_uid;
  if found then return v_existing; end if;

  select * into v_pkg from public.credit_packages where code = p_package_code and active;
  if not found then raise exception 'Paket tidak ditemukan' using errcode = '22023'; end if;

  select * into v_method from public.payment_methods
    where is_primary and is_active and retired_at is null limit 1;
  if not found then raise exception 'Belum ada rekening pembayaran aktif' using errcode = '55000'; end if;

  v_acct := extensions.pgp_sym_decrypt(v_method.account_number_ciphertext, app.kunci('jejak_identifier_enc'));
  v_holder := extensions.pgp_sym_decrypt(v_method.account_holder_name_ciphertext, app.kunci('jejak_identifier_enc'));
  v_snapshot_method := jsonb_build_object(
    'code', v_method.code, 'display_name', v_method.display_name, 'method_type', v_method.method_type,
    'institution_name', v_method.institution_name, 'account_number', v_acct,
    'account_holder_name', v_holder, 'instructions', v_method.instructions, 'version', v_method.version
  );

  loop
    v_attempt := v_attempt + 1;
    v_code := 1 + floor(random() * 999)::int;
    v_expected := v_pkg.price_idr + v_code;
    v_ref := 'TOP' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 9));
    begin
      insert into public.topup_orders (
        public_ref, user_id, package_id, package_snapshot, base_amount_idr, unique_code_amount,
        expected_amount_idr, credits_base, credits_bonus, status, payment_method_id,
        payment_method_snapshot, proof_due_at, idempotency_key
      ) values (
        v_ref, v_uid, v_pkg.id,
        jsonb_build_object('code', v_pkg.code, 'name', v_pkg.name, 'price_idr', v_pkg.price_idr,
          'base_credits', v_pkg.base_credits, 'bonus_credits', v_pkg.bonus_credits,
          'validity_days', v_pkg.validity_days, 'grace_days', v_pkg.grace_days, 'version', v_pkg.version),
        v_pkg.price_idr, v_code, v_expected, v_pkg.base_credits, v_pkg.bonus_credits,
        'awaiting_proof', v_method.id, v_snapshot_method, now() + interval '24 hours', p_idempotency_key
      );
      return v_ref;
    exception when unique_violation then
      -- Race idempotensi: order dgn key ini sudah dibuat concurrent → kembalikan.
      select public_ref into v_existing from public.topup_orders
        where idempotency_key = p_idempotency_key and user_id = v_uid;
      if found then return v_existing; end if;
      if v_attempt >= 20 then
        raise exception 'Gagal mengalokasikan jumlah unik' using errcode = '55000';
      end if;
      -- selain itu: bentrok jumlah/ref → ulangi loop.
    end;
  end loop;
end;
$$;

revoke all on function public.buat_order_topup(text, text) from public;
grant execute on function public.buat_order_topup(text, text) to authenticated;
