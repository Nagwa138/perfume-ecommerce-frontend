import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import StreetSceneRoot from "./StreetScene";
import AvatarMesh from "./AvatarMesh";
import type { Outfit } from "./AvatarMesh";

type Props = {
  outfit: Outfit;
  reducedMotion: boolean;
};

// Animate ambient + directional light intensity with scroll
function SceneLights() {
  const { scene } = useThree();

  useFrame(() => {
    const p = typeof window !== "undefined"
      ? THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * 3), 0, 1)
      : 0;

    scene.traverse((obj) => {
      if (obj instanceof THREE.AmbientLight) {
        obj.intensity = THREE.MathUtils.lerp(0.7, 0.12, p);
      }
      if (obj instanceof THREE.DirectionalLight) {
        obj.intensity = THREE.MathUtils.lerp(2.0, 0.25, p);
        // Shift sun color from warm orange to cool blue
        obj.color.lerpColors(
          new THREE.Color("#ffd580"),
          new THREE.Color("#334466"),
          p
        );
      }
    });
  });

  return (
    <>
      {/* Ambient */}
      <ambientLight intensity={0.7} />

      {/* Sun / directional (positioned for dusk look) */}
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.0}
        color="#ffd580"
      />

      {/* Subtle fill from opposite side */}
      <directionalLight
        position={[-4, 3, -6]}
        intensity={0.3}
        color="#334488"
      />
    </>
  );
}

export default function HeroScene({ outfit, reducedMotion }: Props) {
  return (
    <>
      <SceneLights />
      <StreetSceneRoot />
      <AvatarMesh outfit={outfit} reducedMotion={reducedMotion} />
    </>
  );
}
