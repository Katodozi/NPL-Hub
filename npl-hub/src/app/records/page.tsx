"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Target, TrendingUp, Shield, Users, Zap } from "lucide-react";
import { ALL_TIME_RECORDS } from "@/config/constants";
import { cn } from "@/lib/utils";

// Static records — will hydrate from DB once seeded
const CATEGORIES = [
  { key: "all",        label: "All Records",  icon: Trophy    },
  { key: "batting",    label: "Batting",      icon: TrendingUp },
  { key: "bowling",    label: "Bowling",      icon: Target    },
  { key: "fielding",   label: "Fielding",     icon: Shield    },
  { key: "team",       label: "Team",         icon: Users     },
] as const;

const CATEGORY_STYLE: Record<string, { badge: string; icon: string; accent: string }> = {
  batting:  { badge: "bg-npl-gold-50  text-npl-gold-700  border-npl-gold-200",  icon: "text-npl-gold-500",  accent: "border-l-npl-gold-400"  },
  bowling:  { badge: "bg-npl-red-50   text-npl-red-700   border-npl-red-200",   icon: "text-npl-red-500",   accent: "border-l-npl-red-400"   },
  fielding: { badge: "bg-npl-blue-50  text-npl-blue-700  border-npl-blue-200",  icon: "text-npl-blue-500",  accent: "border-l-npl-blue-400"  },
  team:     { badge: "bg-npl-green-50 text-npl-green-700 border-npl-green-200", icon: "text-npl-green-500", accent: "border-l-npl-green-400" },
};

const CAT_ICONS: Record<string, React.ElementType> = {
  batting: TrendingUp, bowling: Target, fielding: Shield, team: Users,
};

export default function RecordsPage() {
  const [active, setActive] = useState<"all" | "batting" | "bowling" | "fielding" | "team">("all");

  const filtered = active === "all"
    ? ALL_TIME_RECORDS
    : ALL_TIME_RECORDS.filter((r) => r.category === active);

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
          Hall of Fame
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">All-time Records</h1>
        <p className="text-muted-foreground max-w-xl">
          Records set across every NPL season. Updated automatically as new
          match data is added.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-150",
              active === key
                ? "bg-npl-red-500 text-white border-npl-red-500 shadow-sm"
                : "bg-background text-muted-foreground border-border hover:border-npl-red-300 hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Records grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((record, i) => {
          const style = CATEGORY_STYLE[record.category] ?? CATEGORY_STYLE.batting;
          const Icon = CAT_ICONS[record.category] ?? Trophy;
          return (
            <div
              key={i}
              className={cn(
                "group relative rounded-xl border border-border bg-card p-5 border-l-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden",
                style.accent
              )}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-npl-red-50/30 to-transparent dark:from-npl-red-950/10 pointer-events-none rounded-xl" />

              <div className="relative z-10">
                {/* Category badge */}
                <div className={cn(
                  "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border mb-3",
                  style.badge
                )}>
                  <Icon className="w-3 h-3" />
                  {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                </div>

                {/* Record label */}
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">
                  {record.label}
                </p>

                {/* Value — the big number */}
                <div className="text-4xl font-black text-foreground tabular-nums mb-3 leading-none">
                  {record.value}
                </div>

                {/* Holder info */}
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">
                      {record.holder}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {record.team}
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                    NPL {record.season}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-muted-foreground">No records in this category yet.</p>
        </div>
      )}

      {/* DB note */}
      <div className="mt-10 rounded-xl border border-border bg-muted/30 px-5 py-4 flex items-start gap-3">
        <Zap className="w-4 h-4 text-npl-gold-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Records are live-computed.</span>{" "}
          When match data is added via the admin panel, all records update
          automatically from the database. Current records above are static
          placeholders until the database is seeded.
        </div>
      </div>
    </div>
  );
}
