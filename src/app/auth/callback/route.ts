import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");

  const lanjutMentah = searchParams.get("lanjut") ?? "/beranda";
  const lanjut =
    lanjutMentah.startsWith("/") && !lanjutMentah.startsWith("//") ? lanjutMentah : "/beranda";

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
