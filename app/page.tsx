import { useState, useEffect } from "react";
import { MotionController } from "./MotionController";
import { ExperienceLayer, ChapterPortal } from "./ExperienceLayer";
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
import { YouTubeFeed } from "./YouTubeFeed";
import { TiltCard3D } from "./TiltCard3D";
import { Hero } from "./components/Hero";

import {
  ShoppingCart,
  Tv,
  Radio,
  Flame,
  Trophy,
  Crosshair,
  Zap,
  Clock,
  Gamepad2,
  Sparkles,
  Play,
  User,
} from "lucide-react";

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
  { year: "2026", team: "BESTIA · SELECCIÓN ARGENTINA", text: "Quinto lugar mundial con Argentina en la Nations Cup de Seúl y consolidación total como el streamer referente de PUBG.", tag: "TOP 5 MUNDIAL & STREAM" },
];

const pncHistory = [
  { year: "2022", edition: "PNC BANGKOK", desc: "Debut de PIPAA representando a Argentina en el certamen de naciones más prestigioso de PUBG Esports.", tag: "DEBUT SELECCIÓN" },
  { year: "2024", edition: "PNC SEÚL", desc: "Segunda convocatoria internacional para medirse contra las 16 mejores selecciones del planeta en Corea del Sur.", tag: "COREA DEL SUR" },
  { year: "2026", edition: "PNC SEÚL · #5", desc: "Campaña histórica: 101 puntos, 71 eliminaciones, 1 victoria WWCD y consagración en el Top 5 Mundial.", tag: "TOP 5 MUNDIAL" },
];

