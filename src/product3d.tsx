/**
 * product3d.tsx
 * Unified 3D product viewer that routes to the correct mesh based on
 * product_type + subcategory. Like Laravel's polymorphic resource forms —
 * one entry point that swaps rendering strategy on a type discriminator
 * without changing the caller's API surface.
 *
 * Rules: Canvas dpr max 1.5, antialias off, no shadows, static fallback
 * when WebGL is unavailable, OrbitControls auto-rotate respects
 * prefers-reduced-motion.  Shade swatch selection recolors the shape live.
 */
import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// ── Constants ─────────────────────────────────────────────────────────────────
const GOLD      = "#C8A951";
const OFF_WHITE = "#f0ece4";
const GLASS_COL = "#c8d4dc";

// ── Perfume profiles (same geometry as bottle.tsx) ────────────────────────────
const PROFILES: Record<string, [number, number][]> = {
  round: [
    [0,0],[0.5,0],[0.55,0.04],[0.62,0.3],[0.68,0.9],[0.72,1.6],[0.65,2.2],
    [0.48,2.65],[0.3,2.9],[0.26,3.0],[0.26,3.4],[0.38,3.5],[0.38,3.85],[0,3.85],
  ],
  square: [
    [0,0],[0.55,0],[0.6,0.04],[0.65,0.4],[0.7,1.1],[0.72,1.9],[0.68,2.4],
    [0.5,2.75],[0.3,2.95],[0.26,3.05],[0.26,3.5],[0.42,3.6],[0.42,4.0],[0,4.0],
  ],
  tall: [
    [0,0],[0.45,0],[0.5,0.04],[0.55,0.5],[0.6,1.4],[0.62,2.4],[0.55,3.0],
    [0.4,3.4],[0.26,3.65],[0.24,3.75],[0.24,4.3],[0.4,4.4],[0.4,4.85],[0,4.85],
  ],
};

