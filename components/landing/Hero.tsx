"use client";

import React, { useEffect, useState, useRef } from "react";
import { m, useInView } from "framer-motion";
import Link from "next/link";
import { Play } from "lucide-react";

const Counter = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * value));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const STATS = [
  { value: 200, label: "Founders", suffix: "+" },
  { value: 4800, label: "Emails sent", suffix: "+" },
  { value: 2.1, label: "Raised", prefix: "$", suffix: "M", isFloat: true },
  { value: 4, label: "Avg task time", suffix: " min" },
];

export const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 w-full max-w-7xl mx-auto"
      aria-label="Hero Section"
    >
      <div className="flex flex-col items-center text-center z-10 max-w-4xl mx-auto w-full">
        {/* Version Badge */}
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="flex items-center gap-2 rounded-full border border-[rgba(var(--accent-violet-rgb),0.4)] bg-[rgba(var(--accent-violet-rgb),0.1)] px-4 py-1.5 mb-8 backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-teal)] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-teal)]"></span>
          </span>
          <span className="font-sans text-[13px] text-[var(--text-base)] opacity-80">
            v1.0 — BD + CFO Agents live now
          </span>
        </m.div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-[clamp(52px,8vw,96px)] leading-[0.95] tracking-[-0.04em] mb-6 flex flex-col items-center justify-center">
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-[var(--text-base)]"
          >
            YOUR STARTUP
          </m.span>
          <m.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: "easeOut" }}
            className="text-transparent bg-clip-text animate-gradient-x bg-[length:200%_auto]"
            style={{
              backgroundImage: "linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-teal) 50%, var(--accent-pink) 100%)",
            }}
          >
            RUNS ITSELF.
          </m.span>
        </h1>

        {/* Subheadline */}
        <m.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="font-sans text-[18px] text-[rgba(var(--text-base-rgb),0.65)] max-w-[520px] mb-10 leading-relaxed"
        >
          Six AI agents handle investor outreach, financial reports, hiring, and market intelligence — all through your own Gmail and Stripe.
        </m.p>

        {/* CTAs */}
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16"
        >
          <Link
            href="#signup"
            className="rounded-full bg-[var(--accent-violet)] px-[28px] py-[14px] font-heading font-semibold text-[var(--text-base)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--accent-violet-rgb),0.4)]"
          >
            Start free — no card needed
          </Link>
          <Link
            href="#demo"
            className="flex items-center gap-2 rounded-full border border-[rgba(var(--text-base-rgb),0.2)] px-[28px] py-[14px] font-heading font-semibold text-[var(--text-base)] transition-colors hover:border-[var(--accent-violet)] hover:bg-[rgba(var(--accent-violet-rgb),0.05)]"
          >
            <Play size={16} className="fill-current" />
            Watch 2-min demo
          </Link>
        </m.div>

        {/* Stats Row */}
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 max-w-3xl">
          {STATS.map((stat, i) => (
            <m.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-10"
            >
              <div className="flex flex-col items-center">
                <div className="font-heading font-bold text-[28px] text-[var(--text-base)] tracking-tight font-mono tabular-nums">
                  {stat.prefix}
                  {stat.isFloat ? (
                    <span ref={(node) => {
                       if(node && node.textContent === "") {
                         node.textContent = stat.value.toString();
                         node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1500 });
                       }
                    }}>{stat.value}</span>
                  ) : (
                    <Counter value={stat.value} duration={1.5} />
                  )}
                  {stat.suffix}
                </div>
                <div className="font-sans text-[12px] uppercase tracking-widest text-[rgba(var(--text-base-rgb),0.5)] mt-1">
                  {stat.label}
                </div>
              </div>
              {i < STATS.length - 1 && (
                <div className="hidden md:block w-px h-10 bg-[rgba(var(--text-base-rgb),0.15)]" />
              )}
            </m.div>
          ))}
        </div>
      </div>

      {/* Below the fold soft glow ellipse */}
      <div 
        className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-[100%] pointer-events-none"
        style={{
          background: "rgba(var(--accent-violet-rgb),0.15)",
          filter: "blur(100px)",
        }}
      />
    </section>
  );
};

export default Hero;
