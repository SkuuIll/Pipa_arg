import { DurableObject } from "cloudflare:workers";
import { XMLParser } from "fast-xml-parser";

export type Video = {
  id: string;
  title: string;
  published: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  kind: "upload" | "replay" | "live" | "upcoming" | "unclassified";
};

export type VideoSnapshot = { updatedAt: string; videos: Video[] };
export type VideoEnv = {
  YOUTUBE_FEED: DurableObjectNamespace<YouTubeFeedStore>;
  YOUTUBE_API_KEY?: string;
};

const channelId = "UC1yPRd95ALNsrNQAuarFSjw";
const channelHandle = "@PIPAArg";
const refreshInterval = 60 * 60_000; // Sondeo cada 1 hora

function video(
  id: string,
  title: string,
  published: string,
  kind: Video["kind"],
  duration?: string,
  views?: string,
): Video {
  if (!/^[\w-]{11}$/.test(id) || !title) {
    throw new Error("Publicación de YouTube inválida");
  }
  return {
    id,
    title,
    published,
    kind,
    duration,
    views,
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  };
}

/**
 * Sondea directamente la pestaña /videos del canal oficial de YouTube (@PIPAArg).
 * La pestaña /videos contiene EXCLUSIVAMENTE videos subidos (no transmisiones ni directos).
 */
