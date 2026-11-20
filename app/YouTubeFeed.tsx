"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Film, Play, ExternalLink, X } from "lucide-react";

import type { Video, VideoSnapshot } from "../src/youtube-feed";

function formatRelativeDate(dateStr: string): string {
  if (
    dateStr.startsWith("Hace ") ||
    dateStr.startsWith("hace ") ||
    dateStr === "Ayer" ||
    dateStr === "Recién subido" ||
    dateStr === "Reciente"
  ) {
    return dateStr;
  }
  try {
    const pubDate = new Date(dateStr);
    if (isNaN(pubDate.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - pubDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Recién subido";
    if (diffHours === 1) return "Hace 1 hora";
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? "Hace 1 semana" : `Hace ${weeks} semanas`;
    }
    return pubDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export function YouTubeFeed({ compact = false }: { compact?: boolean }) {
  const [snapshot, setSnapshot] = useState<(VideoSnapshot & { stale: boolean }) | null>(null);
  const [failed, setFailed] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<Video | null>(null);
  const [limit, setLimit] = useState(12);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const lifecycle = new AbortController();
    let pending = false;

    async function loadVideos() {
      if (pending || document.hidden) return;
      pending = true;
      try {
        const response = await fetch("/api/youtube", {
          signal: AbortSignal.any([lifecycle.signal, AbortSignal.timeout(10000)]),
        });
        if (!response.ok) throw new Error("YouTube API no disponible");
        const data = (await response.json()) as VideoSnapshot & { stale: boolean };
        if (!Array.isArray(data.videos) || data.videos.length === 0) {
          throw new Error("Respuesta de videos vacía");
        }
        if (!lifecycle.signal.aborted) {
          setSnapshot(data);
          setFailed(false);
        }
      } catch {
        // Fallback robusto a public/youtube-latest.json
        try {
          const fallbackRes = await fetch("/youtube-latest.json", {
            signal: AbortSignal.any([lifecycle.signal, AbortSignal.timeout(6000)]),
          });
          if (fallbackRes.ok) {
            const fallbackList = (await fallbackRes.json()) as (Video & { link?: string })[];
            if (Array.isArray(fallbackList) && fallbackList.length > 0 && !lifecycle.signal.aborted) {
              setSnapshot({
                updatedAt: new Date().toISOString(),
                videos: fallbackList.map((item) => ({
                  id: item.id,
                  title: item.title,
                  published: item.published,
                  thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`,
                  duration: item.duration,
                  views: item.views,
                  kind: "upload",
                })),
                stale: false,
              });
              setFailed(false);
              return;
            }
          }
        } catch {
          /* Fallback estático no disponible */
        }

        if (!lifecycle.signal.aborted) setFailed(true);
      } finally {
        pending = false;
      }
    }

    void loadVideos();
    // Sondeo de actualización horaria (cada 60 minutos)
    const timer = window.setInterval(() => void loadVideos(), 60 * 60_000);
    document.addEventListener("visibilitychange", loadVideos);
    window.addEventListener("focus", loadVideos);
    return () => {
      lifecycle.abort();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", loadVideos);
      window.removeEventListener("focus", loadVideos);
    };
  }, []);

  useEffect(() => {
    if (!playingVideo) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPlayingVideo(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastTriggerRef.current?.focus({ preventScroll: true });
    };
  }, [playingVideo]);

  const openVideo = (video: Video, trigger: HTMLElement | null) => {
    lastTriggerRef.current = trigger;
    setPlayingVideo(video);
  };

  const allVideos = snapshot?.videos ?? [];
  // Exclusivamente videos subidos oficiales, sin directos ni emisiones
  const uploadedVideos = allVideos.filter((video) => video.kind === "upload" || !video.kind);

  return (
    <div className="yt-feed-container">
      {/* Barra de estado: canal oficial y acceso a YouTube */}
      <div className="yt-tabs-bar">
        <div className="yt-tabs-switcher">
          <div className="yt-tab-btn is-active" style={{ cursor: "default" }}>
            <Film size={15} aria-hidden="true" />
            <span>Videos subidos oficiales</span>
          </div>
        </div>

        <a
          href="https://www.youtube.com/@PIPAArg/videos"
          target="_blank"
          rel="noreferrer"
          className="yt-channel-subscribe-link"
        >
          <span>Canal de YouTube @PIPAArg</span>
          <ExternalLink size={14} aria-hidden="true" />
        </a>
      </div>

      {/* Modal Reproductor Embebido */}
      {playingVideo &&
        createPortal(
          <div
            className="yt-player-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`Reproductor: ${playingVideo.title}`}
            onClick={() => setPlayingVideo(null)}
          >
            <div className="yt-player-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="yt-player-modal-bar">
                <p className="yt-player-modal-title">{playingVideo.title}</p>
                <button
                  ref={closeButtonRef}
                  type="button"
                  className="yt-player-modal-close"
                  onClick={() => setPlayingVideo(null)}
                  aria-label="Cerrar reproductor de video"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="yt-player-responsive-wrapper">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${playingVideo.id}?autoplay=1&rel=0`}
                  title={playingVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {(failed || snapshot?.stale) && (
        <p role="status">
          {snapshot
            ? "Mostrando la última lista disponible de videos."
            : "La lista no se pudo cargar. Podés abrir el canal de YouTube."}
        </p>
      )}
      {!snapshot && !failed ? (
        <div className="yt-feed-loading">
          <span className="live-indicator-dot" />
          <span>Sincronizando últimos videos de YouTube...</span>
        </div>
      ) : uploadedVideos.length === 0 ? (
        <div className="yt-feed-empty" role="status">
          <p>No hay videos disponibles en este momento.</p>
          <a
            href="https://www.youtube.com/@PIPAArg/videos"
            target="_blank"
            rel="noreferrer"
            className="yt-direct-link"
          >
            Ver videos en YouTube ↗
          </a>
        </div>
      ) : (
        <div className="yt-feed-grid">
          {uploadedVideos.slice(0, compact ? 3 : limit).map((video, index) => (
            <article key={video.id || index} className="yt-video-card" data-reveal>
              <button
                type="button"
                className="yt-thumb-wrapper"
                aria-label={`Reproducir ${video.title}`}
                onClick={(event) => openVideo(video, event.currentTarget)}
              >
                <img
                  src={video.thumbnail}
                  alt=""
                  loading="lazy"
                  width="480"
                  height="270"
                  className="yt-thumb-img"
                />
                {index === 0 && !snapshot?.stale && !failed && (
                  <span className="yt-new-badge">ÚLTIMO VIDEO</span>
                )}
                {video.duration && (
                  <span className="yt-duration-badge">{video.duration}</span>
                )}
                <div className="yt-play-overlay" aria-hidden="true">
                  <span className="yt-play-icon">
                    <Play size={20} fill="currentColor" />
                  </span>
                </div>
              </button>

              <div className="yt-card-content">
                <div className="yt-card-meta">
                  <span className="yt-time-badge">{formatRelativeDate(video.published)}</span>
                  {video.views && <span className="yt-views-badge" style={{ fontSize: "0.72rem", color: "#a597c4" }}>{video.views}</span>}
                  <span className="yt-channel-tag">VIDEO</span>
                </div>

                <h3 className="yt-card-title" title={video.title}>
                  {video.title}
                </h3>

                <div className="yt-card-actions">
                  <button
                    type="button"
                    className="yt-play-btn"
                    onClick={(event) => openVideo(video, event.currentTarget)}
                  >
                    <Play size={12} fill="currentColor" aria-hidden="true" /> Ver acá
                  </button>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="yt-direct-link"
                    title="Abrir en YouTube"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <span>YouTube</span>
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Botón para ver más en el canal */}
      <div className="yt-more-footer">
        {!compact && uploadedVideos.length > limit && (
          <button
            type="button"
            className="room-button"
            onClick={() => setLimit(limit + 12)}
          >
            Cargar más videos
          </button>
        )}
        <a
          href="https://www.youtube.com/@PIPAArg/videos"
          target="_blank"
          rel="noreferrer"
          className="button button-outline yt-more-btn"
        >
          <span>Ver todos los videos subidos en YouTube</span>
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
