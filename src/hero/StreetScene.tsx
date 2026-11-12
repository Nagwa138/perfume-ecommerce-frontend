import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ── Time-of-day palette ────────────────────────────────────────────────────────
const DAWN_SKY  = new THREE.Color("#e8703a");
const NIGHT_SKY = new THREE.Color("#050a1a");
const DAWN_FOG  = new THREE.Color("#c05828");
const NIGHT_FOG = new THREE.Color("#070d2a");
const tmpColor  = new THREE.Color();
const dummy     = new THREE.Object3D();

// Scroll progress (same formula as AvatarMesh)
function getP() {
  if (typeof window === "undefined") return 0;
  return THREE.MathUtils.clamp(window.scrollY / (window.innerHeight * 3), 0, 1);
}

// Deterministic height for building i (varies nicely without randomness)
function bldH(i: number) { return 5 + ((i * 7 + i * i * 3) % 7) * 1.5; }

// Number of buildings per side — fewer on small screens for perf
const BCOUNT = typeof window !== "undefined" && window.innerWidth < 640 ? 5 : 9;
const BSPACING = 11; // units between building centres

// ── Window InstancedMesh setup ────────────────────────────────────────────────
const WIN_COLS = 4;
const WIN_ROWS = 5;
const WINS_PER_BLDG = WIN_COLS * WIN_ROWS;
const TOTAL_WINS = BCOUNT * 2 * WINS_PER_BLDG; // both sides

