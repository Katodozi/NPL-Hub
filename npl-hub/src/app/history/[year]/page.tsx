import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Trophy, Star, Calendar, ChevronLeft, Users } from "lucide-react";
import {
  getSeasonByYear, getSeasonMatches,
  getSeasonAwards, getAllTeams, getPointsTable,
} from "@/lib/db";
import { SEASON_CHAMPIONS, NPL_META, NPL_TEAMS } from "@/config/constants";
import { slugify, cn } from "@/lib/utils";

export async function generateStaticParams() {
  const years = [2024, 2025, NPL_META.current_season];
  return years.map((year) => ({ year: String(year) }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ year: string }> }
): Promise<Metadata> {
  const { year } = await params;
  return { title: `NPL ${year} Season` };
}

export const revalidate = 3600;

// ── Points table ─────────────────────────────────────────────────────────────
function PointsTable({
  rows, teams,
}: {
  rows: { team_id: string; played: number; won: number; lost: number; nr: number; points: number; nrr: number }[];
  teams: { id: string; name: string; short_code: string; primary_color: string }[];
}) {
  if (rows.length === 0) return (
    <div className="rounded-xl border border-dashed border-border p-8 text-center">
      <p className="text-muted-foreground text-sm">Points table will appear here once match data is added.</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
            <th className="text-left px-4 py-3">#</th>
            <th className="text-left px-4 py-3">Team</th>
            <th className="text-center px-3 py-3">P</th>
            <th className="text-center px-3 py-3">W</th>
            <th className="text-center px-3 py-3">L</th>
            <th className="text-center px-3 py-3">NR</th>
            <th className="text-center px-3 py-3">Pts</th>
            <th className="text-center px-3 py-3">NRR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => {
            const team = teams.find((t) => t.id === row.team_id);
            const isQualified = i < 4;
            return (
              <tr key={row.team_id} className={cn(
                "transition-colors hover:bg-muted/30",
                isQualified && "bg-npl-green-50/30 dark:bg-npl-green-950/10"
              )}>
                <td className="px-4 py-3 text-muted-foreground font-medium">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team?.primary_color ?? "#ccc" }} />
                    <Link
                      href={`/teams/${slugify(team?.name ?? "")}`}
                      className="font-semibold text-foreground hover:text-npl-red-500 transition-colors"
                    >
                      {team?.name ?? row.team_id}
                    </Link>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-muted-foreground">{row.played}</td>
                <td className="px-3 py-3 text-center font-semibold text-npl-green-600">{row.won}</td>
                <td className="px-3 py-3 text-center font-semibold text-npl-red-500">{row.lost}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">{row.nr}</td>
                <td className="px-3 py-3 text-center font-black text-foreground text-base">{row.points}</td>
                <td className="px-3 py-3 text-center text-muted-foreground">
                  {row.nrr > 0 ? `+${row.nrr.toFixed(3)}` : row.nrr.toFixed(3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2 border-t border-border bg-muted/30">
        <p className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-npl-green-500 mr-1.5" />
          Top 4 qualify for playoffs
        </p>
      </div>
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match }: { match: Record<string, unknown> }) {
  const team1 = match.team1 as { name?: string; short_code?: string; primary_color?: string } | undefined;
  const team2 = match.team2 as { name?: string; short_code?: string; primary_color?: string } | undefined;
  const winner = match.winner as { id?: string } | undefined;
  const isCompleted = match.is_completed as boolean;
  const matchType = match.match_type as string;

  const typeLabel: Record<string, string> = {
    league: "League", qualifier1: "Qualifier 1", qualifier2: "Qualifier 2",
    eliminator: "Eliminator", final: "Final",
  };

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4",
      matchType === "final" && "border-npl-gold-300 bg-npl-gold-50/30 dark:bg-npl-gold-950/10"
    )}>
      {/* Match meta */}
      <div className="flex items-center justify-between mb-3">
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full",
          matchType === "final"
            ? "bg-npl-gold-100 text-npl-gold-700"
            : "bg-muted text-muted-foreground"
        )}>
          {typeLabel[matchType] ?? matchType} · #{match.match_number as number}
        </span>
        <span className="text-xs text-muted-foreground">
          {match.date ? new Date(match.date as string).toLocaleDateString("en-US", {
            month: "short", day: "numeric"
          }) : "TBA"}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team1?.primary_color ?? "#ccc" }} />
            <span className={cn(
              "font-semibold text-sm",
              isCompleted && winner?.id === (match.team1_id as string)
                ? "text-npl-green-600" : "text-foreground"
            )}>
              {team1?.short_code ?? "TBA"}
            </span>
          </div>
        </div>

        <div className="text-xs font-bold text-muted-foreground px-2">
          {isCompleted ? "vs" : "vs"}
        </div>

        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <span className={cn(
              "font-semibold text-sm",
              isCompleted && winner?.id === (match.team2_id as string)
                ? "text-npl-green-600" : "text-foreground"
            )}>
              {team2?.short_code ?? "TBA"}
            </span>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team2?.primary_color ?? "#ccc" }} />
          </div>
        </div>
      </div>

      {/* Result */}
      {isCompleted && match.result_margin && (
        <p className="text-xs text-center text-muted-foreground mt-2 pt-2 border-t border-border">
          {match.result_margin as string}
        </p>
      )}

      {/* Venue */}
      <p className="text-[10px] text-muted-foreground text-center mt-1">
        {match.venue as string}
      </p>
    </div>
  );
}

