import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Clock, Calendar } from "lucide-react";
import {
  sanityClient,
  ARTICLE_BY_SLUG_QUERY,
  FEATURED_ARTICLES_QUERY,
  type SanityArticle,
} from "@/lib/sanity";
import { cn } from "@/lib/utils";

export const revalidate = 1800;

const CATEGORY_COLORS: Record<string, string> = {
  Official:      "bg-npl-blue-50  text-npl-blue-700",
  "Match Report":"bg-npl-red-50   text-npl-red-700",
  Stats:         "bg-npl-gold-50  text-npl-gold-700",
  Awards:        "bg-purple-50    text-purple-700",
  Interview:     "bg-npl-green-50 text-npl-green-700",
};

// Static article content for placeholder slugs
const STATIC_CONTENT: Record<string, SanityArticle> = {
  "siddhartha-bank-npl-title-sponsor-2029": {
    _id: "1",
    title: "Siddhartha Bank confirmed as NPL title sponsor through 2029",
    slug: { current: "siddhartha-bank-npl-title-sponsor-2029" },
    category: "Official",
    excerpt: "The Cricket Association of Nepal has confirmed the landmark multi-year title sponsorship deal.",
    publishedAt: "2025-11-20",
    readTime: "3 min",
    imageUrl: null,
    body: [],
  },
  "lumbini-lions-npl-2025-champions": {
    _id: "2",
    title: "Lumbini Lions clinch NPL 2025 title in dominant final",
    slug: { current: "lumbini-lions-npl-2025-champions" },
    category: "Match Report",
    excerpt: "Faf du Plessis led from the front as Lumbini Lions defeated Pokhara Avengers by 32 runs.",
    publishedAt: "2025-11-18",
    readTime: "5 min",
    imageUrl: null,
    body: [],
  },
};

export async function generateStaticParams() {
  try {
    if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      return Object.keys(STATIC_CONTENT).map((slug) => ({ slug }));
    }
    const articles = await sanityClient.fetch<SanityArticle[]>(FEATURED_ARTICLES_QUERY);
    return articles.map((a) => ({ slug: a.slug.current }));
  } catch {
    return Object.keys(STATIC_CONTENT).map((slug) => ({ slug }));
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  try {
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      const article = await sanityClient.fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug });
      if (article) return { title: article.title, description: article.excerpt };
    }
    const static_ = STATIC_CONTENT[slug];
    if (static_) return { title: static_.title, description: static_.excerpt };
  } catch {}
  return { title: "Article Not Found" };
}

async function getArticle(slug: string): Promise<SanityArticle | null> {
  try {
    if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
      const article = await sanityClient.fetch<SanityArticle>(ARTICLE_BY_SLUG_QUERY, { slug });
      if (article) return article;
    }
  } catch {}
  return STATIC_CONTENT[slug] ?? null;
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <div className="section-container py-12 max-w-3xl">
      <Link
        href="/news"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> All News
      </Link>

      {/* Article header */}
      <div className="mb-8">
        <span className={cn(
          "inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4",
          CATEGORY_COLORS[article.category] ?? "bg-muted text-muted-foreground"
        )}>
          {article.category}
        </span>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4 text-balance">
          {article.title}
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed mb-6">
          {article.excerpt}
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-6 border-b border-border">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {new Date(article.publishedAt).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
            })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {article.readTime} read
          </span>
          {article.author?.name && (
            <span>By <strong className="text-foreground">{article.author.name}</strong></span>
          )}
        </div>
      </div>

      {/* Cover image */}
      {article.imageUrl && (
        <div className="rounded-2xl overflow-hidden mb-8 aspect-video bg-muted">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article body — Sanity Portable Text or placeholder */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        {article.body && article.body.length > 0 ? (
          // When Sanity is connected, render Portable Text here
          // Install @portabletext/react and replace this with <PortableText value={article.body} />
          <p className="text-muted-foreground">
            Article body will render here with @portabletext/react once Sanity is fully configured.
          </p>
        ) : (
          <div className="space-y-4 text-foreground">
            <p className="text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Full article content managed via Sanity CMS.
              </p>
              <Link
                href="/about#cms"
                className="text-xs text-npl-red-500 hover:underline"
              >
                Setup Sanity to publish full articles →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
