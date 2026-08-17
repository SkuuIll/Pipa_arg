import { useEffect } from "react";

export function MotionController() {
  useEffect(() => {
    const root = document.documentElement;
    const handleElement = (el: HTMLElement) => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.98) {
        el.classList.add("is-visible");
        el.setAttribute("data-revealed", "true");
      } else {
        observer.observe(el);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.classList.add("is-visible");
            el.setAttribute("data-revealed", "true");
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px 12% 0px" },
    );

    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    revealItems.forEach(handleElement);

    root.classList.add("motion-ready");

    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute("data-reveal")) {
              handleElement(node);
            }
            node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(handleElement);
          }
        });
      });
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

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
      mutationObserver.disconnect();
      heroVisual?.removeEventListener("pointermove", handlePointer);
      root.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
