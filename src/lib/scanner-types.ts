// Shared types for the camera scanner

export type BinTag = { teamId: string; binId: string };

export type Box = {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
  label?: string;
  score?: number;
} | null;

export type ScanResult = {
  label: string;
  material: string;
  bin: string;
  years: number;
  points: number;
  ahash: string;
  confidence: number;
  tip: string;
  _mode?: "heuristic" | "server";
  _model?: string;
  risk_score?: number;
};
