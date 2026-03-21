import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "STRATARA — Autonomous AI Agents for Startup Founders",
  description: "Six AI agents handle investor outreach, financial reports, hiring, and market intelligence — all through your own Gmail and Stripe. Start free.",
  keywords: ["AI agents", "startup automation", "investor outreach", "CFO agent", "BD agent", "SaaS", "founder tools"],
  authors: [{ name: "STRATARA Inc." }],
  openGraph: {
    title: "STRATARA — Your Startup Runs Itself",
    description: "Six AI agents. One platform. Zero manual work.",
    type: "website",
    locale: "en_US",
    url: "https://stratara.io",
    siteName: "STRATARA",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "STRATARA Platform" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "STRATARA — Your Startup Runs Itself",
    description: "Six AI agents handle everything. You stay in control.",
    images: ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "var(--bg-deep)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://stratara.io" />
      </head>
      <body
        className={`${syne.variable} ${dmSans.variable} font-sans antialiased text-white bg-[var(--bg-deep)] overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
