import Link from "next/link";
import { ChevronRight, Trophy, Target, Zap, Shield, TrendingUp, Star } from "lucide-react";
import { ALL_TIME_RECORDS } from "@/config/constants";
import { cn } from "@/lib/utils";

const CATEGORY_CONFIG = {
  batting: { icon: TrendingUp, color: "text-npl-gold-500", bg: "bg-npl-gold-50 dark:bg-npl-gold-950/30" },
  bowling: { icon: Target,     color: "text-npl-red-500",  bg: "bg-npl-red-50 dark:bg-npl-red-950/30"  },
  fielding: { icon: Shield,    color: "text-npl-blue-500", bg: "bg-npl-blue-50 dark:bg-npl-blue-950/30"},
  team:     { icon: Trophy,    color: "text-npl-green-500",bg: "bg-npl-green-50 dark:bg-npl-green-950/30"},
};

export function RecordsSpotlight() {
  return (
    <section className="py-14">
      <div className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
              Hall of Fame
            </p>
            <h2 className="text-2xl font-bold text-foreground">All-time Records</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Records set across NPL 2024 &amp; 2025
            </p>
          </div>
          <Link
            href="/records"
            className="hidden sm:flex items-center gap-1 text-sm text-npl-red-500 hover:text-npl-red-600 font-medium"
          >
            Full records <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_TIME_RECORDS.map((record, i) => {
            const cfg = CATEGORY_CONFIG[record.category as keyof typeof CATEGORY_CONFIG] ??
              CATEGORY_CONFIG.batting;
            const Icon = cfg.icon;

            return (
              <div
                key={i}
                className="group relative rounded-xl border border-border bg-background p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Subtle background on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-npl-red-50/40 to-transparent dark:from-npl-red-950/10 pointer-events-none rounded-xl" />

                <div className="relative z-10">
                  {/* Category badge */}
                  <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold mb-3", cfg.bg, cfg.color)}>
                    <Icon className="w-3 h-3" />
                    {record.category.charAt(0).toUpperCase() + record.category.slice(1)}
                  </div>

                  {/* Record label */}
                  <p className="text-xs text-muted-foreground mb-1">{record.label}</p>

                  {/* Value */}
                  <div className="text-3xl font-bold text-foreground tabular-nums mb-2 leading-none">
                    {record.value}
                  </div>

                  {/* Holder */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{record.holder}</p>
                      <p className="text-xs text-muted-foreground">{record.team}</p>
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {record.season}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sm:hidden mt-4 text-center">
          <Link href="/records" className="text-sm text-npl-red-500 font-medium">
            See all records →
          </Link>
        </div>
      </div>
    </section>
  );
}
