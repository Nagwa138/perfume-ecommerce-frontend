// src/hero/AvatarMesh.tsx
// Single fixed shopper + shopping bag. Walk cycle + 4-beat turn-to-camera.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BEATS, MAIN_STORE_Z } from "./types";
import { scrollRef } from "./useStreetStore";

// Module-level temp vectors (no per-frame allocations)
const _camPos = new THREE.Vector3();
const _camTarget = new THREE.Vector3();

export default function AvatarMesh({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef      = useRef<THREE.Group>(null);
  const bodyRef      = useRef<THREE.Group>(null);
  const torsoRef     = useRef<THREE.Group>(null);
  const leftShoulder = useRef<THREE.Group>(null);
  const rightShoulder= useRef<THREE.Group>(null);
  const leftHip      = useRef<THREE.Group>(null);
  const rightHip     = useRef<THREE.Group>(null);
  const leftKnee     = useRef<THREE.Group>(null);
  const rightKnee    = useRef<THREE.Group>(null);

  // Smooth blend 0 = walking away, 1 = facing camera
  const facingRef = useRef(0);

  useFrame(({ camera }) => {
    if (!rootRef.current) return;
    const p = scrollRef.current;

    // Nearest beat distance
    const minDist = BEATS.reduce(
      (m, b) => Math.min(m, Math.abs(p - b.at)),
      Infinity,
    );
    const nearBeat = minDist < 0.045;
    const nearEnd  = p > 0.92;
    const wantFace = nearBeat || nearEnd;

    facingRef.current = THREE.MathUtils.lerp(
      facingRef.current,
      wantFace ? 1 : 0,
      0.055,
    );
    const facing = facingRef.current;

    // ── Avatar walks down −Z ────────────────────────────────────────
    const targetZ = -p * (Math.abs(MAIN_STORE_Z) - 6); // stop just short of doors
    rootRef.current.position.z = THREE.MathUtils.lerp(
      rootRef.current.position.z,
      targetZ,
      0.075,
    );

    // Y rotation: 0 = back to camera, π = facing camera
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      Math.PI * facing,
      0.055,
    );

    // ── Camera follows behind the avatar ────────────────────────────
    const az = rootRef.current.position.z;
    _camPos.set(Math.sin(p * Math.PI * 1.5) * 0.6, 2.3, az + 7.5);
    _camTarget.set(0, 1.15, az - 1);
    camera.position.lerp(_camPos, 0.04);
    camera.lookAt(_camTarget);

    if (reducedMotion) {
      // Static pose: stand neutral facing the doors
      if (leftShoulder.current)  leftShoulder.current.rotation.set(0, 0,  0.1);
      if (rightShoulder.current) rightShoulder.current.rotation.set(0, 0, -0.1);
      if (leftHip.current)  leftHip.current.rotation.set(0, 0, 0);
      if (rightHip.current) rightHip.current.rotation.set(0, 0, 0);
      if (leftKnee.current)  leftKnee.current.rotation.set(0, 0, 0);
      if (rightKnee.current) rightKnee.current.rotation.set(0, 0, 0);
      if (bodyRef.current) bodyRef.current.position.y = 0;
      if (torsoRef.current) torsoRef.current.rotation.y = 0;
      return;
    }

    // ── Walk cycle (fades out as facing → 1) ────────────────────────
    const walkBlend = 1 - facing;
    if (walkBlend < 0.02) {
      // Idle pose when facing camera
      if (leftShoulder.current)  leftShoulder.current.rotation.set(0, 0,  0.25);
      if (rightShoulder.current) rightShoulder.current.rotation.set(0, 0, -0.25);
      return;
    }

    const phase = p * 22 * Math.PI * 2;
    const legSwing  = Math.sin(phase) * 0.52 * walkBlend;
    const kneeBendL = Math.max(0, -Math.sin(phase)) * 0.38 * walkBlend;
    const kneeBendR = Math.max(0,  Math.sin(phase)) * 0.38 * walkBlend;
    const armSwing  = -legSwing * 0.65;

    if (leftHip.current)   leftHip.current.rotation.x  = legSwing;
    if (rightHip.current)  rightHip.current.rotation.x = -legSwing;
    if (leftKnee.current)  leftKnee.current.rotation.x  = kneeBendL;
    if (rightKnee.current) rightKnee.current.rotation.x = kneeBendR;
    if (leftShoulder.current)  {
      leftShoulder.current.rotation.x = armSwing;
      leftShoulder.current.rotation.z = THREE.MathUtils.lerp(leftShoulder.current.rotation.z, 0, 0.07);
    }
    if (rightShoulder.current) {
      rightShoulder.current.rotation.x = -armSwing;
      rightShoulder.current.rotation.z = THREE.MathUtils.lerp(rightShoulder.current.rotation.z, 0, 0.07);
    }

    if (bodyRef.current)  bodyRef.current.position.y  = Math.abs(Math.sin(phase * 2)) * 0.028 * walkBlend;
    if (torsoRef.current) torsoRef.current.rotation.y = Math.sin(phase) * 0.065 * walkBlend;
  });

  // ── Fixed skin + clothing materials ─────────────────────────────────
  return (
    <group ref={rootRef}>
      {/* Contact shadow */}
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.5, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.32} depthWrite={false} />
      </mesh>

      <group ref={bodyRef}>
        {/* Head */}
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.21, 14, 14]} />
          <meshStandardMaterial color="#c8956c" roughness={0.9} />
        </mesh>
        {/* Hair cap */}
        <mesh position={[0, 1.78, -0.02]}>
          <sphereGeometry args={[0.215, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.95} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.22, 8]} />
          <meshStandardMaterial color="#c8956c" roughness={0.9} />
        </mesh>

        <group ref={torsoRef}>
          {/* Torso body */}
          <mesh position={[0, 1.03, 0]}>
            <boxGeometry args={[0.46, 0.68, 0.28]} />
            <meshStandardMaterial color="#D9B979" roughness={0.7} metalness={0.1} />
          </mesh>
          {/* Coat / blazer accent */}
          <mesh position={[0, 1.08, 0.02]}>
            <boxGeometry args={[0.5, 0.7, 0.3]} />
            <meshStandardMaterial color="#0B2B26" roughness={0.8} />
          </mesh>
          {/* Hips */}
          <mesh position={[0, 0.59, 0]}>
            <boxGeometry args={[0.44, 0.24, 0.27]} />
            <meshStandardMaterial color="#0B2B26" roughness={0.85} />
          </mesh>

          {/* ── Left arm ─────────────────────────────────────── */}
          <group ref={leftShoulder} position={[-0.33, 1.3, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.09, 0.08, 0.3, 8]} />
              <meshStandardMaterial color="#0B2B26" roughness={0.8} />
            </mesh>
            <group position={[0, -0.3, 0]}>
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.075, 0.07, 0.28, 8]} />
                <meshStandardMaterial color="#c8956c" roughness={0.9} />
              </mesh>
              <mesh position={[0, -0.3, 0]}>
                <boxGeometry args={[0.09, 0.09, 0.055]} />
                <meshStandardMaterial color="#c8956c" roughness={0.9} />
              </mesh>
            </group>
          </group>

          {/* ── Right arm — holds the shopping bag ───────────── */}
          <group ref={rightShoulder} position={[0.33, 1.3, 0]}>
            <mesh position={[0, -0.15, 0]}>
              <cylinderGeometry args={[0.09, 0.08, 0.3, 8]} />
              <meshStandardMaterial color="#0B2B26" roughness={0.8} />
            </mesh>
            <group position={[0, -0.3, 0]}>
              <mesh position={[0, -0.14, 0]}>
                <cylinderGeometry args={[0.075, 0.07, 0.28, 8]} />
                <meshStandardMaterial color="#c8956c" roughness={0.9} />
              </mesh>
              {/* Shopping bag — hangs from right hand */}
              <group position={[0, -0.36, 0]}>
                {/* Handle */}
                <mesh position={[0, 0.06, 0]}>
                  <torusGeometry args={[0.06, 0.008, 6, 12, Math.PI]} />
                  <meshStandardMaterial color="#111111" roughness={0.7} />
                </mesh>
                {/* Bag body */}
                <mesh position={[0, -0.12, 0]}>
                  <boxGeometry args={[0.22, 0.24, 0.1]} />
                  <meshStandardMaterial color="#D9B979" roughness={0.6} metalness={0.05} />
                </mesh>
                {/* Logo stripe */}
                <mesh position={[0, -0.1, 0.051]}>
                  <planeGeometry args={[0.16, 0.05]} />
                  <meshBasicMaterial color="#0B2B26" />
                </mesh>
              </group>
            </group>
          </group>

          {/* ── Left leg ─────────────────────────────────────── */}
          <group ref={leftHip} position={[-0.14, 0.58, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.42, 8]} />
              <meshStandardMaterial color="#0B2B26" roughness={0.85} />
            </mesh>
            <group ref={leftKnee} position={[0, -0.43, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
                <meshStandardMaterial color="#0B2B26" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.4, 0.07]}>
                <boxGeometry args={[0.14, 0.1, 0.3]} />
                <meshStandardMaterial color="#111111" roughness={0.6} />
              </mesh>
            </group>
          </group>

          {/* ── Right leg ────────────────────────────────────── */}
          <group ref={rightHip} position={[0.14, 0.58, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.13, 0.11, 0.42, 8]} />
              <meshStandardMaterial color="#0B2B26" roughness={0.85} />
            </mesh>
            <group ref={rightKnee} position={[0, -0.43, 0]}>
              <mesh position={[0, -0.18, 0]}>
                <cylinderGeometry args={[0.1, 0.09, 0.36, 8]} />
                <meshStandardMaterial color="#0B2B26" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.4, 0.07]}>
                <boxGeometry args={[0.14, 0.1, 0.3]} />
                <meshStandardMaterial color="#111111" roughness={0.6} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}