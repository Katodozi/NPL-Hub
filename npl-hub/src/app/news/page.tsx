import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import {
  sanityClient,
  FEATURED_ARTICLES_QUERY,
  type SanityArticle,
} from "@/lib/sanity";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "News & Updates" };
export const revalidate = 1800; // 30 min

// ── Static fallback articles (shown until Sanity is set up) ──────────────────
const STATIC_ARTICLES: SanityArticle[] = [
  {
    _id: "1",
    title: "Siddhartha Bank confirmed as NPL title sponsor through 2029",
    slug: { current: "siddhartha-bank-npl-title-sponsor-2029" },
    category: "Official",
    excerpt:
      "The Cricket Association of Nepal has confirmed the landmark multi-year title sponsorship deal, the largest investment in Nepali sports history.",
    publishedAt: "2025-11-20",
    readTime: "3 min",
    imageUrl: null,
  },
  {
    _id: "2",
    title: "Lumbini Lions clinch NPL 2025 title in dominant final",
    slug: { current: "lumbini-lions-npl-2025-champions" },
    category: "Match Report",
    excerpt:
      "Faf du Plessis led from the front as Lumbini Lions defeated Pokhara Avengers by 32 runs to claim the second edition of the Nepal Premier League.",
    publishedAt: "2025-11-18",
    readTime: "5 min",
    imageUrl: null,
  },
  {
    _id: "3",
    title: "Sandeep Lamichhane wins Purple Cap for second successive season",
    slug: { current: "sandeep-lamichhane-purple-cap-2025" },
    category: "Stats",
    excerpt:
      "Nepal's premier leg-spinner finished NPL 2025 with 18 wickets from 10 matches, cementing his status as the tournament's most feared bowler.",
    publishedAt: "2025-11-17",
    readTime: "4 min",
    imageUrl: null,
  },
  {
    _id: "4",
    title: "NPL 2026 dates announced — third season set for October",
    slug: { current: "npl-2026-dates-announced" },
    category: "Official",
    excerpt:
      "CAN has officially confirmed the dates for the third edition of the Nepal Premier League, with the tournament scheduled to begin in mid-October 2026.",
    publishedAt: "2026-01-10",
    readTime: "2 min",
    imageUrl: null,
  },
  {
    _id: "5",
    title: "Rohit Paudel named NPL 2024 Player of the Series",
    slug: { current: "rohit-paudel-player-of-series-2024" },
    category: "Awards",
    excerpt:
      "Nepal captain Rohit Paudel capped an outstanding inaugural NPL campaign with the Player of the Series award after a dominant all-round performance.",
    publishedAt: "2024-11-30",
    readTime: "4 min",
    imageUrl: null,
  },
  {
    _id: "6",
    title: "Faf du Plessis: 'NPL is one of the most exciting T20 leagues I have played in'",
    slug: { current: "faf-du-plessis-npl-interview" },
    category: "Interview",
    excerpt:
      "South Africa legend Faf du Plessis opened up about his experience in the Nepal Premier League and why he plans to return for the 2026 edition.",
    publishedAt: "2025-12-05",
    readTime: "6 min",
    imageUrl: null,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Official:      "bg-npl-blue-50  text-npl-blue-700  dark:bg-npl-blue-950/30  dark:text-npl-blue-400",
  "Match Report":"bg-npl-red-50   text-npl-red-700   dark:bg-npl-red-950/30   dark:text-npl-red-400",
  Stats:         "bg-npl-gold-50  text-npl-gold-700  dark:bg-npl-gold-950/30  dark:text-npl-gold-400",
  Awards:        "bg-purple-50    text-purple-700    dark:bg-purple-950/30    dark:text-purple-400",
  Interview:     "bg-npl-green-50 text-npl-green-700 dark:bg-npl-green-950/30 dark:text-npl-green-400",
  Analysis:      "bg-orange-50    text-orange-700    dark:bg-orange-950/30    dark:text-orange-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });
}

async function getArticles(): Promise<{ articles: SanityArticle[]; fromCMS: boolean }> {
  try {
    if (!sanityClient) {
      return { articles: STATIC_ARTICLES, fromCMS: false };
    }
    const articles = await sanityClient.fetch<SanityArticle[]>(FEATURED_ARTICLES_QUERY);
    if (!articles || articles.length === 0) {
      return { articles: STATIC_ARTICLES, fromCMS: false };
    }
    return { articles, fromCMS: true };
  } catch {
    return { articles: STATIC_ARTICLES, fromCMS: false };
  }
}

export default async function NewsPage() {
  const { articles, fromCMS } = await getArticles();
  const [featured, ...rest] = articles;

  return (
    <div className="section-container py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
          Latest
        </p>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          News &amp; Updates
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Match reports, official announcements, player interviews and analysis
          from the Nepal Premier League.
        </p>
        {!fromCMS && (
          <div className="mt-4 inline-flex items-center gap-2 bg-npl-gold-50 border border-npl-gold-200 dark:bg-npl-gold-950/20 dark:border-npl-gold-800 rounded-lg px-3 py-2 text-xs text-npl-gold-700 dark:text-npl-gold-400">
            <span>📝</span>
            Showing placeholder articles — connect Sanity CMS to publish real content.{" "}
            <Link href="/about#cms" className="underline font-medium">
              Setup guide →
            </Link>
          </div>
        )}
      </div>

      {/* Featured article */}
      {featured && (
        <Link
          href={`/news/${featured.slug.current}`}
          className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 mb-8"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image or placeholder */}
            <div className="lg:w-2/5 bg-gradient-to-br from-npl-blue-500 to-npl-blue-800 min-h-[200px] lg:min-h-[280px] flex items-center justify-center relative overflow-hidden">
              {featured.imageUrl ? (
                <img
                  src={featured.imageUrl}
                  alt={featured.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <div className="text-6xl opacity-30">🏏</div>
              )}
              <div className="absolute inset-0 bg-npl-blue-900/20" />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    CATEGORY_COLORS[featured.category] ?? "bg-muted text-muted-foreground"
                  )}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-3 group-hover:text-npl-red-500 transition-colors text-balance">
                  {featured.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                  {featured.excerpt}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readTime} read
                </span>
                <span>·</span>
                <span>{formatDate(featured.publishedAt)}</span>
                {featured.author?.name && (
                  <>
                    <span>·</span>
                    <span>By {featured.author.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((article) => (
          <Link
            key={article._id}
            href={`/news/${article.slug.current}`}
            className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Image */}
            <div className="h-36 bg-gradient-to-br from-npl-blue-400 to-npl-blue-700 flex items-center justify-center relative overflow-hidden">
              {article.imageUrl ? (
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover absolute inset-0"
                />
              ) : (
                <span className="text-4xl opacity-20">🏏</span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <span className={cn(
                "self-start text-xs font-semibold px-2 py-0.5 rounded-full mb-3",
                CATEGORY_COLORS[article.category] ?? "bg-muted text-muted-foreground"
              )}>
                {article.category}
              </span>
              <h3 className="font-bold text-sm text-foreground leading-snug mb-2 group-hover:text-npl-red-500 transition-colors line-clamp-2">
                {article.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 mt-auto text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{article.readTime}</span>
                <span>·</span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
