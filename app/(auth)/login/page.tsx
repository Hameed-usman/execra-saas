"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ChevronRight, Zap, TrendingUp, Users, Activity } from "lucide-react";

const mockMetrics = [
  { label: "MRR", value: "$24,800", change: "+18%", color: "#7C3AED" },
  { label: "Users", value: "1,204", change: "+32%", color: "#06B6D4" },
  { label: "Growth", value: "47%", change: "+5%", color: "#22c55e" },
  { label: "Tasks", value: "98%", change: "done", color: "#f97316" },
];

function DashboardPreview() {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Browser chrome */}
      <div className="rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "rgba(15,15,26,0.9)", border: "1px solid rgba(124,58,237,0.3)" }}>
        <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 mx-3 h-5 rounded-full flex items-center px-3"
            style={{ background: "rgba(255,255,255,0.05)", fontSize: "10px", color: "#475569" }}>
            app.execra.ai
          </div>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-white text-xs font-semibold">Your AI Command Center</p>
          <div className="grid grid-cols-2 gap-2">
            {mockMetrics.map((m, i) => (
              <motion.div key={m.label}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.15 }}
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-slate-500 text-xs">{m.label}</p>
                <p className="text-white text-base font-bold mt-0.5">{m.value}</p>
                <p className="text-xs mt-0.5" style={{ color: m.color }}>{m.change}</p>
              </motion.div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={12} style={{ color: "#7C3AED" }} />
              <p className="text-white text-xs font-medium">AI Activity</p>
            </div>
            {["Analyzed Q1 revenue patterns", "Generated 3 growth strategies", "Synced Stripe data"].map((t, i) => (
              <motion.div key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.2 }} className="flex items-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#7C3AED" }} />
                <p className="text-slate-400 text-xs">{t}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ boxShadow: "0 0 60px rgba(124,58,237,0.2)", zIndex: -1 }} />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    if (res?.error) {
      setError("Invalid email or password");
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0F", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .input-field {
          width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; padding: 12px 16px 12px 44px; color: #fff; font-size: 14px;
          transition: all 0.2s; outline: none;
        }
        .input-field::placeholder { color: #475569; }
        .input-field:focus { border-color: #7C3AED; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); background: rgba(124,58,237,0.05); }
        .gradient-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%); border: none; border-radius: 10px;
          color: white; font-weight: 600; font-size: 15px; padding: 14px; width: 100%;
          cursor: pointer; transition: all 0.2s;
        }
        .gradient-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(124,58,237,0.4); }
        .gradient-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
      `}</style>

      {/* LEFT — FORM */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#0A0A0F" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md">
          {/* Logo (mobile) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <Zap size={16} color="white" fill="white" />
            </div>
            <span className="text-white font-black text-xl">EXECRA</span>
          </div>

          <div style={{
            background: "rgba(15,15,26,0.8)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px", padding: "40px", backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
            animation: shake ? "shake 0.5s ease-in-out" : "none"
          }}>
            <div className="mb-8">
              <h2 className="text-white text-3xl font-black mb-2">Welcome back</h2>
              <p className="text-slate-500">Your AI team is ready</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="alex@startup.com" required className="input-field" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Password</label>
                  <Link href="#" className="text-xs hover:underline" style={{ color: "#7C3AED" }}>Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                    onChange={handleChange} placeholder="••••••••" required className="input-field"
                    style={{ paddingRight: "44px" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} className="p-3 rounded-lg text-sm"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="gradient-btn mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.2" />
                      <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Enter EXECRA <ChevronRight size={16} />
                  </span>
                )}
              </button>
            </form>

            <p className="text-center text-slate-600 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/signup" style={{ color: "#7C3AED" }} className="font-medium hover:underline">Sign up free</Link>
            </p>
          </div>
        </motion.div>
      </div>

      {/* RIGHT — Visual */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col items-center justify-center p-10 overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #110d1f 50%, #0a0a12 100%)" }}>
        {/* Background effects */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${250 + i * 100}px`, height: `${250 + i * 100}px`,
                background: i % 2 === 0
                  ? "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)",
                left: i === 0 ? "60%" : i === 1 ? "-10%" : "30%",
                top: i === 0 ? "-5%" : i === 1 ? "60%" : "80%",
                animation: `float ${7 + i * 2}s ease-in-out infinite`,
              }}
            />
          ))}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        <div className="relative z-10 w-full space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span className="text-white font-black text-2xl">EXECRA</span>
          </div>

          <DashboardPreview />

          {/* Social proof */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="flex -space-x-2">
                {["#7C3AED","#06B6D4","#f97316","#22c55e","#ec4899"].map((c, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: c, borderColor: "#0d0d1a" }}>
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">Trusted by 500+ founders</span> across 50+ countries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
