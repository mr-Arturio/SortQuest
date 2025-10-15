// src/app/api/scan/recognize/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") || "");
  const file = form.get("frame") as File;
  if (!token || !file) return new Response("bad request", { status: 400 });

  // TODO: verify your QR session token here

  const jpeg = new Uint8Array(await file.arrayBuffer());
  const b64 = Buffer.from(jpeg).toString("base64");

  const region = process.env.AWS_REGION || "us-east-1";
  const modelId =
    process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0";
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(
    modelId
  )}/invoke`;

  const prompt = `You are a recycling vision expert.
- Ignore people, pets, hands, faces, background scenes.
- Identify ONE dominant physical item (e.g., "aluminum soda can").
- Classify material: plastic|paper|metal|glass|organic|ewaste|hazard|unknown.
- Decide recyclable true/false in general (not city-specific).
- Suggest bin: recycle|trash|compost|ewaste|hazard|unknown.
Return STRICT JSON only:
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
    inferenceConfig: {
      temperature: 0.2,
      maxTokens: 300,
    },
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
    const err = await r.text();
    return new Response(
      JSON.stringify({ error: "bedrock_error", details: err }),
      {
        status: 502,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const resp = await r.json(); // Nova returns { output: { message: { content:[{text: "..."}] } } } or output_text
  const text =
    resp?.output_text ??
    resp?.output?.message?.content?.find((p: any) => p.text)?.text ??
    "";

  const parsed = safeParseJsonBlock(text) || {
    recyclable: false,
    binSuggested: "unknown",
    material: "unknown",
  };

  const tip = pickTip(parsed.material, parsed.binSuggested);
  return Response.json({
    recyclable: parsed.recyclable,
    bin: parsed.binSuggested,
    tip,
  });
}

function safeParseJsonBlock(s: string) {
  try {
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    return JSON.parse(s.slice(start, end + 1));
  } catch {
    return null;
  }
}
function pickTip(material: string, bin: string) {
  if (material === "plastic" && bin === "recycle")
    return "Rinse containers; remove food residue.";
  if (material === "glass" && bin === "recycle")
    return "Remove caps; labels OK.";
  return "Check local recycling rules.";
}
