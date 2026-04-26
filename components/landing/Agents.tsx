"use client";

import React from "react";
import { m } from "framer-motion";
import { TrendingUp, DollarSign, Radar, Users, Cpu, ShieldCheck } from "lucide-react";



const AGENTS = [
  {
    name: "BD Agent",
    description: "Identifies right-fit investors, drafts hyper-personalized outbound, and manages your CRM.",
    icon: TrendingUp,
    status: "live",
    statusLabel: "live now",
  },
  {
    name: "CFO Agent",
    description: "Syncs with Stripe. Builds real-time runway models, cohort analysis, and investor updates.",
    icon: DollarSign,
    status: "live",
    statusLabel: "live now",
  },
  {
    name: "Scout Agent",
    description: "Monitors competitors, scrapes feature changes, and alerts you to market movements.",
    icon: Radar,
    status: "always",
    statusLabel: "always on",
  },
  {
    name: "HR Agent",
    description: "Filters inbound CVs, conducts structured initial AI phone screens, and schedules interviews.",
    icon: Users,
    status: "month3",
    statusLabel: "month 3",
  },
  {
    name: "Planner Agent",
    description: "The orchestrator. Tell it what you need in plain English, and it dispatches the right agents.",
    icon: Cpu,
    status: "always",
    statusLabel: "always on",
  },
  {
    name: "Critic Agent",
    description: "Reviews your product copy and landing pages against top-converting SaaS benchmarks.",
    icon: ShieldCheck,
    status: "month6",
    statusLabel: "month 6",
  },
];

const StatusBadge = ({ status, label }: { status: string; label: string }) => {
  if (status === "live") {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[rgba(var(--accent-teal-rgb),0.3)] bg-[rgba(var(--accent-teal-rgb),0.1)] px-3 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-teal)] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--accent-teal)]"></span>
        </span>
        <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-[var(--accent-teal)]">{label}</span>
      </div>
    );
  } else if (status === "always") {
    return (
      <div className="flex items-center rounded-full border border-[rgba(var(--text-base-rgb),0.05)] bg-[rgba(var(--text-base-rgb),0.05)] px-3 py-1">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[rgba(var(--text-base-rgb),0.5)]">{label}</span>
      </div>
    );
  } else {
    // month3 / month6
    return (
      <div className="flex items-center rounded-full border border-[rgba(var(--accent-violet-rgb),0.2)] bg-[rgba(var(--accent-violet-rgb),0.1)] px-3 py-1">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-[rgba(var(--text-base-rgb),0.6)]">{label}</span>
      </div>
    );
  }
};

export const Agents = () => {
  return (
    <section id="agents" className="w-full max-w-[1080px] mx-auto px-6 py-24 sm:py-32" aria-labelledby="agents-heading">
      {/* Section Header */}
      <div className="mb-16 text-center">
        <m.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-mono text-[13px] text-[var(--accent-violet)] mb-4 tracking-wider"
        >
          {`// section — the six agents`}
        </m.div>
        <m.h2
          id="agents-heading"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1 }}
          className="font-heading font-extrabold text-[clamp(32px,5vw,56px)] text-[var(--text-base)] leading-[1.1] tracking-tight mb-4"
        >
          MEET YOUR AI TEAM.
        </m.h2>
        <m.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.2 }}
          className="font-sans text-[18px] text-[rgba(var(--text-base-rgb),0.6)] max-w-xl mx-auto"
        >
          Six specialists. One platform. Zero manual work.
        </m.p>
      </div>

      {/* Grid wrapper for 1px border gap trick */}
      <div className="bg-[rgba(var(--text-base-rgb),0.06)] rounded-2xl overflow-hidden border border-[rgba(var(--text-base-rgb),0.08)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px]">
          {AGENTS.map((agent, i) => (
            <m.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative flex flex-col justify-between bg-[var(--bg-surface)] p-8 h-full min-h-[280px] transition-all duration-300 hover:bg-[rgba(var(--accent-violet-rgb),0.03)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Hover Top Border Gradient */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[var(--accent-violet)] to-[var(--accent-teal)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Card outline hover */}
              <div className="absolute inset-0 border border-transparent group-hover:border-[rgba(var(--accent-violet-rgb),0.2)] transition-colors duration-300 pointer-events-none" />

              <div>
                <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-[rgba(var(--accent-violet-rgb),0.1)] p-3 text-[var(--accent-violet)] transition-transform duration-300 group-hover:scale-110 group-hover:text-[var(--accent-teal)]">
                  <agent.icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-[20px] text-[var(--text-base)] mb-3">
                  {agent.name}
                </h3>
                <p className="font-sans text-[14px] text-[rgba(var(--text-base-rgb),0.6)] leading-relaxed relative">
                  <span className="relative z-10">{agent.description}</span>
                  {/* Subtle hover effect for text */}
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--accent-violet)] group-hover:w-full transition-all duration-500 ease-out opacity-20" />
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <StatusBadge status={agent.status} label={agent.statusLabel} />
                <div className="text-[var(--accent-violet)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                  <span className="font-mono text-xl leading-none">→</span>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Agents;
