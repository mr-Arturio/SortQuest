import { NextRequest } from "next/server";
import { createSessionClaims, signSession } from "@/src/lib/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const payload: string = String(body.payload || "");
    if (!payload.startsWith("BINTAG:")) {
      return new Response("invalid payload", { status: 400 });
    }
    const parts = payload.split(":");
    if (parts.length < 3) return new Response("bad tag", { status: 400 });

    const teamId = parts[1];
    const binId = parts[2];
    const lat = typeof body.lat === "number" ? body.lat : undefined;
    const lng = typeof body.lng === "number" ? body.lng : undefined;

    const claims = createSessionClaims({
      teamId,
      binId,
      lat,
      lng,
      ttlMs: 5 * 60 * 1000,
    });
    const token = signSession(claims);

    return Response.json({
      token,
      expiresAt: new Date(claims.exp).toISOString(),
    });
  } catch (e) {
    return new Response("server error", { status: 500 });
  }
}
