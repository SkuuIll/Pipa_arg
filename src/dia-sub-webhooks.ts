import type { DiaSub, Platform } from "./dia-sub";

export type DiaSubEnv = {
  DIA_SUB: DurableObjectNamespace<DiaSub>;
  KICK_BROADCASTER_ID?: string;
  TWITCH_BROADCASTER_ID?: string;
  TWITCH_EVENTSUB_SECRET?: string;
};

type Badge = { set_id?: string; type?: string };
type TwitchEvent = {
  broadcaster_user_id?: string;
  source_broadcaster_user_id?: string | null;
  chatter_user_id?: string;
  chatter_user_login?: string;
  chatter_is_anonymous?: boolean;
  message?: { text?: string };
  badges?: Badge[];
  started_at?: string;
};
type KickEvent = {
  broadcaster?: { user_id?: number };
  sender?: { user_id?: number; username?: string; is_anonymous?: boolean; identity?: { badges?: Badge[] } };
  content?: string;
  created_at?: string;
  is_live?: boolean;
  started_at?: string;
  ended_at?: string;
};

const encoder = new TextEncoder();
const maxBodySize = 64 * 1024;
const kickKeyUrl = "https://api.kick.com/public/v1/public-key";
let cachedKickKey: { key: CryptoKey; expiresAt: number } | undefined;
const twitchTypes = new Set(["channel.chat.message", "stream.online", "stream.offline"]);

function empty(status = 204) {
  return new Response(null, { status });
}

function commandName(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const match = text.trim().match(/^!?diasub\s+(.+)$/iu);
  const name = match?.[1]?.trim();
  return name && name.length <= 50 && !/[\u0000-\u001f\u007f]/u.test(name) ? name : null;
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
}

async function boundedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let body = "";
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) return body + decoder.decode();
    size += value.byteLength;
    if (size > maxBodySize) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

