import { motion } from "motion/react";
import { useEffect, useState, useRef } from "react";

type Platform = "kick" | "twitch";

export function LivePlayers() {
  const [active, setActive] = useState<Platform>("kick");
  const [twitchSrc, setTwitchSrc] = useState("");
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = window.location.hostname || "localhost";
    setTwitchSrc(`https://player.twitch.tv/?channel=pipa_arg&parent=${encodeURIComponent(parent)}&autoplay=false&muted=true`);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px 0px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="live-stage" ref={containerRef}>
      <div className="live-stage-top">
        <div>
          <span className="live-pill"><i aria-hidden="true" /> PLAYER OFICIAL</span>
          <p>Cambiá de plataforma sin salir de la web.</p>
        </div>
        <div className="platform-switch" role="tablist" aria-label="Elegir plataforma de stream">
          {(["kick", "twitch"] as Platform[]).map((platform) => (
            <button
              key={platform}
              type="button"
              role="tab"
              aria-selected={active === platform}
              onClick={() => setActive(platform)}
              className={active === platform ? "is-active" : ""}
            >
              {active === platform && <motion.span layoutId="platform-active" transition={{ type: "spring", stiffness: 430, damping: 34 }} />}
              <i aria-hidden="true" /> {platform}
            </button>
          ))}
        </div>
      </div>

      <div className="player-shell">
        <motion.div
          className="player-glow"
          animate={{ x: active === "kick" ? "-18%" : "58%" }}
          transition={{ type: "spring", stiffness: 100, damping: 22 }}
          aria-hidden="true"
        />
        <div className={`player-frame ${active === "kick" ? "is-visible" : ""}`} aria-hidden={active !== "kick"}>
          {inView ? (
            <iframe
              src="https://player.kick.com/pipa_arg?autoplay=false&muted=true"
              title="Stream de PIPAA en Kick"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : <div className="player-loading">Preparando Kick…</div>}
        </div>
        <div className={`player-frame ${active === "twitch" ? "is-visible" : ""}`} aria-hidden={active !== "twitch"}>
          {inView && twitchSrc ? (
            <iframe
              src={twitchSrc}
              title="Stream de PIPAA en Twitch"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : <div className="player-loading">Preparando Twitch…</div>}
        </div>
        <div className="player-corners" aria-hidden="true"><i /><i /><i /><i /></div>
      </div>

      <div className="live-stage-bottom">
        <div><small>HORARIO ARGENTINA</small><strong>15:00 — 00:00</strong></div>
        <div><small>CANAL ACTIVO</small><strong>{active.toUpperCase()} · PIPA_ARG</strong></div>
        <a href={active === "kick" ? "https://kick.com/pipa_arg" : "https://www.twitch.tv/pipa_arg"} target="_blank" rel="noreferrer">
          Abrir en {active} <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
