"use client";

import { MotionConfig, motion, useMotionValue, useScroll, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export function ExperienceLayer() {
  const [motionEnabled, setMotionEnabled] = useState(true);
  const cursorX = useMotionValue(-300);
  const cursorY = useMotionValue(-300);
  const smoothX = useSpring(cursorX, { stiffness: 90, damping: 24, mass: 0.55 });
  const smoothY = useSpring(cursorY, { stiffness: 90, damping: 24, mass: 0.55 });
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const saved = window.localStorage.getItem("pipa-motion");
    if (saved === "off") setMotionEnabled(false);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("motion-enabled", motionEnabled);
    root.classList.toggle("motion-disabled", !motionEnabled);
    window.localStorage.setItem("pipa-motion", motionEnabled ? "on" : "off");
    window.dispatchEvent(new CustomEvent("pipa-motion", { detail: motionEnabled }));

    const pointerMove = (event: PointerEvent) => {
      cursorX.set(event.clientX - 210);
      cursorY.set(event.clientY - 210);
    };

    if (motionEnabled) window.addEventListener("pointermove", pointerMove, { passive: true });
    else {
      cursorX.set(-500);
      cursorY.set(-500);
    }

    return () => window.removeEventListener("pointermove", pointerMove);
  }, [motionEnabled, cursorX, cursorY]);

  return (
    <MotionConfig reducedMotion={motionEnabled ? "never" : "always"}>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <motion.div className="cursor-aura" style={{ x: smoothX, y: smoothY }} aria-hidden="true" />
      <div className="ambient-world" aria-hidden="true">
        <motion.div
          className="ambient-orb ambient-orb-one"
          animate={motionEnabled ? { x: [0, 90, -25, 0], y: [0, -45, 55, 0], scale: [1, 1.18, 0.94, 1] } : undefined}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="ambient-orb ambient-orb-two"
          animate={motionEnabled ? { x: [0, -85, 30, 0], y: [0, 70, -30, 0], rotate: [0, 120, 240, 360] } : undefined}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="ambient-grid"
          animate={motionEnabled ? { backgroundPosition: ["0px 0px", "80px 80px"] } : undefined}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <button
        className={`motion-toggle ${motionEnabled ? "is-on" : ""}`}
        type="button"
        onClick={() => setMotionEnabled((current) => !current)}
        aria-pressed={motionEnabled}
        aria-label={`${motionEnabled ? "Desactivar" : "Activar"} animaciones`}
      >
        <span aria-hidden="true"><i /></span>
        Motion {motionEnabled ? "ON" : "OFF"}
      </button>
    </MotionConfig>
  );
}
