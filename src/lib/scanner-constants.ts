// Scanner constants and feature flags

// Exclude people/pets from detection/UX and capture flow
export const BLOCKED_CLASSES = new Set(["person", "dog", "cat"]);

// DEMO FLAG: when true, QR code is not required
export const DEMO_NO_QR = process.env.NEXT_PUBLIC_DEMO_NO_QR === "1";
// TEST MODE: manual capture via button; QR is not required
export const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === "1";
export const ALLOW_NO_QR = TEST_MODE || DEMO_NO_QR;

// Loop settings
export const SCAN_INTERVAL_MS = 333; // ~3 fps
export const DETECT_WIDTH = 320; // downscale for motion/QR to reduce CPU
export const DETECT_EVERY_MS = 650; // live-outline cadence
