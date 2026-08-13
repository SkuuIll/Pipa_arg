"use client";

import { MotionConfig, motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { useEffect } from "react";

export function ExperienceLayer() {
  const cursorX = useMotionValue(-300);
  const cursorY = useMotionValue(-300);
  const smoothX = useSpring(cursorX, { stiffness: 90, damping: 24, mass: 0.55 });
  const smoothY = useSpring(cursorY, { stiffness: 90, damping: 24, mass: 0.55 });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-enabled");
    root.classList.remove("motion-disabled");
    window.localStorage.removeItem("pipa-motion");
    window.dispatchEvent(new CustomEvent("pipa-motion", { detail: true }));

    const pointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX - 210);
      cursorY.set(event.clientY - 210);
    };

    window.addEventListener("pointermove", pointerMove, { passive: true });

    return () => window.removeEventListener("pointermove", pointerMove);
  }, [cursorX, cursorY]);

  return (
    <MotionConfig reducedMotion="never">
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <motion.div className="cursor-aura" style={{ x: smoothX, y: smoothY }} aria-hidden="true" />
      <div className="ambient-world" aria-hidden="true">
        <motion.div
          className="ambient-orb ambient-orb-one"
          animate={{ x: [0, 90, -25, 0], y: [0, -45, 55, 0], scale: [1, 1.18, 0.94, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="ambient-orb ambient-orb-two"
          animate={{ x: [0, -85, 30, 0], y: [0, 70, -30, 0], rotate: [0, 120, 240, 360] }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="ambient-grid"
          animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </MotionConfig>
  );
}
