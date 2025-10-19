// src/app/api/scan/recognize/route.ts
export const runtime = "nodejs";

import { verifySessionJwt } from "@/lib/jwt";
import { awardPoints } from "@/lib/points";
import { getTip } from "@/lib/rules";
import { getFirestore } from "firebase-admin/firestore";
import { getApp, initializeApp, applicationDefault } from "firebase-admin/app";

type NovaJson = {
  item: string;
  material:
    | "plastic"
    | "paper"
    | "metal"
    | "glass"
    | "organic"
    | "ewaste"
    | "hazard"
    | "unknown";
  recyclable: boolean;
  confidence: number;
  binSuggested:
    | "recycle"
    | "trash"
    | "compost"
    | "ewaste"
    | "hazard"
    | "unknown";
  reasons?: string;
};

export async function POST(req: Request) {
  // ---- parse inputs ----
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const file = form.get("frame") as File | null;
  if (!token || !file) return new Response("bad request", { status: 400 });

  // ---- verify session/token (replace stub) ----
  const session = await verifySessionToken(token); // { ok, uid, sessionId }
  if (!session.ok) return new Response("expired", { status: 410 });

  // ---- safety: avoid sending huge frames ----
  if (file.size > 1_000_000) {
    // client should send ~320–640px JPEG @ 0.6–0.75
    return json502("frame_too_large", "Please reduce frame size/quality.");
  }

  const jpeg = new Uint8Array(await file.arrayBuffer());
  const b64 = Buffer.from(jpeg).toString("base64");

  // ---- Bedrock Nova call (Bearer API key mode) ----
  const region = process.env.AWS_REGION || "us-east-1";
  const modelId =
    process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0";
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(
    modelId
  )}/invoke`;

  const prompt = `You are a recycling vision expert.
- Ignore people, pets, hands, faces, background scenes.
- Identify ONE dominant physical item the user is showing (e.g., "aluminum soda can", "PET water bottle").
- Classify material: plastic|paper|metal|glass|organic|ewaste|hazard|unknown.
- Decide recyclable true/false (general, not city-specific).
- Suggest bin: recycle|trash|compost|ewaste|hazard|unknown.
Return STRICT JSON ONLY, no code fences, matching exactly:
{"item":"","material":"","recyclable":true,"confidence":0.0,"binSuggested":"","reasons":""}`;

  const body = {
    messages: [
      {
        role: "user",
        content: [
          { text: prompt },
          { image: { format: "jpeg", source: { bytes: b64 } } },
        ],
      },
    ],
    inferenceConfig: { temperature: 0.2, maxTokens: 300 },
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      Authorization: `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`,
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errTxt = await r.text().catch(() => "");
    return json502("bedrock_error", errTxt || `HTTP ${r.status}`);
  }

  // ---- parse model output ----
  const resp = await r.json();
  const text =
    resp?.output_text ??
    resp?.output?.message?.content?.find((p: any) => p?.text)?.text ??
    "";

  const parsed = parseNovaJson(text);
  if (!parsed) {
    return json502("parse_error", "Model did not return valid JSON.");
  }

  // ---- apply confidence & normalization ----
  const confidence = clamp01(parsed.confidence ?? 0);
  let recyclable = !!parsed.recyclable && confidence >= 0.35; // small guard
  let bin: "recycle" | "trash" | "compost" | "ewaste" | "hazard" | "unknown" =
    parsed.binSuggested || "unknown";
  let material = parsed.material || "unknown";

  // ---- local rule override hook (stub now, data later) ----
  ({ recyclable, bin } = applyLocalRules({
    recyclable,
    bin,
    material,
    item: parsed.item,
  }));

  const tip = getTip(material, bin);

  // ---- award points (server-side; wire to Firestore/CF) ----
  const { points } = await awardPoints({
    uid: session.uid!,
    sessionId: session.sessionId!,
    recyclable,
  });

  return Response.json({ recyclable, bin, tip, confidence, points });
}

/* ---------------- helpers ---------------- */

function parseNovaJson(s: string): NovaJson | null {
  try {
    // Strip code fences if present
    const withoutFences = s.replace(/^```[\s\S]*?\n?|\n?```$/g, "");
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start < 0 || end < 0) return null;
    const obj = JSON.parse(withoutFences.slice(start, end + 1));
    return obj as NovaJson;
  } catch {
    return null;
  }
}

function applyLocalRules(input: {
  recyclable: boolean;
  bin: "recycle" | "trash" | "compost" | "ewaste" | "hazard" | "unknown";
  material: string;
  item?: string;
}) {
  // TODO: override for edge cases, e.g., greasy pizza box => trash
  // Return the same shape for now.
  return input;
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}

function json502(code: string, details: string) {
  return new Response(JSON.stringify({ error: code, details }), {
    status: 502,
    headers: { "content-type": "application/json" },
  });
}

/* ---------- helpers ---------- */

function db() {
  try {
    return getFirestore(getApp());
  } catch {
    return getFirestore(initializeApp({ credential: applicationDefault() }));
  }
}

async function verifySessionToken(
  token: string
): Promise<{ ok: boolean; uid?: string; sessionId?: string }> {
  try {
    const { uid, sessionId } = verifySessionJwt(token);
    const snap = await db().doc(`sessions/${sessionId}`).get();
    if (!snap.exists) return { ok: false };
    const s = snap.data()!;
    const now = Date.now();
    const exp =
      (s.expiresAt?.toDate?.() ?? new Date(s.expiresAt)).getTime?.() ??
      s.expiresAt;
    if (
      s.closed ||
      now > exp ||
      s.uid !== uid ||
      (s.remainingAllowance ?? 0) <= 0
    )
      return { ok: false };
    return { ok: true, uid, sessionId };
  } catch {
    return { ok: false };
  }
}
