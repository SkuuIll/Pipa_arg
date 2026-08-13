"use client";

import { useEffect } from "react";

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    root.classList.add("motion-ready");

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return () => root.classList.remove("motion-ready");
    }

    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.94) {
        item.classList.add("is-visible");
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
    );

    revealItems.forEach((item) => {
      if (!item.classList.contains("is-visible")) observer.observe(item);
    });

    const heroVisual = document.querySelector<HTMLElement>(".hero-visual");
    const handlePointer = (event: PointerEvent) => {
      if (!heroVisual || event.pointerType === "touch") return;
      const bounds = heroVisual.getBoundingClientRect();
      heroVisual.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      heroVisual.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
    };

    heroVisual?.addEventListener("pointermove", handlePointer);

    return () => {
      observer.disconnect();
      heroVisual?.removeEventListener("pointermove", handlePointer);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
