import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CricAPIMatch {
  id:         string;
  name:       string;
  status:     string;
  venue:      string;
  date:       string;
  dateTimeGMT:string;
  teams:      string[];
  score?:     { r: number; w: number; o: number; inning: string }[];
  matchWinner?: string;
  matchType:  string;
}

// ─── Helper — fetch from CricketData.org ─────────────────────────────────────
async function fetchCricAPI(endpoint: string) {
  const key = process.env.CRICKET_API_KEY;
  if (!key) throw new Error("CRICKET_API_KEY not set");
  const res = await fetch(
    `${process.env.CRICKET_API_BASE ?? "https://api.cricketdata.org/api/v1"}/${endpoint}&apikey=${key}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  return res.json();
}

// ─── Main sync handler ────────────────────────────────────────────────────────
export async function GET(request: Request) {
  // Protect with a secret so only Vercel Cron can call this
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    // 1. Get all NPL seasons from our DB to find the active one
    const { data: seasons } = await supabase
      .from("seasons")
      .select("id, year, status")
      .in("status", ["live", "upcoming"]);

    if (!seasons || seasons.length === 0) {
      return NextResponse.json({ message: "No active seasons to sync" });
    }

    const results: string[] = [];

    for (const season of seasons) {
      // 2. Search CricAPI for NPL matches in this year
      const searchQuery = `Nepal+Premier+League+${season.year}`;
      const seriesData  = await fetchCricAPI(`series?offset=0&search=${searchQuery}`).catch(() => null);

      if (!seriesData?.data?.length) {
        results.push(`NPL ${season.year}: no series found on CricAPI`);
        continue;
      }

      const series = seriesData.data[0];

      // 3. Get matches for that series
      const matchData = await fetchCricAPI(`matches?seriesid=${series.id}&offset=0`).catch(() => null);
      if (!matchData?.data?.length) {
        results.push(`NPL ${season.year}: no matches found`);
        continue;
      }

      const matches: CricAPIMatch[] = matchData.data;
      let synced = 0;

      for (const m of matches) {
        if (!m.dateTimeGMT) continue;

        // 4. Find matching teams in our DB
        const [team1Name, team2Name] = m.teams ?? [];
        if (!team1Name || !team2Name) continue;

        const { data: teams } = await supabase
          .from("teams")
          .select("id, name")
          .or(`name.ilike.%${team1Name}%,name.ilike.%${team2Name}%`);

        if (!teams || teams.length < 2) continue;

        const team1 = teams.find((t) => team1Name.toLowerCase().includes(t.name.toLowerCase().split(" ")[0]));
        const team2 = teams.find((t) => team2Name.toLowerCase().includes(t.name.toLowerCase().split(" ")[0]));
        if (!team1 || !team2) continue;

        // 5. Determine winner
        const winner = teams.find((t) =>
          m.matchWinner?.toLowerCase().includes(t.name.toLowerCase().split(" ")[0])
        );

        // 6. Upsert match into our DB
        await supabase.from("matches").upsert({
          season_id:            season.id,
          match_number:         synced + 1,
          match_type:           "league",
          date:                 m.dateTimeGMT,
          venue:                m.venue ?? "TBA",
          team1_id:             team1.id,
          team2_id:             team2.id,
          winner_id:            winner?.id ?? null,
          result_margin:        m.status ?? null,
          is_completed:         m.status?.toLowerCase().includes("won") ?? false,
          cricketdata_match_id: m.id,
        }, { onConflict: "cricketdata_match_id" });

        synced++;
      }

      results.push(`NPL ${season.year}: synced ${synced} matches`);
    }

    return NextResponse.json({ success: true, results, timestamp: new Date().toISOString() });

  } catch (err) {
    console.error("Sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
