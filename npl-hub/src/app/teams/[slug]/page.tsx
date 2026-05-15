import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Trophy, Users, Calendar, ChevronLeft } from "lucide-react";
import {
  getTeamBySlug, getTeamRoster,
  getTeamSeasonRecord, getAllTeams,
} from "@/lib/db";
import { NPL_TEAMS, SEASON_CHAMPIONS } from "@/config/constants";
import { slugify, roleLabel } from "@/lib/utils";

// ── Static params for build-time generation ─────────────────────────────────
export async function generateStaticParams() {
  // Use the browser client (no cookies needed) for build-time static generation
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase.from("teams").select("slug");
  const dbSlugs = data?.map((t) => ({ slug: t.slug })) ?? [];

  // Always include static fallbacks so the page works before DB is seeded
  const staticSlugs = NPL_TEAMS.map((t) => ({ slug: slugify(t.name) }));

  // Merge, deduplicate
  const all = [...staticSlugs, ...dbSlugs];
  const seen = new Set<string>();
  return all.filter((s) => {
    if (seen.has(s.slug)) return false;
    seen.add(s.slug);
    return true;
  });
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  const fallback = NPL_TEAMS.find((t) => slugify(t.name) === slug);
  const name = team?.name ?? fallback?.name ?? "Team";
  return { title: name };
}

export const revalidate = 3600;

// ── Role badge colours ───────────────────────────────────────────────────────
const ROLE_COLORS: Record<string, string> = {
  batter:          "bg-blue-50 text-blue-700",
  bowler:          "bg-red-50 text-red-700",
  "all-rounder":   "bg-green-50 text-green-700",
  "wicket-keeper": "bg-purple-50 text-purple-700",
};

export default async function TeamPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Try DB first, fall back to static constants
  let team = await getTeamBySlug(slug);
  const staticTeam = NPL_TEAMS.find((t) => slugify(t.name) === slug);
  if (!team && !staticTeam) notFound();

  const displayTeam = team ?? { ...staticTeam!, id: "", slug };
  const roster       = team ? await getTeamRoster(team.id) : [];
  const matchHistory = team ? await getTeamSeasonRecord(team.id) : [];
  const trophies     = SEASON_CHAMPIONS.filter((s) => s.champion === displayTeam.name);

  // Compute W/L
  const wins   = matchHistory.filter((m) => m.winner_id === team?.id).length;
  const losses = matchHistory.filter(
    (m) => m.is_completed && m.winner_id && m.winner_id !== team?.id
  ).length;

  return (
    <div>
      {/* Hero banner */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: displayTeam.primary_color }}
      >
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "14px 14px",
          }}
        />
        <div className="section-container relative z-10 py-12">
          <Link
            href="/teams"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> All Teams
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Logo placeholder */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-3xl tracking-tight">
                {displayTeam.short_code}
              </span>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-1">
                {displayTeam.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-white/70 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {displayTeam.city}, {displayTeam.province} Province
                </span>
                <span>·</span>
                <span>Est. {displayTeam.founded_year}</span>
                {displayTeam.home_venue && (
                  <>
                    <span>·</span>
                    <span>{displayTeam.home_venue}</span>
                  </>
                )}
              </div>
            </div>

            {/* Trophy count */}
            {trophies.length > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-5 py-3 text-center">
                <div className="text-2xl mb-0.5">{"🏆".repeat(trophies.length)}</div>
                <div className="text-white font-bold text-sm">
                  {trophies.length} Title{trophies.length > 1 ? "s" : ""}
                </div>
                <div className="text-white/60 text-xs">
                  {trophies.map((t) => t.year).join(", ")}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section-container py-10 space-y-12">

        {/* Quick stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "NPL Seasons",    value: "2" },
            { label: "Matches Played", value: matchHistory.length || "—" },
            { label: "Wins",           value: wins   || "—" },
            { label: "Losses",         value: losses || "—" },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4 text-center">
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Champions section */}
        {trophies.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-npl-gold-500" /> Championship Seasons
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {trophies.map((t) => (
                <div
                  key={t.year}
                  className="rounded-xl border border-npl-gold-200 bg-npl-gold-50 p-5"
                >
                  <div className="text-3xl font-black text-npl-gold-700 mb-1">
                    NPL {t.year}
                  </div>
                  <p className="text-sm text-npl-gold-800 font-medium mb-1">
                    {t.final_result}
                  </p>
                  <p className="text-xs text-npl-gold-600">
                    Player of Series: <span className="font-semibold">{t.player_of_series}</span>
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Squad */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-npl-blue-500" /> Squad
          </h2>

          {roster.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="text-muted-foreground text-sm">
                Squad data will appear here once added via the admin panel.
              </p>
              <Link
                href="/admin/players"
                className="inline-block mt-3 text-xs text-npl-red-500 hover:underline"
              >
                Add players →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((entry) => {
                const p = entry.player;
                if (!p) return null;
                return (
                  <Link
                    key={p.id}
                    href={`/players/${p.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: displayTeam.primary_color }}
                    >
                      {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground group-hover:text-npl-red-500 transition-colors truncate">
                        {p.full_name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${ROLE_COLORS[p.role] ?? "bg-muted text-muted-foreground"}`}>
                          {roleLabel(p.role)}
                        </span>
                        {p.is_overseas && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {p.nationality}
                          </span>
                        )}
                      </div>
                    </div>
                    {entry.is_marquee && (
                      <span className="text-npl-gold-500 text-xs font-bold flex-shrink-0">★</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent matches */}
        {matchHistory.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-npl-green-500" /> Recent Matches
            </h2>
            <div className="space-y-2">
              {matchHistory.slice(0, 10).map((match) => {
                const isWin = match.winner_id === team?.id;
                const opponent = match.team1_id === team?.id
                  ? match.team2 : match.team1;
                return (
                  <div
                    key={match.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-6 flex items-center justify-center rounded text-xs font-bold ${isWin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {isWin ? "W" : "L"}
                      </span>
                      <span className="font-medium text-foreground">
                        vs {(opponent as { name?: string })?.name ?? "TBA"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <span className="text-xs">{match.result_margin}</span>
                      <span className="text-xs">
                        {new Date(match.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
