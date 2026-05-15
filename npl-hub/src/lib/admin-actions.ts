"use server";

import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// ─── Players ──────────────────────────────────────────────────────────────────

export async function createPlayer(formData: {
  full_name: string; short_name: string; nationality: string;
  dob: string; role: string; batting_style: string; bowling_style: string;
  bio: string; is_overseas: boolean; image_url: string;
}) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      ...formData,
      slug:      slugify(formData.full_name),
      dob:       formData.dob       || null,
      image_url: formData.image_url || null,
      bio:       formData.bio       || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message, data: null };
  revalidatePath("/admin/players");
  revalidatePath("/players");
  return { error: null, data };
}

export async function updatePlayer(
  id: string,
  formData: {
    full_name: string; short_name: string; nationality: string;
    dob: string; role: string; batting_style: string; bowling_style: string;
    bio: string; is_overseas: boolean; image_url: string;
  }
) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("players")
    .update({
      ...formData,
      dob:       formData.dob       || null,
      image_url: formData.image_url || null,
      bio:       formData.bio       || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  revalidatePath("/players");
  revalidatePath(`/players/${slugify(formData.full_name)}`);
  return { error: null };
}

export async function deletePlayer(id: string) {
  const supabase = createAdminSupabaseClient();
  await supabase.from("player_season_team").delete().eq("player_id", id);
  await supabase.from("player_match_stats").delete().eq("player_id", id);
  const { error } = await supabase.from("players").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  revalidatePath("/players");
  return { error: null };
}

export async function assignPlayerToTeam(data: {
  player_id: string; team_id: string; season_id: string;
  is_marquee: boolean; is_retained: boolean; auction_price: number;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("player_season_team")
    .insert({
      ...data,
      auction_price: data.auction_price || null,
    });

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  revalidatePath("/players");
  revalidatePath("/teams");
  return { error: null };
}

export async function removePlayerTeamAssignment(assignId: string) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("player_season_team")
    .delete()
    .eq("id", assignId);

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  revalidatePath("/teams");
  return { error: null };
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export async function createTeam(formData: {
  name: string; short_code: string; city: string; province: string;
  owner: string; primary_color: string; secondary_color: string;
  founded_year: number; home_venue: string;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("teams").insert({
    ...formData,
    slug:       slugify(formData.name),
    owner:      formData.owner      || null,
    home_venue: formData.home_venue || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  revalidatePath("/teams");
  return { error: null };
}

export async function updateTeam(
  id: string,
  formData: {
    name: string; short_code: string; city: string; province: string;
    owner: string; primary_color: string; secondary_color: string;
    founded_year: number; home_venue: string;
  }
) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("teams")
    .update({
      ...formData,
      slug:       slugify(formData.name),
      owner:      formData.owner      || null,
      home_venue: formData.home_venue || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  revalidatePath("/teams");
  return { error: null };
}

export async function deleteTeam(id: string) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/teams");
  revalidatePath("/teams");
  return { error: null };
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function createMatch(formData: {
  season_id: string; match_number: number; match_type: string;
  date: string; venue: string; team1_id: string; team2_id: string;
  winner_id: string; result_margin: string; is_completed: boolean;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("matches").insert({
    ...formData,
    winner_id:     formData.winner_id     || null,
    result_margin: formData.result_margin || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/matches");
  revalidatePath("/history");
  return { error: null };
}

// ─── Awards ───────────────────────────────────────────────────────────────────

export async function createAward(formData: {
  season_id: string; award_name: string;
  player_id: string; description: string;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from("awards").insert({
    ...formData,
    description: formData.description || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/awards");
  return { error: null };
}

// ─── Player Match Stats ───────────────────────────────────────────────────────

export async function upsertPlayerMatchStats(formData: {
  player_id: string; match_id: string; team_id: string;
  runs: number; balls_faced: number; fours: number; sixes: number;
  is_out: boolean; dismissal_type: string;
  overs: number; wickets: number; runs_conceded: number; maidens: number;
  catches: number; run_outs: number; stumpings: number;
}) {
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase
    .from("player_match_stats")
    .upsert(formData, { onConflict: "player_id,match_id" });

  if (error) return { error: error.message };
  revalidatePath("/players");
  revalidatePath("/admin/stats");
  return { error: null };
}