export type BinTag = { teamId: string; binId: string };

export type Box = {
  x: number; // 0..1
  y: number; // 0..1
  w: number; // 0..1
  h: number; // 0..1
  label?: string;
  score?: number;
} | null;

export type VendorTrackCapabilities = MediaTrackCapabilities & {
  focusMode?: string[];
  exposureMode?: string[];
  whiteBalanceMode?: string[];
  zoom?: { min: number; max: number; step?: number };
  pointsOfInterest?: boolean;
};

export type VendorTrackConstraintSet = MediaTrackConstraintSet & {
  focusMode?: string;
  exposureMode?: string;
  whiteBalanceMode?: string;
  zoom?: number;
  pointsOfInterest?: { x: number; y: number }[];
};
