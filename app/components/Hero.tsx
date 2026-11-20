import { ArrowUpRight, CalendarDays, Play, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Video, VideoSnapshot } from "../../src/youtube-feed";
import { LocalTime } from "../LocalTime";
import { platformLabels, useLiveStatus } from "../useLiveStatus";
import { saturdayFor } from "../../src/argentina-date";

const tickerItems = [
  "STREAM EN VIVO",
  "KICK & TWITCH",
  "TIENDA DEL STREAM",
  "PUBG PARTNER",
  "GAMING COMPETITIVO",
  "RANKEDS PUBG",
  "GUNPLAY ARGENTINO",
  "PANZA ARMY",
];

export function Hero() {
  const status = useLiveStatus();
  const live = Boolean(status?.live.length);
  const [latest, setLatest] = useState<Video>();
  const [isSaturday, setIsSaturday] = useState(() => saturdayFor(Date.now()).isSaturday);

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      setIsSaturday(saturdayFor(Date.now()).isSaturday);
      try {
        const response = await fetch("/api/youtube", {
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)]),
        });
        if (!response.ok) return;
        const data = await response.json() as VideoSnapshot;
        if (!controller.signal.aborted) setLatest(
          data.videos?.find((video) => video.kind === "upload") ??
          data.videos?.find((video) => video.kind === "unclassified" || video.kind === "replay"),
        );
      } catch { /* Keep the last available feature through a temporary failure. */ }
    }
    void refresh();
    const timer = setInterval(refresh, 60_000);
    return () => { controller.abort(); clearInterval(timer); };
  }, []);

  const videoUrl = latest ? `https://www.youtube.com/watch?v=${latest.id}` : "/videos/";

  return (<>
    <section className="hero-immersive hero-layered channel-hero" id="inicio" aria-labelledby="home-title" data-scene="violet">
      <div className="hero-bg-grid" aria-hidden="true" />
      <div className="hero-bg-glow" aria-hidden="true" />
      <div className="hero-type-scene" aria-hidden="true">
        <div className="hero-type-perspective">
          <div className="hero-type-track">
            {[0, 1].map((copy) => <div className="hero-type-group" key={copy}>
              <span className="hero-type-word">PIPAA</span>
              <span className="hero-type-word hero-type-outline">PANZA ARMY</span>
            </div>)}
          </div>
        </div>
      </div>
      <div className="hero-orbital" aria-hidden="true">
        <i /><i /><i />
        <span>PLAYER 01 / PIPAA</span>
      </div>
      <div className="hero-portrait-stage">
        <img className="hero-portrait-studio" src="/pipaa-studio.webp"
          srcSet="/pipaa-studio-small.webp 480w, /pipaa-studio.webp 1024w"
          sizes="(max-width: 768px) 260px, 440px" width="1024" height="1536" alt="PIPAA con buzo de Panza Army" fetchPriority="high" />
      </div>
      <div className="hero-scene-fade" aria-hidden="true" />

      <div className="hero-content-layer">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">
            <span className="hero-arg-tag">ARG</span> PUBG · STREAMING · PANZA ARMY
          </p>
          <h1 id="home-title">
            <span>MUCHA</span>
            <span className="accent-word">PANZA.</span>
            <span>PURO SHOW.</span>
          </h1>
          <p className="hero-lede">
            PIPAA (Pipa_ARG) trae PUBG, rankeds y partidas competitivas, además de contenido variado de vez en cuando. Sumate al directo y a la Panza Army.
          </p>
          {live && (
            <p className="hero-live-status">
              <span aria-hidden="true" /> En vivo en {status?.live.map((platform) => platformLabels[platform]).join(" y ")}
            </p>
          )}
          <div className="hero-actions">
            <motion.a
              className="button button-primary"
              href="/directo/"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 440, damping: 28 }}
            >
              <Play size={14} fill="currentColor" aria-hidden="true" />
              <span>{live ? "Ver directo en vivo" : "Abrir sala de directo"}</span>
            </motion.a>
            {isSaturday ? (
              <motion.a
                className="button button-ghost"
                href="/directo/#diasub"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <CalendarDays size={15} aria-hidden="true" /> Día Sub
              </motion.a>
            ) : (
              <motion.a
                className="button button-ghost"
                href="/comandos/"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <ShoppingBag size={15} aria-hidden="true" /> Tienda
              </motion.a>
            )}
          </div>

          <div className="schedule">
            <span className="pulse" aria-hidden="true" />
            <div className="schedule-copy">
              <b>STREAM TODOS LOS DÍAS</b>
              <small>15:00 — 00:00 · ARG</small>
            </div>
            <span className="schedule-divider" aria-hidden="true" />
            <LocalTime />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="hero-floating-badge"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-badge shimmer-badge">
          <div className="badge-glow-edge" aria-hidden="true" />
          <small>TOP 5 MUNDIAL · PNC SEÚL</small>
          <strong>+9H</strong>
          <span>LIVE TODOS LOS DÍAS</span>
        </div>
      </motion.div>
      <div className="hero-bottom-accent" aria-hidden="true" />
    </section>

    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {[0, 1].map((copy) => (
          <div className="ticker-group" key={copy}>
            {tickerItems.map((item) => (
              <span key={`${copy}-${item}`}>
                <b>{item}</b>
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>

    {!live && latest && (
      <motion.a
        className="hero-featured-video"
        href={videoUrl}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
      >
        <img src={latest.thumbnail} alt="" width="160" height="90" loading="lazy" />
        <div><small>{latest.kind === "upload" ? "Último video" : "Reciente en YouTube"}</small><strong>{latest.title}</strong></div>
        <ArrowUpRight size={19} aria-hidden="true" />
      </motion.a>
    )}
  </>);
}
