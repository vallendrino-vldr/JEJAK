import { publicBuildInfo } from "@/lib/version";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json(publicBuildInfo, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
