"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const inputClass = "w-full px-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";

interface Team   { id: string; name: string; short_code: string; }
interface Season { id: string; year: number; }
interface Match  { id: string; match_number: number; match_type: string; team1_id: string; team2_id: string; team1: Team; team2: Team; }
interface Player { id: string; full_name: string; is_overseas: boolean; }

const DISMISSALS = ["bowled","caught","lbw","run out","stumped","hit wicket","retired hurt","not out","—"];

function NumInput({ label, value, onChange, step = 1, min = 0 }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; min?: number;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">{label}</label>
      <input type="number" className={inputClass} value={value} min={min} step={step}
        onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function AdminStatsPage() {
  const [seasons,  setSeasons]  = useState<Season[]>([]);
  const [matches,  setMatches]  = useState<Match[]>([]);
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedMatch,  setSelectedMatch]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState("");
  const [expanded, setExpanded] = useState(true);

  const [form, setForm] = useState({
    player_id: "", team_id: "",
    // batting
    runs: 0, balls_faced: 0, fours: 0, sixes: 0,
    is_out: true, dismissal_type: "bowled",
    // bowling
    overs: 0, wickets: 0, runs_conceded: 0, maidens: 0,
    // fielding
    catches: 0, run_outs: 0, stumpings: 0,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    supabase.from("seasons").select("id, year").order("year", { ascending: false })
      .then(({ data }) => {
        setSeasons(data ?? []);
        if (data?.[0]) setSelectedSeason(data[0].id);
      });
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    supabase
      .from("matches")
      .select(`
        id, match_number, match_type, team1_id, team2_id,
        team1:teams!matches_team1_id_fkey(id, name, short_code),
        team2:teams!matches_team2_id_fkey(id, name, short_code)
      `)
      .eq("season_id", selectedSeason)
      .order("match_number")
      .then(({ data }) => {
        setMatches((data as unknown as Match[]) ?? []);
        setSelectedMatch("");
      });
  }, [selectedSeason]);

  useEffect(() => {
    supabase.from("players").select("id, full_name, is_overseas").order("full_name")
      .then(({ data }) => setPlayers(data ?? []));
  }, []);

  const currentMatch = matches.find((m) => m.id === selectedMatch);
  const teamOptions = currentMatch
    ? [currentMatch.team1, currentMatch.team2]
    : [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedMatch) { setError("Select a match first."); return; }
    setLoading(true);
    setError("");
    setSuccess("");

    const { error } = await supabase.from("player_match_stats").upsert({
      ...form,
      match_id: selectedMatch,
    }, { onConflict: "player_id,match_id" });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`Stats saved for player!`);
      setForm({
        player_id: "", team_id: form.team_id,
        runs: 0, balls_faced: 0, fours: 0, sixes: 0,
        is_out: true, dismissal_type: "bowled",
        overs: 0, wickets: 0, runs_conceded: 0, maidens: 0,
        catches: 0, run_outs: 0, stumpings: 0,
      });
      setTimeout(() => setSuccess(""), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Match Stats Entry</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Enter player batting, bowling and fielding stats per match.
        </p>
      </div>

      {/* Match selector */}
      <div className="bg-card rounded-2xl border border-border p-5 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Season</label>
          <select className={inputClass} value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}>
            {seasons.map((s) => <option key={s.id} value={s.id}>NPL {s.year}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Match</label>
          <select className={inputClass} value={selectedMatch}
            onChange={(e) => setSelectedMatch(e.target.value)}
            disabled={matches.length === 0}>
            <option value="">Select match</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                #{m.match_number} — {m.team1?.short_code} vs {m.team2?.short_code} ({m.match_type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats form */}
      {selectedMatch && (
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-6">
          {/* Player + Team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Player <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.player_id}
                onChange={(e) => set("player_id", e.target.value)}>
                <option value="">Select player</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} {p.is_overseas ? "🌍" : "🇳🇵"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Batting for <span className="text-npl-red-500">*</span>
              </label>
              <select className={inputClass} required value={form.team_id}
                onChange={(e) => set("team_id", e.target.value)}>
                <option value="">Select team</option>
                {teamOptions.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Batting */}
          <div>
            <button type="button" onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 w-full text-left">
              🏏 Batting
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              <NumInput label="Runs"   value={form.runs}        onChange={(v) => set("runs", v)} />
              <NumInput label="Balls"  value={form.balls_faced} onChange={(v) => set("balls_faced", v)} />
              <NumInput label="4s"     value={form.fours}       onChange={(v) => set("fours", v)} />
              <NumInput label="6s"     value={form.sixes}       onChange={(v) => set("sixes", v)} />
              <div>
                <label className="block text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Dismissal</label>
                <select className={inputClass} value={form.dismissal_type}
                  onChange={(e) => {
                    set("dismissal_type", e.target.value);
                    set("is_out", e.target.value !== "not out" && e.target.value !== "—");
                  }}>
                  {DISMISSALS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="is_out" checked={form.is_out}
                  onChange={(e) => set("is_out", e.target.checked)}
                  className="w-4 h-4 accent-npl-red-500" />
                <label htmlFor="is_out" className="text-xs font-medium text-foreground cursor-pointer">Out</label>
              </div>
            </div>
          </div>

          {/* Bowling */}
          <div>
            <p className="text-sm font-bold text-foreground mb-4">⚾ Bowling</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <NumInput label="Overs"   value={form.overs}         onChange={(v) => set("overs", v)}         step={0.1} />
              <NumInput label="Wickets" value={form.wickets}       onChange={(v) => set("wickets", v)} />
              <NumInput label="Runs"    value={form.runs_conceded} onChange={(v) => set("runs_conceded", v)} />
              <NumInput label="Maidens" value={form.maidens}       onChange={(v) => set("maidens", v)} />
            </div>
          </div>

          {/* Fielding */}
          <div>
            <p className="text-sm font-bold text-foreground mb-4">🧤 Fielding</p>
            <div className="grid grid-cols-3 gap-3">
              <NumInput label="Catches"  value={form.catches}   onChange={(v) => set("catches", v)} />
              <NumInput label="Run outs" value={form.run_outs}  onChange={(v) => set("run_outs", v)} />
              <NumInput label="Stumpings"value={form.stumpings} onChange={(v) => set("stumpings", v)} />
            </div>
          </div>

          {error && (
            <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-npl-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-npl-green-50 border border-npl-green-200 rounded-lg px-4 py-3">
              <p className="text-sm text-npl-green-700">{success}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : "Save Stats"}
            </button>
            <p className="text-xs text-muted-foreground self-center">
              Submit once per player per match. Re-submitting overwrites.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
