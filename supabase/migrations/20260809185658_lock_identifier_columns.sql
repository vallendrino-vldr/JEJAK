-- Menutup ciphertext dan blind index identifier dari client.
--
-- Migration sebelumnya memberi SELECT tingkat tabel lalu mencabutnya per kolom.
-- Di Postgres itu tidak berlaku: hak tingkat tabel mencakup semua kolom dan
-- tidak bisa dikurangi oleh REVOKE per kolom. Satu-satunya cara adalah tidak
-- pernah memberi hak tingkat tabel, lalu menyebutkan kolom yang boleh dibaca.
--
-- Ditemukan oleh supabase/tests/case-isolation.sql (GAGAL 16).

revoke select on public.case_entities from authenticated;

grant select (
  id,
  case_id,
  entity_type,
  label,
  display_value_masked,
  country_code,
  platform,
  first_observed_at,
  last_observed_at,
  ownership_state,
  created_by,
  created_at,
  updated_at,
  merged_into_entity_id,
  merge_state
) on public.case_entities to authenticated;
