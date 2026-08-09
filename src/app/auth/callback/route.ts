import { NextResponse, type NextRequest } from "next/server";
import { tujuanAman } from "@/lib/auth/tujuan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { asalKanonik } from "@/lib/url/origin";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");

  const origin = await asalKanonik();
  const lanjut = tujuanAman(searchParams.get("lanjut"));

  if (!code) {
    return NextResponse.redirect(`${origin}/masuk?galat=JX-2002`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(
    code,
    flowId ? { flowId } : undefined,
  );

  if (error) {
    return NextResponse.redirect(`${origin}/masuk?galat=JX-2003`);
  }

  return NextResponse.redirect(`${origin}${lanjut}`);
}
