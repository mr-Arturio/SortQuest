export type Bin = "recycling" | "compost" | "landfill" | "special" | "unknown";

const LOCAL_RULES: Record<string, { bin: Bin; tip: string }> = {
  plastic: { bin: "recycling", tip: "Rinse containers; remove food residue." },
  glass: { bin: "recycling", tip: "Remove caps; labels OK." },
  metal: { bin: "recycling", tip: "Crush cans if possible." },
  paper: { bin: "recycling", tip: "Flatten boxes; keep dry." },
  cardboard: { bin: "recycling", tip: "Flatten; remove plastic liners." },
  organic: { bin: "compost", tip: "Drain liquids before composting." },
  ewaste: { bin: "special", tip: "Take to electronics drop-off." },
};

export function decideWithLocalRules(input: { item?: string; material?: string; binSuggested?: string }): { bin: Bin; tip: string } {
  const key = String(input.material || "").toLowerCase();
  const base = LOCAL_RULES[key] || { bin: "unknown" as Bin, tip: "Check local rules." };
  return base;
} 