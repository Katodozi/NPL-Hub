import type { Metadata } from "next";
import { Hero }            from "@/components/home/Hero";
import { CountdownBanner } from "@/components/home/CountdownBanner";
import { StatsOverview }   from "@/components/home/StatsOverview";
import { FeaturedTeams }   from "@/components/home/FeaturedTeams";
import { CapLeaders }      from "@/components/home/CapLeaders";
import { RecordsSpotlight} from "@/components/home/RecordsSpotlight";
import { SeasonHistory }   from "@/components/home/SeasonHistory";
import { NewsPreview }     from "@/components/home/NewsPreview";

export const metadata: Metadata = {
  title: "NPL Hub — Nepal Premier League Fan Hub",
};

// Revalidate homepage every 6 hours (ISR)
export const revalidate = 21600;

export default function HomePage() {
  return (
    <>
      <Hero />
      <CountdownBanner />
      <StatsOverview />
      <FeaturedTeams />
      <CapLeaders />
      <RecordsSpotlight />
      <SeasonHistory />
      <NewsPreview />
    </>
  );
}
