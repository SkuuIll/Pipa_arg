import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saturdayFor } from "../src/argentina-date";
import {
  CalendarDays,
  Clock,
  Copy,
  Crown,
  Gift,
  HeartHandshake,
  Maximize2,
  MessageSquare,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Search,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MobileNav, NAV_ITEMS } from "./components/SiteHeader";
import { LivePlayers } from "./LivePlayers";
import { MultiChat, PlatformBrandIcon, type CelebrationEvent } from "./MultiChat";
import { platformLabels, useLiveStatus } from "./useLiveStatus";
import type { DiaSubState, Platform } from "../src/dia-sub";

const platformNames = { kick: "Kick", twitch: "Twitch" } satisfies Record<Platform, string>;
const allPlatformNames = { kick: "Kick", twitch: "Twitch", youtube: "YouTube" } as const;
const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", timeZone: "UTC" });
const argClockFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});
const argHourFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "numeric",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

const diaSubCacheKey = "pipaa:diasub-cache:v1";
const diaSubCacheTtl = 12 * 3_600_000;
const ambientPrefKey = "pipaa:ambient:v1";
const soundPrefKey = "pipaa:celebration-sound:v1";

function readSoundPref(): boolean {
  try {
    return localStorage.getItem(soundPrefKey) !== "off";
  } catch {
    return true;
  }
}

function playCelebrationChime(kind: CelebrationEvent["kind"]) {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});

    const notes =
      kind === "gift"
        ? [587.33, 739.99, 880.0, 1174.66]
        : kind === "bits"
          ? [523.25, 659.25, 783.99, 1046.5]
          : kind === "donation"
            ? [440.0, 554.37, 659.25, 880.0]
            : [493.88, 622.25, 739.99, 987.77];

    const start = ctx.currentTime + 0.02;
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === notes.length - 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(freq, start + idx * 0.085);
      gain.gain.setValueAtTime(0.0001, start + idx * 0.085);
      gain.gain.exponentialRampToValueAtTime(0.045, start + idx * 0.085 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + idx * 0.085 + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start + idx * 0.085);
      osc.stop(start + idx * 0.085 + 0.45);
    });

    window.setTimeout(() => { void ctx.close().catch(() => {}); }, 1200);
  } catch {
    /* Optional audio feedback */
  }
}

type StreamMeta = { live: boolean; title: string | null; category: string | null };

