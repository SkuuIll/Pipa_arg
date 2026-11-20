import { Clock, Radio } from "lucide-react";
import { motion } from "motion/react";
import { platformLabels, useLiveStatus } from "../useLiveStatus";

export const NAV_ITEMS = [
  ["/", "Inicio"],
  ["/directo/", "Directo"],
  ["/videos/", "Videos"],
  ["/perfil/", "Perfil"],
  ["/comandos/", "Tienda"],
] as const;

export function MobileNav({ current }: { current: string }) {
  return <details className="mobile-nav" onKeyDown={(event) => { if (event.key === "Escape") { event.currentTarget.open = false; event.currentTarget.querySelector("summary")?.focus(); } }}>
    <summary aria-label="Abrir menú de navegación"><span aria-hidden="true">☰</span> Menú</summary>
    <nav aria-label="Navegación móvil">
      <span className="mobile-nav-label">EXPLORAR PIPAA</span>
      {NAV_ITEMS.map(([url, label]) => <a key={url} href={url} aria-current={current === url ? "page" : undefined}>{label}<span aria-hidden="true">↗</span></a>)}
    </nav>
  </details>;
}

const argClockFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

export function SiteHeader({ current }: { current: string }) {
  const status = useLiveStatus();
  const isLive = Boolean(status?.live.length);

  return (
    <header className="channel-header">
      <div className="channel-header-inner">
        <a href="/" className="header-brand" aria-label="PIPAA · Inicio">
          <img src="/pipaa-mark.svg" alt="PIPAA" width="92" height="35" />
        </a>

        <nav className="header-nav-dock" aria-label="Navegación principal">
          {NAV_ITEMS.map(([url, label]) => {
            const active = current === url;
            return (
              <a href={url} key={url} aria-current={active ? "page" : undefined}>
                {active && (
                  <motion.span
                    layoutId="site-nav-pill"
                    className="header-nav-pill"
                    transition={{ type: "spring", stiffness: 460, damping: 34 }}
                  />
                )}
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
        <MobileNav current={current} />

        <div className="header-utility-zone">
          <span className="header-clock" title="Hora actual en Argentina">
            <Clock size={12} aria-hidden="true" />
            <span>{argClockFormat.format(Date.now())} ARG</span>
          </span>
          <a className={`header-live-cta ${isLive ? "is-live" : ""}`} href="/directo/">
            {isLive ? <i className="header-live-dot" aria-hidden="true" /> : <Radio size={13} aria-hidden="true" />}
            <span>
              {isLive
                ? `En vivo · ${status!.live.map((p) => platformLabels[p]).join(" & ")}`
                : "Directo · 15:00 ARG"}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
