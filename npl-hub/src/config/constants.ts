import type { NavItem, Team } from "@/types";

// ─── NPL Meta ──────────────────────────────────────────────────────────────────

export const NPL_META = {
  name: "Nepal Premier League",
  short: "NPL",
  organizer: "Cricket Association of Nepal (CAN)",
  format: "T20",
  teams: 8,
  current_season: 2026,
  inaugural_season: 2024,
  title_sponsor: "Siddhartha Bank",
  title_sponsor_deal: "2024–2029 (5 years)",
  /* NPL 2026 target start date — update when CAN announces */
  next_season_start: "2026-10-15T00:00:00+05:45",
} as const;

// ─── Teams ─────────────────────────────────────────────────────────────────────

export const NPL_TEAMS: Omit<Team, "id">[] = [
  {
    name: "Biratnagar Kings",
    short_code: "BK",
    city: "Biratnagar",
    province: "Koshi",
    owner: "—",
    logo_url: null,
    primary_color: "#C0392B",
    secondary_color: "#F0D080",
    founded_year: 2024,
    home_venue: "Biratnagar Cricket Ground",
  },
  {
    name: "Janakpur Bolts",
    short_code: "JB",
    city: "Janakpur",
    province: "Madhesh",
    owner: "—",
    logo_url: null,
    primary_color: "#E67E22",
    secondary_color: "#2C3E50",
    founded_year: 2024,
    home_venue: "Janakpur Stadium",
  },
  {
    name: "Kathmandu Gorkhas",
    short_code: "KG",
    city: "Kathmandu",
    province: "Bagmati",
    owner: "—",
    logo_url: null,
    primary_color: "#D4A017",
    secondary_color: "#1A1A1A",
    founded_year: 2024,
    home_venue: "TU Cricket Ground",
  },
  {
    name: "Lumbini Lions",
    short_code: "LL",
    city: "Butwal",
    province: "Lumbini",
    owner: "—",
    logo_url: null,
    primary_color: "#27AE60",
    secondary_color: "#F39C12",
    founded_year: 2024,
    home_venue: "Rupandehi Cricket Stadium",
  },
  {
    name: "Pokhara Avengers",
    short_code: "PR",
    city: "Pokhara",
    province: "Gandaki",
    owner: "—",
    logo_url: null,
    primary_color: "#2980B9",
    secondary_color: "#ECF0F1",
    founded_year: 2024,
    home_venue: "Pokhara Stadium",
  },
  {
    name: "Sudurpashchim Royals",
    short_code: "SR",
    city: "Dhangadhi",
    province: "Sudurpashchim",
    owner: "—",
    logo_url: null,
    primary_color: "#8E44AD",
    secondary_color: "#F1C40F",
    founded_year: 2024,
    home_venue: "Dhangadhi Premier League Ground",
  },
  {
    name: "Chitwan Rhinos",
    short_code: "CT",
    city: "Bharatpur",
    province: "Bagmati",
    owner: "—",
    logo_url: null,
    primary_color: "#E74C3C",
    secondary_color: "#2C3E50",
    founded_year: 2024,
    home_venue: "Bharatpur Cricket Ground",
  },
  {
    name: "Karnali Yaks",
    short_code: "KY",
    city: "Surkhet",
    province: "Karnali",
    owner: "—",
    logo_url: null,
    primary_color: "#1ABC9C",
    secondary_color: "#34495E",
    founded_year: 2024,
    home_venue: "Birendranagar Cricket Ground",
  },
];

// ─── Navigation ─────────────────────────────────────────────────────────────────

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "History",
    href: "/history",
    children: [
      { label: "Season 2024", href: "/history/2024" },
      { label: "Season 2025", href: "/history/2025" },
      { label: "NPL 2026", href: "/history/2026" },
    ],
  },
  { label: "Teams", href: "/teams" },
  { label: "Players", href: "/players" },
  { label: "Records", href: "/records" },
  { label: "Sponsors", href: "/sponsors" },
  { label: "News", href: "/news" },
];

// ─── Season Champions ──────────────────────────────────────────────────────────

export const SEASON_CHAMPIONS = [
  {
    year: 2024,
    champion: "Janakpur Bolts",
    runner_up: "Kathmandu Gorkhas",
    player_of_series: "Rohit Paudel",
    final_result: "Janakpur Bolts won by 5 wickets",
  },
  {
    year: 2025,
    champion: "Lumbini Lions",
    runner_up: "Pokhara Avengers",
    player_of_series: "Faf du Plessis",
    final_result: "Lumbini Lions won by 32 runs",
  },
] as const;

// ─── All-time Records (seed data) ─────────────────────────────────────────────

export const ALL_TIME_RECORDS = [
  {
    category: "batting",
    label: "Most Runs (Career)",
    value: "555",
    holder: "Rohit Paudel",
    team: "Lumibini Lions",
    season: "2024 & 2025",
  },
  {
    category: "batting",
    label: "Highest Individual Score",
    value: "114*",
    holder: "Mark Watt",
    team: "Karnali Yaks",
    season: "2025",
  },
  {
    category: "bowling",
    label: "Most Wickets (Career)",
    value: "27",
    holder: "Scott Kuggeleijn",
    team: "Sudurpashchim Royals",
    season: "2024 & 2025",
  },
  {
    category: "bowling",
    label: "Best Bowling in an Innings",
    value: "5/12",
    holder: "Karan KC",
    team: "Kathmandu Gorkhas",
    season: "2024",
  },
  {
    category: "batting",
    label: "Most Sixes (Career)",
    value: "42",
    holder: "Dawid Malan",
    team: "Chitwan Rhinos",
    season: "2025",
  },
  {
    category: "team",
    label: "Highest Team Total",
    value: "219/4",
    holder: "Lumbini Lions",
    team: "vs Karnali Yaks",
    season: "2025",
  },
] as const;

// ─── Orange / Purple Cap (latest season) ──────────────────────────────────────

export const CAP_LEADERS = {
  golden: {
    label: "Golden Cap 2025",
    holder: "Sandeep Lamichhane",
    team: "Lumbini Lions",
    value: "17 wickets",
    nationality: "Nepal",
  },
  platinum: {
    label: "Platinum Cap 2025",
    holder: "Adam Rossington",
    team: "Pokhara Avengers",
    value: "323 runs",
    nationality: "England",
  },
} as const;
