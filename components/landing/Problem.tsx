"use client";

import React from "react";
import { m } from "framer-motion";

const TIMELINE = [
  { time: "08:00", text: "Manual runway calc in Excel. 45 minutes gone before coffee." },
  { time: "09:00", text: "Writing 15 investor emails one by one. 3 hours of the morning gone." },
  { time: "12:00", text: "Googling competitors. 1 hour of scattered tabs and no clear answer." },
  { time: "14:00", text: "Reading 80 CVs manually to find one decent React developer." },
  { time: "18:00", text: "Finally opens laptop to work on the actual product." },
];

export const Problem = () => {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-24 sm:py-32" aria-labelledby="problem-heading">
      {/* Section Header */}
      <div className="mb-16">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {`// section — the problem`}
        </m.div>
        <m.h2
          id="problem-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(36px,5vw,64px)] text-[var(--text-base)] leading-[1.1] tracking-tight mb-4"
        >
          {`AHMED'S MONDAY IS`} <br className="hidden sm:block" />
          KILLING HIS STARTUP.
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="font-sans text-[18px] text-[rgba(var(--text-base-rgb),0.55)] max-w-xl"
        >
          Sound familiar? This is how most founders spend their day.
        </m.p>
      </div>

      {/* Timeline */}
      <div className="pl-[2px] border-l-2 border-[rgba(var(--accent-pink-rgb),0.3)] flex flex-col gap-10 sm:gap-12 relative overflow-hidden py-4">
        {TIMELINE.map((item, i) => (
          <m.div
            key={item.time}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
            className="flex items-start sm:items-center gap-4 sm:gap-6 relative pl-6"
          >
            {/* Timeline Dot/Connector */}
            <div className="absolute top-[10px] sm:top-1/2 -left-[2px] w-[24px] h-[1px] bg-[rgba(var(--text-base-rgb),0.08)] -translate-y-1/2" />
            
            <div className="font-heading text-[13px] tracking-wider text-[var(--accent-pink)] min-w-[56px] pt-1 sm:pt-0">
              {item.time}
            </div>
            <div className="font-sans text-[16px] text-[rgba(var(--text-base-rgb),0.75)] leading-relaxed">
              {item.text}
            </div>
          </m.div>
        ))}
      </div>

      {/* Closing Banner */}
      <m.div
        initial={{ opacity: 0, scale: 0.98, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-20 w-full rounded-xl bg-[rgba(var(--accent-pink-rgb),0.06)] border border-[rgba(var(--accent-pink-rgb),0.2)] p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center sm:justify-between gap-6"
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 font-heading font-semibold tracking-wide text-[16px] sm:text-[18px]">
          <div>
            <span className="font-extrabold text-[var(--accent-pink)] mr-2">8 HOURS</span>
            <span className="text-[var(--text-base)] opacity-90">of operations.</span>
          </div>
          <div className="hidden sm:block w-[1px] h-6 bg-[rgba(var(--accent-pink-rgb),0.3)] self-center" />
          <div>
            <span className="font-extrabold text-[var(--accent-pink)] mr-2">2 HOURS</span>
            <span className="text-[var(--text-base)] opacity-90">of building.</span>
          </div>
        </div>
        <div className="font-sans text-[15px] text-[rgba(var(--text-base-rgb),0.6)]">
          This is why startups fail.
        </div>
      </m.div>
    </section>
  );
};

export default Problem;
