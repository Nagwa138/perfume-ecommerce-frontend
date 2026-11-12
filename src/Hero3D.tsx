import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// kept for ProductPage.tsx 3D product viewer
export function makeShirtGeometry() {
  const s = new THREE.Shape();
  s.moveTo(-0.45, 1.2);
  s.lineTo(-1.1, 1.0);
  s.lineTo(-2.0, 0.45);
  s.lineTo(-1.7, -0.05);
  s.lineTo(-1.15, 0.2);
  s.lineTo(-1.1, -1.5);
  s.lineTo(1.1, -1.5);
  s.lineTo(1.15, 0.2);
  s.lineTo(1.7, -0.05);
  s.lineTo(2.0, 0.45);
  s.lineTo(1.1, 1.0);
  s.lineTo(0.45, 1.2);
  s.quadraticCurveTo(0, 0.7, -0.45, 1.2);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.3, bevelEnabled: true,
    bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 3, curveSegments: 12,
  });
  g.center();
  return g;
}

const COLORS = ["#c084fc", "#38bdf8", "#fb7185", "#4ade80"].map((c) => new THREE.Color(c));

function Mannequin() {
  const groupRef = useRef<THREE.Group>(null!);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c084fc", roughness: 0.22, metalness: 0.08 }),
    []
  );

  useFrame(() => {
    const p = window.scrollY / window.innerHeight;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, p * Math.PI * 2, 0.08
    );
    const t = Math.min(Math.max(p, 0), 1) * (COLORS.length - 1);
    const i = Math.min(Math.floor(t), COLORS.length - 2);
    mat.color.lerpColors(COLORS[i], COLORS[i + 1], t - i);
  });

  return (
    <Float speed={1.2} floatIntensity={0.3} rotationIntensity={0.05}>
      <group ref={groupRef} scale={0.78}>
        {/* head */}
        <mesh position={[0, 2.05, 0]} material={mat}>
          <sphereGeometry args={[0.24, 24, 24]} />
        </mesh>
        {/* neck */}
        <mesh position={[0, 1.76, 0]} material={mat}>
          <cylinderGeometry args={[0.1, 0.12, 0.3, 16]} />
        </mesh>
        {/* torso */}
        <mesh position={[0, 1.02, 0]} material={mat}>
          <cylinderGeometry args={[0.3, 0.38, 1.12, 24]} />
        </mesh>
        {/* hips */}
        <mesh position={[0, 0.32, 0]} material={mat}>
          <cylinderGeometry args={[0.38, 0.32, 0.46, 24]} />
        </mesh>

        {/* shoulder joints */}
        <mesh position={[-0.44, 1.52, 0]} material={mat}>
          <sphereGeometry args={[0.13, 14, 14]} />
        </mesh>
        <mesh position={[0.44, 1.52, 0]} material={mat}>
          <sphereGeometry args={[0.13, 14, 14]} />
        </mesh>
        {/* upper arms */}
        <mesh position={[-0.57, 1.21, 0]} rotation={[0, 0, 0.2]} material={mat}>
          <cylinderGeometry args={[0.1, 0.09, 0.57, 16]} />
        </mesh>
        <mesh position={[0.57, 1.21, 0]} rotation={[0, 0, -0.2]} material={mat}>
          <cylinderGeometry args={[0.1, 0.09, 0.57, 16]} />
        </mesh>
        {/* elbow joints */}
        <mesh position={[-0.66, 0.92, 0]} material={mat}>
          <sphereGeometry args={[0.09, 12, 12]} />
        </mesh>
        <mesh position={[0.66, 0.92, 0]} material={mat}>
          <sphereGeometry args={[0.09, 12, 12]} />
        </mesh>
        {/* forearms */}
        <mesh position={[-0.69, 0.64, 0]} rotation={[0, 0, 0.08]} material={mat}>
          <cylinderGeometry args={[0.08, 0.09, 0.52, 16]} />
        </mesh>
        <mesh position={[0.69, 0.64, 0]} rotation={[0, 0, -0.08]} material={mat}>
          <cylinderGeometry args={[0.08, 0.09, 0.52, 16]} />
        </mesh>

        {/* thighs */}
        <mesh position={[-0.19, -0.28, 0]} material={mat}>
          <cylinderGeometry args={[0.15, 0.14, 0.74, 20]} />
        </mesh>
        <mesh position={[0.19, -0.28, 0]} material={mat}>
          <cylinderGeometry args={[0.15, 0.14, 0.74, 20]} />
        </mesh>
        {/* knee joints */}
        <mesh position={[-0.19, -0.69, 0]} material={mat}>
          <sphereGeometry args={[0.13, 12, 12]} />
        </mesh>
        <mesh position={[0.19, -0.69, 0]} material={mat}>
          <sphereGeometry args={[0.13, 12, 12]} />
        </mesh>
        {/* shins */}
        <mesh position={[-0.19, -1.09, 0]} material={mat}>
          <cylinderGeometry args={[0.11, 0.13, 0.72, 20]} />
        </mesh>
        <mesh position={[0.19, -1.09, 0]} material={mat}>
          <cylinderGeometry args={[0.11, 0.13, 0.72, 20]} />
        </mesh>
        {/* feet */}
        <mesh position={[-0.19, -1.5, 0.08]} rotation={[0.18, 0, 0]} material={mat}>
          <boxGeometry args={[0.2, 0.12, 0.38]} />
        </mesh>
        <mesh position={[0.19, -1.5, 0.08]} rotation={[0.18, 0, 0]} material={mat}>
          <boxGeometry args={[0.2, 0.12, 0.38]} />
        </mesh>
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="relative h-[200vh]">
      <div className="sticky top-0 h-screen">
        <Canvas
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
          camera={{ position: [0, 0.1, 5.5], fov: 50 }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[4, 6, 5]} intensity={2.2} />
          <pointLight position={[-5, -2, 3]} intensity={35} color="#22d3ee" />
          <pointLight position={[5, 4, -2]} intensity={18} color="#c084fc" />
          <Environment preset="city" />
          <Mannequin />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-24 text-center">
          <h1 className="text-6xl font-black tracking-tight">NOVA WEAR</h1>
          <p className="mt-2 text-white/60">Scroll to spin the model. Fall collection is live.</p>
        </div>
      </div>
    </div>
  );
}
