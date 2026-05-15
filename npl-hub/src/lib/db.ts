import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type {
  Team,
  Player,
  Match,
  Season,
  PlayerCareerStats,
  Award,
  Record as NPLRecord,
  PlayerSeasonTeam,
} from "@/types";

// ─── Clients ──────────────────────────────────────────────────────────────────

// Build-time safe — no cookies, works in generateStaticParams
export function getBuildClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Runtime server client — use in page/component render only
async function getServerClient() {
  return createServerSupabaseClient();
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function getAllTeams(): Promise<Team[]> {
  const supabase = getBuildClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name");
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getTeamRoster(
  teamId: string,
  seasonYear?: number
): Promise<PlayerSeasonTeam[]> {
  const supabase = await getServerClient();
  let query = supabase
    .from("player_season_team")
    .select(`
      *,
      player:players(*),
      season:seasons(*)
    `)
    .eq("team_id", teamId);

  if (seasonYear) {
    query = query.eq("seasons.year", seasonYear);
  }

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function getTeamSeasonRecord(teamId: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select("*, season:seasons(year)")
    .or(`team1_id.eq.${teamId},team2_id.eq.${teamId}`)
    .eq("is_completed", true)
    .order("date", { ascending: false });

  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ─── Players ──────────────────────────────────────────────────────────────────

export async function getAllPlayers(filters?: {
  role?: string;
  nationality?: string;
  is_overseas?: boolean;
  search?: string;
}): Promise<Player[]> {
  const supabase = await getServerClient();
  let query = supabase.from("players").select("*").order("full_name");

  if (filters?.role)
    query = query.eq("role", filters.role);
  if (filters?.is_overseas !== undefined)
    query = query.eq("is_overseas", filters.is_overseas);
  if (filters?.search)
    query = query.ilike("full_name", `%${filters.search}%`);

  const { data, error } = await query;
  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function getPlayerBySlug(slug: string): Promise<Player | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getPlayerCareerStats(
  playerId: string  // must be UUID, not slug
): Promise<PlayerCareerStats | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("player_career_stats")
    .select("*")
    .eq("player_id", playerId)  // player_id is UUID in the view
    .maybeSingle();              // use maybeSingle() — returns null instead of error when no row
  if (error) return null;
  return data;
}

export async function getPlayerSeasonStats(playerId: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("player_match_stats")
    .select(`
      *,
      match:matches(
        id, date, venue, match_type, is_completed,
        team1:teams!matches_team1_id_fkey(id, name, short_code, primary_color),
        team2:teams!matches_team2_id_fkey(id, name, short_code, primary_color),
        season:seasons(year)
      )
    `)
    .eq("player_id", playerId)
    .order("match(date)", { ascending: false });

  if (error) { console.error(error); return []; }
  return data ?? [];
}

export async function getPlayerTeamHistory(playerId: string) {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("player_season_team")
    .select(`
      *,
      team:teams(id, name, short_code, primary_color, logo_url),
      season:seasons(year, status)
    `)
    .eq("player_id", playerId)
    .order("season(year)", { ascending: true });

  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ─── Seasons ──────────────────────────────────────────────────────────────────

export async function getAllSeasons(): Promise<Season[]> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .order("year", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getSeasonByYear(year: number): Promise<Season | null> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("seasons")
    .select(`
      *,
      champion:teams!seasons_champion_team_id_fkey(*),
      runner_up:teams!seasons_runner_up_id_fkey(*)
    `)
    .eq("year", year)
    .maybeSingle();
  if (error) return null;
  return data;
}

export async function getSeasonMatches(seasonId: string): Promise<Match[]> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("matches")
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_code, primary_color, logo_url),
      team2:teams!matches_team2_id_fkey(id, name, short_code, primary_color, logo_url),
      winner:teams!matches_winner_id_fkey(id, name, short_code)
    `)
    .eq("season_id", seasonId)
    .order("match_number");
  if (error) return [];
  return data ?? [];
}

export async function getSeasonAwards(seasonId: string): Promise<Award[]> {
  const supabase = await getServerClient();
  const { data, error } = await supabase
    .from("awards")
    .select("*, player:players(full_name, slug, image_url, nationality)")
    .eq("season_id", seasonId);
  if (error) return [];
  return data ?? [];
}

// ─── Records ──────────────────────────────────────────────────────────────────

export async function getAllRecords(category?: string): Promise<NPLRecord[]> {
  const supabase = await getServerClient();
  let query = supabase
    .from("records")
    .select(`
      *,
      player:players(full_name, slug, image_url, nationality),
      team:teams(name, short_code, primary_color),
      season:seasons(year)
    `)
    .order("value", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return [];
  return data ?? [];
}

// ─── Points table ─────────────────────────────────────────────────────────────

export async function getPointsTable(seasonId: string) {
  const supabase = await getServerClient();
  const { data: matches, error } = await supabase
    .from("matches")
    .select("team1_id, team2_id, winner_id, is_completed, result_margin")
    .eq("season_id", seasonId)
    .eq("is_completed", true)
    .eq("match_type", "league");

  if (error || !matches) return [];

  const table: Record<string, {
    team_id: string; played: number; won: number;
    lost: number; nr: number; points: number; nrr: number;
  }> = {};

  for (const m of matches) {
    [m.team1_id, m.team2_id].forEach((tid) => {
      if (!table[tid]) {
        table[tid] = { team_id: tid, played: 0, won: 0, lost: 0, nr: 0, points: 0, nrr: 0 };
      }
    });
    table[m.team1_id].played++;
    table[m.team2_id].played++;

    if (m.winner_id) {
      table[m.winner_id].won++;
      table[m.winner_id].points += 2;
      const loser = m.winner_id === m.team1_id ? m.team2_id : m.team1_id;
      table[loser].lost++;
    } else {
      table[m.team1_id].nr++;
      table[m.team2_id].nr++;
      table[m.team1_id].points++;
      table[m.team2_id].points++;
    }
  }

  return Object.values(table).sort(
    (a, b) => b.points - a.points || b.nrr - a.nrr
  );
}