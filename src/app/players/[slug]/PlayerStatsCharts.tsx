"use client";

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import type { PlayerRole } from "@/types";

interface SeasonPoint {
  season: string;
  runs: number;
  wickets: number;
  matches: number;
  sixes: number;
}

interface RecentPoint {
  match: string;
  runs: number;
  wickets: number;
  sr: number;
}

interface Props {
  seasonData: SeasonPoint[];
  recentForm: RecentPoint[];
  playerRole: PlayerRole;
}

const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
  color: "hsl(var(--foreground))",
};

export function PlayerStatsCharts({ seasonData, recentForm, playerRole }: Props) {
  const isBatter  = playerRole === "batter" || playerRole === "wicket-keeper";
  const isBowler  = playerRole === "bowler";
  const isAllRounder = playerRole === "all-rounder";

  if (seasonData.length === 0 && recentForm.length === 0) return null;

  return (
    <section className="space-y-8">
      <h2 className="text-xl font-bold text-foreground">Performance Charts</h2>

      {/* Season-by-season bar chart */}
      {seasonData.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Season-by-Season Overview
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={seasonData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="season" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {(isBatter || isAllRounder) && (
                <Bar dataKey="runs" name="Runs" fill="#C0392B" radius={[4, 4, 0, 0]} />
              )}
              {(isBowler || isAllRounder) && (
                <Bar dataKey="wickets" name="Wickets" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
              )}
              <Bar dataKey="sixes" name="Sixes" fill="#D4A017" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent form line chart */}
      {recentForm.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Runs recent form */}
          {(isBatter || isAllRounder) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Runs</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={[...recentForm].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="match" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone" dataKey="runs" name="Runs"
                    stroke="#C0392B" strokeWidth={2} dot={{ fill: "#C0392B", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Wickets / Economy recent form */}
          {(isBowler || isAllRounder) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Recent Wickets</h3>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={[...recentForm].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="match" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="wickets" name="Wickets" fill="#1A3A5C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Strike rate chart for batters */}
          {(isBatter || isAllRounder) && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Strike Rate Trend</h3>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={[...recentForm].reverse()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="match" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Line
                    type="monotone" dataKey="sr" name="Strike Rate"
                    stroke="#D4A017" strokeWidth={2} dot={{ fill: "#D4A017", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
