import { Suspense, useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// Profile curves for different cap styles
const PROFILES: Record<string, [number, number][]> = {
  round: [
    [0, 0], [0.5, 0], [0.55, 0.04], [0.62, 0.3],
    [0.68, 0.9], [0.72, 1.6], [0.65, 2.2],
    [0.48, 2.65], [0.3, 2.9], [0.26, 3.0],
    [0.26, 3.4], [0.38, 3.5], [0.38, 3.85], [0, 3.85],
  ],
  square: [
    [0, 0], [0.55, 0], [0.6, 0.04], [0.65, 0.4],
    [0.7, 1.1], [0.72, 1.9], [0.68, 2.4],
    [0.5, 2.75], [0.3, 2.95], [0.26, 3.05],
    [0.26, 3.5], [0.42, 3.6], [0.42, 4.0], [0, 4.0],
  ],
  tall: [
    [0, 0], [0.45, 0], [0.5, 0.04], [0.55, 0.5],
    [0.6, 1.4], [0.62, 2.4], [0.55, 3.0],
    [0.4, 3.4], [0.26, 3.65], [0.24, 3.75],
    [0.24, 4.3], [0.4, 4.4], [0.4, 4.85], [0, 4.85],
  ],
};

function getLiquidProfile(profile: [number, number][], fillPct = 0.72): [number, number][] {
  const maxH = profile[profile.length - 1][1] * fillPct;
  const pts: [number, number][] = [[0, 0.02]];
  for (const [r, h] of profile) {
    if (h <= 0.02) continue;
    if (h >= maxH) { pts.push([r * 0.82, maxH]); break; }
    pts.push([r * 0.82, h]);
  }
  pts.push([0, maxH]);
  return pts;
}

function MistParticles({ active, color }: { active: boolean; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const count = 120;
  const positions = useMemo(() => new Float32Array(count * 3), []);
  const vels = useMemo(() => Array.from({ length: count }, () => ({
    vx: (Math.random() - 0.5) * 0.06,
    vy: Math.random() * 0.09 + 0.03,
    vz: (Math.random() - 0.5) * 0.06,
    t: Math.random() * 0.5,
  })), []);

  useFrame((_, delta) => {
    if (!active || !ref.current) return;
    for (let i = 0; i < count; i++) {
      const v = vels[i];
      v.t += delta;
      if (v.t > 1.4) { v.t = 0; v.vx = (Math.random() - 0.5) * 0.06; v.vz = (Math.random() - 0.5) * 0.06; }
      positions[i * 3]     = v.vx * v.t * 14;
      positions[i * 3 + 1] = 1.9 + v.vy * v.t * 10;
      positions[i * 3 + 2] = v.vz * v.t * 14;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  if (!active) return null;
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.055} transparent opacity={0.55} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function BottleMesh({ capStyle, liquidColor, spraying }: {
  capStyle: string; liquidColor: string; spraying: boolean;
}) {
  const profile = PROFILES[capStyle] ?? PROFILES.round;
  const lProfile = getLiquidProfile(profile);
  const topH = profile[profile.length - 1][1];

  const pts  = useMemo(() => profile.map(([r, h]) => new THREE.Vector2(r * 0.48, h * 0.46)), [capStyle]);
  const lPts = useMemo(() => lProfile.map(([r, h]) => new THREE.Vector2(r * 0.48, h * 0.46)), [capStyle]);

  const bottleGeo = useMemo(() => new THREE.LatheGeometry(pts, 56), [pts]);
  const liquidGeo = useMemo(() => new THREE.LatheGeometry(lPts, 48), [lPts]);

  return (
    <group position={[0, -0.9, 0]}>
      {/* Liquid */}
      <mesh geometry={liquidGeo}>
        <meshPhysicalMaterial
          color={liquidColor}
          roughness={0.1}
          metalness={0.0}
          transparent
          opacity={0.72}
        />
      </mesh>

      {/* Glass shell */}
      <mesh geometry={bottleGeo}>
        <meshPhysicalMaterial
          color="#c8d4dc"
          transmission={0.88}
          roughness={0.04}
          metalness={0.0}
          ior={1.45}
          thickness={0.4}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Gold cap */}
      <mesh position={[0, topH * 0.46 * 0.88, 0]}>
        <cylinderGeometry args={[0.21, 0.195, 0.28, 36]} />
        <meshStandardMaterial color="#C8A951" metalness={0.92} roughness={0.12} />
      </mesh>

      <MistParticles active={spraying} color={liquidColor} />
    </group>
  );
}

function Scene({ capStyle, liquidColor, spraying }: {
  capStyle: string; liquidColor: string; spraying: boolean;
}) {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} />
      <pointLight position={[-3, 2, 2]} intensity={0.7} color="#C8A951" />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <BottleMesh capStyle={capStyle} liquidColor={liquidColor} spraying={spraying} />
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

function canWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

export default function Bottle3D({
  capStyle = "round",
  liquidColor = "#C8A951",
  name = "AURA",
}: {
  capStyle?: string;
  liquidColor?: string;
  name?: string;
}) {
  const [spraying, setSpraying] = useState(false);
  const [webGL] = useState<boolean>(() => typeof document !== "undefined" ? canWebGL() : false);

  const handleSpray = () => {
    if (spraying) return;
    setSpraying(true);
    setTimeout(() => setSpraying(false), 1600);
  };

  if (!webGL) {
    return (
      <div
        className="flex aspect-[4/5] items-center justify-center rounded-2xl bg-surface-2"
        style={{ boxShadow: `0 0 60px ${liquidColor}33` }}
      >
        <span className="font-display text-5xl font-bold tracking-widest text-white/20">
          {name.slice(0, 1)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-2"
        style={{ boxShadow: `0 0 48px ${liquidColor}22` }}
      >
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
          camera={{ position: [0, 0.4, 3.6], fov: 44 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene capStyle={capStyle} liquidColor={liquidColor} spraying={spraying} />
        </Canvas>
      </div>

      <button
        onClick={handleSpray}
        disabled={spraying}
        aria-label="Spray"
        className="absolute bottom-4 right-4 rounded-full border border-accent/50 bg-black/60 px-3 py-1.5 text-xs font-semibold text-accent backdrop-blur-sm transition-all hover:bg-accent hover:text-white disabled:opacity-50"
      >
        {spraying ? "✦" : "Spray"}
      </button>
    </div>
  );
}
