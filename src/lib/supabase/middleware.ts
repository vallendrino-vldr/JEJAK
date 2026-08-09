import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getClientEnv } from "@/lib/env/client";
import { opsiCookieSupabase } from "./cookies";

/**
 * Halaman yang boleh dibuka tanpa login.
 *
 * `/api/version` ikut publik karena Version Sentinel harus bisa menanyakan versi
 * aplikasi bahkan saat pengguna belum login. Isinya hanya nomor versi dan build
 * id, tidak ada data pengguna.
 */
const RUTE_PUBLIK = ["/", "/masuk", "/auth", "/api/version"];

function rutePublik(pathname: string) {
  return RUTE_PUBLIK.some((rute) => pathname === rute || pathname.startsWith(`${rute}/`));
}

/**
 * Menyegarkan session di setiap request dan menutup rute privat untuk tamu.
 *
 * Ini lapisan kenyamanan, bukan batas keamanan: otorisasi sebenarnya tetap
 * dijaga RLS di database.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getClientEnv();

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: opsiCookieSupabase,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    },
  );

  // Jangan sisipkan kode apa pun antara createServerClient dan getClaims:
  // urutannya menentukan apakah cookie session sempat disegarkan.
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims && !rutePublik(request.nextUrl.pathname)) {
    const tujuan = request.nextUrl.clone();
    tujuan.pathname = "/masuk";
    tujuan.searchParams.set("lanjut", request.nextUrl.pathname);
    return NextResponse.redirect(tujuan);
  }

  return response;
}