export default async function SeasonPage(
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const yearNum = Number(year);

  if (isNaN(yearNum) || yearNum < 2024 || yearNum > 2030) notFound();

  // Try DB, fall back to static
  const [dbSeason, dbTeams] = await Promise.all([
    getSeasonByYear(yearNum),
    getAllTeams(),
  ]);

  const teams = dbTeams.length > 0
    ? dbTeams
    : NPL_TEAMS.map((t, i) => ({ ...t, id: String(i), slug: slugify(t.name) }));

  const staticChampion = SEASON_CHAMPIONS.find((s) => s.year === yearNum);
  const isUpcoming = yearNum >= NPL_META.current_season &&
    !SEASON_CHAMPIONS.find((s) => s.year === yearNum);

  const [matches, awards, pointsRows] = dbSeason
    ? await Promise.all([
        getSeasonMatches(dbSeason.id),
        getSeasonAwards(dbSeason.id),
        getPointsTable(dbSeason.id),
      ])
    : [[], [], []];

  // Group matches by type
  const leagueMatches = matches.filter((m) => m.match_type === "league");
  const playoffMatches = matches.filter((m) => m.match_type !== "league");

  return (
    <div>
      {/* Hero */}
      <div className={cn(
        "relative overflow-hidden",
        isUpcoming
          ? "bg-gradient-to-br from-npl-red-500 to-npl-red-800"
          : "bg-gradient-to-br from-npl-blue-500 to-npl-blue-900"
      )}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
          backgroundSize: "14px 14px",
        }} />
        <div className="section-container relative z-10 py-12">
          <Link href="/history" className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-5 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Seasons
          </Link>

          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex-1">
              {isUpcoming && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/20 px-3 py-1 rounded-full mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Coming Soon
                </span>
              )}
              <h1 className="text-5xl font-black text-white mb-2">NPL {year}</h1>
              <p className="text-white/70 text-sm">
                {NPL_META.title_sponsor} Nepal Premier League · {NPL_META.format}
              </p>
            </div>

            {staticChampion && (
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-npl-gold-400" />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Champions</span>
                </div>
                <p className="text-npl-gold-400 text-xl font-black mb-1">{staticChampion.champion}</p>
                <p className="text-white/60 text-xs mb-3">{staticChampion.final_result}</p>
                <div className="border-t border-white/10 pt-2">
                  <p className="text-white/50 text-xs">Player of Series</p>
                  <p className="text-white text-sm font-bold">{staticChampion.player_of_series}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container py-10 space-y-12">
        {isUpcoming ? (
          <div className="py-20 text-center">
            <div className="text-6xl mb-4">🏏</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">NPL {year} — Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mx-auto text-sm">
              The {year} season details including squad announcements, schedule, and ticket information will be published here when released by CAN.
            </p>
            <Link href="/history" className="inline-flex items-center gap-1.5 mt-6 text-sm text-npl-red-500 hover:underline font-medium">
              <ChevronLeft className="w-4 h-4" /> View past seasons
            </Link>
          </div>
        ) : (
          <>
            {/* Quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Matches",    value: (dbSeason as { total_matches?: number })?.total_matches ?? 32 },
                { label: "Teams",      value: NPL_META.teams },
                { label: "Champion",   value: staticChampion?.champion ?? "TBA" },
                { label: "Runner Up",  value: staticChampion?.runner_up ?? "TBA" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
                  <div className="text-lg font-bold text-foreground leading-tight">{value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            {/* Points table */}
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-npl-blue-500" /> Points Table
              </h2>
              <PointsTable
                rows={pointsRows as Parameters<typeof PointsTable>[0]["rows"]}
                teams={teams as Parameters<typeof PointsTable>[0]["teams"]}
              />
            </section>

            {/* Awards */}
            {(awards.length > 0 || staticChampion) && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-npl-gold-500" /> Season Awards
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {awards.length > 0 ? awards.map((award) => (
                    <div key={award.id} className="rounded-xl border border-npl-gold-200 bg-npl-gold-50/50 dark:bg-npl-gold-950/20 p-4">
                      <p className="text-xs font-semibold text-npl-gold-600 uppercase tracking-wider mb-1">{award.award_name}</p>
                      <Link href={`/players/${(award.player as { slug?: string })?.slug ?? ""}`}
                        className="text-base font-bold text-foreground hover:text-npl-red-500 transition-colors">
                        {(award.player as { full_name?: string })?.full_name ?? "—"}
                      </Link>
                      {award.description && (
                        <p className="text-xs text-muted-foreground mt-1">{award.description}</p>
                      )}
                    </div>
                  )) : staticChampion && (
                    <>
                      {[
                        { name: "Player of the Series", holder: staticChampion.player_of_series },
                        { name: "Orange Cap", holder: yearNum === 2025 ? "Faf du Plessis (323 runs)" : "Rohit Paudel" },
                        { name: "Purple Cap", holder: "Sandeep Lamichhane" },
                        { name: "Best Team", holder: staticChampion.champion },
                      ].map((a) => (
                        <div key={a.name} className="rounded-xl border border-npl-gold-200 bg-npl-gold-50/50 dark:bg-npl-gold-950/20 p-4">
                          <p className="text-xs font-semibold text-npl-gold-600 uppercase tracking-wider mb-1">{a.name}</p>
                          <p className="text-base font-bold text-foreground">{a.holder}</p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </section>
            )}

            {/* Playoff matches */}
            {playoffMatches.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-npl-gold-500" /> Playoffs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {playoffMatches.map((m) => <MatchCard key={m.id} match={m as Record<string, unknown>} />)}
                </div>
              </section>
            )}

            {/* League matches */}
            {leagueMatches.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-npl-blue-400" /> League Matches
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {leagueMatches.map((m) => <MatchCard key={m.id} match={m as Record<string, unknown>} />)}
                </div>
              </section>
            )}

            {matches.length === 0 && (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground text-sm">Match data for NPL {year} will appear here once added via the admin panel.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