function readDiaSubCache(): DiaSubState | null {
  try {
    const raw = localStorage.getItem(diaSubCacheKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { savedAt?: number; data?: DiaSubState };
    if (!parsed?.savedAt || !parsed.data || Date.now() - parsed.savedAt > diaSubCacheTtl) return null;
    if (parsed.data.date !== saturdayFor(Date.now()).date) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeDiaSubCache(data: DiaSubState) {
  try {
    localStorage.setItem(diaSubCacheKey, JSON.stringify({ savedAt: Date.now(), data }));
  } catch { /* Cache is optional */ }
}

function readAmbientPref() {
  try {
    return localStorage.getItem(ambientPrefKey) !== "off";
  } catch {
    return true;
  }
}

function sampleQuadrants(img: HTMLImageElement): [string, string, string, string] | null {
  try {
    const w = 48;
    const h = 27;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    // Sample strictly the inner gameplay core (central 60%) excluding
    // streamer webcam overlay (bottom-right corner) and HUD borders
    const sampleRegion = (x0: number, x1: number, y0: number, y1: number) => {
      let rw = 0, gw = 0, bw = 0, wSum = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          // Skip bottom-right corner where webcam overlay sits
          if (x > w * 0.72 && y > h * 0.55) continue;
          // Skip outermost 2px border (HUD/overlay frame)
          if (x < 3 || x >= w - 3 || y < 2 || y >= h - 2) continue;

          const i = (y * w + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max > 0 ? (max - min) / max : 0;

          // Heavily suppress near-pure green (stream overlay color)
          const greenDominance = g > 0 ? (g - Math.max(r, b)) / g : 0;
          if (greenDominance > 0.5 && sat > 0.6) continue;

          const lumWeight = max < 20 ? 0.05 : max > 240 && sat < 0.1 ? 0.12 : 1;
          const satBoost = sat > 0.25 ? 1 + sat * 2.4 : 0.3 + sat * 1.6;
          const weight = satBoost * lumWeight;
          rw += r * weight;
          gw += g * weight;
          bw += b * weight;
          wSum += weight;
        }
      }
      if (!wSum) return "rgba(109, 53, 219, 0.72)";
      let r = rw / wSum;
      let g = gw / wSum;
      let b = bw / wSum;

      // Boost saturation more aggressively for vivid ambient
      const mid = (r + g + b) / 3;
      const boost = 1.65;
      r = Math.max(0, Math.min(255, mid + (r - mid) * boost));
      g = Math.max(0, Math.min(255, mid + (g - mid) * boost));
      b = Math.max(0, Math.min(255, mid + (b - mid) * boost));

      // Lift dim colors so the aura is always visible
      const peak = Math.max(r, g, b);
      if (peak > 0 && peak < 165) {
        const lift = 165 / peak;
        r = Math.min(255, r * lift);
        g = Math.min(255, g * lift);
        b = Math.min(255, b * lift);
      }
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.92)`;
    };

    // Sample four quadrants from the inner gameplay area
    const cx = Math.floor(w * 0.5);
    const cy = Math.floor(h * 0.5);
    const mx = Math.floor(w * 0.18);
    const my = Math.floor(h * 0.18);
    const ex = Math.floor(w * 0.82);
    const ey = Math.floor(h * 0.82);
    return [
      sampleRegion(mx, cx, my, cy),
      sampleRegion(cx, ex, my, cy),
      sampleRegion(mx, cx, cy, ey),
      sampleRegion(cx, ex, cy, ey),
    ];
  } catch {
    return null;
  }
}

function DiaSubList({ snapshot, failed }: { snapshot: DiaSubState | null; failed: boolean }) {
  const [search, setSearch] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const entries = snapshot?.entries ?? [];
  const term = search.trim().replace(/^@/, "").toLowerCase();
  const results = entries.map((entry, index) => ({ ...entry, position: index + 1 }))
    .filter((entry) => !term || entry.name.toLowerCase().includes(term) || entry.gameName?.toLowerCase().includes(term));
  const activePlatforms = snapshot?.open.map((platform) => platformNames[platform]).join(" y ");
  const missingPlatforms = snapshot && (["kick", "twitch"] as const)
    .filter((platform) => !snapshot.connected.includes(platform))
    .map((platform) => platformNames[platform]).join(" y ");
  const status = failed ? "Conexión interrumpida"
    : snapshot?.status === "open" ? `Abierto en ${activePlatforms}`
      : snapshot?.status === "closed" ? "Inscripciones cerradas"
        : snapshot?.status === "waiting" ? "Esperando el directo"
          : snapshot?.status === "setup" ? "Pendiente de conexión" : "Cargando…";
  const closesAt = snapshot?.status === "open" && snapshot.expiresAt
    ? argClockFormat.format(snapshot.expiresAt)
    : undefined;

  return (
    <section className="diasub-panel" id="diasub" aria-labelledby="diasub-title">
      <div className="diasub-intro">
        <div className="diasub-intro-top">
          <span className="live-hub-label">
            <CalendarDays aria-hidden="true" size={14} /> Sábados · Hora argentina
          </span>
          <span role="status" className={`diasub-status-pill ${snapshot?.status === "open" && !failed ? "is-open" : ""}`}>
            {status}
          </span>
        </div>
        <h3 id="diasub-title">Día Sub</h3>
        <p>
          El sábado, si sos sub de PIPAA, escribí <code>!diasub TuNombreEnElJuego</code> en el chat de Kick o Twitch.
          {closesAt ? ` Ventana activa hasta las ${closesAt} ARG.` : " Tu usuario queda guardado por orden de llegada."}
        </p>
        <div className="diasub-copy-row">
          <button className="room-button" type="button" onClick={async () => {
            try {
              await navigator.clipboard.writeText("!diasub ");
              setCopyStatus("Comando copiado. Agregá tu nombre en el juego.");
            } catch {
              setCopyStatus("Copiá !diasub desde el texto.");
            }
            setTimeout(() => setCopyStatus(""), 2400);
          }}>
            <Copy size={13} aria-hidden="true" />
            <span>Copiar comando</span>
          </button>
          {copyStatus && <span className="diasub-copy-feedback" role="status">{copyStatus}</span>}
        </div>
      </div>

      <div className="diasub-list">
        <div className="diasub-list-heading">
          <h4>{snapshot && snapshot.status !== "setup" ? `Lista del ${dateFormat.format(new Date(snapshot.date))}` : "Lista de inscriptos"}</h4>
          {entries.length > 0 && (
            <span className="diasub-count">{entries.length} {entries.length === 1 ? "inscripto" : "inscriptos"}</span>
          )}
        </div>

        {entries.length > 0 && (
          <>
            <label className="diasub-search">
              <span className="sr-only">Buscar usuario</span>
              <div className="diasub-search-box">
                <Search size={14} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscá tu usuario o nombre en el juego…"
                />
                {search && (
                  <button
                    type="button"
                    className="diasub-search-clear"
                    onClick={() => setSearch("")}
                    aria-label="Limpiar búsqueda"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            </label>
            {results.length === 0 ? (
              <p className="diasub-empty" role="status">No encontramos ese usuario en la lista.</p>
            ) : (
              <ol aria-label="Inscriptos a Día Sub, por orden de llegada" tabIndex={0}>
                {results.map((entry) => (
                  <li key={`${entry.platform}-${entry.name}-${entry.position}`} className={entry.position <= 3 ? "is-top" : undefined}>
                    <span className="diasub-position" aria-label={`Puesto ${entry.position}`}>{entry.position}</span>
                    <span className="diasub-name"><strong>{entry.name}</strong><small>{entry.gameName ? `Juego: ${entry.gameName}` : "Nombre en el juego no informado"}</small></span>
                    <span className={`diasub-platform is-${entry.platform}`}>{platformNames[entry.platform]}</span>
                  </li>
                ))}
              </ol>
            )}
          </>
        )}

        <div className="diasub-note">
          {failed && !entries.length ? <p>La lista se reintentará automáticamente.</p>
            : missingPlatforms ? <p>Falta conectar {missingPlatforms} a Día Sub.</p>
              : snapshot && !entries.length ? <p>Todavía no hay inscriptos en esta jornada.</p> : null}
        </div>
      </div>
    </section>
  );
}

export function LiveHub() {
  const status = useLiveStatus();
  const [streamMeta, setStreamMeta] = useState<StreamMeta | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>();
  const [isSaturday, setIsSaturday] = useState(() => saturdayFor(Date.now()).isSaturday);
  const [diaSubSnapshot, setDiaSubSnapshot] = useState<DiaSubState | null>(() => readDiaSubCache());
  const [diaSubFailed, setDiaSubFailed] = useState(false);
  const [argTime, setArgTime] = useState(() => ({
    time: argClockFormat.format(Date.now()),
    inWindow: (() => {
      const h = parseInt(argHourFormat.format(Date.now()), 10);
      return h >= 15 && h < 24;
    })(),
  }));
  const [panel, setPanel] = useState<"chat" | "diasub">(
    typeof window !== "undefined" && window.location.hash === "#diasub" ? "diasub" : "chat",
  );
  const [theater, setTheater] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [ambient, setAmbient] = useState<boolean>(() => readAmbientPref());
  const [ambientTick, setAmbientTick] = useState(() => Math.floor(Date.now() / 10_000));
  const [ambientColors, setAmbientColors] = useState<[string, string, string, string] | null>(null);
  const [celebration, setCelebration] = useState<CelebrationEvent | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => readSoundPref());
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const celebrationQueueRef = useRef<CelebrationEvent[]>([]);
  const theaterButton = useRef<HTMLButtonElement>(null);

  const livePlatforms = useMemo(() => {
    const set = new Set<Platform>(status?.live ?? []);
    if (streamMeta?.live) set.add("kick");
    return [...set];
  }, [status?.live, streamMeta?.live]);

  const activePlatform: Platform = selectedPlatform ?? (livePlatforms.includes("kick") ? "kick" : livePlatforms[0] ?? "kick");

  useEffect(() => {
    if (livePlatforms.length) setSelectedPlatform((current) => current ?? activePlatform);
  }, [activePlatform, livePlatforms]);

  const showDiaSub = isSaturday || diaSubSnapshot?.status === "open";
  const diaSubOpen = diaSubSnapshot?.status === "open";
  const activePanel = showDiaSub ? panel : "chat";
  const isLive = livePlatforms.length > 0;

  useEffect(() => {
    const refresh = () => {
      const now = Date.now();
      setIsSaturday(saturdayFor(now).isSaturday);
      const h = parseInt(argHourFormat.format(now), 10);
      setArgTime({
        time: argClockFormat.format(now),
        inWindow: h >= 15 && h < 24,
      });
    };
    const timer = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refreshMeta() {
      try {
        const res = await fetch("/api/stream-meta", { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(5000)]) });
        if (res.ok && !controller.signal.aborted) {
          setStreamMeta(await res.json() as StreamMeta);
        }
      } catch { /* Non-blocking stream metadata */ }
      finally {
        if (!controller.signal.aborted) timer = setTimeout(refreshMeta, 45_000);
      }
    }
    void refreshMeta();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!ambient || !isLive) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setAmbientTick(Math.floor(Date.now() / 6_000));
    }, 6_000);
    return () => window.clearInterval(timer);
  }, [ambient, isLive]);

  useEffect(() => {
    if (!ambient || !isLive) {
      setAmbientColors(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setAmbientColors(sampleQuadrants(img));
    };
    img.onerror = () => {
      if (!cancelled) setAmbientColors(null);
    };
    img.src = `/api/ambient-preview?platform=${activePlatform}&t=${ambientTick}`;
    return () => {
      cancelled = true;
    };
  }, [ambient, isLive, activePlatform, ambientTick]);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;

    async function refreshDiaSub() {
      try {
        const response = await fetch("/api/diasub", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Día Sub no disponible");
        const data = await response.json() as DiaSubState;
        if (!controller.signal.aborted) {
          setDiaSubSnapshot(data);
          setDiaSubFailed(false);
          writeDiaSubCache(data);
        }
      } catch {
        if (!controller.signal.aborted) setDiaSubFailed(true);
      } finally {
        if (!controller.signal.aborted) {
          timer = setTimeout(refreshDiaSub, isSaturday ? 15_000 : 60_000);
        }
      }
    }

    void refreshDiaSub();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [isSaturday]);

  useEffect(() => {
    if (!showDiaSub && panel === "diasub") {
      setPanel("chat");
      if (location.hash === "#diasub") history.replaceState(history.state, "", "#chat");
    }
  }, [showDiaSub, panel]);

  useEffect(() => {
    const sync = () => {
      if (location.hash === "#diasub" || location.hash === "#chat") {
        setPanel(location.hash === "#diasub" ? "diasub" : "chat");
      }
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && theater) {
        setTheater(false);
        requestAnimationFrame(() => theaterButton.current?.focus({ preventScroll: true }));
        return;
      }
      if (
        (event.key === "f" || event.key === "F") &&
        !event.metaKey && !event.ctrlKey && !event.altKey &&
        !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement)
      ) {
        setTheater((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [theater]);

  const toggleAmbient = () => {
    setAmbient((prev) => {
      const next = !prev;
      try { localStorage.setItem(ambientPrefKey, next ? "on" : "off"); } catch { /* Optional */ }
      return next;
    });
  };

  const handleCelebration = useCallback((event: CelebrationEvent) => {
    setCelebration((current) => {
      if (!current) return event;
      if (current.id === event.id || celebrationQueueRef.current.some((e) => e.id === event.id)) {
        return current;
      }
      celebrationQueueRef.current = [...celebrationQueueRef.current.slice(-4), event];
      return current;
    });
  }, []);

  const dismissCelebration = () => {
    const next = celebrationQueueRef.current.shift() ?? null;
    setCelebration(next);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(soundPrefKey, next ? "on" : "off"); } catch { /* Optional */ }
      if (next) playCelebrationChime("sub");
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (new URLSearchParams(window.location.search).get("celebracion") === "1") {
      handleCelebration({
        id: `demo-${Date.now()}`,
        kind: "donation",
        platform: "kick",
        author: "PanzaArmy",
        headline: "¡NUEVA DONACIÓN EN VIVO!",
        detail: "PanzaArmy mandó aguante para el stream de PIPAA",
      });
    }
  }, [handleCelebration]);

  useEffect(() => {
    if (!celebration) return;
    if (soundEnabledRef.current) playCelebrationChime(celebration.kind);
    const timer = window.setTimeout(() => {
      const next = celebrationQueueRef.current.shift() ?? null;
      setCelebration(next);
    }, 10_500);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const ambientStyle = ambientColors ? ({
    "--amb-1": ambientColors[0],
    "--amb-2": ambientColors[1],
    "--amb-3": ambientColors[2],
    "--amb-4": ambientColors[3],
  } as React.CSSProperties) : undefined;

  return (
    <section
      className={`live-hub ${theater ? "live-hub--cinema" : ""} ${celebration ? `is-celebrating is-celebrating-${celebration.kind}` : ""}`}
      data-ambient={ambient ? "on" : "off"}
      id="comunidad"
      aria-labelledby="live-hub-title"
      role={theater ? "dialog" : undefined}
      aria-modal={theater || undefined}
    >
      {celebration && (
        <div key={`confetti-${celebration.id}`} className="live-celebration-confetti" aria-hidden="true">
          {Array.from({ length: 38 }, (_, i) => (
            <span
              key={i}
              style={{
                "--cx": `${((i * 2.65 + (i % 5) * 1.1) % 98).toFixed(1)}%`,
                "--cd": `${((i % 9) * 0.16).toFixed(2)}s`,
                "--ct": `${(3.1 + (i % 5) * 0.45).toFixed(2)}s`,
                "--cr": `${((i % 2 === 0 ? 1 : -1) * (240 + i * 19))}deg`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
      <header className="room-heading">
        <div className="room-head-left">
          <a href="/" className="header-brand" aria-label="PIPAA · Inicio">
            <img src="/pipa-avatar-v2.webp" alt="PIPAA" width="48" height="48" />
          </a>
          <h1 id="live-hub-title" className="sr-only">Sala de directo</h1>
          <span className="header-brand-divider" aria-hidden="true" />
          {isLive ? (
            <span className="room-status-tag is-live">
              <i aria-hidden="true" />
              En vivo · {livePlatforms.map((p) => platformLabels[p]).join(" & ")}
            </span>
          ) : (
            <span className="room-status-tag">
              <i aria-hidden="true" />
              {status?.known ? "Offline · 15:00 ARG" : "Kick & Twitch"}
            </span>
          )}
          {diaSubOpen && (
            <button
              type="button"
              className="room-diasub-live-btn"
              onClick={() => {
                setChatOpen(true);
                setPanel("diasub");
              }}
            >
              <CalendarDays size={13} aria-hidden="true" />
              <span>Día Sub</span>
            </button>
          )}
        </div>

        {!theater && (
          <nav className="header-nav-dock room-nav-center" aria-label="Navegación principal">
            {NAV_ITEMS.map(([url, label]) => {
              const active = url === "/directo/";
              return (
                <a href={url} key={url} aria-current={active ? "page" : undefined}>
                  {active && (
                    <motion.span
                      layoutId="room-nav-pill"
                      className="header-nav-pill"
                      transition={{ type: "spring", stiffness: 460, damping: 34 }}
                    />
                  )}
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>
        )}

        {!theater && <MobileNav current="/directo/" />}

        <div className="room-actions">
          <span className="room-clock-readout" title="Horario habitual de directo: todos los días de 15:00 a 00:00 hora Argentina">
            <Clock size={12} aria-hidden="true" />
            <span>{argTime.time} ARG</span>
          </span>

          <button
            type="button"
            className={`room-ghost-btn ${ambient ? "is-on" : ""}`}
            aria-pressed={ambient}
            onClick={toggleAmbient}
            title="Activar o desactivar luz ambiental dinámica del video"
          >
            <Sparkles size={14} aria-hidden="true" />
            <span>Ambiente</span>
          </button>

          <button
            type="button"
            className={`room-ghost-btn is-icon ${soundEnabled ? "is-on" : ""}`}
            aria-pressed={soundEnabled}
            onClick={toggleSound}
            title={soundEnabled ? "Sonido de alertas activo (clic para silenciar)" : "Sonido de alertas silenciado (clic para activar)"}
            aria-label={soundEnabled ? "Silenciar alertas de subs y donaciones" : "Activar sonido en alertas"}
          >
            {soundEnabled ? <Volume2 size={14} aria-hidden="true" /> : <VolumeX size={14} aria-hidden="true" />}
          </button>

          <button
            type="button"
            className="room-ghost-btn room-chat-toggle"
            aria-expanded={chatOpen}
            aria-controls="room-community"
            onClick={() => setChatOpen((prev) => !prev)}
          >
            {chatOpen ? <PanelRightClose size={14} aria-hidden="true" /> : <PanelRightOpen size={14} aria-hidden="true" />}
            <span>{chatOpen ? "Chat" : showDiaSub ? "Chat · Día Sub" : "Mostrar chat"}</span>
          </button>

          <button
            ref={theaterButton}
            type="button"
            className={`room-cinema-cta ${theater ? "is-active" : ""}`}
            aria-pressed={theater}
            onClick={() => setTheater((prev) => !prev)}
            title="Atajo de teclado: F"
          >
            {theater ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
            <span>{theater ? "Salir" : "Modo cine"}</span>
          </button>
        </div>
      </header>

      <div className={`live-hub-grid ${chatOpen ? "" : "is-theater"}`}>
        <div className="live-player-stage">
          {ambient && (
            <div className="live-ambient-aura" style={ambientStyle} aria-hidden="true" />
          )}
          <AnimatePresence>
            {celebration && (
              <motion.div
                key={celebration.id}
                className={`live-celebration-banner is-${celebration.kind}`}
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -18, x: "-50%", scale: 0.94 }}
                animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                exit={{ opacity: 0, y: -12, x: "-50%", scale: 0.96 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
              >
                <span className="live-celebration-icon" aria-hidden="true">
                  {celebration.kind === "gift" ? (
                    <Gift size={18} />
                  ) : celebration.kind === "bits" ? (
                    <Sparkles size={18} />
                  ) : celebration.kind === "donation" ? (
                    <HeartHandshake size={18} />
                  ) : (
                    <Crown size={18} />
                  )}
                </span>
                <div className="live-celebration-copy">
                  <div className="live-celebration-top">
                    <strong>{celebration.headline}</strong>
                    <span className={`live-celebration-platform is-${celebration.platform}`}>
                      <PlatformBrandIcon platform={celebration.platform} size={10} />
                      <span>{allPlatformNames[celebration.platform]}</span>
                    </span>
                  </div>
                  <span className="live-celebration-detail">{celebration.detail}</span>
                </div>
                <button
                  type="button"
                  className="live-celebration-close"
                  onClick={dismissCelebration}
                  aria-label="Cerrar alerta"
                >
                  <X size={13} aria-hidden="true" />
                </button>
                <span className="live-celebration-progress" aria-hidden="true" />
              </motion.div>
            )}
          </AnimatePresence>
          <LivePlayers
            status={status}
            active={activePlatform}
            onSelect={setSelectedPlatform}
            livePlatforms={livePlatforms}
          />
          {!theater && (
            <div className="live-stream-footer">
              <div className="live-stream-footer-main">
                <img src="/pipa-avatar-v2.webp" alt="" width="34" height="34" />
                <div className="live-stream-footer-copy">
                  <strong>
                    {streamMeta?.title && streamMeta.live ? streamMeta.title : "Directo de PIPAA · Panza Army"}
                  </strong>
                  <span>
                    {isLive
                      ? `Transmitiendo en vivo por ${livePlatforms.map((p) => platformLabels[p]).join(" y ")}`
                      : "Todos los días · 15:00 a 00:00 ARG"}
                  </span>
                </div>
              </div>
              {streamMeta?.category && streamMeta.live && (
                <div className="live-stream-footer-actions">
                  <span className="room-category-pill">{streamMeta.category}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <aside id="room-community" className="room-side" hidden={!chatOpen} aria-label="Comunidad del directo">
          {showDiaSub && (
            <nav className="room-controls" aria-label="Panel de la sala">
              <a
                href="#chat"
                aria-current={activePanel === "chat" ? "location" : undefined}
                onClick={() => setPanel("chat")}
              >
                <MessageSquare size={14} aria-hidden="true" />
                <span>Chat</span>
              </a>
              <a
                href="#diasub"
                aria-current={activePanel === "diasub" ? "location" : undefined}
                onClick={() => setPanel("diasub")}
              >
                <CalendarDays size={14} aria-hidden="true" />
                <span>Día Sub</span>
                {diaSubOpen && <i className="diasub-tab-dot" aria-label="Abierto" />}
              </a>
            </nav>
          )}
          <div id="chat" hidden={activePanel !== "chat"}>
            <MultiChat onCelebration={handleCelebration} />
          </div>
          {showDiaSub && (
            <div hidden={activePanel !== "diasub"}>
              <DiaSubList snapshot={diaSubSnapshot} failed={diaSubFailed} />
            </div>
          )}
        </aside>
      </div>

      {!theater && (
        <footer className="room-footer" aria-label="Pie de página de la sala">
          <span className="room-footer-copy">PIPAA · Panza Army · Argentina</span>
          <nav className="room-footer-links" aria-label="Enlaces legales y de navegación">
            <a href="/comandos/">Tienda</a>
            <span aria-hidden="true">·</span>
            <a href="/videos/">Videos</a>
            <span aria-hidden="true">·</span>
            <a href="/legales/">Avisos legales</a>
          </nav>
        </footer>
      )}
    </section>
  );
}
