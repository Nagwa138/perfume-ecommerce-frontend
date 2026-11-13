import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Lenis from "lenis";
import "./index.css";
import App from "./App";

// Apply saved theme before first paint to prevent flash
const _savedTheme = localStorage.getItem("hossam-theme") ?? "emerald";
document.documentElement.setAttribute("data-theme", _savedTheme);

function LenisInit() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LenisInit />
      <App />
    </BrowserRouter>
  </StrictMode>
);
