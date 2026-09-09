"use client";

import { useState, useEffect } from "react";
import { Film, Radio, Play, ExternalLink, X } from "lucide-react";

export interface YouTubeVideo {
  id: string;
  title: string;
  link: string;
  published: string;
  thumbnail: string;
  views?: string;
  duration?: string;
  isStream?: boolean;
}

// Fallback inicial garantizado con los videos reales editados del canal
const INITIAL_UPLOADED_VIDEOS: YouTubeVideo[] = [
  {
    id: "Pvih_RD6cAI",
    title: "20 KILLS EN ESTA PARTIDA DE PUBG",
    link: "https://www.youtube.com/watch?v=Pvih_RD6cAI",
    published: "Hace 2 días",
    views: "539 vistas",
    duration: "14:22",
    thumbnail: "https://i.ytimg.com/vi/Pvih_RD6cAI/hqdefault.jpg",
    isStream: false,
  },
  {
    id: "jY52A2KoT1E",
    title: "RETO POR 20 DOLARES USANDO ESCOPETA",
    link: "https://www.youtube.com/watch?v=jY52A2KoT1E",
    published: "Hace 3 días",
    views: "1.1K vistas",
    duration: "18:45",
    thumbnail: "https://i.ytimg.com/vi/jY52A2KoT1E/hqdefault.jpg",
    isStream: false,
  },
  {
    id: "TtLKE8z5aec",
    title: "Revivimos el Bullying en esta partida con el chico Azzul",
    link: "https://www.youtube.com/watch?v=TtLKE8z5aec",
    published: "Hace 5 días",
    views: "890 vistas",
    duration: "16:10",
    thumbnail: "https://i.ytimg.com/vi/TtLKE8z5aec/hqdefault.jpg",
    isStream: false,
  },
  {
    id: "ncJV6dLEcJg",
    title: "Partida ÉPICA en pubg",
    link: "https://www.youtube.com/watch?v=ncJV6dLEcJg",
    published: "Hace 1 semana",
    views: "1.4K vistas",
    duration: "22:05",
    thumbnail: "https://i.ytimg.com/vi/ncJV6dLEcJg/hqdefault.jpg",
    isStream: false,
  },
  {
    id: "OhoJGgcXK_I",
    title: "El rey de las granadas! 20 kills en rondo",
    link: "https://www.youtube.com/watch?v=OhoJGgcXK_I",
    published: "Hace 2 semanas",
    views: "2.1K vistas",
    duration: "19:30",
    thumbnail: "https://i.ytimg.com/vi/OhoJGgcXK_I/hqdefault.jpg",
    isStream: false,
  },
  {
    id: "vuH8iMwV6T8",
    title: "Charla epica + KILLS INCREIBLES!",
    link: "https://www.youtube.com/watch?v=vuH8iMwV6T8",
    published: "Hace 2 semanas",
    views: "1.8K vistas",
    duration: "15:40",
    thumbnail: "https://i.ytimg.com/vi/vuH8iMwV6T8/hqdefault.jpg",
    isStream: false,
  },
];

function isLiveStreamTitle(title: string): boolean {
  const lower = title.toLowerCase();
  return (
    lower.includes("!codigo") ||
    lower.includes("buenas gordos") ||
    lower.includes("mucha panza") ||
    lower.includes("scrims") ||
    lower.includes("jugar con subs") ||
    lower.includes("directo") ||
    lower.includes("en vivo")
  );
}