function getLiquidProfile(profile: [number,number][], fill = 0.72): [number,number][] {
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

// ── Perfume bottle ─────────────────────────────────────────────────────────────
function PerfumeMesh({ capStyle, liquidColor }: { capStyle: string; liquidColor: string }) {
  const profile  = PROFILES[capStyle] ?? PROFILES.round;
  const lProfile = getLiquidProfile(profile);
  const topH     = profile[profile.length - 1][1];

  const pts  = useMemo(() => profile.map(([r, h]) => new THREE.Vector2(r * 0.48, h * 0.46)), [capStyle]);
  const lPts = useMemo(() => lProfile.map(([r, h]) => new THREE.Vector2(r * 0.48, h * 0.46)), [capStyle]);
  const bottleGeo = useMemo(() => new THREE.LatheGeometry(pts, 56), [pts]);
  const liquidGeo = useMemo(() => new THREE.LatheGeometry(lPts, 48), [lPts]);

  return (
    <group position={[0, -0.9, 0]}>
      <mesh geometry={liquidGeo}>
        <meshPhysicalMaterial color={liquidColor} roughness={0.1} transparent opacity={0.72} />
      </mesh>
      <mesh geometry={bottleGeo}>
        <meshPhysicalMaterial color={GLASS_COL} transmission={0.88} roughness={0.04}
          ior={1.45} thickness={0.4} transparent opacity={0.32}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <mesh position={[0, topH * 0.46 * 0.88, 0]}>
        <cylinderGeometry args={[0.21, 0.195, 0.28, 36]} />
        <meshStandardMaterial color={GOLD} metalness={0.92} roughness={0.12} />
      </mesh>
    </group>
  );
}

// ── Lipstick ───────────────────────────────────────────────────────────────────
function LipstickMesh({ color }: { color: string }) {
  const bulletPts = useMemo(() => [
    [0.28, 0], [0.28, 0.72], [0.24, 0.88],
    [0.14, 1.04], [0.05, 1.16], [0.0, 1.20],
  ].map(([r, h]) => new THREE.Vector2(r, h)), []);
  const bulletGeo = useMemo(() => new THREE.LatheGeometry(bulletPts, 32), [bulletPts]);

  return (
    <group position={[0, -0.9, 0]}>
      {/* Outer case tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 1.9, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.14} />
      </mesh>
      {/* Inner opening at top */}
      <mesh position={[0, 0.95, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.12, 32]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Lipstick bullet */}
      <mesh geometry={bulletGeo} position={[0, 0.98, 0]}>
        <meshStandardMaterial color={color} roughness={0.28} metalness={0.04} />
      </mesh>
      {/* Twist mechanism ring */}
      <mesh position={[0, -0.88, 0]}>
        <torusGeometry args={[0.4, 0.055, 8, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Base end cap */}
      <mesh position={[0, -0.97, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.06, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ── Cream jar ─────────────────────────────────────────────────────────────────
function JarMesh({ color }: { color: string }) {
  return (
    <group position={[0, -0.4, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.9, 0.84, 0.72, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.06} reflectivity={0.6}
          clearcoat={0.5} clearcoatRoughness={0.1} />
      </mesh>
      {/* Lid rim */}
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.96, 0.9, 0.08, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.14} />
      </mesh>
      {/* Lid face */}
      <mesh position={[0, 0.49, 0]}>
        <cylinderGeometry args={[0.94, 0.94, 0.03, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.05} clearcoat={1} clearcoatRoughness={0.05} />
      </mesh>
      {/* Logo disc */}
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.015, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.95} roughness={0.08} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.37, 0]}>
        <cylinderGeometry args={[0.84, 0.84, 0.03, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.86} roughness={0.14} />
      </mesh>
    </group>
  );
}

// ── Serum dropper ─────────────────────────────────────────────────────────────
function DropperMesh({ color }: { color: string }) {
  const bodyPts = useMemo(() => [
    [0, 0], [0.26, 0.02], [0.3, 0.35], [0.28, 0.85],
    [0.22, 1.25], [0.17, 1.52], [0.15, 1.72],
    [0.15, 1.85], [0.21, 1.9], [0.21, 2.02], [0, 2.02],
  ].map(([r, h]) => new THREE.Vector2(r * 0.72, h * 0.72)), []);
  const bodyGeo = useMemo(() => new THREE.LatheGeometry(bodyPts, 48), [bodyPts]);

  return (
    <group position={[0, -0.76, 0]}>
      {/* Liquid fill (amber) */}
      <mesh position={[0, 0, 0]}>
        <mesh geometry={bodyGeo}>
          <meshPhysicalMaterial color={color} roughness={0.1} transparent opacity={0.65} />
        </mesh>
      </mesh>
      {/* Glass body */}
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial color={GLASS_COL} transmission={0.9} roughness={0.03}
          ior={1.45} thickness={0.3} transparent opacity={0.28}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Dropper collar (black rubber) */}
      <mesh position={[0, 1.44, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.26, 24]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.7} />
      </mesh>
      {/* Rubber bulb */}
      <mesh position={[0, 1.68, 0]}>
        <sphereGeometry args={[0.19, 24, 16]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.72} />
      </mesh>
      {/* Gold shoulder band */}
      <mesh position={[0, 1.3, 0]}>
        <torusGeometry args={[0.155, 0.025, 8, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ── Pump bottle ───────────────────────────────────────────────────────────────
function PumpMesh({ color }: { color: string }) {
  const bodyPts = useMemo(() => [
    [0, 0], [0.36, 0.02], [0.38, 0.5], [0.4, 1.1],
    [0.4, 1.6], [0.36, 1.78], [0.28, 1.88],
    [0.21, 1.96], [0.19, 2.08], [0, 2.08],
  ].map(([r, h]) => new THREE.Vector2(r * 0.72, h * 0.72)), []);
  const bodyGeo = useMemo(() => new THREE.LatheGeometry(bodyPts, 48), [bodyPts]);

  return (
    <group position={[0, -0.76, 0]}>
      {/* Body */}
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial color={color} roughness={0.1} clearcoat={0.6}
          clearcoatRoughness={0.08} />
      </mesh>
      {/* Pump tube */}
      <mesh position={[0, 1.56, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 0.56, 16]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Pump head */}
      <mesh position={[0, 1.86, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.14, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Nozzle */}
      <mesh position={[0.18, 1.86, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.045, 0.04, 0.22, 12]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.12} />
      </mesh>
      {/* Label band */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.302, 0.302, 0.6, 48]} />
        <meshStandardMaterial color={OFF_WHITE} roughness={0.3} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

// ── Compact ───────────────────────────────────────────────────────────────────
function CompactMesh({ color }: { color: string }) {
  return (
    <group position={[0, -0.18, 0]}>
      {/* Base disc */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.0, 0.98, 0.26, 48]} />
        <meshPhysicalMaterial color={color} roughness={0.08} clearcoat={0.8}
          clearcoatRoughness={0.05} />
      </mesh>
      {/* Mirror / pan surface inside */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.88, 0.88, 0.02, 48]} />
        <meshStandardMaterial color="#c0c8d0" metalness={0.95} roughness={0.04} />
      </mesh>
      {/* Lid (slightly open angle) */}
      <group rotation={[-0.28, 0, 0]} position={[0, 0.14, 0.5]}>
        <mesh position={[0, 0.1, -0.5]}>
          <cylinderGeometry args={[1.02, 1.0, 0.1, 48]} />
          <meshPhysicalMaterial color={color} roughness={0.08} clearcoat={0.8}
            clearcoatRoughness={0.05} />
        </mesh>
        {/* Lid inner — the pan color */}
        <mesh position={[0, 0.14, -0.5]}>
          <cylinderGeometry args={[0.88, 0.88, 0.02, 48]} />
          <meshStandardMaterial color={color === OFF_WHITE ? "#d4c4b8" : color}
            roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
      {/* Gold rim */}
      <mesh position={[0, 0.14, 0]}>
        <torusGeometry args={[1.0, 0.03, 8, 48]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.12} />
      </mesh>
    </group>
  );
}

// ── Mascara ───────────────────────────────────────────────────────────────────
function MascaraMesh({ color }: { color: string }) {
  return (
    <group position={[0, -0.9, 0]}>
      {/* Tube */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.26, 1.7, 24]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Cap / wand section */}
      <mesh position={[0, 1.08, 0]}>
        <cylinderGeometry args={[0.3, 0.28, 0.76, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.5} />
      </mesh>
      {/* Gold band between tube and cap */}
      <mesh position={[0, 0.69, 0]}>
        <torusGeometry args={[0.29, 0.03, 8, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Wand tip nub */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.09, 12, 8]} />
        <meshStandardMaterial color="#222222" roughness={0.5} />
      </mesh>
      {/* Bristle ring hint */}
      <mesh position={[0, 1.44, 0]}>
        <torusGeometry args={[0.11, 0.025, 6, 16]} />
        <meshStandardMaterial color="#333333" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── Eyeshadow palette ─────────────────────────────────────────────────────────
const PAN_POS: [number, number][] = [
  [-0.65, -0.36], [0, -0.36], [0.65, -0.36],
  [-0.65,  0.36], [0,  0.36], [0.65,  0.36],
];

function PaletteMesh({ color }: { color: string }) {
  const panColors = useMemo(() => {
    const base = new THREE.Color(color);
    return PAN_POS.map((_, i) => {
      const c = base.clone();
      c.offsetHSL(i * 0.04 - 0.1, 0, (i % 2 === 0 ? -0.08 : 0.08));
      return "#" + c.getHexString();
    });
  }, [color]);

  return (
    <group position={[0, -0.1, 0]} rotation={[-0.3, 0, 0]}>
      {/* Base box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.18, 1.6]} />
        <meshPhysicalMaterial color={OFF_WHITE} roughness={0.1} clearcoat={0.7}
          clearcoatRoughness={0.06} />
      </mesh>
      {/* Pans */}
      {PAN_POS.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <cylinderGeometry args={[0.26, 0.26, 0.06, 24]} />
          <meshStandardMaterial color={panColors[i]} roughness={0.3} metalness={0.1} />
        </mesh>
      ))}
      {/* Gold border */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.46, 0.04, 1.66]} />
        <meshStandardMaterial color={GOLD} metalness={0.88} roughness={0.14} />
      </mesh>
      {/* Lid (slightly open) */}
      <group rotation={[-0.4, 0, 0]} position={[0, 0.1, 0.78]}>
        <mesh position={[0, 0.06, -0.78]}>
          <boxGeometry args={[2.4, 0.1, 1.6]} />
          <meshPhysicalMaterial color={OFF_WHITE} roughness={0.1} clearcoat={0.7} />
        </mesh>
        {/* Mirror inside lid */}
        <mesh position={[0, 0.1, -0.78]}>
          <boxGeometry args={[2.1, 0.015, 1.3]} />
          <meshStandardMaterial color="#c8d0d8" metalness={0.95} roughness={0.04} />
        </mesh>
      </group>
    </group>
  );
}

// ── Nail polish ───────────────────────────────────────────────────────────────
function NailPolishMesh({ color }: { color: string }) {
  const bodyPts = useMemo(() => [
    [0, 0], [0.3, 0.02], [0.34, 0.45], [0.3, 0.88],
    [0.22, 1.0], [0.18, 1.12], [0.18, 1.22], [0, 1.22],
  ].map(([r, h]) => new THREE.Vector2(r * 0.78, h * 0.78)), []);
  const bodyGeo = useMemo(() => new THREE.LatheGeometry(bodyPts, 36), [bodyPts]);

  return (
    <group position={[0, -0.52, 0]}>
      {/* Liquid fill visible through glass */}
      <mesh geometry={bodyGeo}>
        <meshStandardMaterial color={color} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Glass shell */}
      <mesh geometry={bodyGeo}>
        <meshPhysicalMaterial color={GLASS_COL} transmission={0.82} roughness={0.04}
          ior={1.45} thickness={0.25} transparent opacity={0.3}
          side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Cap / brush handle */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.17, 0.72, 24]} />
        <meshStandardMaterial color="#111111" roughness={0.4} />
      </mesh>
      {/* Cap band */}
      <mesh position={[0, 0.65, 0]}>
        <torusGeometry args={[0.185, 0.025, 8, 24]} />
        <meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// ── Floating low-poly gem (ambient decoration, used in hero) ──────────────────
export function FloatGem({
  position, scale = 0.12, speed = 0.4, color = GOLD,
}: {
  position: [number, number, number]; scale?: number; speed?: number; color?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.7;
    ref.current.rotation.y += delta * speed;
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

// ── Shape router ──────────────────────────────────────────────────────────────
function pickShape(productType: string, subcategory: string): string {
  if (productType === "perfume") return "perfume";
  const sub = subcategory.toLowerCase();
  if (sub.includes("lipstick") || sub.includes("lip gloss") || sub.includes("lip liner")) return "lipstick";
  if (sub.includes("mascara"))                             return "mascara";
  if (sub.includes("eyeshadow") || sub.includes("palette")) return "palette";
  if (sub.includes("nail"))                                return "nailpolish";
  if (sub.includes("compact") || sub.includes("blush") || sub.includes("bronzer") || sub.includes("highlighter")) return "compact";
  if (productType === "makeup")                            return "lipstick";
  if (sub.includes("serum") || sub.includes("dropper") || sub.includes("retinol") || sub.includes("vitamin")) return "dropper";
  if (sub.includes("eye cream") || sub.includes("moisturizer") || sub.includes("mask") || sub.includes("scrub")) return "jar";
  if (sub.includes("shampoo") || sub.includes("conditioner") || sub.includes("body wash") || sub.includes("lotion") || sub.includes("pump")) return "pump";
  if (productType === "haircare") return "pump";
  return "jar";
}

// ── WebGL check ───────────────────────────────────────────────────────────────
function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

// ── Static fallback ───────────────────────────────────────────────────────────
function StaticFallback({ name, color }: { name: string; color: string }) {
  return (
    <div
      className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-2"
      style={{ boxShadow: `0 0 60px ${color}33` }}
    >
      <span className="font-display text-5xl font-bold tracking-widest text-white/20">
        {name.slice(0, 1)}
      </span>
    </div>
  );
}

// ── Inner scene (runs inside Canvas) ─────────────────────────────────────────
function ProductScene({
  shape, capStyle, liquidColor, shadeHex,
}: {
  shape: string; capStyle: string; liquidColor: string; shadeHex: string;
}) {
  const prefersReduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const color = shadeHex || liquidColor;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} castShadow={false} />
      <pointLight position={[-3, 2, 2]} intensity={0.7} color={GOLD} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        {shape === "perfume"    && <PerfumeMesh   capStyle={capStyle} liquidColor={liquidColor} />}
        {shape === "lipstick"   && <LipstickMesh  color={color} />}
        {shape === "jar"        && <JarMesh       color={color} />}
        {shape === "dropper"    && <DropperMesh   color={color} />}
        {shape === "pump"       && <PumpMesh      color={color} />}
        {shape === "compact"    && <CompactMesh   color={color} />}
        {shape === "mascara"    && <MascaraMesh   color={color} />}
        {shape === "palette"    && <PaletteMesh   color={color} />}
        {shape === "nailpolish" && <NailPolishMesh color={color} />}
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={!prefersReduced}
        autoRotateSpeed={1.4}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.72}
      />
    </>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function Product3D({
  productType  = "perfume",
  subcategory  = "",
  capStyle     = "round",
  liquidColor  = GOLD,
  shadeHex     = "",
  name         = "H STORE",
}: {
  productType?: string;
  subcategory?: string;
  capStyle?:    string;
  liquidColor?: string;
  shadeHex?:    string;
  name?:        string;
}) {
  const [webGL] = useState<boolean>(() =>
    typeof document !== "undefined" ? canWebGL() : false,
  );

  const shape = useMemo(
    () => pickShape(productType, subcategory),
    [productType, subcategory],
  );

  const glowColor = shadeHex || liquidColor;

  if (!webGL) return <StaticFallback name={name} color={glowColor} />;

  return (
    <div className="relative">
      <div
        className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2"
        style={{ boxShadow: `0 0 48px ${glowColor}22` }}
      >
        <Canvas dpr={[1, 1.5]} gl={{ antialias: false }}>
          <ProductScene
            shape={shape}
            capStyle={capStyle}
            liquidColor={liquidColor}
            shadeHex={shadeHex}
          />
        </Canvas>
      </div>
    </div>
  );
}
