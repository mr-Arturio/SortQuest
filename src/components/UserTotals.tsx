"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db, ensureAnonAuth } from "@/lib/firebase";
import { scoreFor } from "@/lib/scoring";

type ScanDoc = {
  years?: number;
  points?: number;
  material?: string;
};

export default function UserTotals() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<{
    years: number;
    points: number;
  } | null>(null);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    (async () => {
      const uid = await ensureAnonAuth();
      const scansCol = collection(db, "scans");
      const q = query(scansCol, where("userId", "==", uid));
      unsub = onSnapshot(q, (snap) => {
        let years = 0;
        let points = 0;
        snap.docs.forEach((d) => {
          const data = d.data() as ScanDoc;
          const y =
            typeof data.years === "number"
              ? data.years
              : scoreFor((data.material || "unknown").toLowerCase()).years;
          const p =
            typeof data.points === "number" ? data.points : Math.round(y);
          years += Math.max(0, y);
          points += Math.max(0, p);
        });
        setTotals({ years, points });
        setLoading(false);
      });
    })();
    return () => {
      if (unsub) unsub();
    };
  }, []);

  const fmt = (n: number) => Math.round(n).toLocaleString();

  return (
    <section className="grid grid-cols-2 gap-3">
      <div className="card p-4">
        <div className="text-sm text-neutral-500">Years Saved</div>
        <div className="mt-1 text-2xl font-semibold">
          {loading || !totals ? "—" : fmt(totals.years)}
        </div>
        <div className="text-xs text-neutral-500 mt-1">Lifetime impact</div>
      </div>
      <div className="card p-4">
        <div className="text-sm text-neutral-500">Points</div>
        <div className="mt-1 text-2xl font-semibold">
          {loading || !totals ? "—" : fmt(totals.points)}
        </div>
        <div className="text-xs text-neutral-500 mt-1">For competitions</div>
      </div>
    </section>
  );
}
