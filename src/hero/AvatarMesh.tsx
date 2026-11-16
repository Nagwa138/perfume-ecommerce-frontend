// src/hero/AvatarMesh.tsx
// Single shopper with a gold bag. Walk cycle + 4-beat turn-to-camera.
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BEATS, MAIN_STORE_Z } from "./types";
import { scrollRef } from "./useStreetStore";

const _camPos    = new THREE.Vector3();
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
  const facingRef    = useRef(0);

  useFrame(({ camera }) => {
    if (!rootRef.current) return;
    const p = scrollRef.current;

    const minDist  = BEATS.reduce((m, b) => Math.min(m, Math.abs(p - b.at)), Infinity);
    const nearBeat = minDist < 0.045;
    const nearEnd  = p > 0.92;
    const wantFace = nearBeat || nearEnd;

    facingRef.current = THREE.MathUtils.lerp(facingRef.current, wantFace ? 1 : 0, 0.06);
    const facing = facingRef.current;

    const targetZ = -p * (Math.abs(MAIN_STORE_Z) - 10);
    rootRef.current.position.z = THREE.MathUtils.lerp(rootRef.current.position.z, targetZ, 0.08);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, Math.PI * facing, 0.06);

    // ── Camera: pulled back, raised, targets slightly ahead of the avatar ──
    const az = rootRef.current.position.z;
    _camPos.set(Math.sin(p * Math.PI * 1.5) * 0.5, 4.0, az + 11.0);
    _camTarget.set(0, 1.4, az - 3.0);
    camera.position.lerp(_camPos, 0.06);
    camera.lookAt(_camTarget);

    if (reducedMotion) return;

    const walkBlend = 1 - facing;
    if (walkBlend < 0.02) return;

    const phase    = p * 24 * Math.PI * 2;
    const legSwing = Math.sin(phase) * 0.55 * walkBlend;
    const armSwing = -legSwing * 0.6;

    if (leftHip.current)   leftHip.current.rotation.x  = legSwing;
    if (rightHip.current)  rightHip.current.rotation.x = -legSwing;
    if (leftKnee.current)  leftKnee.current.rotation.x  = Math.max(0, -Math.sin(phase)) * 0.4 * walkBlend;
    if (rightKnee.current) rightKnee.current.rotation.x = Math.max(0,  Math.sin(phase)) * 0.4 * walkBlend;

    if (leftShoulder.current) {
      leftShoulder.current.rotation.x = armSwing;
      leftShoulder.current.rotation.z = THREE.MathUtils.lerp(leftShoulder.current.rotation.z, 0, 0.1);
    }
    if (rightShoulder.current) {
      rightShoulder.current.rotation.x = -armSwing;
      rightShoulder.current.rotation.z = THREE.MathUtils.lerp(rightShoulder.current.rotation.z, 0, 0.1);
    }

    if (bodyRef.current)  bodyRef.current.position.y = Math.abs(Math.sin(phase * 2)) * 0.03 * walkBlend;
    if (torsoRef.current) torsoRef.current.rotation.y = Math.sin(phase) * 0.08 * walkBlend;
  });

  return (
    <group ref={rootRef}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
        <circleGeometry args={[0.6, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      <group ref={bodyRef}>
        {/* Head */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshStandardMaterial color="#F2CBA0" roughness={0.85} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 1.85, -0.02]}>
          <sphereGeometry args={[0.23, 16, 12, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.9} />
        </mesh>
        {/* Neck */}
        <mesh position={[0, 1.55, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.2, 8]} />
          <meshStandardMaterial color="#F2CBA0" roughness={0.85} />
        </mesh>

        <group ref={torsoRef}>
          {/* Cream coat body */}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.5, 0.75, 0.3]} />
            <meshStandardMaterial color="#F0E4CC" roughness={0.7} />
          </mesh>
          {/* Gold collar accent */}
          <mesh position={[0, 1.42, 0.05]}>
            <boxGeometry args={[0.35, 0.06, 0.2]} />
            <meshStandardMaterial color="#D9B979" roughness={0.4} metalness={0.3} />
          </mesh>
          {/* Hips / trousers top */}
          <mesh position={[0, 0.6, 0]}>
            <boxGeometry args={[0.46, 0.25, 0.28]} />
            <meshStandardMaterial color="#1a1a1f" roughness={0.85} />
          </mesh>

          {/* Left arm */}
          <group ref={leftShoulder} position={[-0.35, 1.35, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.09, 0.08, 0.4, 8]} />
              <meshStandardMaterial color="#F0E4CC" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#F2CBA0" roughness={0.85} />
            </mesh>
          </group>

          {/* Right arm + bag */}
          <group ref={rightShoulder} position={[0.35, 1.35, 0]}>
            <mesh position={[0, -0.2, 0]}>
              <cylinderGeometry args={[0.09, 0.08, 0.4, 8]} />
              <meshStandardMaterial color="#F0E4CC" roughness={0.7} />
            </mesh>
            <mesh position={[0, -0.45, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#F2CBA0" roughness={0.85} />
            </mesh>
            {/* Gold bag */}
            <group position={[0, -0.55, 0]}>
              <mesh position={[0, 0.1, 0]}>
                <torusGeometry args={[0.08, 0.01, 8, 16, Math.PI]} />
                <meshStandardMaterial color="#0B2B26" />
              </mesh>
              <mesh position={[0, -0.1, 0]}>
                <boxGeometry args={[0.25, 0.3, 0.15]} />
                <meshStandardMaterial color="#D9B979" roughness={0.4} metalness={0.2} />
              </mesh>
            </group>
          </group>

          {/* Left leg */}
          <group ref={leftHip} position={[-0.14, 0.6, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.14, 0.12, 0.45, 8]} />
              <meshStandardMaterial color="#1a1a1f" roughness={0.85} />
            </mesh>
            <group ref={leftKnee} position={[0, -0.45, 0]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.11, 0.1, 0.4, 8]} />
                <meshStandardMaterial color="#1a1a1f" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.42, 0.08]}>
                <boxGeometry args={[0.15, 0.12, 0.32]} />
                <meshStandardMaterial color="#111" roughness={0.4} />
              </mesh>
            </group>
          </group>

          {/* Right leg */}
          <group ref={rightHip} position={[0.14, 0.6, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.14, 0.12, 0.45, 8]} />
              <meshStandardMaterial color="#1a1a1f" roughness={0.85} />
            </mesh>
            <group ref={rightKnee} position={[0, -0.45, 0]}>
              <mesh position={[0, -0.2, 0]}>
                <cylinderGeometry args={[0.11, 0.1, 0.4, 8]} />
                <meshStandardMaterial color="#1a1a1f" roughness={0.85} />
              </mesh>
              <mesh position={[0, -0.42, 0.08]}>
                <boxGeometry args={[0.15, 0.12, 0.32]} />
                <meshStandardMaterial color="#111" roughness={0.4} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}