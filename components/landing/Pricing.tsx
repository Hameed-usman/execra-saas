"use client";

import React from "react";
import { motion } from "framer-motion";
import { PRICING_TIERS } from "@/lib/pricing";
import { PricingCard } from "@/components/shared/PricingCard";

export const Pricing = () => {
  return (
    <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24 sm:py-32" aria-labelledby="pricing-heading">
      {/* Section Header */}
      <div className="mb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {"// section — pricing"}
        </motion.div>
        <motion.h2
          id="pricing-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(28px,4vw,48px)] text-white leading-[1.1] tracking-tight"
        >
          SIMPLE, HONEST PRICING.
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
        {PRICING_TIERS.map((tier, index) => (
          <PricingCard 
            key={tier.name} 
            tier={tier} 
            index={index} 
            onAction={() => {
              if (tier.name === "Scale") {
                window.location.href = "mailto:hello@execra.ai";
              } else {
                window.location.href = "/signup";
              }
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Pricing;
