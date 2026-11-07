import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // ใช้ path สัมพัทธ์ → ทำงานได้ทั้งที่ root (Vercel) และ subpath (GitHub Pages)
    navigator.serviceWorker.register("sw.js").catch(() => {
      // Offline cache registration ignored in unsupported environments
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
