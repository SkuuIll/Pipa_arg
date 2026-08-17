import { useState, useEffect } from "react";
import { MotionController } from "./MotionController";
import { ExperienceLayer } from "./ExperienceLayer";
import { LivePlayers } from "./LivePlayers";
import { LocalTime } from "./LocalTime";
import { StatsCounter } from "./StatsCounter";
import {
  getSetupIcon,
  RifleIcon,
  TrophyIcon,
  CrosshairIcon,
  ChevronDownIcon,
  DiscordIcon,
  CopyIcon,
  CheckIcon,
  SparklesIcon,
} from "./SetupIcons";

const socials = [
  { name: "Twitch", handle: "pipa_arg", href: "https://www.twitch.tv/pipa_arg", tag: "EN VIVO" },
  { name: "Kick", handle: "pipa_arg", href: "https://kick.com/pipa_arg", tag: "EN VIVO" },
  { name: "Discord", handle: "discord.gg/rgzZ3Kv", href: "https://discord.gg/rgzZ3Kv", tag: "COMUNIDAD" },
  { name: "YouTube", handle: "@PIPAArg", href: "https://www.youtube.com/@PIPAArg", tag: "VIDEOS" },
  { name: "TikTok", handle: "@pipa_arg", href: "https://www.tiktok.com/@pipa_arg", tag: "CLIPS" },
  { name: "X", handle: "@Pipa_arg", href: "https://x.com/Pipa_arg", tag: "UPDATES" },
  { name: "Instagram", handle: "@rafa.ruppel", href: "https://www.instagram.com/rafa.ruppel", tag: "COMUNIDAD" },
];

const career = [
  { year: "2018—19", team: "LATIN DOMINUS · HAWKS", text: "Las primeras formaciones competitivas y el origen de un nombre que después quedaría instalado en la escena regional.", tag: "ORIGEN COMPETITIVO" },
  { year: "2020", team: "TEAM SINGULARITY", text: "El salto a una estructura internacional y a los torneos que conectaron Latinoamérica con el circuito de Américas.", tag: "DEBUT INTERNACIONAL" },
  { year: "2020—21", team: "LATIN DOMINUS", text: "Una segunda etapa para consolidar identidad, química y experiencia en el nuevo ecosistema continental.", tag: "CIRCUITO LATINOAMERICANO" },
  { year: "2021—24", team: "SYNERGY ESPORTS", text: "Casi tres años de continuidad, finales continentales y una de las etapas más extensas de toda su carrera.", tag: "ETAPA MÁS EXTENSA" },
  { year: "2024", team: "BESTIA", text: "Parte del primer roster de PUBG de la organización argentina antes de iniciar una nueva etapa regional.", tag: "ORGANIZACIÓN ARGENTINA" },
  { year: "2024—25", team: "TOYO ESPORTS", text: "PUBG Americas Series 4 y 5, junto con una de sus campañas más fuertes dentro del archivo estadístico oficial.", tag: "PUBG AMERICAS SERIES" },
  { year: "2025—26", team: "+55 ESPORTS", text: "Competencia en PUBG Americas Series 6 y Masters West con una formación sudamericana de experiencia internacional.", tag: "CIRCUITO DE AMÉRICAS" },
  { year: "2026", team: "BESTIA · ARGENTINA", text: "Octavo puesto en PUBG Americas Series 1 y quinto lugar mundial con Argentina en la Nations Cup de Seúl.", tag: "TOP 5 MUNDIAL" },
];

const pncHistory = [
  { year: "2022", edition: "PNC BANGKOK", desc: "Debut de PIPAA representando a Argentina en el certamen de naciones más prestigioso de PUBG Esports.", tag: "DEBUT SELECCIÓN" },
  { year: "2024", edition: "PNC SEÚL", desc: "Segunda convocatoria internacional para medirse contra las 16 mejores selecciones del planeta en Corea del Sur.", tag: "COREA DEL SUR" },
  { year: "2026", edition: "PNC SEÚL · #5", desc: "Campaña histórica: 101 puntos, 71 eliminaciones, 1 victoria WWCD y consagración en el Top 5 Mundial.", tag: "TOP 5 MUNDIAL" },
];

const performance = [
  { year: "21", event: "PCS 4", value: 249.56, detail: "PCS 4 Americas · Latin Dominus" },
  { year: "22", event: "PCS 7", value: 277.77, detail: "PCS 7 Americas · Synergy Esports" },
  { year: "23", event: "PAS 2", value: 234.25, detail: "PUBG Americas Series 2 · Synergy" },
  { year: "24", event: "PAS 3", value: 169.54, detail: "PUBG Americas Series 3 · Bestia" },
  { year: "24", event: "PAS 4", value: 200.01, detail: "PUBG Americas Series 4 · Toyo Esports" },
  { year: "25", event: "PAS 5", value: 227.57, detail: "PUBG Americas Series 5 · Toyo Esports" },
  { year: "25", event: "EWC Q", value: 187.66, detail: "Esports World Cup Qualifier · +55" },
  { year: "25", event: "PAS 6", value: 138.24, detail: "PUBG Americas Series 6 · +55 Esports" },
];

