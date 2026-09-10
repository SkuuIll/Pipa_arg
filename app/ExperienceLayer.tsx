import { useEffect, useState } from "react";
import { Pause, Play, Zap } from "lucide-react";

export function ExperienceLayer() {
  const [chaos, setChaos] = useState(false);
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem("pipa-effects-paused") === "true"; } catch { return false; }
  });
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("universe-chaos", chaos && !reduced && !paused);
    root.classList.toggle("experience-paused", paused || reduced);
    try { localStorage.setItem("pipa-effects-paused", String(paused)); } catch { /* Storage is optional. */ }
    return () => { root.classList.remove("universe-chaos", "experience-paused"); };
  }, [chaos, paused, reduced]);

  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".hero-layered");
    const portals = Array.from(document.querySelectorAll<HTMLElement>(".chapter-portal"));
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const update = () => {
      frame = 0;
      const enabled = !paused && !reduced;
      const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      root.style.setProperty("--journey", String(progress));
      hero?.style.setProperty("--hero-x", String(enabled ? pointerX : 0));
      hero?.style.setProperty("--hero-y", String(enabled ? pointerY : 0));
      const rect = hero?.getBoundingClientRect();
      hero?.style.setProperty("--hero-scroll", String(enabled && rect ? Math.max(0, Math.min(1, -rect.top / rect.height)) : 0));
      for (const portal of portals) {
        const r = portal.getBoundingClientRect();
        const amount = Math.max(-1, Math.min(1, (innerHeight / 2 - r.top - r.height / 2) / innerHeight));
        portal.style.setProperty("--portal-shift", `${enabled ? amount * 160 : 0}px`);
        portal.style.setProperty("--portal-scale", String(enabled ? 1 + (1 - Math.abs(amount)) * .18 : 1));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !hero || hero.classList.contains("is-paused")) return;
      const r = hero.getBoundingClientRect();
      pointerX = Math.max(-1, Math.min(1, (event.clientX - r.left) / r.width * 2 - 1));
      pointerY = Math.max(-1, Math.min(1, (event.clientY - r.top) / r.height * 2 - 1));
      schedule();
    };
    const reset = () => { pointerX = 0; pointerY = 0; schedule(); };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        root.dataset.universeScene = (entry.target as HTMLElement).dataset.scene || "violet";
      }
    }, { rootMargin: "-25% 0px -45% 0px" });
    document.querySelectorAll("[data-scene]").forEach(el => observer.observe(el));
    hero?.addEventListener("pointermove", move);
    hero?.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame); observer.disconnect();
      hero?.removeEventListener("pointermove", move); hero?.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule);
      delete root.dataset.universeScene;
    };
  }, [paused, reduced]);

  return <>
    <div className="universe-progress" aria-hidden="true" />
    <div className="universe-atmosphere" aria-hidden="true"><i /><i /><div className="universe-grid" /></div>
    <div className="chaos-overlay" aria-hidden="true"><span>SEÑAL INTERVENIDA / PANZA ARMY</span><i /><i /><i /></div>
    <div className="experience-controls" role="group" aria-label="Efectos visuales">
      <button type="button" className="chaos-switch" aria-pressed={chaos} disabled={reduced} onClick={() => { setChaos(!chaos); if (!chaos) setPaused(false); }}>
        <Zap size={14} aria-hidden="true" /> {chaos ? "Caos activado" : "Modo caos"}
      </button>
      <button type="button" disabled={reduced} aria-pressed={paused || reduced} aria-label={reduced ? "Movimiento reducido activo" : paused ? "Activar efectos visuales" : "Pausar efectos visuales"} onClick={() => setPaused(!paused)}>
        {paused || reduced ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
      <span className="sr-only" role="status">{reduced ? "Efectos reducidos según tu dispositivo" : chaos && !paused ? "Modo caos activado" : paused ? "Efectos pausados" : "Modo inmersivo"}</span>
    </div>
  </>;
}

export function ChapterPortal({ word, label, scene = "violet" }: { word: string; label: string; scene?: string }) {
  return <div className="chapter-portal" data-scene={scene} aria-hidden="true">
    <div className="portal-orbit" />
    <span className="portal-caption">{label}</span>
    <div className="portal-word" data-word={word}>{word}</div>
    <span className="portal-coordinate">PIPAA / PANZA ARMY <b>↓</b></span>
  </div>;
}
