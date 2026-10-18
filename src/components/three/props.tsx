"use client";

/**
 * Procedural ritual props for Template 4 (no model files):
 * diya, kalash, marigold strands, mandap, agni kund (sacred fire),
 * rangoli floor texture, petal shower and a warm studio environment.
 */

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { MAT } from "./figures";

type GroupProps = ThreeElements["group"];

export function WarmEnvironment({ resolution = 128 }: { resolution?: number }) {
  return (
    <Environment resolution={resolution} frames={1}>
      <Lightformer intensity={2.4} color="#FFE8C2" position={[0, 5, 3]} scale={[8, 3, 1]} />
      <Lightformer intensity={1.4} color="#FF9A4D" position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer intensity={1} color="#1A9C95" position={[5, 1, -2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="ring" intensity={1.6} color="#ffffff" position={[0, 2, 6]} scale={3} />
    </Environment>
  );
}

const brass = new THREE.MeshStandardMaterial({ color: "#C9A23A", metalness: 1, roughness: 0.3 });
const copper = new THREE.MeshStandardMaterial({ color: "#B4552F", metalness: 0.85, roughness: 0.35 });
const clay = new THREE.MeshStandardMaterial({ color: "#B0532B", roughness: 0.7 });
const leaf = new THREE.MeshStandardMaterial({ color: "#3E7B3A", roughness: 0.6, side: THREE.DoubleSide });
const flameMat = (c: string, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });

/* ---------------------------------- diya --------------------------------- */
export function Diya({ light = false, ...props }: GroupProps & { light?: boolean }) {
  const flame = useRef<THREE.Mesh>(null);
  const pl = useRef<THREE.PointLight>(null);
  const seed = useMemo(() => Math.random() * 10, []);
  const geo = useMemo(() => new THREE.LatheGeometry([[0, 0], [0.09, 0.01], [0.13, 0.05], [0.14, 0.08], [0.12, 0.075], [0, 0.05]].map(([x, y]) => new THREE.Vector2(x, y)), 20), []);
  const fm = useMemo(() => flameMat("#FFC266"), []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed;
    const f = 1 + Math.sin(t * 14) * 0.08 + Math.sin(t * 6.1) * 0.06;
    flame.current?.scale.set(0.028 * f, 0.07 * (2 - f), 0.028 * f);
    if (pl.current) pl.current.intensity = 0.9 * f;
  });
  return (
    <group {...props}>
      <mesh geometry={geo} material={clay} />
      <mesh ref={flame} position={[0.06, 0.12, 0]} material={fm}>
        <sphereGeometry args={[1, 10, 8]} />
      </mesh>
      {light && <pointLight ref={pl} position={[0.06, 0.2, 0]} color="#FFA54F" distance={2.5} decay={2} />}
    </group>
  );
}

/* --------------------------------- kalash -------------------------------- */
export function Kalash(props: GroupProps) {
  const pot = useMemo(
    () => new THREE.LatheGeometry([[0, 0], [0.1, 0.01], [0.17, 0.1], [0.18, 0.18], [0.12, 0.3], [0.08, 0.34], [0.1, 0.38]].map(([x, y]) => new THREE.Vector2(x, y)), 28),
    []
  );
  const leafGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.quadraticCurveTo(0.05, 0.1, 0, 0.22);
    s.quadraticCurveTo(-0.05, 0.1, 0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  return (
    <group {...props}>
      <mesh geometry={pot} material={brass} />
      {/* red thread (mauli) */}
      <mesh material={MAT.red} position={[0, 0.3, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.115, 0.008, 6, 24]} />
      </mesh>
      {/* mango leaves fanning out */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} geometry={leafGeo} material={leaf} position={[0, 0.37, 0]} rotation={[-0.9, (i / 7) * Math.PI * 2, 0]} />
      ))}
      {/* coconut */}
      <mesh position={[0, 0.47, 0]} scale={[1, 1.15, 1]}>
        <sphereGeometry args={[0.07, 16, 12]} />
        <meshStandardMaterial color="#7A4A26" roughness={0.9} />
      </mesh>
    </group>
  );
}

/* ---------------------------- marigold strands --------------------------- */
/**
 * Hanging strings of marigolds (one InstancedMesh). `points` are the tops of
 * each strand; strands sway gently.
 */
export function MarigoldStrands({ tops, length = 0.8, spacing = 0.055 }: { tops: THREE.Vector3[]; length?: number; spacing?: number }) {
  const per = Math.round(length / spacing);
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = tops.length * per;
  const geo = useMemo(() => new THREE.IcosahedronGeometry(0.032, 1), []);

  // Colours are set in the ref callback so they exist before the shader compiles.
  const setRef = (m: THREE.InstancedMesh | null) => {
    ref.current = m;
    if (!m || m.instanceColor) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) m.setColorAt(i, c.set(i % per === per - 1 ? "#D4AF37" : i % 2 ? "#F7A70F" : "#F28C0F"));
  };

  useFrame(({ clock }) => {
    const m = ref.current;
    if (!m) return;
    const t = clock.elapsedTime;
    tops.forEach((top, s) => {
      const sway = Math.sin(t * 1.2 + s * 0.7) * 0.06;
      for (let k = 0; k < per; k++) {
        const f = k / per;
        dummy.position.set(top.x + sway * f * f, top.y - k * spacing, top.z + sway * 0.5 * f * f);
        dummy.scale.setScalar(k === per - 1 ? 0.7 : 1);
        dummy.updateMatrix();
        m.setMatrixAt(s * per + k, dummy.matrix);
      }
    });
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={setRef} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial roughness={0.6} />
    </instancedMesh>
  );
}

