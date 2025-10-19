// src/app/api/bedrock-ping/route.ts
export const runtime = "nodejs";

export async function GET() {
  const region = process.env.AWS_REGION || "us-east-1";
  const modelId =
    process.env.BEDROCK_VISION_MODEL_ID || "amazon.nova-lite-v1:0";
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(
    modelId
  )}/invoke`;

  const body = {
    messages: [
      {
        role: "user",
        content: [{ text: 'Return JSON: {"ok":true}' }],
      },
    ],
    inferenceConfig: {
      temperature: 0,
      maxTokens: 64,
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

  const txt = await r.text();
  return new Response(txt, {
    status: r.status,
    headers: { "content-type": "application/json" },
  });
}
