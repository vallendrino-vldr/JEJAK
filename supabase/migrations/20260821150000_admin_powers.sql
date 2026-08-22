-- Phase 10 slice — Admin super-power: kelola status pengguna, grant kredit ke
-- user, kelola paket. Semua DEFINER + cek izin sendiri. Owner dilindungi.

-- 1. Ubah status akun. Owner-only; tidak bisa menyentuh owner lain.
create function public.ubah_status_pengguna(p_user_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target_owner boolean;
begin
  if not app.is_owner() then
    raise exception 'Hanya owner yang boleh mengubah status akun' using errcode = '42501';
  end if;
  if p_status not in ('active', 'observed', 'limited', 'paused', 'blocked') then
    raise exception 'Status tidak valid' using errcode = '22023';
  end if;
  select exists (
    select 1 from public.user_roles ur join public.roles r on r.id = ur.role_id
    where ur.user_id = p_user_id and r.code = 'owner' and ur.status = 'active'
  ) into v_target_owner;
  if v_target_owner then
    raise exception 'Tidak bisa mengubah status owner' using errcode = '42501';
  end if;
  update public.profiles set account_status = p_status::public.account_status
    where id = p_user_id and deleted_at is null;
  if not found then raise exception 'Pengguna tidak ditemukan' using errcode = 'P0002'; end if;
end;
$$;

revoke all on function public.ubah_status_pengguna(uuid, text) from public;
grant execute on function public.ubah_status_pengguna(uuid, text) to authenticated;

-- 2. Grant kredit ke user (butuh credits.grant). Idempotent per key.
create function public.beri_kredit_pengguna(
  p_user_id uuid,
  p_credits int,
  p_reason text,
  p_idempotency_key text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_wallet_id uuid;
  v_tx uuid;
begin
  if not (app.is_owner() or app.current_user_has_permission('credits.grant')) then
    raise exception 'Tidak berwenang memberi kredit' using errcode = '42501';
  end if;
  if p_credits <= 0 or p_credits > 100000 then
    raise exception 'Jumlah kredit tidak valid' using errcode = '22023';
  end if;
  select id into v_wallet_id from public.credit_wallets where user_id = p_user_id;
  if not found then raise exception 'Dompet pengguna tidak ada' using errcode = 'P0002'; end if;
  v_tx := public.grant_credits(
    v_wallet_id, p_credits, 0, 'admin_grant'::public.origin_type, 'admin_grant',
    now() + interval '365 days',
    coalesce(nullif(btrim(coalesce(p_reason, '')), ''), 'admin grant'),
    p_idempotency_key
  );
  return v_tx;
end;
$$;

revoke all on function public.beri_kredit_pengguna(uuid, int, text, text) from public;
grant execute on function public.beri_kredit_pengguna(uuid, int, text, text) to authenticated;

-- 3. Kelola paket (butuh business.manage_pricing). Upsert by code.
create function public.simpan_paket(
  p_code text,
  p_name text,
  p_price_idr int,
  p_base_credits int,
  p_bonus_credits int,
  p_validity_days int,
  p_active boolean,
  p_badge_text text,
  p_display_order int
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if not (app.is_owner() or app.current_user_has_permission('business.manage_pricing')) then
    raise exception 'Tidak berwenang mengubah paket' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_code, ''))) = 0 or length(btrim(coalesce(p_name, ''))) = 0 then
    raise exception 'Kode dan nama paket wajib diisi' using errcode = '22023';
  end if;
  insert into public.credit_packages (
    code, name, price_idr, base_credits, bonus_credits, validity_days,
    active, badge_text, display_order, updated_by
  ) values (
    p_code, p_name, greatest(p_price_idr, 0), greatest(p_base_credits, 0),
    greatest(p_bonus_credits, 0), greatest(p_validity_days, 1), coalesce(p_active, true),
    nullif(btrim(coalesce(p_badge_text, '')), ''), coalesce(p_display_order, 0), v_uid
  )
  on conflict (code) do update set
    name = excluded.name, price_idr = excluded.price_idr, base_credits = excluded.base_credits,
    bonus_credits = excluded.bonus_credits, validity_days = excluded.validity_days,
    active = excluded.active, badge_text = excluded.badge_text,
    display_order = excluded.display_order, updated_by = v_uid,
    version = public.credit_packages.version + 1
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.simpan_paket(text, text, int, int, int, int, boolean, text, int) from public;
grant execute on function public.simpan_paket(text, text, int, int, int, int, boolean, text, int) to authenticated;

-- 4. daftar_pengguna_kendali + saldo dompet (drop+recreate; signature sama).
drop function if exists public.daftar_pengguna_kendali();
create function public.daftar_pengguna_kendali()
returns table (
  id uuid,
  nama text,
  email_masked text,
  status text,
  peran text[],
  saldo int,
  bergabung timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.id,
    p.display_name,
    left(split_part(p.email, '@', 1), 1) || '***@' || split_part(p.email, '@', 2),
    p.account_status::text,
    coalesce(
      (select array_agg(r.code order by r.code)
         from public.user_roles ur join public.roles r on r.id = ur.role_id
        where ur.user_id = p.id and ur.status = 'active'),
      '{}'
    ),
    coalesce((select w.available_cached from public.credit_wallets w where w.user_id = p.id), 0),
    p.created_at
  from public.profiles p
  where p.deleted_at is null
    and (app.is_owner() or app.current_user_has_permission('users.view_basic'))
  order by p.created_at desc
  limit 100;
$$;

revoke all on function public.daftar_pengguna_kendali() from public;
grant execute on function public.daftar_pengguna_kendali() to authenticated;
