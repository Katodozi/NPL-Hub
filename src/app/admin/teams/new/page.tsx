"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/lib/utils";
import { Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { createTeam } from "@/lib/admin-actions";

const inputClass = "w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors";

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

export default function NewTeamPage() {
  const router  = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    name:            "",
    short_code:      "",
    city:            "",
    province:        "",
    owner:           "",
    primary_color:   "#C0392B",
    secondary_color: "#FFFFFF",
    founded_year:    2024,
    home_venue:      "",
  });

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await createTeam(form);
    if (result.error) { setError(result.error); setLoading(false); }
    else { router.push("/admin/teams"); }
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/teams"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" /> Teams
      </Link>
      <h1 className="text-2xl font-bold text-foreground mb-6">Add Team</h1>

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Team Name" required>
            <input className={inputClass} required value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Biratnagar Kings" />
          </Field>
          <Field label="Short Code (2 letters)" required>
            <input className={inputClass} required maxLength={2} value={form.short_code}
              onChange={(e) => set("short_code", e.target.value.toUpperCase())}
              placeholder="BK" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="City" required>
            <input className={inputClass} required value={form.city}
              onChange={(e) => set("city", e.target.value)} placeholder="Biratnagar" />
          </Field>
          <Field label="Province" required>
            <input className={inputClass} required value={form.province}
              onChange={(e) => set("province", e.target.value)} placeholder="Koshi" />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Primary Color" required>
            <div className="flex gap-2">
              <input type="color" value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
              <input className={inputClass} value={form.primary_color}
                onChange={(e) => set("primary_color", e.target.value)}
                placeholder="#C0392B" />
            </div>
          </Field>
          <Field label="Secondary Color" required>
            <div className="flex gap-2">
              <input type="color" value={form.secondary_color}
                onChange={(e) => set("secondary_color", e.target.value)}
                className="w-12 h-10 rounded-lg border border-border cursor-pointer" />
              <input className={inputClass} value={form.secondary_color}
                onChange={(e) => set("secondary_color", e.target.value)}
                placeholder="#FFFFFF" />
            </div>
          </Field>
        </div>

        <Field label="Owner / Franchise">
          <input className={inputClass} value={form.owner}
            onChange={(e) => set("owner", e.target.value)} placeholder="Owner name" />
        </Field>

        <Field label="Home Venue">
          <input className={inputClass} value={form.home_venue}
            onChange={(e) => set("home_venue", e.target.value)}
            placeholder="Biratnagar Cricket Ground" />
        </Field>

        <Field label="Founded Year" required>
          <input type="number" className={inputClass} value={form.founded_year}
            onChange={(e) => set("founded_year", Number(e.target.value))}
            min={2024} max={2030} />
        </Field>

        {error && (
          <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-4 py-3">
            <p className="text-sm text-npl-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Add Team"}
          </button>
          <Link href="/admin/teams"
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