function StreetScene() {
  const { scene, gl } = useThree();

  // Window InstancedMesh ref
  const winRef   = useRef<THREE.InstancedMesh>(null!);
  // Street lamp emissive heads (we fake the extra lamps without PointLights)
  const lampRef  = useRef<THREE.InstancedMesh>(null!);
  // Cars body
  const carRef   = useRef<THREE.InstancedMesh>(null!);
  // Trees: trunk + canopy
  const trunkRef = useRef<THREE.InstancedMesh>(null!);
  const canRef   = useRef<THREE.InstancedMesh>(null!);

  // Fog reference
  const fogRef = useRef<THREE.FogExp2 | null>(null);

  // Materials for window emissive (needs reference for useFrame update)
  const winMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffd580", emissive: "#ffd040",
    emissiveIntensity: 0.3,
    roughness: 0.5, metalness: 0.0,
  }), []);
  const lampMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#fffae0", emissive: "#ffe599",
    emissiveIntensity: 0.5,
  }), []);

  // ── Set up scene background & fog once ──────────────────────────────────
  useEffect(() => {
    scene.background = new THREE.Color(DAWN_SKY);
    const fog = new THREE.FogExp2(DAWN_FOG.getHex(), 0.012);
    scene.fog = fog;
    fogRef.current = fog;
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);

  // ── Populate instance matrices once on mount ─────────────────────────────
  useEffect(() => {
    // Windows
    if (winRef.current) {
      let idx = 0;
      for (let side = 0; side < 2; side++) {
        const sx = side === 0 ? -14 : 14;
        const signX = side === 0 ? -1 : 1;
        for (let b = 0; b < BCOUNT; b++) {
          const bz = -(b * BSPACING + 5);
          const bw = 8;
          const bh = bldH(b);
          for (let row = 0; row < WIN_ROWS; row++) {
            for (let col = 0; col < WIN_COLS; col++) {
              dummy.position.set(
                sx + signX * (-bw / 2 + 1.2 + col * (bw / (WIN_COLS - 0.5))),
                1.5 + row * (bh - 2) / WIN_ROWS,
                bz
              );
              dummy.scale.setScalar(1);
              dummy.updateMatrix();
              winRef.current.setMatrixAt(idx, dummy.matrix);
              idx++;
            }
          }
        }
      }
      winRef.current.instanceMatrix.needsUpdate = true;
    }

    // Lamp heads (8 lamps total, 4 per side)
    const LAMP_POSITIONS: [number, number, number][] = [];
    for (let i = 0; i < 4; i++) {
      LAMP_POSITIONS.push([-7, 4.3, -(i * 22 + 8)]);  // left side
      LAMP_POSITIONS.push([ 7, 4.3, -(i * 22 + 8)]);  // right side
    }
    if (lampRef.current) {
      LAMP_POSITIONS.forEach(([lx, ly, lz], i) => {
        dummy.position.set(lx, ly, lz);
        dummy.scale.set(0.6, 0.15, 0.3);
        dummy.updateMatrix();
        lampRef.current.setMatrixAt(i, dummy.matrix);
      });
      lampRef.current.instanceMatrix.needsUpdate = true;
    }

    // Cars (6 cars, 3 per side)
    if (carRef.current) {
      const carPos: [number, number, number][] = [
        [-9, 0.45, -12], [-9, 0.45, -34], [-9, 0.45, -58],
        [  9, 0.45, -20], [  9, 0.45, -44], [  9, 0.45, -72],
      ];
      carPos.forEach(([cx, cy, cz], i) => {
        dummy.position.set(cx, cy, cz);
        dummy.scale.set(1, 1, 1);
        dummy.rotation.set(0, i < 3 ? 0 : Math.PI, 0);
        dummy.updateMatrix();
        carRef.current.setMatrixAt(i, dummy.matrix);
      });
      carRef.current.instanceMatrix.needsUpdate = true;
    }

    // Trees (8, 4 per side)
    if (trunkRef.current && canRef.current) {
      const treePos: [number, number, number][] = [
        [-8, 0, -18], [-8, 0, -40], [-8, 0, -62], [-8, 0, -84],
        [ 8, 0, -24], [ 8, 0, -46], [ 8, 0, -68], [ 8, 0, -90],
      ];
      treePos.forEach(([tx, ty, tz], i) => {
        dummy.position.set(tx, ty + 1.2, tz);
        dummy.scale.setScalar(1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        trunkRef.current.setMatrixAt(i, dummy.matrix);

        dummy.position.set(tx, ty + 2.8, tz);
        dummy.updateMatrix();
        canRef.current.setMatrixAt(i, dummy.matrix);
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
      canRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  // ── Per-frame: lerp time-of-day ──────────────────────────────────────────
  useFrame(() => {
    const p = getP();

    // Sky & fog
    tmpColor.lerpColors(DAWN_SKY, NIGHT_SKY, p);
    if (scene.background instanceof THREE.Color) scene.background.copy(tmpColor);
    gl.setClearColor(tmpColor, 1);

    if (fogRef.current) {
      tmpColor.lerpColors(DAWN_FOG, NIGHT_FOG, p);
      fogRef.current.color.copy(tmpColor);
      fogRef.current.density = 0.012 + p * 0.006;
    }

    // Window emissive brightens as night falls
    winMat.emissiveIntensity  = THREE.MathUtils.lerp(0.2, 2.8, p);
    lampMat.emissiveIntensity = THREE.MathUtils.lerp(0.4, 3.0, p);
  });

  // ── Building data ────────────────────────────────────────────────────────
  const buildings = useMemo(() => {
    const list: { x: number; z: number; h: number; side: number }[] = [];
    for (let side = 0; side < 2; side++) {
      const sx = side === 0 ? -14 : 14;
      for (let b = 0; b < BCOUNT; b++) {
        list.push({ x: sx, z: -(b * BSPACING + 5), h: bldH(b), side });
      }
    }
    return list;
  }, []);

  // Shop sign positions (every 3rd building, left side only)
  const signs: { x: number; y: number; z: number; label: string; color: string }[] = [
    { x: -10.1, y: 2.5, z: -5,  label: "NOVA",     color: "#8b5cf6" },
    { x: -10.1, y: 2.5, z: -27, label: "DENIM",    color: "#3b82f6" },
    { x: -10.1, y: 2.5, z: -49, label: "SNEAKERS", color: "#f59e0b" },
    { x:  10.1, y: 2.5, z: -16, label: "OUTWEAR",  color: "#10b981" },
  ];

  return (
    <>
      {/* ── Road ──────────────────────────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
        <planeGeometry args={[12, 120]} />
        <meshStandardMaterial
          color="#1a1a1e"
          roughness={0.98}
          metalness={0.0}
        />
      </mesh>

      {/* ── Sidewalks ─────────────────────────────────────────────── */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 8.5, 0.07, -50]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[5.5, 120]} />
          <meshStandardMaterial color="#2a2a30" roughness={0.95} />
        </mesh>
      ))}

      {/* Curbs */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * 6, 0.09, -50]}>
          <boxGeometry args={[0.22, 0.18, 120]} />
          <meshStandardMaterial color="#3a3a44" roughness={0.9} />
        </mesh>
      ))}

      {/* ── Lane dashes (10 along centre) ─────────────────────────── */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0, 0.012, -(i * 10 + 5)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.22, 4]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      ))}

      {/* ── Crosswalk stripes ─────────────────────────────────────── */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(-3.5 + i * 1.08), 0.013, -3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.7, 2.6]} />
          <meshBasicMaterial color="#888888" />
        </mesh>
      ))}

      {/* ── Buildings ─────────────────────────────────────────────── */}
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[8, b.h, 4]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? "#1c1c24" : i % 3 === 1 ? "#22222e" : "#1a1e2a"}
            roughness={0.85}
          />
        </mesh>
      ))}

      {/* ── Windows (InstancedMesh) ────────────────────────────────── */}
      <instancedMesh ref={winRef} args={[undefined, undefined, TOTAL_WINS]}>
        <boxGeometry args={[0.55, 0.72, 0.08]} />
        <primitive object={winMat} attach="material" />
      </instancedMesh>

      {/* ── Shop signs (emissive planes) ──────────────────────────── */}
      {signs.map((sg) => (
        <group key={sg.label} position={[sg.x, sg.y, sg.z]}>
          {/* Sign board */}
          <mesh>
            <boxGeometry args={[2.4, 0.65, 0.12]} />
            <meshStandardMaterial
              color={sg.color}
              emissive={sg.color}
              emissiveIntensity={1.4}
              roughness={0.6}
            />
          </mesh>
          {/* Glow halo (larger transparent plane behind) */}
          <mesh position={[0, 0, -0.08]}>
            <planeGeometry args={[2.8, 1.0]} />
            <meshBasicMaterial color={sg.color} transparent opacity={0.08} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* ── Street lamps ─────────────────────────────────────────── */}
      {/* Poles */}
      {Array.from({ length: 8 }, (_, i) => {
        const side = i < 4 ? -1 : 1;
        const zi   = i % 4;
        return (
          <mesh key={i} position={[side * 7, 2.2, -(zi * 22 + 8)]}>
            <cylinderGeometry args={[0.055, 0.055, 4.5, 6]} />
            <meshStandardMaterial color="#555566" roughness={0.8} metalness={0.5} />
          </mesh>
        );
      })}

      {/* Lamp heads (InstancedMesh) */}
      <instancedMesh ref={lampRef} args={[undefined, undefined, 8]}>
        <boxGeometry args={[1, 1, 1]} />
        <primitive object={lampMat} attach="material" />
      </instancedMesh>

      {/* 4 real PointLights — one per left-side lamp */}
      {Array.from({ length: 4 }, (_, i) => (
        <pointLight
          key={i}
          position={[-7, 4.3, -(i * 22 + 8)]}
          intensity={0}  // useFrame updates this via ref below — set via scene
          color="#ffe59a"
          distance={18}
          decay={2}
        />
      ))}

      {/* ── Cars (InstancedMesh) ─────────────────────────────────── */}
      <instancedMesh ref={carRef} args={[undefined, undefined, 6]}>
        <boxGeometry args={[2, 0.9, 1.3]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.3}
          metalness={0.6}
        />
      </instancedMesh>

      {/* ── Trees: trunks ───────────────────────────────────────── */}
      <instancedMesh ref={trunkRef} args={[undefined, undefined, 8]}>
        <cylinderGeometry args={[0.1, 0.13, 2.4, 6]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.95} />
      </instancedMesh>

      {/* ── Trees: canopy ───────────────────────────────────────── */}
      <instancedMesh ref={canRef} args={[undefined, undefined, 8]}>
        <sphereGeometry args={[0.75, 7, 7]} />
        <meshStandardMaterial color="#1a3a1a" roughness={0.95} />
      </instancedMesh>

      {/* ── Bollards ─────────────────────────────────────────────── */}
      {[-6.8, -13, -20, -28, 6.8, -13, -20, -28].map((bz, i) => (
        <mesh key={i} position={[i < 4 ? -6.8 : 6.8, 0.3, bz]}>
          <cylinderGeometry args={[0.09, 0.09, 0.6, 6]} />
          <meshStandardMaterial color="#555566" roughness={0.7} />
        </mesh>
      ))}

      {/* ── Ground plane beyond sidewalk ─────────────────────────── */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} rotation={[-Math.PI / 2, 0, 0]} position={[s * 20, -0.01, -50]}>
          <planeGeometry args={[18, 120]} />
          <meshStandardMaterial color="#111118" roughness={1} />
        </mesh>
      ))}

      {/* ── Neon accent lights (animate intensity with scroll) ─────── */}
      {/* These are real PointLights attached to sign positions */}
      <pointLight position={[-10, 2.5, -5]}  color="#8b5cf6" intensity={0} distance={12} decay={2} />
      <pointLight position={[-10, 2.5, -27]} color="#3b82f6" intensity={0} distance={12} decay={2} />
    </>
  );
}

// Wrapper that also runs the point-light intensity animation
export default function StreetSceneRoot() {
  const { scene } = useThree();

  useFrame(() => {
    const p = getP();
    // Animate all PointLight intensities based on scroll
    scene.traverse((obj) => {
      if (obj instanceof THREE.PointLight) {
        // Lamp warm lights
        if (obj.color.r > 0.9 && obj.color.g > 0.85) {
          obj.intensity = THREE.MathUtils.lerp(obj.intensity, p * 18, 0.05);
        }
        // Neon sign lights
        if (obj.color.b > 0.8) {
          obj.intensity = THREE.MathUtils.lerp(obj.intensity, p * 10, 0.05);
        }
        if (obj.color.r < 0.3 && obj.color.b > 0.8) {
          obj.intensity = THREE.MathUtils.lerp(obj.intensity, p * 10, 0.05);
        }
      }
    });
  });

  return <StreetScene />;
}
