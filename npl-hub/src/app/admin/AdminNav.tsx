"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, Building2, Calendar, Trophy,
  LogOut, LayoutDashboard, BarChart2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/players", label: "Players",   icon: Users            },
  { href: "/admin/teams",   label: "Teams",     icon: Building2        },
  { href: "/admin/matches", label: "Matches",   icon: Calendar         },
  { href: "/admin/stats",   label: "Stats",     icon: BarChart2        },
  { href: "/admin/awards",  label: "Awards",    icon: Trophy           },
];

export function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router   = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/admin-login");
  }

  return (
    <header className="sticky top-0 z-50 bg-npl-blue-500 text-white shadow-md">
      <div className="section-container">
        <div className="flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center">
              <span className="text-white font-black text-xs">NPL</span>
            </div>
            <span className="font-bold text-sm hidden sm:block">Admin Panel</span>
          </div>
          <nav className="flex items-center gap-0.5 overflow-x-auto">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                  pathname === href
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs text-white/60 hidden lg:block truncate max-w-[160px]">{userEmail}</span>
            <button onClick={signOut}
              className="flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
