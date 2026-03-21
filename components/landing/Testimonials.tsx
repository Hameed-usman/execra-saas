"use client";

import React from "react";
import { m } from "framer-motion";

const QUOTES = [
  {
    text: "STRATARA sent 12 investor emails while I was in a product meeting. Two replied within the hour. I have never felt this kind of leverage before.",
    initials: "AK",
    name: "Ahmed K.",
    role: "Founder, FeedFlow",
    location: "Lahore",
  },
  {
    text: "The CFO report it generated was more professional than what my accountant sends. Two investors asked if I hired a new finance team.",
    initials: "SR",
    name: "Sara R.",
    role: "CEO, PayKit",
    location: "Karachi",
  },
];

export const Testimonials = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24 sm:py-32" aria-labelledby="testimonials-heading">
      {/* Section Header */}
      <div className="mb-20 text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {"// section — founder testimonials"}
        </m.div>
        <m.h2
          id="testimonials-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] text-[var(--text-base)] leading-[1.1] tracking-tight mb-4"
        >
          FOUNDERS TRUST IT.
        </m.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {QUOTES.map((quote, index) => (
          <m.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
            className="group relative flex flex-col justify-between rounded-2xl bg-[rgba(var(--bg-surface-rgb),0.8)] border border-[rgba(var(--text-base-rgb),0.08)] p-8 sm:p-10 transition-all duration-300 hover:border-[rgba(var(--accent-violet-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--accent-violet-rgb),0.1)] hover:-translate-y-1"
          >
            {/* Absolute decorative quote */}
            <div className="absolute top-6 left-6 font-heading text-[80px] leading-[0.5] text-[var(--accent-violet)] opacity-30 select-none pointer-events-none">
              &ldquo;
            </div>

            <p className="font-sans text-[17px] leading-[1.7] text-[rgba(var(--text-base-rgb),0.85)] italic relative z-10 pt-8 mb-10">
              &quot;{quote.text}&quot;
            </p>

            <div className="flex items-center gap-4 border-t border-[rgba(var(--text-base-rgb),0.05)] pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent-violet)] to-[var(--accent-teal)] shadow-inner">
                <span className="font-heading font-bold text-[14px] text-white">
                  {quote.initials}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[15px] font-semibold text-[var(--text-base)]">
                  {quote.name}
                </span>
                <span className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.5)]">
                  {quote.role} &middot; {quote.location}
                </span>
              </div>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
