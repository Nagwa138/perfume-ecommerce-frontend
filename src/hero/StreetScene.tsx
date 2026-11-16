// src/hero/StreetScene.tsx
// Procedural HOSSAM STREET. Emissive-only glow. Max 4 real lights live in HeroScene.tsx.
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BEATS, MAIN_STORE_Z, MAIN_DOORS_OPEN_AT } from "./types";
import { scrollRef, readThemeAccent } from "./useStreetStore";

// ── Time-of-day palette ────────────────────────────────────────────────────
const DUSK_SKY  = new THREE.Color("#3a2418");
const NIGHT_SKY = new THREE.Color("#050a1a");
const DUSK_FOG  = new THREE.Color("#5a3020");
const NIGHT_FOG = new THREE.Color("#070d2a");
const tmpColor  = new THREE.Color();
const dummy     = new THREE.Object3D();

const IS_SMALL = typeof window !== "undefined" && window.innerWidth < 768;
const BCOUNT  = IS_SMALL ? 5 : 9;
const BSPACING = 11;
const WIN_COLS = 4;
const WIN_ROWS = 5;
const WINS_PER_BLDG = WIN_COLS * WIN_ROWS;
const TOTAL_WINS = BCOUNT * 2 * WINS_PER_BLDG;

function bldH(i: number) { return 5 + ((i * 7 + i * i * 3) % 7) * 1.5; }

