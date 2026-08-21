-- Sampah kasus: lihat & pulihkan kasus yang dibuang (pemilik saja).
-- Kasus trashed punya deleted_at terisi, jadi RLS biasa menyembunyikannya;
-- fungsi definer ini yang membukanya khusus untuk pemiliknya.
create or replace function public.daftar_sampah_kasus()
returns table (id uuid, public_ref text, title text, dihapus timestamptz, kedaluwarsa timestamptz)
language sql stable security definer set search_path = '' as $$
  select c.id, c.public_ref, c.title, c.deleted_at, c.trash_expires_at
  from public.cases c
  where c.owner_user_id = (select auth.uid()) and c.status = 'trashed'
  order by c.deleted_at desc;
$$;
revoke all on function public.daftar_sampah_kasus() from public;
grant execute on function public.daftar_sampah_kasus() to authenticated;

create or replace function public.pulihkan_kasus(p_case_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.cases
    where id = p_case_id and owner_user_id = (select auth.uid()) and status = 'trashed'
  ) then
    raise exception 'Tidak berhak memulihkan kasus ini' using errcode = '42501';
  end if;
  update public.cases set status = 'active', deleted_at = null, trash_expires_at = null
  where id = p_case_id;
end $$;
revoke all on function public.pulihkan_kasus(uuid) from public;
grant execute on function public.pulihkan_kasus(uuid) to authenticated;
