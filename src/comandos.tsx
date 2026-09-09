import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ComandosPage from "../app/comandos/page";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ComandosPage />
  </StrictMode>,
);
