import Link from "next/link";
import { Home, Search, Trophy, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="section-container py-24 flex flex-col items-center text-center">
      {/* Big 404 */}
      <div className="relative mb-8">
        <span className="text-[120px] sm:text-[160px] font-black text-muted/20 leading-none select-none">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl sm:text-6xl">🏏</span>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
        Stumped — page not found
      </h1>
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        The page you&apos;re looking for has been run out, caught behind, or never
        existed. Let&apos;s get you back to the crease.
      </p>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 w-full max-w-lg">
        {[
          { href: "/",        icon: Home,   label: "Home"    },
          { href: "/players", icon: Users,  label: "Players" },
          { href: "/teams",   icon: Trophy, label: "Teams"   },
          { href: "/records", icon: Search, label: "Records" },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 text-sm font-medium text-muted-foreground hover:text-foreground hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
          >
            <Icon className="w-5 h-5 text-npl-red-500" />
            {label}
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-npl-red-500 hover:bg-npl-red-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
      >
        <Home className="w-4 h-4" />
        Back to homepage
      </Link>
    </div>
  );
}
