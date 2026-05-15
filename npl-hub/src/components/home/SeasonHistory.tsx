import Link from "next/link";
import { ChevronRight, Trophy, Calendar, Users } from "lucide-react";
import { SEASON_CHAMPIONS, NPL_META } from "@/config/constants";
import { cn } from "@/lib/utils";

const seasons = [
  ...SEASON_CHAMPIONS.map((s) => ({
    year: s.year,
    status: "completed" as const,
    champion: s.champion,
    runner_up: s.runner_up,
    player_of_series: s.player_of_series,
    matches: 32,
    teams: 8,
  })),
  {
    year: NPL_META.current_season,
    status: "upcoming" as const,
    champion: null,
    runner_up: null,
    player_of_series: null,
    matches: null,
    teams: 8,
  },
];

export function SeasonHistory() {
  return (
    <section className="py-14 bg-npl-surface dark:bg-npl-surface border-y border-border">
      <div className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
              Timeline
            </p>
            <h2 className="text-2xl font-bold text-foreground">Season History</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Every NPL season, from inception to present
            </p>
          </div>
          <Link
            href="/history"
            className="hidden sm:flex items-center gap-1 text-sm text-npl-red-500 hover:text-npl-red-600 font-medium"
          >
            Full history <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {seasons.map((season) => {
            const isUpcoming = season.status === "upcoming";
            return (
              <Link
                key={season.year}
                href={`/history/${season.year}`}
                className={cn(
                  "group relative rounded-2xl border p-6 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden",
                  isUpcoming
                    ? "border-dashed border-npl-red-300 dark:border-npl-red-800 bg-gradient-to-br from-npl-red-50 to-npl-gold-50 dark:from-npl-red-950/20 dark:to-npl-gold-950/10"
                    : "border-border bg-background"
                )}
              >
                {/* Year + status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-foreground">{season.year}</span>
                  {isUpcoming ? (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-npl-red-500 bg-npl-red-50 dark:bg-npl-red-950/30 border border-npl-red-200 dark:border-npl-red-800 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-npl-red-500 animate-pulse" />
                      Upcoming
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-npl-green-600 bg-npl-green-50 dark:bg-npl-green-950/30 border border-npl-green-200 dark:border-npl-green-800 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>

                {/* Content */}
                {isUpcoming ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">NPL {season.year}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      The third season of the Nepal Premier League is on the horizon. Squads, schedules and overseas signings coming soon.
                    </p>
                    <p className="text-xs font-medium text-npl-red-500 mt-3 group-hover:underline">
                      Preview season →
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-npl-gold-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Champion</p>
                        <p className="text-sm font-semibold text-foreground">{season.champion}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-npl-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Player of Series</p>
                        <p className="text-sm font-semibold text-foreground">{season.player_of_series}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {season.matches} matches · {season.teams} teams
                      </p>
                    </div>
                    <p className="text-xs font-medium text-npl-red-500 pt-1 group-hover:underline">
                      Full season →
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
