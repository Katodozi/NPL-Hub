"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { updateTeam, deleteTeam } from "@/lib/admin-actions";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";

export default function EditTeamPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");
  const [form, setForm] = useState({
    name: "", short_code: "", city: "", province: "",
    owner: "", primary_color: "#C0392B", secondary_color: "#FFFFFF",
    founded_year: 2024, home_venue: "",
  });

  useEffect(() => {
    supabase.from("teams").select("*").eq("id", id).single()
      .then(({ data }) => {
        if (data) setForm({
          name:            data.name,
          short_code:      data.short_code,
          city:            data.city,
          province:        data.province,
          owner:           data.owner ?? "",
          primary_color:   data.primary_color,
          secondary_color: data.secondary_color,
          founded_year:    data.founded_year,
          home_venue:      data.home_venue ?? "",
        });
        setFetching(false);
      });
  }, [id]);

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await updateTeam(id, form);
    if (result.error) { setError(result.error); setLoading(false); }
    else { router.push("/admin/teams"); }
  }

  async function handleDelete() {
    if (!confirm("Delete this team? Cannot be undone.")) return;
    const result = await deleteTeam(id);
    if (result.error) { setError(result.error); return; }
    router.push("/admin/teams");
  }

  if (fetching) return <div className="text-muted-foreground text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <Link href="/admin/teams" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Teams
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Edit Team</h1>
        <button onClick={handleDelete}
          className="inline-flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Team Name <span className="text-npl-red-500">*</span></label>
            <input className={inputClass} required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Short Code <span className="text-npl-red-500">*</span></label>
            <input className={inputClass} required maxLength={2} value={form.short_code}
              onChange={(e) => set("short_code", e.target.value.toUpperCase())} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">City <span className="text-npl-red-500">*</span></label>
            <input className={inputClass} required value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Province <span className="text-npl-red-500">*</span></label>
            <input className={inputClass} required value={form.province} onChange={(e) => set("province", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Primary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
              <input className={inputClass} value={form.primary_color} onChange={(e) => set("primary_color", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">Secondary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
              <input className={inputClass} value={form.secondary_color} onChange={(e) => set("secondary_color", e.target.value)} />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Owner</label>
          <input className={inputClass} value={form.owner} onChange={(e) => set("owner", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">Home Venue</label>
          <input className={inputClass} value={form.home_venue} onChange={(e) => set("home_venue", e.target.value)} />
        </div>
        {error && <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3"><p className="text-sm text-npl-red-600">{error}</p></div>}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/teams" className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}