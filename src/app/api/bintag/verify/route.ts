import { NextRequest } from "next/server";
import { signSessionJwt } from "@/lib/jwt";
import { getFirestore } from "firebase-admin/firestore";
import { getApp, initializeApp, applicationDefault } from "firebase-admin/app";

export const runtime = "nodejs";

function db() {
  try {
    return getFirestore(getApp());
  } catch {
    return getFirestore(initializeApp({ credential: applicationDefault() }));
  }
}

export async function POST(req: NextRequest) {
  try {
    const { payload, lat, lng } = await req.json();

    if (!payload || !payload.startsWith("BINTAG:")) {
      return Response.json({ error: "Invalid QR payload" }, { status: 400 });
    }

    const parts = payload.split(":");
    if (parts.length < 3) {
      return Response.json({ error: "Invalid QR format" }, { status: 400 });
    }

    const [, teamId, binId] = parts;

    // Verify bin exists and is active
    const binRef = db().doc(`bins/${binId}`);
    const binSnap = await binRef.get();

    if (!binSnap.exists) {
      return Response.json({ error: "Bin not found" }, { status: 404 });
    }

    const binData = binSnap.data()!;
    if (binData.teamId !== teamId) {
      return Response.json(
        { error: "Bin not associated with team" },
        { status: 403 }
      );
    }

    // Create session
    const sessionId = `sess_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const remainingAllowance = 10; // Max scans per session

    await db()
      .collection("sessions")
      .doc(sessionId)
      .set({
        uid: "anonymous", // TODO: Use actual user ID when auth is implemented
        teamId,
        binId,
        createdAt: new Date(),
        expiresAt,
        remainingAllowance,
        scansCount: 0,
        closed: false,
        location: lat && lng ? { lat, lng } : null,
      });

    // Generate JWT token
    const token = signSessionJwt({
      uid: "anonymous",
      sessionId,
      expSec: 300, // 5 minutes
    });

    return Response.json({
      token,
      expiresAt: expiresAt.toISOString(),
      remainingAllowance,
    });
  } catch (error) {
    console.error("BinTag verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
