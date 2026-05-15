import Link from "next/link";
import { ChevronRight, Flame, Zap } from "lucide-react";
import { CAP_LEADERS } from "@/config/constants";
import { cn } from "@/lib/utils";

function CapCard({
  type,
  data,
}: {
  type: "orange" | "purple";
  data: typeof CAP_LEADERS.golden | typeof CAP_LEADERS.platinum;
}) {
  const isOrange = type === "orange";
  return (
    <div
      className={cn(
        "relative flex-1 rounded-2xl p-6 overflow-hidden border",
        isOrange
          ? "bg-gradient-to-br from-npl-gold-50 to-orange-50 border-npl-gold-200 dark:from-npl-gold-950/30 dark:to-orange-950/20 dark:border-npl-gold-800/40"
          : "bg-gradient-to-br from-gray-50 to-zinc-50 border-gray-200 dark:from-gray-900/30 dark:to-zinc-900/20 dark:border-gray-800/40"
      )}
    >
      {/* Background icon */}
      <div
        className={cn(
          "absolute -right-4 -top-4 opacity-10",
          isOrange ? "text-npl-gold-500" : "text-zinc-500"
        )}
      >
        {isOrange ? (
          <Flame className="w-32 h-32" />
        ) : (
          <Zap className="w-32 h-32" />
        )}
      </div>

      {/* Cap label */}
      <div className="relative z-10">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-4",
            isOrange
              ? "bg-npl-gold-200/70 text-npl-gold-800 dark:bg-npl-gold-900/50 dark:text-npl-gold-300"
              : "bg-gray-200/70 text-gray-800 dark:bg-gray-800/50 dark:text-gray-200"
          )}
        >
          {isOrange ? "🧢" : "🟣"} {data.label}
        </div>

        {/* Player avatar placeholder */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0",
              isOrange ? "bg-npl-gold-500" : "bg-black-600"
            )}
          >
            {data.holder.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground leading-tight">
              {data.holder}
            </h3>
            <p className="text-sm text-muted-foreground">{data.team}</p>
            <span className="inline-block text-xs font-medium mt-1 text-muted-foreground border border-border rounded px-1.5 py-0.5 bg-background/60">
              {data.nationality}
            </span>
          </div>
        </div>

        {/* Value */}
        <div
          className={cn(
            "text-3xl font-bold mb-1",
            isOrange ? "text-npl-gold-700 dark:text-npl-gold-400" : "text-black-700 dark:text-black-400"
          )}
        >
          {data.value}
        </div>
        <p className="text-xs text-muted-foreground">NPL 2025</p>
      </div>
    </div>
  );
}

export function CapLeaders() {
  return (
    <section className="py-14 bg-npl-surface dark:bg-npl-surface border-y border-border">
      <div className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
              Season 2025
            </p>
            <h2 className="text-2xl font-bold text-foreground">Cap Leaders</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Top run-scorer and wicket-taker of NPL 2025
            </p>
          </div>
          <Link
            href="/players"
            className="hidden sm:flex items-center gap-1 text-sm text-npl-red-500 hover:text-npl-red-600 font-medium transition-colors"
          >
            All players <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <CapCard type="orange" data={CAP_LEADERS.golden} />
          <CapCard type="purple" data={CAP_LEADERS.platinum} />
        </div>
      </div>
    </section>
  );
}
