"use client";

import { useEffect, useState } from "react";

const argentinaTime = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function LocalTime() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const update = () => setTime(argentinaTime.format(new Date()));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="arg-clock" aria-label={`Hora actual en Argentina: ${time}`}>
      <small>HORA LOCAL</small>
      <strong>{time} <span>ARG</span></strong>
    </div>
  );
}
