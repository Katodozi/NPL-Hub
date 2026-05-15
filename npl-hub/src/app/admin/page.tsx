import { createServerSupabaseClient } from "@/lib/supabase-server";
import { Users, Building2, Calendar, Trophy, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getBuildClient } from "@/lib/db";

async function getAdminStats() {
  const supabase = getBuildClient();
  const [players, teams, matches, awards] = await Promise.all([
    supabase.from("players").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("matches").select("id", { count: "exact", head: true }),
    supabase.from("awards").select("id", { count: "exact", head: true }),
  ]);
  return {
    players: players.count ?? 0,
    teams:   teams.count   ?? 0,
    matches: matches.count ?? 0,
    awards:  awards.count  ?? 0,
  };
}

const QUICK_ACTIONS = [
  { href: "/admin/players/new", label: "Add Player",  icon: Users,    color: "bg-npl-blue-500"  },
  { href: "/admin/teams/new",   label: "Add Team",    icon: Building2,color: "bg-npl-green-500" },
  { href: "/admin/matches/new", label: "Add Match",   icon: Calendar, color: "bg-npl-red-500"   },
  { href: "/admin/awards/new",  label: "Add Award",   icon: Trophy,   color: "bg-npl-gold-500"  },
];

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const STAT_CARDS = [
    { label: "Players",  value: stats.players, icon: Users,     href: "/admin/players"  },
    { label: "Teams",    value: stats.teams,   icon: Building2, href: "/admin/teams"    },
    { label: "Matches",  value: stats.matches, icon: Calendar,  href: "/admin/matches"  },
    { label: "Awards",   value: stats.awards,  icon: Trophy,    href: "/admin/awards"   },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage NPL Hub data — players, matches, teams, and awards.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-border bg-card p-5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <Icon className="w-5 h-5 text-muted-foreground mb-3" />
            <div className="text-3xl font-black text-foreground tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
              {label}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
            >
              <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Setup checklist */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">
          🚀 Setup Checklist
        </h2>
        <div className="space-y-3">
          {[
            { done: stats.teams > 0,   label: "Add all 8 franchise teams",         href: "/admin/teams/new"   },
            { done: stats.players > 0, label: "Add players (local + overseas)",     href: "/admin/players/new" },
            { done: stats.matches > 0, label: "Add NPL 2024 match results",         href: "/admin/matches/new" },
            { done: stats.matches > 32,label: "Add NPL 2025 match results",         href: "/admin/matches/new" },
            { done: stats.awards > 0,  label: "Add season awards",                  href: "/admin/awards/new"  },
          ].map(({ done, label, href }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${done ? "border-npl-green-500 bg-npl-green-500" : "border-border"}`}>
                  {done && <span className="text-white text-[8px] font-black">✓</span>}
                </div>
                <span className={`text-sm ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {label}
                </span>
              </div>
              {!done && (
                <Link href={href} className="text-xs text-npl-red-500 hover:underline font-medium flex items-center gap-0.5 flex-shrink-0">
                  <Plus className="w-3 h-3" /> Add
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
