import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="section-container py-12 max-w-2xl">
      <Link href="/about"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" /> About
      </Link>

      <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: January 2026</p>

      <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="text-base font-bold text-foreground mb-2">1. About this site</h2>
          <p>
            NPL Hub is an unofficial, community-run fan platform for the Nepal Premier League.
            We are not affiliated with the Cricket Association of Nepal (CAN) or the NPL.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">2. Data we collect</h2>
          <p>
            NPL Hub does not collect personal data from visitors. We do not use
            tracking cookies, advertising networks, or analytics beyond anonymous
            page-view counts via Vercel Analytics.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">3. Admin accounts</h2>
          <p>
            Admin users authenticate via Supabase. Email addresses of admin
            accounts are stored securely in Supabase and are never shared with
            third parties.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">4. Player data</h2>
          <p>
            Player statistics and biographical information are sourced from public
            records (ESPNcricinfo, Wikipedia, CAN official communications).
            If you are a player and wish to have information corrected or removed,
            please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">5. Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Cloudinary — player image hosting</li>
            <li>Supabase — database and authentication</li>
            <li>Vercel — hosting and edge delivery</li>
            <li>CricketData.org — live match data API</li>
          </ul>
          <p className="mt-2">Each service has its own privacy policy.</p>
        </section>

        <section>
          <h2 className="text-base font-bold text-foreground mb-2">6. Contact</h2>
          <p>
            For privacy-related requests, reach out via our{" "}
            <Link href="/contact" className="text-npl-red-500 hover:underline">
              contact page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}