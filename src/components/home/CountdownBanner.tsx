"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCountdownParts } from "@/lib/utils";
import { NPL_META } from "@/config/constants";

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="bg-npl-blue-500 dark:bg-npl-blue-700 text-white font-bold text-xl sm:text-2xl w-14 sm:w-16 py-2 rounded-lg text-center tabular-nums shadow-sm">
        {display}
      </div>
      <span className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <div className="text-npl-blue-300 font-bold text-xl sm:text-2xl pb-4 select-none">:</div>
  );
}

export function CountdownBanner() {
  const [mounted, setMounted] = useState(false);
  const [parts, setParts] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false,
  });

  useEffect(() => {
    setMounted(true);
    setParts(getCountdownParts(NPL_META.next_season_start));
    const id = setInterval(() => {
      setParts(getCountdownParts(NPL_META.next_season_start));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;
  if (parts.isPast) return null;

  return (
    <section className="border-b border-border bg-npl-surface dark:bg-npl-surface">
      <div className="section-container py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
          {/* Label */}
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-1.5 justify-center sm:justify-start mb-0.5">
              <span className="w-2 h-2 rounded-full bg-npl-red-500 animate-pulse" />
              <span className="text-xs font-semibold text-npl-red-500 uppercase tracking-wider">
                Countdown
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground">
              NPL {NPL_META.current_season} starts in
            </h2>
            <p className="text-sm text-muted-foreground">
              Powered by {NPL_META.title_sponsor}
            </p>
          </div>

          {/* Digits */}
          <div className="flex items-center gap-2">
            <Digit value={parts.days} label="Days" />
            <Colon />
            <Digit value={parts.hours} label="Hours" />
            <Colon />
            <Digit value={parts.minutes} label="Mins" />
            <Colon />
            <Digit value={parts.seconds} label="Secs" />
          </div>

          {/* CTA */}
          <Link
            href="/history/2026"
            className="text-sm font-medium text-npl-red-500 hover:text-npl-red-600 border border-npl-red-200 hover:border-npl-red-300 dark:border-npl-red-800 px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Preview NPL 2026 →
          </Link>
        </div>
      </div>
    </section>
  );
}
