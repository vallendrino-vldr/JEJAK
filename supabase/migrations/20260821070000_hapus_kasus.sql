-- Hapus kasus (soft delete ke sampah, reversibel ~3 hari) — hanya pemilik kasus.
create or replace function public.hapus_kasus(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
begin
  if id_pengguna is null or not exists (
    select 1 from public.cases
    where id = p_case_id and owner_user_id = id_pengguna and deleted_at is null
  ) then
    raise exception 'Tidak berhak menghapus kasus ini' using errcode = '42501';
  end if;

  update public.cases
  set status = 'trashed',
      deleted_at = now(),
      trash_expires_at = now() + interval '3 days'
  where id = p_case_id;
end;
$$;

revoke all on function public.hapus_kasus(uuid) from public;
grant execute on function public.hapus_kasus(uuid) to authenticated;
