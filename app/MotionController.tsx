
import { useEffect } from "react";

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    revealItems.forEach((item) => {
      if (item.getBoundingClientRect().top < window.innerHeight * 0.98) {
        item.classList.add("is-visible");
      }
    });

    root.classList.add("motion-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 12% 0px" },
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
