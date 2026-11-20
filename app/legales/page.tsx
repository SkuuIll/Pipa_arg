import { Cookie, FileText, Globe, Scale, ShieldCheck, ShoppingBag, UserCheck } from "lucide-react";
import { motion } from "motion/react";
import { PreloaderSplash } from "../components/PreloaderSplash";
import { SiteHeader } from "../components/SiteHeader";
import "./legales.css";

const storageKeys = [
  "pipaa:ambient:v1",
  "pipaa:celebration-sound:v1",
  "pipaa:chat-hide-bots:v1",
  "pipaa:recent-chat:v1",
  "pipaa:diasub-cache:v1",
  "pipaa:mate-hunt:v1",
  "pipaa:preloader-done:v1",
];

export default function LegalesPage() {
  return (
    <>
      <PreloaderSplash route="/legales/" />
      <div className="site-shell legales-shell">
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <SiteHeader current="/legales/" />

        <main id="contenido" className="legales">
          <motion.section
            className="legales-hero"
            aria-labelledby="legales-title"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">MARCO LEGAL · REPÚBLICA ARGENTINA</p>
            <h1 id="legales-title">Avisos legales y privacidad</h1>
            <p className="legales-lede">
              Información sobre el funcionamiento del sitio oficial de PIPAA (pipaa.store) y el tratamiento de datos.
            </p>
            <div className="legales-meta">
              <span><strong>Titular:</strong> Leonardo Rafael Ruppel (PIPAA / Pipa_ARG)</span>
              <span><strong>Contacto legal:</strong> <a href="mailto:raffitas_ruppel@hotmail.com">raffitas_ruppel@hotmail.com</a></span>
              <span><strong>Vigencia:</strong> 2026</span>
            </div>
          </motion.section>

          <nav className="legales-toc" aria-label="Secciones legales">
            <a href="#titular">1. Titular</a>
            <a href="#privacidad">2. Privacidad (Ley 25.326)</a>
            <a href="#cookies">3. Cookies y almacenamiento</a>
            <a href="#tienda">4. Tienda y terceros (Ley 24.240)</a>
            <a href="#intermediarios">5. Chat y enlaces (Ley 26.032)</a>
            <a href="#propiedad">6. Propiedad intelectual</a>
            <a href="#jurisdiccion">7. Menores y jurisdicción</a>
          </nav>

          <div className="legales-sections">
            <section className="legal-card" id="titular" aria-labelledby="legal-titular">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><UserCheck size={17} /></span>
                <h2 id="legal-titular">1. Identificación del titular del sitio</h2>
              </div>
              <p>
                El dominio <strong>pipaa.store</strong> es un sitio informativo y de difusión audiovisual perteneciente a{" "}
                <strong>Leonardo Rafael Ruppel</strong>, creador de contenido y jugador competitivo argentino conocido públicamente como{" "}
                <strong>PIPAA</strong> o <strong>Pipa_ARG</strong>, con domicilio en la República Argentina.
              </p>
              <p>
                Toda consulta, notificación fehaciente, reclamo vinculado a contenidos o solicitud legal debe dirigirse al correo electrónico oficial:{" "}
                <a href="mailto:raffitas_ruppel@hotmail.com">raffitas_ruppel@hotmail.com</a>.
              </p>
            </section>

            <section className="legal-card" id="privacidad" aria-labelledby="legal-privacidad">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><ShieldCheck size={17} /></span>
                <h2 id="legal-privacidad">2. Protección de datos personales (Ley N° 25.326 · AAIP)</h2>
              </div>
              <p>
                Este sitio no ofrece registro de cuentas propio. Al participar en Día Sub, el servidor de Cloudflare puede guardar el identificador y nombre de usuario de Kick o Twitch, la plataforma y la fecha y hora de inscripción para ordenar la lista y evitar duplicados. La lista pública muestra nombre, plataforma y hora; los registros pueden permanecer almacenados después del evento.
                Las consultas enviadas voluntariamente por correo electrónico se utilizan únicamente para responder la comunicación comercial o legal iniciada por el remitente.
              </p>
              <p>El multichat muestra mensajes, nombres y otros datos públicos recibidos mediante servicios externos. El navegador conserva una copia limitada de mensajes recientes. Cloudflare y las plataformas integradas pueden tratar datos técnicos de conexión según sus propias políticas.</p>
              <ul>
                <li>
                  <strong>Derechos ARCO (Acceso, Rectificación, Actualización y Supresión):</strong> el titular de los datos personales tiene la facultad de ejercer el derecho de acceso en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme al Art. 14 inc. 3 de la Ley N° 25.326.
                </li>
                <li>
                  <strong>Plazos legales:</strong> los pedidos de acceso se responden dentro de los <strong>10 días corridos</strong> desde la acreditación de identidad, y las solicitudes de rectificación o supresión dentro de los <strong>5 días hábiles</strong>, escribiendo a <a href="mailto:raffitas_ruppel@hotmail.com">raffitas_ruppel@hotmail.com</a>.
                </li>
              </ul>
              <blockquote className="legal-aaip-box">
                <strong>Leyenda obligatoria — Resolución AAIP N° 14/2018:</strong> “La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.”
              </blockquote>
            </section>

            <section className="legal-card" id="cookies" aria-labelledby="legal-cookies">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><Cookie size={17} /></span>
                <h2 id="legal-cookies">3. Uso de almacenamiento local y cookies de terceros</h2>
              </div>
              <p>
                Para las funciones de la sala y las preferencias visuales, <strong>pipaa.store</strong> guarda datos en el almacenamiento local de tu navegador (<code>localStorage</code> / <code>sessionStorage</code>), incluidos mensajes recientes y preferencias:
              </p>
              <div className="legal-code-list" aria-label="Claves locales utilizadas">
                {storageKeys.map((key) => <code key={key}>{key}</code>)}
              </div>
              <p>
                Al reproducir transmisiones o abrir chats integrados de servicios externos (<strong>Twitch</strong>, <strong>Kick</strong>, <strong>YouTube</strong> o el servicio de mensajería unificada), esas plataformas pueden leer o almacenar sus propias cookies conforme a sus políticas de privacidad. Podés bloquear o borrar cookies y almacenamiento local en cualquier momento desde la configuración de tu navegador.
              </p>
            </section>

            <section className="legal-card" id="tienda" aria-labelledby="legal-tienda">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><ShoppingBag size={17} /></span>
                <h2 id="legal-tienda">4. Tienda, códigos de creador y Defensa del Consumidor (Ley N° 24.240)</h2>
              </div>
              <ul>
                <li>
                  <strong>Sitio meramente informativo:</strong> <strong>pipaa.store no es una tienda de comercio electrónico</strong> ni procesa pagos, facturas, cobros ni entregas. Los accesos incluidos en <a href="/comandos/">/comandos/</a> son enlaces externos informativos hacia plataformas operadas de forma independiente (<strong>Dixper</strong>, <strong>WeezyX</strong>, <strong>Twitch</strong> y <strong>Krafton</strong>).
                </li>
                <li>
                  <strong>Transparencia comercial:</strong> el uso del código de creador <strong>PIPAA</strong> o de enlaces hacia plataformas asociadas puede otorgar un beneficio o participación al streamer. Consultá las condiciones y el precio final en la plataforma correspondiente.
                </li>
                <li>
                  <strong>Botón de Arrepentimiento (Art. 34, Ley N° 24.240):</strong> cualquier compra, suscripción o adquisición de artículos digitales contratados en plataformas de terceros se rige por los términos de servicio de la plataforma vendedora, siendo esta última la responsable directa frente a reclamos, facturación o ejercicio del derecho de revocación dentro de los 10 días corridos cuando corresponda.
                </li>
              </ul>
            </section>

            <section className="legal-card" id="intermediarios" aria-labelledby="legal-intermediarios">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><Globe size={17} /></span>
                <h2 id="legal-intermediarios">5. Chat en vivo, contenido de terceros y enlaces externos (Ley N° 26.032)</h2>
              </div>
              <p>
                La búsqueda, recepción y difusión de información a través de Internet cuenta con protección constitucional bajo la <strong>Ley N° 26.032</strong>.
              </p>
              <ul>
                <li>
                  <strong>Mensajes de terceros en Multichat:</strong> el chat en vivo muestra mensajes publicados por usuarios externos en Kick, Twitch y YouTube. El titular no revisa previamente todos los mensajes; podés comunicar contenidos problemáticos al correo de contacto.
                </li>
                <li>
                  <strong>Enlaces y reportes:</strong> los sitios de destino son operados por terceros. Podés informar contenido presuntamente ilícito o problemático escribiendo a <a href="mailto:raffitas_ruppel@hotmail.com">raffitas_ruppel@hotmail.com</a> para su evaluación.
                </li>
              </ul>
            </section>

            <section className="legal-card" id="propiedad" aria-labelledby="legal-propiedad">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><FileText size={17} /></span>
                <h2 id="legal-propiedad">6. Propiedad intelectual y deslinde de marcas (Ley N° 11.723)</h2>
              </div>
              <p>
                Los textos, el diseño, el código y los elementos visuales del sitio pueden estar protegidos por la <strong>Ley N° 11.723</strong>. Los derechos corresponden a sus respectivos autores y titulares, de acuerdo con los permisos y acuerdos aplicables.
              </p>
              <p>
                <strong>Deslinde de marcas (Ley N° 22.362):</strong> PUBG: BATTLEGROUNDS y KRAFTON son marcas registradas de KRAFTON, Inc.; Twitch, Kick, YouTube, Discord, Dixper, WeezyX y las marcas de hardware exhibidas en el setup pertenecen a sus respectivos propietarios y se mencionan únicamente con fines informativos. Este sitio no es una página oficial de KRAFTON ni de dichas plataformas.
              </p>
            </section>

            <section className="legal-card" id="jurisdiccion" aria-labelledby="legal-jurisdiccion">
              <div className="legal-card-head">
                <span className="legal-card-icon" aria-hidden="true"><Scale size={17} /></span>
                <h2 id="legal-jurisdiccion">7. Menores de edad, disponibilidad y jurisdicción</h2>
              </div>
              <ul>
                <li>
                  <strong>Menores de edad:</strong> las plataformas externas establecen sus propias edades mínimas y condiciones de uso. Se recomienda la supervisión de una persona adulta, especialmente para compras y chats en vivo.
                </li>
                <li>
                  <strong>Disponibilidad técnica:</strong> la transmisión en vivo y el chat dependen de la conectividad y APIs públicas de terceros; el titular no garantiza disponibilidad ininterrumpida ante caídas ajenas al sitio.
                </li>
                <li>
                  <strong>Ley aplicable y jurisdicción:</strong> estos términos se rigen exclusivamente por las leyes de la República Argentina. Ante cualquier controversia derivada del uso del sitio serán competentes los tribunales ordinarios de la República Argentina que correspondan según la normativa vigente.
                </li>
              </ul>
            </section>
          </div>
        </main>

        <footer>
          <a className="brand" href="/" aria-label="PIPAA — volver al inicio">
            <img src="/pipaa-logo.svg" alt="PIPAA" className="brand-logo" width="120" height="48" />
          </a>
          <p>PIPAA · Panza Army · Argentina</p>
          <p className="footer-note"><a href="/">Inicio</a> · <a href="/directo/">Directo</a> · <a href="/comandos/">Tienda</a></p>
        </footer>
      </div>
    </>
  );
}
