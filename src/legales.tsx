import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LegalesPage from "../app/legales/page";
import "../app/globals.css";
import "../app/redesign.css";
import "../app/live-hub.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LegalesPage />
  </StrictMode>,
);
