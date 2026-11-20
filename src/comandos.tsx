import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TiendaPage from "../app/comandos/page";
import "../app/globals.css";
import "../app/redesign.css";
import "../app/live-hub.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TiendaPage />
  </StrictMode>,
);
