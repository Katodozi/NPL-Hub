import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAllTeams } from "@/lib/db";
import { NPL_TEAMS } from "@/config/constants";
import { slugify } from "@/lib/utils";

export default async function AdminTeamsPage() {
  const dbTeams = await getAllTeams();
  const teams = dbTeams.length > 0
    ? dbTeams
    : NPL_TEAMS.map((t, i) => ({ ...t, id: String(i), slug: slugify(t.name) }));

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {dbTeams.length} team{dbTeams.length !== 1 ? "s" : ""} in database
            {dbTeams.length === 0 && " — run seed.sql to populate"}
          </p>
        </div>
        <Link
          href="/admin/teams/new"
          className="inline-flex items-center gap-1.5 bg-npl-red-500 hover:bg-npl-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Team
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left px-4 py-3">Team</th>
              <th className="text-left px-4 py-3">City</th>
              <th className="text-left px-4 py-3">Province</th>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Color</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {teams.map((team) => (
              <tr key={team.name} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{team.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{team.city}</td>
                <td className="px-4 py-3 text-muted-foreground">{team.province}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                    {team.short_code}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border border-border"
                      style={{ backgroundColor: team.primary_color }} />
                    <span className="text-xs font-mono text-muted-foreground">
                      {team.primary_color}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {"id" in team && (
                    <Link
                      href={`/admin/teams/${team.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-npl-blue-500 hover:text-npl-blue-600 font-medium"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dbTeams.length === 0 && (
        <div className="mt-4 rounded-xl border border-npl-gold-200 bg-npl-gold-50 dark:bg-npl-gold-950/20 px-5 py-4">
          <p className="text-sm text-npl-gold-800 dark:text-npl-gold-300">
            <span className="font-semibold">Tip:</span> Run{" "}
            <code className="font-mono text-xs bg-npl-gold-100 dark:bg-npl-gold-900/40 px-1.5 py-0.5 rounded">
              supabase/seed.sql
            </code>{" "}
            in your Supabase SQL Editor to seed all 8 teams at once.
          </p>
        </div>
      )}
    </div>
  );
}
