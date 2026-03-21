"use client";

import React, { useState } from "react";
import { m, useScroll, useMotionValueEvent, AnimatePresence, LazyMotion, domAnimation } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";


const NAV_LINKS = [
  { name: "Agents", href: "#agents" },
  { name: "Pricing", href: "#pricing" },
  { name: "Blog", href: "#" },
];

export const Navbar = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(true);
  const [borderOpacity, setBorderOpacity] = useState(0.04);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Agents");

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      setHidden(false);
      setBorderOpacity(0.12);
    } else {
      setHidden(true);
      setBorderOpacity(0.04);
    }
  });

  return (
    <LazyMotion features={domAnimation}>
      <m.nav
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: hidden ? -8 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-[16px] left-[50%] z-50 w-full max-w-[780px] -translate-x-1/2 px-4 sm:px-0"
      >
        <div
          className="relative flex items-center justify-between rounded-full px-6 py-2.5 transition-colors duration-300"
          style={{
            backgroundColor: "rgba(var(--bg-surface-rgb), 0.6)",
            backdropFilter: "blur(20px) saturate(180%)",
            border: `1px solid rgba(var(--text-base-rgb), ${borderOpacity})`,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-[var(--text-base)] text-lg tracking-[-0.02em]">
            STRATARA
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setActiveLink(link.name)}
                className="relative text-[14px] font-sans text-[var(--text-base)] opacity-70 hover:opacity-100 transition-opacity"
              >
                {link.name}
                {activeLink === link.name && (
                  <m.div
                    layoutId="navbar-active-dot"
                    className="absolute -bottom-2 left-1/2 h-[2px] w-[2px] -translate-x-1/2 rounded-full bg-[var(--accent-teal)]"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href="#signup"
              className="hidden sm:inline-flex items-center justify-center rounded-full bg-[var(--accent-violet)] px-6 py-2 text-sm font-semibold text-[var(--text-base)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(var(--accent-violet-rgb),0.4)]"
            >
              Get started
            </Link>
            <button
              className="md:hidden text-[var(--text-base)] opacity-80"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-4 right-4 mt-4 rounded-3xl border border-white/10 bg-[var(--bg-surface)] p-6 shadow-2xl md:hidden"
              style={{ backdropFilter: "blur(20px)" }}
            >
              <div className="flex flex-col gap-6">
                {NAV_LINKS.map((link, i) => (
                  <m.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-sans text-[var(--text-base)] opacity-80 hover:opacity-100"
                    >
                      {link.name}
                    </Link>
                  </m.div>
                ))}
                <m.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.1 }}
                  className="pt-4 border-t border-white/10"
                >
                  <Link
                    href="#signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-violet)] px-6 py-3 text-sm font-semibold text-[var(--text-base)]"
                  >
                    Get started
                  </Link>
                </m.div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </m.nav>
    </LazyMotion>
  );
};

export default Navbar;
