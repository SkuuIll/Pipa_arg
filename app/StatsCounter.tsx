import { useEffect, useRef, useState } from "react";

interface StatsCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export function StatsCounter({ value, className, duration = 1400 }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setDisplayValue(value);
    const cleanNum = Number(value.replace(/\./g, "").replace(",", "."));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!Number.isFinite(cleanNum) || duration <= 0 || preference.matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        if (progress === 1 || preference.matches) {
          setDisplayValue(value);
          return;
        }
        const current = Math.floor((1 - Math.pow(1 - progress, 3)) * cleanNum);
        setDisplayValue(value.includes(".") ? current.toLocaleString("es-AR") : String(current));
        frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: 0.2 });
    if (elementRef.current) observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <strong ref={elementRef} className={className}>{displayValue}</strong>;
}
