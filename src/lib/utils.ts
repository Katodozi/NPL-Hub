import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Class merge ───────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Countdown helpers ────────────────────────────────────────────────────────
export function getCountdownParts(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds, isPast: false };
}

// ─── Number formatting ─────────────────────────────────────────────────────────
export function formatStat(value: number, decimals = 1): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals);
}

export function formatPrice(lakhs: number): string {
  if (lakhs >= 100) return `NPR ${(lakhs / 100).toFixed(1)}Cr`;
  return `NPR ${lakhs}L`;
}

// ─── Slug helpers ──────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

// ─── Player role label ────────────────────────────────────────────────────────
export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    batter:           "Batter",
    bowler:           "Bowler",
    "all-rounder":    "All-Rounder",
    "wicket-keeper":  "Wicket-Keeper",
  };
  return map[role] ?? role;
}