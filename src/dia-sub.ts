import { DurableObject } from "cloudflare:workers";
import { saturdayFor } from "./argentina-date";
import type { DiaSubEnv } from "./dia-sub-webhooks";
import { parsePublicSignup } from "./dia-sub-public";

export type Platform = "kick" | "twitch";
type Entry = { name: string; gameName: string | null; platform: Platform; joinedAt: number };
type StreamState = { platform: Platform; live: number; changedAt: number };

const sessionWindowMs = 12 * 3_600_000;

export type DiaSubState = {
  date: string;
  status: "setup" | "waiting" | "open" | "closed";
  connected: Platform[];
  open: Platform[];
  entries: Entry[];
  expiresAt?: number;
};

export class DiaSub extends DurableObject<DiaSubEnv> {
  private sql = this.ctx.storage.sql;
  private publicSocket?: WebSocket;
  private publicConnecting?: Promise<void>;
  private publicConnected = new Set<Platform>();

  constructor(ctx: DurableObjectState, env: DiaSubEnv) {
    super(ctx, env);
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS streams (
        platform TEXT PRIMARY KEY, live INTEGER NOT NULL, changedAt INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS signups (
        date TEXT NOT NULL, platform TEXT NOT NULL, userId TEXT NOT NULL,
        name TEXT NOT NULL, joinedAt INTEGER NOT NULL,
        PRIMARY KEY (date, platform, userId)
      );
    `);
    const columns = this.sql.exec<{ name: string }>("PRAGMA table_info(signups)").toArray();
    if (!columns.some((column) => column.name === "gameName")) {
      this.sql.exec("ALTER TABLE signups ADD COLUMN gameName TEXT");
    }
  }

  streamState() {
    return this.sql.exec<StreamState>("SELECT * FROM streams").toArray();
  }

  // Open the upstream connection inside the Durable Object: browser input is
  // never trusted as evidence of a subscription or written to the shared list.
  async ensurePublicFeed() {
    if (!saturdayFor(Date.now()).isSaturday) {
      this.publicSocket?.close();
      this.publicSocket = undefined;
      this.publicConnected.clear();
      return;
    }
    await this.ctx.storage.setAlarm(Date.now() + 120_000);
    if (this.publicSocket || this.publicConnecting) return this.publicConnecting;
    this.publicConnecting = this.connectPublicFeed();
    try { await this.publicConnecting; } finally { this.publicConnecting = undefined; }
  }

  async alarm() { await this.ensurePublicFeed(); }

  private async connectPublicFeed() {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch("https://unified-chat.com/ws", { headers: { Upgrade: "websocket" }, signal: controller.signal });
      clearTimeout(timeout);
      const socket = response.webSocket;
      if (!socket) throw new Error("Chat relay did not upgrade");
      this.publicSocket = socket;
      socket.accept();
      socket.addEventListener("message", (event) => {
        if (typeof event.data !== "string" || event.data.length > 250_000) return;
        try {
          const data = JSON.parse(event.data) as { type?: string; messages?: unknown[]; message?: unknown; statuses?: unknown[]; status?: unknown };
          const statuses = data.type === "bootstrap" && Array.isArray(data.statuses) ? data.statuses : data.type === "status" ? [data.status] : [];
          for (const item of statuses) {
            if (!item || typeof item !== "object") continue;
            const status = item as { platform?: Platform; channel?: string; state?: string };
            if (status.channel !== "pipa_arg" || (status.platform !== "kick" && status.platform !== "twitch")) continue;
            if (status.state === "connected") this.publicConnected.add(status.platform);
            else this.publicConnected.delete(status.platform);
          }
          const messages = data.type === "bootstrap" && Array.isArray(data.messages) ? data.messages : data.type === "message" ? [data.message] : [];
          for (const message of messages) {
            const signup = parsePublicSignup(message, Date.now());
            if (!signup || !this.publicConnected.has(signup.platform)) continue;
            this.sql.exec(`INSERT INTO signups (date, platform, userId, name, gameName, joinedAt)
              VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(date, platform, userId) DO UPDATE SET
              name = excluded.name, gameName = excluded.gameName, joinedAt = excluded.joinedAt
              WHERE excluded.joinedAt < signups.joinedAt`, saturdayFor(signup.timestamp).date,
              signup.platform, `chat:${signup.userKey}`, signup.user, signup.gameName, signup.timestamp);
          }
        } catch (error) { console.error("Día Sub: invalid chat event", error instanceof Error ? error.name : "error"); }
      });
      const disconnected = () => { if (this.publicSocket === socket) { this.publicSocket = undefined; this.publicConnected.clear(); } };
      socket.addEventListener("close", disconnected);
      socket.addEventListener("error", disconnected);
      socket.send(JSON.stringify({ type: "subscribe", channels: { kick: "pipa_arg", twitch: "pipa_arg" } }));
    } catch (error) {
      console.error("Día Sub: chat connection unavailable", error instanceof Error ? error.name : "error");
    } finally {
      clearTimeout(timeout);
    }
  }

  setStream(platform: Platform, live: boolean, changedAt: number) {
    this.sql.exec(`
      INSERT INTO streams (platform, live, changedAt) VALUES (?, ?, ?)
      ON CONFLICT(platform) DO UPDATE SET live = excluded.live, changedAt = excluded.changedAt
      WHERE excluded.changedAt > streams.changedAt
    `, platform, Number(live), changedAt);
  }

  join(platform: Platform, userId: string, name: string, gameName: string, joinedAt: number) {
    const stream = this.sql.exec<StreamState>(
      "SELECT * FROM streams WHERE platform = ? AND live = 1",
      platform,
    ).toArray()[0];
    if (!stream || joinedAt < stream.changedAt || joinedAt - stream.changedAt >= sessionWindowMs) return;

    const currentDay = saturdayFor(joinedAt);
    if (!currentDay.isSaturday) return;

    const sessionDate = currentDay.date;
    this.sql.exec(`
      INSERT INTO signups (date, platform, userId, name, gameName, joinedAt)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date, platform, userId) DO UPDATE SET name = excluded.name, gameName = excluded.gameName, joinedAt = excluded.joinedAt
      WHERE excluded.joinedAt < signups.joinedAt
    `, sessionDate, platform, userId, name, gameName, joinedAt);
  }

  snapshot(now: number, configured: Platform[]): DiaSubState {
    const { date, isSaturday } = saturdayFor(now);
    const streams = this.sql.exec<StreamState>("SELECT * FROM streams").toArray();
    const connected = (['kick', 'twitch'] as const).filter((platform) =>
      this.publicConnected.has(platform) || (configured.includes(platform) && streams.some((stream) => stream.platform === platform)),
    );
    const openStreams = streams.filter((stream) =>
      connected.includes(stream.platform) &&
      stream.live === 1 &&
      now - stream.changedAt < sessionWindowMs &&
      isSaturday,
    );
    const open = (['kick', 'twitch'] as const).filter((platform) => isSaturday && (this.publicConnected.has(platform) || openStreams.some((stream) => stream.platform === platform)));
    const expiresAt = open.length
      ? this.publicConnected.size ? Date.parse(`${date}T03:00:00Z`) + 86_400_000 : Math.min(Date.parse(`${date}T03:00:00Z`) + 86_400_000, Math.max(...openStreams.map((stream) => stream.changedAt + sessionWindowMs)))
      : undefined;
    const entries = this.sql.exec<Entry>(`
      SELECT name, gameName, platform, joinedAt FROM signups WHERE date = ? ORDER BY joinedAt, rowid
    `, date).toArray();

    let status: DiaSubState["status"] = "closed";
    if (!connected.length) status = "setup";
    else if (open.length) status = "open";
    else if (isSaturday) {
      const endedToday = streams.some((stream) => {
        if (!connected.includes(stream.platform) || stream.live) return false;
        const end = saturdayFor(stream.changedAt);
        return end.isSaturday && end.date === date;
      });
      if (!endedToday) status = "waiting";
    }
    return { date, status, connected, open, entries, expiresAt };
  }
}