function formatRelativeDate(dateStr: string): string {
  if (dateStr.startsWith("Hace ") || dateStr === "Ayer" || dateStr === "Recién subido") {
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
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    return pubDate.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export function YouTubeFeed() {
  const [activeTab, setActiveTab] = useState<"uploads" | "streams">("uploads");
  const [uploadedVideos, setUploadedVideos] = useState<YouTubeVideo[]>(INITIAL_UPLOADED_VIDEOS);
  const [streamVideos, setStreamVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      // 1. Cargar archivo local actualizado con todos los videos subidos
      try {
        const localRes = await fetch("./youtube-latest.json");
        if (localRes.ok) {
          const localData: YouTubeVideo[] = await localRes.json();
          if (isMounted && Array.isArray(localData) && localData.length > 0) {
            setUploadedVideos(localData);
          }
        }
      } catch {
        // Usa INITIAL_UPLOADED_VIDEOS
      }

      // 2. Consulta en vivo al RSS de YouTube
      try {
        const rssUrl = encodeURIComponent("https://www.youtube.com/feeds/videos.xml?channel_id=UC1yPRd95ALNsrNQAuarFSjw");
        const liveRes = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`, {
          signal: AbortSignal.timeout(6000),
        });

        if (liveRes.ok) {
          const liveJson = await liveRes.json();
          if (liveJson.status === "ok" && Array.isArray(liveJson.items) && liveJson.items.length > 0) {
            const parsedStreams: YouTubeVideo[] = [];
            const newUploads: YouTubeVideo[] = [];

            for (const item of liveJson.items) {
              const rawId = item.guid?.replace("yt:video:", "") || "";
              const title = item.title || "Video de PIPAA";
              const videoObj: YouTubeVideo = {
                id: rawId,
                title,
                link: item.link || `https://www.youtube.com/watch?v=${rawId}`,
                published: formatRelativeDate(item.pubDate || new Date().toISOString()),
                thumbnail: item.thumbnail || `https://i.ytimg.com/vi/${rawId}/hqdefault.jpg`,
                isStream: isLiveStreamTitle(title),
              };

              if (videoObj.isStream) {
                parsedStreams.push(videoObj);
              } else {
                newUploads.push(videoObj);
              }
            }

            if (isMounted) {
              if (parsedStreams.length > 0) {
                setStreamVideos(parsedStreams);
              }
              // Si hay un video subido recién detectado que no está en la lista estática, lo agregamos al inicio
              if (newUploads.length > 0) {
                setUploadedVideos((prev) => {
                  const existingIds = new Set(prev.map((v) => v.id));
                  const additions = newUploads.filter((v) => !existingIds.has(v.id));
                  return [...additions, ...prev];
                });
              }
            }
          }
        }
      } catch {
        // Fallback silencioso
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadVideos();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentList = activeTab === "uploads" ? uploadedVideos : streamVideos;

  return (
    <div className="yt-feed-container">
      {/* Controles de Pestañas: Videos Subidos vs Directos */}
      <div className="yt-tabs-bar">
        <div className="yt-tabs-switcher">
          <button
            type="button"
            className={`yt-tab-btn ${activeTab === "uploads" ? "is-active" : ""}`}
            onClick={() => setActiveTab("uploads")}
          >
            <Film className="w-4 h-4 text-acid" />
            <span>Videos Subidos ({uploadedVideos.length})</span>
            <span className="yt-tab-badge">EDITADOS</span>
          </button>
          <button
            type="button"
            className={`yt-tab-btn ${activeTab === "streams" ? "is-active" : ""}`}
            onClick={() => setActiveTab("streams")}
          >
            <Radio className="w-4 h-4 text-red-500" />
            <span>Directos Anteriores {streamVideos.length > 0 ? `(${streamVideos.length})` : ""}</span>
            <span className="yt-tab-badge stream">VODs</span>
          </button>
        </div>

        <a
          href="https://www.youtube.com/@PIPAArg/videos"
          target="_blank"
          rel="noreferrer"
          className="yt-channel-subscribe-link"
        >
          <span>Canal de YouTube @PIPAArg</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Modal Reproductor Embebido */}
      {playingVideoId && (
        <div className="yt-player-modal-backdrop" onClick={() => setPlayingVideoId(null)}>
          <div className="yt-player-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="yt-player-modal-close"
              onClick={() => setPlayingVideoId(null)}
              aria-label="Cerrar reproductor de video"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="yt-player-responsive-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1&rel=0`}
                title="Reproductor de YouTube de PIPAA"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {loading && currentList.length === 0 ? (
        <div className="yt-feed-loading">
          <span className="live-indicator-dot" />
          <span>Sincronizando últimos videos de YouTube...</span>
        </div>
      ) : (
        <div className="yt-feed-grid">
          {currentList.slice(0, 6).map((video, index) => (
            <article key={video.id || index} className="yt-video-card" data-reveal>
              <div className="yt-thumb-wrapper" onClick={() => setPlayingVideoId(video.id)}>
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  loading="lazy"
                  width="480"
                  height="270"
                  className="yt-thumb-img"
                />
                {index === 0 && activeTab === "uploads" && (
                  <span className="yt-new-badge">ÚLTIMO VIDEO SUBIDO</span>
                )}
                {video.duration && (
                  <span className="yt-duration-badge" title="Duración del video">
                    {video.duration}
                  </span>
                )}
                <div className="yt-play-overlay">
                  <span className="yt-play-icon" aria-hidden="true">
                    <Play className="w-5 h-5 fill-current" />
                  </span>
                </div>
              </div>

              <div className="yt-card-content">
                <div className="yt-card-meta">
                  <span className="yt-time-badge">{video.published}</span>
                  {video.views && (
                    <span className="yt-views-pill">{video.views}</span>
                  )}
                  <span className="yt-channel-tag">
                    {activeTab === "uploads" ? "VIDEO EDITADO" : "VOD TRANSMISIÓN"}
                  </span>
                </div>

                <h3 className="yt-card-title" title={video.title}>
                  {video.title}
                </h3>

                <div className="yt-card-actions">
                  <button
                    type="button"
                    className="yt-play-btn"
                    onClick={() => setPlayingVideoId(video.id)}
                  >
                    <Play className="w-3 h-3 fill-current" /> Ver acá
                  </button>
                  <a
                    href={video.link}
                    target="_blank"
                    rel="noreferrer"
                    className="yt-direct-link"
                    title="Abrir en YouTube"
                    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Botón para ver más en el canal */}
      <div className="yt-more-footer">
        <a
          href="https://www.youtube.com/@PIPAArg/videos"
          target="_blank"
          rel="noreferrer"
          className="button button-outline yt-more-btn"
        >
          <span>Ver todos los videos subidos en YouTube</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
