"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Zap, Rocket, Sprout, Leaf, TrendingUp, Layers } from "lucide-react";

const INDUSTRIES = ["Tech", "Fintech", "Healthcare", "E-commerce", "Education", "Other"];
const STAGES = [
  { id: "idea", label: "Idea", icon: "💡", desc: "Pre-product" },
  { id: "pre-seed", label: "Pre-Seed", icon: "🌱", desc: "Early validation" },
  { id: "seed", label: "Seed", icon: "🚀", desc: "Building product" },
  { id: "series-a", label: "Series A", icon: "📈", desc: "Scaling up" },
];
const TOOLS = ["Gmail", "Stripe", "Slack", "Notion", "Linear", "GitHub"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    industry: "",
    stage: "",
    teamSize: 5,
    description: "",
    goals: "",
    competitors: "",
    tools: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [explode, setExplode] = useState(false);

  const toggleTool = (t: string) =>
    setForm(f => ({
      ...f,
      tools: f.tools.includes(t) ? f.tools.filter(x => x !== t) : [...f.tools, t],
    }));

  const handleFinish = async () => {
    setLoading(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setExplode(true);
      setTimeout(() => router.push("/dashboard"), 1600);
    } catch {
      setLoading(false);
    }
  };

  const steps = ["Your Startup", "Your Team", "Goals & Tools"];
  const canNext = [
    form.industry && form.stage,
    form.teamSize > 0,
    true,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6"
      style={{ background: "#0A0A0F", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .glass-card { background: rgba(15,15,26,0.85); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; backdrop-filter: blur(20px); box-shadow: 0 25px 50px rgba(0,0,0,0.5); }
        .field-label { color: #94a3b8; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; display: block; }
        .text-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 16px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s; }
        .text-input:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .text-input::placeholder { color: #475569; }
        select.text-input option { background: #0f0f1a; }
        @keyframes confetti { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(-120px) rotate(720deg);opacity:0} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)", animation: "float 10s ease-in-out infinite reverse" }} />
      </div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8 relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>
          <Zap size={18} color="white" fill="white" />
        </div>
        <span className="text-white font-black text-xl tracking-tight">EXECRA</span>
      </motion.div>

      {/* Card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-xl relative z-10" style={{ padding: "40px" }}>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2">
                  <motion.div animate={{
                    background: i <= step ? "linear-gradient(135deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.08)",
                    boxShadow: i === step ? "0 0 16px rgba(124,58,237,0.5)" : "none"
                  }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {i < step ? "✓" : i + 1}
                  </motion.div>
                  <span className="text-xs hidden sm:block" style={{ color: i <= step ? "#fff" : "#475569", fontWeight: i === step ? 600 : 400 }}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-3" style={{ background: i < step ? "linear-gradient(90deg,#7C3AED,#06B6D4)" : "rgba(255,255,255,0.08)" }} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg,#7C3AED,#06B6D4)" }}
              animate={{ width: `${((step) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0 — About Startup */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <h2 className="text-white text-2xl font-black mb-1">Tell us about your startup</h2>
              <p className="text-slate-500 text-sm mb-6">Help us personalize your AI experience</p>

              <div className="mb-5">
                <label className="field-label">Industry</label>
                <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}
                  className="text-input">
                  <option value="">Select industry...</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div>
                <label className="field-label">Startup Stage</label>
                <div className="grid grid-cols-2 gap-3">
                  {STAGES.map(s => (
                    <motion.button key={s.id} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setForm({ ...form, stage: s.id })}
                      className="p-4 rounded-xl text-left transition-all"
                      style={{
                        background: form.stage === s.id ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.03)",
                        border: form.stage === s.id ? "1px solid rgba(124,58,237,0.5)" : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: form.stage === s.id ? "0 0 20px rgba(124,58,237,0.2), inset 0 0 20px rgba(124,58,237,0.05)" : "none"
                      }}>
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <p className="text-white text-sm font-semibold">{s.label}</p>
                      <p className="text-slate-500 text-xs">{s.desc}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1 — Team */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <h2 className="text-white text-2xl font-black mb-1">Your team</h2>
              <p className="text-slate-500 text-sm mb-6">Tell us who&apos;s building with you</p>

              <div className="mb-6">
                <label className="field-label">Team Size</label>
                <div className="text-center mb-4">
                  <motion.span key={form.teamSize} initial={{ scale: 1.3, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-6xl font-black"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    {form.teamSize}
                  </motion.span>
                  <p className="text-slate-500 text-sm mt-1">people</p>
                </div>
                <input type="range" min="1" max="100" value={form.teamSize}
                  onChange={e => setForm({ ...form, teamSize: Number(e.target.value) })}
                  className="w-full mt-2"
                  style={{ accentColor: "#7C3AED", cursor: "pointer" }} />
                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>Solo</span><span>100+</span>
                </div>
              </div>

              <div>
                <label className="field-label">Describe your startup <span className="text-slate-600">(optional)</span></label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="What does your startup do? Who is it for?"
                  rows={4} className="text-input resize-none"
                  maxLength={500} />
                <p className="text-right text-xs text-slate-600 mt-1">{form.description.length}/500</p>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — Goals & Tools */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
              <h2 className="text-white text-2xl font-black mb-1">Goals & Tools</h2>
              <p className="text-slate-500 text-sm mb-6">Help your AI co-founder prioritize</p>

              <div className="mb-5">
                <label className="field-label">Top 3 goals this quarter</label>
                <textarea value={form.goals}
                  onChange={e => setForm({ ...form, goals: e.target.value })}
                  placeholder="1. Launch MVP by April&#10;2. Reach 100 paying customers&#10;3. Raise pre-seed round"
                  rows={4} className="text-input resize-none" />
              </div>

              <div className="mb-5">
                <label className="field-label">Competitors <span className="text-slate-600">(optional)</span></label>
                <input value={form.competitors}
                  onChange={e => setForm({ ...form, competitors: e.target.value })}
                  placeholder="e.g. Notion, Asana, Linear" className="text-input" />
              </div>

              <div>
                <label className="field-label">Tools you use</label>
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map(t => {
                    const active = form.tools.includes(t);
                    return (
                      <motion.button key={t} type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTool(t)}
                        className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                        style={{
                          background: active ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                          border: active ? "1px solid rgba(124,58,237,0.6)" : "1px solid rgba(255,255,255,0.08)",
                          color: active ? "#a78bfa" : "#64748b",
                          boxShadow: active ? "0 0 12px rgba(124,58,237,0.25)" : "none"
                        }}>
                        {t}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setStep(s => s - 1)}
            style={{
              visibility: step === 0 ? "hidden" : "visible",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "12px 20px", color: "#94a3b8",
              cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 500, fontSize: "14px"
            }}>
            <ChevronLeft size={16} /> Back
          </motion.button>

          {step < steps.length - 1 ? (
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              style={{
                background: canNext[step] ? "linear-gradient(135deg,#7C3AED,#5b21b6)" : "rgba(124,58,237,0.3)",
                border: "none", borderRadius: "10px", padding: "12px 24px", color: "white",
                cursor: canNext[step] ? "pointer" : "not-allowed", display: "flex", alignItems: "center",
                gap: "6px", fontWeight: 600, fontSize: "14px",
                boxShadow: canNext[step] ? "0 4px 20px rgba(124,58,237,0.3)" : "none"
              }}>
              Continue <ChevronRight size={16} />
            </motion.button>
          ) : (
            <motion.button type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={handleFinish} disabled={loading}
              style={{
                background: "linear-gradient(135deg,#7C3AED,#06B6D4)", border: "none", borderRadius: "10px",
                padding: "12px 24px", color: "white", cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "15px",
                boxShadow: "0 4px 24px rgba(124,58,237,0.4)"
              }}>
              {loading ? (
                explode ? "🚀 Launching..." : (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
                    </svg>
                    Saving...
                  </span>
                )
              ) : (
                <><Rocket size={16} /> Launch EXECRA</>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Confetti burst on launch */}
      <AnimatePresence>
        {explode && (
          <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
            {[...Array(20)].map((_, i) => (
              <motion.div key={i}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400,
                  opacity: 0, rotate: Math.random() * 720, scale: 0
                }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="absolute w-3 h-3 rounded"
                style={{ background: ["#7C3AED","#06B6D4","#f97316","#22c55e","#ec4899"][i % 5] }} />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
