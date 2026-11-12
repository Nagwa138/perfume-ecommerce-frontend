import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { ClothingItem } from "./useOutfitStore";

// Scroll beats: avatar turns to face camera at these progress fractions
const BEATS = [0.2, 0.4, 0.6, 0.8];

// Total scroll travel: container is 400vh, viewport is 100vh → 300vh of scroll
function getProgress() {
  if (typeof window === "undefined") return 0;
  return THREE.MathUtils.clamp(
    window.scrollY / (window.innerHeight * 3),
    0, 1
  );
}

// Reusable temp objects — avoids per-frame allocations
const _camTarget = new THREE.Vector3();
const _camPos = new THREE.Vector3();

export type Outfit = {
  top:       ClothingItem;
  bottom:    ClothingItem;
  outerwear: ClothingItem | null;
  shoes:     ClothingItem;
  accessory: ClothingItem | null;
};

export default function AvatarMesh({
  outfit,
  reducedMotion = false,
}: {
  outfit: Outfit;
  reducedMotion?: boolean;
}) {
  // ── Root group drives world position + Y rotation ─────────────────────
  const rootRef      = useRef<THREE.Group>(null!);
  // ── Sub-groups animated each frame ───────────────────────────────────
  const bodyRef      = useRef<THREE.Group>(null!);  // vertical bob
  const torsoRef     = useRef<THREE.Group>(null!);  // Y twist
  const leftShldRef  = useRef<THREE.Group>(null!);
  const rightShldRef = useRef<THREE.Group>(null!);
  const leftHipRef   = useRef<THREE.Group>(null!);
  const rightHipRef  = useRef<THREE.Group>(null!);
  const leftKneeRef  = useRef<THREE.Group>(null!);
  const rightKneeRef = useRef<THREE.Group>(null!);

  // Smooth blend: 0 = walking away, 1 = facing camera
  const facingRef = useRef(0);

  // ── Materials (recreated only when outfit prop changes) ───────────────
  const skinMat   = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c8956c", roughness: 0.9 }), []);
  const shadowMat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#000000", transparent: true, opacity: 0.32, depthWrite: false }), []);

  const topMat    = useMemo(
    () => new THREE.MeshStandardMaterial({ color: outfit.top.color,    roughness: 0.88 }),
    [outfit.top.color]
  );
  const bottomMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: outfit.bottom.color, roughness: 0.92 }),
    [outfit.bottom.color]
  );
  const shoesMat  = useMemo(
    () => new THREE.MeshStandardMaterial({ color: outfit.shoes.color,  roughness: 0.72 }),
    [outfit.shoes.color]
  );
  const outerMat  = useMemo(
    () => outfit.outerwear
      ? new THREE.MeshStandardMaterial({ color: outfit.outerwear.color, roughness: 0.84 })
      : null,
    [outfit.outerwear?.color]
  );
  const accMat    = useMemo(
    () => outfit.accessory
      ? new THREE.MeshStandardMaterial({ color: outfit.accessory.color, roughness: 0.78 })
      : null,
    [outfit.accessory?.color]
  );

  // ── Per-frame animation (no React state mutations) ────────────────────
  useFrame(({ camera }) => {
    if (!rootRef.current) return;
    const p = getProgress();

    // Beat detection: smooth blend toward 1 when near a beat
    const minDist = Math.min(...BEATS.map(b => Math.abs(p - b)));
    const nearBeat = minDist < 0.045;
    facingRef.current = THREE.MathUtils.lerp(facingRef.current, nearBeat ? 1 : 0, 0.055);
    const f = facingRef.current;

    // ── Avatar walks down -Z ─────────────────────────────────────────
    rootRef.current.position.z = THREE.MathUtils.lerp(
      rootRef.current.position.z,
      -p * 46,
      0.075
    );
    // Y rotation: 0 = back to camera, π = facing camera
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      Math.PI * f,
      0.055
    );

    // ── Camera tracks avatar ─────────────────────────────────────────
    const az = rootRef.current.position.z;
    // Gentle side sway so camera isn't perfectly locked
    _camPos.set(Math.sin(p * Math.PI * 1.5) * 0.6, 2.3, az + 7.5);
    _camTarget.set(0, 1.15, az - 1);

    camera.position.lerp(_camPos, 0.04);
    camera.lookAt(_camTarget);

    if (reducedMotion) return;

    // ── Walk cycle (blended out near beats) ───────────────────────────
    const walkBlend = 1 - f;
    if (walkBlend < 0.005) {
      // Pose: arms open slightly when facing camera
      if (leftShldRef.current)  leftShldRef.current.rotation.z  = THREE.MathUtils.lerp(leftShldRef.current.rotation.z,   0.3, 0.07);
      if (rightShldRef.current) rightShldRef.current.rotation.z = THREE.MathUtils.lerp(rightShldRef.current.rotation.z, -0.3, 0.07);
      return;
    }

    const phase = p * 22 * Math.PI * 2;
    const legSwing  = Math.sin(phase) * 0.52 * walkBlend;
    const kneeBendL = Math.max(0, -Math.sin(phase)) * 0.38 * walkBlend;
    const kneeBendR = Math.max(0,  Math.sin(phase)) * 0.38 * walkBlend;
    const armSwing  = -legSwing * 0.65;

    if (leftHipRef.current)   leftHipRef.current.rotation.x  = legSwing;
    if (rightHipRef.current)  rightHipRef.current.rotation.x = -legSwing;
    if (leftKneeRef.current)  leftKneeRef.current.rotation.x  = kneeBendL;
    if (rightKneeRef.current) rightKneeRef.current.rotation.x = kneeBendR;
    if (leftShldRef.current)  { leftShldRef.current.rotation.x  = armSwing;  leftShldRef.current.rotation.z  = THREE.MathUtils.lerp(leftShldRef.current.rotation.z,  0, 0.07); }
    if (rightShldRef.current) { rightShldRef.current.rotation.x = -armSwing; rightShldRef.current.rotation.z = THREE.MathUtils.lerp(rightShldRef.current.rotation.z, 0, 0.07); }

    if (bodyRef.current)  bodyRef.current.position.y  = Math.abs(Math.sin(phase * 2)) * 0.028 * walkBlend;
    if (torsoRef.current) torsoRef.current.rotation.y = Math.sin(phase) * 0.065 * walkBlend;
  });

  // ── Outfit shape flags ────────────────────────────────────────────────
  const isHoodie   = outfit.top.type === "hoodie";
  const isPuffer   = outfit.outerwear?.type === "puffer";
  const isBomber   = outfit.outerwear?.type === "bomber" || outfit.outerwear?.type === "denim_jacket";
  const isCargo    = outfit.bottom.type === "cargo";
  const isShorts   = outfit.bottom.type === "shorts";
  const isCap      = outfit.accessory?.type === "cap";
  const isBeanie   = outfit.accessory?.type === "beanie";
  const isBackpack = outfit.accessory?.type === "backpack";
  const isBoots    = outfit.shoes.type === "boots";

  return (
    <group ref={rootRef}>

      {/* ── Contact shadow blob ───────────────────────────── */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.52, 24]} />
        <primitive object={shadowMat} attach="material" />
      </mesh>

      {/* ── All body in a bob group ───────────────────────── */}
      <group ref={bodyRef}>

        {/* Head */}
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.21, 14, 14]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.22, 8]} />
          <primitive object={skinMat} attach="material" />
        </mesh>

        {/* Hat / accessory on head */}
        {isCap && outfit.accessory && accMat && (
          <group>
            <mesh position={[0, 1.9, 0]}>
              <cylinderGeometry args={[0.22, 0.22, 0.14, 14]} />
              <primitive object={accMat} attach="material" />
            </mesh>
            <mesh position={[0, 1.83, 0.14]} rotation={[0.15, 0, 0]}>
              <boxGeometry args={[0.38, 0.04, 0.22]} />
              <primitive object={accMat} attach="material" />
            </mesh>
          </group>
        )}
        {isBeanie && outfit.accessory && accMat && (
          <mesh position={[0, 1.88, 0]}>
            <sphereGeometry args={[0.24, 12, 12]} />
            <primitive object={accMat} attach="material" />
          </mesh>
        )}

        {/* ── Torso group (Y twist) ──────────────────────── */}
        <group ref={torsoRef}>

          {/* Backpack (behind torso) */}
          {isBackpack && outfit.accessory && accMat && (
            <mesh position={[0, 1.03, -0.27]}>
              <boxGeometry args={[0.38, 0.52, 0.17]} />
              <primitive object={accMat} attach="material" />
            </mesh>
          )}

          {/* Torso base */}
          <mesh position={[0, 1.03, 0]}>
            <boxGeometry args={[0.46, 0.68, 0.28]} />
            <primitive object={skinMat} attach="material" />
          </mesh>

          {/* Top clothing */}
          <mesh position={[0, 1.03, 0]}>
            <boxGeometry args={[0.5, 0.72, 0.32]} />
            <primitive object={topMat} attach="material" />
          </mesh>

          {/* Hood (hoodie) */}
          {isHoodie && (
            <mesh position={[0, 1.5, -0.06]}>
              <sphereGeometry args={[0.26, 10, 10]} />
              <primitive object={topMat} attach="material" />
            </mesh>
          )}

          {/* Outerwear shell */}
          {outfit.outerwear && outerMat && (
            <mesh position={[0, 1.03, 0]}>
              <boxGeometry args={isPuffer ? [0.63, 0.78, 0.42] : [0.56, 0.74, 0.36]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
          )}
          {/* Bomber/denim collar accent */}
          {isBomber && outerMat && (
            <mesh position={[0, 1.44, 0.1]} rotation={[0.3, 0, 0]}>
              <boxGeometry args={[0.5, 0.08, 0.1]} />
              <primitive object={outerMat} attach="material" />
            </mesh>
          )}

          {/* Hips */}
          <mesh position={[0, 0.59, 0]}>
            <boxGeometry args={[0.44, 0.24, 0.27]} />
            <primitive object={skinMat} attach="material" />
          </mesh>

          {/* ── Left arm ─────────────────────────────────── */}
          <group ref={leftShldRef} position={[-0.33, 1.3, 0]}>
            {/* Upper arm */}
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.093, 0.082, 0.3, 8]} />
              <primitive object={topMat} attach="material" />
            </mesh>
            {/* Elbow pivot (no ref — no animation) */}
            <group position={[0, -0.3, 0]}>
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.079, 0.072, 0.28, 8]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.09, 0.09, 0.055]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
            </group>
          </group>

          {/* ── Right arm ────────────────────────────────── */}
          <group ref={rightShldRef} position={[0.33, 1.3, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.093, 0.082, 0.3, 8]} />
              <primitive object={topMat} attach="material" />
            </mesh>
            <group position={[0, -0.3, 0]}>
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.079, 0.072, 0.28, 8]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.09, 0.09, 0.055]} />
                <primitive object={skinMat} attach="material" />
              </mesh>
            </group>
          </group>

          {/* ── Left leg ─────────────────────────────────── */}
          <group ref={leftHipRef} position={[-0.14, 0.58, 0]}>
            {/* Thigh */}
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.42, 8]} />
              <primitive object={bottomMat} attach="material" />
            </mesh>
            {/* Cargo pocket */}
            {isCargo && (
              <mesh position={[-0.15, -0.22, 0]}>
                <boxGeometry args={[0.08, 0.14, 0.11]} />
                <primitive object={bottomMat} attach="material" />
              </mesh>
            )}
            {/* Knee pivot */}
            <group ref={leftKneeRef} position={[0, -0.43, 0]}>
              {!isShorts && (
                <mesh position={[0, -0.18, 0]}>
                  <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
                  <primitive object={bottomMat} attach="material" />
                </mesh>
              )}
              {/* Shoe */}
              <mesh position={[0, isShorts ? -0.06 : -0.4, 0.07]}>
                <boxGeometry args={isBoots ? [0.14, 0.28, 0.28] : [0.14, 0.1, 0.3]} />
                <primitive object={shoesMat} attach="material" />
              </mesh>
            </group>
          </group>

          {/* ── Right leg ────────────────────────────────── */}
          <group ref={rightHipRef} position={[0.14, 0.58, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.42, 8]} />
              <primitive object={bottomMat} attach="material" />
            </mesh>
            {isCargo && (
              <mesh position={[0.15, -0.22, 0]}>
                <boxGeometry args={[0.08, 0.14, 0.11]} />
                <primitive object={bottomMat} attach="material" />
              </mesh>
            )}
            <group ref={rightKneeRef} position={[0, -0.43, 0]}>
              {!isShorts && (
                <mesh position={[0, -0.18, 0]}>
                  <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
                  <primitive object={bottomMat} attach="material" />
                </mesh>
              )}
              <mesh position={[0, isShorts ? -0.06 : -0.4, 0.07]}>
                <boxGeometry args={isBoots ? [0.14, 0.28, 0.28] : [0.14, 0.1, 0.3]} />
                <primitive object={shoesMat} attach="material" />
              </mesh>
            </group>
          </group>

        </group>{/* /torso group */}
      </group>{/* /body group */}
    </group>
  );
}
