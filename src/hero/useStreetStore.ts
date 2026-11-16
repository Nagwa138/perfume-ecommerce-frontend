// src/hero/useStreetStore.ts
// Per-frame scroll state lives in plain refs (no React re-render).
// The overlay also subscribes for coarse beat changes (setState only on beat flip).
import { useEffect, useState } from "react";
import { SCROLL_SCALE, BEATS } from "./types";

// ── Module-level refs — read inside useFrame ─────────────────────────────────
export const scrollRef = { current: 0 };  // 0–1 progress through the 400vh section
export const beatRef   = { current: -1 }; // -1 = no beat; 0..3 = BEATS index

// ── DOM-side subscription (single listener, throttled to rAF) ────────────────
type BeatListener = (index: number, progress: number) => void;
const listeners = new Set<BeatListener>();

function computeProgress(): number {
  if (typeof window === "undefined") return 0;
  const denom = window.innerHeight * SCROLL_SCALE;
  if (denom <= 0) return 0;
  return Math.max(0, Math.min(1, window.scrollY / denom));
}

function computeBeat(p: number): number {
  // Nearest beat within ±0.045 — same tolerance the old AvatarMesh used.
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < BEATS.length; i++) {
    const d = Math.abs(p - BEATS[i].at);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return bestDist < 0.045 ? best : -1;
}

function tick() {
  const p = computeProgress();
  scrollRef.current = p;

  const nextBeat = computeBeat(p);
  if (nextBeat !== beatRef.current) {
    beatRef.current = nextBeat;
    for (const l of listeners) l(nextBeat, p);
  }
}

let installed = false;
function install() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  let raf = 0;
  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  // Run once so the very first frame has the right p
  tick();
}

// Install on first import (idempotent)
install();

// ── Public hook for the overlay (only fires on beat change) ──────────────────
export function useBeat(): number {
  // The overlay needs React state to re-render captions.
  // This local state only changes when the beat flips.
  const [, force] = useState(0);
  useEffect(() => {
    const onBeat: BeatListener = () => force((n: number) => n + 1);
    listeners.add(onBeat);
    return () => { listeners.delete(onBeat); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return beatRef.current;
}

// ── Motion + theme helpers ──────────────────────────────────────────────────
export function readReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function readThemeAccent(): string {
  if (typeof window === "undefined") return "#D9B979";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--h-accent")
    .trim();
  return v || "#D9B979";
}