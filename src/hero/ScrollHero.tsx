/**
 * hero/ScrollHero.tsx
 * ~300 vh sticky scroll hero: perfume bottle → lipstick → serum dropper.
 * Scroll offset is written to a module-level ref from a window listener,
 * then read in useFrame every tick — like storing ephemeral state in a plain
 * PHP static variable rather than re-triggering a full Eloquent observer loop.
 * Per-frame material opacity is updated by traversing each THREE.Group ref,
 * bypassing React's reconciler entirely for smooth 60fps transitions.
 *
 * Rules: Canvas dpr max 1.5, antialias off, no shadows, OrbitControls
 * autoRotate at low speed, static fallback for no-WebGL /
 * prefers-reduced-motion, unmount Canvas when section leaves viewport.
 */
import { type RefObject, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

// ── Module-level scroll state ─────────────────────────────────────────────────
const heroScroll = { current: 0 };

// ── Section accent colors ─────────────────────────────────────────────────────
const SEC_COLORS = [
  new THREE.Color("#C8A951"),  // Fragrance
  new THREE.Color("#d4a0a0"),  // Makeup
  new THREE.Color("#a0c4b8"),  // Skincare
];

// ── Floating gem ──────────────────────────────────────────────────────────────
function Gem({ position, scale, speed, color }: {
  position: [number, number, number]; scale: number; speed: number; color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.x += dt * speed * 0.6;
    ref.current.rotation.y += dt * speed;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} metalness={0.65} roughness={0.25} />
    </mesh>
  );
}

const GEM_DEFS: Array<{ position: [number,number,number]; scale: number; speed: number; color: string }> = [
  { position: [-1.8,  1.4, -1.0], scale: 0.13, speed: 0.35, color: "#C8A951" },
  { position: [ 1.9,  0.6, -0.8], scale: 0.09, speed: 0.55, color: "#d4a0a0" },
  { position: [-1.6, -0.8, -0.6], scale: 0.11, speed: 0.45, color: "#a0c4b8" },
  { position: [ 1.5, -1.2, -1.2], scale: 0.08, speed: 0.65, color: "#C8A951" },
  { position: [ 0.0,  2.0, -1.4], scale: 0.10, speed: 0.30, color: "#d4a0a0" },
];

// ── Perfume bottle group ───────────────────────────────────────────────────────
const ROUND: [number, number][] = [
  [0,0],[0.5,0],[0.55,0.04],[0.62,0.3],[0.68,0.9],[0.72,1.6],[0.65,2.2],
  [0.48,2.65],[0.3,2.9],[0.26,3.0],[0.26,3.4],[0.38,3.5],[0.38,3.85],[0,3.85],
];
function mkLiquidProfile(profile: [number,number][], fill = 0.72): [number,number][] {
  const maxH = profile[profile.length - 1][1] * fill;
  const pts: [number,number][] = [[0, 0.02]];
  for (const [r, h] of profile) {
    if (h <= 0.02) continue;
    if (h >= maxH) { pts.push([r * 0.82, maxH]); break; }
    pts.push([r * 0.82, h]);
  }
  pts.push([0, maxH]);
  return pts;
}

function BottleGroup({ groupRef }: { groupRef: RefObject<THREE.Group | null> }) {
  const pts  = ROUND.map(([r,h]) => new THREE.Vector2(r * 0.48, h * 0.46));
  const lPts = mkLiquidProfile(ROUND).map(([r,h]) => new THREE.Vector2(r * 0.48, h * 0.46));
  const bottleGeo = new THREE.LatheGeometry(pts, 56);
  const liquidGeo = new THREE.LatheGeometry(lPts, 48);
  const topH = ROUND[ROUND.length - 1][1];
  return (
    <group ref={groupRef as RefObject<THREE.Group>} position={[0, -0.9, 0]}>
      <mesh geometry={liquidGeo}>
        <meshPhysicalMaterial color="#C8A951" roughness={0.1} transparent opacity={1} />
      </mesh>
      <mesh geometry={bottleGeo}>
        <meshPhysicalMaterial color="#c8d4dc" transmission={0.88} roughness={0.04}
          ior={1.45} thickness={0.4} transparent opacity={0.32}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, topH * 0.46 * 0.88, 0]}>
        <cylinderGeometry args={[0.21, 0.195, 0.28, 36]} />
        <meshStandardMaterial color="#C8A951" metalness={0.92} roughness={0.12} transparent opacity={1} />
      </mesh>
    </group>
  );
}

