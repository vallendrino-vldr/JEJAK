-- REVOKE default privilege dengan IN SCHEMA tidak dapat membatalkan grant
-- global. Project lama sudah menjalankan hardening per-schema, jadi tutup juga
-- default global role postgres agar function/table/sequence berikutnya lahir
-- fail-closed di schema mana pun.

alter default privileges for role postgres
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres
  revoke all on functions from public, anon, authenticated;

-- Tetap balik grant per-schema bawaan Supabase bila project membawanya.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated;
