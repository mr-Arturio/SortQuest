import { bedrock } from "./aws";
import { InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

type NovaOut = {
  item: string;
  material: "plastic"|"paper"|"metal"|"glass"|"organic"|"ewaste"|"hazard"|"unknown";
  recyclable: boolean;
  confidence: number;
  binSuggested: "recycle"|"trash"|"compost"|"ewaste"|"hazard"|"unknown";
  reasons: string;
};

export async function describeItemWithNova(imageJpeg: Uint8Array): Promise<NovaOut | null> {
  const messages = [{
    role: "user",
    content: [
      { type: "input_text", text:
`You are a recycling vision expert.
- Ignore people, pets, hands, faces, and background scenes.
- Identify ONE dominant physical item (e.g., "aluminum soda can", "PET water bottle", "cardboard box").
- Classify material: plastic|paper|metal|glass|organic|ewaste|hazard|unknown.
- Decide recyclable true/false in general (not city-specific).
- Suggest bin: recycle|trash|compost|ewaste|hazard|unknown.
Return STRICT JSON only:
{"item":"","material":"","recyclable":true,"confidence":0.0,"binSuggested":"","reasons":""}` },
      { type: "input_image", image_data: imageJpeg }
    ]
  }];

  const res = await bedrock.send(new InvokeModelCommand({
    modelId: process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0",
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({ messages, temperature: 0.2, maxTokens: 300 })
  }));

  const body = JSON.parse(new TextDecoder().decode(res.body));
  const text = body?.output_text || body?.completion || "";
  try {
    // Extract the JSON block if model wrapped it
    const jsonText = extractJson(text);
    return JSON.parse(jsonText);
  } catch {
    return null;
  }
}

function extractJson(s: string): string {
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start >= 0 && end >= 0) return s.slice(start, end + 1);
  return s;
}
