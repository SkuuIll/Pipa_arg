import { useEffect } from "react";

export function ExperienceLayer() {
  useEffect(() => {
    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>(".hero-layered");
    const portals = Array.from(document.querySelectorAll<HTMLElement>(".chapter-portal"));
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const update = () => {
      frame = 0;
      const progress = window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
      root.style.setProperty("--journey", String(progress));
      hero?.style.setProperty("--hero-x", String(pointerX));
      hero?.style.setProperty("--hero-y", String(pointerY));
      const rect = hero?.getBoundingClientRect();
      hero?.style.setProperty("--hero-scroll", String(rect ? Math.max(0, Math.min(1, -rect.top / rect.height)) : 0));
      for (const portal of portals) {
        const r = portal.getBoundingClientRect();
        const amount = Math.max(-1, Math.min(1, (innerHeight / 2 - r.top - r.height / 2) / innerHeight));
        portal.style.setProperty("--portal-shift", `${amount * 160}px`);
        portal.style.setProperty("--portal-scale", String(1 + (1 - Math.abs(amount)) * .18));
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !hero) return;
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
  }, []);

  return <>
    <div className="universe-progress" aria-hidden="true" />
    <div className="universe-atmosphere" aria-hidden="true"><i /><i /><div className="universe-grid" /></div>
    <div className="universe-signal" aria-hidden="true"><i /><i /><i /></div>
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
