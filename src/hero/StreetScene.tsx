// src/hero/StreetScene.tsx
// Luxe HOSSAM sunset → deep night. 4 storefronts, opening doors. Emissive glow only.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BEATS, MAIN_STORE_Z, MAIN_DOORS_OPEN_AT } from "./types";
import { scrollRef, readThemeAccent } from "./useStreetStore";

// ── Sunset → night palette (warm gold → deep emerald) ─────────────────────
const DUSK_SKY  = new THREE.Color("#E8A76A");  // warm amber sunset
const NIGHT_SKY = new THREE.Color("#0B2B26");  // deep emerald night
const DUSK_FOG  = new THREE.Color("#C08858");  // warm haze
const NIGHT_FOG = new THREE.Color("#06201B");  // emerald deep

const tmpColor = new THREE.Color();
const dummy    = new THREE.Object3D();

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 768;
const BCOUNT   = IS_SMALL ? 5 : 8;
const BSPACING = 12;
const WIN_COLS = 3;
const WIN_ROWS = 5;
const WINS_PER_BLDG = WIN_COLS * WIN_ROWS;
const TOTAL_WINS = BCOUNT * 2 * WINS_PER_BLDG;

function bldH(i: number) { return 7 + ((i * 7 + i * i * 3) % 5) * 1.8; }

