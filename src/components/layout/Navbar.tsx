"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, NPL_META } from "@/config/constants";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-background/95 backdrop-blur-sm border-b border-border shadow-sm"
          : "bg-background border-b border-border"
      )}
    >
      <div className="section-container">
        <div className="flex h-14 items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-npl-red-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">NPL</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-sm text-foreground tracking-tight">NPL Hub</span>
              <span className="text-[10px] text-muted-foreground hidden sm:block">
                {NPL_META.name}
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors font-medium",
                  pathname === item.href
                    ? "bg-npl-red-50 text-npl-red-600 dark:bg-npl-red-900/20 dark:text-npl-red-400"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* NPL 2026 CTA */}
            <Link
              href="/history/2026"
              className="hidden sm:flex items-center gap-1.5 bg-npl-red-500 hover:bg-npl-red-600 text-white text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              NPL 2026
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="section-container py-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-npl-red-50 text-npl-red-600 dark:bg-npl-red-900/20"
                    : "text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/history/2026"
              className="mt-2 flex items-center justify-center gap-1.5 bg-npl-red-500 text-white text-sm font-medium px-3 py-2.5 rounded-md"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
              NPL 2026 — Coming Soon
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