async function scrapeVideosTab(): Promise<Video[]> {
  const response = await fetch(`https://www.youtube.com/${channelHandle}/videos`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "es-AR,es;q=0.9,en;q=0.8",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`YouTube /videos HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/) || html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (!match) throw new Error("ytInitialData no encontrado en la pestaña de videos");

  const data = JSON.parse(match[1]) as {
    contents?: {
      twoColumnBrowseResultsRenderer?: {
        tabs?: {
          tabRenderer?: {
            title?: string;
            selected?: boolean;
            content?: {
              richGridRenderer?: {
                contents?: {
                  richItemRenderer?: {
                    content?: {
                      lockupViewModel?: {
                        contentId?: string;
                        metadata?: {
                          lockupMetadataViewModel?: {
                            title?: { content?: string };
                            metadata?: {
                              contentMetadataViewModel?: {
                                metadataRows?: {
                                  metadataParts?: {
                                    text?: { content?: string };
                                    accessibilityLabel?: string;
                                  }[];
                                }[];
                              };
                            };
                          };
                        };
                        contentImage?: {
                          thumbnailViewModel?: {
                            overlays?: {
                              thumbnailBottomOverlayViewModel?: {
                                badges?: {
                                  thumbnailBadgeViewModel?: { text?: string };
                                }[];
                              };
                            }[];
                          };
                        };
                        rendererContext?: {
                          commandContext?: {
                            onTap?: {
                              innertubeCommand?: {
                                watchEndpoint?: { videoId?: string };
                              };
                            };
                          };
                        };
                      };
                      videoRenderer?: {
                        videoId?: string;
                        title?: { runs?: { text: string }[]; simpleText?: string };
                        publishedTimeText?: { simpleText?: string };
                        viewCountText?: { simpleText?: string };
                        lengthText?: { simpleText?: string };
                      };
                    };
                  };
                }[];
              };
            };
          };
        }[];
      };
    };
  };

  const tabs = data.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const videosTab =
    tabs.find((t) => t.tabRenderer?.selected === true) ||
    tabs.find((t) => /videos|vídeos/i.test(t.tabRenderer?.title || ""));
  const items = videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

  const list: Video[] = [];
  for (const item of items) {
    const lockup = item.richItemRenderer?.content?.lockupViewModel;
    if (lockup) {
      const id =
        lockup.contentId ||
        lockup.rendererContext?.commandContext?.onTap?.innertubeCommand?.watchEndpoint?.videoId;
      const title = lockup.metadata?.lockupMetadataViewModel?.title?.content;
      const duration =
        lockup.contentImage?.thumbnailViewModel?.overlays?.[0]?.thumbnailBottomOverlayViewModel?.badges?.[0]
          ?.thumbnailBadgeViewModel?.text || "";
      const metaRows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
      const parts = metaRows[0]?.metadataParts || [];
      const views = parts[0]?.accessibilityLabel || parts[0]?.text?.content || "";
      const published = parts[1]?.text?.content || parts[0]?.text?.content || "Reciente";

      if (id && title && /^[\w-]{11}$/.test(id)) {
        list.push(video(id, title, published, "upload", duration, views));
      }
      continue;
    }

    const legacy = item.richItemRenderer?.content?.videoRenderer;
    if (legacy && legacy.videoId && /^[\w-]{11}$/.test(legacy.videoId)) {
      const id = legacy.videoId;
      const title = legacy.title?.runs?.map((r) => r.text).join("") || legacy.title?.simpleText || "";
      const published = legacy.publishedTimeText?.simpleText || "Reciente";
      const views = legacy.viewCountText?.simpleText || "";
      const duration = legacy.lengthText?.simpleText || "";

      if (id && title) {
        list.push(video(id, title, published, "upload", duration, views));
      }
    }
  }

  if (list.length === 0) throw new Error("No se extrajeron videos válidos de la pestaña de videos");
  return list;
}

async function publicFeed(): Promise<Video[]> {
  const response = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`YouTube RSS HTTP ${response.status}`);
  const parser = new XMLParser({ parseTagValue: false, isArray: (name) => name === "entry" });
  const xml = await response.text();
  const parsed = parser.parse(xml) as {
    feed?: { "yt:channelId"?: string; entry?: { "yt:videoId": string; title: string; published: string }[] };
  };
  const feedChannel = parsed.feed?.["yt:channelId"];
  if ((feedChannel !== channelId && `UC${feedChannel}` !== channelId) || !parsed.feed?.entry?.length) {
    throw new Error("Feed de YouTube vacío o inválido");
  }
  // Excluimos explícitamente emisiones y directos
  return parsed.feed.entry
    .filter((entry) => !/stream|!diasub|directo|en vivo|full vicio/i.test(entry.title))
    .map((entry) => video(entry["yt:videoId"], entry.title, entry.published, "upload"));
}

async function dataApi<T>(key: string, endpoint: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.search = new URLSearchParams(params).toString();
  const response = await fetch(url, {
    headers: { "X-Goog-Api-Key": key },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`YouTube Data API ${endpoint} HTTP ${response.status}`);
  return response.json<T>();
}

async function classifiedVideos(key: string) {
  const channel = await dataApi<{ items: { contentDetails: { relatedPlaylists: { uploads: string } } }[] }>(
    key, "channels", { id: channelId, part: "contentDetails" },
  );
  const playlistId = channel.items[0]?.contentDetails.relatedPlaylists.uploads;
  if (!playlistId) throw new Error("Lista de subidas de PIPAA no disponible");

  const videos: Video[] = [];
  let pageToken = "";
  for (let page = 0; page < 3; page++) {
    const playlist = await dataApi<{
      items: { contentDetails: { videoId: string } }[];
      nextPageToken?: string;
    }>(key, "playlistItems", { part: "contentDetails", playlistId, maxResults: "50", ...(pageToken ? { pageToken } : {}) });
    if (playlist.items.length) {
      const details = await dataApi<{
        items: {
          id: string;
          snippet: { title: string; publishedAt: string; liveBroadcastContent: string };
          status: { privacyStatus: string };
          liveStreamingDetails?: { actualEndTime?: string; actualStartTime?: string };
        }[];
      }>(key, "videos", {
        id: playlist.items.map((item) => item.contentDetails.videoId).join(","),
        part: "snippet,status,liveStreamingDetails",
      });
      for (const item of details.items) {
        if (item.status.privacyStatus !== "public") continue;
        const { snippet, liveStreamingDetails } = item;
        // Solo videos subidos, descartamos streams y repeticiones
        if (liveStreamingDetails?.actualEndTime || snippet.liveBroadcastContent === "live" || liveStreamingDetails?.actualStartTime) {
          continue;
        }
        videos.push(video(item.id, snippet.title, snippet.publishedAt, "upload"));
      }
    }
    if (!playlist.nextPageToken || videos.length >= 24) break;
    pageToken = playlist.nextPageToken;
  }
  return videos;
}

export class YouTubeFeedStore extends DurableObject<VideoEnv> {
  private inflight?: Promise<VideoSnapshot>;
  private attemptedAt = 0;

  async read() {
    const snapshot = await this.ctx.storage.get<VideoSnapshot>("snapshot");
    const isStale = !snapshot || Date.now() - Date.parse(snapshot.updatedAt) > refreshInterval;
    if (isStale) {
      try {
        return await this.refresh();
      } catch (err) {
        if (snapshot) return snapshot;
        throw err;
      }
    }
    return snapshot;
  }

  async refresh() {
    if (this.inflight) return this.inflight;
    if (Date.now() - this.attemptedAt < 60_000) {
      const snapshot = await this.ctx.storage.get<VideoSnapshot>("snapshot");
      if (snapshot) return snapshot;
      throw new Error("La sincronización se reintentará en breve");
    }
    this.attemptedAt = Date.now();
    this.inflight = this.sync();
    try {
      return await this.inflight;
    } finally {
      this.inflight = undefined;
    }
  }

  private async sync() {
    let videos: Video[] = [];
    try {
      // 1. Sondeo directo de la pestaña /videos de @PIPAArg (solo videos subidos)
      videos = await scrapeVideosTab();
    } catch (scrapeErr) {
      console.warn("Fallo el sondeo de la pestaña /videos, intentando Data API o fallback:", scrapeErr);
      const key = this.env.YOUTUBE_API_KEY;
      if (key) {
        try {
          videos = await classifiedVideos(key);
        } catch (apiErr) {
          console.warn("Fallo YouTube Data API:", apiErr);
        }
      }
      if (videos.length === 0) {
        videos = await publicFeed();
      }
    }

    const snapshot: VideoSnapshot = {
      updatedAt: new Date().toISOString(),
      videos: [...new Map(videos.map((item) => [item.id, item])).values()],
    };
    await this.ctx.storage.put("snapshot", snapshot);
    return snapshot;
  }
}

export function youtubeStore(env: VideoEnv) {
  return env.YOUTUBE_FEED.getByName(channelId);
}

export async function youtubeResponse(request: Request, env: VideoEnv) {
  if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
  const url = new URL(request.url);
  const forceRefresh = url.searchParams.get("refresh") === "1" || url.searchParams.get("force") === "1";
  try {
    const store = youtubeStore(env);
    const snapshot = forceRefresh ? await store.refresh() : await store.read();
    return Response.json({
      ...snapshot,
      stale: Date.now() - Date.parse(snapshot.updatedAt) > refreshInterval,
    }, { headers: { "Cache-Control": "public, max-age=60" } });
  } catch (error) {
    console.error("YouTube snapshot unavailable", error);
    return Response.json({ error: "Videos no disponibles" }, { status: 503 });
  }
}
