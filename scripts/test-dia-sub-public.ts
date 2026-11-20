import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePublicSignup } from "../src/dia-sub-public";

const saturday = Date.parse("2026-11-21T18:00:00-03:00");
const message = {
  platform: "twitch", channel: "pipa_arg", kind: "chat", author: "SubPrueba",
  text: "!diasub Nombre En Juego", timestamp: saturday, badges: ["subscriber/2"], source_name: "",
};

test("acepta mensajes del canal con insignia de sub y nombre", () => {
  assert.deepEqual(parsePublicSignup(message, saturday), {
    platform: "twitch", userKey: "subprueba", user: "SubPrueba", gameName: "Nombre En Juego", timestamp: saturday,
  });
  assert.equal(parsePublicSignup({ ...message, platform: "kick", badges: ["subscriber"], text: "Día Sub MiNombre" }, saturday)?.gameName, "MiNombre");
});

test("rechaza mensajes que no demuestran una inscripción válida", () => {
  for (const change of [
    { badges: [] }, { badges: ["sub-gifter/5"] }, { text: "¡me gusta el día sub hoy!" },
    { text: "!diasub" }, { source_name: "OtroCanal" }, { channel: "otro" }, { deleted: true },
    { platform: "kick", badges: ["founder"] },
  ]) assert.equal(parsePublicSignup({ ...message, ...change }, saturday), null);
  assert.equal(parsePublicSignup(message, Date.parse("2026-11-22T00:01:00-03:00")), null);
});
