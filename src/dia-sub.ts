import { DurableObject } from "cloudflare:workers";
import { saturdayFor } from "./argentina-date";
import type { DiaSubEnv } from "./dia-sub-webhooks";

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
    const connected = configured.filter((platform) => streams.some((stream) => stream.platform === platform));
    const openStreams = streams.filter((stream) =>
      connected.includes(stream.platform) &&
      stream.live === 1 &&
      now - stream.changedAt < sessionWindowMs &&
      isSaturday,
    );
    const open = openStreams.map((stream) => stream.platform);
    const expiresAt = openStreams.length
      ? Math.min(Date.parse(`${date}T03:00:00Z`) + 86_400_000, Math.max(...openStreams.map((stream) => stream.changedAt + sessionWindowMs)))
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
