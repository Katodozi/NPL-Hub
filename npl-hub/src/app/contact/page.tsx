import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Mail, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="section-container py-12 max-w-xl">
      <Link href="/about"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" /> About
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Contact</h1>
      <p className="text-muted-foreground mb-10">
        Have a correction, suggestion, or want to contribute to NPL Hub?
        We'd love to hear from you.
      </p>

      <div className="space-y-4">
        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
          <div className="w-10 h-10 rounded-lg bg-npl-red-50 dark:bg-npl-red-950/30 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-npl-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Data corrections
            </h3>
            <p className="text-sm text-muted-foreground">
              Found a wrong stat or player detail? Open an issue on GitHub or
              email us and we'll fix it within 48 hours.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
          <div className="w-10 h-10 rounded-lg bg-npl-blue-50 dark:bg-npl-blue-950/30 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5 text-npl-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm mb-1">
              Official NPL / CAN
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              For official Nepal Premier League enquiries, contact CAN directly.
            </p>
            <a href="https://can.org.np" target="_blank" rel="noopener noreferrer"
              className="text-xs text-npl-red-500 hover:underline font-medium">
              can.org.np →
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          NPL Hub is a community project. All contributions — data, code,
          corrections — are welcome.
        </p>
      </div>
    </div>
  );
}