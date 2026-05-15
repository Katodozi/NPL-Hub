import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Database, Globe, Shield, Code2 } from "lucide-react";

export const metadata: Metadata = { title: "About NPL Hub" };

const STACK = [
  { name: "Next.js 15",          role: "Framework",      url: "https://nextjs.org"              },
  { name: "Supabase",            role: "Database & Auth", url: "https://supabase.com"            },
  { name: "Tailwind CSS",        role: "Styling",         url: "https://tailwindcss.com"         },
  { name: "shadcn/ui",           role: "UI Components",   url: "https://ui.shadcn.com"           },
  { name: "Recharts",            role: "Charts",          url: "https://recharts.org"            },
  { name: "Cloudinary",          role: "Image Storage",   url: "https://cloudinary.com"          },
  { name: "Sanity CMS",          role: "Content",         url: "https://sanity.io"               },
  { name: "Vercel",              role: "Hosting",         url: "https://vercel.com"              },
  { name: "CricketData.org",     role: "Live Stats API",  url: "https://cricketdata.org"         },
];

const DATA_SOURCES = [
  {
    icon: Database,
    name: "CricketData.org",
    description: "Live match scores and scorecards during the NPL season. Free tier — 100 API calls/day, cached efficiently.",
    url: "https://cricketdata.org",
  },
  {
    icon: Globe,
    name: "Wikipedia REST API",
    description: "Historical season data, franchise information, and tournament records. Free and openly licensed.",
    url: "https://www.mediawiki.org/wiki/API:Main_page",
  },
  {
    icon: Shield,
    name: "Manual Admin Entry",
    description: "Player profiles, bios, photos, team assignments, match stats, and awards entered and verified by our admins.",
    url: "/admin",
  },
];

export default function AboutPage() {
  return (
    <div className="section-container py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-npl-red-500 flex items-center justify-center">
            <span className="text-white font-black text-base">NPL</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">About NPL Hub</h1>
            <p className="text-sm text-muted-foreground">The community fan hub for Nepal Premier League</p>
          </div>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          NPL Hub is an unofficial, community-built fan platform dedicated to the
          Nepal Premier League — Nepal's premier T20 franchise cricket tournament
          organised by the Cricket Association of Nepal (CAN).
        </p>
        <p className="text-muted-foreground leading-relaxed mt-3">
          This site is not affiliated with CAN or the Nepal Premier League.
          All statistics, records, and historical data are compiled from public
          sources and verified manually.
        </p>
      </div>

      {/* Data sources */}
      <section id="data" className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-2">Data Sources</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Where our data comes from and how we keep it accurate.
        </p>
        <div className="space-y-4">
          {DATA_SOURCES.map(({ icon: Icon, name, description, url }) => (
            <div key={name} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="w-10 h-10 rounded-lg bg-npl-blue-50 dark:bg-npl-blue-950/30 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-npl-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground text-sm">{name}</h3>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-npl-red-500 hover:text-npl-red-600">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sanity CMS setup */}
      <section id="cms" className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-2">Setting up Sanity CMS</h2>
        <p className="text-sm text-muted-foreground mb-5">
          The news section is powered by Sanity CMS. Follow these steps to publish real articles.
        </p>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {[
            { step: "1", text: "Sign up at sanity.io and create a new project" },
            { step: "2", text: "Install the Sanity CLI: npm install -g @sanity/cli" },
            { step: "3", text: "Run: sanity init — select your project and dataset" },
            { step: "4", text: "Create an 'article' schema with fields: title, slug, category, excerpt, mainImage, body, publishedAt, readTime, author" },
            { step: "5", text: "Copy your Project ID and Dataset from sanity.io/manage" },
            { step: "6", text: "Add to .env.local: NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET" },
            { step: "7", text: "Run: npm install @portabletext/react — then use <PortableText> in news/[slug]/page.tsx" },
            { step: "8", text: "Deploy your Sanity Studio: sanity deploy" },
          ].map(({ step, text }) => (
            <div key={step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-npl-red-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {step}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech stack */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Code2 className="w-5 h-5 text-npl-blue-500" /> Tech Stack
        </h2>
        <p className="text-sm text-muted-foreground mb-5">
          Built entirely with free tools. Open source and community-driven.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {STACK.map(({ name, role, url }) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer"
              className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-4 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150">
              <span className="font-semibold text-sm text-foreground group-hover:text-npl-red-500 transition-colors">
                {name}
              </span>
              <span className="text-xs text-muted-foreground">{role}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
          Privacy Policy
        </Link>
        <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
          Contact
        </Link>
        <a href="https://can.org.np" target="_blank" rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
          CAN Official Site <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
