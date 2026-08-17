import { useEffect, useRef, useState } from "react";

interface StatsCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

export function StatsCounter({ value, className, duration = 1400 }: StatsCounterProps) {
  const [displayValue, setDisplayValue] = useState("0");
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const isFormattedWithDot = value.includes(".");
    const cleanNum = parseFloat(value.replace(/\./g, "").replace(",", "."));
    
    if (isNaN(cleanNum)) {
      setDisplayValue(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentNumber = Math.floor(easeOut * cleanNum);

            if (isFormattedWithDot) {
              setDisplayValue(currentNumber.toLocaleString("es-AR"));
            } else {
              setDisplayValue(currentNumber.toString());
            }

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(value);
            }
          };

          requestAnimationFrame(animate);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <strong ref={elementRef} className={className}>
      {hasAnimated ? displayValue : "0"}
    </strong>
  );
}
