import { ShoppingCart, Play } from "lucide-react";
import { LocalTime } from "../LocalTime";

const tickerPhrases = [
  "PANZA ARMY",
  "STREAM EN VIVO",
  "KICK & TWITCH",
  "COMANDOS TROLL",
  "TIENDA TROLL",
  "PUBG PARTNER",
  "GAMING COMPETITIVO",
  "RANKEDS PUBG",
  "GUNPLAY ARGENTINO",
];

export function Hero() {
  return (
    <>
      <section className="hero-immersive hero-layered" id="inicio" data-scene="violet">
        {/* Background Layer: Grid + Gradient */}
        <div className="hero-bg-grid" aria-hidden="true" />
        <div className="hero-bg-glow" aria-hidden="true" />

        {/* Independently animated lettering always stays behind the portrait. */}
        <div className="hero-type-scene" aria-hidden="true">
          <div className="hero-type-perspective">
            <div className="hero-type-track">
              {[0, 1].map((group) => (
                <div className="hero-type-group" key={group}>
                  <span className="hero-type-word">PIPAA</span>
                  <span className="hero-type-word hero-type-outline">PANZA ARMY</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="hero-orbital" aria-hidden="true"><i /><i /><i /><span>PLAYER 01 / PIPAA</span></div>

        {/* The silhouette mask removes the generator's opaque backdrop. */}
        <div className="hero-portrait-stage">
          <img
            src="./pipaa-front-cutout.png"
            alt="PIPAA de frente, mirando a cámara, con brazos cruzados y buzo Panza Army"
            width="1024"
            height="1536"
            fetchPriority="high"
            className="hero-portrait-cutout"
          />
        </div>
        <div className="hero-scene-fade" aria-hidden="true" />

        {/* Layer 3: Copy content on top */}
        <div className="hero-content-layer">
          <div className="hero-copy">
            <p className="eyebrow">
              <span>ARG</span> PUBG · STREAMING · PANZA ARMY
            </p>
            <h1>
              <span>MUCHA</span>
              <span className="accent-word">PANZA.</span>
              <span>PURO SHOW.</span>
            </h1>
            <p className="hero-lede">
              Rankeds intensas. Risas sin filtro. Un chat que nunca perdona. Entrá al universo de PIPAA y viví cada partida con la Panza Army.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#comunidad">
                <Play style={{ width: "14px", height: "14px", fill: "currentColor" }} />
                <span>Ver directo en vivo</span>
              </a>
              <a className="button button-ghost" href="./comandos/">
                <ShoppingCart style={{ width: "14px", height: "14px" }} />
                <span>Tienda Troll</span>
              </a>
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
          </div>
        </div>

        {/* Layer 4: Floating badge */}
        <div className="hero-floating-badge">
          <div className="hero-badge shimmer-badge">
            <div className="badge-glow-edge" aria-hidden="true" />
            <small>TOP 5 MUNDIAL · PNC SEÚL</small>
            <strong>+9H</strong>
            <span>LIVE TODOS LOS DÍAS</span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="hero-bottom-accent" aria-hidden="true" />
      </section>

      {/* ── Ticker Marquee ── */}
      <div className="ticker" aria-label="Resumen de perfil y comunidad">
        <div className="ticker-track">
          <div className="ticker-group">
            {[...tickerPhrases, ...tickerPhrases, ...tickerPhrases].map((phrase, idx) => (
              <span key={`t1-${idx}`}>
                <b>{phrase}</b>
                <i aria-hidden="true">·</i>
              </span>
            ))}
          </div>
          <div className="ticker-group" aria-hidden="true">
            {[...tickerPhrases, ...tickerPhrases, ...tickerPhrases].map((phrase, idx) => (
              <span key={`t2-${idx}`}>
                <b>{phrase}</b>
                <i aria-hidden="true">·</i>
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
