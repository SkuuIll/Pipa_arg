import { MotionController } from "./MotionController";
import { ExperienceLayer } from "./ExperienceLayer";
import { LivePlayers } from "./LivePlayers";

const socials = [
  { name: "Twitch", handle: "pipa_arg", href: "https://www.twitch.tv/pipa_arg", tag: "EN VIVO" },
  { name: "Kick", handle: "pipa_arg", href: "https://kick.com/pipa_arg", tag: "EN VIVO" },
  { name: "YouTube", handle: "@PIPAArg", href: "https://www.youtube.com/@PIPAArg", tag: "VIDEOS" },
  { name: "TikTok", handle: "@pipa_arg", href: "https://www.tiktok.com/@pipa_arg", tag: "CLIPS" },
  { name: "X", handle: "@Pipa_arg", href: "https://x.com/Pipa_arg", tag: "UPDATES" },
  { name: "Instagram", handle: "@rafa.ruppel", href: "https://www.instagram.com/rafa.ruppel", tag: "COMUNIDAD" },
];

const career = [
  { year: "2020", team: "TEAM SINGULARITY", text: "El salto a la escena profesional de PUBG y el inicio de una carrera competitiva internacional." },
  { year: "2024", team: "BESTIA", text: "Parte del roster fundacional de PUBG de la organización argentina." },
  { year: "2024—25", team: "TOYO ESPORTS", text: "Una etapa clave en el circuito de Américas y la clasificación al Esports World Cup." },
  { year: "2025", team: "+55 ESPORTS", text: "Competencia al máximo nivel regional con uno de los equipos partner de Américas." },
  { year: "2026", team: "BESTIA + ARGENTINA", text: "Regreso a BESTIA, top 8 en PAS 1 y quinto puesto mundial con la Selección Argentina en PNC." },
];

const setup = [
  { label: "PROCESADOR", value: "Ryzen 7 7800X3D" },
  { label: "GRÁFICA", value: "PNY XLR8 RTX 3070" },
  { label: "MEMORIA", value: "32GB DDR5 · 6000MHz" },
  { label: "MOUSE", value: "Logitech G Pro X Superlight" },
  { label: "SENSIBILIDAD", value: "400 DPI" },
  { label: "AUDIO", value: "Shure SE215" },
];

