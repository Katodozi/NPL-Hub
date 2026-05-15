"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await loginAction(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success the server action redirects — no client navigation needed
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-npl-surface px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-npl-red-500 flex items-center justify-center mb-3">
            <span className="text-white font-black text-base">NPL</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            NPL Hub — Restricted access
          </p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Email <span className="text-npl-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors"
                placeholder="admin@nplhub.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Password <span className="text-npl-red-500">*</span>
              </label>
              <input
                name="password"
                type="password"
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-npl-red-500/30 focus:border-npl-red-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-npl-red-50 border border-npl-red-200 rounded-lg px-3 py-2">
                <p className="text-xs text-npl-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 disabled:opacity-60 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          Create your admin account in the Supabase dashboard.
        </p>
      </div>
    </div>
  );
}