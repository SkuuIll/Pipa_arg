import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const introSeenKey = "pipaa:preloader-done:v1";

function shouldPlayIntro(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("intro") === "0") return false;
    if (params.get("intro") === "1" || params.get("loading") === "1") return true;
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") return true;
    return !sessionStorage.getItem(introSeenKey);
  } catch {
    return false;
  }
}

export function PreloaderSplash({ route }: { route?: string }) {
  const reducedMotion = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => shouldPlayIntro());
  const [phase, setPhase] = useState<"boot" | "sync" | "ready">("boot");

  useEffect(() => {
    if (!visible || reducedMotion) {
      if (reducedMotion && visible) setVisible(false);
      return;
    }
    try {
      sessionStorage.setItem(introSeenKey, "1");
    } catch { /* Optional */ }

    const bootTimer = window.setTimeout(() => setPhase("sync"), 400);
    const readyTimer = window.setTimeout(() => setPhase("ready"), 1100);
    const closeTimer = window.setTimeout(() => setVisible(false), 1900);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(bootTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(closeTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [visible, reducedMotion]);

  const routeHint =
    route === "/directo/"
      ? "SINTONIZANDO SALA EN VIVO"
      : route === "/videos/"
        ? "CARGANDO ARCHIVO DE VIDEOS"
        : route === "/comandos/"
          ? "ABRIENDO TIENDA DEL STREAM"
          : "CONECTANDO CON PANZA ARMY";

  const statusText =
    phase === "boot"
      ? "INICIALIZANDO SISTEMA"
      : phase === "ready"
        ? "SEÑAL LISTA · ARG ✓"
        : routeHint;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pipaa-preloader"
          role="status"
          aria-live="polite"
          aria-label="Cargando sitio de PIPAA"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: "blur(12px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="pipaa-preloader-glow" aria-hidden="true" />

          {/* Scan lines for gaming aesthetic */}
          <div className="preloader-scanlines" aria-hidden="true" />

          {/* Animated particles */}
          <div className="preloader-particles" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                style={{
                  "--px": `${10 + (i * 7.5) % 80}%`,
                  "--py": `${15 + (i * 11.3) % 70}%`,
                  "--pd": `${(i * 0.18).toFixed(2)}s`,
                  "--ps": `${(2.5 + (i % 4) * 0.7).toFixed(1)}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <motion.div
            className="pipaa-preloader-frame"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="preloader-bracket is-tl"
              initial={{ opacity: 0, x: -16, y: -16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            />
            <motion.span
              className="preloader-bracket is-tr"
              initial={{ opacity: 0, x: 16, y: -16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            />
            <motion.span
              className="preloader-bracket is-bl"
              initial={{ opacity: 0, x: -16, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
            />
            <motion.span
              className="preloader-bracket is-br"
              initial={{ opacity: 0, x: 16, y: 16 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />

            <motion.div
              className="preloader-emblem"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div className="preloader-ring" aria-hidden="true" />
              <div className="preloader-ring preloader-ring-outer" aria-hidden="true" />
              <img src="/pipa-avatar-v2.webp" alt="" width="74" height="74" loading="eager" decoding="sync" className="preloader-avatar" />
            </motion.div>

            <motion.p
              className="preloader-tagline"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0.7, y: 0 }}
              transition={{ duration: 0.35, delay: 0.35 }}
            >
              MUCHA PANZA. PURO SHOW.
            </motion.p>

            <motion.p
              className="preloader-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              key={phase}
            >
              <i aria-hidden="true" className={phase === "ready" ? "is-ready" : undefined} />
              <span>{statusText}</span>
            </motion.p>

            <div className="preloader-bar" aria-hidden="true">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>

          <button
            type="button"
            className="preloader-skip"
            onClick={() => setVisible(false)}
          >
            Saltar intro ›
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