const weaponsArsenal = [
  {
    name: "BERYL M762",
    category: "ASSAULT RIFLE · 7.62MM",
    role: "Arma Insignia Principal",
    desc: "Su fusil de asalto preferido para duelos competitivos y streams. Alto daño por disparo complementado con su multiplicador vertical 1.10 para un control de retroceso quirúrgico a media distancia.",
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
    q: "¿Quién es PIPAA y de qué se trata la Panza Army?",
    a: "PIPAA (Pipa_ARG) es el streamer número 1 de PUBG en Argentina y ex jugador profesional Top 5 del mundo en PNC Seúl. La Panza Army es su comunidad oficial: un espacio sin filtro donde se transmiten más de 9 horas diarias de rankeds, partidas con la gente, risas, comandos troll y el mejor shooter táctico.",
  },
  {
    q: "¿Qué son los Comandos Troll y cómo sabotearlo en vivo?",
    a: "En sus transmisiones podés comprar comandos y cartas de Dixper desde $150 ARS para afectarle el juego en tiempo real: invertirle las teclas WASD, obligarlo a tirar granadas a sus pies, bloquearle la mira o hacerle spawn de ruidos y jumpscares. Podés ver la lista completa con precios y links en la sección Tienda Troll.",
  },
  {
    q: "¿Cuál es su horario de streaming diario?",
    a: "PIPAA transmite todos los días de 15:00 a 00:00 (hora de Argentina) en simultáneo por Kick y Twitch (canal pipa_arg). Las convocatorias a partidas personalizadas y avisos de stream se realizan por su servidor de Discord oficial.",
  },
  {
    q: "¿En qué torneos representó a la Selección Argentina?",
    a: "Representó a Argentina en 3 ediciones del PUBG Nations Cup (PNC 2022, PNC 2024 y PNC 2026 en Seúl, Corea del Sur), logrando el histórico 5.° puesto mundial con 101 puntos, 71 eliminaciones y 1 Chicken Dinner (WWCD).",
  },
  {
    q: "¿Qué hardware y periféricos utiliza para transmitir y jugar?",
    a: "Utiliza una configuración Dual PC: PC Gaming con AMD Ryzen 7 7800X3D, Mother B650M Aorus Elite AX WiFi, PNY XLR8 RTX 3070 y 32GB RAM DDR5 a 6000MHz. Para emisión utiliza una PC Streaming dedicada con Intel Core i7 8700 y GTX 1070 Ti. Juega a 400 DPI con Logitech G Pro X y auriculares in-ear Shure SE215.",
  },
  {
    q: "¿Cómo apoyar a PIPAA con su código de creador PUBG Partner?",
    a: "Al comprar G-Coins o cualquier ítem dentro de PUBG: BATTLEGROUNDS o en accounts.krafton.com/creator-code, ingresá el código de creador PIPAA. De esa manera, un porcentaje de cada compra va directamente a apoyar sus streams diarios.",
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
  "PANZA ARMY",
  "STREAM EN VIVO",
  "KICK & TWITCH",
  "COMANDOS TROLL",
  "TIENDA TROLL",
  "PUBG PARTNER",
  "CÓDIGO: PIPAA",
  "TOP 5 MUNDIAL",
  "SELECCIÓN ARGENTINA",
  "DIXPER & PANZABOT",
  "DUAL PC 240HZ",
  "RANKEDS & SCRIMS",
  "DISCORD COMUNIDAD",
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
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

      const sections = ["inicio", "historia", "argentina", "stats", "trayectoria", "arsenal", "setup", "comunidad", "videos", "redes", "faq", "archivo", "contacto"];
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
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Cerrar ✕" : "Menú ☰"}</button>
        <nav id="main-navigation" className={menuOpen ? "menu-open" : ""} aria-label="Navegación principal" onClick={() => setMenuOpen(false)} onKeyDown={(event) => { if (event.key === "Escape") setMenuOpen(false); }}>
          <a href="#historia" className={activeNav === "historia" ? "is-active" : ""}>El Fenómeno</a>
          <a href="#argentina" className={activeNav === "argentina" ? "is-active" : ""}>Argentina</a>
          <a href="#stats" className={activeNav === "stats" ? "is-active" : ""}>Stream Lab</a>
          <a href="#trayectoria" className={activeNav === "trayectoria" ? "is-active" : ""}>Trayectoria</a>
          <a href="#arsenal" className={activeNav === "arsenal" ? "is-active" : ""}>Arsenal</a>
          <a href="#setup" className={activeNav === "setup" ? "is-active" : ""}>Setup</a>
          <a href="#comunidad" className={activeNav === "comunidad" ? "is-active" : ""}>En Vivo</a>
          <a href="#videos" className={activeNav === "videos" ? "is-active" : ""}>Videos</a>
          <a href="./comandos/" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <ShoppingCart style={{ width: "13px", height: "13px" }} />
            <span>Tienda Troll</span>
          </a>
          <a href="#faq" className={activeNav === "faq" ? "is-active" : ""}>FAQ</a>
        </nav>
        <a className="nav-live" href="#comunidad">
          <span className="live-indicator-dot" aria-hidden="true" />
          <span className="nav-live-text">Ver stream</span>
        </a>
      </header>

      <main>
        {/* ── Hero ── */}
        <Hero />
        <ChapterPortal word="PANZA ARMY" label="01 / ENTRASTE AL UNIVERSO" />

        {/* ── 01. Perfil / El Fenómeno Panza Army ── */}
        <section className="intro section-grid" id="historia" data-reveal>
          <div className="section-kicker"><span>01</span> EL FENÓMENO</div>
          <div className="intro-main">
            <p className="eyebrow">DE PUNTA ALTA AL STREAMING LATINOAMERICANO</p>
            <h2>MUCHA PANZA.<br /><em>COMUNIDAD INCONDICIONAL.</em></h2>
            <p className="section-copy">
              Más de 7 años de trayectoria en el máximo nivel combinados con el show diario más genuino y entretenido de PUBG. En el directo de PIPAA no hay poses: jugadas de calibre internacional, eructos legendarios, viewers saboteándole la partida con comandos troll y la Panza Army bancando cada rotación desde la tarde hasta la medianoche.
            </p>
          </div>
          <div className="facts">
            <article data-reveal>
              <strong>+9h</strong>
              <span>De stream diario<br />en Kick y Twitch</span>
            </article>
            <article data-reveal>
              <strong>#5</strong>
              <span>Top 5 Mundial PNC<br />Seúl con Argentina</span>
            </article>
            <article data-reveal>
              <strong>7+</strong>
              <span>Años de trayectoria<br />y puro gunplay</span>
            </article>
          </div>
        </section>

        {/* ── 02. Selección Argentina & Hazaña Mundial ── */}
        <section className="argentina" id="argentina" data-reveal>
          <div className="argentina-photo-3d-container">
            <TiltCard3D maxTilt={12} glare={true} className="argentina-photo-3d-card argentina-official-portrait">
              <img
                src="./pipaa-argentina-studio.webp"
                srcSet="./pipaa-argentina-studio-small.webp 480w, ./pipaa-argentina-studio.webp 900w"
                sizes="(max-width: 768px) calc(100vw - 48px), 480px"
                alt="Retrato recreado de PIPAA con la camiseta de Argentina, basado en la foto de PUBG Esports"
                width="900"
                height="1200"
                loading="lazy"
                decoding="async"
              />
              <div className="photo-stamp photo-stamp-3d depth-layer-2">
                <span>TOP 5</span>
                <strong>#5</strong>
              </div>
            </TiltCard3D>
            <a className="argentina-photo-source" href="https://pubgesports.com/en/teams/762" target="_blank" rel="noreferrer">Retrato recreado · Referencia: PUBG Esports ↗</a>
          </div>
          <div className="argentina-copy">
            <p className="eyebrow sky">EL PRO PLAYER QUE CONQUISTÓ EL STREAMING · TOP 5 MUNDIAL</p>
            <h2>LA BANDERA ARGENTINA<br />EN LA <em>CIMA GLOBAL.</em></h2>
            <p>
              Antes de consolidar la comunidad más fiel y divertida del shooter, PIPAA demostró su categoría en el escenario más exigente del planeta: la PUBG Nations Cup en Seúl, Corea del Sur. Llevó a la Selección Argentina al 5.° puesto mundial con 101 puntos, 71 eliminaciones y un Chicken Dinner épico compitiendo de igual a igual contra las potencias de Asia y Europa.
            </p>
            <div className="result-grid">
              <div data-reveal>
                <small>POSICIÓN GLOBAL</small>
                <strong>#5</strong>
              </div>
              <div data-reveal>
                <small>PUNTOS TOTALES</small>
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

        {/* ── 03. Stream & Combat Lab ── */}
        <section className="performance section-grid" id="stats" aria-labelledby="performance-title" data-reveal>
          <div className="section-kicker"><span>03</span> STREAM LAB</div>
          <div className="performance-heading">
            <div>
              <p className="eyebrow">MÉTRICAS EN VIVO & BALÍSTICA · COMUNIDAD PANZA ARMY</p>
              <h2 id="performance-title">EL SHOW DIARIO<br />EN <em>NÚMEROS.</em></h2>
            </div>
            <p>Detrás de las risas, los eructos y los comandos troll hay dedicación absoluta: maratones de 9 horas diarias, precisión balística de élite y una comunidad que no se pierde ni un solo minuto de transmisión.</p>
          </div>

          <div className="stream-lab-metrics-grid" aria-label="Métricas del streaming y rendimiento de PIPAA">
            <TiltCard3D maxTilt={9} scale={1.03} glare={true}>
              <article className="stream-lab-card" data-reveal>
                <div className="stream-lab-card-icon">
                  <Tv style={{ width: "22px", height: "22px" }} />
                </div>
                <div className="stream-lab-value">+9H</div>
                <div className="stream-lab-label">STREAM DIARIO</div>
                <div className="stream-lab-sub">En vivo todos los días en Kick y Twitch de 15:00 a 00:00 (ARG).</div>
              </article>
            </TiltCard3D>

            <TiltCard3D maxTilt={9} scale={1.03} glare={true}>
              <article className="stream-lab-card sky-accent" data-reveal>
                <div className="stream-lab-card-icon">
                  <Crosshair style={{ width: "22px", height: "22px" }} />
                </div>
                <div className="stream-lab-value">617,9 M</div>
                <div className="stream-lab-label">LONGEST KILL</div>
                <div className="stream-lab-sub">Headshot a distancia máxima registrado en vivo con francotirador.</div>
              </article>
            </TiltCard3D>

            <TiltCard3D maxTilt={9} scale={1.03} glare={true}>
              <article className="stream-lab-card gold-accent" data-reveal>
                <div className="stream-lab-card-icon">
                  <Flame style={{ width: "22px", height: "22px" }} />
                </div>
                <div className="stream-lab-value">+3.500</div>
                <div className="stream-lab-label">HORAS DE TRANSMISIÓN</div>
                <div className="stream-lab-sub">Años de constancia, Chicken Dinners y momentos memorables junto al squad.</div>
              </article>
            </TiltCard3D>

            <TiltCard3D maxTilt={9} scale={1.03} glare={true}>
              <article className="stream-lab-card violet-accent" data-reveal>
                <div className="stream-lab-card-icon">
                  <Trophy style={{ width: "22px", height: "22px" }} />
                </div>
                <div className="stream-lab-value">#5 GLOBAL</div>
                <div className="stream-lab-label">TOP 5 MUNDIAL PNC</div>
                <div className="stream-lab-sub">Hazaña histórica representando a Argentina en Seúl, Corea del Sur.</div>
              </article>
            </TiltCard3D>
          </div>

          <div className="stream-lab-highlight-grid">
            <TiltCard3D maxTilt={6} scale={1.01} glare={true}>
              <article className="stream-lab-banner-card" data-reveal>
                <div>
                  <div className="stream-lab-banner-tag">
                    <Radio style={{ width: "14px", height: "14px" }} />
                    <span>TRANSMISIÓN DUAL PC EN DIRECTO</span>
                  </div>
                  <h3>ENTRETENIMIENTO PURO<br /><em>Y MÁXIMO GUNPLAY.</em></h3>
                  <p>
                    Cada tarde arranca la rutina: calentar la puntería en rankeds, coordinar con el Discord de la Panza Army y activar los comandos troll para que el chat controle el destino de la partida mediante Dixper y Panzabot.
                  </p>
                  <div className="stream-schedule-pills">
                    <span className="stream-schedule-pill">
                      <Clock style={{ width: "13px", height: "13px" }} /> 15:00 a 00:00 ARG
                    </span>
                    <span className="stream-schedule-pill">
                      <Zap style={{ width: "13px", height: "13px" }} /> Dual PC Encoding
                    </span>
                    <span className="stream-schedule-pill">
                      <Gamepad2 style={{ width: "13px", height: "13px" }} /> Rankeds & Scrims
                    </span>
                    <span className="stream-schedule-pill">
                      <Sparkles style={{ width: "13px", height: "13px" }} /> Dixper & Comandos
                    </span>
                  </div>
                </div>
                <div style={{ marginTop: "24px" }}>
                  <a
                    href="./comandos/"
                    className="button button-primary"
                    style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                  >
                    <span>Ver Tienda de Comandos Troll</span>
                    <ShoppingCart style={{ width: "15px", height: "15px" }} />
                  </a>
                </div>
              </article>
            </TiltCard3D>

            <TiltCard3D maxTilt={6} scale={1.01} glare={true}>
              <aside className="combat-profile" data-reveal style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="panel-heading">
                  <div>
                    <small>COMBAT PROFILE · GUNPLAY</small>
                    <strong>PRECISIÓN EN VIVO</strong>
                  </div>
                  <span className="panel-meta-tag">AIM PRO</span>
                </div>
                <div className="combat-ring-wrapper">
                  <div className="combat-ring" aria-label="21 por ciento de disparos directos a la cabeza">
                    <div>
                      <strong>21%</strong>
                      <span>HEADSHOTS</span>
                    </div>
                  </div>
                  <div className="combat-ring-crosshair" aria-hidden="true" />
                </div>
                <div className="combat-split">
                  <div>
                    <small>ESTILO DE JUEGO</small>
                    <strong style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", color: "#fff" }}>AGRESIVO</strong>
                  </div>
                  <div>
                    <small>ARMA INSIGNIA</small>
                    <strong style={{ fontSize: "1.4rem", fontFamily: "var(--font-display)", color: "var(--acid)" }}>BERYL M762</strong>
                  </div>
                </div>
                <div className="range-record">
                  <div>
                    <small>RECORD DE IMPACTO A DISTANCIA</small>
                    <strong>617,9 M</strong>
                  </div>
                  <span><i /></span>
                </div>
              </aside>
            </TiltCard3D>
          </div>

          <div className="data-note" style={{ marginTop: "20px" }}>
            <span>CONEXIÓN CON LA COMUNIDAD</span>
            <p>Transmisiones en simultáneo con chat unificado, recompensas de canal por puntos y sorteos mensuales para suscriptores en Kick y Twitch.</p>
            <a href="#comunidad">
              Ir al reproductor en vivo ↓
            </a>
          </div>
        </section>

        {/* ── 04. Trayectoria ── */}
        <section className="career section-grid" id="trayectoria" aria-labelledby="career-title" data-reveal>
          <div className="section-kicker"><span>04</span> TRAYECTORIA</div>
          <div className="career-head">
            <h2 id="career-title">UNA CARRERA<br />EN <em>PRIMERA PERSONA.</em></h2>
            <p>De las primeras scrims continentales a representar al país en Seúl y construir la comunidad de streaming más fiel de PUBG en Argentina.</p>
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
        <ChapterPortal word="LOCK & LOAD" label="02 / PRECISIÓN BAJO PRESIÓN" scene="lime" />
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
              <TiltCard3D key={weapon.name} maxTilt={8} scale={1.02} glare={true} className="weapon-card-3d-wrapper" data-reveal>
                <article className="weapon-card">
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
              </TiltCard3D>
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
            <p>Arquitectura Dual PC calibrada para máximo rendimiento en PUBG y streaming: una máquina dedicada a los 240 FPS del juego y otra para el encoding sin pérdida de calidad.</p>
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
              <TiltCard3D key={`${activeSetupTab}-${item.label}-${index}`} maxTilt={8} scale={1.02} glare={true} className="setup-card-3d-wrapper">
                <article className="setup-card">
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
              </TiltCard3D>
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
        <ChapterPortal word="ESTÁS DENTRO" label="03 / EL CHAT TOMA EL CONTROL" />
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
                  Al comprar G-Coins o cualquier artículo en la tienda oficial de PUBG: BATTLEGROUNDS o en Krafton, usá el código <strong>PIPAA</strong>. Un porcentaje de tu compra apoya directamente sus directos diarios.
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
              <TiltCard3D maxTilt={7} glare={true} style={{ width: "100%", height: "100%" }}>
                <img src="./panza-army-studio.webp" srcSet="./panza-army-studio-small.webp 768w, ./panza-army-studio.webp 1536w" sizes="(max-width: 768px) calc(100vw - 48px), 900px" alt="Panza Army en letras metálicas violetas con detalles lima" width="1536" height="1024" loading="lazy" decoding="async" />
                <span className="community-feature-scan" aria-hidden="true" />
              </TiltCard3D>
            </div>
            <div className="community-feature-copy">
              <div className="community-feature-label"><span>07</span> LA COMUNIDAD</div>
              <img className="community-avatar" src="./pipa-avatar-v2.webp" alt="Logo de PIPAA y Panza Army" width="512" height="512" loading="lazy" decoding="async" />
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

          {/* ── Card Destacada Tienda de Comandos Troll ── */}
          <TiltCard3D maxTilt={6} scale={1.01} glare={true}>
            <article className="creator-code-card" data-reveal style={{ borderColor: "rgba(167, 255, 0, 0.4)", background: "linear-gradient(135deg, rgba(21, 16, 34, 0.95), rgba(7, 5, 13, 0.95))" }}>
              <div className="creator-code-badge" style={{ borderColor: "rgba(167, 255, 0, 0.5)", color: "#a7ff00", background: "rgba(167, 255, 0, 0.12)" }}>
                <SparklesIcon className="creator-sparkle-icon" />
                <span>TIENDA OFICIAL · COMANDOS TROLL & DIXPER</span>
              </div>
              <div className="creator-code-content">
                <div className="creator-code-info">
                  <h3>TIENDA DE<br /><em>COMANDOS TROLL.</em></h3>
                  <p>
                    Saboteá a PIPAA en vivo en PUBG desde <strong>$150 ARS</strong> o con <strong>Cajas Dixper</strong>: invertile el teclado WASD, forzale disparos involuntarios, mandale audios sin censura o ejecutá al squad con fuego amigo. Precios transparentes y links directos.
                  </p>
                </div>
                <div className="creator-code-action-box">
                  <a
                    href="./comandos/"
                    className="button button-primary creator-redeem-btn"
                    style={{ width: "100%", textAlign: "center", justifyContent: "center", gap: "8px", display: "inline-flex", alignItems: "center" }}
                  >
                    <span>Ver Tienda de Comandos</span>
                    <ShoppingCart style={{ width: "16px", height: "16px" }} />
                  </a>
                </div>
              </div>
            </article>
          </TiltCard3D>
        </section>

        {/* ── 08. Videos de YouTube ── */}
        <section className="yt-feed-section" id="videos" data-reveal>
          <div className="yt-feed-heading">
            <div>
              <p className="eyebrow red">CANAL OFICIAL DE YOUTUBE · @PIPAArg</p>
              <h2>ÚLTIMOS VIDEOS<br /><em>SUBIDOS A YOUTUBE.</em></h2>
            </div>
            <p>
              Los últimos videos editados y partidas destacadas subidos al canal oficial de YouTube @PIPAArg. Kills insanas, desafíos de escopeta, momentos con el chico Azzul y lo mejor de la Panza Army.
            </p>
          </div>
          <YouTubeFeed />
        </section>

        {/* ── 09. Redes Oficiales ── */}
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

        {/* ── 10. Preguntas Frecuentes / FAQ ── */}
        <section className="faq-section section-grid" id="faq" data-reveal>
          <div className="section-kicker"><span>10</span> FAQ</div>
          <div className="faq-heading">
            <div>
              <p className="eyebrow">TODO SOBRE PIPAA</p>
              <h2>PREGUNTAS<br /><em>FRECUENTES.</em></h2>
            </div>
            <p>Detalles sobre sus streams diarios, comandos troll, configuración competitiva y cómo sumarte a la comunidad Panza Army.</p>
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

        {/* ── 11. Archivo de Fuentes ── */}
        <section className="archive-sources section-grid" id="archivo" aria-labelledby="sources-title" data-reveal>
          <div className="section-kicker"><span>11</span> ARCHIVO</div>
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

        {/* Community invitation */}
        <section className="contact discord-invite" id="discord" aria-labelledby="discord-title" data-reveal>
          <p className="eyebrow">DISCORD OFICIAL · PANZA ARMY</p>
          <h2 id="discord-title">TU LUGAR EN<br /><em>LA PANZA ARMY.</em></h2>
          <p>La comunidad sigue cuando termina el stream. Sumate al Discord para charlar, compartir clips y encontrar gente para la próxima partida.</p>
          <a className="button button-primary discord-invite-button" href="https://discord.gg/rgzZ3Kv" target="_blank" rel="noreferrer">
            <DiscordIcon /> Unirme al Discord <span aria-hidden="true">↗</span>
          </a>
          <div className="contact-outline" aria-hidden="true">PANZA ARMY</div>
        </section>

        <section className="business-contact" id="contacto" aria-labelledby="business-title" data-reveal>
          <div>
            <p className="eyebrow">CONTACTO COMERCIAL</p>
            <h2 id="business-title">PUBLICIDAD Y COLABORACIONES</h2>
            <p>Para marcas, campañas de streaming, eventos y propuestas comerciales con PIPAA.</p>
          </div>
          <div className="business-contact-action">
            <a className="contact-mail-link" href="mailto:raffitas_ruppel@hotmail.com">raffitas_ruppel@hotmail.com</a>
            <a className="button button-ghost" href="mailto:raffitas_ruppel@hotmail.com?subject=Propuesta%20comercial%20para%20PIPAA">
              Enviar propuesta <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>
      </main>

      <footer>
        <a className="brand" href="#inicio" aria-label="PIPAA — volver al inicio">
          <img src="./pipaa-logo.svg" alt="PIPAA" className="brand-logo" width="120" height="48" />
        </a>
        <p>PIPAA · Streamer n°1 de PUBG · Líder Panza Army<br />Argentina</p>
        <p className="footer-note">© 2026 PIPAA<br />Diseñado para la Panza Army.</p>
      </footer>

      <nav className="mobile-dock" aria-label="Navegación móvil">
        <a href="#historia" className={`dock-item ${activeNav === "historia" || activeNav === "inicio" ? "is-active" : ""}`}>
          <User className="dock-icon" />
          <span className="dock-label">Perfil</span>
        </a>
        <a href="#argentina" className={`dock-item ${activeNav === "argentina" ? "is-active" : ""}`}>
          <Trophy className="dock-icon" />
          <span className="dock-label">Arg</span>
        </a>
        <a href="#comunidad" className={`dock-item ${activeNav === "comunidad" || activeNav === "stats" ? "is-active" : ""}`}>
          <Tv className="dock-icon" />
          <span className="dock-label">Stream</span>
        </a>
        <a href="#setup" className={`dock-item ${activeNav === "setup" ? "is-active" : ""}`}>
          <Gamepad2 className="dock-icon" />
          <span className="dock-label">Setup</span>
        </a>
        <a href="./comandos/" className="dock-item dock-item-troll">
          <ShoppingCart className="dock-icon" />
          <span className="dock-label">Troll</span>
        </a>
        <a href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer" className="dock-item dock-item-live" aria-label="Ver directo en Kick">
          <span className="dock-live-ping" aria-hidden="true" />
          <Radio className="dock-icon" />
          <span className="dock-label">Live</span>
        </a>
      </nav>

      <MotionController />
    </div>
  );
}
