import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getBuildClient } from "@/lib/db";
import { roleLabel } from "@/lib/utils";

interface PlayerSeasonTeamEntry {
  is_marquee: boolean;
  team: { name: string; short_code: string; primary_color: string } | null;
  season: { year: number } | null;
}

interface PlayerWithTeams {
  id: string;
  full_name: string;
  slug: string;
  role: string;
  nationality: string;
  is_overseas: boolean;
  image_url: string | null;
  player_season_team: PlayerSeasonTeamEntry[];
}

export default async function AdminPlayersPage() {
  const supabase = getBuildClient();

  const { data, error } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      slug,
      role,
      nationality,
      is_overseas,
      image_url,
      player_season_team (
        is_marquee,
        team:teams ( name, short_code, primary_color ),
        season:seasons ( year )
      )
    `)
    .order("full_name");

  const players: PlayerWithTeams[] = (data ?? []) as unknown as PlayerWithTeams[];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Players</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {players.length} player{players.length !== 1 ? "s" : ""} in database
          </p>
        </div>
        <Link
          href="/admin/players/new"
          className="inline-flex items-center gap-1.5 bg-npl-red-500 hover:bg-npl-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Player
        </Link>
      </div>

      {/* Empty state */}
      {players.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <p className="text-muted-foreground mb-4">No players added yet.</p>
          <Link
            href="/admin/players/new"
            className="inline-flex items-center gap-1.5 bg-npl-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" /> Add your first player
          </Link>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Player</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Nationality</th>
                  <th className="text-center px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Team Assignments</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-muted/30 transition-colors">

                    {/* Player name + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-npl-blue-100 dark:bg-npl-blue-950/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {player.image_url ? (
                            <img
                              src={player.image_url}
                              alt={player.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-npl-blue-600 dark:text-npl-blue-300">
                              {player.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">
                            {player.full_name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {player.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {roleLabel(player.role)}
                    </td>

                    {/* Nationality */}
                    <td className="px-4 py-3 text-muted-foreground">
                      {player.nationality}
                    </td>

                    {/* Local / Overseas badge */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        player.is_overseas
                          ? "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
                          : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      }`}>
                        {player.is_overseas ? "Overseas" : "Local"}
                      </span>
                    </td>

                    {/* Team assignments — one pill per season */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {player.player_season_team.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">
                            Unassigned
                          </span>
                        ) : (
                          player.player_season_team.map((pst, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border border-border bg-background"
                            >
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: pst.team?.primary_color ?? "#ccc" }}
                              />
                              <span className="font-medium text-foreground">
                                {pst.team?.short_code ?? "?"}
                              </span>
                              <span className="text-muted-foreground">
                                {pst.season?.year ?? "?"}
                              </span>
                              {pst.is_marquee && (
                                <span className="text-npl-gold-500 font-bold">★</span>
                              )}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    {/* Edit action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/players/${player.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-npl-blue-500 hover:text-npl-blue-600 font-medium transition-colors"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="border-t border-border bg-muted/30 px-4 py-2.5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>
              🇳🇵 Local:{" "}
              <strong className="text-foreground">
                {players.filter((p) => !p.is_overseas).length}
              </strong>
            </span>
            <span>
              🌍 Overseas:{" "}
              <strong className="text-foreground">
                {players.filter((p) => p.is_overseas).length}
              </strong>
            </span>
            <span>
              ⚠️ Unassigned:{" "}
              <strong className="text-foreground">
                {players.filter((p) => p.player_season_team.length === 0).length}
              </strong>
            </span>
            <span>
              📸 Missing photo:{" "}
              <strong className="text-foreground">
                {players.filter((p) => !p.image_url).length}
              </strong>
            </span>
          </div>
        </div>
      )}

      {/* Tip box */}
      <div className="mt-5 rounded-xl border border-npl-blue-200 dark:border-npl-blue-800 bg-npl-blue-50 dark:bg-npl-blue-950/20 px-5 py-4">
        <p className="text-sm text-npl-blue-800 dark:text-npl-blue-300">
          <span className="font-semibold">Team Assignment tip:</span> A player can represent different
          teams across seasons. Add the player first, then use{" "}
          <strong>Edit</strong> to assign them to additional seasons.
          The{" "}
          <span className="font-mono text-xs bg-npl-blue-100 dark:bg-npl-blue-900/40 px-1 rounded">
            ⚠️ Unassigned
          </span>{" "}
          count shows players not yet linked to any team — they won't appear in team squad pages.
        </p>
      </div>
    </div>
  );
}
