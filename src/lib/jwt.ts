import jwt from "jsonwebtoken";

const SECRET = process.env.SESSION_SECRET!;

export function signSessionJwt(payload: {
  uid: string;
  sessionId: string;
  expSec?: number;
}) {
  return jwt.sign({ uid: payload.uid, sessionId: payload.sessionId }, SECRET, {
    algorithm: "HS256",
    expiresIn: payload.expSec ?? 300, // 5 min
  });
}

export function verifySessionJwt(token: string): {
  uid: string;
  sessionId: string;
} {
  return jwt.verify(token, SECRET) as any;
}
