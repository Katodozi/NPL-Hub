import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Trophy, Users } from "lucide-react";
import { getAllTeams } from "@/lib/db";
import { NPL_TEAMS, SEASON_CHAMPIONS } from "@/config/constants";
import { slugify } from "@/lib/utils";

export const metadata: Metadata = { title: "Teams" };
export const revalidate = 3600;

function getTrophies(name: string) {
  return SEASON_CHAMPIONS.filter((s) => s.champion === name).length;
}

// Falls back to static constants if Supabase has no data yet
async function getTeams() {
  const dbTeams = await getAllTeams();
  if (dbTeams.length > 0) return dbTeams;
  return NPL_TEAMS.map((t, i) => ({ ...t, id: String(i), slug: slugify(t.name) }));
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
          Franchises
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">All 8 Teams</h1>
        <p className="text-muted-foreground max-w-xl">
          Eight franchises representing every province of Nepal, competing
          annually in the Siddhartha Bank Nepal Premier League.
        </p>
      </div>

      {/* Season champions strip */}
      <div className="flex flex-wrap gap-3 mb-10">
        {SEASON_CHAMPIONS.map((s) => (
          <div
            key={s.year}
            className="flex items-center gap-2 bg-npl-gold-50 border border-npl-gold-200 rounded-lg px-4 py-2"
          >
            <Trophy className="w-4 h-4 text-npl-gold-600" />
            <span className="text-sm font-medium text-npl-gold-800">
              NPL {s.year}: <span className="font-bold">{s.champion}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Teams grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {teams.map((team) => {
          const slug = "slug" in team ? team.slug : slugify(team.name);
          const trophies = getTrophies(team.name);

          return (
            <Link
              key={team.name}
              href={`/teams/${slug}`}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Color header */}
              <div
                className="h-24 flex items-center justify-center relative overflow-hidden"
                style={{ backgroundColor: team.primary_color }}
              >
                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
                    backgroundSize: "12px 12px",
                  }}
                />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-white font-black text-3xl tracking-tight">
                    {team.short_code}
                  </span>
                  {trophies > 0 && (
                    <span className="text-xs text-white/80 font-medium mt-0.5">
                      {"🏆".repeat(trophies)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div>
                  <h2 className="font-bold text-base text-foreground group-hover:text-npl-red-500 transition-colors leading-tight">
                    {team.name}
                  </h2>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{team.city}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Province</span>
                    <span className="text-foreground font-medium">{team.province}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Home ground</span>
                    <span className="text-foreground font-medium text-right leading-tight">
                      {team.home_venue ?? "TBA"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Titles</span>
                    <span className={trophies > 0 ? "text-npl-gold-600 font-bold" : "text-foreground font-medium"}>
                      {trophies > 0 ? `${trophies} title${trophies > 1 ? "s" : ""}` : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border">
                  <span className="text-xs font-medium text-npl-red-500 group-hover:underline">
                    View squad & stats →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
