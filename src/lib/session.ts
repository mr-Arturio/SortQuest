import crypto from "node:crypto";

export type SessionClaims = {
  teamId: string;
  binId: string;
  sessionId: string;
  exp: number; // ms epoch
  lat?: number;
  lng?: number;
};

function getSecret(): Buffer {
  const secret = process.env.SESSION_SECRET || "dev-secret";
  return Buffer.from(secret, "utf8");
}

function b64url(input: Buffer | string): string {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(data: unknown): string {
  return b64url(Buffer.from(JSON.stringify(data), "utf8"));
}

function hmac(data: string): string {
  const mac = crypto.createHmac("sha256", getSecret());
  mac.update(data, "utf8");
  return b64url(mac.digest());
}

export function signSession(claims: SessionClaims): string {
  const payload = b64urlJson(claims);
  const sig = hmac(payload);
  return `${payload}.${sig}`;
}

export function verifySession(token: string): SessionClaims {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) throw new Error("invalid token");
  const expected = hmac(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    throw new Error("bad signature");
  }
  let claims: SessionClaims;
  try {
    claims = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    );
  } catch {
    throw new Error("invalid payload");
  }
  if (typeof claims.exp !== "number" || Date.now() > claims.exp) {
    throw new Error("expired");
  }
  return claims;
}

export function createSessionClaims(input: {
  teamId: string;
  binId: string;
  lat?: number;
  lng?: number;
  ttlMs?: number;
}): SessionClaims {
  const ttl = typeof input.ttlMs === "number" ? input.ttlMs : 5 * 60 * 1000; // default 5m
  return {
    teamId: input.teamId,
    binId: input.binId,
    sessionId: crypto.randomBytes(8).toString("hex"),
    exp: Date.now() + ttl,
    lat: input.lat,
    lng: input.lng,
  };
}
