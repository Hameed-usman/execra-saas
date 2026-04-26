"use client";

import React from "react";
import { m } from "framer-motion";

const STEPS = [
  {
    num: "1",
    title: "Connect your tools",
    text: "Link Gmail and Stripe in one click. Agents work inside your real accounts — no data leaves your control.",
  },
  {
    num: "2",
    title: "Type your goal in plain English",
    text: "No forms. No configuration. Just tell STRATARA what you need done. The Planner Agent handles the rest.",
  },
  {
    num: "3",
    title: "Review, approve, done",
    text: "Every output lands in your approval queue. You click approve. Emails send. Reports deliver. You stay in control.",
  },
];

export const HowItWorks = () => {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-24 sm:py-32" aria-labelledby="how-it-works-heading">
      {/* Section Header */}
      <div className="mb-20 text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {`// section — how it works`}
        </m.div>
        <m.h2
          id="how-it-works-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] text-[var(--text-base)] leading-[1.1] tracking-tight mb-4"
        >
          THREE STEPS. THAT&apos;S IT.
        </m.h2>
      </div>

      <div className="relative flex flex-col md:flex-row items-start justify-between gap-16 md:gap-8 lg:gap-16">
        {/* Desktop Connected Line */}
        <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-[1px] -translate-y-1/2 z-0">
          <div className="w-full h-full border-t border-dashed border-[rgba(var(--accent-violet-rgb),0.3)]" />
          {/* Traveling Dot Animation */}
          <m.div
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 w-2 h-2 rounded-full bg-[var(--accent-teal)] -translate-y-1/2 -ml-1 shadow-[0_0_10px_var(--accent-teal)]"
          />
        </div>

        {STEPS.map((step, index) => (
          <m.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="relative flex-1 z-10 w-full md:w-auto"
          >
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              {/* Background Decorative Number */}
              <div className="absolute -top-6 md:-left-4 lg:-left-6 font-heading font-extrabold text-[80px] leading-none text-[var(--accent-violet)] opacity-[0.06] select-none pointer-events-none">
                {step.num}
              </div>
              
              {/* Number Badge (Mobile helper & visual anchor) */}
              <div className="w-10 h-10 rounded-full bg-[rgba(var(--bg-surface-rgb),0.8)] border border-[rgba(var(--accent-violet-rgb),0.3)] flex items-center justify-center font-heading font-bold text-[18px] text-[var(--text-base)] mb-6 shadow-[0_0_15px_rgba(var(--accent-violet-rgb),0.2)] md:mx-0 mx-auto">
                {step.num}
              </div>
              
              <h3 className="font-heading font-bold text-[20px] text-[var(--text-base)] mb-4">
                {step.title}
              </h3>
              <p className="font-sans text-[15px] text-[rgba(var(--text-base-rgb),0.6)] leading-relaxed md:max-w-xs mx-auto md:mx-0">
                {step.text}
              </p>
            </div>
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
