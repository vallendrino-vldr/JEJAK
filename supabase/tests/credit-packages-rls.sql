-- credit_packages: user hanya lihat paket aktif; tidak ada tulis dari client.
-- Satu transaksi, menyentuh data uji sendiri, mengembalikan state.
do $$
declare
  id_user uuid := gen_random_uuid();
  n_aktif int;
  n_terlihat int;
  ditolak boolean;
  kode_uji text := 'uji_nonaktif_' || substr(gen_random_uuid()::text, 1, 8);
begin
  insert into auth.users (id, email) values (id_user, 'uji-paket@contoh.test');

  -- Paket nonaktif untuk uji visibilitas.
  insert into public.credit_packages
    (code, name, price_idr, base_credits, validity_days, active, display_order)
    values (kode_uji, 'Uji Nonaktif', 1000, 1, 30, false, 999);

  execute 'set local role authenticated';
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', id_user, 'role', 'authenticated')::text,
    true
  );

  select count(*) into n_terlihat from public.credit_packages;
  select count(*) into n_aktif from public.credit_packages where active;
  if n_terlihat <> n_aktif then
    raise exception 'GAGAL 1: user melihat paket nonaktif (terlihat=% aktif=%)', n_terlihat, n_aktif;
  end if;
  if n_aktif < 4 then
    raise exception 'GAGAL 2: paket seed aktif tidak terlihat user (aktif=%)', n_aktif;
  end if;

  -- Client tidak boleh menulis (tidak ada policy insert; tidak ada grant).
  ditolak := false;
  begin
    insert into public.credit_packages (code, name, price_idr, base_credits, validity_days)
      values ('hack_' || substr(id_user::text, 1, 6), 'Hack', 0, 999, 30);
  exception
    when insufficient_privilege then ditolak := true;
  end;
  execute 'reset role';
  if not ditolak then
    raise exception 'GAGAL 3: client bisa menulis credit_packages';
  end if;

  delete from public.credit_packages where code = kode_uji;
  delete from auth.users where id = id_user;
  raise notice 'CREDIT PACKAGES RLS LULUS';
end $$;
