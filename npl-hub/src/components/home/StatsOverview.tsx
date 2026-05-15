"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Zap, Star, Target, Shield, Award, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { icon: Zap,       label: "Total Sixes",        value: 847,   suffix: "",  color: "text-npl-gold-500" },
  { icon: Target,    label: "Total Wickets",       value: 1240,  suffix: "",  color: "text-npl-red-500"  },
  { icon: TrendingUp,label: "Total Runs",          value: 42380, suffix: "+", color: "text-npl-blue-500" },
  { icon: Star,      label: "Fifties",             value: 96,    suffix: "",  color: "text-npl-gold-500" },
  { icon: Award,     label: "Centuries",           value: 7,     suffix: "",  color: "text-npl-red-500"  },
  { icon: Shield,    label: "Overseas Stars",      value: 64,    suffix: "+", color: "text-npl-green-500"},
];

function AnimatedNumber({
  target,
  suffix,
  running,
}: {
  target: number;
  suffix: string;
  running: boolean;
}) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const duration = 1600;

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * target));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    }
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [running, target]);

  return (
    <span className="tabular-nums">
      {val.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsOverview() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="border-b border-border py-10">
      <div className="section-container">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
            All-time NPL
          </p>
          <h2 className="text-2xl font-bold text-foreground">By the numbers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated across all {" "}
            <span className="font-medium text-foreground">2 completed seasons</span>{" "}
            of Nepal Premier League
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {STATS.map(({ icon: Icon, label, value, suffix, color }) => (
            <div
              key={label}
              className={cn(
                "flex flex-col items-center text-center p-4 rounded-xl bg-npl-surface border border-border",
                "transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
              )}
            >
              <Icon className={cn("w-5 h-5 mb-2", color)} />
              <span className="text-2xl font-bold text-foreground leading-none">
                <AnimatedNumber target={value} suffix={suffix} running={inView} />
              </span>
              <span className="text-xs text-muted-foreground mt-1.5 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
