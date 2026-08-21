-- Project lama pernah membuat RPC SECURITY DEFINER saat default privilege
-- memberi EXECUTE langsung ke anon/authenticated. Cabut semua grant warisan,
-- lalu buka kembali hanya boundary produk yang memang memeriksa auth.uid().

revoke all on function public.buat_kasus(text, public.case_purpose, boolean)
  from public, anon, authenticated;
grant execute on function public.buat_kasus(text, public.case_purpose, boolean)
  to authenticated;

revoke all on function public.tambah_petunjuk(uuid, public.entity_type, text, text)
  from public, anon, authenticated;
grant execute on function public.tambah_petunjuk(uuid, public.entity_type, text, text)
  to authenticated;

revoke all on function public.catat_bukti(
  uuid, public.evidence_class, public.evidence_source_kind, text, text, uuid,
  public.evidence_reliability, timestamptz, boolean, text, jsonb
) from public, anon, authenticated;
grant execute on function public.catat_bukti(
  uuid, public.evidence_class, public.evidence_source_kind, text, text, uuid,
  public.evidence_reliability, timestamptz, boolean, text, jsonb
) to authenticated;

revoke all on function public.putuskan_hubungan(uuid, boolean)
  from public, anon, authenticated;
grant execute on function public.putuskan_hubungan(uuid, boolean)
  to authenticated;

revoke all on function public.linimasa_kasus(uuid)
  from public, anon, authenticated;
grant execute on function public.linimasa_kasus(uuid)
  to authenticated;

revoke all on function public.gabung_entitas(uuid, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.gabung_entitas(uuid, uuid, uuid)
  to authenticated;

revoke all on function public.pisahkan_entitas(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.pisahkan_entitas(uuid, uuid)
  to authenticated;

revoke all on function public.tambah_lampiran(
  uuid, public.attachment_type, text, text, bigint
) from public, anon, authenticated;
grant execute on function public.tambah_lampiran(
  uuid, public.attachment_type, text, text, bigint
) to authenticated;

-- Event-trigger helper ini tidak pernah menjadi endpoint produk.
-- Helper tersebut ada di project lama, tetapi bukan object yang dijamin hadir
-- pada setiap project Supabase/fresh replay.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;
