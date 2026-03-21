"use client";

import React, { useEffect, useRef, memo } from "react";
import { m, LazyMotion, domAnimation, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

const AuroraBlobs = memo(({ intensityMultiplier }: { intensityMultiplier: number }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <m.div
        animate={{
          x: ["-10%", "10%", "-10%"],
          y: ["5%", "-5%", "5%"],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: "70vw",
          height: "70vw",
          background: "radial-gradient(circle, var(--accent-violet) 0%, transparent 70%)",
          opacity: 0.15 * intensityMultiplier,
          filter: "blur(120px)",
          position: "absolute",
          top: "-10%",
          left: "-10%",
          willChange: "transform",
        }}
      />
      <m.div
        animate={{
          x: ["10%", "-10%", "10%"],
          y: ["-5%", "5%", "-5%"],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: "60vw",
          height: "60vw",
          background: "radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)",
          opacity: 0.12 * intensityMultiplier,
          filter: "blur(120px)",
          position: "absolute",
          bottom: "-10%",
          right: "-10%",
          willChange: "transform",
        }}
      />
    </div>
  );
});

AuroraBlobs.displayName = "AuroraBlobs";

export const AuroraBackground = ({ children, className, intensity = "medium" }: AuroraBackgroundProps) => {
  const mouseX = useSpring(0, { stiffness: 80, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 80, damping: 25 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      });
    };

    const container = containerRef.current;
    if (container && window.matchMedia("(hover: hover)").matches) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [mouseX, mouseY]);

  const intensityMultiplier = intensity === "low" ? 0.5 : intensity === "high" ? 1.5 : 1;

  // SVG noise string
  const noiseSVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

  return (
    <LazyMotion features={domAnimation}>
      <div 
        ref={containerRef}
        className={cn("relative w-full bg-[var(--bg-deep)] overflow-hidden min-h-screen", className)}
      >
        {/* Pointer Parallax Glow */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none">
          <m.div
            style={{
              x: mouseX,
              y: mouseY,
              translateX: "-50%",
              translateY: "-50%",
              width: "600px",
              height: "600px",
              background: "rgba(var(--accent-violet-rgb), 0.08)",
              borderRadius: "50%",
              filter: "blur(80px)",
              position: "absolute",
              willChange: "transform",
            }}
          />
        </div>

        {/* Aurora Mesh */}
        <AuroraBlobs intensityMultiplier={intensityMultiplier} />

        {/* Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(var(--text-base-rgb), 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(var(--text-base-rgb), 0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />

        {/* Noise Texture */}
        <div 
          className="absolute inset-0 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: noiseSVG,
            opacity: 0.035,
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </div>
    </LazyMotion>
  );
};

export default AuroraBackground;
