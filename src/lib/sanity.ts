import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

// ── Only create the client if projectId exists ────────────────────────────────
export const sanityClient = projectId
  ? (await import("next-sanity").then(({ createClient }) =>
      createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: true })
    ))
  : null;

export function urlFor(source: SanityImageSource) {
  if (!sanityClient) throw new Error("Sanity not configured");
  return imageUrlBuilder(sanityClient).image(source);
}

// ── GROQ Queries ──────────────────────────────────────────────────────────────
export const ALL_ARTICLES_QUERY = `
  *[_type == "article"] | order(publishedAt desc) {
    _id, title, slug, category, excerpt, publishedAt, readTime,
    "imageUrl": mainImage.asset->url, author->{name}
  }
`;

export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug][0] {
    _id, title, slug, category, excerpt, publishedAt, readTime,
    "imageUrl": mainImage.asset->url, body, author->{name, bio}
  }
`;

export const FEATURED_ARTICLES_QUERY = `
  *[_type == "article"] | order(publishedAt desc) [0...6] {
    _id, title, slug, category, excerpt, publishedAt, readTime,
    "imageUrl": mainImage.asset->url
  }
`;

// ── Types ─────────────────────────────────────────────────────────────────────
export interface SanityArticle {
  _id:         string;
  title:       string;
  slug:        { current: string };
  category:    string;
  excerpt:     string;
  publishedAt: string;
  readTime:    string;
  imageUrl:    string | null;
  author?:     { name: string };
  body?:       unknown[];
}