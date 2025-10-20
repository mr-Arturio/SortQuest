export type NovaDescription = {
  item: string;
  material: string; // plastic|paper|metal|glass|organic|ewaste|hazard|unknown
  recyclable: boolean;
  confidence: number;
  binSuggested: string;
  reasons?: string;
};

export async function describeItemWithNova(
  imageJpeg: Uint8Array
): Promise<NovaDescription | null> {
  try {
    if (!process.env.AWS_REGION) return null;
    const mod: any = await import("@aws-sdk/client-bedrock-runtime");
    const client = new mod.BedrockRuntimeClient({
      region: process.env.AWS_REGION,
    });

    const messages = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `You are a recycling vision expert. Analyze the image and:
- Ignore people, pets, hands, bodies, faces, and backgrounds.
- Identify ONE dominant physical item.
- Classify material: plastic|paper|metal|glass|organic|ewaste|hazard|unknown.
- Decide recyclable: true/false (in general).
- Suggest likely bin: recycle|trash|compost|ewaste|hazard|unknown.
Return strict JSON only:
{"item":"","material":"","recyclable":true,"confidence":0.0,"binSuggested":"","reasons":""}`,
          },
          { type: "input_image", image_data: Array.from(imageJpeg) },
        ],
      },
    ];

    const body = JSON.stringify({ messages, temperature: 0.2, maxTokens: 300 });
    const cmd = new mod.InvokeModelCommand({
      modelId: process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body,
    });
    const res = await client.send(cmd);
    const txt = new TextDecoder().decode(res.body as Uint8Array);
    const parsed = safeParse(txt);
    return parsed;
  } catch {
    return null;
  }
}

function safeParse(s: string): NovaDescription | null {
  try {
    const obj = JSON.parse(s);
    if (obj && typeof obj === "object") {
      if (obj.output_text && typeof obj.output_text === "string") {
        return tryExtractJson(obj.output_text);
      }
      if (obj.item) return obj as NovaDescription;
    }
  } catch {}
  return tryExtractJson(s);
}

function tryExtractJson(s: string): NovaDescription | null {
  const m = s.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    const j = JSON.parse(m[0]);
    if (typeof j.item === "string" && typeof j.material === "string")
      return j as NovaDescription;
  } catch {}
  return null;
}
