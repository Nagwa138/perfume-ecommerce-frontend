// src/hero/StreetHero.tsx
// 400vh scroll section. Sticky Canvas. Single WebGL context. Capability fallbacks.
import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import HeroScene from "./HeroScene";
import HeroOverlay from "./HeroOverlay";
import StaticStreetHero from "./StaticStreetHero";
import { readReducedMotion } from "./useStreetStore";

function detectWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function StreetHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [reducedMotion] = useState<boolean>(() =>
    typeof window === "undefined" ? false : readReducedMotion(),
  ); // TEMPORARILY FORCED OFF

  // WebGL detection — one shot at mount
  useEffect(() => {
    if (!detectWebGL()) setWebGLFailed(true);
  }, []);

  // IntersectionObserver — unmount Canvas when off-screen
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "300px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Reduced motion, WebGL failed, or context lost → static fallback
  if (reducedMotion || webGLFailed) return <StaticStreetHero />;

  return (
    <div ref={heroRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {inView && (
          <Canvas
            dpr={[1, 1.5]}
            gl={{
              antialias: false,
              powerPreference: "high-performance",
            }}
            camera={{ position: [0, 2.3, 8], fov: 55, near: 0.5, far: 160 }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener("webglcontextlost", (e) => {
                e.preventDefault();
                setWebGLFailed(true);
              });
            }}
          >
            <Suspense fallback={null}>
              <HeroScene reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>
        )}

        {inView && <HeroOverlay reducedMotion={reducedMotion} />}
      </div>
    </div>
  );
}