const officialTotals = [
  { value: "378", label: "PARTIDAS", detail: "registradas" },
  { value: "356", label: "ELIMINACIONES", detail: "75 headshots" },
  { value: "73.084", label: "DAÑO", detail: "acumulado" },
  { value: "214", label: "ASISTENCIAS", detail: "en 12 torneos" },
];

const weaponsArsenal = [
  {
    name: "BERYL M762",
    category: "ASSAULT RIFLE · 7.62MM",
    role: "Arma Insignia Principal",
    desc: "Su fusil de asalto preferido para duelos competitivos. Alto daño por disparo complementado con su multiplicador vertical 1.10 para un control de retroceso quirúrgico a media distancia.",
    highlight: "Máximo DPS en duelos 1v1",
  },
  {
    name: "MINI 14",
    category: "DMR · 5.56MM",
    role: "Tirador Designado Primario",
    desc: "Proyectiles de alta velocidad (990 m/s) y bajo retroceso horizontal. La herramienta de PIPAA para castigar rotaciones enemigas y conseguir derribos a más de 300 metros.",
    highlight: "Velocidad de bala y cadencia",
  },
  {
    name: "SLR",
    category: "DMR · 7.62MM",
    role: "Tirador Pesado Alternativo",
    desc: "Elevado poder de parada con capacidad para quebrar cascos de nivel 2 con dos impactos precisos. Utilizado para controlar líneas de tiro cerradas y áreas de roca.",
    highlight: "Alto daño por impacto",
  },
];

const inGameSettings = [
  { label: "SENSIBILIDAD GENERAL", value: "50", note: "Equilibrio entre giros 180° y precisión" },
  { label: "SENSIBILIDAD VERTICAL", value: "1.10", note: "Compensación óptima para spray 7.62mm" },
  { label: "SENSIBILIDAD ADS (APUNTAR)", value: "39", note: "Micro-ajuste milimétrico en mirillas" },
  { label: "DPI DE MOUSE", value: "400 DPI", note: "1000 Hz Polling Rate · G Pro X" },
  { label: "CAMPO DE VISIÓN (FOV)", value: "94 FOV", note: "Balance entre ángulo visual y tamaño de blancos" },
  { label: "RESOLUCIÓN Y MODO", value: "1920 × 1080", note: "16:9 Nativo · Pantalla Completa (Fullscreen)" },
  { label: "TEXTURAS GRÁFICAS", value: "ULTRA", note: "Máxima definición de siluetas enemigas" },
  { label: "SOMBRAS / EFECTOS / FOLLAJE", value: "MUY BAJO", note: "Máximos FPS competitivos y claridad" },
];

const faqs = [
  {
    q: "¿Quién es PIPAA?",
    a: "PIPAA (Pipa_ARG) es un jugador profesional argentino de PUBG: BATTLEGROUNDS y streamer, referente de la comunidad Panza Army y representante de la Selección Argentina en la PUBG Nations Cup.",
  },
  {
    q: "¿En qué torneos representó a la Selección Argentina?",
    a: "Representó a Argentina en 3 ediciones del PUBG Nations Cup (PNC 2022, PNC 2024 y PNC 2026 en Seúl, Corea del Sur), logrando el histórico 5.° puesto mundial con 101 puntos, 71 eliminaciones y 1 Chicken Dinner (WWCD).",
  },
  {
    q: "¿Qué hardware y periféricos utiliza?",
    a: "Compite con un setup Dual PC: PC Gaming con AMD Ryzen 7 7800X3D, Mother B650M Aorus Elite AX WiFi, PNY XLR8 RTX 3070, 32GB RAM Corsair Dominator Platinum 6000MHz DDR5, Watercooling Corsair iCUE Link Titan 360 RX RGB, Fuente Aorus P850W Gold y almacenamiento SSD NVMe + HDD. Para transmisión utiliza una PC Streaming dedicada con Intel Core i7 8700, GTX 1070 Ti y 16GB RAM. En periféricos juega a 400 DPI con Logitech G Pro X y auriculares in-ear Shure SE215.",
  },
  {
    q: "¿Cómo apoyar a PIPAA con su código de creador PUBG Partner?",
    a: "Al comprar G-Coins o cualquier ítem dentro de PUBG: BATTLEGROUNDS o en accounts.krafton.com/creator-code, ingresá el código de creador PIPAA. De esa manera, un porcentaje de cada compra va directamente a apoyar su carrera competitiva y sus streams.",
  },
  {
    q: "¿Cuál es su horario de streaming y cómo sumarse a la Panza Army?",
    a: "Transmite todos los días habitualmente entre las 15:00 y las 00:00 (hora de Argentina) en Kick y Twitch (canal pipa_arg). Las partidas comunitarias, rankeds, scrims y anuncios se coordinan en el servidor oficial de Discord (discord.gg/rgzZ3Kv).",
  },
];

