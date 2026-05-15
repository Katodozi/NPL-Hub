import type { MetadataRoute } from "next";
import { getBuildClient } from "@/lib/db";
import { NPL_TEAMS, NPL_META } from "@/config/constants";
import { slugify } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://nplhub.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getBuildClient();

  // Fetch slugs from DB
  const [{ data: players }, { data: teams }] = await Promise.all([
    supabase.from("players").select("slug, updated_at"),
    supabase.from("teams").select("slug"),
  ]);

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,             lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/teams`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/players`,lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/history`,lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/records`,lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/sponsors`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/news`,   lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE}/about`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Season pages
  const seasons = [2024, 2025, NPL_META.current_season];
  const seasonPages: MetadataRoute.Sitemap = seasons.map((year) => ({
    url: `${BASE}/history/${year}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Team pages — use DB if available, fall back to constants
  const teamSlugs = teams?.map((t) => t.slug) ??
    NPL_TEAMS.map((t) => slugify(t.name));
  const teamPages: MetadataRoute.Sitemap = teamSlugs.map((slug) => ({
    url: `${BASE}/teams/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Player pages
  const playerPages: MetadataRoute.Sitemap = (players ?? []).map((p) => ({
    url: `${BASE}/players/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...seasonPages, ...teamPages, ...playerPages];
}
