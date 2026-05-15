"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronLeft, Trash2, Upload, Plus, X } from "lucide-react";
import Link from "next/link";
import {
  updatePlayer,
  deletePlayer,
  assignPlayerToTeam,
  removePlayerTeamAssignment,
} from "@/lib/admin-actions";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";
const ROLES       = ["batter","bowler","all-rounder","wicket-keeper"] as const;
const BAT_STYLES  = ["right-hand","left-hand"] as const;
const BOWL_STYLES = [
  "none","right-arm fast","right-arm medium","right-arm off-break",
  "right-arm leg-break","left-arm fast","left-arm medium",
  "left-arm orthodox","left-arm chinaman",
] as const;

interface Team   { id: string; name: string; short_code: string; primary_color: string; }
interface Season { id: string; year: number; }

interface TeamAssignment {
  id: string;
  team_id: string;
  season_id: string;
  is_marquee: boolean;
  is_retained: boolean;
  auction_price: number | null;
  team: Team | null;
  season: Season | null;
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-npl-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function EditPlayerPage() {
  const router  = useRouter();
  const { id }  = useParams<{ id: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const [fetching,      setFetching]      = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState("");
  const [success,       setSuccess]       = useState("");
  const [imagePreview,  setImagePreview]  = useState("");

  // All teams + seasons for dropdowns
  const [allTeams,   setAllTeams]   = useState<Team[]>([]);
  const [allSeasons, setAllSeasons] = useState<Season[]>([]);

  // Existing team assignments for this player
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);

  // New assignment form
  const [addingTeam, setAddingTeam] = useState(false);
  const [newAssign,  setNewAssign]  = useState({
    team_id: "", season_id: "",
    is_marquee: false, is_retained: false, auction_price: 0,
  });

  const [form, setForm] = useState({
    full_name: "", short_name: "", nationality: "", dob: "",
    role:          "batter"     as typeof ROLES[number],
    batting_style: "right-hand" as typeof BAT_STYLES[number],
    bowling_style: "none"       as typeof BOWL_STYLES[number],
    bio: "", is_overseas: false, image_url: "",
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setNA(field: string, value: unknown) {
    setNewAssign((f) => ({ ...f, [field]: value }));
  }

  // ── Load player + assignments ──────────────────────────────────────────────
  async function loadData() {
    const [playerRes, assignRes, teamsRes, seasonsRes] = await Promise.all([
      supabase.from("players").select("*").eq("id", id).single(),
      supabase.from("player_season_team").select(`
        id, team_id, season_id, is_marquee, is_retained, auction_price,
        team:teams(id, name, short_code, primary_color),
        season:seasons(id, year)
      `).eq("player_id", id).order("season(year)", { ascending: false }),
      supabase.from("teams").select("id, name, short_code, primary_color").order("name"),
      supabase.from("seasons").select("id, year").order("year", { ascending: false }),
    ]);

    if (playerRes.data) {
      const p = playerRes.data;
      setForm({
        full_name:     p.full_name,
        short_name:    p.short_name,
        nationality:   p.nationality,
        dob:           p.dob ?? "",
        role:          p.role,
        batting_style: p.batting_style,
        bowling_style: p.bowling_style,
        bio:           p.bio ?? "",
        is_overseas:   p.is_overseas,
        image_url:     p.image_url ?? "",
      });
      if (p.image_url) setImagePreview(p.image_url);
    }

    setAssignments((assignRes.data ?? []) as unknown as TeamAssignment[]);
    setAllTeams(teamsRes.data ?? []);
    setAllSeasons(seasonsRes.data ?? []);
    if (seasonsRes.data?.[0]) setNA("season_id", seasonsRes.data[0].id);
    setFetching(false);
  }

  useEffect(() => { loadData(); }, [id]);

  // ── Cloudinary image upload ────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", "npl_hub_players");
    fd.append("folder", "npl-hub/players");

    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );
    const data = await res.json();

    if (data.secure_url) {
      set("image_url", data.secure_url);
      setImagePreview(data.secure_url);
    } else {
      setError("Image upload failed. Check your Cloudinary upload preset.");
    }
    setUploading(false);
  }

  // ── Save player details ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
  
    const result = await updatePlayer(id, form);
  
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Player details saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    }
    setSaving(false);
  }

  // ── Add team assignment ────────────────────────────────────────────────────
  async function handleAddAssignment() {
    if (!newAssign.team_id || !newAssign.season_id) {
      setError("Select both a team and a season.");
      return;
    }

    // Check for duplicate
    const exists = assignments.find(
      (a) => a.team_id === newAssign.team_id && a.season_id === newAssign.season_id
    );
    if (exists) {
      setError("This player is already assigned to that team in that season.");
      return;
    }

    setError("");
    const { error } = await supabase.from("player_season_team").insert({
      player_id:     id,
      team_id:       newAssign.team_id,
      season_id:     newAssign.season_id,
      is_marquee:    newAssign.is_marquee,
      is_retained:   newAssign.is_retained,
      auction_price: newAssign.auction_price || null,
    });

    if (error) {
      setError(error.message);
    } else {
      setAddingTeam(false);
      setNewAssign((f) => ({ ...f, team_id: "", is_marquee: false, is_retained: false, auction_price: 0 }));
      await loadData(); // refresh assignments
      setSuccess("Team assignment added.");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  // ── Remove team assignment ─────────────────────────────────────────────────
  async function handleRemoveAssignment(assignId: string) {
    if (!confirm("Remove this team assignment?")) return;
    const result = await removePlayerTeamAssignment(assignId);
    if (result.error) {
      setError(result.error);
    } else {
      await loadData();
    }
  }

  // ── Delete player ──────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!confirm(`Delete ${form.full_name}? Cannot be undone.`)) return;
    const result = await deletePlayer(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/admin/players");
  }

  if (fetching) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-10">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading player...
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/players"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Players
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{form.full_name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Edit player details &amp; team assignments</p>
        </div>
        <button onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 dark:border-red-800 px-3 py-1.5 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete Player
        </button>
      </div>

      {/* Global messages */}
      {error && (
        <div className="mb-4 bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-npl-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 bg-npl-green-50 border border-npl-green-200 rounded-lg px-4 py-3">
          <p className="text-sm text-npl-green-700">{success}</p>
        </div>
      )}

      <div className="space-y-6">

        {/* ── Photo ──────────────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Player Photo</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">👤</span>
              )}
            </div>
            <div className="flex-1">
              <input ref={fileRef} type="file" accept="image/*"
                onChange={handleImageUpload} className="hidden" />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : imagePreview ? "Change photo" : "Upload photo"}
                </button>
                {imagePreview && (
                  <button type="button"
                    onClick={() => { set("image_url", ""); setImagePreview(""); }}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 border border-red-200 px-3 py-2 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Requires <code className="bg-muted px-1 rounded text-[11px]">npl_hub_players</code> unsigned preset in Cloudinary.
              </p>
            </div>
          </div>
        </div>

        {/* ── Player details form ────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Player Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" required>
              <input className={inputClass} required value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)} />
            </Field>
            <Field label="Short Name" required>
              <input className={inputClass} required value={form.short_name}
                onChange={(e) => set("short_name", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Nationality" required>
              <input className={inputClass} required value={form.nationality}
                onChange={(e) => set("nationality", e.target.value)} />
            </Field>
            <Field label="Date of Birth">
              <input type="date" className={inputClass} value={form.dob}
                onChange={(e) => set("dob", e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Role" required>
              <select className={inputClass} value={form.role}
                onChange={(e) => set("role", e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Batting Style" required>
              <select className={inputClass} value={form.batting_style}
                onChange={(e) => set("batting_style", e.target.value)}>
                {BAT_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Bowling Style">
              <select className={inputClass} value={form.bowling_style}
                onChange={(e) => set("bowling_style", e.target.value)}>
                {BOWL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Bio">
            <textarea className={`${inputClass} resize-none`} rows={3}
              value={form.bio} onChange={(e) => set("bio", e.target.value)}
              placeholder="Brief player biography..." />
          </Field>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_overseas" checked={form.is_overseas}
              onChange={(e) => set("is_overseas", e.target.checked)}
              className="w-4 h-4 rounded border-border accent-npl-red-500" />
            <label htmlFor="is_overseas"
              className="text-sm font-medium text-foreground cursor-pointer">
              Overseas player
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Details"}
            </button>
            <Link href="/admin/players"
              className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </Link>
          </div>
        </form>

        {/* ── Team Assignments ───────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Team Assignments</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Which team(s) this player represented each NPL season
              </p>
            </div>
            <button
              onClick={() => setAddingTeam(!addingTeam)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-npl-blue-500 hover:bg-npl-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {addingTeam ? "Cancel" : "Add Assignment"}
            </button>
          </div>

          {/* Add assignment form */}
          {addingTeam && (
            <div className="mb-5 rounded-xl border border-npl-blue-200 dark:border-npl-blue-800 bg-npl-blue-50 dark:bg-npl-blue-950/20 p-4 space-y-4">
              <p className="text-xs font-semibold text-npl-blue-700 dark:text-npl-blue-300 uppercase tracking-wider">
                New Assignment
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Team <span className="text-npl-red-500">*</span>
                  </label>
                  <select className={inputClass} value={newAssign.team_id}
                    onChange={(e) => setNA("team_id", e.target.value)}>
                    <option value="">Select team</option>
                    {allTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Season <span className="text-npl-red-500">*</span>
                  </label>
                  <select className={inputClass} value={newAssign.season_id}
                    onChange={(e) => setNA("season_id", e.target.value)}>
                    {allSeasons.map((s) => (
                      <option key={s.id} value={s.id}>NPL {s.year}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Auction Price (NPR thousands)
                  </label>
                  <input type="number" className={inputClass} min={0}
                    value={newAssign.auction_price}
                    onChange={(e) => setNA("auction_price", Number(e.target.value))} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="new_marquee" checked={newAssign.is_marquee}
                    onChange={(e) => setNA("is_marquee", e.target.checked)}
                    className="w-4 h-4 accent-npl-red-500" />
                  <label htmlFor="new_marquee" className="text-sm font-medium text-foreground cursor-pointer">
                    Marquee
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="new_retained" checked={newAssign.is_retained}
                    onChange={(e) => setNA("is_retained", e.target.checked)}
                    className="w-4 h-4 accent-npl-red-500" />
                  <label htmlFor="new_retained" className="text-sm font-medium text-foreground cursor-pointer">
                    Retained
                  </label>
                </div>
              </div>

              <button type="button" onClick={handleAddAssignment}
                className="inline-flex items-center gap-2 bg-npl-blue-500 hover:bg-npl-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" /> Confirm Assignment
              </button>
            </div>
          )}

          {/* Existing assignments list */}
          {assignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No team assignments yet.
              </p>
              <p className="text-xs text-muted-foreground">
                This player won't appear in any team squad until assigned.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div key={a.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Team color dot */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: a.team?.primary_color ?? "#ccc" }}
                    >
                      {a.team?.short_code ?? "?"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {a.team?.name ?? "Unknown team"}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          NPL {a.season?.year ?? "?"}
                        </span>
                        {a.is_marquee && (
                          <span className="text-xs font-semibold text-npl-gold-600 bg-npl-gold-50 dark:bg-npl-gold-950/30 border border-npl-gold-200 dark:border-npl-gold-800 px-2 py-0.5 rounded-full">
                            ★ Marquee
                          </span>
                        )}
                        {a.is_retained && (
                          <span className="text-xs font-semibold text-npl-blue-600 bg-npl-blue-50 dark:bg-npl-blue-950/30 border border-npl-blue-200 dark:border-npl-blue-800 px-2 py-0.5 rounded-full">
                            Retained
                          </span>
                        )}
                        {a.auction_price && (
                          <span className="text-xs text-muted-foreground">
                            NPR {a.auction_price.toLocaleString()}k
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemoveAssignment(a.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Remove assignment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
