"use client";

import { useEffect, useState } from "react";
import QRBadge from "@/components/QRBadge";

export default function BinTagPage() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [binId, setBinId] = useState<string | null>(null);

  useEffect(() => {
    setTeamId(localStorage.getItem("dd:lastTeamId"));
    setBinId(localStorage.getItem("dd:lastBinId"));
  }, []);

  return (
    <section className="space-y-4">
      <div className="card p-4">
        <h2 className="text-lg font-semibold">Your BinTag</h2>
        <p className="text-sm text-neutral-600 mt-1">
          Print and tape this QR near your bin. Scans must include this QR to
          earn points.
        </p>
        <div className="mt-4">
          {teamId && binId ? (
            <QRBadge payload={`BINTAG:${teamId}:${binId}`} />
          ) : (
            <div className="text-sm text-neutral-600">
              Create a team to generate your BinTag.
            </div>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-medium">Fair-Play Protected</h3>
        <p className="text-sm text-neutral-600 mt-1">
          To keep competition fair, we require your BinTag QR plus motion checks
          and duplicate detection. Sessions time out and identical captures are
          ignored.
        </p>
      </div>
    </section>
  );
}
