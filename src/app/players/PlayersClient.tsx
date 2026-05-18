"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, Users } from "lucide-react";
import type { Player } from "@/types";
import { roleLabel, cn } from "@/lib/utils";

const ROLES = ["all", "batter", "bowler", "all-rounder", "wicket-keeper"] as const;
const TYPES = ["all", "local", "overseas"] as const;

const ROLE_COLORS: Record<string, string> = {
  batter:          "bg-blue-50 text-blue-700",
  bowler:          "bg-red-50 text-red-700",
  "all-rounder":   "bg-green-50 text-green-700",
  "wicket-keeper": "bg-purple-50 text-purple-700",
};

// ── Placeholder cards when Supabase has no players yet ───────────────────────
const PLACEHOLDER: Player[] = Array.from({ length: 12 }, (_, i) => ({
  id: String(i),
  full_name: ["Rohit Paudel", "Sandeep Lamichhane", "Kushal Bhurtel",
    "Aasif Sheikh", "Karan KC", "Sompal Kami",
    "Faf du Plessis", "Dawid Malan", "Wayne Parnell",
    "Adam Rossington", "Binod Bhandari", "Dipendra Singh Airee"][i],
  short_name: ["Paudel", "Lamichhane", "Bhurtel",
    "Sheikh", "Karan", "Sompal",
    "du Plessis", "Malan", "Parnell",
    "Rossington", "Bhandari", "Airee"][i],
  nationality: i < 6 ? "Nepal" : ["South Africa","England","South Africa","England","Nepal","Nepal"][i - 6],
  dob: null,
  role: (["batter","bowler","batter","wicket-keeper","bowler","bowler",
           "batter","batter","bowler","wicket-keeper","wicket-keeper","all-rounder"] as Player["role"][])[i],
  batting_style: "right-hand",
  bowling_style: "none",
  image_url: null,
  bio: null,
  is_overseas: i >= 6,
  slug: ["rohit-paudel","sandeep-lamichhane","kushal-bhurtel",
    "aasif-sheikh","karan-kc","sompal-kami",
    "faf-du-plessis","dawid-malan","wayne-parnell",
    "adam-rossington","binod-bhandari","dipendra-singh-airee"][i],
}));

function PlayerCard({ player }: { player: Player }) {
  const initials = player.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return (
    <Link
      href={`/players/${player.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Avatar area */}
      <div className="bg-gradient-to-br from-npl-blue-500 to-npl-blue-700 h-28 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "10px 10px",
          }}
        />
        {player.image_url ? (
          <img
            src={player.image_url}
            alt={player.full_name}
            className="w-20 h-20 rounded-full object-cover border-2 border-white/30 relative z-10"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center relative z-10">
            <span className="text-white font-black text-2xl">{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-bold text-sm text-foreground group-hover:text-npl-red-500 transition-colors leading-tight">
          {player.full_name}
        </h3>
        <div className="flex flex-wrap gap-1">
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", ROLE_COLORS[player.role] ?? "bg-muted text-muted-foreground")}>
            {roleLabel(player.role)}
          </span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", player.is_overseas ? "bg-orange-50 text-orange-700" : "bg-green-50 text-green-700")}>
            {player.is_overseas ? "Overseas" : "Local"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-auto">{player.nationality}</p>
      </div>
    </Link>
  );
}

export function PlayersClient({ players }: { players: Player[] }) {
  const source = players.length > 0 ? players : PLACEHOLDER;
  const [search, setSearch]   = useState("");
  const [role, setRole]       = useState<typeof ROLES[number]>("all");
  const [type, setType]       = useState<typeof TYPES[number]>("all");

  const filtered = useMemo(() => {
    return source.filter((p) => {
      const matchSearch = search === "" ||
        p.full_name.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality.toLowerCase().includes(search.toLowerCase());
      const matchRole = role === "all" || p.role === role;
      const matchType = type === "all" ||
        (type === "local" && !p.is_overseas) ||
        (type === "overseas" && p.is_overseas);
      return matchSearch && matchRole && matchType;
    });
  }, [source, search, role, type]);

  const localCount    = source.filter((p) => !p.is_overseas).length;
  const overseasCount = source.filter((p) => p.is_overseas).length;

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">Directory</p>
        <h1 className="text-3xl font-bold text-foreground mb-2">Players</h1>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {source.length} total players
          </span>
          <span>·</span>
          <span className="text-green-600 font-medium">{localCount} local</span>
          <span>·</span>
          <span className="text-orange-600 font-medium">{overseasCount} overseas</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors"
          />
        </div>

        {/* Role filter */}
        <div className="flex gap-1 flex-wrap">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                role === r
                  ? "bg-npl-red-500 text-white border-npl-red-500"
                  : "bg-background text-muted-foreground border-border hover:border-npl-red-300 hover:text-foreground"
              )}
            >
              {r === "all" ? "All Roles" : roleLabel(r)}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-1">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                type === t
                  ? "bg-npl-blue-500 text-white border-npl-blue-500"
                  : "bg-background text-muted-foreground border-border hover:border-npl-blue-300 hover:text-foreground"
              )}
            >
              {t === "all" ? "All Players" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground mb-5">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> player{filtered.length !== 1 ? "s" : ""}
        {players.length === 0 && (
          <span className="ml-2 text-npl-gold-600 font-medium">
            (sample data — add real players via admin panel)
          </span>
        )}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-muted-foreground text-sm">No players match your filters.</p>
          <button onClick={() => { setSearch(""); setRole("all"); setType("all"); }}
            className="mt-3 text-xs text-npl-red-500 hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
