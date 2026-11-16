import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import StreetScene from "./StreetScene";
import AvatarMesh from "./AvatarMesh";
import { scrollRef } from "./useStreetStore";

export default function HeroScene({ reducedMotion }: { reducedMotion: boolean }) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const doorL1 = useRef<THREE.PointLight>(null);
  const doorL2 = useRef<THREE.PointLight>(null);

  useFrame(() => {
    const p = scrollRef.current;
    // Boost ambient so the buildings aren't pitch black
    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(1.5, 0.8, p); 
    }
    // Brighter sun
    if (sunRef.current) {
      sunRef.current.intensity = THREE.MathUtils.lerp(3.0, 0.6, p);
      sunRef.current.color.lerpColors(
        new THREE.Color("#FFD2A0"), // Bright warm gold
        new THREE.Color("#4A6FA5"), // Moonlight blue
        p
      );
    }
    const doorGlow = THREE.MathUtils.smoothstep(p, 0.85, 1);
    if (doorL1.current) doorL1.current.intensity = doorGlow * 8;
    if (doorL2.current) doorL2.current.intensity = doorGlow * 8;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={1.5} />
      <directionalLight
        ref={sunRef}
        position={[15, 20, 10]}
        intensity={3.0}
        color="#FFD2A0"
      />
      <pointLight ref={doorL1} position={[-1.2, 2.0, -59.4]} color="#FFE7B8" intensity={0} distance={20} decay={2} />
      <pointLight ref={doorL2} position={[1.2, 2.0, -59.4]} color="#FFE7B8" intensity={0} distance={20} decay={2} />
      <StreetScene reducedMotion={reducedMotion} />
      <AvatarMesh reducedMotion={reducedMotion} />
    </>
  );
}