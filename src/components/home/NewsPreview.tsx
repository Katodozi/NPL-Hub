import Link from "next/link";
import { ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Static placeholder articles — will be replaced with Sanity CMS fetch
const PLACEHOLDER_NEWS = [
  {
    id: "1",
    slug: "npl-2026-title-sponsor-confirmed",
    category: "Official",
    title: "Siddhartha Bank confirmed as NPL title sponsor through 2029",
    excerpt:
      "The Cricket Association of Nepal has confirmed the landmark multi-year title sponsorship deal, the biggest investment in Nepali sports history.",
    date: "2025-11-20",
    readTime: "3 min",
    featured: true,
  },
  {
    id: "2",
    slug: "lumbini-lions-npl-2025-champions",
    category: "Match Report",
    title: "Lumbini Lions clinch NPL 2025 title in dominant final",
    excerpt:
      "Faf du Plessis led from the front as Lumbini Lions defeated Pokhara Rhinos by 32 runs to claim the second edition of the Nepal Premier League.",
    date: "2025-11-18",
    readTime: "5 min",
    featured: false,
  },
  {
    id: "3",
    slug: "sandeep-lamichhane-purple-cap-2025",
    category: "Stats",
    title: "Sandeep Lamichhane wins Purple Cap for second successive season",
    excerpt:
      "Nepal's premier leg-spinner finished NPL 2025 with 18 wickets from 10 matches, cementing his status as the tournament's most feared bowler.",
    date: "2025-11-17",
    readTime: "4 min",
    featured: false,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Official:       "bg-npl-blue-50  text-npl-blue-700  dark:bg-npl-blue-950/30  dark:text-npl-blue-400",
  "Match Report": "bg-npl-red-50   text-npl-red-700   dark:bg-npl-red-950/30   dark:text-npl-red-400",
  Stats:          "bg-npl-gold-50  text-npl-gold-700  dark:bg-npl-gold-950/30  dark:text-npl-gold-400",
  Analysis:       "bg-npl-green-50 text-npl-green-700 dark:bg-npl-green-950/30 dark:text-npl-green-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export function NewsPreview() {
  const [featured, ...rest] = PLACEHOLDER_NEWS;

  return (
    <section className="py-14">
      <div className="section-container">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-npl-red-500 mb-1">
              Latest
            </p>
            <h2 className="text-2xl font-bold text-foreground">News &amp; Updates</h2>
          </div>
          <Link
            href="/news"
            className="hidden sm:flex items-center gap-1 text-sm text-npl-red-500 hover:text-npl-red-600 font-medium"
          >
            All articles <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Featured */}
          <Link
            href={`/news/${featured.slug}`}
            className="lg:col-span-2 group relative rounded-2xl border border-border bg-background p-6 sm:p-8 flex flex-col justify-between gap-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <div>
              <span className={cn("inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4", CATEGORY_COLORS[featured.category] ?? CATEGORY_COLORS.Stats)}>
                {featured.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug mb-3 group-hover:text-npl-red-500 transition-colors text-balance">
                {featured.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {featured.excerpt}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{featured.readTime} read</span>
              <span>·</span>
              <span>{formatDate(featured.date)}</span>
            </div>
          </Link>

          {/* Side articles */}
          <div className="flex flex-col gap-4">
            {rest.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.slug}`}
                className="group flex flex-col rounded-xl border border-border bg-background p-4 hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <span className={cn("inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 self-start", CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.Stats)}>
                  {article.category}
                </span>
                <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 group-hover:text-npl-red-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                  <Clock className="w-3 h-3" />
                  <span>{article.readTime}</span>
                  <span>·</span>
                  <span>{formatDate(article.date)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
