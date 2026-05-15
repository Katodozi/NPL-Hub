import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { NPL_META } from "@/config/constants";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ),
  title: {
    template: `%s | NPL Hub`,
    default: "NPL Hub — Nepal Premier League Fan Hub",
  },
  description:
    "The definitive fan hub for the Nepal Premier League. Player stats, franchise history, records, and live dashboards — all NPL, all the time.",
  keywords: [
    "Nepal Premier League",
    "NPL",
    "NPL cricket",
    "Nepal cricket",
    "NPL stats",
    "NPL players",
    "NPL teams",
    "CAN",
  ],
  authors: [{ name: "NPL Hub" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nplhub.com",
    siteName: "NPL Hub",
    title: "NPL Hub — Nepal Premier League Fan Hub",
    description:
      "The definitive fan hub for the Nepal Premier League. Player stats, franchise history, records, and live dashboards.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NPL Hub",
    description: "The definitive fan hub for the Nepal Premier League.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(GeistSans.variable, GeistMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen flex flex-col bg-background font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
