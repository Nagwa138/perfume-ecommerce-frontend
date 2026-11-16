import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import HeroScene from "./HeroScene";
import HeroOverlay from "./HeroOverlay";
import StaticStreetHero from "./StaticStreetHero";

export default function StreetHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  
  // FORCE 3D TO RENDER (Comment out the safety checks temporarily)
  const webGLFailed = false; 
  const reducedMotion = false; 

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
    <div ref={heroRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
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