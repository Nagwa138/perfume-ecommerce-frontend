// src/hero/HeroScene.tsx
// Lights + composition. Four real lights MAX, by policy.
// All other glow (lamps, windows, signs) is emissive meshes in StreetScene.tsx.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import StreetScene from "./StreetScene";
import AvatarMesh from "./AvatarMesh";
import { scrollRef } from "./useStreetStore";

export default function HeroScene({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const doorL1 = useRef<THREE.PointLight>(null);
  const doorL2 = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = scrollRef.current;
    // Ambient dims as night falls
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(0.55, 0.18, p);
    }
    // Sun fades and cools from dusk-warm to night-blue
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(1.6, 0.25, p);
      sunRef.current.color.lerpColors(
        new THREE.Color("#ffd9a0"),
        new THREE.Color("#3a4a70"),
        p,
      );
    }
    // Door spill lights only come alive in the final 15% of the scroll
    const doorGlow = THREE.MathUtils.smoothstep(p, 0.85, 1);
    if (doorL1.current) doorL1.current.intensity = doorGlow * 6;
    if (doorL2.current) doorL2.current.intensity = doorGlow * 6;
  });

  return (
    <>
      {/* 1 — ambient */}
      <ambientLight ref={ambientRef} intensity={0.55} />

      {/* 2 — sun / moon directional */}
      <directionalLight
        ref={sunRef}
        position={[8, 12, 4]}
        intensity={1.6}
        color="#ffd9a0"
      />

      {/* 3 + 4 — door spill point lights (HOSSAM main storefront) */}
      <pointLight
        ref={doorL1}
        position={[-1.2, 2.0, -59.4]}
        color="#ffe7b8"
        intensity={0}
        distance={14}
        decay={2}
      />
      <pointLight
        ref={doorL2}
        position={[1.2, 2.0, -59.4]}
        color="#ffe7b8"
        intensity={0}
        distance={14}
        decay={2}
      />

      <StreetScene reducedMotion={reducedMotion} />
      <AvatarMesh reducedMotion={reducedMotion} />
    </>
  );
}