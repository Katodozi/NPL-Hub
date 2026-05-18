"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";

const MATCH_TYPES = ["league", "qualifier1", "qualifier2", "eliminator", "final"] as const;

interface Team   { id: string; name: string; short_code: string; }
interface Season { id: string; year: number; }
interface Match  {
  id: string; match_number: number; match_type: string; date: string;
  venue: string; is_completed: boolean; result_margin: string | null;
  team1: Team; team2: Team; winner: Team | null;
}

export default function AdminMatchesPage() {
  const router = useRouter();
  const [teams,   setTeams]   = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [view,    setView]    = useState<"list" | "add">("list");
  const [selectedSeason, setSelectedSeason] = useState("");

  const [form, setForm] = useState({
    season_id:    "",
    match_number: 1,
    match_type:   "league" as typeof MATCH_TYPES[number],
    date:         "",
    venue:        "",
    team1_id:     "",
    team2_id:     "",
    winner_id:    "",
    result_margin:"",
    is_completed: false,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    async function load() {
      const [t, s] = await Promise.all([
        supabase.from("teams").select("id, name, short_code").order("name"),
        supabase.from("seasons").select("id, year").order("year", { ascending: false }),
      ]);
      setTeams(t.data ?? []);
      setSeasons(s.data ?? []);
      if (s.data?.[0]) {
        setSelectedSeason(s.data[0].id);
        setForm((f) => ({ ...f, season_id: s.data![0].id }));
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    supabase
      .from("matches")
      .select(`
        id, match_number, match_type, date, venue, is_completed, result_margin,
        team1:teams!matches_team1_id_fkey(id, name, short_code),
        team2:teams!matches_team2_id_fkey(id, name, short_code),
        winner:teams!matches_winner_id_fkey(id, name, short_code)
      `)
      .eq("season_id", selectedSeason)
      .order("match_number")
      .then(({ data }) => setMatches((data as unknown as Match[]) ?? []));
  }, [selectedSeason]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      winner_id:     form.winner_id     || null,
      result_margin: form.result_margin || null,
    };

    const { error } = await supabase.from("matches").insert(payload);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setView("list");
      setLoading(false);
      // Refresh match list
      const { data } = await supabase
        .from("matches")
        .select(`
          id, match_number, match_type, date, venue, is_completed, result_margin,
          team1:teams!matches_team1_id_fkey(id, name, short_code),
          team2:teams!matches_team2_id_fkey(id, name, short_code),
          winner:teams!matches_winner_id_fkey(id, name, short_code)
        `)
        .eq("season_id", selectedSeason)
        .order("match_number");
      setMatches((data as unknown as Match[]) ?? []);
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Matches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {matches.length} match{matches.length !== 1 ? "es" : ""} in selected season
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Season selector */}
          <select
            value={selectedSeason}
            onChange={(e) => {
              setSelectedSeason(e.target.value);
              setForm((f) => ({ ...f, season_id: e.target.value }));
            }}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>NPL {s.year}</option>
            ))}
          </select>
          <button
            onClick={() => setView(view === "add" ? "list" : "add")}
            className="inline-flex items-center gap-1.5 bg-npl-red-500 hover:bg-npl-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {view === "add" ? "Cancel" : "Add Match"}
          </button>
        </div>
      </div>

      {/* Add form */}
      {view === "add" && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 mb-6 space-y-5">
          <h2 className="text-base font-bold text-foreground">New Match</h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Match # <span className="text-npl-red-500">*</span>
              </label>
              <input type="number" className={inputClass} required min={1}
                value={form.match_number}
                onChange={(e) => set("match_number", Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Type <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} value={form.match_type}
                onChange={(e) => set("match_type", e.target.value)}>
                {MATCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Date <span className="text-npl-red-500">*</span>
              </label>
              <input type="datetime-local" className={inputClass} required
                value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Venue <span className="text-npl-red-500">*</span>
              </label>
              <input className={inputClass} required value={form.venue}
                onChange={(e) => set("venue", e.target.value)} placeholder="TU Cricket Ground" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Team 1 <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.team1_id}
                onChange={(e) => set("team1_id", e.target.value)}>
                <option value="">Select team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Team 2 <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.team2_id}
                onChange={(e) => set("team2_id", e.target.value)}>
                <option value="">Select team</option>
                {teams.filter((t) => t.id !== form.team1_id).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">Winner</label>
              <select className={inputClass} value={form.winner_id}
                onChange={(e) => set("winner_id", e.target.value)}>
                <option value="">No result / TBD</option>
                {[form.team1_id, form.team2_id].filter(Boolean).map((tid) => {
                  const t = teams.find((x) => x.id === tid);
                  return t ? <option key={t.id} value={t.id}>{t.name}</option> : null;
                })}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Result margin
              </label>
              <input className={inputClass} value={form.result_margin}
                onChange={(e) => set("result_margin", e.target.value)}
                placeholder="e.g. won by 5 wickets" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="is_completed" checked={form.is_completed}
                onChange={(e) => set("is_completed", e.target.checked)}
                className="w-4 h-4 rounded border-border accent-npl-red-500" />
              <label htmlFor="is_completed" className="text-sm font-medium text-foreground cursor-pointer">
                Match completed
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-npl-red-600">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Add Match"}
          </button>
        </form>
      )}

      {/* Match list */}
      {matches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm mb-3">No matches for this season yet.</p>
          <button onClick={() => setView("add")}
            className="inline-flex items-center gap-1.5 bg-npl-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
            <Plus className="w-4 h-4" /> Add first match
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Match</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {matches.map((m) => (
                <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{m.match_number}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {m.team1?.short_code} vs {m.team2?.short_code}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(m.date).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded capitalize">
                      {m.match_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "text-xs font-medium px-2 py-0.5 rounded-full",
                      m.is_completed
                        ? "bg-npl-green-50 text-npl-green-700"
                        : "bg-npl-gold-50 text-npl-gold-700"
                    )}>
                      {m.is_completed ? "Done" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {m.winner ? `${m.winner.short_code} won` : "—"}
                    {m.result_margin ? ` · ${m.result_margin}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
