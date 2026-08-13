import { MotionController } from "./MotionController";
import { ExperienceLayer } from "./ExperienceLayer";
import { LivePlayers } from "./LivePlayers";
import { LocalTime } from "./LocalTime";

const socials = [
  { name: "Twitch", handle: "pipa_arg", href: "https://www.twitch.tv/pipa_arg", tag: "EN VIVO" },
  { name: "Kick", handle: "pipa_arg", href: "https://kick.com/pipa_arg", tag: "EN VIVO" },
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

const performance = [
  { year: "21", event: "PCS 4", value: 249.56 },
  { year: "22", event: "PCS 7", value: 277.77 },
  { year: "23", event: "PAS 2", value: 234.25 },
  { year: "24", event: "PAS 3", value: 169.54 },
  { year: "24", event: "PAS 4", value: 200.01 },
  { year: "25", event: "PAS 5", value: 227.57 },
  { year: "25", event: "EWC Q", value: 187.66 },
  { year: "25", event: "PAS 6", value: 138.24 },
];

const officialTotals = [
  { value: "378", label: "PARTIDAS", detail: "registradas" },
  { value: "356", label: "ELIMINACIONES", detail: "75 headshots" },
  { value: "73.084", label: "DAÑO", detail: "acumulado" },
  { value: "214", label: "ASISTENCIAS", detail: "en 12 torneos" },
];

const sourceLinks = [
  { index: "01", title: "PERFIL OFICIAL", meta: "PUBG ESPORTS · PLAYER 440", href: "https://pubgesports.com/en/players/440" },
  { index: "02", title: "POV PNC 2026", meta: "PUBG ESPORTS · KICK OFICIAL", href: "https://pubgesports.com/pt-br/news/10178" },
  { index: "03", title: "HISTORIAL DE EQUIPOS", meta: "ESPORTS CHARTS · PIPAA", href: "https://escharts.com/players/pipaa" },
  { index: "04", title: "PAS 1 · 2026", meta: "PUBG AMERICAS · #8 BESTIA", href: "https://liquipedia.net/pubg/PUBG_Americas_Series/2026/1" },
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
          <a href="#stats">Datos</a>
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
              <div className="schedule-copy"><b>STREAM TODOS LOS DÍAS</b><small>15:00 — 00:00 · ARG</small></div>
              <span className="schedule-divider" aria-hidden="true" />
              <LocalTime />
            </div>
          </div>

          <div className="hero-visual" aria-label="PIPAA, jugador profesional y creador de Panza Army">
            <img src="./pipa-banner.png" alt="PIPAA sonriendo con la indumentaria de Panza Army" width="2000" height="800" fetchPriority="high" />
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
                <div className="timeline-body"><small>{item.tag}</small><h3>{item.team}</h3><p>{item.text}</p></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="performance section-grid" id="stats" aria-labelledby="performance-title" data-reveal>
          <div className="section-kicker"><span>03</span> DATA LAB</div>
          <div className="performance-heading">
            <div>
              <p className="eyebrow">ARCHIVO COMPETITIVO · 2021—2025</p>
              <h2 id="performance-title">LOS NÚMEROS<br />TAMBIÉN <em>JUEGAN.</em></h2>
            </div>
            <p>Doce torneos registrados por PUBG Esports cuentan otra parte de la historia: volumen, consistencia y años compitiendo contra los mejores de Américas.</p>
          </div>

          <div className="official-ledger" aria-label="Totales de los registros oficiales de PUBG Esports">
            {officialTotals.map((stat, index) => (
              <article key={stat.label} data-reveal>
                <small>{String(index + 1).padStart(2, "0")} / {stat.label}</small>
                <strong className={stat.value.length > 5 ? "is-long" : undefined}>{stat.value}</strong>
                <span>{stat.detail}</span>
              </article>
            ))}
          </div>

          <div className="performance-board">
            <article className="damage-panel" data-reveal>
              <div className="panel-heading">
                <div><small>AVG. DAMAGE / MATCH</small><strong>RENDIMIENTO POR EVENTO</strong></div>
                <span>MAX 300</span>
              </div>
              <div className="damage-chart" role="img" aria-label="Daño promedio por partida en ocho eventos oficiales entre 2021 y 2025">
                <div className="chart-grid" aria-hidden="true"><i /><i /><i /></div>
                {performance.map((entry, index) => (
                  <div className="chart-column" key={`${entry.year}-${entry.event}`}>
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
                <div><small>COMBAT PROFILE</small><strong>PRECISIÓN + ALCANCE</strong></div>
                <span>OFFICIAL</span>
              </div>
              <div className="combat-ring" aria-label="21 por ciento de las eliminaciones registradas fueron headshots">
                <div><strong>21%</strong><span>HEADSHOTS</span></div>
              </div>
              <div className="combat-split">
                <div><small>ELIMINACIONES</small><strong>356</strong></div>
                <div><small>HEADSHOTS</small><strong>75</strong></div>
              </div>
              <div className="range-record">
                <div><small>LONGEST KILL REGISTRADA</small><strong>617,9 M</strong></div>
                <span><i /></span>
              </div>
            </aside>
          </div>

          <div className="data-note">
            <span>FUENTE / PUBG ESPORTS</span>
            <p>Totales calculados sobre los 12 registros publicados en el perfil oficial. No representan partidas fuera de esos eventos.</p>
            <a href="https://pubgesports.com/en/players/440" target="_blank" rel="noreferrer">Abrir perfil oficial ↗</a>
          </div>
        </section>

        <section className="argentina" id="argentina" data-reveal>
          <div className="argentina-photo">
            <img src="./pipa-argentina-2026.jpg" alt="PIPAA en el anuncio oficial de la Selección Argentina para PUBG Nations Cup 2026" width="960" height="1200" loading="lazy" decoding="async" />
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
            <div className="world-stages" aria-label="Hitos competitivos destacados">
              <div><small>2024</small><strong>PNC</strong><span>Seúl · Argentina</span></div>
              <i aria-hidden="true" />
              <div><small>2025</small><strong>EWC Q</strong><span>Américas · OP</span></div>
              <i aria-hidden="true" />
              <div><small>2026</small><strong>PNC</strong><span>Seúl · #5 mundial</span></div>
            </div>
            <a className="text-link sky" href="https://pubgesports.com/en/tournament/165" target="_blank" rel="noreferrer">Ver resultado oficial <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="stream-section section-grid" id="comunidad" data-reveal>
          <div className="section-kicker"><span>04</span> EN VIVO</div>
          <div className="live-heading" data-reveal>
            <div>
              <p className="eyebrow">TRANSMISIÓN EN DIRECTO</p>
              <h2>MIRALO DONDE<br /><em>VOS ELIJAS.</em></h2>
            </div>
            <p>El directo completo de PIPAA integrado en la web. Elegí Kick o Twitch, activá el sonido y entrá a la partida.</p>
          </div>
          <article className="official-pov" data-reveal>
            <div className="pov-index">POV<br /><strong>ARG</strong></div>
            <div>
              <p className="eyebrow">CANAL ELEGIDO POR PUBG ESPORTS</p>
              <h3>LA PNC 2026,<br />DESDE SUS OJOS.</h3>
            </div>
            <p>Para la Nations Cup 2026, PUBG publicó el canal de Kick de PIPAA como su transmisión POV oficial: la partida, las comunicaciones y la presión desde el lugar del jugador.</p>
            <a href="https://pubgesports.com/pt-br/news/10178" target="_blank" rel="noreferrer">Ver anuncio oficial <span aria-hidden="true">↗</span></a>
          </article>
          <LivePlayers />
          <article className="community-feature" data-reveal>
            <div className="community-feature-media">
              <img src="./og-v2.png" alt="PIPAA, jugador profesional argentino de PUBG y creador de Panza Army" width="1731" height="909" loading="lazy" decoding="async" />
              <span className="community-feature-scan" aria-hidden="true" />
            </div>
            <div className="community-feature-copy">
              <div className="community-feature-label"><span>05</span> LA COMUNIDAD</div>
              <img className="community-avatar" src="./pipa-avatar.webp" alt="Logo de PIPAA y Panza Army" width="350" height="349" loading="lazy" decoding="async" />
              <div className="community-feature-title"><p className="eyebrow">MÁS QUE UN CHAT</p><h3>PANZA<br /><em>ARMY.</em></h3></div>
              <div className="community-feature-body">
                <p>Rankeds, scrims, torneos y ese caos que solamente entiende la comunidad. El punto de encuentro alrededor de PIPAA, dentro y fuera de cada partida.</p>
                <div className="community-feature-tags" aria-label="Contenido de la comunidad"><span>DIRECTOS</span><span>COMPETENCIA</span><span>CLIPS</span></div>
                <a className="text-link" href="https://kick.com/pipa_arg" target="_blank" rel="noreferrer">Entrar al directo <span aria-hidden="true">↗</span></a>
              </div>
            </div>
          </article>
        </section>

        <section className="setup section-grid" id="setup" data-reveal>
          <div className="section-kicker"><span>05</span> SETUP</div>
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
              <a key={social.name} href={social.href} target="_blank" rel="me noreferrer" data-reveal>
                <small>{String(index + 1).padStart(2, "0")}</small>
                <span>{social.name}</span>
                <b>{social.handle}</b>
                <i>{social.tag}</i>
                <strong aria-hidden="true">↗</strong>
              </a>
            ))}
          </div>
        </section>

        <section className="archive-sources section-grid" aria-labelledby="sources-title" data-reveal>
          <div className="section-kicker"><span>06</span> ARCHIVO</div>
          <div className="sources-heading">
            <div><p className="eyebrow">INVESTIGACIÓN ABIERTA</p><h2 id="sources-title">LA HISTORIA,<br /><em>CON RESPALDO.</em></h2></div>
            <p>Resultados, estadísticas y movimientos de equipos vinculados a sus registros públicos. Una capa editorial para que la página no solo diga quién es: también muestre de dónde sale cada dato.</p>
          </div>
          <div className="sources-list">
            {sourceLinks.map((source) => (
              <a key={source.index} href={source.href} target="_blank" rel="noreferrer" data-reveal>
                <small>{source.index}</small>
                <div><strong>{source.title}</strong><span>{source.meta}</span></div>
                <b aria-hidden="true">↗</b>
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
