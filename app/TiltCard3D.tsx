"use client";

import React, { useRef, useState, useCallback } from "react";

interface TiltCard3DProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}

export function TiltCard3D({
  children,
  maxTilt = 12,
  perspective = 1000,
  scale = 1.02,
  glare = true,
  className = "",
  style,
  ...props
}: TiltCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("experience-paused")) return;
      const rect = cardRef.current.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Coordenadas relativas al centro del elemento (-0.5 a 0.5)
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const xPct = mouseX / width;
      const yPct = mouseY / height;

      // Rotación 3D: el movimiento vertical inclina rotateX y el horizontal rotateY
      const rotateX = ((yPct - 0.5) * -2 * maxTilt).toFixed(2);
      const rotateY = ((xPct - 0.5) * 2 * maxTilt).toFixed(2);

      setTransform(
        `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`
      );

      if (glare) {
        setGlarePos({
          x: Math.round(xPct * 100),
          y: Math.round(yPct * 100),
          opacity: 0.35,
        });
      }
    },
    [maxTilt, perspective, scale, glare]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform(`perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-3d-wrapper ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: isHovered ? "transform 0.08s ease-out" : "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformStyle: "preserve-3d",
        willChange: "transform",
        position: "relative",
        ...style,
      }}
      {...props}
    >
      {children}

      {glare && (
        <div
          className="tilt-3d-glare"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            borderRadius: "inherit",
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 70%)`,
            opacity: glarePos.opacity,
            transition: isHovered ? "opacity 0.15s ease" : "opacity 0.5s ease",
            zIndex: 10,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
