import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { NPL_TEAMS, SEASON_CHAMPIONS } from "@/config/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Sponsors" };

const TOURNAMENT_SPONSORS = [
  {
    name: "Siddhartha Bank",
    type: "Title Sponsor",
    deal: "2024–2029 (5 seasons)",
    description:
      "Siddhartha Bank Limited is the title sponsor of the Nepal Premier League in a landmark 5-year deal, the largest investment in Nepali sports history.",
    website: "https://siddharthabank.com",
    tier: "title",
  },
  {
    name: "Cricket Association of Nepal (CAN)",
    type: "Organizer",
    deal: "Founding body",
    description:
      "The Cricket Association of Nepal governs all cricket in Nepal and organizes the Nepal Premier League each year.",
    website: "https://can.org.np",
    tier: "organizer",
  },
];

const TIER_STYLE: Record<string, string> = {
  title:     "border-npl-gold-300 bg-npl-gold-50/60 dark:bg-npl-gold-950/20",
  organizer: "border-npl-blue-200 bg-npl-blue-50/40 dark:bg-npl-blue-950/20",
  associate: "border-border bg-card",
};

const TIER_BADGE: Record<string, string> = {
  title:     "bg-npl-gold-100  text-npl-gold-700  border-npl-gold-200",
  organizer: "bg-npl-blue-100  text-npl-blue-700  border-npl-blue-200",
  associate: "bg-muted          text-muted-foreground border-border",
};

export default function SponsorsPage() {
  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
          Partners
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">Sponsors</h1>
        <p className="text-muted-foreground max-w-xl">
          The organizations and brands that make the Nepal Premier League
          possible — from the title sponsor to team kit partners.
        </p>
      </div>

      {/* Tournament sponsors */}
      <section className="mb-14">
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-npl-gold-500 flex-shrink-0" />
          Tournament Partners
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {TOURNAMENT_SPONSORS.map((sponsor) => (
            <div
              key={sponsor.name}
              className={cn(
                "rounded-2xl border p-6 flex flex-col gap-4",
                TIER_STYLE[sponsor.tier]
              )}
            >
              {/* Logo placeholder */}
              <div className="flex items-start justify-between gap-3">
                <div className="w-14 h-14 rounded-xl bg-white dark:bg-white/10 border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-lg font-black text-foreground">
                    {sponsor.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full border",
                  TIER_BADGE[sponsor.tier]
                )}>
                  {sponsor.type}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">
                  {sponsor.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  {sponsor.deal}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {sponsor.description}
                </p>
              </div>

              {sponsor.website && (
                <a
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-npl-red-500 hover:text-npl-red-600 font-medium mt-auto transition-colors"
                >
                  Visit website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team sponsors */}
      <section className="mb-14">
        <h2 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-npl-red-500 flex-shrink-0" />
          Franchise Teams
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Each franchise brings its own commercial partnerships. Team-specific
          sponsor data will appear here once submitted via the admin panel.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NPL_TEAMS.map((team) => (
            <div
              key={team.name}
              className="rounded-xl border border-border bg-card p-4 flex flex-col items-center text-center gap-2"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ backgroundColor: team.primary_color }}
              >
                {team.short_code}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground leading-tight">
                  {team.name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {team.city}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Sponsor data coming soon
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Seasons strip */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-npl-blue-500 flex-shrink-0" />
          Season-by-Season Title Sponsor
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-5 py-3">Season</th>
                <th className="text-left px-5 py-3">Title Sponsor</th>
                <th className="text-left px-5 py-3">Champion</th>
                <th className="text-left px-5 py-3">Runner Up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SEASON_CHAMPIONS.map((s) => (
                <tr key={s.year} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-bold text-foreground">NPL {s.year}</td>
                  <td className="px-5 py-3 text-muted-foreground">Siddhartha Bank</td>
                  <td className="px-5 py-3 font-semibold text-npl-gold-600">{s.champion}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.runner_up}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
