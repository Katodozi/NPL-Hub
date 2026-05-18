import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  getPlayerBySlug, getPlayerCareerStats,
  getPlayerSeasonStats, getPlayerTeamHistory,
} from "@/lib/db";
import { roleLabel } from "@/lib/utils";
import { PlayerStatsCharts } from "./PlayerStatsCharts";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const player = await getPlayerBySlug(slug);
  if (!player) return { title: "Player Not Found" };
  return { title: `${player.full_name} — Player Dashboard` };
}

export const revalidate = 3600;

const ROLE_COLORS: Record<string, string> = {
  batter:          "bg-blue-100 text-blue-700",
  bowler:          "bg-red-100 text-red-700",
  "all-rounder":   "bg-green-100 text-green-700",
  "wicket-keeper": "bg-purple-100 text-purple-700",
};

function StatBox({
  label, value, sub, highlight,
}: { label: string; value: string | number; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center border ${highlight ? "border-npl-red-200 bg-npl-red-50" : "border-border bg-card"}`}>
      <div className={`text-2xl font-black tabular-nums ${highlight ? "text-npl-red-600" : "text-foreground"}`}>
        {value === 0 || value === "0.00" ? "—" : value}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export default async function PlayerDashboardPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const player = await getPlayerBySlug(slug);
  if (!player) notFound();
  
  const [career, matchStats, teamHistory] = await Promise.all([
    getPlayerCareerStats(player.id).catch(() => null),
    getPlayerSeasonStats(player.id).catch(() => []),
    getPlayerTeamHistory(player.id).catch(() => []),
  ]);

  const initials = player.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  // Group match stats by season for chart data
  const seasonMap: Record<number, { runs: number; wickets: number; matches: number; sixes: number }> = {};
  for (const ms of matchStats) {
    const year = (ms.match as { season?: { year: number } })?.season?.year ?? 0;
    if (!year) continue;
    if (!seasonMap[year]) seasonMap[year] = { runs: 0, wickets: 0, matches: 0, sixes: 0 };
    seasonMap[year].runs    += ms.runs ?? 0;
    seasonMap[year].wickets += ms.wickets ?? 0;
    seasonMap[year].matches += 1;
    seasonMap[year].sixes   += ms.sixes ?? 0;
  }
  const seasonChartData = Object.entries(seasonMap)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([year, d]) => ({ season: `NPL ${year}`, ...d }));

  // Recent form — last 5 matches
  const recentForm = matchStats.slice(0, 5);

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-npl-blue-500 to-npl-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="section-container relative z-10 py-10">
          <Link href="/players" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Players
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30">
              {player.image_url ? (
                <img src={player.image_url} alt={player.full_name}
                  className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white font-black text-2xl">{initials}</span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[player.role] ?? "bg-white/20 text-white"}`}>
                  {roleLabel(player.role)}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${player.is_overseas ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"}`}>
                  {player.is_overseas ? "Overseas" : "Local"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                {player.full_name}
              </h1>
              <div className="flex flex-wrap gap-3 text-white/70 text-sm">
                <span>🌍 {player.nationality}</span>
                <span>·</span>
                <span>🏏 {player.batting_style} bat</span>
                {player.bowling_style !== "none" && (
                  <>
                    <span>·</span>
                    <span>⚾ {player.bowling_style}</span>
                  </>
                )}
              </div>
            </div>

            {/* Team history pills */}
            {teamHistory.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <p className="text-white/50 text-xs font-medium">NPL Teams</p>
                {teamHistory.map((th) => (
                  <div key={th.id}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: (th.team as { primary_color?: string })?.primary_color ?? "#fff" }} />
                    <span className="text-white text-xs font-medium">
                      {(th.team as { name?: string })?.name}
                    </span>
                    <span className="text-white/50 text-xs">
                      {(th.season as { year?: number })?.year}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container py-10 space-y-12">

        {/* NPL note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-4 py-2.5 border border-border">
          <span className="w-1.5 h-1.5 rounded-full bg-npl-red-500 flex-shrink-0" />
          All statistics below are <strong className="text-foreground">Nepal Premier League only</strong> — domestic and international stats are excluded.
        </div>

        {/* Career batting stats */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Batting</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <StatBox label="Matches"    value={career?.matches ?? 0} />
            <StatBox label="Innings"    value={career?.innings_batted ?? 0} />
            <StatBox label="Runs"       value={career?.total_runs ?? 0} highlight />
            <StatBox label="Highest"    value={career?.highest_score ?? 0} />
            <StatBox label="Average"    value={career?.batting_avg ?? 0} />
            <StatBox label="Strike Rate" value={career?.batting_sr ?? 0} />
            <StatBox label="50s / 100s" value={`${career?.fifties ?? 0} / ${career?.hundreds ?? 0}`} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <StatBox label="Fours"  value={career?.total_fours ?? 0} />
            <StatBox label="Sixes"  value={career?.total_sixes ?? 0} />
            <StatBox label="Seasons Played" value={career?.seasons_played ?? 0} />
          </div>
        </section>

        {/* Career bowling stats */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4">Bowling</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <StatBox label="Innings"    value={career?.innings_bowled ?? 0} />
            <StatBox label="Wickets"    value={career?.total_wickets ?? 0} highlight />
            <StatBox label="Best"       value={career?.best_bowling ?? "—"} />
            <StatBox label="Average"    value={career?.bowling_avg ?? 0} />
            <StatBox label="Economy"    value={career?.bowling_economy ?? 0} />
            <StatBox label="Catches"    value={career?.total_catches ?? 0} />
          </div>
        </section>

        {/* Charts — client component */}
        <PlayerStatsCharts
          seasonData={seasonChartData}
          recentForm={recentForm.map((m) => ({
            match:   `M${(m.match as { match_number?: number })?.match_number ?? "?"}`,
            runs:    m.runs,
            wickets: m.wickets,
            sr:      Number(m.strike_rate) || 0,
          }))}
          playerRole={player.role}
        />

        {/* Match-by-match log */}
        {matchStats.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">Match Log</h2>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="text-left px-4 py-3">Match</th>
                    <th className="text-left px-4 py-3">Opponent</th>
                    <th className="text-center px-3 py-3">R</th>
                    <th className="text-center px-3 py-3">B</th>
                    <th className="text-center px-3 py-3">4s</th>
                    <th className="text-center px-3 py-3">6s</th>
                    <th className="text-center px-3 py-3">SR</th>
                    <th className="text-center px-3 py-3">Wkts</th>
                    <th className="text-center px-3 py-3">Econ</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {matchStats.map((ms) => {
                    const matchData = ms.match as {
                      match_number?: number; date?: string;
                      team1?: { name?: string }; team2?: { name?: string };
                    };
                    return (
                      <tr key={ms.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">
                          #{matchData?.match_number ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {matchData?.team1?.name ?? matchData?.team2?.name ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-foreground">
                          {ms.runs > 0 ? <span className={ms.runs >= 50 ? "text-npl-gold-600" : ""}>{ms.runs}{ms.is_out ? "" : "*"}</span> : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{ms.balls_faced || "—"}</td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{ms.fours || "—"}</td>
                        <td className="px-3 py-3 text-center text-muted-foreground">{ms.sixes || "—"}</td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {ms.balls_faced > 0 ? Number(ms.strike_rate).toFixed(1) : "—"}
                        </td>
                        <td className="px-3 py-3 text-center font-semibold text-foreground">
                          {ms.wickets > 0 ? <span className="text-npl-red-600">{ms.wickets}</span> : "—"}
                        </td>
                        <td className="px-3 py-3 text-center text-muted-foreground">
                          {ms.overs > 0 ? Number(ms.economy).toFixed(1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {matchData?.date
                            ? new Date(matchData.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Empty state if no match data */}
        {matchStats.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">
              No match data yet for {player.full_name}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add match stats via the admin panel to populate this dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
