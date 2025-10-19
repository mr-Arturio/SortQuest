import { MATERIALS, labelToMaterial } from "./materials";
import { scoreFor } from "./scoring";
import type { Pred } from "./vision";

export type MapResult = {
  material: string;
  bin: "recycling" | "compost" | "landfill" | "special";
  tip: string;
  years: number;
  risk_score?: number;
  _mode?: "heuristic" | "server";
  _model?: string;
};

export async function mapWithApi(
  labels: Pred[],
  recentCount: number,
  delta: number,
  conf: number
): Promise<MapResult> {
  // Client-side heuristic only (server-side Bedrock handles the main recognition)
  const top = labels[0]?.className || "";
  const material = labelToMaterial(top);
  const { bin, years, tip } = scoreFor(material);

  // Calculate risk score based on confidence and recent activity
  let risk_score = 0;
  if (conf < 0.5) risk_score += 0.35;
  if (conf < 0.3) risk_score += 0.55;
  if (delta < 0.02) risk_score += 0.25;
  if (recentCount >= 3) risk_score += 0.15;
  if (recentCount >= 6) risk_score += 0.3;
  risk_score = Math.min(1, Math.max(0, risk_score));

  return {
    material,
    bin: bin as MapResult["bin"],
    tip,
    years,
    risk_score,
    _mode: "heuristic",
    _model: "client-side",
  };
}
