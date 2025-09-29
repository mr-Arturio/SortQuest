"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, ensureAnonAuth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StorePage() {
  const [points, setPoints] = useState(0);

  useEffect(() => {
    (async () => {
      const uid = await ensureAnonAuth();
      const scansCol = collection(db, "scans");
      const snap = await getDocs(query(scansCol, where("userId", "==", uid)));
      let total = 0;
      snap.docs.forEach((d) => {
        const pts = (d.data() as Record<string, unknown>).points;
        if (typeof pts === "number") total += Math.max(0, pts);
      });
      setPoints(total);
    })();
  }, []);

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">
            {Math.round(points).toLocaleString()} pts
          </div>
          <p className="text-sm text-neutral-600 mt-1">
            Earn points by scanning items and sorting correctly.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Eco Wallpaper</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">Customize your theme.</p>
            <Button className="mt-2" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donate to Orgs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">
              Convert points into donations.
            </p>
            <Button className="mt-2" disabled>
              Coming soon
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
