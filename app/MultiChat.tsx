import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { SiKick, SiTwitch, SiYoutube } from "@icons-pack/react-simple-icons";
import { ArrowDown, ArrowLeft, ArrowUpRight, Bot, ExternalLink, Eye, MessageSquare, Send, Sparkles } from "lucide-react";

const channels = { kick: "pipa_arg", twitch: "pipa_arg", youtube: "pipa_arg" };
const labels = { kick: "Kick", twitch: "Twitch", youtube: "YouTube" } as const;
export type Platform = keyof typeof channels;

type TwitchEmote = { id: string; begin: number; end: number; text: string };
type Message = {
  id: string;
  platform: Platform;
  author: string;
  text: string;
  timestamp: number;
  deleted?: boolean;
  kind?: string;
  bits?: number;
  notice?: string;
  badges?: string[];
  color?: string;
  emotes?: TwitchEmote[];
};
type ViewerStatus = { platform: Platform; viewers?: number };
type Feed = { messages: Message[]; viewers: Partial<Record<Platform, number>>; state: "loading" | "connected" | "retrying" };

export type CelebrationEvent = {
  id: string;
  kind: "sub" | "gift" | "bits" | "donation";
  platform: Platform;
  author: string;
  headline: string;
  detail: string;
};

const cacheKey = "pipaa:recent-chat:v1";
const hideBotsKey = "pipaa:chat-hide-bots:v1";
const cacheAge = 30 * 60_000;
const timeFormat = new Intl.DateTimeFormat("es-AR", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Argentina/Buenos_Aires",
});

const knownBots = new Set([
  "nightbot",
  "streamelements",
  "streamlabs",
  "fossabot",
  "moobot",
  "botrix",
  "botrixoficial",
  "kickbot",
  "kickbounties",
  "kicklet",
  "kickclipper",
  "kickclipbot",
  "npoqnet",
  "wizebot",
  "soundalerts",
  "sery_bot",
  "commanderroot",
  "panzabot",
  "kikibot",
  "botisimo",
  "rainmaker",
  "cloudbot",
  "stay_hydrated_bot",
  "streamcaptain",
  "casterlabs",
  "dixperbot",
  "weezyxbot",
  "creatisbot",
  "kofistreambot",
  "songlistbot",
  "pokemoncommunitygame",
  "dixper",
  "weezyx",
  "frostytoolsdotcom",
]);

const automatedBotMessagePattern = /(?:ahora también en tiktok|ayudame a crecer,?\s+subscribite|ahora podes mandarme audios|estamos haciendo multistream|clipeen a su streamer|streamelements bot running|se unió al chat!|thanks for following!|gracias por seguir)/i;

const donationPattern = /\b(don[oó]|donaci[oó]n|donaron|tipped|mand[oó]\s+(?:un\s+)?(?:audio|dixper|cafecito|regalo)|envi[oó]\s+(?:un\s+)?(?:audio|dixper|cafecito)|super\s?chat|super\s?sticker|mercadopago|mercado\s+pago)\b/i;
const giftPattern = /\b(regal[oó]|gifted|gift\s+sub|sub\s+gift)\b/i;
const subPattern = /\b(suscribi[oó]|subscribed|resub|prime\s+sub|nueva\s+sub|miembro del canal|se uni[oó] como miembro)\b/i;

const allowedEmoteHosts = [
  "cdn.7tv.app",
  "cdn.frankerfacez.com",
  "cdn.betterttv.net",
  "static-cdn.jtvnw.net",
  "files.kick.com",
  "images.kick.com",
];

const classicTwitchEmotes: Record<string, string> = {
  Kappa: "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0",
  Keepo: "https://static-cdn.jtvnw.net/emoticons/v2/1902/default/dark/1.0",
  LUL: "https://static-cdn.jtvnw.net/emoticons/v2/425618/default/dark/1.0",
  "<3": "https://static-cdn.jtvnw.net/emoticons/v2/483/default/dark/1.0",
  PogChamp: "https://static-cdn.jtvnw.net/emoticons/v2/305954156/default/dark/1.0",
  NotLikeThis: "https://static-cdn.jtvnw.net/emoticons/v2/58765/default/dark/1.0",
  BibleThump: "https://static-cdn.jtvnw.net/emoticons/v2/86/default/dark/1.0",
  "4Head": "https://static-cdn.jtvnw.net/emoticons/v2/354/default/dark/1.0",
  HeyGuys: "https://static-cdn.jtvnw.net/emoticons/v2/30259/default/dark/1.0",
  Jebaited: "https://static-cdn.jtvnw.net/emoticons/v2/114836/default/dark/1.0",
  SeemsGood: "https://static-cdn.jtvnw.net/emoticons/v2/64138/default/dark/1.0",
  WutFace: "https://static-cdn.jtvnw.net/emoticons/v2/28087/default/dark/1.0",
  Kreygasm: "https://static-cdn.jtvnw.net/emoticons/v2/41/default/dark/1.0",
  DansGame: "https://static-cdn.jtvnw.net/emoticons/v2/33/default/dark/1.0",
  FailFish: "https://static-cdn.jtvnw.net/emoticons/v2/360/default/dark/1.0",
};