const sourceLinks = [
  { index: "01", title: "PERFIL OFICIAL", meta: "PUBG ESPORTS · PLAYER 440", href: "https://pubgesports.com/en/players/440" },
  { index: "02", title: "CÓDIGO DE CREADOR", meta: "KRAFTON PARTNER · CÓDIGO PIPAA", href: "https://accounts.krafton.com/creator-code" },
  { index: "03", title: "POV PNC 2026", meta: "PUBG ESPORTS · KICK OFICIAL", href: "https://pubgesports.com/pt-br/news/10178" },
  { index: "04", title: "HISTORIAL DE EQUIPOS", meta: "ESPORTS CHARTS · PIPAA", href: "https://escharts.com/players/pipaa" },
  { index: "05", title: "PAS 1 · 2026", meta: "PUBG AMERICAS · #8 BESTIA", href: "https://liquipedia.net/pubg/PUBG_Americas_Series/2026/1" },
];

const setupGaming = [
  { label: "PROCESADOR", value: "Ryzen 7 7800X3D", sub: "8C/16T · 3D V-Cache High FPS" },
  { label: "MOTHERBOARD", value: "B650M AORUS ELITE AX WIFI", sub: "PCIe 5.0 · Wi-Fi 6E · M-ATX" },
  { label: "PLACA DE VIDEO", value: "PNY XLR8 RTX 3070", sub: "8GB GDDR6 · Ray Tracing" },
  { label: "MEMORIA RAM", value: "Corsair Dominator Platinum", sub: "32GB (2x16GB) 6000MHz DDR5" },
  { label: "REFRIGERACIÓN", value: "Corsair iCUE Link Titan 360 RX RGB", sub: "Líquida AIO 360mm Triple Fan" },
  { label: "FUENTE DE PODER", value: "Aorus P850W", sub: "80 Plus Gold Modular" },
  { label: "ALMACENAMIENTO", value: "1TB SSD + 120GB SSD + 2TB HDD", sub: "NVMe Ultra Speed + Archivo" },
];

const setupStreaming = [
  { label: "PROCESADOR", value: "Intel Core i7 8700", sub: "6C/12T · Dedicated Stream Encoder" },
  { label: "PLACA DE VIDEO", value: "NVIDIA GTX 1070 Ti", sub: "8GB GDDR5 · NVENC Streaming" },
  { label: "MEMORIA RAM", value: "16GB (2x8GB) 3600MHz", sub: "Dual Channel High Frequency" },
  { label: "SISTEMA STREAMING", value: "Captura Dual PC OBS", sub: "Encoding dedicado sin pérdida de FPS" },
  { label: "REFRIGERACIÓN & PSU", value: "Refrigeración & Fuente Certificada", sub: "Estabilidad 24/7 en transmisiones" },
  { label: "ALMACENAMIENTO", value: "SSD Alta Velocidad", sub: "Buffer & Grabación de clips" },
];

const setupGear = [
  { label: "MOUSE", value: "Logitech G Pro X Super Strike", sub: "Hero 25K · Wireless 1000Hz" },
  { label: "AURICULARES", value: "Shure SE215", sub: "Sound Isolating In-Ear Monitores" },
  { label: "SENSIBILIDAD", value: "400 DPI · Vert 1.10", sub: "General 50 · ADS 39" },
  { label: "MONITOR", value: "Fast IPS 240Hz / 1ms", sub: "Tasa de refresco competitiva" },
  { label: "TECLADO", value: "Mecánico Esports RGB", sub: "Switches ultrarrápidos" },
  { label: "MICRÓFONO", value: "Micrófono Profesional Broadcast", sub: "Filtro antipop & brazo articulado" },
];

