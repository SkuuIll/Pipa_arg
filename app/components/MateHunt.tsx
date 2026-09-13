import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from "react";
import "./mate-hunt.css";

const mateIds = ["trayectoria", "setup", "comunidad"] as const;
type MateId = typeof mateIds[number];
const storageKey = "pipaa:mate-hunt:v1";
type HuntState = { found: MateId[]; notice: string };
type HuntAction = { type: "find"; id: MateId } | { type: "dismiss" } | { type: "reset" };

function initialState(): HuntState {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(stored)) return { found: mateIds.filter(id => stored.includes(id)), notice: "" };
  } catch { /* Storage may be unavailable or contain stale data. */ }
  return { found: [], notice: "" };
}

function reducer(state: HuntState, action: HuntAction): HuntState {
  if (action.type === "dismiss") return { ...state, notice: "" };
  if (action.type === "reset") return { found: [], notice: "" };
  if (state.found.includes(action.id)) return state;
  const found = [...state.found, action.id];
  return { found, notice: found.length === 3
    ? "¡Tres de tres! Sos Cebador oficial de la Panza Army."
    : `Encontraste un mate · ${found.length}/3. Hay tres escondidos en la web. ¡Seguí buscando!` };
}

const HuntContext = createContext<{
  found: MateId[];
  saved: boolean;
  find: (id: MateId) => void;
  reset: () => void;
} | null>(null);

function useHunt() {
  const context = useContext(HuntContext);
  if (!context) throw new Error("MateHuntProvider is required");
  return context;
}

function MateIcon() {
  return <svg viewBox="0 0 64 72" fill="none" aria-hidden="true" focusable="false">
    <path d="M38 27 45 9l10-4" stroke="#dce6ed" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m43 17 3-8 9-4" stroke="#a7ff00" strokeWidth="2" strokeLinecap="round" />
    <path d="M15 29c-7 12-6 27 4 34 7 5 19 5 26 0 10-7 11-22 4-34Z" fill="#321957" stroke="#b087ec" strokeWidth="2" />
    <path d="M13 44c11 7 27 7 38 0v7c-11 7-27 7-38 0Z" fill="#6d35db" />
    <path d="m30 36-6 11h7l-2 12 12-17h-8l3-6Z" fill="#a7ff00" />
    <ellipse cx="32" cy="29" rx="18" ry="7" fill="#dce6ed" />
    <ellipse cx="32" cy="29" rx="14" ry="4" fill="#526e23" />
    <path d="m23 29 4-1m6 3 3-2m4 0 3-1" stroke="#b9cb69" strokeWidth="1.5" strokeLinecap="round" />
    <path d="m37 29 5-12" stroke="#dce6ed" strokeWidth="4" />
    <path d="M19 38c-3 8-2 14 0 18" stroke="#c5a4f3" strokeWidth="2" strokeLinecap="round" opacity=".55" />
  </svg>;
}

export function MateHuntProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state.found));
      setSaved(true);
    } catch { setSaved(false); }
  }, [state.found]);

  const reset = () => {
    dispatch({ type: "reset" });
    requestAnimationFrame(() => document.getElementById("mate-trayectoria")?.focus());
  };
  return <HuntContext.Provider value={{ found: state.found, saved, find: id => dispatch({ type: "find", id }), reset }}>
    {children}
    <div className="mate-announcement" role="status" aria-live="polite" aria-atomic="true">{state.notice}</div>
    {state.notice && <aside className={`mate-notice${state.found.length === 3 ? " mate-notice-complete" : ""}`} aria-label="Hallazgo de la Panza Army">
      <MateIcon />
      <div><small>{state.found.length === 3 ? "RANGO DESBLOQUEADO" : "SECRETO ENCONTRADO"}</small><p>{state.notice}</p><a href="#mate-progress">Ver mi progreso</a></div>
      <button type="button" className="mate-dismiss" onClick={() => dispatch({ type: "dismiss" })} aria-label="Cerrar aviso del mate">×</button>
      {state.found.length === 3 && <span className="mate-sparks" aria-hidden="true">✦ · ✧ · ✦</span>}
    </aside>}
  </HuntContext.Provider>;
}

export function HiddenMate({ id }: { id: MateId }) {
  const { found, find } = useHunt();
  const collected = found.includes(id);
  return <button type="button" id={`mate-${id}`} className={`hidden-mate hidden-mate-${id}${collected ? " is-found" : ""}`}
    aria-label={`${collected ? "Mate encontrado" : "Recoger mate escondido"} en ${id}`}
    aria-disabled={collected} onClick={() => find(id)} title={collected ? "¡Este ya lo cebaste!" : "¿Y este mate?"}>
    <MateIcon />
    {collected && <span className="mate-check" aria-hidden="true">✓</span>}
  </button>;
}

export function MateProgress() {
  const { found, saved, reset } = useHunt();
  if (!found.length) return <div id="mate-progress" />;
  return <section id="mate-progress" className="mate-progress" aria-labelledby="mate-progress-title">
    <div><p className="eyebrow">MISIÓN PANZA ARMY · {found.length}/3</p>
      <h2 id="mate-progress-title">{found.length === 3 ? "CEBADOR OFICIAL" : "LA RONDA SIGUE."}</h2>
      <p>{found.length === 3 ? "Encontraste los tres mates. La próxima ronda corre por tu cuenta." : "Hay tres mates escondidos en la web. Encontralos y ganate tu lugar en la ronda."}</p>
      <small>{saved ? "Progreso guardado en este navegador." : "Progreso disponible durante esta visita."}</small>
    </div>
    <div className="mate-progress-actions"><span className="mate-progress-slots" aria-label={`${found.length} de 3 mates encontrados`}>
      {mateIds.map(id => <span key={id} className={found.includes(id) ? "is-found" : ""}><MateIcon /></span>)}
    </span><button type="button" onClick={reset}>Reiniciar búsqueda</button></div>
  </section>;
}
