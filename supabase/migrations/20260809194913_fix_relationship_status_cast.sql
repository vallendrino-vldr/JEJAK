-- Menerima atau menolak hubungan selalu gagal.
--
-- `case when ... then 'accepted' else 'rejected' end` menghasilkan text, dan
-- Postgres tidak diam-diam mengubahnya menjadi enum saat dipakai di UPDATE.
-- Akibatnya setiap keputusan manusia atas sebuah hubungan ditolak database.
--
-- Ditemukan oleh supabase/tests/evidence-doctrine.sql (GAGAL 7).

create or replace function public.putuskan_hubungan(p_relationship_id uuid, p_terima boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  id_pengguna uuid := (select auth.uid());
  id_kasus uuid;
  status_baru public.relationship_status;
begin
  select case_id into id_kasus from public.entity_relationships where id = p_relationship_id;

  if id_kasus is null or id_pengguna is null or not app.bisa_ubah_kasus(id_kasus) then
    raise exception 'Tidak berhak memutuskan hubungan ini' using errcode = '42501';
  end if;

  status_baru := case when p_terima then 'accepted' else 'rejected' end;

  update public.entity_relationships
  set status = status_baru,
      decided_by = id_pengguna,
      decided_at = now()
  where id = p_relationship_id;

  update public.cases set last_activity_at = now() where id = id_kasus;
end;
$$;
