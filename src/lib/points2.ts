const MATERIAL_MULTIPLIER: Record<string, number> = {
  plastic: 1.3,
  aluminum: 1.6,
  steel: 1.2,
  glass: 0.8,
  paper: 0.6,
  cardboard: 0.6,
  compost: 0.5,
  ewaste: 2.0,
  battery: 2.5,
  unknown: 0.7,
};

function clamp(min: number, v: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function materialWeight(material: string) {
  return MATERIAL_MULTIPLIER[material?.toLowerCase?.()] ?? 1.0;
}

export function computePoints(
  material: string,
  years: number,
  risk: number,
  nToday: number
) {
  const base = 5;
  const impact = clamp(1, 3 * Math.log10((years || 0) + 1), 10);
  const w = materialWeight(material);
  const riskAdj = 1 + 0.5 * clamp(0, risk || 0, 1);
  const freqAdj = 1 - 0.1 * Math.min(nToday || 0, 5);
  const raw = base * impact * w * riskAdj * freqAdj;
  return Math.round(clamp(1, raw, 100));
}