const tickerPhrases = [
  "ARGENTINA",
  "PRO PLAYER",
  "PUBG PARTNER",
  "CÓDIGO: PIPAA",
  "CREADOR",
  "PANZA ARMY",
  "PUBG ESPORTS",
  "PNC 2026",
  "TOP 5 MUNDIAL",
  "DISCORD COMUNIDAD",
  "SELECCIÓN ARGENTINA",
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("inicio");
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeSetupTab, setActiveSetupTab] = useState<"gaming" | "streaming" | "gear">("gaming");
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText("PIPAA");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2400);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      const sections = ["inicio", "historia", "argentina", "stats", "trayectoria", "arsenal", "setup", "comunidad", "redes", "faq", "archivo", "contacto"];
      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveNav(sections[i]);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#inicio">Saltar al contenido</a>
      <ExperienceLayer />

      <header className={`topbar ${isScrolled ? "is-scrolled" : ""}`}>
        <a className="brand" href="#inicio" aria-label="PIPAA — volver al inicio">
          <img src="./pipaa-logo.svg" alt="PIPAA" className="brand-logo" width="120" height="48" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#historia" className={activeNav === "historia" ? "is-active" : ""}>Historia</a>
          <a href="#argentina" className={activeNav === "argentina" ? "is-active" : ""}>Argentina</a>
          <a href="#stats" className={activeNav === "stats" ? "is-active" : ""}>Datos</a>
          <a href="#trayectoria" className={activeNav === "trayectoria" ? "is-active" : ""}>Trayectoria</a>
          <a href="#arsenal" className={activeNav === "arsenal" ? "is-active" : ""}>Arsenal</a>
          <a href="#setup" className={activeNav === "setup" ? "is-active" : ""}>Setup</a>
          <a href="#comunidad" className={activeNav === "comunidad" ? "is-active" : ""}>En Vivo</a>
          <a href="#faq" className={activeNav === "faq" ? "is-active" : ""}>FAQ</a>
        </nav>
        <a className="nav-live" href="#comunidad">
          <span className="live-indicator-dot" aria-hidden="true" />
          <span className="nav-live-text">Ver stream</span>
        </a>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow">
              <span>ARG</span> PUBG PRO PLAYER · STREAMER
            </p>
            <h1>
              <span>NO ES SOLO</span>
              <span className="accent-word">JUGAR.</span>
              <span>ES COMPETIR.</span>
            </h1>
            <p className="hero-lede">
              Soy PIPAA. Jugador profesional de PUBG, representante de la Selección Argentina y streamer. Todos los días la misma misión: competir, mejorar y compartir cada partida junto a la Panza Army.
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#comunidad">
                <span className="play" aria-hidden="true">▶</span> Ver directo acá
              </a>
              <a className="button button-ghost" href="#historia">
                Conocé mi carrera <span aria-hidden="true">↓</span>
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

          <div className="hero-visual" aria-label="PIPAA, jugador profesional y creador de Panza Army">
            <div className="hero-visual-frame">
              <img
                src="./pipa-banner.webp"
                alt="PIPAA sonriendo con la indumentaria de Panza Army"
                width="1600"
                height="640"
                fetchPriority="high"
              />
              <div className="hero-visual-glow" aria-hidden="true" />
            </div>
            <div className="hero-badge shimmer-badge">
              <div className="badge-glow-edge" aria-hidden="true" />
              <small>PUBG NATIONS CUP 2026</small>
              <strong>#05</strong>
              <span>DEL MUNDO</span>
            </div>
            <div className="vertical-type" aria-hidden="true">PIPAA</div>
          </div>
        </section>

        {/* ── Ticker Marquee ── */}
        <div className="ticker" aria-label="Resumen de perfil">
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

        {/* ── 01. Perfil / Historia ── */}
        <section className="intro section-grid" id="historia" data-reveal>
          <div className="section-kicker"><span>01</span> PERFIL</div>
          <div className="intro-main">
            <p className="eyebrow">DE PUNTA ALTA AL MUNDO</p>
            <h2>CREADOR POR PASIÓN.<br /><em>COMPETIDOR</em> POR NATURALEZA.</h2>
            <p className="section-copy">
              Más de 7 años de alto rendimiento competitivo en la escena sudamericana e internacional. Con pasos por escuadras como Synergy, Team Singularity, BESTIA, Toyo y +55, combinando la disciplina del máximo nivel con las transmisiones diarias junto a la Panza Army.
            </p>
          </div>
          <div className="facts">
            <article data-reveal>
              <strong>5°</strong>
              <span>PNC 2026 Seúl<br />con Argentina</span>
            </article>
            <article data-reveal>
              <strong>7+</strong>
              <span>Años en la<br />escena pro</span>
            </article>
            <article data-reveal>
              <strong>9h</strong>
              <span>De stream<br />cada día</span>
            </article>
          </div>
        </section>

        {/* ── 02. Selección Argentina ── */}
        <section className="argentina" id="argentina" data-reveal>
          <div className="argentina-photo">
            <img
              src="./pipa-argentina-2026.jpg"
              alt="PIPAA en el anuncio oficial de la Selección Argentina para PUBG Nations Cup 2026"
              width="960"
              height="1200"
              loading="lazy"
              decoding="async"
            />
            <div className="photo-stamp">
              <span>SEÚL</span>
              <strong>2026</strong>
            </div>
          </div>
          <div className="argentina-copy">
            <p className="eyebrow sky">SELECCIÓN ARGENTINA · PNC 2026</p>
            <h2>LA CELESTE Y BLANCA<br />ENTRE LAS <em>MEJORES.</em></h2>
            <p>
              Argentina cerró la PUBG Nations Cup 2026 en el quinto puesto mundial: 101 puntos, 71 eliminaciones y una victoria que dejó al equipo entre la élite global. Representó al país en las ediciones 2022, 2024 y 2026 de la Nations Cup.
            </p>
            <div className="result-grid">
              <div data-reveal>
                <small>POSICIÓN</small>
                <strong>#5</strong>
              </div>
              <div data-reveal>
                <small>PUNTOS</small>
                <StatsCounter value="101" />
              </div>
              <div data-reveal>
                <small>ELIMINACIONES</small>
                <StatsCounter value="71" />
              </div>
              <div data-reveal className="result-wwcd">
                <small>WWCD</small>
                <div className="wwcd-badge">
                  <TrophyIcon className="wwcd-trophy-svg" aria-hidden="true" />
                  <strong>1</strong>
                  <span className="wwcd-label">CHICKEN DINNER</span>
                </div>
              </div>
            </div>

            <div className="pnc-history-list" aria-label="Historial de convocatorias a la Selección Argentina">
              {pncHistory.map((item) => (
                <div key={item.year} className="pnc-history-item" data-reveal>
                  <div className="pnc-item-header">
                    <small>{item.year}</small>
                    <strong>{item.edition}</strong>
                    <span className="pnc-tag">{item.tag}</span>
                  </div>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>

            <a className="text-link sky" href="https://pubgesports.com/en/tournament/165" target="_blank" rel="noreferrer">
              Ver resultado oficial PNC 2026 <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        {/* ── 03. Data Lab ── */}
        <section className="performance section-grid" id="stats" aria-labelledby="performance-title" data-reveal>
          <div className="section-kicker"><span>03</span> DATA LAB</div>
          <div className="performance-heading">
            <div>
              <p className="eyebrow">ARCHIVO COMPETITIVO · 2021—2026</p>
              <h2 id="performance-title">LOS NÚMEROS<br />TAMBIÉN <em>JUEGAN.</em></h2>
            </div>
            <p>Doce torneos registrados por PUBG Esports cuentan otra parte de la historia: volumen, consistencia y años compitiendo contra los mejores de Américas.</p>
          </div>

          <div className="official-ledger" aria-label="Totales de los registros oficiales de PUBG Esports">
            {officialTotals.map((stat, index) => (
              <article key={stat.label} data-reveal className="ledger-card">
                <div className="ledger-corner" aria-hidden="true" />
                <small>{String(index + 1).padStart(2, "0")} / {stat.label}</small>
                <StatsCounter
                  value={stat.value}
                  className={stat.value.length > 5 ? "is-long" : undefined}
                />
                <span>{stat.detail}</span>
              </article>
            ))}
          </div>

          <div className="performance-board">
            <article className="damage-panel" data-reveal>
              <div className="panel-heading">
                <div>
                  <small>AVG. DAMAGE / MATCH</small>
                  <strong>RENDIMIENTO POR EVENTO</strong>
                </div>
                <span className="panel-meta-tag">MAX 300 DMG</span>
              </div>

              <div
                className="damage-chart"
                role="img"
                aria-label="Daño promedio por partida en ocho eventos oficiales entre 2021 y 2025"
              >
                <div className="chart-grid" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </div>
                {performance.map((entry, index) => (
                  <div
                    className={`chart-column ${hoveredBar === index ? "is-hovered" : ""}`}
                    key={`${entry.year}-${entry.event}`}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {hoveredBar === index && (
                      <div className="chart-tooltip">
                        <strong>{entry.value.toFixed(1)} DMG</strong>
                        <span>{entry.detail}</span>
                      </div>
                    )}
                    <span className="chart-value">{entry.value.toFixed(0)}</span>
                    <div className="chart-bar">
                      <i style={{ height: `${(entry.value / 300) * 100}%`, animationDelay: `${index * 90}ms` }} />
                    </div>
                    <b>{entry.event}</b>
                    <small>20{entry.year}</small>
                  </div>
                ))}
              </div>
            </article>

            <aside className="combat-profile" data-reveal>
              <div className="panel-heading">
                <div>
                  <small>COMBAT PROFILE</small>
                  <strong>PRECISIÓN + ALCANCE</strong>
                </div>
                <span className="panel-meta-tag">OFFICIAL</span>
              </div>
              <div className="combat-ring-wrapper">
                <div className="combat-ring" aria-label="21 por ciento de las eliminaciones registradas fueron headshots">
                  <div>
                    <strong>21%</strong>
                    <span>HEADSHOTS</span>
                  </div>
                </div>
                <div className="combat-ring-crosshair" aria-hidden="true" />
              </div>
              <div className="combat-split">
                <div>
                  <small>ELIMINACIONES</small>
                  <StatsCounter value="356" />
                </div>
                <div>
                  <small>HEADSHOTS</small>
                  <StatsCounter value="75" />
                </div>
              </div>
              <div className="range-record">
                <div>
                  <small>LONGEST KILL REGISTRADA</small>
                  <strong>617,9 M</strong>
                </div>
                <span><i /></span>
              </div>
            </aside>
          </div>

          <div className="data-note">
            <span>FUENTE / PUBG ESPORTS</span>
            <p>Totales calculados sobre los 12 registros publicados en el perfil oficial. No representan partidas fuera de esos eventos.</p>
            <a href="https://pubgesports.com/en/players/440" target="_blank" rel="noreferrer">
              Abrir perfil oficial ↗
            </a>
          </div>
        </section>

        {/* ── 04. Trayectoria ── */}
        <section className="career section-grid" id="trayectoria" aria-labelledby="career-title" data-reveal>
          <div className="section-kicker"><span>04</span> TRAYECTORIA</div>
          <div className="career-head">
            <h2 id="career-title">UNA CARRERA<br />EN <em>PRIMERA PERSONA.</em></h2>
            <p>De los primeros torneos a representar al país en Seúl. Equipos, mapas y momentos que construyeron el camino de uno de los jugadores más longevos y respetados de América.</p>
          </div>
          <ol className="timeline">
            {career.map((item, index) => (
              <li key={item.year} data-reveal className="timeline-item">
                <div className="timeline-year">{item.year}</div>
                <div className="timeline-dot">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="timeline-body">
                  <small>{item.tag}</small>
                  <h3>{item.team}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── 05. Arsenal ── */}
        <section className="arsenal-section section-grid" id="arsenal" data-reveal>
          <div className="section-kicker"><span>05</span> ARSENAL</div>
          <div className="arsenal-head">
            <div>
              <p className="eyebrow">LOADOUT & GUNPLAY</p>
              <h2>ARMAS DE<br /><em>ALTO IMPACTO.</em></h2>
            </div>
            <p>La combinación de armamento y control balístico que define el estilo de juego agresivo y resolutivo de PIPAA en cada rotación competitiva.</p>
          </div>

          <div className="arsenal-grid">
            {weaponsArsenal.map((weapon) => (
              <article key={weapon.name} className="weapon-card" data-reveal>
                <div className="weapon-card-header">
                  <span className="weapon-category">{weapon.category}</span>
                  <div className="weapon-icon-box">
                    <RifleIcon className="setup-svg-icon" />
                  </div>
                </div>
                <h3>{weapon.name}</h3>
                <span className="weapon-role">{weapon.role}</span>
                <p>{weapon.desc}</p>
                <div className="weapon-highlight">
                  <CrosshairIcon className="mini-icon" />
                  <span>{weapon.highlight}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 06. Setup & Config ── */}
        <section className="setup section-grid" id="setup" data-reveal>
          <div className="section-kicker"><span>06</span> SETUP & CONFIG</div>
          <div className="setup-heading">
            <div>
              <p className="eyebrow">HARDWARE COMPETITIVO · DUAL PC</p>
              <h2>PRECISIÓN EN<br />CADA <em>DETALLE.</em></h2>
            </div>
            <p>Arquitectura Dual PC calibrada para máximo rendimiento en PUBG Esports: una máquina dedicada al juego competitivo y otra para encoding de transmisión en directo.</p>
          </div>

          <div className="setup-tabs-wrapper" data-reveal>
            <div className="setup-tabs" role="tablist" aria-label="Selección de equipo hardware">
              <button
                type="button"
                role="tab"
                aria-selected={activeSetupTab === "gaming"}
                onClick={() => setActiveSetupTab("gaming")}
                className={`setup-tab-btn ${activeSetupTab === "gaming" ? "is-active" : ""}`}
              >
                <span>01</span>
                <div>
                  <strong>PC GAMING</strong>
                  <small>COMPETICIÓN & FPS</small>
                </div>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSetupTab === "streaming"}
                onClick={() => setActiveSetupTab("streaming")}
                className={`setup-tab-btn ${activeSetupTab === "streaming" ? "is-active" : ""}`}
              >
                <span>02</span>
                <div>
                  <strong>PC STREAMING</strong>
                  <small>ENCODING DUAL PC</small>
                </div>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSetupTab === "gear"}
                onClick={() => setActiveSetupTab("gear")}
                className={`setup-tab-btn ${activeSetupTab === "gear" ? "is-active" : ""}`}
              >
                <span>03</span>
                <div>
                  <strong>PERIFÉRICOS & AUDIO</strong>
                  <small>CONTROL & PRECISIÓN</small>
                </div>
              </button>
            </div>
          </div>

          <div className="setup-grid">
            {(activeSetupTab === "gaming" ? setupGaming : activeSetupTab === "streaming" ? setupStreaming : setupGear).map((item, index) => (
              <article key={`${activeSetupTab}-${item.label}-${index}`} className="setup-card">
                <div className="setup-card-header">
                  <small>{String(index + 1).padStart(2, "0")} / {item.label}</small>
                  <div className="setup-icon-wrapper">
                    {getSetupIcon(item.label)}
                  </div>
                </div>
                <div className="setup-card-body">
                  <strong>{item.value}</strong>
                  {item.sub && <span className="setup-sub">{item.sub}</span>}
                </div>
                <div className="setup-card-border-glow" aria-hidden="true" />
              </article>
            ))}
          </div>

          {/* In-Game Settings Board */}
          <div className="tactical-config-board" data-reveal>
            <div className="tactical-config-head">
              <div>
                <small>SPECS.GG VERIFIED CONFIG</small>
                <h3>AJUSTES DE JUEGO (PUBG SETTINGS)</h3>
              </div>
              <a href="https://specs.gg/PIPAA" target="_blank" rel="noreferrer" className="specs-link">
                Ver perfil en Specs.gg ↗
              </a>
            </div>
            <div className="tactical-config-grid">
              {inGameSettings.map((setting) => (
                <div key={setting.label} className="config-item">
                  <small>{setting.label}</small>
                  <strong>{setting.value}</strong>
                  <span>{setting.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 07. En Vivo & Comunidad Panza Army ── */}
        <section className="stream-section section-grid" id="comunidad" data-reveal>
          <div className="section-kicker"><span>07</span> EN VIVO</div>
          <div className="live-heading" data-reveal>
            <div>
              <p className="eyebrow">TRANSMISIÓN EN DIRECTO</p>
              <h2>MIRALO DONDE<br /><em>VOS ELIJAS.</em></h2>
            </div>
            <p>El directo completo de PIPAA integrado en la web. Elegí Kick o Twitch, activá el sonido y entrá a la partida con la comunidad de la Panza Army.</p>
          </div>

          <article className="official-pov" data-reveal>
            <div className="pov-index">POV<br /><strong>ARG</strong></div>
            <div>
              <p className="eyebrow">CANAL ELEGIDO POR PUBG ESPORTS</p>
              <h3>LA PNC 2026,<br />DESDE SUS OJOS.</h3>
            </div>
            <p>Para la Nations Cup 2026, PUBG publicó el canal de Kick de PIPAA como su transmisión POV oficial: la partida, las comunicaciones y la presión desde el lugar del jugador.</p>
            <a href="https://pubgesports.com/pt-br/news/10178" target="_blank" rel="noreferrer">
              Ver anuncio oficial <span aria-hidden="true">↗</span>
            </a>
          </article>

          <LivePlayers />

          {/* ── PUBG Partner & Creator Code Banner ── */}
          <article className="creator-code-card" data-reveal>
            <div className="creator-code-badge">
              <SparklesIcon className="creator-sparkle-icon" />
              <span>PUBG PARTNER · KRAFTON CREATOR CODE</span>
            </div>
            <div className="creator-code-content">
              <div className="creator-code-info">
                <h3>APOYÁ A PIPAA CON SU<br /><em>CÓDIGO DE CREADOR.</em></h3>
                <p>
                  Al comprar G-Coins o cualquier artículo en la tienda oficial de PUBG: BATTLEGROUNDS o en Krafton, usá el código <strong>PIPAA</strong>. Un porcentaje de tu compra apoya directamente sus directos y su carrera profesional.
                </p>
              </div>
              <div className="creator-code-action-box">
                <div className="creator-code-display">
                  <small>CÓDIGO OFICIAL</small>
                  <strong className="code-text">PIPAA</strong>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className={`button creator-copy-btn ${copiedCode ? "is-copied" : ""}`}
                  aria-label="Copiar código de creador PIPAA"
                >
                  {copiedCode ? (
                    <>
                      <CheckIcon className="btn-icon" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="btn-icon" />
                      <span>Copiar código</span>
                    </>
                  )}
                </button>
                <a
                  href="https://accounts.krafton.com/creator-code"
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary creator-redeem-btn"
                >
                  Activar en Krafton ↗
                </a>
              </div>
            </div>
          </article>

          <article className="community-feature" data-reveal>
            <div className="community-feature-media">
              <img src="./og-v2.jpg" alt="PIPAA, jugador profesional argentino de PUBG y creador de Panza Army" width="1200" height="630" loading="lazy" decoding="async" />
              <span className="community-feature-scan" aria-hidden="true" />
            </div>
            <div className="community-feature-copy">
              <div className="community-feature-label"><span>07</span> LA COMUNIDAD</div>
              <img className="community-avatar" src="./pipa-avatar.webp" alt="Logo de PIPAA y Panza Army" width="350" height="349" loading="lazy" decoding="async" />
              <div className="community-feature-title">
                <p className="eyebrow">MÁS QUE UN CHAT</p>
                <h3>PANZA<br /><em>ARMY.</em></h3>
              </div>
              <div className="community-feature-body">
                <p>Rankeds, scrims, torneos y ese caos que solamente entiende la comunidad. El punto de encuentro alrededor de PIPAA, dentro y fuera de cada partida.</p>
                <div className="community-feature-tags" aria-label="Contenido de la comunidad">
                  <span>DIRECTOS</span>
                  <span>COMPETENCIA</span>
                  <span>CLIPS</span>
                  <span>DISCORD</span>
                </div>
                <div className="community-actions">
                  <a className="community-action-discord" href="https://discord.gg/rgzZ3Kv" target="_blank" rel="noreferrer">
                    <DiscordIcon className="discord-svg" /> Unirse al Discord <span aria-hidden="true">↗</span>
                  </a>
                  <a className="text-link" href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer">
                    Entrar al directo <span aria-hidden="true">↗</span>
                  </a>
                  <a className="community-tag-link" href="https://www.twitch.tv/pipa_arg" target="_blank" rel="noreferrer">
                    Canal Twitch ↗
                  </a>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* ── 08. Redes Oficiales ── */}
        <section className="social-section" id="redes" data-reveal>
          <div className="social-intro" data-reveal>
            <p className="eyebrow">SEGUÍ LA JUGADA</p>
            <h2>TODO PIPAA.<br /><em>EN UN SOLO LUGAR.</em></h2>
          </div>
          <div className="social-list">
            {socials.map((social, index) => (
              <a key={social.name} href={social.href} target="_blank" rel="me noreferrer" aria-label={`Perfil de PIPAA en ${social.name}`} data-reveal>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{social.name}</span>
                <b>{social.handle}</b>
                <i>{social.tag}</i>
                <strong aria-hidden="true">↗</strong>
              </a>
            ))}
          </div>
        </section>

        {/* ── 09. Preguntas Frecuentes / FAQ ── */}
        <section className="faq-section section-grid" id="faq" data-reveal>
          <div className="section-kicker"><span>09</span> FAQ</div>
          <div className="faq-heading">
            <div>
              <p className="eyebrow">TODO SOBRE PIPAA</p>
              <h2>PREGUNTAS<br /><em>FRECUENTES.</em></h2>
            </div>
            <p>Detalles sobre su trayectoria, configuración competitiva, streams diarios y cómo sumarte a la comunidad Panza Army.</p>
          </div>

          <div className="faq-list" data-reveal>
            {faqs.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? "is-open" : ""}`}>
                <button
                  type="button"
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={openFaq === index}
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon className="faq-chevron" />
                </button>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── 10. Archivo de Fuentes ── */}
        <section className="archive-sources section-grid" id="archivo" aria-labelledby="sources-title" data-reveal>
          <div className="section-kicker"><span>10</span> ARCHIVO</div>
          <div className="sources-heading">
            <div>
              <p className="eyebrow">INVESTIGACIÓN ABIERTA</p>
              <h2 id="sources-title">LA HISTORIA,<br /><em>CON RESPALDO.</em></h2>
            </div>
            <p>Resultados, estadísticas y movimientos de equipos vinculados a sus registros públicos en PUBG Esports, Liquipedia y Esports Charts.</p>
          </div>
          <div className="sources-list">
            {sourceLinks.map((source) => (
              <a key={source.index} href={source.href} target="_blank" rel="noreferrer" aria-label={`Fuente: ${source.title}`} data-reveal>
                <small>{source.index}</small>
                <div>
                  <strong>{source.title}</strong>
                  <span>{source.meta}</span>
                </div>
                <b aria-hidden="true">↗</b>
              </a>
            ))}
          </div>
        </section>

        {/* ── 11. Contacto Comercial ── */}
        <section className="contact" id="contacto" data-reveal>
          <p className="eyebrow">MARCAS · PRENSA · COLABORACIONES</p>
          <h2>¿HACEMOS<br /><em>EQUIPO?</em></h2>
          <p>Para propuestas comerciales, campañas, eventos y oportunidades competitivas.</p>
          <div className="contact-card">
            <div className="contact-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </div>
            <div className="contact-card-body">
              <small>CONTACTO DIRECTO</small>
              <a href="mailto:raffitas_ruppel@hotmail.com" className="contact-mail-link">raffitas_ruppel@hotmail.com</a>
            </div>
            <a className="button button-primary contact-card-btn" href="mailto:raffitas_ruppel@hotmail.com">
              Escribime <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="contact-outline" aria-hidden="true">PIPAA</div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#inicio" aria-label="PIPAA — volver al inicio">
          <img src="./pipaa-logo.svg" alt="PIPAA" className="brand-logo" width="120" height="48" />
        </a>
        <p>PIPAA · Jugador profesional de PUBG · Streamer<br />Argentina</p>
        <p className="footer-note">© 2026 PIPAA<br />Diseñado para la Panza Army.</p>
      </footer>

      <nav className="mobile-dock" aria-label="Navegación móvil">
        <a href="#historia" className={activeNav === "historia" ? "is-active" : ""}>
          <span>01</span>Perfil
        </a>
        <a href="#argentina" className={activeNav === "argentina" ? "is-active" : ""}>
          <span>02</span>Argentina
        </a>
        <a href="#arsenal" className={activeNav === "arsenal" ? "is-active" : ""}>
          <span>03</span>Arsenal
        </a>
        <a href="#setup" className={activeNav === "setup" ? "is-active" : ""}>
          <span>04</span>Setup
        </a>
        <a href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer">
          <i aria-hidden="true" />Live
        </a>
      </nav>

      <MotionController />
    </div>
  );
}