// ── Canvas sign ───────────────────────────────────────────────────────────
function makeSignTexture(text: string, color: string): THREE.CanvasTexture {
  const w = 512, h = 128;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.fillStyle = color;
  ctx.font = "bold 54px 'Cormorant Garamond', Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const PROP_PER_SHOP = 5;
const PROP_TOTAL    = BEATS.length * PROP_PER_SHOP;

function StreetScene({ reducedMotion }: { reducedMotion: boolean }) {
  const { scene, gl } = useThree();

  const winRef      = useRef<THREE.InstancedMesh>(null);
  const lampHeadRef = useRef<THREE.InstancedMesh>(null);
  const carRef      = useRef<THREE.InstancedMesh>(null);
  const benchRef    = useRef<THREE.InstancedMesh>(null);
  const planterRef  = useRef<THREE.InstancedMesh>(null);
  const bottleRef   = useRef<THREE.InstancedMesh>(null);
  const lipstickRef = useRef<THREE.InstancedMesh>(null);
  const jarRef      = useRef<THREE.InstancedMesh>(null);
  const dropperRef  = useRef<THREE.InstancedMesh>(null);
  const leftDoor    = useRef<THREE.Mesh>(null);
  const rightDoor   = useRef<THREE.Mesh>(null);
  const fogRef      = useRef<THREE.FogExp2 | null>(null);

  // Materials
  const winMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFD58A", emissive: "#FFC46A", emissiveIntensity: 0.5, roughness: 0.5,
  }), []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFF2C8", emissive: "#FFE39A", emissiveIntensity: 1.2,
  }), []);
  const bottleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#D9B979", emissive: "#D9B979", emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.25,
  }), []);
  const lipstickMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#D88A94", emissive: "#D88A94", emissiveIntensity: 0.7, roughness: 0.4,
  }), []);
  const jarMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#A8C8B8", emissive: "#A8C8B8", emissiveIntensity: 0.6, roughness: 0.4,
  }), []);
  const dropperMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#7EC8A0", emissive: "#7EC8A0", emissiveIntensity: 0.6, roughness: 0.4,
  }), []);

  const signTextures = useMemo(() => BEATS.map((b) => makeSignTexture(b.sign, b.color)), []);
  const mainSignTexture = useMemo(() => makeSignTexture("HOSSAM", readThemeAccent()), []);

  useEffect(() => {
    scene.background = DUSK_SKY.clone();
    const fog = new THREE.FogExp2(DUSK_FOG.getHex(), 0.014);
    scene.fog = fog;
    fogRef.current = fog;
    return () => { scene.fog = null; scene.background = null; };
  }, [scene]);

  useEffect(() => {
    if (winRef.current) {
      let idx = 0;
      for (let side = 0; side < 2; side++) {
        const sx = side === 0 ? -12 : 12;
        const signX = side === 0 ? -1 : 1;
        for (let b = 0; b < BCOUNT; b++) {
          const bz = -(b * BSPACING + 5);
          const bh = bldH(b);
          for (let row = 0; row < WIN_ROWS; row++) {
            for (let col = 0; col < WIN_COLS; col++) {
              dummy.position.set(
                sx + signX * (-3 + 1.5 + col * (6 / (WIN_COLS - 0.5))),
                2.5 + row * (bh - 3) / WIN_ROWS,
                bz,
              );
              dummy.rotation.set(0, 0, 0);
              dummy.scale.setScalar(1);
              dummy.updateMatrix();
              winRef.current.setMatrixAt(idx++, dummy.matrix);
            }
          }
        }
      }
      winRef.current.count = idx;
      winRef.current.instanceMatrix.needsUpdate = true;
    }

    if (lampHeadRef.current) {
      let i = 0;
      for (let k = 0; k < 5; k++) {
        for (const side of [-1, 1] as const) {
          dummy.position.set(side * 7, 5.0, -(k * 18 + 6));
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(0.8, 0.1, 0.4);
          dummy.updateMatrix();
          lampHeadRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      lampHeadRef.current.instanceMatrix.needsUpdate = true;
    }

    if (carRef.current) {
      const pos: Array<[number, number, number]> = [
        [-9.5, 0.55, -12], [ 9.5, 0.55, -26],
        [-9.5, 0.55, -40], [ 9.5, 0.55, -52],
      ];
      pos.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, i < 2 ? 0 : Math.PI, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        carRef.current!.setMatrixAt(i, dummy.matrix);
      });
      carRef.current.instanceMatrix.needsUpdate = true;
    }

    if (benchRef.current) {
      const pos: Array<[number, number, number]> = [
        [-5.5, 0, -16], [-5.5, 0, -40],
        [ 5.5, 0, -28], [ 5.5, 0, -52],
      ];
      pos.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        benchRef.current!.setMatrixAt(i, dummy.matrix);
      });
      benchRef.current.instanceMatrix.needsUpdate = true;
    }

    if (planterRef.current) {
      const pos: Array<[number, number, number]> = [
        [-5.2, 0, -20], [-5.2, 0, -44],
        [ 5.2, 0, -32], [ 5.2, 0, -56],
      ];
      pos.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        planterRef.current!.setMatrixAt(i, dummy.matrix);
      });
      planterRef.current.instanceMatrix.needsUpdate = true;
    }

    const shops = BEATS.map((b) => b.z);
    const setupProps = (
      mesh: THREE.InstancedMesh | null,
      baseY: number,
      baseScale: [number, number, number],
    ) => {
      if (!mesh) return;
      let i = 0;
      shops.forEach((shopZ, shopIdx) => {
        const side = shopIdx % 2 === 0 ? -1 : 1;
        const xBase = side * 7.6;
        for (let k = 0; k < PROP_PER_SHOP; k++) {
          dummy.position.set(
            xBase + side * -0.4 + (k % 3) * 0.3,
            baseY,
            shopZ - 1.8 + Math.floor(k / 3) * 0.4,
          );
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(baseScale[0], baseScale[1], baseScale[2]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    setupProps(bottleRef.current,   1.5, [0.2, 0.5, 0.2]);
    setupProps(lipstickRef.current, 1.6, [0.1, 0.4, 0.1]);
    setupProps(jarRef.current,      1.5, [0.22, 0.25, 0.22]);
    setupProps(dropperRef.current,  1.6, [0.15, 0.45, 0.15]);
  }, []);

  useEffect(() => {
    return () => { signTextures.forEach((t) => t.dispose()); mainSignTexture.dispose(); };
  }, [signTextures, mainSignTexture]);

  useFrame(() => {
    const p = scrollRef.current;

    tmpColor.lerpColors(DUSK_SKY, NIGHT_SKY, p);
    if (scene.background instanceof THREE.Color) scene.background.copy(tmpColor);
    gl.setClearColor(tmpColor, 1);

    if (fogRef.current) {
      tmpColor.lerpColors(DUSK_FOG, NIGHT_FOG, p);
      fogRef.current.color.copy(tmpColor);
      fogRef.current.density = 0.012 + p * 0.01;
    }

    winMat.emissiveIntensity  = THREE.MathUtils.lerp(0.35, 1.8, p);
    lampMat.emissiveIntensity = THREE.MathUtils.lerp(0.6, 2.5, p);

    const doorOpen = THREE.MathUtils.smoothstep(p, MAIN_DOORS_OPEN_AT, 1);
    if (leftDoor.current)  leftDoor.current.rotation.y  = -doorOpen * Math.PI * 0.55;
    if (rightDoor.current) rightDoor.current.rotation.y =  doorOpen * Math.PI * 0.55;

    if (reducedMotion) return;
  });

  const buildings = useMemo(() => {
    const out: { x: number; z: number; h: number }[] = [];
    for (let side = 0; side < 2; side++) {
      const sx = side === 0 ? -12 : 12;
      for (let b = 0; b < BCOUNT; b++) {
        out.push({ x: sx, z: -(b * BSPACING + 5), h: bldH(b) });
      }
    }
    return out;
  }, []);

  return (
    <>
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -40]}>
        <planeGeometry args={[12, 100]} />
        <meshStandardMaterial color="#22222a" roughness={0.9} />
      </mesh>

      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[0, 0.012, -(i * 8 + 2)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 4]} />
          <meshBasicMaterial color="#c0b08a" />
        </mesh>
      ))}

      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[(-2.5 + i * 1.0), 0.013, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 2.5]} />
          <meshBasicMaterial color="#c0b08a" />
        </mesh>
      ))}

      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 7.5, 0.08, -40]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3, 100]} />
          <meshStandardMaterial color="#2c2a2a" roughness={0.9} />
        </mesh>
      ))}
      {([-1, 1] as const).map((s) => (
        <mesh key={`c${s}`} position={[s * 6, 0.1, -40]}>
          <boxGeometry args={[0.2, 0.2, 100]} />
          <meshStandardMaterial color="#4a4034" roughness={0.8} />
        </mesh>
      ))}

      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[6, b.h, 6]} />
          <meshStandardMaterial color="#1f1d22" roughness={0.9} />
        </mesh>
      ))}

      <instancedMesh ref={winRef} args={[undefined, undefined, TOTAL_WINS]}>
        <boxGeometry args={[0.8, 1.0, 0.1]} />
        <primitive object={winMat} attach="material" />
      </instancedMesh>

      {BEATS.map((beat, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * 7.2;
        return (
          <group key={beat.id} position={[x, 0, beat.z]}>
            <mesh position={[-side * 0.3, 1.8, 0]}>
              <boxGeometry args={[0.2, 3.0, 4.0]} />
              <meshStandardMaterial color="#0a0a0a" emissive={beat.color} emissiveIntensity={0.3} roughness={0.2} />
            </mesh>
            <mesh position={[-side * 0.5, 4.0, 0]} rotation={[0, side * Math.PI / 2, 0]}>
              <planeGeometry args={[3.0, 0.8]} />
              <meshBasicMaterial map={signTextures[i]} toneMapped={false} transparent />
            </mesh>
            <mesh position={[-side * 0.55, 4.0, 0]} rotation={[0, side * Math.PI / 2, 0]}>
              <planeGeometry args={[3.5, 1.2]} />
              <meshBasicMaterial color={beat.color} transparent opacity={0.15} />
            </mesh>
            {beat.id === "pharmacy" && (
              <group position={[-side * 0.6, 5.0, 0]}>
                <mesh><boxGeometry args={[0.1, 0.6, 0.2]} /><meshStandardMaterial color="#7EC8A0" emissive="#7EC8A0" emissiveIntensity={3} /></mesh>
                <mesh><boxGeometry args={[0.1, 0.2, 0.6]} /><meshStandardMaterial color="#7EC8A0" emissive="#7EC8A0" emissiveIntensity={3} /></mesh>
              </group>
            )}
          </group>
        );
      })}

      <instancedMesh ref={bottleRef} args={[undefined, undefined, PROP_TOTAL]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 12]} />
        <primitive object={bottleMat} attach="material" />
      </instancedMesh>
      <instancedMesh ref={lipstickRef} args={[undefined, undefined, PROP_TOTAL]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 8]} />
        <primitive object={lipstickMat} attach="material" />
      </instancedMesh>
      <instancedMesh ref={jarRef} args={[undefined, undefined, PROP_TOTAL]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={jarMat} attach="material" />
      </instancedMesh>
      <instancedMesh ref={dropperRef} args={[undefined, undefined, PROP_TOTAL]}>
        <cylinderGeometry args={[0.5, 0.3, 1, 8]} />
        <primitive object={dropperMat} attach="material" />
      </instancedMesh>

      {Array.from({ length: 10 }, (_, i) => {
        const side = i < 5 ? -1 : 1;
        const zi = i % 5;
        return (
          <mesh key={`pole${i}`} position={[side * 7, 2.5, -(zi * 18 + 6)]}>
            <cylinderGeometry args={[0.08, 0.08, 5, 8]} />
            <meshStandardMaterial color="#3a3a44" roughness={0.6} metalness={0.8} />
          </mesh>
        );
      })}
      <instancedMesh ref={lampHeadRef} args={[undefined, undefined, 10]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={lampMat} attach="material" />
      </instancedMesh>

      <instancedMesh ref={carRef} args={[undefined, undefined, 4]}>
        <boxGeometry args={[2.2, 0.8, 1.2]} />
        <meshStandardMaterial color="#131a28" roughness={0.2} metalness={0.8} />
      </instancedMesh>

      <instancedMesh ref={benchRef} args={[undefined, undefined, 4]}>
        <boxGeometry args={[1.5, 0.15, 0.5]} />
        <meshStandardMaterial color="#2f2118" roughness={0.9} />
      </instancedMesh>

      <instancedMesh ref={planterRef} args={[undefined, undefined, 4]}>
        <cylinderGeometry args={[0.4, 0.5, 0.6, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </instancedMesh>

      <group position={[0, 0, MAIN_STORE_Z]}>
        <mesh position={[0, 3, -0.4]}>
          <boxGeometry args={[10, 6, 0.5]} />
          <meshStandardMaterial color="#0c0b10" roughness={0.5} />
        </mesh>
        <mesh position={[0, 4.5, 0.2]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[9, 0.2, 2.0]} />
          <meshStandardMaterial color={readThemeAccent()} emissive={readThemeAccent()} emissiveIntensity={0.25} roughness={0.4} />
        </mesh>
        <mesh position={[0, 5.5, 0.15]}>
          <planeGeometry args={[6.0, 1.5]} />
          <meshBasicMaterial map={mainSignTexture} toneMapped={false} transparent />
        </mesh>
        <mesh ref={leftDoor} position={[-1.2, 2.2, 0.3]}>
          <boxGeometry args={[2.2, 4.4, 0.15]} />
          <meshStandardMaterial color="#111" emissive="#D9B979" emissiveIntensity={0.2} roughness={0.3} />
        </mesh>
        <mesh ref={rightDoor} position={[1.2, 2.2, 0.3]}>
          <boxGeometry args={[2.2, 4.4, 0.15]} />
          <meshStandardMaterial color="#111" emissive="#D9B979" emissiveIntensity={0.2} roughness={0.3} />
        </mesh>
      </group>
    </>
  );
}

export default function StreetSceneRoot({ reducedMotion }: { reducedMotion: boolean }) {
  return <StreetScene reducedMotion={reducedMotion} />;
}