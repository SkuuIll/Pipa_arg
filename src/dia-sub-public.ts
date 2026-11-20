import { saturdayFor } from "./argentina-date";

export type PublicSignup = {
  platform: "kick" | "twitch";
  userKey: string;
  user: string;
  gameName: string;
  timestamp: number;
};

// Only parse data read directly from the configured public chat relay on the
// server. A browser-submitted message must never be considered proof of a sub.
export function parsePublicSignup(value: unknown, now: number): PublicSignup | null {
  if (!value || typeof value !== "object") return null;
  const m = value as Record<string, unknown>;
  if ((m.platform !== "kick" && m.platform !== "twitch") || m.channel !== "pipa_arg" || m.kind !== "chat" || m.deleted || m.source_name) return null;
  if (typeof m.author !== "string" || !m.author.trim() || m.author.length > 50 || /[\u0000-\u001f\u007f]/u.test(m.author)) return null;
  if (typeof m.timestamp !== "number" || !Number.isFinite(m.timestamp) || m.timestamp > now + 60_000 || now - m.timestamp > 12 * 3_600_000 || !saturdayFor(m.timestamp).isSaturday || saturdayFor(m.timestamp).date !== saturdayFor(now).date || !saturdayFor(now).isSaturday) return null;
  if (!Array.isArray(m.badges) || !m.badges.some((b) => typeof b === "string" && (m.platform === "twitch" ? /^(subscriber|founder)(?:\/\d+)?$/i : /^subscriber(?:\/\d+)?$/i).test(b))) return null;
  if (typeof m.text !== "string") return null;
  const match = m.text.trim().match(/^!?(?:d[ií]a\s*sub)\s+(.+)$/iu);
  const gameName = match?.[1]?.trim();
  if (!gameName || gameName.length > 50 || /[\u0000-\u001f\u007f]/u.test(gameName)) return null;
  const user = m.author.trim();
  return { platform: m.platform, userKey: user.toLocaleLowerCase("en-US"), user, gameName, timestamp: m.timestamp };
}
