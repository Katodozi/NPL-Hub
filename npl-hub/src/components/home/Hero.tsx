"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Calendar } from "lucide-react";
import { SEASON_CHAMPIONS, NPL_META } from "@/config/constants";

const latest = SEASON_CHAMPIONS[SEASON_CHAMPIONS.length - 1];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-npl-blue-500 dark:bg-npl-blue-900 min-h-[560px] flex items-center">
      {/* Geometric background pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-cricket-lines opacity-100" />
        {/* Red gradient orb top-right */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-npl-red-500/20 blur-3xl" />
        {/* Gold accent orb bottom-left */}
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-npl-gold-500/10 blur-3xl" />
        {/* Diagonal accent lines */}
        <svg
          className="absolute inset-0 w-full h-full opacity-5"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="section-container relative z-10 py-16 md:py-20">
        <div className="max-w-3xl">
          {/* Season badge */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-npl-gold-400 animate-pulse" />
            {NPL_META.title_sponsor} presents the Nepal Premier League
          </motion.div>

          {/* Main heading */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5 text-balance"
          >
            The Home of{" "}
            <span className="text-npl-gold-400">Nepal</span>{" "}
            Premier League
          </motion.h1>

          {/* Sub */}
          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="text-white/70 text-base sm:text-lg leading-relaxed mb-8 max-w-xl"
          >
            Player stats, franchise history, all-time records, and live
            dashboards — every NPL season, every match, every hero.
          </motion.p>

          {/* CTAs */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex flex-wrap gap-3 mb-12"
          >
            <Link
              href="/players"
              className="inline-flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Explore Players
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/records"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              View Records
            </Link>
            <Link
              href="/history/2026"
              className="inline-flex items-center gap-2 bg-npl-gold-500 hover:bg-npl-gold-600 text-npl-blue-900 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-npl-blue-900/60 animate-pulse" />
              NPL 2026
            </Link>
          </motion.div>

          {/* Quick stats row */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-4 max-w-md"
          >
            {[
              { icon: Trophy, label: "Seasons", value: "2" },
              { icon: Users, label: "Teams", value: `${NPL_META.teams}` },
              { icon: Calendar, label: "Matches Played", value: "64" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm"
              >
                <Icon className="w-4 h-4 text-npl-gold-400 mb-1" />
                <span className="text-white font-bold text-lg leading-none">{value}</span>
                <span className="text-white/60 text-xs mt-0.5">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Defending champion badge — floats right on md+ */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 md:mt-0 md:absolute md:right-8 md:top-1/2 md:-translate-y-1/2 md:max-w-[240px]"
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-npl-gold-400" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">
                NPL {latest.year} Champions
              </span>
            </div>
            <p className="text-xl font-bold text-npl-gold-400 mb-1">{latest.champion}</p>
            <p className="text-xs text-white/60 mb-3">{latest.final_result}</p>
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs text-white/50 mb-0.5">Player of the Series</p>
              <p className="text-sm font-semibold">{latest.player_of_series}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