async function verifyTwitch(secret: string, payload: string, signature: string) {
  if (!/^sha256=[\da-f]{64}$/i.test(signature)) return false;
  const bytes = Uint8Array.from(signature.slice(7).match(/../g) ?? [], (hex) => parseInt(hex, 16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  return crypto.subtle.verify("HMAC", key, bytes, encoder.encode(payload));
}

async function verifyKick(payload: string, signature: string) {
  let bytes: Uint8Array<ArrayBuffer>;
  try {
    bytes = fromBase64(signature);
  } catch {
    return false;
  }
  if (cachedKickKey && cachedKickKey.expiresAt > Date.now()) {
    return crypto.subtle.verify("RSASSA-PKCS1-v1_5", cachedKickKey.key, bytes, encoder.encode(payload));
  }
  const response = await fetch(kickKeyUrl, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error("Kick public key unavailable");
  const { data } = await response.json<{ data: { public_key: string } }>();
  const key = await crypto.subtle.importKey(
    "spki",
    fromBase64(data.public_key.replace(/-----[^-]+-----|\s/g, "")),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  cachedKickKey = { key, expiresAt: Date.now() + 300_000 };
  return crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, bytes, encoder.encode(payload));
}

function eventTime(value: string | undefined, deliveredAt: number) {
  const time = Date.parse(value ?? "");
  return Number.isFinite(time) && time <= deliveredAt + 60_000 ? time : deliveredAt;
}

async function twitchWebhook(
  request: Request, env: DiaSubEnv, raw: string, deliveredAt: number, signed: string, signature: string,
) {
  const secret = env.TWITCH_EVENTSUB_SECRET;
  if (!secret || !env.TWITCH_BROADCASTER_ID) return empty(503);
  if (!await verifyTwitch(secret, signed, signature)) return empty(403);
  const body = JSON.parse(raw) as {
    challenge?: string;
    event?: TwitchEvent;
    subscription?: { type?: string; version?: string; condition?: { broadcaster_user_id?: string } };
  };
  const type = body.subscription?.type;
  if (!type || !twitchTypes.has(type) || body.subscription?.version !== "1") return empty();
  if (body.subscription.condition?.broadcaster_user_id !== env.TWITCH_BROADCASTER_ID) return empty(403);

  const kind = request.headers.get("Twitch-Eventsub-Message-Type");
  if (kind === "webhook_callback_verification" && typeof body.challenge === "string") {
    return new Response(body.challenge, { headers: { "content-type": "text/plain" } });
  }

  const event = body.event;
  if (kind !== "notification" || event?.broadcaster_user_id !== env.TWITCH_BROADCASTER_ID) return empty();
  if (type !== "channel.chat.message") {
    const live = type === "stream.online";
    await queue(env).setStream("twitch", live, live ? eventTime(event.started_at, deliveredAt) : deliveredAt);
  } else if (
    event.chatter_user_id && event.chatter_user_login &&
    !event.chatter_is_anonymous &&
    (!event.source_broadcaster_user_id || event.source_broadcaster_user_id === env.TWITCH_BROADCASTER_ID)
  ) {
    const store = queue(env);
    const gameName = commandName(event.message?.text);
    if (gameName && event.badges?.some((badge) => badge.set_id === "subscriber" || badge.set_id === "founder")) {
      await store.join("twitch", event.chatter_user_id, event.chatter_user_login, gameName, deliveredAt);
    }
  }
  return empty();
}

async function kickWebhook(
  request: Request, env: DiaSubEnv, raw: string, deliveredAt: number, signed: string, signature: string,
) {
  if (!env.KICK_BROADCASTER_ID) return empty(503);
  const type = request.headers.get("Kick-Event-Type");
  if (request.headers.get("Kick-Event-Version") !== "1") return empty();
  const event = JSON.parse(raw) as KickEvent;
  if (String(event.broadcaster?.user_id) !== env.KICK_BROADCASTER_ID) return empty();
  if (type === "livestream.status.updated" && typeof event.is_live === "boolean") {
    if (!await verifyKick(signed, signature)) return empty(403);
    const changedAt = eventTime(event.is_live ? event.started_at : event.ended_at, deliveredAt);
    await queue(env).setStream("kick", event.is_live, changedAt);
  } else if (
    type === "chat.message.sent" && commandName(event.content) &&
    event.sender?.user_id && event.sender.username && !event.sender.is_anonymous
  ) {
    if (!await verifyKick(signed, signature)) return empty(403);
    const store = queue(env);
    const at = eventTime(event.created_at, deliveredAt);
    const gameName = commandName(event.content);
    if (gameName && event.sender.identity?.badges?.some((badge) => badge.type === "subscriber")) {
      await store.join("kick", String(event.sender.user_id), event.sender.username, gameName, at);
    }
  }
  return empty();
}

export function queue(env: DiaSubEnv) {
  return env.DIA_SUB.get(env.DIA_SUB.idFromName("pipa_arg"));
}

export async function diaSubWebhook(platform: Platform, request: Request, env: DiaSubEnv) {
  if (request.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  const prefix = platform === "kick" ? "Kick-Event" : "Twitch-Eventsub";
  const id = request.headers.get(`${prefix}-Message-Id`);
  const timestamp = request.headers.get(`${prefix}-Message-Timestamp`);
  const signature = request.headers.get(platform === "kick" ? "Kick-Event-Signature" : "Twitch-Eventsub-Message-Signature");
  const deliveredAt = Date.parse(timestamp ?? "");
  const now = Date.now();
  if (!id || !signature || !timestamp || !Number.isFinite(deliveredAt) || deliveredAt < now - 600_000 || deliveredAt > now + 60_000) return empty(403);
  const raw = await boundedBody(request);
  if (raw === null) return empty(413);

  try {
    return platform === "kick"
      ? await kickWebhook(request, env, raw, deliveredAt, `${id}.${timestamp}.${raw}`, signature)
      : await twitchWebhook(request, env, raw, deliveredAt, `${id}${timestamp}${raw}`, signature);
  } catch (error) {
    if (error instanceof SyntaxError) return empty(400);
    console.error("Día Sub webhook error", platform, error instanceof Error ? error.name : "UnknownError");
    return empty(503);
  }
}
