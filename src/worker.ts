import { diaSubWebhook, queue, type DiaSubEnv } from "./dia-sub-webhooks";
import type { Platform } from "./dia-sub";
import { youtubeResponse, youtubeStore, type VideoEnv } from "./youtube-feed";
import { saturdayFor } from "./argentina-date";

export { DiaSub } from "./dia-sub";
export { YouTubeFeedStore } from "./youtube-feed";

export default {
  async scheduled(_event: ScheduledController, env: VideoEnv & DiaSubEnv) {
    await Promise.allSettled([youtubeStore(env).refresh(), ...(saturdayFor(Date.now()).isSaturday ? [queue(env).ensurePublicFeed()] : [])]);
  },

  async fetch(request: Request, env: DiaSubEnv & VideoEnv & { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url);

    // Redirección 301 de www a apex para SEO consolidado
    if (url.hostname === "www.pipaa.store") {
      url.hostname = "pipaa.store";
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/youtube") return youtubeResponse(request, env);

    if (url.pathname === "/api/ambient-preview") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      const platform = url.searchParams.get("platform") === "twitch" ? "twitch" : "kick";
      const twitchPreviewUrl = "https://static-cdn.jtvnw.net/previews-ttv/live_user_pipa_arg-320x180.jpg";
      const candidates: string[] = [];
      try {
        if (platform === "kick") {
          const chRes = await fetch("https://kick.com/api/v2/channels/pipa_arg", {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(3500),
          });
          if (chRes.ok) {
            const ch = await chRes.json<{ livestream?: { thumbnail?: { url?: string } } | null }>();
            const candidate = ch?.livestream?.thumbnail?.url;
            if (candidate && candidate.startsWith("https://")) {
              const parsed = new URL(candidate);
              if (parsed.hostname === "kick.com" || parsed.hostname.endsWith(".kick.com") || parsed.hostname.endsWith(".cloudfront.net")) {
                candidates.push(candidate);
              }
            }
          }
        }
        candidates.push(twitchPreviewUrl);

        for (const candidate of candidates) {
          const imgRes = await fetch(candidate, { redirect: "manual", signal: AbortSignal.timeout(4000) });
          const contentType = imgRes.headers.get("content-type") || "";
          if (imgRes.status === 200 && contentType.startsWith("image/")) {
            return new Response(imgRes.body, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=10",
              },
            });
          }
        }
        return new Response(null, { status: 204, headers: { "Cache-Control": "public, max-age=10" } });
      } catch {
        return new Response(null, { status: 204, headers: { "Cache-Control": "public, max-age=10" } });
      }
    }

    if (url.pathname === "/api/youtube-chat") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      let videoId: string | undefined;
      try {
        videoId = (await youtubeStore(env).read()).videos.find((item) => item.kind === "live")?.id;
      } catch { /* Fallback to public live handle lookup */ }

      if (!videoId) {
        try {
          const res = await fetch("https://www.youtube.com/@PIPAArg/live", {
            redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(4000),
          });
          if (res.ok) {
            const html = await res.text();
            const isLive = html.includes('"isLiveNow":true') || html.includes('"isLive":true');
            const canonicalId = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/)?.[1];
            const fallbackId = html.match(/"videoId":"([\w-]{11})"/)?.[1];
            if (isLive) videoId = canonicalId ?? fallbackId;
          }
        } catch { /* Redirect to channel live page on failure */ }
      }

      const target = videoId && /^[\w-]{11}$/.test(videoId)
        ? `https://www.youtube.com/live_chat?is_popout=1&v=${videoId}`
        : "https://www.youtube.com/@PIPAArg/live";

      if (url.searchParams.get("format") === "json") {
        return Response.json(
          {
            live: Boolean(videoId && /^[\w-]{11}$/.test(videoId)),
            videoId: videoId && /^[\w-]{11}$/.test(videoId) ? videoId : null,
            watchUrl: target,
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      }

      return new Response(null, {
        status: 302,
        headers: { Location: target, "Cache-Control": "no-store" },
      });
    }

    if (url.pathname === "/api/stream-meta") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      try {
        const chRes = await fetch("https://kick.com/api/v2/channels/pipa_arg", {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(4000),
        });
        if (!chRes.ok) throw new Error("Kick meta unavailable");
        const ch = await chRes.json<{
          livestream?: { session_title?: string; viewer_count?: number; categories?: { name?: string }[] } | null;
        }>();
        return Response.json({
          live: Boolean(ch?.livestream),
          title: ch?.livestream?.session_title || null,
          category: ch?.livestream?.categories?.[0]?.name || null,
        }, { headers: { "Cache-Control": "public, max-age=30" } });
      } catch {
        return Response.json({ live: false, title: null, category: null }, { headers: { "Cache-Control": "public, max-age=15" } });
      }
    }

    if (url.pathname === "/api/live") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      const streams = await queue(env).streamState();
      const configured = {
        kick: Boolean(env.KICK_BROADCASTER_ID),
        twitch: Boolean(env.TWITCH_BROADCASTER_ID && env.TWITCH_EVENTSUB_SECRET),
      };
      const webhookState = (platform: Platform) => {
        if (!configured[platform]) return undefined;
        const row = streams.find((stream) => stream.platform === platform);
        if (!row) return undefined;
        if (row.live === 1 && Date.now() - row.changedAt >= 24 * 3_600_000) return undefined;
        return row.live === 1;
      };

      let kickState = webhookState("kick");
      let twitchState = webhookState("twitch");

      const checks: Promise<void>[] = [];
      if (kickState === undefined) {
        checks.push((async () => {
          try {
            const res = await fetch("https://kick.com/api/v2/channels/pipa_arg", {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(3500),
            });
            if (res.ok) {
              const ch = await res.json<{ livestream?: unknown | null }>();
              kickState = Boolean(ch?.livestream);
            }
          } catch { /* Keep unknown */ }
        })());
      }
      if (twitchState === undefined) {
        checks.push((async () => {
          try {
            const res = await fetch("https://static-cdn.jtvnw.net/previews-ttv/live_user_pipa_arg-320x180.jpg", {
              method: "HEAD",
              redirect: "manual",
              signal: AbortSignal.timeout(3500),
            });
            if (res.status === 200) twitchState = true;
            else if (res.status === 302 || res.status === 404) twitchState = false;
          } catch { /* Keep unknown */ }
        })());
      }
      if (checks.length) await Promise.all(checks);

      const live: Platform[] = [];
      const offline: Platform[] = [];
      if (kickState === true) live.push("kick");
      else if (kickState === false) offline.push("kick");
      if (twitchState === true) live.push("twitch");
      else if (twitchState === false) offline.push("twitch");
      const known = kickState !== undefined && twitchState !== undefined;
      return Response.json({ live, offline, known }, { headers: { "Cache-Control": "no-store" } });
    }

    if (url.pathname === "/api/emotes") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      const shared: Record<string, string> = {};
      const kick: Record<string, string> = {};

      await Promise.allSettled([
        (async () => {
          const res = await fetch("https://7tv.io/v3/emote-sets/global", {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(3500),
          });
          if (!res.ok) return;
          const data = await res.json<{ emotes?: { id?: string; name?: string }[] }>();
          for (const em of data.emotes ?? []) {
            if (em?.id && em?.name && /^[\w-]+$/.test(em.id)) {
              shared[em.name] = `https://cdn.7tv.app/emote/${em.id}/1x.webp`;
            }
          }
        })(),
        (async () => {
          const res = await fetch("https://api.betterttv.net/3/cached/emotes/global", {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(3500),
          });
          if (!res.ok) return;
          const data = await res.json<{ id?: string; code?: string }[]>();
          for (const em of Array.isArray(data) ? data : []) {
            if (em?.id && em?.code && /^[\da-f]+$/i.test(em.id)) {
              shared[em.code] = `https://cdn.betterttv.net/emote/${em.id}/1x`;
            }
          }
        })(),
        (async () => {
          const res = await fetch("https://kick.com/emotes/pipa_arg", {
            headers: { Accept: "application/json" },
            signal: AbortSignal.timeout(3500),
          });
          if (!res.ok) return;
          const sets = await res.json<{ emotes?: { id?: number; name?: string }[] }[]>();
          for (const set of Array.isArray(sets) ? sets : []) {
            for (const em of set.emotes ?? []) {
              if (typeof em?.id === "number" && em?.name) {
                kick[em.name] = `https://files.kick.com/emotes/${em.id}/fullsize`;
              }
            }
          }
        })(),
      ]);

      return Response.json({ shared, kick }, { headers: { "Cache-Control": "public, max-age=300" } });
    }

    if (url.pathname === "/api/diasub") {
      if (request.method !== "GET") return new Response(null, { status: 405, headers: { Allow: "GET" } });
      if (saturdayFor(Date.now()).isSaturday) await queue(env).ensurePublicFeed();
      const configured: Platform[] = [];
      if (env.KICK_BROADCASTER_ID) configured.push("kick");
      if (env.TWITCH_BROADCASTER_ID && env.TWITCH_EVENTSUB_SECRET) configured.push("twitch");
      const snapshot = await queue(env).snapshot(Date.now(), configured);
      return Response.json(snapshot, { headers: { "Cache-Control": "no-store" } });
    }

    if (url.pathname === "/api/diasub/kick") return diaSubWebhook("kick", request, env);
    if (url.pathname === "/api/diasub/twitch") return diaSubWebhook("twitch", request, env);

    // Servir assets estáticos compilados desde dist/
    const response = await env.ASSETS.fetch(request);

    // Si es HTML o ruta principal, asegurar cabeceras de seguridad y SEO
    if (response.status === 200) {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const newHeaders = new Headers(response.headers);
        newHeaders.set("X-Frame-Options", "SAMEORIGIN");
        newHeaders.set("X-Content-Type-Options", "nosniff");
        newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }
    }

    return response;
  },
};