let extraEmotesCache: { shared: Map<string, string>; kick: Map<string, string> } | null = null;
let extraEmotesPromise: Promise<{ shared: Map<string, string>; kick: Map<string, string> }> | null = null;

function loadExtraEmotes() {
  if (extraEmotesCache) return Promise.resolve(extraEmotesCache);
  if (!extraEmotesPromise) {
    extraEmotesPromise = fetch("/api/emotes", { signal: AbortSignal.timeout(5000) })
      .then((res) => (res.ok ? (res.json() as Promise<{ shared?: Record<string, unknown>; kick?: Record<string, unknown> }>) : { shared: {}, kick: {} }))
      .then((data: { shared?: Record<string, unknown>; kick?: Record<string, unknown> }) => {
        const shared = new Map<string, string>(Object.entries(classicTwitchEmotes));
        const kick = new Map<string, string>();
        for (const [k, v] of Object.entries(data?.shared ?? {})) {
          if (typeof v === "string") {
            const safe = safeEmoteUrl(v);
            if (safe) shared.set(k, safe);
          }
        }
        for (const [k, v] of Object.entries(data?.kick ?? {})) {
          if (typeof v === "string") {
            const safe = safeEmoteUrl(v);
            if (safe) kick.set(k, safe);
          }
        }
        extraEmotesCache = { shared, kick };
        return extraEmotesCache;
      })
      .catch(() => ({
        shared: new Map<string, string>(Object.entries(classicTwitchEmotes)),
        kick: new Map<string, string>(),
      }));
  }
  return extraEmotesPromise;
}

const authorColors = [
  "#c6ff5e",
  "#c9a7ff",
  "#89c4ff",
  "#ffd666",
  "#ff9ebc",
  "#7ef2c9",
  "#ffb784",
  "#b8b5ff",
];

