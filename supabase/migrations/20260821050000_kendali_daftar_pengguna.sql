-- Ruang Kendali — daftar pengguna (owner/users.view_basic, read-only, email termasker).
create or replace function public.daftar_pengguna_kendali()
returns table (
  id uuid,
  nama text,
  email_masked text,
  status text,
  peran text[],
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
    p.created_at
  from public.profiles p
  where p.deleted_at is null
    and (app.is_owner() or app.current_user_has_permission('users.view_basic'))
  order by p.created_at desc
  limit 100;
$$;

revoke all on function public.daftar_pengguna_kendali() from public;
grant execute on function public.daftar_pengguna_kendali() to authenticated;
