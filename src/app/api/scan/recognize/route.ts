// src/app/api/scan/recognize/route.ts
export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") || "");
  const file = form.get("frame") as File;
  if (!token || !file) return new Response("bad request", { status: 400 });

  const region = process.env.AWS_REGION || "us-east-1";
  const modelId = process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0";
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(modelId)}/invoke`;

  const jpeg = new Uint8Array(await file.arrayBuffer());

  const body = {
    messages: [{
      role: "user",
      content: [
        { type: "input_text", text:
`You are a recycling vision expert.
- Ignore people, pets, hands, faces, backgrounds.
- Identify ONE dominant physical item.
- Classify material: plastic|paper|metal|glass|organic|ewaste|hazard|unknown.
- Decide recyclable true/false.
- Suggest bin: recycle|trash|compost|ewaste|hazard|unknown.
Return STRICT JSON only:
{"item":"","material":"","recyclable":true,"confidence":0.0,"binSuggested":"","reasons":""}` },
        { type: "input_image", image_data: jpeg }
      ]
    }],
    temperature: 0.2,
    maxTokens: 300
  };

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json",
      "x-amzn-bedrock-api-key": process.env.BEDROCK_API_KEY as string
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    const err = await r.text();
    return new Response(JSON.stringify({ error: "bedrock_error", details: err }), {
      status: 502, headers: { "content-type": "application/json" }
    });
  }

  // Parse the model response
  const resp = await r.json();
  const text = resp?.output_text || resp?.completion || "";
  const json = safeParseJsonBlock(text) || { recyclable:false, binSuggested:"unknown" };

  // Minimal local mapping (replace with your rules later)
  const { recyclable, binSuggested, material } = json;
  const tip = pickTip(material, binSuggested);

  return Response.json({ recyclable, bin: binSuggested, tip });
}

function safeParseJsonBlock(s: string) {
  try {
    const start = s.indexOf("{"); const end = s.lastIndexOf("}");
    const j = start >= 0 && end >= 0 ? s.slice(start, end + 1) : s;
    return JSON.parse(j);
  } catch { return null; }
}
function pickTip(material: string, bin: string) {
  if (material === "plastic" && bin === "recycle") return "Rinse containers; remove food residue.";
  if (material === "glass"   && bin === "recycle") return "Remove caps; labels OK.";
  return "Check local recycling rules.";
}
