import { createSupabaseServerClient } from "@/lib/supabase/server";
import { dispatchScan } from "@/lib/scan/dispatch";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
  const { ref: rawRef } = await params;
  const ref = rawRef.trim().toUpperCase();
  if (!/^SCN[A-Z0-9]{8,32}$/.test(ref)) return new Response(null, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  // RLS memastikan ref milik orang lain tetap terlihat seperti tidak ada.
  const { data: scan, error } = await supabase
    .from("scans")
    .select("id,status")
    .eq("public_ref", ref)
    .maybeSingle();

  if (error) return new Response(null, { status: 503 });
  if (!scan) return new Response(null, { status: 404 });
  if (scan.status !== "requested") {
    return Response.json(
      { state: "already_running" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const state = await dispatchScan(scan.id);
  return Response.json(
    { state },
    {
      status: state === "unavailable" ? 503 : 202,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
