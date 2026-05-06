"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, User, Mail, Lock, Building2, Zap, Brain, TrendingUp, ChevronRight } from "lucide-react";
import { signIn } from "next-auth/react";

function PasswordStrengthBar({ password }: { password: string }) {
  const getStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = getStrength(password);
  const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return password.length > 0 ? (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength - 1] : "#1f2937" }}
          />
        ))}
      </div>
      <p className="text-xs" style={{ color: strength > 0 ? colors[strength - 1] : "#6b7280" }}>
        {password.length > 0 ? labels[strength - 1] || "Very Weak" : ""}
      </p>
    </div>
  ) : null;
}

const features = [
  { icon: Brain, title: "AI Strategy Engine", desc: "Real-time insights powered by GPT-4 + your data" },
  { icon: TrendingUp, title: "Growth Intelligence", desc: "Automated metrics, forecasting, and opportunity radar" },
  { icon: Zap, title: "Instant Automation", desc: "Connect Gmail, Stripe, Notion and automate workflows" },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (signInRes?.error) {
        setError("Account created but auto-login failed. Please sign in.");
        setLoading(false);
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/onboarding"), 1200);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0A0A0F", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px 12px 44px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
          outline: none;
        }
        .input-field::placeholder { color: #475569; }
        .input-field:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
          background: rgba(124,58,237,0.05);
        }
        .gradient-btn {
          background: linear-gradient(135deg, #7C3AED 0%, #5b21b6 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          font-size: 15px;
          padding: 14px;
          width: 100%;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .gradient-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 30px rgba(124,58,237,0.4);
        }
        .gradient-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        @keyframes shimmer { from{transform:translateX(-100%)} to{transform:translateX(100%)} }
      `}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[40%] relative flex-col justify-between p-10 overflow-hidden" 
           style={{ background: "linear-gradient(145deg, #0d0d1a 0%, #110d1f 50%, #0a0a12 100%)" }}>
        {/* Animated gradient mesh */}
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full"
              style={{
                width: `${300 + i * 100}px`, height: `${300 + i * 100}px`,
                background: i === 0
                  ? "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)"
                  : i === 1
                  ? "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
                left: i === 0 ? "-50px" : i === 1 ? "60%" : "20%",
                top: i === 0 ? "10%" : i === 1 ? "50%" : "70%",
                animation: `float ${6 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * 0.7}s`,
              }}
            />
          ))}
          {/* Grid pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }} />
        </div>

        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: `${8 + i * 4}px`, height: `${8 + i * 4}px`,
              background: i % 2 === 0 ? "rgba(124,58,237,0.6)" : "rgba(6,182,212,0.5)",
              left: `${15 + i * 15}%`, top: `${20 + i * 10}%`,
              filter: "blur(1px)", animation: `float ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`
            }}
          />
        ))}

        {/* Logo */}
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7C3AED, #06B6D4)" }}>
              <Zap size={20} color="white" fill="white" />
            </div>
            <span className="text-white font-black text-2xl tracking-tight">EXECRA</span>
          </motion.div>
        </div>

        {/* Headline & features */}
        <div className="relative z-10">
          <motion.h1 initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-5xl font-black text-white leading-tight mb-4">
            Your AI<br />
            <span style={{ background: "linear-gradient(90deg, #7C3AED, #06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Co-Founder
            </span><br />Awaits
          </motion.h1>
          <motion.p initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="text-slate-400 text-lg mb-10 leading-relaxed">
            The intelligent platform that thinks, plans, and acts alongside you—24/7.
          </motion.p>
          <div className="space-y-5">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)" }}>
                  <f.icon size={18} style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stat */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["#7C3AED","#06B6D4","#f97316","#22c55e"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0d0d1a] flex items-center justify-center text-white text-xs font-bold"
                style={{ background: c }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm"><span className="text-white font-semibold">500+</span> founders already building</p>
        </motion.div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#0A0A0F" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md">
          {/* Glassmorphism card */}
          <div style={{
            background: "rgba(15,15,26,0.8)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "20px",
            padding: "40px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px rgba(0,0,0,0.5)"
          }}>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7C3AED,#06B6D4)" }}>
                    <motion.svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
                      initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
                      <motion.path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} />
                    </motion.svg>
                  </motion.div>
                  <h3 className="text-white text-2xl font-bold mb-2">Account Created!</h3>
                  <p className="text-slate-400">Redirecting to onboarding...</p>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-8">
                    <h2 className="text-white text-3xl font-black mb-2">Create your account</h2>
                    <p className="text-slate-500">Join founders building the future</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Full Name */}
                    <div>
                      <label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Full Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="name" value={form.name} onChange={handleChange}
                          placeholder="Alex Johnson" required className="input-field" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Email Address</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="email" type="email" value={form.email} onChange={handleChange}
                          placeholder="alex@startup.com" required className="input-field" />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="password" type={showPassword ? "text" : "password"} value={form.password}
                          onChange={handleChange} placeholder="Min. 8 characters" required className="input-field"
                          style={{ paddingRight: "44px" }} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PasswordStrengthBar password={form.password} />
                    </div>

                    {/* Company Name */}
                    <div>
                      <label className="text-slate-400 text-xs font-medium mb-1.5 block uppercase tracking-wider">Company Name</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="companyName" value={form.companyName} onChange={handleChange}
                          placeholder="Acme Inc." required className="input-field" />
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-lg text-sm"
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                          {error}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button type="submit" disabled={loading} className="gradient-btn mt-2">
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.2" />
                            <path d="M21 12a9 9 0 00-9-9" strokeLinecap="round" />
                          </svg>
                          Creating account...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Start Building <ChevronRight size={16} />
                        </span>
                      )}
                    </button>
                  </form>

                  <p className="text-center text-slate-600 text-sm mt-6">
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "#7C3AED" }} className="font-medium hover:underline">Sign in</Link>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
