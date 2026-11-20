import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MultiChat } from "../app/MultiChat";
import "../app/globals.css";
import "../app/redesign.css";
import "../app/live-hub.css";

const transparent = new URLSearchParams(window.location.search).get("bg") === "transparent";
if (transparent) {
  document.documentElement.classList.add("chat-bg-transparent");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main className={`standalone-chat-page ${transparent ? "is-transparent" : ""}`}>
      <MultiChat standalone />
    </main>
  </StrictMode>,
);
