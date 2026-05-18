import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { NPL_TEAMS, SEASON_CHAMPIONS } from "@/config/constants";
import { slugify } from "@/lib/utils";

const champions2024 = SEASON_CHAMPIONS.find((s) => s.year === 2024)?.champion;
const champions2025 = SEASON_CHAMPIONS.find((s) => s.year === 2025)?.champion;

function getTrophies(name: string) {
  const wins = SEASON_CHAMPIONS.filter((s) => s.champion === name).length;
  return wins;
}

export function FeaturedTeams() {
  return (
    <section className="py-14">
      <div className="section-container">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
              Franchises
            </p>
            <h2 className="text-2xl font-bold text-foreground">All 8 Teams</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Representing every province of Nepal
            </p>
          </div>
          <Link
            href="/teams"
            className="hidden sm:flex items-center gap-1 text-sm text-npl-red-500 hover:text-npl-red-600 font-medium transition-colors"
          >
            View all teams
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {NPL_TEAMS.map((team) => {
            const slug = slugify(team.name);
            const trophies = getTrophies(team.name);
            const isChamp25 = team.name === champions2025;
            const isChamp24 = team.name === champions2024;

            return (
              <Link
                key={team.short_code}
                href={`/teams/${slug}`}
                className="group relative flex flex-col rounded-xl border border-border bg-background hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Color band */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: team.primary_color }}
                />

                <div className="p-4 flex flex-col gap-3 flex-1">
                  {/* Logo placeholder + code */}
                  <div className="flex items-center justify-between">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: team.primary_color }}
                    >
                      {team.short_code}
                    </div>
                    <div className="flex gap-1">
                      {isChamp25 && (
                        <span className="text-[10px] font-semibold bg-npl-gold-100 dark:bg-npl-gold-900/30 text-npl-gold-700 dark:text-npl-gold-400 px-1.5 py-0.5 rounded">
                          &apos;25 🏆
                        </span>
                      )}
                      {isChamp24 && !isChamp25 && (
                        <span className="text-[10px] font-semibold bg-npl-gold-100 dark:bg-npl-gold-900/30 text-npl-gold-700 dark:text-npl-gold-400 px-1.5 py-0.5 rounded">
                          &apos;24 🏆
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground leading-tight group-hover:text-npl-red-500 transition-colors">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{team.city}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">{team.province} Province</span>
                    {trophies > 0 && (
                      <span className="text-xs font-medium text-npl-gold-600">
                        {trophies} title{trophies > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="sm:hidden mt-4 text-center">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-sm text-npl-red-500 font-medium"
          >
            View all teams <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
