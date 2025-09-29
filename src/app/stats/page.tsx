"use client";

import Link from "next/link";
import UserTotals from "@/components/UserTotals";

export default function StatsPage() {
  return (
    <section className="space-y-4">
      <UserTotals />
      <div className="card p-4">
        <h2 className="text-lg font-semibold">More Stats</h2>
        <p className="text-sm text-neutral-600 mt-1">
          See achievements, streaks, and breakdowns by material.
        </p>
        <div className="mt-3 flex gap-2">
          <Link href="/achievements" className="btn-primary">
            Achievements
          </Link>
        </div>
      </div>
    </section>
  );
}
