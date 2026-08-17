import { useEffect, useState } from "react";

const argentinaTime = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const argentinaHour = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  hour: "numeric",
  hour12: false,
});

export function LocalTime() {
  const [time, setTime] = useState("--:--");
  const [isLiveWindow, setIsLiveWindow] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(argentinaTime.format(now));
      const hour = parseInt(argentinaHour.format(now), 10);
      // Stream window is 15:00 to 00:00 Argentina time
      setIsLiveWindow(hour >= 15 && hour < 24);
    };

    update();
    const timer = window.setInterval(update, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="arg-clock" aria-label={`Hora actual en Argentina: ${time}`}>
      <div className="arg-clock-header">
        <small>HORA LOCAL</small>
        <span className={`status-badge ${isLiveWindow ? "is-live" : "is-scheduled"}`}>
          <i className="status-dot" aria-hidden="true" />
          {isLiveWindow ? "HORARIO DE STREAM" : "PRÓXIMO 15:00"}
        </span>
      </div>
      <strong>
        {time} <span>ARG</span>
      </strong>
    </div>
  );
}
