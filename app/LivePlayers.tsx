import { useEffect, useState } from "react";
import { ArrowUpRight, Film, Radio, X } from "lucide-react";
import { PlatformBrandIcon } from "./MultiChat";
import { platformLabels, type LiveStatus } from "./useLiveStatus";
import type { Platform } from "../src/dia-sub";

const channelUrls: Record<Platform, string> = {
  kick: "https://kick.com/pipa_arg",
  twitch: "https://www.twitch.tv/pipa_arg",
};

const argHourFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "numeric",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

function getPlayerSrc(platform: Platform, hostname: string) {
  if (platform === "kick") {
    return "https://player.kick.com/pipa_arg?autoplay=true&muted=false";
  }
  return `https://player.twitch.tv/?channel=pipa_arg&parent=${encodeURIComponent(hostname)}&autoplay=true&muted=false`;
}

function getTimeUntilStream(): string | null {
  const h = parseInt(argHourFormat.format(Date.now()), 10);
  if (h >= 15 && h < 24) return null; // Already in stream window
  const remaining = h < 15 ? 15 - h : 24 - h + 15;
  if (remaining === 1) return "~1 hora";
  return `~${remaining} horas`;
}

export function LivePlayers({
  status,
  active,
  onSelect,
  livePlatforms,
}: {
  status?: LiveStatus;
  active: Platform;
  onSelect: (platform: Platform) => void;
  livePlatforms: Platform[];
}) {
  const [frameReady, setFrameReady] = useState(false);
  const [dismissedOffline, setDismissedOffline] = useState(false);

  const other: Platform = active === "kick" ? "twitch" : "kick";
  const otherIsLive = livePlatforms.includes(other);
  const activeIsLive = livePlatforms.includes(active);
  const activeConfirmedOffline = Boolean(!activeIsLive && (status?.offline?.includes(active) || (status?.known && !livePlatforms.includes(active))));
  const showOfflineStrip = Boolean(activeConfirmedOffline && !dismissedOffline);
  const timeUntil = !activeIsLive ? getTimeUntilStream() : null;

  useEffect(() => {
    setFrameReady(false);
    setDismissedOffline(false);
  }, [active]);

  const hostname = typeof window !== "undefined" ? window.location.hostname : "pipaa.store";
  const name = platformLabels[active];
  const player = getPlayerSrc(active, hostname);

  return (
    <div className="live-player" data-platform={active}>
      <div className="live-player-controls">
        <div className="platform-switch" role="group" aria-label="Plataforma de video">
          {(["kick", "twitch"] as const).map((platform) => {
            const isLive = livePlatforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                aria-pressed={active === platform}
                onClick={() => onSelect(platform)}
                className={active === platform ? "is-active" : ""}
              >
                <PlatformBrandIcon platform={platform} size={13} />
                <span>{platformLabels[platform]}</span>
                {isLive && <span className="platform-live-badge"><i aria-hidden="true" />En vivo</span>}
              </button>
            );
          })}
        </div>

        <div className="live-player-meta">
          {(status?.known || activeIsLive) && (
            <span className={`player-signal-pill ${activeIsLive ? "is-live" : ""}`}>
              <Radio size={13} aria-hidden="true" />
              {activeIsLive ? "Transmitiendo" : "Offline"}
            </span>
          )}
          <a
            className="live-player-link"
            href={channelUrls[active]}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>Abrir en {name}</span>
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className={`live-player-screen ${frameReady ? "is-ready" : ""}`}>
        {!frameReady && (
          <div className="live-player-skeleton" aria-hidden="true">
            <span className="live-skeleton-badge">Cargando señal de {name}…</span>
          </div>
        )}
        <iframe
          key={active}
          src={player}
          title={`Directo de PIPAA en ${name}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setFrameReady(true)}
        />
      </div>

      {showOfflineStrip && (
        <div className="live-offline-strip" role="status">
          {otherIsLive ? (
            <>
              <p>
                No está transmitiendo en {name}, pero <strong>está en vivo en {platformLabels[other]}</strong>.
              </p>
              <button
                type="button"
                className="room-button is-accent"
                onClick={() => onSelect(other)}
              >
                Cambiar a {platformLabels[other]}
              </button>
            </>
          ) : (
            <>
              <p>
                Fuera de vivo · Horario habitual: <strong>15:00 a 00:00 ARG</strong>.
                {timeUntil && (
                  <> Falta {timeUntil} aprox.</>
                )}
              </p>
              <a className="room-button" href="/videos/">
                <Film size={14} aria-hidden="true" />
                <span>Ver últimos videos</span>
              </a>
            </>
          )}
          <button
            type="button"
            className="offline-dismiss"
            onClick={() => setDismissedOffline(true)}
            aria-label="Ocultar aviso"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
