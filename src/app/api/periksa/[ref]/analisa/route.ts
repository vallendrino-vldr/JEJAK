import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bacaFaktaRdap, type FaktaRdap } from "@/lib/periksa/rdap-fakta";
import { analisaDomainTercache } from "@/lib/ai/analis";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

const TAK_TERSEDIA = Response.json(
  { tersedia: false },
  { headers: { "Cache-Control": "no-store" } },
);

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref: rawRef } = await params;
  const ref = rawRef.trim().toUpperCase();
  if (!/^SCN[A-Z0-9]{8,32}$/.test(ref)) return new Response(null, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  // RLS: ref milik user lain tampak seperti tidak ada.
  const { data: scan, error } = await supabase
    .from("scans")
    .select("id,status")
    .eq("public_ref", ref)
    .maybeSingle();

  if (error) return new Response(null, { status: 503 });
  if (!scan) return new Response(null, { status: 404 });
  if (scan.status !== "completed") return TAK_TERSEDIA;

  const { data: runs, error: runsError } = await supabase
    .from("scan_source_runs")
    .select("safe_metadata")
    .eq("scan_id", scan.id);

  if (runsError) return new Response(null, { status: 503 });

  let facts: FaktaRdap | null = null;
  for (const run of runs ?? []) {
    facts = bacaFaktaRdap(run.safe_metadata);
    if (facts) break;
  }
  if (!facts) return TAK_TERSEDIA;

  const analisa = await analisaDomainTercache(ref, facts);
  return Response.json(
    { tersedia: true, ...analisa },
    { headers: { "Cache-Control": "no-store" } },
  );
}
