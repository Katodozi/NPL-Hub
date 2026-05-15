-- ============================================================
-- NPL HUB — Supabase PostgreSQL Schema
-- Optimized order only; no unnecessary structural changes
-- ============================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─── TEAMS ────────────────────────────────────────────────────────────────────
create table teams (
  id              uuid primary key default uuid_generate_v4(),
  name            text unique not null,
  short_code      char(2) unique not null,
  city            text not null,
  province        text not null,
  owner           text,
  logo_url        text,
  primary_color   char(7) not null default '#C0392B',
  secondary_color char(7) not null default '#FFFFFF',
  founded_year    int not null default 2024,
  home_venue      text,
  slug            text unique not null,
  created_at      timestamptz default now()
);

-- ─── PLAYERS ──────────────────────────────────────────────────────────────────
create table players (
  id              uuid primary key default uuid_generate_v4(),
  full_name       text not null,
  short_name      text not null,
  nationality     text not null,
  dob             date,
  role            text not null check (role in ('batter','bowler','all-rounder','wicket-keeper')),
  batting_style   text not null check (batting_style in ('right-hand','left-hand')),
  bowling_style   text not null,
  image_url       text,
  bio             text,
  is_overseas     boolean not null default false,
  slug            text unique not null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger players_updated_at
  before update on players
  for each row execute function update_updated_at();

-- ─── SEASONS ──────────────────────────────────────────────────────────────────
create table seasons (
  id               uuid primary key default uuid_generate_v4(),
  year             int unique not null,
  title            text not null,
  title_sponsor    text not null default 'Siddhartha Bank',
  start_date       date,
  end_date         date,
  champion_team_id  uuid references teams(id) on delete set null,
  runner_up_id     uuid references teams(id) on delete set null,
  total_matches     int default 0,
  status           text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  created_at       timestamptz default now()
);

-- ─── TEAM SEASONS ─────────────────────────────────────────────────────────────
create table team_seasons (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid not null references teams(id) on delete cascade,
  season_id   uuid not null references seasons(id) on delete cascade,
  captain_id  uuid references players(id) on delete set null,
  unique(team_id, season_id)
);

-- ─── PLAYER SEASON TEAM (auction/roster) ─────────────────────────────────────
create table player_season_team (
  id           uuid primary key default uuid_generate_v4(),
  player_id    uuid not null references players(id) on delete cascade,
  team_id      uuid not null references teams(id) on delete cascade,
  season_id    uuid not null references seasons(id) on delete cascade,
  auction_price int,         -- in thousands NPR
  is_marquee   boolean default false,
  is_retained  boolean default false,
  unique(player_id, season_id)
);

-- ─── MATCHES ──────────────────────────────────────────────────────────────────
create table matches (
  id                   uuid primary key default uuid_generate_v4(),
  season_id            uuid not null references seasons(id) on delete cascade,
  match_number         int not null,
  match_type           text not null default 'league' check (match_type in ('league','qualifier1','qualifier2','eliminator','final')),
  date                 timestamptz not null,
  venue                text not null,
  team1_id             uuid not null references teams(id),
  team2_id             uuid not null references teams(id),
  winner_id            uuid references teams(id),
  result_margin        text,
  cricketdata_match_id  text unique,
  is_completed         boolean default false,
  created_at           timestamptz default now(),
  check (team1_id <> team2_id)
);

create index idx_matches_season on matches(season_id);
create index idx_matches_date on matches(date);

-- ─── PLAYER MATCH STATS ───────────────────────────────────────────────────────
create table player_match_stats (
  id              uuid primary key default uuid_generate_v4(),
  player_id       uuid not null references players(id) on delete cascade,
  match_id        uuid not null references matches(id) on delete cascade,
  team_id         uuid not null references teams(id),
  -- Batting
  runs            int not null default 0,
  balls_faced     int not null default 0,
  fours           int not null default 0,
  sixes           int not null default 0,
  strike_rate     numeric(6,2) generated always as (
    case when balls_faced > 0 then (runs::numeric / balls_faced) * 100 else 0 end
  ) stored,
  is_out          boolean default true,
  dismissal_type  text,
  -- Bowling (overs as decimal: 4.3 = 4 overs 3 balls)
  overs           numeric(4,1) not null default 0,
  wickets         int not null default 0,
  runs_conceded   int not null default 0,
  economy         numeric(5,2) generated always as (
    case when overs > 0 then runs_conceded::numeric / overs else 0 end
  ) stored,
  maidens         int not null default 0,
  -- Fielding
  catches         int not null default 0,
  run_outs        int not null default 0,
  stumpings       int not null default 0,
  unique(player_id, match_id)
);

create index idx_pms_player on player_match_stats(player_id);
create index idx_pms_match on player_match_stats(match_id);

-- ─── RECORDS ──────────────────────────────────────────────────────────────────
create table records (
  id           uuid primary key default uuid_generate_v4(),
  category     text not null check (category in ('batting','bowling','fielding','team','partnership')),
  record_type  text not null,
  player_id    uuid references players(id) on delete set null,
  team_id      uuid references teams(id) on delete set null,
  season_id    uuid references seasons(id) on delete set null,
  match_id     uuid references matches(id) on delete set null,
  value        numeric not null,
  description  text not null,
  created_at   timestamptz default now()
);

-- ─── AWARDS ───────────────────────────────────────────────────────────────────
create table awards (
  id           uuid primary key default uuid_generate_v4(),
  season_id    uuid not null references seasons(id) on delete cascade,
  award_name   text not null,
  player_id    uuid not null references players(id) on delete cascade,
  description  text,
  created_at   timestamptz default now()
);

-- ─── SPONSORS ─────────────────────────────────────────────────────────────────
create table sponsors (
  id          uuid primary key default uuid_generate_v4(),
  team_id     uuid references teams(id) on delete cascade,
  season_id   uuid references seasons(id) on delete set null,
  name        text not null,
  logo_url    text,
  website_url text,
  type        text not null check (type in ('title','associate','kit','official-partner')),
  created_at  timestamptz default now()
);

-- ─── PLAYER CAREER STATS VIEW ─────────────────────────────────────────────────
-- Auto-computed from player_match_stats — never store manually
create or replace view player_career_stats as
select
  p.id                                              as player_id,
  p.full_name,
  p.slug,
  p.nationality,
  p.role,
  p.is_overseas,

  -- Matches
  count(distinct pms.match_id)                      as matches,

  -- Batting
  count(distinct pms.match_id) filter (where pms.balls_faced > 0) as innings_batted,
  coalesce(sum(pms.runs), 0)                        as total_runs,
  coalesce(max(pms.runs), 0)                        as highest_score,
  round(
    case when count(*) filter (where pms.is_out) > 0
    then sum(pms.runs)::numeric / count(*) filter (where pms.is_out)
    else sum(pms.runs)::numeric end, 2
  )                                                 as batting_avg,
  round(
    case when sum(pms.balls_faced) > 0
    then (sum(pms.runs)::numeric / sum(pms.balls_faced)) * 100
    else 0 end, 2
  )                                                 as batting_sr,
  count(*) filter (where pms.runs >= 50 and pms.runs < 100) as fifties,
  count(*) filter (where pms.runs >= 100)           as hundreds,
  coalesce(sum(pms.fours), 0)                       as total_fours,
  coalesce(sum(pms.sixes), 0)                       as total_sixes,

  -- Bowling
  count(distinct pms.match_id) filter (where pms.overs > 0) as innings_bowled,
  coalesce(sum(pms.wickets), 0)                     as total_wickets,
  round(
    case when sum(pms.wickets) > 0
    then sum(pms.runs_conceded)::numeric / sum(pms.wickets)
    else 0 end, 2
  )                                                 as bowling_avg,
  round(
    case when sum(pms.overs) > 0
    then sum(pms.runs_conceded)::numeric / sum(pms.overs)
    else 0 end, 2
  )                                                 as bowling_economy,

  -- Fielding
  coalesce(sum(pms.catches), 0)                     as total_catches,
  coalesce(sum(pms.run_outs), 0)                    as total_run_outs,
  coalesce(sum(pms.stumpings), 0)                   as total_stumpings,

  -- NPL-specific
  count(distinct pst.season_id)                     as seasons_played

from players p
left join player_match_stats pms on pms.player_id = p.id
left join player_season_team pst on pst.player_id = p.id
group by p.id, p.full_name, p.slug, p.nationality, p.role, p.is_overseas;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table seasons            enable row level security;
alter table teams              enable row level security;
alter table team_seasons       enable row level security;
alter table players            enable row level security;
alter table player_season_team enable row level security;
alter table matches            enable row level security;
alter table player_match_stats enable row level security;
alter table records            enable row level security;
alter table awards             enable row level security;
alter table sponsors           enable row level security;

-- Public READ for all tables (fan site = public data)
create policy "public_read_seasons"      on seasons for select using (true);
create policy "public_read_teams"        on teams for select using (true);
create policy "public_read_team_seasons"  on team_seasons for select using (true);
create policy "public_read_players"      on players for select using (true);
create policy "public_read_pst"          on player_season_team for select using (true);
create policy "public_read_matches"      on matches for select using (true);
create policy "public_read_pms"          on player_match_stats for select using (true);
create policy "public_read_records"      on records for select using (true);
create policy "public_read_awards"       on awards for select using (true);
create policy "public_read_sponsors"     on sponsors for select using (true);

-- Admin WRITE (service role bypasses RLS — handled in API routes)
-- No additional policies needed; service role key has full access.