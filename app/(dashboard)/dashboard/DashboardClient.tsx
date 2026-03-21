"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap, LayoutDashboard, Bot, Plug, Settings, TrendingUp,
  Users, DollarSign, CheckSquare, Mail, CreditCard, Activity, ChevronRight
} from "lucide-react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Bot, label: "AI Agents" },
  { icon: Plug, label: "Integrations" },
  { icon: Settings, label: "Settings" },
];

const METRICS = [
  { label: "Revenue", value: "$24,800", change: "+18%", positive: true, icon: DollarSign, color: "#7C3AED" },
  { label: "Users", value: "1,204", change: "+32%", positive: true, icon: Users, color: "#06B6D4" },
  { label: "Growth", value: "47%", change: "+5.2%", positive: true, icon: TrendingUp, color: "#22c55e" },
  { label: "Tasks Done", value: "98%", change: "On track", positive: true, icon: CheckSquare, color: "#f97316" },
];

const ACTIVITY = [
  { text: "AI analyzed Q1 revenue patterns", time: "2m ago", color: "#7C3AED" },
  { text: "New user signed up from LinkedIn campaign", time: "14m ago", color: "#06B6D4" },
  { text: "Stripe synced — 3 new transactions", time: "32m ago", color: "#22c55e" },
  { text: "AI generated growth strategy report", time: "1h ago", color: "#f97316" },
  { text: "Competitor analysis updated", time: "3h ago", color: "#ec4899" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardClient({ user }: { user: any }) {
  const [activeNav, setActiveNav] = useState(0);
  const firstName = user?.name?.split(" ")[0] ?? "Founder";

  return (
    <div className="flex min-h-screen" style={{ background: "#0A0A0F", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.6);opacity:0} }
        .glass { background: rgba(15,15,26,0.7); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(16px); }
        .metric-card { background: rgba(15,15,26,0.8); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 24px; transition: all 0.2s; }
        .metric-card:hover { border-color: rgba(124,58,237,0.3); transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.1); }
        .tool-card { background: rgba(15,15,26,0.6); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; transition: all 0.2s; cursor: pointer; }
        .tool-card:hover { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.05); }
        .connect-btn { background: linear-gradient(135deg,#7C3AED,#5b21b6); border: none; border-radius: 8px; padding: 8px 16px; color: white; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .connect-btn:hover { box-shadow: 0 4px 16px rgba(124,58,237,0.4); transform: translateY(-1px); }
      `}</style>

      {/* SIDEBAR */}
      <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="glass flex flex-col items-center py-6 gap-6 fixed top-0 left-0 h-full z-20"
        style={{ width: "62px", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-2"
          style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>
          <Zap size={18} color="white" fill="white" />
        </div>

        {/* Nav items */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {NAV_ITEMS.map((item, i) => (
            <motion.button key={item.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveNav(i)}
              title={item.label}
              className="w-10 h-10 rounded-xl flex items-center justify-center relative group transition-all"
              style={{
                background: activeNav === i ? "rgba(124,58,237,0.2)" : "transparent",
                border: activeNav === i ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
              }}>
              <item.icon size={18} style={{ color: activeNav === i ? "#a78bfa" : "#475569" }} />
              {/* Tooltip */}
              <div className="absolute left-14 bg-[#1a1a2e] text-white text-xs py-1 px-2 rounded-md 
                opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-30"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                {item.label}
              </div>
            </motion.button>
          ))}
        </div>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-[62px] flex flex-col min-h-screen">
        {/* TOP BAR */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="glass sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h1 className="text-white font-bold text-lg">
              {getGreeting()}, <span style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{firstName}</span> 👋
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">Here&apos;s what&apos;s happening with your startup</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2 h-2 rounded-full bg-green-500 absolute -top-0.5 -right-0.5"
                style={{ animation: "pulse-ring 1.5s ease-out infinite" }} />
              <Activity size={18} className="text-slate-400" />
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
          </div>
        </motion.div>

        {/* PAGE BODY */}
        <div className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="rounded-2xl p-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10" style={{ animation: "float 6s ease-in-out infinite" }}>
              <Bot size={120} color="#7C3AED" />
            </div>
            <h2 className="text-white text-2xl font-black mb-2">Your AI Command Center</h2>
            <p className="text-slate-400 max-w-md">Your AI agents are actively monitoring your metrics, generating insights, and ready to act on your behalf.</p>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-green-500" style={{ boxShadow: "0 0 8px #22c55e" }} />
              <span className="text-green-400 text-sm font-medium">3 AI agents online</span>
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {METRICS.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }} className="metric-card">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{m.label}</p>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${m.color}20`, border: `1px solid ${m.color}30` }}>
                    <m.icon size={14} style={{ color: m.color }} />
                  </div>
                </div>
                <p className="text-white text-2xl font-black">{m.value}</p>
                <p className="text-xs mt-1" style={{ color: m.positive ? "#22c55e" : "#ef4444" }}>
                  ↑ {m.change}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Connect Tools + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Connect Tools */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold">Connect your tools</h3>
                <span className="text-xs text-slate-500 px-2 py-1 rounded-full"
                  style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}>
                  0/6 connected
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Gmail", icon: Mail, color: "#ef4444", desc: "Sync emails & contacts" },
                  { name: "Stripe", icon: CreditCard, color: "#635bff", desc: "Track revenue & payments" },
                ].map((t) => (
                  <div key={t.name} className="tool-card flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${t.color}20`, border: `1px solid ${t.color}30` }}>
                        <t.icon size={16} style={{ color: t.color }} />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{t.name}</p>
                        <p className="text-slate-500 text-xs">{t.desc}</p>
                      </div>
                    </div>
                    <button className="connect-btn flex items-center gap-1">
                      Connect <ChevronRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
              className="glass rounded-2xl p-6">
              <h3 className="text-white font-bold mb-5">Recent Activity</h3>
              <div className="space-y-4">
                {ACTIVITY.map((a, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.08 }} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm leading-snug">{a.text}</p>
                      <p className="text-slate-600 text-xs mt-0.5">{a.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-20 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)" }} />
      </div>
    </div>
  );
}