function makeSignTexture(text: string, color: string): THREE.CanvasTexture {
  const w = 512, h = 128;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0a14";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, w - 12, h - 12);
  ctx.fillStyle = color;
  ctx.font = "bold 56px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const PROP_PER_SHOP = 6;
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

  const leftDoor  = useRef<THREE.Mesh>(null);
  const rightDoor = useRef<THREE.Mesh>(null);

  const fogRef = useRef<THREE.FogExp2 | null>(null);

  const winMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffd580", emissive: "#ffcf70", emissiveIntensity: 0.4, roughness: 0.5,
  }), []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#fffae0", emissive: "#ffe599", emissiveIntensity: 0.7,
  }), []);
  const bottleMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#D9B979", emissive: "#D9B979", emissiveIntensity: 0.5, metalness: 0.6, roughness: 0.35,
  }), []);
  const lipstickMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#B03050", emissive: "#B03050", emissiveIntensity: 0.5, roughness: 0.6,
  }), []);
  const jarMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#A8C8B8", emissive: "#A8C8B8", emissiveIntensity: 0.45, roughness: 0.4,
  }), []);
  const dropperMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#7EC8A0", emissive: "#7EC8A0", emissiveIntensity: 0.45, roughness: 0.5,
  }), []);

  const signTextures = useMemo(
    () => BEATS.map((b) => makeSignTexture(b.sign, b.color)),
    [],
  );
  const mainSignTexture = useMemo(
    () => makeSignTexture("HOSSAM", readThemeAccent()),
    [],
  );

  useEffect(() => {
    scene.background = DUSK_SKY.clone();
    const fog = new THREE.FogExp2(DUSK_FOG.getHex(), 0.014);
    scene.fog = fog;
    fogRef.current = fog;
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  useEffect(() => {
    if (winRef.current) {
      let idx = 0;
      for (let side = 0; side < 2; side++) {
        const sx = side === 0 ? -14 : 14;
        const signX = side === 0 ? -1 : 1;
        for (let b = 0; b < BCOUNT; b++) {
          const bz = -(b * BSPACING + 5);
          const bh = bldH(b);
          for (let row = 0; row < WIN_ROWS; row++) {
            for (let col = 0; col < WIN_COLS; col++) {
              dummy.position.set(
                sx + signX * (-4 + 1.2 + col * (8 / (WIN_COLS - 0.5))),
                1.5 + row * (bh - 2) / WIN_ROWS,
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
      for (let k = 0; k < 4; k++) {
        for (const side of [-1, 1] as const) {
          dummy.position.set(side * 7, 4.3, -(k * 22 + 8));
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(0.6, 0.15, 0.3);
          dummy.updateMatrix();
          lampHeadRef.current.setMatrixAt(i++, dummy.matrix);
        }
      }
      lampHeadRef.current.instanceMatrix.needsUpdate = true;
    }

    if (carRef.current) {
      const pos: Array<[number, number, number]> = [
        [-9.5, 0.45, -8], [-9.5, 0.45, -30], [-9.5, 0.45, -54],
        [ 9.5, 0.45, -16], [ 9.5, 0.45, -38], [ 9.5, 0.45, -56],
      ];
      pos.forEach(([x, y, z], i) => {
        dummy.position.set(x, y, z);
        dummy.rotation.set(0, i < 3 ? 0 : Math.PI, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        carRef.current!.setMatrixAt(i, dummy.matrix);
      });
      carRef.current.instanceMatrix.needsUpdate = true;
    }

    if (benchRef.current) {
      const pos: Array<[number, number, number]> = [
        [-5.5, 0, -12], [-5.5, 0, -34],
        [ 5.5, 0, -20], [ 5.5, 0, -42],
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
        [-5.2, 0, -16], [-5.2, 0, -38],
        [ 5.2, 0, -26], [ 5.2, 0, -48],
        [-5.2, 0, -58], [ 5.2, 0, -58],
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
        const xBase = side * 8.4;
        for (let k = 0; k < PROP_PER_SHOP; k++) {
          dummy.position.set(
            xBase + side * -0.3 + (k % 3) * 0.28,
            baseY,
            shopZ - 2.2 + Math.floor(k / 3) * 0.35,
          );
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(baseScale[0], baseScale[1], baseScale[2]);
          dummy.updateMatrix();
          mesh.setMatrixAt(i++, dummy.matrix);
        }
      });
      mesh.instanceMatrix.needsUpdate = true;
    };
    setupProps(bottleRef.current,   1.3, [0.16, 0.36, 0.16]);
    setupProps(lipstickRef.current, 1.35, [0.08, 0.28, 0.08]);
    setupProps(jarRef.current,      1.25, [0.18, 0.20, 0.18]);
    setupProps(dropperRef.current,  1.35, [0.12, 0.32, 0.12]);
  }, []);

  useEffect(() => {
    return () => {
      signTextures.forEach((t) => t.dispose());
      mainSignTexture.dispose();
    };
  }, [signTextures, mainSignTexture]);

  useFrame(() => {
    const p = scrollRef.current;

    tmpColor.lerpColors(DUSK_SKY, NIGHT_SKY, p);
    if (scene.background instanceof THREE.Color) scene.background.copy(tmpColor);
    gl.setClearColor(tmpColor, 1);

    if (fogRef.current) {
      tmpColor.lerpColors(DUSK_FOG, NIGHT_FOG, p);
      fogRef.current.color.copy(tmpColor);
      fogRef.current.density = 0.014 + p * 0.006;
    }

    winMat.emissiveIntensity  = THREE.MathUtils.lerp(0.25, 2.6, p);
    lampMat.emissiveIntensity = THREE.MathUtils.lerp(0.5,  3.0, p);

    const doorOpen = THREE.MathUtils.smoothstep(p, MAIN_DOORS_OPEN_AT, 1);
    if (leftDoor.current)  leftDoor.current.rotation.y  = -doorOpen * Math.PI * 0.55;
    if (rightDoor.current) rightDoor.current.rotation.y =  doorOpen * Math.PI * 0.55;

    if (reducedMotion) return;
  });

  const buildings = useMemo(() => {
    const out: { x: number; z: number; h: number }[] = [];
    for (let side = 0; side < 2; side++) {
      const sx = side === 0 ? -14 : 14;
      for (let b = 0; b < BCOUNT; b++) {
        out.push({ x: sx, z: -(b * BSPACING + 5), h: bldH(b) });
      }
    }
    return out;
  }, []);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
        <planeGeometry args={[12, 120]} />
        <meshStandardMaterial color="#1a1a1e" roughness={0.98} />
      </mesh>

      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0.012, -(i * 10 + 5)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 4]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      ))}

      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(-3.5 + i * 1.08), 0.013, -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.7, 2.6]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      ))}

      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 8.5, 0.07, -50]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.5, 120]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.95} />
        </mesh>
      ))}
      {([-1, 1] as const).map((s) => (
        <mesh key={`c${s}`} position={[s * 6, 0.09, -50]}>
          <boxGeometry args={[0.22, 0.18, 120]} />
          <meshStandardMaterial color="#3a3a44" roughness={0.9} />
        </mesh>
      ))}

      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[8, b.h, 4]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#1c1c24" : i % 3 === 1 ? "#22222e" : "#1a1e2a"}
            roughness={0.85}
          />
        </mesh>
      ))}

      <instancedMesh ref={winRef} args={[undefined, undefined, TOTAL_WINS]}>
        <boxGeometry args={[0.55, 0.72, 0.08]} />
        <primitive object={winMat} attach="material" />
      </instancedMesh>

      {BEATS.map((beat, i) => {
        const side = i % 2 === 0 ? -1 : 1;
        const x = side * 8.2;
        return (
          <group key={beat.id} position={[x, 0, beat.z]}>
            <mesh position={[-side * 0.2, 1.2, 0]}>
              <boxGeometry args={[0.15, 2.0, 3.0]} />
              <meshStandardMaterial
                color="#05050a"
                emissive={beat.color}
                emissiveIntensity={0.18}
                roughness={0.3}
              />
            </mesh>

            <mesh position={[-side * 0.4, 3.1, 0]} rotation={[0, side * Math.PI / 2, 0]}>
              <planeGeometry args={[2.6, 0.65]} />
              <meshBasicMaterial
                map={signTextures[i]}
                toneMapped={false}
                transparent
              />
            </mesh>

            <mesh position={[-side * 0.45, 3.1, 0]} rotation={[0, side * Math.PI / 2, 0]}>
              <planeGeometry args={[3.2, 1.0]} />
              <meshBasicMaterial color={beat.color} transparent opacity={0.10} />
            </mesh>

            {beat.id === "pharmacy" && (
              <group position={[-side * 0.55, 3.9, 0]}>
                <mesh>
                  <boxGeometry args={[0.08, 0.5, 0.14]} />
                  <meshStandardMaterial color="#7EC8A0" emissive="#7EC8A0" emissiveIntensity={2.4} />
                </mesh>
                <mesh>
                  <boxGeometry args={[0.08, 0.14, 0.5]} />
                  <meshStandardMaterial color="#7EC8A0" emissive="#7EC8A0" emissiveIntensity={2.4} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      <instancedMesh ref={bottleRef} args={[undefined, undefined, PROP_TOTAL]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 10]} />
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
        <cylinderGeometry args={[0.5, 0.35, 1, 8]} />
        <primitive object={dropperMat} attach="material" />
      </instancedMesh>

      {Array.from({ length: 8 }, (_, i) => {
        const side = i < 4 ? -1 : 1;
        const zi = i % 4;
        return (
          <mesh key={`pole${i}`} position={[side * 7, 2.2, -(zi * 22 + 8)]}>
            <cylinderGeometry args={[0.055, 0.055, 4.5, 6]} />
            <meshStandardMaterial color="#555566" roughness={0.8} metalness={0.5} />
          </mesh>
        );
      })}
      <instancedMesh ref={lampHeadRef} args={[undefined, undefined, 8]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={lampMat} attach="material" />
      </instancedMesh>

      <instancedMesh ref={carRef} args={[undefined, undefined, 6]}>
        <boxGeometry args={[2, 0.9, 1.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.6} />
      </instancedMesh>

      <instancedMesh ref={benchRef} args={[undefined, undefined, 4]}>
        <boxGeometry args={[1.4, 0.1, 0.4]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.9} />
      </instancedMesh>

      <instancedMesh ref={planterRef} args={[undefined, undefined, 6]}>
        <cylinderGeometry args={[0.35, 0.4, 0.5, 8]} />
        <meshStandardMaterial color="#2a2018" roughness={0.9} />
      </instancedMesh>

      <group position={[0, 0, MAIN_STORE_Z]}>
        <mesh position={[0, 2.2, -0.4]}>
          <boxGeometry args={[8, 4.4, 0.4]} />
          <meshStandardMaterial color="#141420" roughness={0.7} />
        </mesh>

        <mesh position={[0, 3.4, 0.15]} rotation={[0.12, 0, 0]}>
          <boxGeometry args={[7.6, 0.15, 1.4]} />
          <meshStandardMaterial
            color={readThemeAccent()}
            emissive={readThemeAccent()}
            emissiveIntensity={0.15}
            roughness={0.6}
          />
        </mesh>

        <mesh position={[0, 4.0, 0.1]}>
          <planeGeometry args={[5.0, 1.1]} />
          <meshBasicMaterial map={mainSignTexture} toneMapped={false} transparent />
        </mesh>

        <mesh ref={leftDoor} position={[-0.95, 1.6, 0.2]}>
          <boxGeometry args={[1.7, 3.2, 0.1]} />
          <meshStandardMaterial color="#2a2a3a" emissive="#ffe7b8" emissiveIntensity={0.15} roughness={0.4} />
        </mesh>
        <mesh ref={rightDoor} position={[0.95, 1.6, 0.2]}>
          <boxGeometry args={[1.7, 3.2, 0.1]} />
          <meshStandardMaterial color="#2a2a3a" emissive="#ffe7b8" emissiveIntensity={0.15} roughness={0.4} />
        </mesh>
      </group>

      {([-1, 1] as const).map((s) => (
        <mesh key={`g${s}`} rotation={[-Math.PI / 2, 0, 0]} position={[s * 20, -0.01, -50]}>
          <planeGeometry args={[18, 120]} />
          <meshStandardMaterial color="#111118" roughness={1} />
        </mesh>
      ))}
    </>
  );
}

export default function StreetSceneRoot({ reducedMotion }: { reducedMotion: boolean }) {
  return <StreetScene reducedMotion={reducedMotion} />;
}