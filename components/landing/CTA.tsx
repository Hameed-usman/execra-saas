"use client";

import React from "react";
import { m } from "framer-motion";
import Link from "next/link";
import { AuroraBackground } from "@/components/shared/AuroraBackground";

export const CTA = () => {
  return (
    <section className="relative w-full z-10 border-t border-[rgba(var(--text-base-rgb),0.06)] overflow-hidden" aria-labelledby="cta-heading">
      <AuroraBackground intensity="high" className="min-h-[400px] flex items-center justify-center py-24 sm:py-32">
        {/* Secondary Orb specific to CTA */}
        <m.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, var(--accent-teal) 0%, transparent 60%)" }}
        />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-6">
          <m.h2
            id="cta-heading"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-heading font-extrabold text-[clamp(40px,6vw,80px)] leading-[1] tracking-tight mb-8 flex flex-col items-center justify-center"
          >
            <span className="text-[var(--text-base)] mb-2">STOP RUNNING YOUR STARTUP.</span>
            <span
              className="text-transparent bg-clip-text animate-gradient-x bg-[length:200%_auto]"
              style={{
                backgroundImage: "linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-teal) 50%, var(--accent-pink) 100%)",
              }}
            >
              LET IT RUN ITSELF.
            </span>
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.1 }}
            className="font-sans text-[18px] sm:text-[20px] text-[rgba(var(--text-base-rgb),0.7)] max-w-2xl mb-12 leading-relaxed"
          >
            Join 200+ founders already using STRATARA to reclaim their time.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-[var(--accent-violet)] px-[32px] py-[16px] font-heading font-semibold text-[18px] text-[var(--text-base)] transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(var(--accent-violet-rgb),0.4)]"
            >
              Start free — no card needed
            </Link>
          </m.div>
        </div>
      </AuroraBackground>
    </section>
  );
};

export default CTA;
