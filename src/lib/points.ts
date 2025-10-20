import { getFirestore } from "firebase-admin/firestore";
import { getApp, initializeApp, applicationDefault } from "firebase-admin/app";

function db() {
  try {
    return getFirestore(getApp());
  } catch {
    return getFirestore(initializeApp({ credential: applicationDefault() }));
  }
}

export async function awardPoints({
  uid,
  sessionId,
  recyclable,
}: {
  uid: string;
  sessionId: string;
  recyclable: boolean;
}) {
  const d = db();
  return await d.runTransaction(async (tx) => {
    const sessRef = d.doc(`sessions/${sessionId}`);
    const userRef = d.doc(`users/${uid}`);
    const sess = await tx.get(sessRef);
    if (!sess.exists) throw new Error("no_session");
    const s = sess.data() as {
      expiresAt:
        | Date
        | {
            toDate?: () => Date;
          }
        | number;
      closed?: boolean;
      remainingAllowance?: number;
      scansCount?: number;
    };
    const now = Date.now();
    let exp: number;
    const ex = s.expiresAt as unknown;
    if (
      ex &&
      typeof ex === "object" &&
      (ex as { toDate?: () => Date }).toDate
    ) {
      exp = (ex as { toDate: () => Date }).toDate().getTime();
    } else if (ex instanceof Date) {
      exp = ex.getTime();
    } else if (typeof ex === "number") {
      exp = ex;
    } else {
      exp = new Date(ex as Date).getTime();
    }
    if (s.closed || now > exp || (s.remainingAllowance ?? 0) <= 0)
      throw new Error("expired_or_limit");

    const base = recyclable ? 10 : 0; // QR session base points
    // TODO: streak / risk clamp here
    const points = base;

    tx.update(sessRef, {
      remainingAllowance: (s.remainingAllowance ?? 0) - 1,
      scansCount: (s.scansCount ?? 0) + 1,
    });
    const scanRef = d.collection("scans").doc();
    tx.set(scanRef, { uid, sessionId, ts: new Date(), recyclable, points });

    const user = await tx.get(userRef);
    const up = (user.exists ? user.data()!.points ?? 0 : 0) + points;
    tx.set(userRef, { points: up, lastScanAt: new Date() }, { merge: true });

    return { points };
  });
}
