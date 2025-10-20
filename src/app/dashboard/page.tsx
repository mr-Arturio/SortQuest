"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Trophy,
  Users,
  Recycle,
  Calendar,
  Award,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db, ensureAnonAuth } from "@/lib/firebase";
import { scoreFor } from "@/lib/scoring";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalYearsSaved: 0,
    totalPoints: 0,
    dailyStreak: 0,
    totalScans: 0,
    teamRank: 0,
    todayScans: 0,
    weeklyGoal: 50,
    currentWeekScans: 0,
  });
  const [recentScans, setRecentScans] = useState<
    { item: string; bin: string; years: number; time: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const uid = await ensureAnonAuth();
      const scansCol = collection(db, "scans");
      const snap = await getDocs(query(scansCol, where("userId", "==", uid)));

      let totalYears = 0;
      let totalPoints = 0;
      let todayCount = 0;
      let weekCount = 0;

      const now = new Date();
      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      ).getTime();
      const startOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
      ).getTime();

      const recents: {
        item: string;
        bin: string;
        years: number;
        time: string;
      }[] = [];

      snap.docs
        .map((d) => d.data() as Record<string, unknown>)
        .forEach((d) => {
          const ts = (d.ts as Timestamp | undefined)?.toDate?.() ?? null;
          const material =
            typeof d.material === "string" ? d.material : "unknown";
          const label = typeof d.label === "string" ? d.label : material;
          const computed = scoreFor(material);
          const years = typeof d.years === "number" ? d.years : computed.years;
          const points =
            typeof d.points === "number" ? d.points : Math.round(years);
          const bin = (
            typeof d.binSuggested === "string" ? d.binSuggested : computed.bin
          ) as string;

          totalYears += Math.max(0, years);
          totalPoints += Math.max(0, points);

          if (ts) {
            const t = ts.getTime();
            if (t >= startOfToday) todayCount += 1;
            if (t >= startOfWeek) weekCount += 1;
          }

          if (ts) {
            const diffHours = Math.max(
              0,
              (Date.now() - ts.getTime()) / (1000 * 60 * 60)
            );
            const time =
              diffHours < 1 ? "just now" : `${Math.round(diffHours)} hours ago`;
            recents.push({ item: label, bin, years, time });
          }
        });

      recents.sort((a, b) => a.time.localeCompare(b.time));

      setUserStats((s) => ({
        ...s,
        totalYearsSaved: totalYears,
        totalPoints,
        totalScans: snap.size,
        todayScans: todayCount,
        currentWeekScans: weekCount,
        dailyStreak: 0, // can compute from achievements page logic later
      }));
      setRecentScans(recents.slice(0, 5));
      setLoading(false);
    })();
  }, []);

  const fmt = (n: number) => Math.round(n).toLocaleString();

  return (
    <div className="min-h-screen bg-eco-gradient-light">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-eco-gradient">
        <div className="absolute inset-0">
          <Image
            src="/hero-recycling.jpg"
            alt="Recycling together"
            fill
            className="object-cover opacity-20"
            priority
          />
        </div>
        <div className="relative px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">SortQuest ♻️</h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Turn recycling into a game! Scan, sort, compete, and save the planet
            one item at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-white">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Recycle className="h-5 w-5" />
              <span className="font-semibold">
                {fmt(userStats.totalYearsSaved)} years saved
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Calendar className="h-5 w-5" />
              <span className="font-semibold">
                {userStats.dailyStreak} day streak
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Trophy className="h-5 w-5" />
              <span className="font-semibold">
                Rank #{userStats.teamRank || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/scan" className="w-full">
            <Button
              size="lg"
              className="w-full h-20 bg-eco-primary hover:bg-eco-secondary shadow-eco"
            >
              <Camera className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Scan Item</div>
                <div className="text-sm opacity-90">Start recycling now</div>
              </div>
            </Button>
          </Link>
          <Link href="/leaderboard" className="w-full">
            <Button
              variant="outline"
              size="lg"
              className="w-full h-20 border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white"
            >
              <Users className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">View Leaderboard</div>
                <div className="text-sm opacity-75">See team rankings</div>
              </div>
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card-eco border-eco-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Scans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eco-primary">
                {userStats.todayScans}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {/* Placeholder delta */}
                +0 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card-eco border-eco-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eco-primary">
                {userStats.currentWeekScans}/{userStats.weeklyGoal}
              </div>
              <Progress
                value={
                  (userStats.currentWeekScans / userStats.weeklyGoal) * 100
                }
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {Math.max(0, userStats.weeklyGoal - userStats.currentWeekScans)}{" "}
                scans to go
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card-eco border-eco-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-eco-success">
                {fmt(userStats.totalYearsSaved)}
              </div>
              <p className="text-xs text-muted-foreground">
                Years saved from environment
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card-eco border-eco-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {fmt(userStats.totalPoints)}
              </div>
              <p className="text-xs text-muted-foreground">
                For competitions & ranking
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="shadow-card-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Recycle className="h-5 w-5 text-eco-primary" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading && (
                <div className="text-sm text-muted-foreground">Loading…</div>
              )}
              {!loading && recentScans.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No recent scans yet.
                </div>
              )}
              {recentScans.map((scan, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-eco-gradient-light"
                >
                  <div>
                    <div className="font-medium">{scan.item}</div>
                    <div className="text-sm text-muted-foreground">
                      {scan.bin} • {scan.time}
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-eco-success/20 text-eco-success"
                  >
                    +{fmt(scan.years)} years
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements placeholder */}
          <Card className="shadow-card-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-achievement-gold" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              Visit the Achievements page for detailed awards and streaks.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
