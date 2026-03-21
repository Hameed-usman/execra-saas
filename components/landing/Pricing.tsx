"use client";

import React from "react";
import { m } from "framer-motion";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    interval: "/forever",
    description: "Perfect for exploring the platform.",
    features: ["1 AI Agent (Planner)", "5 Manual tool actions", "Community support"],
    buttonText: "Get started free",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$49",
    interval: "/month",
    description: "The complete suite for operating your startup.",
    features: [
      "All 6 AI Agents",
      "Unlimited Gmail & Stripe actions",
      "Approval queue access",
      "Priority API support",
    ],
    buttonText: "Start Pro",
    highlighted: true,
  },
  {
    name: "Scale",
    price: "$199",
    interval: "/month",
    description: "For teams needing high-volume usage.",
    features: [
      "Everything in Pro",
      "Custom agent instructions",
      "Dedicated account manager",
      "SLA 99.9% uptime",
    ],
    buttonText: "Contact sales",
    highlighted: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24 sm:py-32" aria-labelledby="pricing-heading">
      {/* Section Header */}
      <div className="mb-20 text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {"// section — pricing"}
        </m.div>
        <m.h2
          id="pricing-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] text-[var(--text-base)] leading-[1.1] tracking-tight"
        >
          SIMPLE, HONEST PRICING.
        </m.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center max-w-5xl mx-auto">
        {TIERS.map((tier, index) => (
          <m.div
            key={tier.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className={`relative flex flex-col justify-between rounded-2xl p-8 sm:p-10 transition-all duration-300 ${
              tier.highlighted
                ? "md:scale-105 z-10 border border-[rgba(var(--accent-violet-rgb),0.5)] bg-gradient-to-br from-[rgba(var(--accent-violet-rgb),0.15)] to-[rgba(var(--accent-teal-rgb),0.08)] shadow-[0_20px_40px_rgba(var(--accent-violet-rgb),0.15)]"
                : "bg-[var(--bg-surface)] border border-[rgba(var(--text-base-rgb),0.08)] hover:border-[rgba(var(--text-base-rgb),0.15)]"
            }`}
          >
            {tier.highlighted && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <span className="flex items-center rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-teal)] px-4 py-1.5 font-sans text-[12px] font-bold uppercase tracking-widest text-[var(--text-base)] shadow-lg">
                  Most popular
                </span>
              </div>
            )}

            <div>
              <h3 className="font-heading font-bold text-[22px] text-[var(--text-base)] mb-2">
                {tier.name}
              </h3>
              <p className="font-sans text-[15px] text-[rgba(var(--text-base-rgb),0.6)] mb-6 h-10">
                {tier.description}
              </p>
              <div className="mb-8 flex items-baseline gap-1">
                <span className="font-heading font-extrabold text-[48px] text-[var(--text-base)] tracking-tight">
                  {tier.price}
                </span>
                <span className="font-sans text-[18px] text-[rgba(var(--text-base-rgb),0.5)]">
                  {tier.interval}
                </span>
              </div>
              
              <ul className="flex flex-col gap-4 mb-10">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 min-w-[18px] text-[var(--accent-teal)]" size={18} strokeWidth={2.5} />
                    <span className="font-sans text-[15px] text-[rgba(var(--text-base-rgb),0.85)] leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full rounded-full py-[14px] font-heading font-semibold text-[var(--text-base)] transition-all hover:scale-[1.02] ${
                tier.highlighted
                  ? "bg-[var(--accent-violet)] hover:shadow-[0_0_20px_rgba(var(--accent-violet-rgb),0.4)]"
                  : "bg-[rgba(var(--text-base-rgb),0.05)] hover:bg-[rgba(var(--text-base-rgb),0.1)] border border-[rgba(var(--text-base-rgb),0.1)]"
              }`}
            >
              {tier.buttonText}
            </button>
          </m.div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
