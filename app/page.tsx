import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuroraBackground } from "@/components/shared/AuroraBackground";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Agents } from "@/components/landing/Agents";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { MotionProvider } from "@/components/shared/MotionProvider";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between w-full overflow-hidden">
      <Navbar />

      {/* Hero section inside its own Aurora Background */}
      <AuroraBackground intensity="medium" className="min-h-screen border-b border-[rgba(var(--text-base-rgb),0.04)]">
        <Hero />
      </AuroraBackground>

      {/* Main Content Sections */}
      <MotionProvider>
        <div className="w-full relative z-10 bg-[var(--bg-deep)]">
          <Problem />
          <Agents />
          <HowItWorks />
          <Testimonials />
          <Pricing />
          <FAQ />
        </div>
      </MotionProvider>

      {/* CTA section has its own high-intensity Aurora Background inside it */}
      <CTA />

      <Footer />
    </main>
  );
}

