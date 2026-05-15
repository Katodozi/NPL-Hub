"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { Loader2, ChevronLeft, Upload, X } from "lucide-react";
import Link from "next/link";
import {
  createPlayer,
  assignPlayerToTeam,
} from "@/lib/admin-actions";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";
const ROLES       = ["batter","bowler","all-rounder","wicket-keeper"] as const;
const BAT_STYLES  = ["right-hand","left-hand"] as const;
const BOWL_STYLES = ["none","right-arm fast","right-arm medium","right-arm off-break","right-arm leg-break","left-arm fast","left-arm medium","left-arm orthodox","left-arm chinaman"] as const;

interface Team   { id: string; name: string; }
interface Season { id: string; year: number; }

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label} {required && <span className="text-npl-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function NewPlayerPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading,       setLoading]       = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [error,         setError]         = useState("");
  const [teams,         setTeams]         = useState<Team[]>([]);
  const [seasons,       setSeasons]       = useState<Season[]>([]);
  const [imagePreview,  setImagePreview]  = useState("");

  const [form, setForm] = useState({
    full_name: "", short_name: "", nationality: "Nepal",
    dob: "", role: "batter" as typeof ROLES[number],
    batting_style: "right-hand" as typeof BAT_STYLES[number],
    bowling_style: "none" as typeof BOWL_STYLES[number],
    bio: "", is_overseas: false, image_url: "",
  });

  // Team assignment fields (separate from player record)
  const [teamAssign, setTeamAssign] = useState({
    team_id:      "",
    season_id:    "",
    is_marquee:   false,
    is_retained:  false,
    auction_price: 0,
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setTA(field: string, value: unknown) {
    setTeamAssign((f) => ({ ...f, [field]: value }));
  }

  useEffect(() => {
    Promise.all([
      supabase.from("teams").select("id, name").order("name"),
      supabase.from("seasons").select("id, year").order("year", { ascending: false }),
    ]).then(([t, s]) => {
      setTeams(t.data ?? []);
      setSeasons(s.data ?? []);
      if (s.data?.[0]) setTA("season_id", s.data[0].id);
    });
  }, []);

  // ── Cloudinary upload ──────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "npl_hub_players"); // create this preset in Cloudinary
    formData.append("folder", "npl-hub/players");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    const result = await createPlayer(form);
  
    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }
  
    // Assign to team if selected
    if (teamAssign.team_id && teamAssign.season_id && result.data) {
      const assignResult = await assignPlayerToTeam({
        player_id:     result.data.id,
        team_id:       teamAssign.team_id,
        season_id:     teamAssign.season_id,
        is_marquee:    teamAssign.is_marquee,
        is_retained:   teamAssign.is_retained,
        auction_price: teamAssign.auction_price,
      });
      if (assignResult.error) {
        setError(`Player created but team assignment failed: ${assignResult.error}`);
        setLoading(false);
        return;
      }
    }
  
    router.push("/admin/players");
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/players" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Players
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Add Player</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Player photo ──────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-4">Player Photo</h2>
          <div className="flex items-center gap-5">
            {/* Preview */}
            <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl text-muted-foreground">👤</span>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 border border-border bg-background hover:bg-muted text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? "Uploading..." : "Upload photo"}
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { set("image_url", ""); setImagePreview(""); }}
                  className="ml-2 text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
              <p className="text-xs text-muted-foreground mt-1.5">
                JPG or PNG, max 5MB. Uploaded to Cloudinary.
              </p>
              <p className="text-xs text-muted-foreground">
                Requires <code className="bg-muted px-1 rounded">npl_hub_players</code> unsigned upload preset in Cloudinary.
              </p>
            </div>
          </div>
        </div>

        {/* ── Player info ───────────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <h2 className="text-sm font-bold text-foreground">Player Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" required>
              <input className={inputClass} required value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)} placeholder="Rohit Paudel" />
            </Field>
            <Field label="Short Name" required>
              <input className={inputClass} required value={form.short_name}
                onChange={(e) => set("short_name", e.target.value)} placeholder="Paudel" />
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
              <select className={inputClass} value={form.role} onChange={(e) => set("role", e.target.value)}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Batting Style" required>
              <select className={inputClass} value={form.batting_style} onChange={(e) => set("batting_style", e.target.value)}>
                {BAT_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Bowling Style" required>
              <select className={inputClass} value={form.bowling_style} onChange={(e) => set("bowling_style", e.target.value)}>
                {BOWL_STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Bio">
            <textarea className={`${inputClass} resize-none`} rows={3} value={form.bio}
              onChange={(e) => set("bio", e.target.value)} placeholder="Brief player biography..." />
          </Field>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_overseas" checked={form.is_overseas}
              onChange={(e) => {
                set("is_overseas", e.target.checked);
                if (e.target.checked) set("nationality", "");
              }}
              className="w-4 h-4 rounded border-border accent-npl-red-500" />
            <label htmlFor="is_overseas" className="text-sm font-medium text-foreground cursor-pointer">
              Overseas player
            </label>
          </div>
        </div>

        {/* ── Team assignment ───────────────────────────────────────── */}
        <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Team Assignment</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Which team does this player represent and in which season?
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Team">
              <select className={inputClass} value={teamAssign.team_id}
                onChange={(e) => setTA("team_id", e.target.value)}>
                <option value="">No team assignment</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </Field>
            <Field label="Season">
              <select className={inputClass} value={teamAssign.season_id}
                onChange={(e) => setTA("season_id", e.target.value)}>
                {seasons.map((s) => <option key={s.id} value={s.id}>NPL {s.year}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field label="Auction Price (NPR thousands)">
              <input type="number" className={inputClass} min={0}
                value={teamAssign.auction_price}
                onChange={(e) => setTA("auction_price", Number(e.target.value))}
                placeholder="0" />
            </Field>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="is_marquee" checked={teamAssign.is_marquee}
                onChange={(e) => setTA("is_marquee", e.target.checked)}
                className="w-4 h-4 accent-npl-red-500" />
              <label htmlFor="is_marquee" className="text-sm font-medium text-foreground cursor-pointer">
                Marquee player
              </label>
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="is_retained" checked={teamAssign.is_retained}
                onChange={(e) => setTA("is_retained", e.target.checked)}
                className="w-4 h-4 accent-npl-red-500" />
              <label htmlFor="is_retained" className="text-sm font-medium text-foreground cursor-pointer">
                Retained player
              </label>
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg px-4 py-3 text-xs text-muted-foreground">
            A player can be assigned to different teams each season. To assign an existing player to a new season, use the <strong className="text-foreground">Players → Edit</strong> page.
          </div>
        </div>

        {error && (
          <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-npl-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={loading || uploading}
            className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Add Player"}
          </button>
          <Link href="/admin/players"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
