import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Calendar, Users, ChevronRight, Star } from "lucide-react";
import { getAllSeasons } from "@/lib/db";
import { SEASON_CHAMPIONS, NPL_META } from "@/config/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Season History" };
export const revalidate = 3600;

async function getSeasons() {
  const dbSeasons = await getAllSeasons();
  if (dbSeasons.length > 0) return dbSeasons;
  // Static fallback
  return [
    { id: "2025", year: 2025, status: "completed", title: "NPL 2025", title_sponsor: "Siddhartha Bank", total_matches: 32 },
    { id: "2024", year: 2024, status: "completed", title: "NPL 2024", title_sponsor: "Siddhartha Bank", total_matches: 32 },
  ];
}

export default async function HistoryPage() {
  const seasons = await getSeasons();
  const upcomingSeason = { year: NPL_META.current_season, status: "upcoming" };

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
          Timeline
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">Season History</h1>
        <p className="text-muted-foreground max-w-xl">
          Every edition of the Nepal Premier League — champions, records,
          overseas stars, and the moments that defined each season.
        </p>
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        {/* Spine line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border hidden sm:block" />

        <div className="space-y-6">
          {/* Upcoming season */}
          <div className="relative flex gap-6">
            <div className="hidden sm:flex flex-col items-center">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-npl-red-400 bg-background flex items-center justify-center z-10">
                <span className="text-npl-red-500 font-black text-sm">{upcomingSeason.year}</span>
              </div>
            </div>
            <Link
              href={`/history/${upcomingSeason.year}`}
              className="flex-1 group rounded-2xl border border-dashed border-npl-red-300 bg-npl-red-50/50 dark:bg-npl-red-950/10 p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-npl-red-500 bg-npl-red-100 dark:bg-npl-red-950/40 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-npl-red-500 animate-pulse" />
                      Upcoming
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground mb-1">
                    NPL {upcomingSeason.year}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    The third season of the Nepal Premier League. Squads, schedule and overseas signings to be announced.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-npl-red-500 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          </div>

          {/* Completed seasons */}
          {seasons.map((season, i) => {
            const champion = SEASON_CHAMPIONS.find((s) => s.year === season.year);
            return (
              <div key={season.year} className="relative flex gap-6">
                <div className="hidden sm:flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full border-2 bg-background flex items-center justify-center z-10",
                    i === 0 ? "border-npl-gold-400" : "border-border"
                  )}>
                    {i === 0 ? (
                      <Trophy className="w-5 h-5 text-npl-gold-500" />
                    ) : (
                      <span className="text-muted-foreground font-bold text-xs">{season.year}</span>
                    )}
                  </div>
                </div>

                <Link
                  href={`/history/${season.year}`}
                  className="flex-1 group rounded-2xl border border-border bg-card p-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-npl-green-600 bg-npl-green-50 dark:bg-npl-green-950/30 border border-npl-green-200 dark:border-npl-green-800 px-2 py-0.5 rounded-full">
                          Completed
                        </span>
                        {i === 0 && (
                          <span className="text-xs font-medium text-npl-gold-600 bg-npl-gold-50 border border-npl-gold-200 px-2 py-0.5 rounded-full">
                            Most Recent
                          </span>
                        )}
                      </div>

                      <h2 className="text-2xl font-black text-foreground mb-4 group-hover:text-npl-red-500 transition-colors">
                        NPL {season.year}
                      </h2>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {champion && (
                          <>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-npl-gold-500" /> Champion
                              </p>
                              <p className="text-sm font-bold text-foreground">{champion.champion}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                <Star className="w-3 h-3 text-npl-blue-400" /> Player of Series
                              </p>
                              <p className="text-sm font-bold text-foreground">{champion.player_of_series}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> Matches
                              </p>
                              <p className="text-sm font-bold text-foreground">
                                {(season as { total_matches?: number }).total_matches ?? 32}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-npl-red-500 transition-colors flex-shrink-0 mt-1 hidden sm:block" />
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