// ── Lipstick group ─────────────────────────────────────────────────────────────
function LipstickGroup({ groupRef }: { groupRef: RefObject<THREE.Group | null> }) {
  const pts = [
    [0.28,0],[0.28,0.72],[0.24,0.88],[0.14,1.04],[0.05,1.16],[0,1.20],
  ].map(([r,h]) => new THREE.Vector2(r, h));
  const bulletGeo = new THREE.LatheGeometry(pts, 32);
  return (
    <group ref={groupRef as RefObject<THREE.Group>} position={[0, -0.9, 0]} visible={false}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 1.9, 32]} />
        <meshStandardMaterial color="#C8A951" metalness={0.88} roughness={0.14} transparent opacity={0} />
      </mesh>
      <mesh geometry={bulletGeo} position={[0, 0.98, 0]}>
        <meshStandardMaterial color="#c0392b" roughness={0.28} transparent opacity={0} />
      </mesh>
      <mesh position={[0, -0.88, 0]}>
        <torusGeometry args={[0.4, 0.055, 8, 32]} />
        <meshStandardMaterial color="#C8A951" metalness={0.9} roughness={0.1} transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ── Serum dropper group ────────────────────────────────────────────────────────
function DropperGroup({ groupRef }: { groupRef: RefObject<THREE.Group | null> }) {
  const pts = [
    [0,0],[0.26,0.02],[0.3,0.35],[0.28,0.85],
    [0.22,1.25],[0.17,1.52],[0.15,1.72],
    [0.15,1.85],[0.21,1.9],[0.21,2.02],[0,2.02],
  ].map(([r,h]) => new THREE.Vector2(r * 0.72, h * 0.72));
  const bodyGeo = new THREE.LatheGeometry(pts, 48);
  return (
    <group ref={groupRef as RefObject<THREE.Group>} position={[0, -0.76, 0]} visible={false}>
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial color="#a0c4b8" transmission={0.9} roughness={0.03}
          ior={1.45} thickness={0.3} transparent opacity={0}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, 1.44, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.26, 24]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.7} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.19, 24, 16]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.72} transparent opacity={0} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.155, 0.025, 8, 24]} />
        <meshStandardMaterial color="#C8A951" metalness={0.9} roughness={0.1} transparent opacity={0} />
      </mesh>
    </group>
  );
}

// ── Helper: set opacity for all meshes in a Group ─────────────────────────────
function applyOpacity(group: THREE.Group | null, opacity: number) {
  if (!group) return;
  group.visible = opacity > 0.01;
  group.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      if (m && "opacity" in m) (m as THREE.Material & { opacity: number }).opacity = opacity;
    }
  });
}

// ── Animated scene ─────────────────────────────────────────────────────────────
function HeroScene() {
  const bottleRef = useRef<THREE.Group | null>(null);
  const lipRef    = useRef<THREE.Group | null>(null);
  const dropRef   = useRef<THREE.Group | null>(null);
  const ambRef    = useRef<THREE.AmbientLight>(null);
  const workCol   = new THREE.Color();

  useFrame(() => {
    const p  = heroScroll.current;
    const oB = p < 0.30 ? 1 : p < 0.50 ? 1 - (p - 0.30) / 0.20 : 0;
    const oL = p < 0.30 ? 0 : p < 0.50 ? (p - 0.30) / 0.20 : p < 0.70 ? 1 : p < 0.85 ? 1 - (p - 0.70) / 0.15 : 0;
    const oD = p < 0.70 ? 0 : p < 0.85 ? (p - 0.70) / 0.15 : 1;
    applyOpacity(bottleRef.current, oB);
    applyOpacity(lipRef.current, oL);
    applyOpacity(dropRef.current, oD);
    const seg = Math.min(2, Math.floor(p * 3));
    const t   = (p * 3) % 1;
    workCol.copy(SEC_COLORS[seg]).lerp(SEC_COLORS[Math.min(2, seg + 1)], t);
    if (ambRef.current) ambRef.current.color.copy(workCol);
  });

  return (
    <>
      <ambientLight ref={ambRef} intensity={0.6} />
      <directionalLight position={[3, 5, 3]} intensity={1.0} castShadow={false} />
      <pointLight position={[-3, 2, 2]} intensity={0.5} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <BottleGroup  groupRef={bottleRef} />
        <LipstickGroup groupRef={lipRef} />
        <DropperGroup  groupRef={dropRef} />
        {GEM_DEFS.map((g, i) => <Gem key={i} {...g} />)}
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false}
        autoRotate autoRotateSpeed={0.5}
        minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.7} />
    </>
  );
}

