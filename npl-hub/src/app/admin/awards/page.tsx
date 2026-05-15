"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";

const AWARD_NAMES = [
  "Player of the Series",
  "Orange Cap (Most Runs)",
  "Purple Cap (Most Wickets)",
  "Emerging Player of the Tournament",
  "Best Wicket-Keeper",
  "MCC Spirit of Cricket Award",
  "Energetic Player of the Tournament",
  "Best Team",
  "Best Catch",
  "Fair Play Award",
];

interface Player { id: string; full_name: string; nationality: string; }
interface Season { id: string; year: number; }
interface Award  {
  id: string; award_name: string; description: string | null;
  player: { full_name: string; nationality: string } | null;
  season: { year: number } | null;
}

export default function AdminAwardsPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [awards,  setAwards]  = useState<Award[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [view,    setView]    = useState<"list" | "add">("list");

  const [form, setForm] = useState({
    season_id:   "",
    award_name:  AWARD_NAMES[0],
    player_id:   "",
    description: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function loadAwards() {
    const { data } = await supabase
      .from("awards")
      .select(`
        id, award_name, description,
        player:players(full_name, nationality),
        season:seasons(year)
      `)
      .order("season(year)", { ascending: false });
    setAwards((data as unknown as Award[]) ?? []);
  }

  useEffect(() => {
    async function load() {
      const [p, s] = await Promise.all([
        supabase.from("players").select("id, full_name, nationality").order("full_name"),
        supabase.from("seasons").select("id, year").order("year", { ascending: false }),
      ]);
      setPlayers(p.data ?? []);
      setSeasons(s.data ?? []);
      if (s.data?.[0]) set("season_id", s.data[0].id);
    }
    load();
    loadAwards();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.from("awards").insert({
      ...form,
      description: form.description || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setView("list");
      await loadAwards();
      setForm((f) => ({ ...f, award_name: AWARD_NAMES[0], player_id: "", description: "" }));
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Awards</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {awards.length} award{awards.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={() => setView(view === "add" ? "list" : "add")}
          className="inline-flex items-center gap-1.5 bg-npl-red-500 hover:bg-npl-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {view === "add" ? "Cancel" : "Add Award"}
        </button>
      </div>

      {/* Add form */}
      {view === "add" && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-5">
          <h2 className="text-base font-bold text-foreground">New Award</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Season <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.season_id}
                onChange={(e) => set("season_id", e.target.value)}>
                <option value="">Select season</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>NPL {s.year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Award <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.award_name}
                onChange={(e) => set("award_name", e.target.value)}>
                {AWARD_NAMES.map((a) => <option key={a} value={a}>{a}</option>)}
                <option value="custom">Custom award...</option>
              </select>
            </div>
          </div>

          {form.award_name === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Custom Award Name <span className="text-npl-red-500">*</span>
              </label>
              <input className={inputClass} required
                onChange={(e) => set("award_name", e.target.value)}
                placeholder="Enter award name" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Player / Recipient <span className="text-npl-red-500">*</span>
            </label>
            <select className={inputClass} required value={form.player_id}
              onChange={(e) => set("player_id", e.target.value)}>
              <option value="">Select player</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.nationality})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Description / Stats
            </label>
            <input className={inputClass} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. 323 runs in 10 matches at SR 148.6" />
          </div>

          {error && (
            <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-npl-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Add Award"}
          </button>
        </form>
      )}

      {/* Awards list */}
      {awards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm mb-3">No awards recorded yet.</p>
          <button onClick={() => setView("add")}
            className="inline-flex items-center gap-1.5 bg-npl-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Add first award
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {awards.map((award) => (
            <div key={award.id}
              className="flex items-center justify-between gap-4 bg-card rounded-xl border border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-npl-gold-100 dark:bg-npl-gold-950/30 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 text-npl-gold-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-npl-gold-600 uppercase tracking-wider">
                    {award.award_name}
                  </p>
                  <p className="font-bold text-foreground text-sm">
                    {award.player?.full_name ?? "—"}
                  </p>
                  {award.description && (
                    <p className="text-xs text-muted-foreground">{award.description}</p>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full flex-shrink-0">
                NPL {award.season?.year ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
