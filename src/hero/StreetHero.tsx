import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import HeroScene from "./HeroScene";
import HeroOverlay from "./HeroOverlay";
import StaticStreetHero from "./StaticStreetHero";

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

export default function StreetHero() {
  const heroRef        = useRef<HTMLDivElement>(null);
  const [inView,       setInView]       = useState(true);
  const [webGLFailed,  setWebGLFailed]  = useState(false);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (!detectWebGL()) setWebGLFailed(true);
  }, []);

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

  if (reducedMotion || webGLFailed) return <StaticStreetHero />;

  return (
    <div ref={heroRef} className="relative h-[100vh]">
      <div className="relative h-screen w-full overflow-hidden">
        {inView && (
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: false }}
            camera={{ position: [0, 2.8, 6], fov: 65, near: 0.5, far: 200 }}
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
