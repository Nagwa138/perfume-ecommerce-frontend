import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useOutfitStore } from "./useOutfitStore";
import HeroScene from "./HeroScene";
import HeroOverlay from "./HeroOverlay";

// Beat progress fractions (must match AvatarMesh.tsx BEATS)
const BEATS = [0.2, 0.4, 0.6, 0.8];

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

// ── Fallback: static gradient street shown when WebGL is unavailable ──────────
function FallbackHero() {
  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-end pb-20"
      style={{
        background:
          "linear-gradient(to bottom, #e8703a 0%, #c05020 30%, #0a0a1e 100%)",
      }}
    >
      {/* Fake road */}
      <div className="absolute bottom-0 left-1/2 h-24 w-[60vw] -translate-x-1/2 rounded-t-sm bg-[#1a1a1e]" />
      <div className="absolute bottom-0 left-1/2 h-24 w-0.5 -translate-x-1/2 bg-white/20" />
      <div className="relative z-10 text-center">
        <h1 className="font-display text-5xl font-black tracking-tight text-white sm:text-6xl">
          NOVA WEAR
        </h1>
        <p className="mt-2 text-sm text-white/60">Fall Collection — Live Now</p>
        <a
          href="/?cat=Hoodies"
          className="mt-5 inline-block rounded-full bg-white/90 px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-white"
        >
          Shop Now →
        </a>
      </div>
    </div>
  );
}

export default function StreetHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [canvasVisible, setCanvasVisible] = useState(true);
  const [webGLFailed,   setWebGLFailed]   = useState(false);
  const [activeBeat,    setActiveBeat]     = useState(-1);
  const [scrollPct,     setScrollPct]      = useState(0);

  const reducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  const outfit = useOutfitStore();

  // ── WebGL detection ──────────────────────────────────────────────────
  useEffect(() => {
    if (!detectWebGL()) setWebGLFailed(true);
  }, []);

  // ── IntersectionObserver: unmount canvas when hero leaves viewport ───
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCanvasVisible(entry.isIntersecting),
      { rootMargin: "300px" }   // keep alive 300px before/after
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Scroll listener: update beat + progress for overlay ─────────────
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const totalScroll = window.innerHeight * 3;
        const p = Math.min(1, Math.max(0, window.scrollY / totalScroll));
        setScrollPct(p);
        const beat = BEATS.findIndex(b => Math.abs(p - b) < 0.044);
        setActiveBeat(beat);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Show fallback if WebGL is broken
  if (webGLFailed) return <FallbackHero />;

  return (
    // 400vh container — 300vh of scroll travel while viewport stays fixed
    <div ref={heroRef} className="relative h-[400vh]">

      {/* Sticky viewport-height canvas wrapper */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">

        {/* Three.js canvas — unmounted when off-screen */}
        {canvasVisible && (
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: false, powerPreference: "high-performance" }}
            camera={{ position: [0, 2.3, 7.5], fov: 55, near: 0.5, far: 160 }}
            onCreated={({ gl }) => {
              // webglcontextlost: show static fallback
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                setWebGLFailed(true);
              });
            }}
          >
            {/* Suspense so scene loads gracefully */}
            <Suspense fallback={null}>
              <HeroScene outfit={outfit} reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>
        )}

        {/* DOM overlay — always present for text/UI */}
        <HeroOverlay activeBeat={activeBeat} scrollPct={scrollPct} />
      </div>
    </div>
  );
}
