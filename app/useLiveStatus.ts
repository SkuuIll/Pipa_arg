import { useEffect, useState } from "react";
import type { Platform } from "../src/dia-sub";

export const platformLabels = { kick: "Kick", twitch: "Twitch" } satisfies Record<Platform, string>;
export type LiveStatus = { live: Platform[]; offline?: Platform[]; known: boolean };

export function useLiveStatus() {
  const [status, setStatus] = useState<LiveStatus>();
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        const response = await fetch("/api/live", {
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]),
        });
        if (!response.ok) throw new Error("Estado no disponible");
        const data = await response.json() as LiveStatus;
        if (!controller.signal.aborted) setStatus(data);
      } catch {
        if (!controller.signal.aborted) setStatus({ live: [], known: false });
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, 20_000);
      }
    }
    void refresh();
    return () => { controller.abort(); clearTimeout(timer); };
  }, []);
  return status;
}