// ── Caption overlay ───────────────────────────────────────────────────────────
const CAPTIONS = [
  { label: "Fragrance", sub: "Niche perfumes & luxury scents", to: "/shop?product_type=perfume",  cta: "Explore Fragrance" },
  { label: "Makeup",    sub: "Complexion, lips & eyes",        to: "/shop?product_type=makeup",   cta: "Explore Makeup" },
  { label: "Skincare",  sub: "Serums, moisturisers & more",    to: "/shop?product_type=skincare", cta: "Explore Skincare" },
];

function HeroCaption({ containerRef }: { containerRef: RefObject<HTMLDivElement | null> }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect  = container.getBoundingClientRect();
      const total = container.offsetHeight - window.innerHeight;
      const p     = Math.max(0, Math.min(1, -rect.top / total));
      heroScroll.current = p;
      setIdx(p < 0.42 ? 0 : p < 0.78 ? 1 : 2);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerRef]);

  const c = CAPTIONS[idx];
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center"
        >
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles size={11} />
            {c.label}
          </p>
          <h1 className="font-display text-6xl font-bold tracking-[0.04em] md:text-8xl lg:text-9xl">AURA</h1>
          <div className="gold-divider mx-auto my-5 w-28" />
          <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted md:text-base">{c.sub}</p>
        </motion.div>
      </AnimatePresence>
      <div className="pointer-events-auto mt-10 flex gap-4">
        <AnimatePresence mode="wait">
          <motion.div key={`cta-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Link to={c.to}
              className="flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-bold tracking-wider text-white transition-all hover:bg-accent-2 hover:shadow-gold">
              {c.cta} <ArrowRight size={14} />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Static fallback ───────────────────────────────────────────────────────────
function StaticHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-bg">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-1/4 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute right-1/4 top-2/3 h-[400px] w-[400px] rounded-full bg-accent/4 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-28 text-center md:py-40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent">
            <Sparkles size={12} /> Luxury Beauty Destination
          </p>
          <h1 className="font-display text-6xl font-bold tracking-[0.04em] md:text-8xl lg:text-9xl">AURA</h1>
          <div className="gold-divider mx-auto my-5 w-32" />
          <p className="mx-auto max-w-md text-base leading-relaxed text-muted md:text-lg">
            Discover curated fragrances, skincare rituals and beauty essentials crafted for those who appreciate the extraordinary.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/shop" className="flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold tracking-wider text-white transition-all hover:bg-accent-2 hover:shadow-gold">
            Shop All Beauty <ArrowRight size={15} />
          </Link>
          <Link to="/quiz/fragrance" className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold text-white/80 transition-all hover:border-white/50 hover:text-white">
            Find Your Scent
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ── WebGL check ───────────────────────────────────────────────────────────────
function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function ScrollHero() {
  const prefersReduced = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [webGL]  = useState(() => typeof document !== "undefined" ? canWebGL() : false);
  const [inView, setInView] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stickyRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (prefersReduced || !webGL) return <StaticHero />;

  return (
    <div ref={containerRef} style={{ height: "300vh" }} className="relative">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden border-b border-border">
        {inView && (
          <Canvas
            dpr={[1, 1.5]}
            gl={{ antialias: false }}
            style={{ position: "absolute", inset: 0 }}
          >
            <HeroScene />
          </Canvas>
        )}
        <HeroCaption containerRef={containerRef} />
      </div>
    </div>
  );
}
