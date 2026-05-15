import Link from "next/link";
import { NPL_META } from "@/config/constants";

const FOOTER_LINKS = {
  "Explore": [
    { label: "Season History", href: "/history" },
    { label: "All Teams", href: "/teams" },
    { label: "Players", href: "/players" },
    { label: "Records", href: "/records" },
  ],
  "Information": [
    { label: "Sponsors", href: "/sponsors" },
    { label: "News & Updates", href: "/news" },
    { label: "NPL 2026", href: "/history/2026" },
    { label: "About CAN", href: "https://can.org.np", target: "_blank" },
  ],
  "NPL Hub": [
    { label: "About This Site", href: "/about" },
    { label: "Data Sources", href: "/about#data" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Contact", href: "/contact" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-npl-surface mt-16">
      <div className="section-container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-npl-red-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">NPL</span>
              </div>
              <span className="font-bold text-sm">NPL Hub</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The community fan hub for the {NPL_META.name}. Unofficial — built by fans, for fans.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Powered by{" "}
              <span className="text-npl-red-500 font-medium">
                {NPL_META.title_sponsor}
              </span>{" "}
              title sponsorship data.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {heading}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      target={(link as { target?: string }).target}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} NPL Hub. Not affiliated with CAN or the Nepal Premier League.
          </p>
          <p className="text-xs text-muted-foreground">
            Data sourced from CricketData.org, ESPNcricinfo &amp; Wikipedia.
          </p>
        </div>
      </div>
    </footer>
  );
}
