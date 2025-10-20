import tipsData from "@/data/tips.json";

export function getTip(material: string, bin: string): string {
  const materialTips = tipsData[material as keyof typeof tipsData];
  if (!materialTips) {
    return "Check local recycling guidelines for proper disposal.";
  }

  const tip = materialTips[bin as keyof typeof materialTips];
  return tip || "Check local recycling guidelines for proper disposal.";
}

export function getBinForMaterial(material: string): string {
  const binMap: Record<string, string> = {
    plastic: "recycle",
    metal: "recycle",
    glass: "recycle",
    paper: "recycle",
    cardboard: "recycle",
    organic: "compost",
    ewaste: "special",
    hazard: "special",
    unknown: "landfill",
  };

  return binMap[material] || "landfill";
}

export function getYearsForMaterial(material: string): number {
  const yearsMap: Record<string, number> = {
    plastic: 450,
    metal: 200,
    glass: 1000000, // Cap at 2000 in practice
    paper: 2,
    cardboard: 2,
    organic: 1,
    ewaste: 1000,
    hazard: 1000,
    unknown: 50,
  };

  return yearsMap[material] || 50;
}