function authorColor(name: string, provided?: string) {
  if (provided && /^#[\da-f]{6}$/i.test(provided)) {
    const r = parseInt(provided.slice(1, 3), 16);
    const g = parseInt(provided.slice(3, 5), 16);
    const b = parseInt(provided.slice(5, 7), 16);
    // Only use provided color when luminance is high enough for dark #0e0a16 background
    if (0.2126 * r + 0.7152 * g + 0.0722 * b >= 95) return provided;
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return authorColors[Math.abs(hash) % authorColors.length];
}

const botNameSubstrings = [
  "botrix",
  "nightbot",
  "streamelements",
  "streamlabs",
  "fossabot",
  "moobot",
  "wizebot",
  "kickbounties",
  "soundalerts",
];

function isBotMessage(item: Message) {
  const cleanAuthor = item.author
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim()
    .replace(/^@+/, "")
    .toLowerCase();
  if (!cleanAuthor) return false;
  if (knownBots.has(cleanAuthor)) return true;
  if (botNameSubstrings.some((b) => cleanAuthor.includes(b))) return true;
  if (/(?:^|[_-])bots?(?:[_-]?\d*)?$/i.test(cleanAuthor)) return true;
  if (item.badges?.some((b) => b.toLowerCase().includes("bot"))) return true;
  return automatedBotMessagePattern.test(item.text);
}

function translateSpecialNotice(raw: string): string {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (!clean) return raw;

  // e.g. "motochorr0 subscribed with Prime. They've subscribed for 18 months, currently on a 2 month streak!"
  const primeOrTier = clean.match(
    /^([\w@.-]+)\s+subscribed(?:\s+with\s+(Prime)|\s+at\s+Tier\s+(\d))?\.?(?:\s+They(?:'|’)ve subscribed for\s+(\d+)\s+months?(?:,?\s*currently on a\s+(\d+)\s+month streak!?)?)?$/i,
  );
  if (primeOrTier) {
    const [, user, prime, tier, months, streak] = primeOrTier;
    const plan = prime ? "con Prime" : tier ? `(Nivel ${tier})` : "";
    const parts = [`${user} se suscribió${plan ? ` ${plan}` : ""}`];
    if (months) parts.push(`${months} ${months === "1" ? "mes" : "meses"}`);
    if (streak && streak !== "1") parts.push(`racha de ${streak}`);
    return parts.join(" · ");
  }

  // e.g. "user gifted a Tier 1 sub to target!" / "user is gifting 5 Tier 1 Subs to the community!"
  const giftMatch = clean.match(
    /^([\w@.-]+)\s+(?:is\s+gifting|gifted)\s+(?:a\s+)?(?:(\d+)\s+)?(?:Tier\s+\d+\s+)?subs?(?:cription)?s?(?:\s+to\s+([\w@.-]+)|\s+to the community)?!?$/i,
  );
  if (giftMatch) {
    const [, user, count, target] = giftMatch;
    const qty = count ? `${count} subs` : "una sub";
    if (target && target.toLowerCase() !== "the" && target.toLowerCase() !== "community") {
      return `${user} regaló ${qty} a ${target}`;
    }
    return `${user} regaló ${qty} a la comunidad`;
  }

  return clean
    .replace(/\bsubscribed with Prime\b/gi, "se suscribió con Prime")
    .replace(/\bsubscribed at Tier (\d+)\b/gi, "se suscribió (Nivel $1)")
    .replace(/\bsubscribed\b/gi, "se suscribió")
    .replace(/\bThey(?:'|’)ve subscribed for\b/gi, "·")
    .replace(/\bcurrently on a (\d+) month streak!?/gi, "· racha de $1")
    .replace(/\bmonths\b/gi, "meses")
    .replace(/\bmonth\b/gi, "mes")
    .replace(/\bis gifting\b/gi, "regaló")
    .replace(/\bgifted a\b/gi, "regaló una")
    .replace(/\bgifted\b/gi, "regaló")
    .replace(/\bto the community\b/gi, "a la comunidad")
    .replace(/\bcheered\b/gi, "tiró")
    .replace(/\btipped\b/gi, "donó")
    .replace(/\bdonated\b/gi, "donó")
    .replace(/\s+·\s+/g, " · ")
    .trim();
}

type SpecialEventInfo = {
  kind: CelebrationEvent["kind"];
  tag: string;
  headline: string;
  summary: string;
  userNote?: string;
};

function classifySpecialEvent(item: Message): SpecialEventInfo | null {
  const notice = item.notice?.trim() || "";
  const text = item.text.trim();
  const combined = `${notice} ${text}`.trim();
  if (!combined) return null;
  if (!notice && item.kind !== "system" && !(typeof item.bits === "number" && item.bits > 0) && automatedBotMessagePattern.test(combined)) {
    return null;
  }

  if (typeof item.bits === "number" && item.bits > 0) {
    const cleanedNote = text.replace(/\bCheer\d+\b/gi, "").trim();
    return {
      kind: "bits",
      tag: "BITS",
      headline: `¡${item.bits.toLocaleString("es-AR")} BITS EN TWITCH!`,
      summary: `${item.author || "Viewer"} tiró ${item.bits.toLocaleString("es-AR")} bits`,
      userNote: cleanedNote || undefined,
    };
  }

  const baseSource = notice || text;
  const userNote = notice && text && notice !== text ? text : undefined;

  if (item.kind === "system" || Boolean(notice)) {
    if (giftPattern.test(combined)) {
      return {
        kind: "gift",
        tag: "REGALO",
        headline: "¡SUBS REGALADAS!",
        summary: translateSpecialNotice(baseSource),
        userNote,
      };
    }
    if (donationPattern.test(combined)) {
      return {
        kind: "donation",
        tag: "DONACIÓN",
        headline: "¡NUEVA DONACIÓN!",
        summary: translateSpecialNotice(baseSource),
        userNote,
      };
    }
    if (subPattern.test(combined) || /\b(sub|prime|tier|streak)\b/i.test(combined)) {
      return {
        kind: "sub",
        tag: "SUB",
        headline: "¡NUEVA SUSCRIPCIÓN!",
        summary: translateSpecialNotice(baseSource),
        userNote,
      };
    }
    if (item.kind === "system") {
      return {
        kind: "sub",
        tag: "EVENTO",
        headline: "¡MOMENTO EN VIVO!",
        summary: translateSpecialNotice(baseSource),
        userNote,
      };
    }
  }

  if (isBotMessage(item) && donationPattern.test(combined)) {
    return {
      kind: "donation",
      tag: "DONACIÓN",
      headline: "¡DONACIÓN EN VIVO!",
      summary: translateSpecialNotice(text),
    };
  }

  if (isBotMessage(item) && (giftPattern.test(combined) || subPattern.test(combined))) {
    const isGift = giftPattern.test(combined);
    return {
      kind: isGift ? "gift" : "sub",
      tag: isGift ? "REGALO" : "SUB",
      headline: isGift ? "¡SUBS REGALADAS!" : "¡NUEVA SUSCRIPCIÓN!",
      summary: translateSpecialNotice(text),
    };
  }

  return null;
}

function detectCelebration(item: Message): CelebrationEvent | null {
  const special = classifySpecialEvent(item);
  if (!special) return null;
  const detail = special.userNote ? `${special.summary} — "${special.userNote}"` : special.summary;
  return {
    id: item.id,
    kind: special.kind,
    platform: item.platform,
    author: item.author || "Panza Army",
    headline: special.headline,
    detail,
  };
}

function safeEmoteUrl(raw: string): string | null {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:") return null;
    if (!allowedEmoteHosts.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function renderEmoteImg(key: string, url: string, alt: string) {
  return (
    <img
      key={key}
      className="chat-emote"
      src={url}
      alt={alt}
      title={alt}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.replaceWith(document.createTextNode(alt));
      }}
    />
  );
}

function renderTextSegment(
  segment: string,
  keyPrefix: string,
  platformEmotes: Map<string, string>,
  fallbackEmotes: Map<string, string>,
): ReactNode {
  const nodes: ReactNode[] = [];
  const bracketRe = /\[emote:(\d+):([^\]]+)\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const pushTokens = (chunk: string, subKey: string) => {
    const parts = chunk.split(/(\s+)/);
    parts.forEach((part, idx) => {
      if (!part || /^\s+$/.test(part)) {
        nodes.push(part);
        return;
      }
      const trimmed = part.replace(/^[([{'"¡¿]+|[.,!?;:)\]}'"]+$/g, "");
      const url =
        platformEmotes.get(part) ??
        fallbackEmotes.get(part) ??
        (trimmed && trimmed !== part ? (platformEmotes.get(trimmed) ?? fallbackEmotes.get(trimmed)) : undefined);
      if (url) {
        if (trimmed && trimmed !== part) {
          const start = part.indexOf(trimmed);
          const before = part.slice(0, start);
          const after = part.slice(start + trimmed.length);
          if (before) nodes.push(before);
          nodes.push(renderEmoteImg(`${subKey}-${idx}`, url, trimmed));
          if (after) nodes.push(after);
          return;
        }
        nodes.push(renderEmoteImg(`${subKey}-${idx}`, url, part));
        return;
      }
      nodes.push(part);
    });
  };

  while ((match = bracketRe.exec(segment)) !== null) {
    if (match.index > lastIndex) {
      pushTokens(segment.slice(lastIndex, match.index), `${keyPrefix}-${lastIndex}`);
    }
    const emoteId = match[1];
    const emoteName = match[2];
    nodes.push(renderEmoteImg(`${keyPrefix}-k-${match.index}`, `https://files.kick.com/emotes/${emoteId}/fullsize`, emoteName));
    lastIndex = bracketRe.lastIndex;
  }

  if (lastIndex < segment.length) {
    pushTokens(segment.slice(lastIndex), `${keyPrefix}-${lastIndex}`);
  }
  return nodes;
}

function renderMessageText(item: Message, platformEmotes: Map<string, string>, fallbackEmotes: Map<string, string>): ReactNode {
  const validRanges = (Array.isArray(item.emotes) ? item.emotes : [])
    .filter((em) => em?.id && em?.text && /^[\w-]+$/.test(em.id))
    .map((em) => {
      const url =
        item.platform === "twitch"
          ? `https://static-cdn.jtvnw.net/emoticons/v2/${em.id}/default/dark/1.0`
          : item.platform === "kick" && /^\d+$/.test(em.id)
            ? `https://files.kick.com/emotes/${em.id}/fullsize`
            : null;
      return { ...em, url };
    })
    .filter((em): em is TwitchEmote & { url: string } => Boolean(em.url))
    .sort((a, b) => a.begin - b.begin);

  if (validRanges.length > 0 && validRanges.every((r) => Number.isInteger(r.begin) && Number.isInteger(r.end) && r.begin >= 0 && r.end <= item.text.length && r.end > r.begin)) {
    const out: ReactNode[] = [];
    let cursor = 0;
    validRanges.forEach((em, idx) => {
      if (em.begin < cursor) return;
      if (em.begin > cursor) {
        out.push(renderTextSegment(item.text.slice(cursor, em.begin), `seg-${idx}-${cursor}`, platformEmotes, fallbackEmotes));
      }
      const label = item.text.slice(em.begin, em.end) || em.text;
      out.push(renderEmoteImg(`range-${idx}-${em.begin}`, em.url, label));
      cursor = em.end;
    });
    if (cursor < item.text.length) {
      out.push(renderTextSegment(item.text.slice(cursor), `tail-${cursor}`, platformEmotes, fallbackEmotes));
    }
    return out;
  }

  const inlineMap = new Map(platformEmotes);
  for (const em of validRanges) {
    inlineMap.set(em.text, em.url);
  }
  return renderTextSegment(item.text, "full", inlineMap, fallbackEmotes);
}

function roleTag(badges?: string[]): { label: string; kind: "mod" | "vip" | "sub" } | null {
  if (!badges?.length) return null;
  if (badges.some((b) => b.startsWith("broadcaster"))) return { label: "HOST", kind: "mod" };
  if (badges.some((b) => b.startsWith("moderator"))) return { label: "MOD", kind: "mod" };
  if (badges.some((b) => b.startsWith("vip"))) return { label: "VIP", kind: "vip" };
  if (badges.some((b) => b.startsWith("subscriber") || b.startsWith("founder"))) return { label: "SUB", kind: "sub" };
  return null;
}

export function PlatformBrandIcon({ platform, size = 12 }: { platform: Platform; size?: number }) {
  if (platform === "kick") return <SiKick size={size} color="currentColor" aria-hidden="true" />;
  if (platform === "twitch") return <SiTwitch size={size} color="currentColor" aria-hidden="true" />;
  return <SiYoutube size={size} color="currentColor" aria-hidden="true" />;
}

function openChatPopup(event: React.MouseEvent<HTMLAnchorElement>, url: string, name: string, width = 420, height = 680) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  const left = Math.max(0, Math.round(window.screenX + window.outerWidth - width - 24));
  const top = Math.max(0, Math.round(window.screenY + 96));
  window.open(url, name, `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`);
}

function readHideBotsPref() {
  if (typeof window !== "undefined") {
    const param = new URLSearchParams(window.location.search).get("bots");
    if (param === "1") return false;
    if (param === "0") return true;
  }
  try {
    return localStorage.getItem(hideBotsKey) !== "off";
  } catch {
    return true;
  }
}

function validMessage(value: unknown): value is Message {
  if (!value || typeof value !== "object") return false;
  const item = value as Message;
  return Object.hasOwn(channels, item.platform) && typeof item.id === "string" &&
    typeof item.author === "string" && typeof item.text === "string" &&
    Number.isFinite(item.timestamp) && item.timestamp >= Date.now() - cacheAge && item.timestamp <= Date.now() + 60_000;
}

function sanitizeMessage(item: Message): Message {
  return {
    id: item.id,
    platform: item.platform,
    author: item.author.slice(0, 100),
    text: item.text.slice(0, 1000),
    timestamp: item.timestamp,
    kind: item.kind,
    bits: typeof item.bits === "number" ? item.bits : 0,
    notice: typeof item.notice === "string" ? item.notice.slice(0, 300) : undefined,
    badges: Array.isArray(item.badges) ? item.badges.filter((b): b is string => typeof b === "string").slice(0, 8) : undefined,
    color: typeof item.color === "string" ? item.color : undefined,
    emotes: Array.isArray(item.emotes) ? item.emotes.slice(0, 20) : undefined,
  };
}

function mergeMessages(previous: Message[], incoming: Message[]) {
  const messages = new Map(previous.filter(validMessage).map((item) => [item.id, item]));
  for (const item of incoming) {
    if (item.deleted) messages.delete(item.id);
    else if (validMessage(item)) {
      messages.set(item.id, sanitizeMessage(item));
    }
  }
  return [...messages.values()].sort((a, b) => a.timestamp - b.timestamp).slice(-140);
}

function readCache() {
  try {
    const items: unknown = JSON.parse(localStorage.getItem(cacheKey) ?? "[]");
    return Array.isArray(items) ? items.filter(validMessage).filter((item) => !item.deleted).slice(-140) : [];
  } catch {
    return [];
  }
}

function viewerCounts(statuses: ViewerStatus[]) {
  const viewers: Feed["viewers"] = {};
  for (const status of statuses) {
    if (status && Object.hasOwn(channels, status.platform) && typeof status.viewers === "number" &&
      Number.isFinite(status.viewers) && status.viewers >= 0) {
      viewers[status.platform] = status.viewers;
    }
  }
  return viewers;
}

function useUnifiedFeed(onCelebration?: (event: CelebrationEvent) => void) {
  const [feed, setFeed] = useState<Feed>(() => ({ messages: readCache(), viewers: {}, state: "loading" }));
  const [emoteRevision, setEmoteRevision] = useState(0);
  const emotesRef = useRef<Record<Platform, Map<string, string>>>({
    kick: new Map(),
    twitch: new Map(),
    youtube: new Map(),
  });
  const fallbackEmotesRef = useRef<Record<Platform, Map<string, string>>>({
    kick: new Map(Object.entries(classicTwitchEmotes)),
    twitch: new Map(Object.entries(classicTwitchEmotes)),
    youtube: new Map(Object.entries(classicTwitchEmotes)),
  });
  const onCelebrationRef = useRef(onCelebration);
  onCelebrationRef.current = onCelebration;
  const mountedAtRef = useRef(Date.now());

  useEffect(() => {
    let active = true;
    void loadExtraEmotes().then((extra) => {
      if (!active) return;
      const mergedKick = new Map(extra.shared);
      for (const [k, v] of extra.kick) mergedKick.set(k, v);
      fallbackEmotesRef.current = {
        kick: mergedKick,
        twitch: new Map(extra.shared),
        youtube: new Map(extra.shared),
      };
      setEmoteRevision((v) => v + 1);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let stopped = false;
    let socket: WebSocket;
    let retry: ReturnType<typeof setTimeout>;
    let deadline: ReturnType<typeof setTimeout>;
    let delay = 1000;

    function connect() {
      socket = new WebSocket("wss://unified-chat.com/ws");
      deadline = setTimeout(() => socket.close(), 12_000);
      socket.onopen = () => socket.send(JSON.stringify({ type: "subscribe", channels }));
      socket.onmessage = (event) => {
        if (stopped || typeof event.data !== "string") return;
        let data;
        try { data = JSON.parse(event.data); } catch { return; }
        if (!data || typeof data !== "object") return;

        if (data.type === "emotes" && Object.hasOwn(channels, data.platform) && data.emotes && typeof data.emotes === "object") {
          const map = emotesRef.current[data.platform as Platform];
          let changed = false;
          for (const [name, rawUrl] of Object.entries(data.emotes as Record<string, unknown>)) {
            if (typeof rawUrl === "string") {
              const safe = safeEmoteUrl(rawUrl);
              if (safe && map.get(name) !== safe) {
                map.set(name, safe);
                changed = true;
              }
            }
          }
          if (changed) setEmoteRevision((v) => v + 1);
        } else if (data.type === "bootstrap" && Array.isArray(data.messages) && Array.isArray(data.statuses)) {
          clearTimeout(deadline);
          delay = 1000;
          const messages = data.messages.filter(validMessage);
          setFeed((current) => ({ state: "connected", messages: mergeMessages(current.messages, messages), viewers: viewerCounts(data.statuses) }));
        } else if (data.type === "message" && validMessage(data.message)) {
          const msg = sanitizeMessage(data.message);
          setFeed((current) => ({ ...current, messages: mergeMessages(current.messages, [msg]) }));
          if (msg.timestamp >= mountedAtRef.current - 5000) {
            const celebration = detectCelebration(msg);
            if (celebration) onCelebrationRef.current?.(celebration);
          }
        } else if (data.type === "deleted" && Array.isArray(data.ids)) {
          const deleted = new Set(data.ids);
          setFeed((current) => ({ ...current, messages: current.messages.filter((item) => !deleted.has(item.id)) }));
        } else if (data.type === "status" && data.status && Object.hasOwn(channels, data.status.platform)) {
          const platform: Platform = data.status.platform;
          setFeed((current) => ({ ...current, viewers: { ...current.viewers, [platform]: viewerCounts([data.status])[platform] } }));
        }
      };
      socket.onclose = () => {
        if (stopped) return;
        clearTimeout(deadline);
        setFeed((current) => ({ ...current, viewers: {}, state: "retrying" }));
        retry = setTimeout(connect, delay);
        delay = Math.min(delay * 2, 30_000);
      };
    }

    connect();
    const expireCache = setInterval(() => {
      setFeed((current) => {
        const messages = current.messages.filter(validMessage);
        return messages.length === current.messages.length ? current : { ...current, messages };
      });
    }, 60_000);
    return () => {
      stopped = true;
      clearTimeout(retry);
      clearTimeout(deadline);
      clearInterval(expireCache);
      socket.close();
    };
  }, []);
  useEffect(() => {
    try { localStorage.setItem(cacheKey, JSON.stringify(feed.messages.slice(-80))); } catch { /* Chat works without storage. */ }
  }, [feed.messages]);
  return { feed, emotesRef, fallbackEmotesRef, emoteRevision };
}

export function MultiChat({
  standalone = false,
  onCelebration,
}: {
  standalone?: boolean;
  onCelebration?: (event: CelebrationEvent) => void;
}) {
  const { feed, emotesRef, fallbackEmotesRef, emoteRevision } = useUnifiedFeed(onCelebration);
  const [compose, setCompose] = useState<Platform | null>(null);
  const [ytStatus, setYtStatus] = useState<{ state: "idle" | "loading" | "ready"; live: boolean; videoId: string | null; watchUrl: string }>({
    state: "idle",
    live: false,
    videoId: null,
    watchUrl: "https://www.youtube.com/@PIPAArg/live",
  });
  const [filter, setFilter] = useState<Platform | "all">("all");
  const [hideBots, setHideBots] = useState<boolean>(() => readHideBotsPref());
  const [showViewersDetail, setShowViewersDetail] = useState(false);
  const [behind, setBehind] = useState(false);
  const [unread, setUnread] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  const following = useRef(true);
  const lastSeenId = useRef<string | undefined>(undefined);

  const platforms = Object.keys(channels) as Platform[];
  const counts = platforms.flatMap((platform) =>
    feed.viewers[platform] === undefined ? [] : [{ platform, total: feed.viewers[platform] ?? 0 }]);
  const total = counts.reduce((sum, item) => sum + item.total, 0);
  const breakdown = counts.map(({ platform, total }) => `${labels[platform]}: ${total.toLocaleString("es-AR")}`).join(" · ");

  const visibleMessages = useMemo(() => {
    return feed.messages.filter((item) => {
      if (filter !== "all" && item.platform !== filter) return false;
      if (hideBots && !classifySpecialEvent(item) && isBotMessage(item)) return false;
      return true;
    });
  }, [feed.messages, filter, hideBots]);
  const newestId = visibleMessages.at(-1)?.id;
  const writing = compose !== null;

  const refreshYouTubeChat = async () => {
    setYtStatus((prev) => ({ ...prev, state: "loading" }));
    try {
      const res = await fetch("/api/youtube-chat?format=json", { cache: "no-store", signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error("YT lookup failed");
      const data = await res.json() as { live?: boolean; videoId?: string | null; watchUrl?: string };
      setYtStatus({
        state: "ready",
        live: Boolean(data.live && data.videoId),
        videoId: data.videoId ?? null,
        watchUrl: data.watchUrl || "https://www.youtube.com/@PIPAArg/live",
      });
    } catch {
      setYtStatus({
        state: "ready",
        live: false,
        videoId: null,
        watchUrl: "https://www.youtube.com/@PIPAArg/live",
      });
    }
  };

  useEffect(() => {
    if (compose === "youtube" && ytStatus.state === "idle") {
      void refreshYouTubeChat();
    }
  }, [compose, ytStatus.state]);

  const toggleCompose = (target: Platform) => {
    setCompose((prev) => (prev === target ? null : target));
  };

  useLayoutEffect(() => {
    const el = list.current;
    if (!el || writing) return;
    if (following.current) {
      el.scrollTop = el.scrollHeight;
      lastSeenId.current = newestId;
      setUnread(0);
    } else if (lastSeenId.current) {
      const idx = visibleMessages.findIndex((item) => item.id === lastSeenId.current);
      setUnread(idx >= 0 ? visibleMessages.length - idx - 1 : visibleMessages.length);
    }
  }, [visibleMessages, newestId, writing]);

  const jumpToBottom = () => {
    following.current = true;
    lastSeenId.current = newestId;
    setBehind(false);
    setUnread(0);
    if (list.current) list.current.scrollTop = list.current.scrollHeight;
  };

  const changeFilter = (next: Platform | "all") => {
    setFilter(next);
    following.current = true;
    setBehind(false);
    setUnread(0);
  };

  const toggleHideBots = () => {
    setHideBots((prev) => {
      const next = !prev;
      try { localStorage.setItem(hideBotsKey, next ? "on" : "off"); } catch { /* Optional */ }
      return next;
    });
  };

  const hostname = typeof window !== "undefined" ? window.location.hostname : "pipaa.store";
  const statusLabel = feed.state === "connected" ? "En vivo" : feed.state === "retrying" ? "Reconectando" : "Conectando";

  return (
    <section className={`multichat ${standalone ? "is-standalone" : ""}`} aria-labelledby="multichat-title">
      <div className="multichat-heading">
        <div className="multichat-title-row">
          <h3 id="multichat-title">
            <MessageSquare size={15} aria-hidden="true" />
            <span>Multichat</span>
          </h3>
          <span className={`chat-conn-pill is-${feed.state}`} role="status" aria-live="polite">
            <i aria-hidden="true" />
            {statusLabel}
          </span>
        </div>

        <div className="chat-tools">
          <button
            type="button"
            className={`chat-tool-btn ${hideBots ? "is-active" : ""}`}
            aria-pressed={hideBots}
            onClick={toggleHideBots}
            title={hideBots ? "Bots ocultos. Clic para mostrarlos." : "Mostrando bots. Clic para ocultarlos."}
            aria-label={hideBots ? "Mostrar mensajes de bots" : "Ocultar mensajes de bots"}
          >
            <Bot size={13} aria-hidden="true" />
          </button>

          {!standalone && (
            <a
              href="/chat/"
              className="chat-tool-btn"
              title="Abrir solo nuestro chat en ventana aparte"
              aria-label="Abrir chat limpio en ventana aparte"
              onClick={(e) => openChatPopup(e, "/chat/", "pipaa-custom-chat", 420, 720)}
            >
              <ExternalLink size={13} aria-hidden="true" />
            </a>
          )}

          <button
            type="button"
            className="chat-viewers"
            onClick={() => counts.length > 0 && setShowViewersDetail((prev) => !prev)}
            aria-expanded={counts.length > 0 ? showViewersDetail : undefined}
            title={breakdown || "Esperando datos de audiencia"}
            aria-label={counts.length ? `${total} espectadores en total. ${breakdown}` : "Audiencia sin datos"}
          >
            <Eye size={13} aria-hidden="true" />
            <span>{counts.length ? total.toLocaleString("es-AR") : "—"}</span>
          </button>
        </div>
      </div>

      {showViewersDetail && counts.length > 0 && (
        <div className="chat-viewers-breakdown" role="status">
          {counts.map(({ platform, total: count }) => (
            <span key={platform} className={`viewer-chip is-${platform}`}>
              <PlatformBrandIcon platform={platform} size={11} />
              {labels[platform]}: <strong>{count.toLocaleString("es-AR")}</strong>
            </span>
          ))}
        </div>
      )}

      {!writing && (
        <div className="chat-filters" role="group" aria-label="Filtrar mensajes por plataforma">
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => changeFilter("all")}
          >
            Todos
          </button>
          {platforms.map((platform) => (
            <button
              key={platform}
              type="button"
              className={`filter-${platform}`}
              aria-pressed={filter === platform}
              onClick={() => changeFilter(platform)}
            >
              <PlatformBrandIcon platform={platform} size={11} />
              <span>{labels[platform]}</span>
            </button>
          ))}
        </div>
      )}

      <div className="chat-content chat-content--native" hidden={writing}>
        {visibleMessages.length === 0 ? (
          <div className="chat-empty-state" role="status">
            <MessageSquare size={22} aria-hidden="true" />
            <p>
              {feed.state === "loading"
                ? "Conectando con el chat de Kick, Twitch y YouTube…"
                : filter === "all"
                  ? "Todavía no hay mensajes recientes en el chat."
                  : `Todavía no hay mensajes de ${labels[filter]}.`}
            </p>
          </div>
        ) : (
          <ol
            ref={list}
            className="chat-messages"
            aria-label="Mensajes recientes"
            tabIndex={0}
            onScroll={(event) => {
              const el = event.currentTarget;
              const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 24;
              following.current = atBottom;
              setBehind(!atBottom);
              if (atBottom) {
                lastSeenId.current = newestId;
                setUnread(0);
              }
            }}
          >
            {visibleMessages.map((item) => {
              const special = classifySpecialEvent(item);
              const isEvent = Boolean(special);
              const isCmd = !isEvent && item.text.trim().startsWith("!");
              const badge = roleTag(item.badges);
              const emoteMap = emotesRef.current[item.platform];
              const fallbackMap = fallbackEmotesRef.current[item.platform];
              return (
                <li
                  key={item.id}
                  className={special ? `is-event is-kind-${special.kind}` : isCmd ? "is-command" : undefined}
                  data-emote-rev={emoteRevision}
                >
                  <time dateTime={new Date(item.timestamp).toISOString()}>{timeFormat.format(item.timestamp)}</time>
                  <span
                    className={`chat-platform-icon is-${item.platform}`}
                    title={labels[item.platform]}
                    aria-label={labels[item.platform]}
                  >
                    <PlatformBrandIcon platform={item.platform} size={11} />
                  </span>
                  {special ? (
                    <span className="chat-msg-body chat-event-text">
                      <span className="chat-event-head">
                        <Sparkles size={12} aria-hidden="true" />
                        <span className="chat-event-tag">{special.tag}</span>
                        <strong>{special.summary}</strong>
                      </span>
                      {special.userNote && <span className="chat-event-note">{special.userNote}</span>}
                    </span>
                  ) : (
                    <span className="chat-msg-body">
                      {badge && <span className={`chat-role-badge is-${badge.kind}`}>{badge.label}</span>}
                      <strong style={{ color: authorColor(item.author, item.color) }}>{item.author}</strong>{" "}
                      <span>{renderMessageText(item, emoteMap, fallbackMap)}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {behind && (
          <button className="chat-jump" type="button" onClick={jumpToBottom}>
            <ArrowDown size={14} aria-hidden="true" />
            <span>{unread > 0 ? `${unread} ${unread === 1 ? "mensaje nuevo" : "mensajes nuevos"}` : "Volver abajo"}</span>
          </button>
        )}
      </div>

      {compose === "twitch" && (
        <div className="chat-content chat-content--embed">
          <iframe
            title="Chat oficial de PIPAA en Twitch"
            src={`https://www.twitch.tv/embed/pipa_arg/chat?parent=${encodeURIComponent(hostname)}&darkpopout`}
          />
          <a
            href="https://www.twitch.tv/popout/pipa_arg/chat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openChatPopup(e, "https://www.twitch.tv/popout/pipa_arg/chat", "pipaa-twitch-chat")}
          >
            <span>¿No te toma la sesión? Abrir ventana de Twitch</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      )}

      {compose === "kick" && (
        <div className="chat-content chat-content--embed">
          <iframe
            title="Chat oficial de PIPAA en Kick"
            src="https://kick.com/popout/pipa_arg/chat"
          />
          <a
            href="https://kick.com/popout/pipa_arg/chat"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openChatPopup(e, "https://kick.com/popout/pipa_arg/chat", "pipaa-kick-chat")}
          >
            <span>¿No te toma la sesión? Abrir ventana de Kick</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      )}

      {compose === "youtube" && (
        <div className="chat-content chat-content--embed">
          {ytStatus.state === "loading" ? (
            <div className="chat-empty-state" role="status">
              <PlatformBrandIcon platform="youtube" size={22} />
              <p>Buscando directo activo en YouTube…</p>
            </div>
          ) : ytStatus.live && ytStatus.videoId ? (
            <iframe
              title="Chat oficial de PIPAA en YouTube"
              src={`https://www.youtube.com/live_chat?v=${encodeURIComponent(ytStatus.videoId)}&embed_domain=${encodeURIComponent(hostname)}&dark_theme=1`}
            />
          ) : (
            <div className="chat-empty-state chat-embed-offline" role="status">
              <PlatformBrandIcon platform="youtube" size={22} />
              <p>PIPAA no está transmitiendo en YouTube en este momento.</p>
              <div className="chat-embed-offline-actions">
                <button type="button" className="room-button" onClick={() => void refreshYouTubeChat()}>
                  Reintentar
                </button>
              </div>
            </div>
          )}
          <a
            href={ytStatus.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openChatPopup(e, ytStatus.watchUrl, "pipaa-yt-chat")}
          >
            <span>{ytStatus.live ? "¿No te toma la sesión? Abrir ventana de YouTube" : "Abrir canal en YouTube"}</span>
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="chat-compose-bar">
        {writing ? (
          <button
            className="chat-write-toggle is-active"
            type="button"
            aria-label="Volver al multichat"
            onClick={() => setCompose(null)}
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Chat</span>
          </button>
        ) : (
          <span className="chat-compose-label">
            <Send size={12} aria-hidden="true" />
            <span>Escribir:</span>
          </span>
        )}

        <div className="chat-compose-actions">
          <button
            type="button"
            className={`chat-compose-btn is-twitch ${compose === "twitch" ? "is-selected" : ""}`}
            aria-pressed={compose === "twitch"}
            onClick={() => toggleCompose("twitch")}
          >
            <PlatformBrandIcon platform="twitch" size={11} />
            <span>Twitch</span>
          </button>

          <button
            type="button"
            className={`chat-compose-btn is-kick ${compose === "kick" ? "is-selected" : ""}`}
            aria-pressed={compose === "kick"}
            onClick={() => toggleCompose("kick")}
          >
            <PlatformBrandIcon platform="kick" size={11} />
            <span>Kick</span>
          </button>

          <button
            type="button"
            className={`chat-compose-btn is-youtube ${compose === "youtube" ? "is-selected" : ""}`}
            aria-pressed={compose === "youtube"}
            onClick={() => toggleCompose("youtube")}
          >
            <PlatformBrandIcon platform="youtube" size={11} />
            <span>YT</span>
          </button>
        </div>
      </div>
    </section>
  );
}