/* --------------------------------- rangoli -------------------------------- */
/** A colourful rangoli drawn on a canvas (used as the mandap floor). */
export function rangoliTexture(size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const cx = size / 2;
  g.fillStyle = "#FFF3DE";
  g.fillRect(0, 0, size, size);
  const rings: [number, number, string, number][] = [
    [0.46, 24, "#B3001B", 0.13],
    [0.38, 16, "#F28C0F", 0.12],
    [0.3, 12, "#1A9C95", 0.11],
    [0.22, 10, "#E94C89", 0.1],
    [0.14, 8, "#F7C71C", 0.09],
  ];
  rings.forEach(([r, n, col, w]) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      g.save();
      g.translate(cx + Math.cos(a) * r * size * 0.82, cx + Math.sin(a) * r * size * 0.82);
      g.rotate(a + Math.PI / 2);
      g.fillStyle = col;
      g.beginPath();
      g.ellipse(0, 0, w * size * 0.22, w * size * 0.5, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#FFFFFF";
      g.beginPath();
      g.ellipse(0, 0, w * size * 0.06, w * size * 0.25, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
  });
  g.strokeStyle = "#D4AF37";
  g.lineWidth = size * 0.008;
  [0.42, 0.34, 0.26, 0.18].forEach((r) => {
    g.beginPath();
    g.arc(cx, cx, r * size * 0.82 + size * 0.04, 0, Math.PI * 2);
    g.stroke();
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------------------------------- mandap -------------------------------- */
/** Four marigold-wrapped pillars, a draped saffron canopy with strands and bells, kalash at the corners. */
export function Mandap({ w = 3.6, d = 3.0, h = 2.6, high = true, ...props }: GroupProps & { w?: number; d?: number; h?: number; high?: boolean }) {
  const corners = useMemo(() => [-1, 1].flatMap((sx) => [-1, 1].map((sz) => new THREE.Vector2((sx * w) / 2, (sz * d) / 2))), [w, d]);

  const wraps = useMemo(() => {
    const n = 46;
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.045, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), n * 4);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    corners.forEach((p, k) => {
      for (let i = 0; i < n; i++) {
        const t = i / n;
        const a = t * Math.PI * 10;
        o.position.set(p.x + Math.cos(a) * 0.1, 0.25 + t * (h - 0.3), p.y + Math.sin(a) * 0.1);
        o.updateMatrix();
        m.setMatrixAt(k * n + i, o.matrix);
        m.setColorAt(k * n + i, c.set(i % 3 ? "#F28C0F" : "#F7C71C"));
      }
    });
    return m;
  }, [corners, h]);

  const canopy = useMemo(() => {
    const g = new THREE.PlaneGeometry(w + 0.4, d + 0.4, 24, 20);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) / ((w + 0.4) / 2);
      const z = pos.getZ(i) / ((d + 0.4) / 2);
      pos.setY(i, -(1 - x * x) * (1 - z * z) * 0.35); // soft sag
    }
    g.computeVertexNormals();
    return g;
  }, [w, d]);

  const strandTops = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const step = high ? 0.3 : 0.45;
    for (let x = -w / 2; x <= w / 2 + 0.01; x += step) [-1, 1].forEach((s) => out.push(new THREE.Vector3(x, h - 0.02, (s * d) / 2)));
    for (let z = -d / 2 + step; z < d / 2; z += step) [-1, 1].forEach((s) => out.push(new THREE.Vector3((s * w) / 2, h - 0.02, z)));
    return out;
  }, [w, d, h, high]);

  return (
    <group {...props}>
      {corners.map((p, i) => (
        <group key={i} position={[p.x, 0, p.y]}>
          <mesh material={brass} position={[0, h / 2, 0]}>
            <cylinderGeometry args={[0.06, 0.07, h, 16]} />
          </mesh>
          <mesh material={brass} position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.16, 16]} />
          </mesh>
          <Kalash position={[0.25 * Math.sign(-p.x), 0, 0.25 * Math.sign(-p.y)]} scale={0.9} />
          {/* banana leaves at the pillar foot */}
          {[-0.4, 0.4].map((r) => (
            <mesh key={r} material={leaf} position={[0, 0.7, 0]} rotation={[0, r + Math.atan2(p.x, p.y), 0.18 * Math.sign(r)]}>
              <planeGeometry args={[0.28, 1.3]} />
            </mesh>
          ))}
        </group>
      ))}
      <primitive object={wraps} />
      <mesh geometry={canopy} position={[0, h + 0.12, 0]}>
        <meshStandardMaterial color="#D9481C" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* gold fringe frame */}
      <mesh material={MAT.gold} position={[0, h, 0]}>
        <boxGeometry args={[w + 0.12, 0.06, 0.06]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh material={MAT.gold} position={[0, h, (s * d) / 2]}>
            <boxGeometry args={[w + 0.12, 0.06, 0.06]} />
          </mesh>
          <mesh material={MAT.gold} position={[(s * w) / 2, h, 0]}>
            <boxGeometry args={[0.06, 0.06, d + 0.12]} />
          </mesh>
        </group>
      ))}
      <MarigoldStrands tops={strandTops} length={0.75} />
      {/* bells at the four corners */}
      {corners.map((p, i) => (
        <mesh key={i} material={brass} position={[p.x, h - 0.85, p.y]} rotation-x={Math.PI}>
          <coneGeometry args={[0.07, 0.12, 12, 1, true]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------- agni kund -------------------------------- */
/** Stepped copper havan kund with a living fire, embers and a warm light. */
export function AgniKund({ intensity = 1, ...props }: GroupProps & { intensity?: number }) {
  const flames = useRef<(THREE.Mesh | null)[]>([]);
  const light = useRef<THREE.PointLight>(null);
  const mats = useMemo(() => [flameMat("#FFD27A", 0.95), flameMat("#FF8A1F", 0.85), flameMat("#E63E12", 0.7)], []);
  const tongues = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: Math.cos(i * 2.2) * 0.07 * (i % 3),
        z: Math.sin(i * 2.2) * 0.07 * (i % 3),
        h: 0.35 + (i % 4) * 0.08,
        m: i % 3,
        seed: i * 1.7,
      })),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    flames.current.forEach((f, i) => {
      if (!f) return;
      const k = tongues[i];
      const s = 1 + Math.sin(t * 9 + k.seed) * 0.15 + Math.sin(t * 15 + k.seed * 2) * 0.08;
      f.scale.set(1 / s, s * intensity, 1 / s);
      f.rotation.z = Math.sin(t * 3 + k.seed) * 0.12;
    });
    if (light.current) light.current.intensity = (5 + Math.sin(t * 11) * 0.8 + Math.sin(t * 5.3) * 0.6) * intensity;
  });

  return (
    <group {...props}>
      {[0.62, 0.48, 0.34].map((s, i) => (
        <mesh key={s} material={copper} position={[0, 0.06 + i * 0.1, 0]}>
          <boxGeometry args={[s, 0.1, s]} />
        </mesh>
      ))}
      {/* samidha (wood) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.31, 0]} rotation={[0, (i * Math.PI) / 3, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.3, 6]} />
          <meshStandardMaterial color="#3B2414" roughness={1} />
        </mesh>
      ))}
      {tongues.map((k, i) => (
        <mesh
          key={i}
          ref={(m) => {
            flames.current[i] = m;
          }}
          material={mats[k.m]}
          position={[k.x, 0.32 + k.h / 2, k.z]}
        >
          <coneGeometry args={[0.06 - k.m * 0.012, k.h, 10, 1, true]} />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 0.7, 0]} color="#FF8A2B" distance={7} decay={1.6} />
    </group>
  );
}

/* ------------------------------ petal shower ------------------------------ */
const PETAL_COLORS = ["#F28C0F", "#F7A70F", "#B3001B", "#E94C89", "#FFF3DE"];
/** Pushpa varsha: rose & marigold petals drifting down (one draw call). */
export function PetalShower({ count = 90, area = [8, 7, 5] as [number, number, number], y = 2 }) {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(0.06, 8);
    g.scale(1, 0.65, 1);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, p.getX(i) ** 2 * 4);
    g.computeVertexNormals();
    return g;
  }, []);
  const petals = useMemo(
    () => Array.from({ length: count }, () => ({ x: (Math.random() - 0.5) * area[0], y: Math.random() * area[1], z: (Math.random() - 0.5) * area[2], v: 0.25 + Math.random() * 0.4, s: Math.random() * 6, r: Math.random() * 3 })),
    [count, area]
  );
  const setRef = (m: THREE.InstancedMesh | null) => {
    ref.current = m;
    if (!m) return;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) m.setColorAt(i, c.set(PETAL_COLORS[i % PETAL_COLORS.length]));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  };
  useFrame((_, delta) => {
    const m = ref.current;
    if (!m) return;
    const dt = Math.min(delta, 0.05);
    petals.forEach((p, i) => {
      p.y -= p.v * dt;
      p.s += dt;
      p.r += dt * 1.5;
      if (p.y < -1) p.y = area[1];
      dummy.position.set(p.x + Math.sin(p.s) * 0.3, p.y - area[1] / 2 + y, p.z);
      dummy.rotation.set(p.r, p.r * 0.6, p.s);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
  });
  return (
    <instancedMesh ref={setRef} args={[geo, undefined, count]} frustumCulled={false}>
      <meshStandardMaterial side={THREE.DoubleSide} roughness={0.6} />
    </instancedMesh>
  );
}
