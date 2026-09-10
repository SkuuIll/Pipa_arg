import { useEffect, useRef, useState } from "react";
import { Crosshair, Play, RotateCcw } from "lucide-react";
import type { CommandItem } from "./commandsData";

type Effect = "audio" | "mirror" | "blind" | "drop" | "shake";
function effectFor(command: CommandItem): Effect {
  const text = `${command.id} ${command.name} ${command.hardwareTarget} ${command.whatItDoes}`.toLowerCase();
  if (/audio|voz|sonido|mutear|auricular/.test(text)) return "audio";
  if (/invert|espejo|wasd/.test(text)) return "mirror";
  if (/ciego|cegar|pantalla|interfaz|mira/.test(text)) return "blind";
  if (/tirar|soltar|dropear/.test(text)) return "drop";
  return "shake";
}
const labels: Record<Effect, string> = { audio:"Señal de audio intervenida", mirror:"Controles invertidos", blind:"Visión interferida", drop:"Arma fuera de juego", shake:"Impacto en la partida" };

export function SabotagePreview({ command }: { command: CommandItem }) {
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effect = effectFor(command);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    setPlaying(true); setCompleted(false);
    timer.current = setTimeout(() => { setPlaying(false); setCompleted(true); }, 3200);
  };
  return <div className={`sabotage-preview effect-${effect}${playing ? " is-playing" : ""}`}>
    <div className="sabotage-screen" aria-hidden="true">
      <span className="sabotage-hud">PANZA LAB <b>{playing ? "INTERVENIDO" : "ONLINE"}</b></span>
      <div className="sabotage-world"><div className="sabotage-horizon" /><span className="sabotage-target" /><Crosshair className="sabotage-crosshair" size={32} /><span className="sabotage-weapon" /></div>
      <div className="sabotage-waves">{Array.from({length:12},(_,i)=><i key={i} style={{animationDelay:`${i*70}ms`}} />)}</div>
      <span className="sabotage-feedback">{playing ? labels[effect] : "LISTO PARA PROBAR"}</span>
    </div>
    <button type="button" onClick={start} disabled={playing} aria-label={`Ver efecto de ${command.name}`}>
      {completed ? <RotateCcw size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
      {playing ? "Efecto activo…" : completed ? "Repetir efecto" : "Ver efecto"}<small>DEMO VISUAL</small>
    </button>
    <span className="sr-only" role="status">{playing ? `Demostración visual: ${labels[effect]}` : completed ? "Demostración terminada" : ""}</span>
  </div>;
}
