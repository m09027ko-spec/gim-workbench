import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element was not found.");
}

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);

if (
  "serviceWorker" in navigator &&
  import.meta.env.PROD &&
  document.querySelector('meta[name="portable-build"]') === null
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((error: unknown) => {
      console.info("Service worker registration skipped.", error);
    });
  });
}
