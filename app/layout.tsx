import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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
  title: "EXECRA — AI-Powered Platform for Startup Founders",
  description: "Your AI co-founder. EXECRA gives startup founders AI agents that handle strategy, growth, recruiting, and more — all connected to your existing tools.",
  keywords: ["AI platform", "startup automation", "AI co-founder", "founder tools", "SaaS"],
  authors: [{ name: "EXECRA" }],
  openGraph: {
    title: "EXECRA — Your AI Co-Founder Awaits",
    description: "AI-powered strategy, growth, and automation for startup founders.",
    type: "website",
    locale: "en_US",
    url: "https://execra.ai",
    siteName: "EXECRA",
  },
  twitter: {
    card: "summary_large_image",
    title: "EXECRA — Your AI Co-Founder",
    description: "AI agents that think, plan, and act alongside you.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "var(--bg-deep)",
};

import { Toaster } from "@/components/ui/sonner";

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
        <Providers>
          {children}
        </Providers>
        <Toaster theme="dark" />
      </body>
    </html>
  );
}
