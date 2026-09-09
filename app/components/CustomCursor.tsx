"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseenter", onMouseEnter);
      document.addEventListener("mouseleave", onMouseLeave);
      document.addEventListener("mousedown", onMouseDown);
      document.addEventListener("mouseup", onMouseUp);
    };

    const removeEventListeners = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const onMouseDown = () => {
      setClicked(true);
    };

    const onMouseUp = () => {
      setClicked(false);
    };

    const onMouseLeave = () => {
      setHidden(true);
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    const handleLinkHoverEvents = () => {
      document.querySelectorAll("a, button, input, textarea, [data-cursor-pointer]").forEach((el) => {
        el.addEventListener("mouseenter", () => setLinkHovered(true));
        el.addEventListener("mouseleave", () => setLinkHovered(false));
      });
    };

    addEventListeners();
    handleLinkHoverEvents();

    const interval = setInterval(handleLinkHoverEvents, 2000);

    return () => {
      removeEventListeners();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
      setHidden(true);
    }
  }, []);

  if (hidden) return null;

  return (
    <>
      <motion.div
        className={`custom-cursor-dot ${clicked ? "is-clicked" : ""} ${linkHovered ? "is-hovered" : ""}`}
        animate={{
          x: position.x - 4,
          y: position.y - 4,
          scale: clicked ? 0.8 : linkHovered ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 1000, damping: 40, mass: 0.1 }}
      />
      <motion.div
        className={`custom-cursor-ring ${clicked ? "is-clicked" : ""} ${linkHovered ? "is-hovered" : ""}`}
        animate={{
          x: position.x - 20,
          y: position.y - 20,
          scale: clicked ? 1.5 : linkHovered ? 1.2 : 1,
          opacity: clicked ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 20, mass: 0.5 }}
      >
        <div className="cross-t" />
        <div className="cross-b" />
        <div className="cross-l" />
        <div className="cross-r" />
      </motion.div>
    </>
  );
}
