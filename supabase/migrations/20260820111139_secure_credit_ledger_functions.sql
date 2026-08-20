-- P0 hardening: fungsi ledger SECURITY DEFINER tidak boleh mewarisi hak
-- EXECUTE bawaan untuk PUBLIC. Tanpa revoke eksplisit, anon/authenticated dapat
-- memanggil mutasi saldo langsung dan melewati RLS tabel.

-- Project lama membawa default privilege Data API yang permisif. Tutup default
-- untuk semua object public yang dibuat sesudah migration ini; akses client
-- harus selalu dibuka eksplisit setelah RLS/policy siap.
alter default privileges for role postgres
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres
  revoke all on functions from public, anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on sequences from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke all on functions from public, anon, authenticated;

revoke all on function public.grant_credits(
  uuid, integer, integer, public.origin_type, text, timestamptz, text, text
) from public, anon, authenticated;

revoke all on function public.reserve_scan_credits(
  uuid, uuid, uuid, text
) from public, anon, authenticated;

revoke all on function public.settle_scan_credits(
  uuid, integer, text
) from public, anon, authenticated;

revoke all on function public.release_scan_credits(
  uuid, text
) from public, anon, authenticated;

-- Empat operasi ini hanya boleh dipanggil workflow server/internal. Boundary
-- user untuk memulai scan dibuat sebagai RPC terpisah yang memeriksa auth.uid().
grant execute on function public.grant_credits(
  uuid, integer, integer, public.origin_type, text, timestamptz, text, text
) to service_role;

grant execute on function public.reserve_scan_credits(
  uuid, uuid, uuid, text
) to service_role;

grant execute on function public.settle_scan_credits(
  uuid, integer, text
) to service_role;

grant execute on function public.release_scan_credits(
  uuid, text
) to service_role;

-- Trigger functions tidak membutuhkan hak panggil dari Data API.
revoke all on function public.handle_new_user_wallet() from public, anon, authenticated;
revoke all on function app.handle_new_auth_user() from public, anon, authenticated;

-- Pertahanan untuk migration berikutnya: fungsi baru di schema public harus
-- mendapat GRANT eksplisit, bukan otomatis terbuka ke role Data API.
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
