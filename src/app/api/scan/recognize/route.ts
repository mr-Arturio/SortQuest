import { verifySession } from "@/src/lib/session";
import { decideWithLocalRules } from "@/src/lib/agentcore";
// import { describeItemWithNova } from "@/src/lib/bedrock";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const token = String(form.get("token") || "");
    const file = form.get("frame") as File | null;
    if (!token || !file) return new Response("bad request", { status: 400 });

    const claims = verifySession(token);
    // const bytes = new Uint8Array(await file.arrayBuffer());
    // const nova = await describeItemWithNova(bytes);
    // const decision = decideWithLocalRules({ item: nova?.item, material: nova?.material, binSuggested: nova?.binSuggested });

    // Stub response until Bedrock is wired
    const decision = decideWithLocalRules({ material: "unknown" });
    const recyclable = false;
    const points = 0;

    return Response.json({
      recyclable,
      bin: decision.bin === "unknown" ? null : decision.bin,
      tip: decision.tip,
      points,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    const status = msg === "expired" ? 410 : 500;
    return new Response(msg, { status });
  }
}
