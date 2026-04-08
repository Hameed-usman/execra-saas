"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Check } from "lucide-react";
import { PricingTier } from "@/lib/pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PricingCardProps extends HTMLMotionProps<"div"> {
  tier: PricingTier;
  index: number;
  onAction?: () => void;
  actionButton?: React.ReactNode;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  tier, 
  index, 
  onAction, 
  actionButton,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      {...props}
      className={`relative flex flex-col justify-between rounded-2xl p-8 sm:p-10 transition-all duration-300 h-full ${
        tier.highlighted
          ? "md:scale-105 z-10 border border-[rgba(97,75,255,0.5)] bg-gradient-to-br from-[rgba(97,75,255,0.15)] to-[rgba(0,221,235,0.08)] shadow-[0_20px_40px_rgba(97,75,255,0.15)]"
          : "bg-[var(--bg-surface)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]"
      }`}
    >
      {tier.highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="flex items-center rounded-full bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-teal)] px-4 py-1.5 font-sans text-[12px] font-bold uppercase tracking-widest text-white shadow-lg whitespace-nowrap">
            Most popular
          </span>
        </div>
      )}

      {tier.comingSoon && !tier.highlighted && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none">
            Coming Soon
          </Badge>
        </div>
      )}

      <div>
        <h3 className="font-heading font-bold text-[22px] text-white mb-2">
          {tier.name}
        </h3>
        <p className="font-sans text-[15px] text-slate-400 mb-6 min-h-[40px]">
          {tier.description}
        </p>
        <div className="mb-8 flex items-baseline gap-1">
          <span className="font-heading font-extrabold text-[48px] text-white tracking-tight">
            {tier.price}
          </span>
          <span className="font-sans text-[18px] text-slate-500">
            {tier.interval}
          </span>
        </div>
        
        <ul className="flex flex-col gap-4 mb-10">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className="mt-0.5 min-w-[18px] text-[var(--accent-teal)]" size={18} strokeWidth={2.5} />
              <span className="font-sans text-[15px] text-slate-300 leading-snug">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {actionButton ? (
        actionButton
      ) : (
        <button
          onClick={onAction}
          className={`w-full rounded-full py-[14px] font-heading font-semibold text-white transition-all hover:scale-[1.02] ${
            tier.highlighted
              ? "bg-[var(--accent-violet)] hover:shadow-[0_0_20px_rgba(97,75,255,0.4)]"
              : "bg-white/5 hover:bg-white/10 border border-white/10"
          }`}
        >
          {tier.buttonText}
        </button>
      )}
    </motion.div>
  );
};