export default function Home() {
  return (
    <div className="site-shell">
      <ExperienceLayer />
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="PIPAA — volver al inicio">
          <span>PIPA</span><i aria-hidden="true" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#historia">Historia</a>
          <a href="#argentina">Argentina</a>
          <a href="#setup">Setup</a>
          <a href="#comunidad">Comunidad</a>
        </nav>
        <a className="nav-live" href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer">
          <span aria-hidden="true" /> Ver stream
        </a>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow"><span>ARG</span> PUBG PRO PLAYER · STREAMER</p>
            <h1>
              <span>NO ES SOLO</span>
              <span className="accent-word">JUGAR.</span>
              <span>ES COMPETIR.</span>
            </h1>
            <p className="hero-lede">
              Soy PIPAA. Jugador profesional de PUBG, creador de contenido y parte de la Selección Argentina. Todos los días, la misma misión: competir, mejorar y pasarla bien con la Panza Army.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer">
                <span className="play" aria-hidden="true">▶</span> Mirá el stream
              </a>
              <a className="button button-ghost" href="#historia">Conocé mi carrera <span aria-hidden="true">↓</span></a>
            </div>
            <div className="schedule">
              <span className="pulse" aria-hidden="true" />
              <div><b>STREAM TODOS LOS DÍAS</b><small>15:00 — 00:00 · ARG</small></div>
            </div>
          </div>

          <div className="hero-visual" aria-label="PIPAA, jugador profesional y creador de Panza Army">
            <img src="/pipa-banner.png" alt="PIPAA sonriendo con la indumentaria de Panza Army" />
            <div className="hero-badge">
              <small>PUBG NATIONS CUP 2026</small>
              <strong>#05</strong>
              <span>DEL MUNDO</span>
            </div>
            <div className="vertical-type" aria-hidden="true">PIPAA</div>
          </div>
        </section>

        <div className="ticker" aria-label="Resumen de perfil">
          <div className="ticker-track">
            <div className="ticker-group">
              <span>ARGENTINA</span><i>✦</i><span>PRO PLAYER</span><i>✦</i><span>CREADOR</span><i>✦</i><span>PANZA ARMY</span><i>✦</i>
            </div>
            <div className="ticker-group" aria-hidden="true">
              <span>ARGENTINA</span><i>✦</i><span>PRO PLAYER</span><i>✦</i><span>CREADOR</span><i>✦</i><span>PANZA ARMY</span><i>✦</i>
            </div>
          </div>
        </div>

        <section className="intro section-grid" id="historia" data-reveal>
          <div className="section-kicker"><span>01</span> PERFIL</div>
          <div className="intro-main">
            <p className="eyebrow">DE PUNTA ALTA AL MUNDO</p>
            <h2>CREADOR POR PASIÓN.<br /><em>COMPETIDOR</em> POR NATURALEZA.</h2>
            <p className="section-copy">Leonardo Rafael Ruppel, PIPAA para todos, convirtió años de alto rendimiento en una identidad que va más allá del servidor. La exigencia de un profesional, la cercanía de un stream entre amigos y una comunidad argentina que acompaña cada partida.</p>
          </div>
          <div className="facts">
            <article data-reveal><strong>5°</strong><span>PNC 2026<br />con Argentina</span></article>
            <article data-reveal><strong>6+</strong><span>Años en la<br />escena pro</span></article>
            <article data-reveal><strong>9h</strong><span>De stream<br />cada día</span></article>
          </div>
        </section>

        <section className="career section-grid" aria-labelledby="career-title" data-reveal>
          <div className="section-kicker"><span>02</span> TRAYECTORIA</div>
          <div className="career-head">
            <h2 id="career-title">UNA CARRERA<br />EN <em>PRIMERA PERSONA.</em></h2>
            <p>De los primeros torneos a representar al país en Seúl. Equipos, mapas y momentos que construyeron el camino.</p>
          </div>
          <ol className="timeline">
            {career.map((item, index) => (
              <li key={item.year} data-reveal>
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-dot"><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className="timeline-body"><h3>{item.team}</h3><p>{item.text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="argentina" id="argentina" data-reveal>
          <div className="argentina-photo">
            <img src="/pipa-argentina-2026.jpg" alt="PIPAA en el anuncio oficial de la Selección Argentina para PUBG Nations Cup 2026" />
            <div className="photo-stamp"><span>SEOUL</span><strong>2026</strong></div>
          </div>
          <div className="argentina-copy">
            <p className="eyebrow sky">SELECCIÓN ARGENTINA · PNC 2026</p>
            <h2>LA CELESTE Y BLANCA<br />ENTRE LAS <em>MEJORES.</em></h2>
            <p>Argentina cerró la PUBG Nations Cup 2026 en el quinto puesto mundial: 101 puntos, 71 eliminaciones y una victoria que dejó al equipo entre la élite global.</p>
            <div className="result-grid">
              <div data-reveal><small>POSICIÓN</small><strong>#5</strong></div>
              <div data-reveal><small>PUNTOS</small><strong>101</strong></div>
              <div data-reveal><small>ELIMINACIONES</small><strong>71</strong></div>
              <div data-reveal><small>WWCD</small><strong>1</strong></div>
            </div>
            <a className="text-link sky" href="https://pubgesports.com/en/tournament/165" target="_blank" rel="noreferrer">Ver resultado oficial <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="stream-section section-grid" id="comunidad" data-reveal>
          <div className="section-kicker"><span>03</span> EN VIVO</div>
          <div className="live-heading" data-reveal>
            <div>
              <p className="eyebrow">TRANSMISIÓN EN DIRECTO</p>
              <h2>MIRALO DONDE<br /><em>VOS ELIJAS.</em></h2>
            </div>
            <p>El directo completo de PIPAA integrado en la web. Elegí Kick o Twitch, activá el sonido y entrá a la partida.</p>
          </div>
          <LivePlayers />
          <div className="community-runner" data-reveal>
            <img src="/pipa-avatar.webp" alt="Logo de PIPAA y Panza Army" />
            <div><small>LA COMUNIDAD</small><strong>PANZA ARMY</strong><p>Rankeds, scrims, torneos, jugadas imposibles y esa cuota de caos que solo entiende la comunidad.</p></div>
            <div className="runner-rings" aria-hidden="true"><i /><i /><i /></div>
          </div>
        </section>

        <section className="setup section-grid" id="setup" data-reveal>
          <div className="section-kicker"><span>04</span> SETUP</div>
          <div className="setup-heading">
            <div><p className="eyebrow">HARDWARE DE COMPETENCIA</p><h2>PRECISIÓN EN<br />CADA <em>DETALLE.</em></h2></div>
            <p>El equipo con el que PIPAA entrena, compite y transmite todos los días.</p>
          </div>
          <div className="setup-grid">
            {setup.map((item, index) => (
              <article key={item.label} data-reveal>
                <small>{String(index + 1).padStart(2, "0")} / {item.label}</small>
                <strong>{item.value}</strong>
                <span aria-hidden="true">＋</span>
              </article>
            ))}
          </div>
          <a className="text-link" href="https://specs.gg/PIPAA" target="_blank" rel="noreferrer">Ver configuración completa <span aria-hidden="true">↗</span></a>
        </section>

        <section className="social-section" data-reveal>
          <div className="social-intro" data-reveal>
            <p className="eyebrow">SEGUÍ LA JUGADA</p>
            <h2>TODO PIPAA.<br /><em>EN UN SOLO LUGAR.</em></h2>
          </div>
          <div className="social-list">
            {socials.map((social, index) => (
              <a key={social.name} href={social.href} target="_blank" rel="noreferrer" data-reveal>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{social.name}</span>
                <b>{social.handle}</b>
                <i>{social.tag}</i>
                <strong aria-hidden="true">↗</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="contact" data-reveal>
          <p className="eyebrow">MARCAS · PRENSA · COLABORACIONES</p>
          <h2>¿HACEMOS<br /><em>EQUIPO?</em></h2>
          <p>Para propuestas comerciales, campañas, eventos y oportunidades competitivas.</p>
          <a className="button button-primary" href="https://x.com/Pipa_arg" target="_blank" rel="noreferrer">Hablemos <span aria-hidden="true">↗</span></a>
          <div className="contact-outline" aria-hidden="true">PIPAA</div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#inicio" aria-label="PIPAA — volver al inicio"><span>PIPA</span><i aria-hidden="true" /></a>
        <p>Jugador profesional de PUBG · Creador de contenido<br />Punta Alta, Argentina</p>
        <p className="footer-note">© 2026 PIPAA<br />Diseñado para la Panza Army.</p>
      </footer>
      <nav className="mobile-dock" aria-label="Navegación móvil">
        <a href="#historia"><span>01</span>Perfil</a>
        <a href="#argentina"><span>02</span>Argentina</a>
        <a href="#setup"><span>03</span>Setup</a>
        <a href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer"><i aria-hidden="true" />Live</a>
      </nav>
      <MotionController />
    </div>
  );
}
