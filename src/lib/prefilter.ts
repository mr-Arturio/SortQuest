import { rekognition } from "./aws";
import { DetectLabelsCommand } from "@aws-sdk/client-rekognition";

export async function looksLikePersonOrPet(jpegBytes: Uint8Array) {
  const out = await rekognition.send(new DetectLabelsCommand({
    Image: { Bytes: jpegBytes },
    MaxLabels: 10,
    MinConfidence: 75
  }));
  const names = new Set((out.Labels ?? []).map(l => (l.Name || "").toLowerCase()));
  return names.has("person") || names.has("dog") || names.has("cat") || names.has("animal") || names.has("mammal");
}
