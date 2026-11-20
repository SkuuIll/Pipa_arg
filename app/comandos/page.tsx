import { useState } from "react";
import { ArrowUpRight, Check, Coins, Copy, Gamepad2, Tag, Volume2, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { PreloaderSplash } from "../components/PreloaderSplash";
import { SiteHeader } from "../components/SiteHeader";
import "./tienda.css";

type Store = {
  name: string;
  icon: LucideIcon;
  what: string;
  href: string;
  cta: string;
  accent: "violet" | "acid" | "sky";
};

const stores: Store[] = [
  {
    name: "Dixper",
    icon: Gamepad2,
    what: "Cajas y habilidades que le afectan la partida en vivo: teclado, mouse, pantalla y sonido.",
    href: "https://dixper.gg/pipa_arg",
    cta: "Ir a Dixper",
    accent: "violet",
  },
  {
    name: "WeezyX",
    icon: Volume2,
    what: "Audios y mensajes leídos con voz que suenan en el directo.",
    href: "https://weezyx.com/t/pipa_arg",
    cta: "Ir a WeezyX",
    accent: "acid",
  },
  {
    name: "Puntos del canal de Twitch",
    icon: Coins,
    what: "Juntá puntos mirando el directo en Twitch y canjealos por recompensas del canal.",
    href: "https://www.twitch.tv/pipa_arg",
    cta: "Ir a Twitch",
    accent: "sky",
  },
];

export default function TiendaPage() {
  const [copied, setCopied] = useState<"ok" | "error" | null>(null);

  const copyCode = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText("PIPAA");
      ok = true;
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = "PIPAA";
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        ok = false;
      }
    }
    setCopied(ok ? "ok" : "error");
    setTimeout(() => setCopied(null), 2400);
  };

  return (
    <>
    <PreloaderSplash route="/comandos/" />
    <div className="site-shell tienda-shell">
      <a className="skip-link" href="#contenido">Saltar al contenido</a>
      <SiteHeader current="/comandos/" />

      <main id="contenido" className="tienda">
        <motion.section
          className="tienda-hero"
          aria-labelledby="tienda-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">TIENDA · PANZA ARMY</p>
          <h1 id="tienda-title">Dónde comprar</h1>
          <p className="tienda-lede">
            Todo lo que activa el chat en el directo de PIPAA se compra en estas plataformas oficiales.
          </p>
        </motion.section>

        <ul className="tienda-grid" aria-label="Plataformas oficiales">
          {stores.map(({ name, icon: Icon, what, href, cta, accent }, idx) => (
            <motion.li
              key={name}
              className={`tienda-card is-${accent}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 * idx, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
            >
              <span className="tienda-icon" aria-hidden="true"><Icon size={22} /></span>
              <h2>{name}</h2>
              <p>{what}</p>
              <a className="button button-primary tienda-cta" href={href} target="_blank" rel="noopener noreferrer">
                {cta} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </motion.li>
          ))}

          <motion.li
            className="tienda-card is-gold"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
          >
            <span className="tienda-icon" aria-hidden="true"><Tag size={22} /></span>
            <h2>Código de creador</h2>
            <p>Al comprar G-Coins en PUBG o en Krafton, usá el código <strong>PIPAA</strong>.</p>
            <div className="tienda-code-actions">
              <button type="button" className="button button-ghost tienda-cta" onClick={copyCode}>
                {copied === "ok" ? <><Check size={16} aria-hidden="true" /> ¡Copiado!</> : <><Copy size={16} aria-hidden="true" /> Copiar PIPAA</>}
              </button>
              <a className="button button-primary tienda-cta" href="https://accounts.krafton.com/creator-code" target="_blank" rel="noopener noreferrer">
                Ir a Krafton <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
            <p className="tienda-status" role="status">{copied === "error" ? "No se pudo copiar. El código es PIPAA." : ""}</p>
          </motion.li>
        </ul>

        <p className="tienda-note">
          Las compras se hacen en cada plataforma. Ante cualquier duda, preguntá en el{" "}
          <a href="https://discord.gg/rgzZ3Kv" target="_blank" rel="noopener noreferrer">Discord de la Panza Army ↗</a>.
        </p>
      </main>

      <footer className="site-footer">
        <a className="brand" href="/" aria-label="PIPAA — volver al inicio">
          <img src="/pipa-avatar-v2.webp" alt="PIPAA" className="brand-logo" width="48" height="48" />
        </a>
        <p>PIPAA · Panza Army · Argentina</p>
        <nav className="footer-note" aria-label="Enlaces del pie"><a href="/legales/">Avisos legales</a><a href="/">Inicio</a></nav>
      </footer>
    </div>
    </>
  );
}
