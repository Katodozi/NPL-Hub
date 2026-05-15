// ─── Seasons ──────────────────────────────────────────────────────────────────

export interface Season {
  id: string;
  year: number;
  title: string;
  title_sponsor: string;
  start_date: string;
  end_date: string;
  champion_team_id: string | null;
  runner_up_id: string | null;
  total_matches: number;
  status: "upcoming" | "live" | "completed";
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface Team {
  id: string;
  name: string;
  short_code: string;         // e.g. "BK" for Biratnagar Kings
  city: string;
  province: string;
  owner: string;
  logo_url: string | null;
  primary_color: string;      // hex
  secondary_color: string;    // hex
  founded_year: number;
  home_venue: string | null;
}

export interface TeamSeason {
  id: string;
  team_id: string;
  season_id: string;
  captain_id: string | null;
  team?: Team;
  season?: Season;
}

// ─── Players ──────────────────────────────────────────────────────────────────

export type PlayerRole = "batter" | "bowler" | "all-rounder" | "wicket-keeper";
export type BattingStyle = "right-hand" | "left-hand";
export type BowlingStyle =
  | "right-arm fast"
  | "right-arm medium"
  | "right-arm off-break"
  | "right-arm leg-break"
  | "left-arm fast"
  | "left-arm medium"
  | "left-arm orthodox"
  | "left-arm chinaman"
  | "none";

export interface Player {
  id: string;
  full_name: string;
  short_name: string;
  nationality: string;
  dob: string | null;
  role: PlayerRole;
  batting_style: BattingStyle;
  bowling_style: BowlingStyle;
  image_url: string | null;
  bio: string | null;
  is_overseas: boolean;
  slug: string;
}

export interface PlayerSeasonTeam {
  id: string;
  player_id: string;
  team_id: string;
  season_id: string;
  auction_price: number | null;   // in lakhs NPR
  is_marquee: boolean;
  is_retained: boolean;
  player?: Player;
  team?: Team;
  season?: Season;
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export type MatchType = "league" | "qualifier1" | "qualifier2" | "eliminator" | "final";

export interface Match {
  id: string;
  season_id: string;
  match_number: number;
  match_type: MatchType;
  date: string;
  venue: string;
  team1_id: string;
  team2_id: string;
  winner_id: string | null;
  result_margin: string | null;   // e.g. "5 wickets" or "32 runs"
  cricketdata_match_id: string | null;
  team1?: Team;
  team2?: Team;
  winner?: Team;
  season?: Season;
}

// ─── Player Stats ─────────────────────────────────────────────────────────────

export interface PlayerMatchStats {
  id: string;
  player_id: string;
  match_id: string;
  team_id: string;
  // Batting
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  is_out: boolean;
  dismissal_type: string | null;
  // Bowling
  overs: number;
  wickets: number;
  runs_conceded: number;
  economy: number;
  maidens: number;
  // Fielding
  catches: number;
  run_outs: number;
  stumpings: number;
  player?: Player;
  match?: Match;
}

export interface PlayerCareerStats {
  player_id: string;
  player?: Player;
  // Batting
  matches: number;
  innings_batted: number;
  total_runs: number;
  highest_score: number;
  batting_avg: number;
  batting_sr: number;
  fifties: number;
  hundreds: number;
  total_fours: number;
  total_sixes: number;
  // Bowling
  innings_bowled: number;
  total_wickets: number;
  best_bowling: string;         // e.g. "4/18"
  bowling_avg: number;
  bowling_economy: number;
  bowling_sr: number;
  // Fielding
  total_catches: number;
  total_run_outs: number;
  total_stumpings: number;
  // NPL specific
  seasons_played: number;
  teams_played_for: string[];   // team ids
}

// ─── Records ──────────────────────────────────────────────────────────────────

export type RecordCategory = "batting" | "bowling" | "fielding" | "team" | "partnership";

export interface Record {
  id: string;
  category: RecordCategory;
  record_type: string;          // e.g. "Most runs in a season"
  player_id: string | null;
  team_id: string | null;
  season_id: string | null;
  match_id: string | null;
  value: number;
  description: string;
  player?: Player;
  team?: Team;
  season?: Season;
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export interface Award {
  id: string;
  season_id: string;
  award_name: string;
  player_id: string;
  description: string | null;
  player?: Player;
  season?: Season;
}

// ─── Sponsors ─────────────────────────────────────────────────────────────────

export type SponsorType = "title" | "associate" | "kit" | "official-partner";

export interface Sponsor {
  id: string;
  team_id: string | null;       // null = tournament-wide
  name: string;
  logo_url: string | null;
  website_url: string | null;
  type: SponsorType;
  season_id: string | null;     // null = multi-season
}

// ─── API / UI helpers ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface StatCard {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}
