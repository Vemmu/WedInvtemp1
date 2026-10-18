"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import SceneCanvas from "./SceneCanvas";
import { Diya, MarigoldStrands, WarmEnvironment } from "./props";
import { tilt } from "@/lib/tilt";

/**
 * Opening: a lotus bud floats on dark water among lily pads and drifting diyas.
 * On tap: the petals unfurl ring by ring (outer → inner), a golden flame rises
 * from its heart, marigold torans drop in from above and the camera rises into
 * the light.
 */

const LAYERS = [
  { n: 9, len: 0.9, width: 0.3, r: 0.12, closed: 0.18, open: 1.32, tint: "#F28FB2" },
  { n: 8, len: 0.78, width: 0.27, r: 0.09, closed: 0.1, open: 0.98, tint: "#F5A3C2" },
  { n: 7, len: 0.62, width: 0.22, r: 0.06, closed: 0.04, open: 0.6, tint: "#F9C6D8" },
];

/** A cupped, pointed petal with a cream base fading to a pink tip. */
function petalGeometry(len: number, width: number, tint: string) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(width, len * 0.42, 0, len);
  s.quadraticCurveTo(-width, len * 0.42, 0, 0);
  const g = new THREE.ShapeGeometry(s, 14);
  const pos = g.attributes.position;
  const colors: number[] = [];
  const base = new THREE.Color("#FFF6EC");
  const tip = new THREE.Color(tint);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    pos.setZ(i, (x / width) ** 2 * 0.09 - (y / len) ** 2 * 0.06); // cup across, curl at the tip
    c.copy(base).lerp(tip, Math.min(1, (y / len) ** 1.6 + Math.abs(x / width) * 0.25));
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function Lotus({ opening, onOpened }: { opening: boolean; onOpened: () => void }) {
  const root = useRef<THREE.Group>(null);
  const tilts = useRef<THREE.Group[][]>(LAYERS.map(() => []));
  const flame = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);
  const torans = useRef<THREE.Group>(null);
  const ripples = useRef<(THREE.Mesh | null)[]>([]);
  const diyas = useRef<(THREE.Group | null)[]>([]);
  const { camera, viewport } = useThree();
  const fit = Math.min(1, viewport.width / 3.4);

  const geos = useMemo(() => LAYERS.map((l) => petalGeometry(l.len, l.width, l.tint)), []);
  const petalMat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.5, emissive: "#3A0F1A", emissiveIntensity: 0.25 }), []);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const toranTops = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let x = -3.4; x <= 3.4; x += 0.28) out.push(new THREE.Vector3(x, 3.1 - Math.sin(((x + 3.4) / 6.8) * Math.PI) * 0.45, -0.8));
    return out;
  }, []);

  useEffect(() => {
    camera.position.set(0, 1.5 * fit + 0.4, 5.6);
    camera.lookAt(0, 0.45, 0);
  }, [camera, fit]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (root.current) {
      root.current.position.y = Math.sin(t * 1.1) * 0.035;
      if (!opening) {
        const tx = tilt.active ? tilt.x : state.pointer.x;
        root.current.rotation.y += (tx * 0.4 + t * 0.05 - root.current.rotation.y) * (1 - Math.exp(-delta * 2));
      }
    }
    ripples.current.forEach((r, i) => {
      if (!r) return;
      const k = ((t * 0.35 + i / 3) % 1);
      r.scale.setScalar(0.6 + k * 3.2);
      (r.material as THREE.MeshBasicMaterial).opacity = 0.35 * (1 - k);
    });
    diyas.current.forEach((d, i) => {
      if (!d) return;
      const a = t * 0.06 + (i / 7) * Math.PI * 2;
      const r = 1.9 + (i % 2) * 0.7;
      d.position.set(Math.cos(a) * r, Math.sin(t * 1.3 + i) * 0.02, Math.sin(a) * r * 0.75);
    });
  });

  useEffect(() => {
    if (!opening || !flame.current || !glow.current || !torans.current) return;
    const tl = gsap.timeline({ onComplete: onOpened });
    // petals open: outer ring first, each petal slightly staggered
    LAYERS.forEach((l, li) => {
      tl.to(
        tilts.current[li].map((g) => g.rotation),
        { x: l.open, duration: 1.4, ease: "power3.out", stagger: { each: 0.03, from: "random" } },
        li * 0.32
      );
    });
    tl.to(glow.current.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 1.4, ease: "power2.out" }, 0.6)
      .to(flame.current.position, { y: 1.15, duration: 1.6, ease: "power2.out" }, 0.9)
      .to(flame.current.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 1.6, ease: "power2.out" }, "<")
      .to(torans.current.position, { y: 0, duration: 1.3, ease: "bounce.out" }, 0.8)
      .to(camera.position, { x: 0, y: 1.3 * fit + 0.2, z: 0.9, duration: 1.8, ease: "power2.in", onUpdate: () => camera.lookAt(0, 1.1 * fit, 0) }, 2.2);
    return () => {
      tl.kill();
    };
  }, [opening, onOpened, camera, fit]);

  return (
    <group scale={fit}>
      {/* water */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, 0]}>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#0B3A42" metalness={0.55} roughness={0.18} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            ripples.current[i] = m;
          }}
          rotation-x={-Math.PI / 2}
          position={[0, 0, 0]}
        >
          <ringGeometry args={[0.5, 0.53, 64]} />
          <meshBasicMaterial color="#F8EBC4" transparent depthWrite={false} />
        </mesh>
      ))}
      {/* lily pads */}
      {[
        [1.3, 0.6, 0.4],
        [-1.4, 0.3, 0.32],
        [0.7, -1.1, 0.28],
        [-0.9, -1.2, 0.36],
        [2.2, -0.4, 0.3],
      ].map(([x, z, r], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, i]} position={[x, 0.005, z]}>
          <circleGeometry args={[r, 24, 0.3, Math.PI * 2 - 0.3]} />
          <meshStandardMaterial color="#2E7D4F" roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <group
          key={i}
          ref={(g) => {
            diyas.current[i] = g;
          }}
        >
          <Diya scale={1.4} />
        </group>
      ))}

      <group ref={root}>
        {/* the lotus */}
        <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.55, 24]} />
          <meshStandardMaterial color="#2E7D4F" roughness={0.6} />
        </mesh>
        {LAYERS.map((l, li) =>
          Array.from({ length: l.n }).map((_, i) => (
            <group key={`${li}-${i}`} rotation-y={(i / l.n) * Math.PI * 2 + li * 0.35}>
              <group position={[0, 0.06, l.r]}>
                <group
                  ref={(g) => {
                    if (g) tilts.current[li][i] = g;
                  }}
                  rotation-x={l.closed}
                >
                  <mesh geometry={geos[li]} material={petalMat} />
                </group>
              </group>
            </group>
          ))
        )}
        {/* seed pod + inner glow + rising flame */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 0.1, 16]} />
          <meshStandardMaterial color="#E9C03A" roughness={0.5} />
        </mesh>
        <mesh ref={glow} position={[0, 0.35, 0]} scale={0.5}>
          <sphereGeometry args={[0.18, 20, 16]} />
          <meshBasicMaterial color="#FFD27A" transparent opacity={0.35} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <group ref={flame} position={[0, 0.2, 0]} scale={0.6}>
          <mesh scale={[0.06, 0.15, 0.06]}>
            <sphereGeometry args={[1, 14, 12]} />
            <meshBasicMaterial color="#FFE6A8" toneMapped={false} />
          </mesh>
          <mesh scale={0.2}>
            <sphereGeometry args={[1, 14, 12]} />
            <meshBasicMaterial color="#FF9A3D" transparent opacity={0.25} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
          <pointLight color="#FFB45C" intensity={4} distance={5} decay={1.8} />
        </group>
      </group>

      {/* marigold torans waiting above the frame */}
      <group ref={torans} position={[0, 3, 0]}>
        <MarigoldStrands tops={toranTops} length={0.9} />
      </group>
    </group>
  );
}

export default function LotusScene({ opening, onOpened, high, fallback }: { opening: boolean; onOpened: () => void; high: boolean; fallback?: React.ReactNode }) {
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 1.9, 5.6], fov: 42 }} alwaysRender fallback={fallback}>
      <color attach="background" args={["#08222A"]} />
      <fog attach="fog" args={["#08222A", 6, 16]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 6, 3]} angle={0.5} penumbra={0.9} intensity={45} color="#FFE2B8" />
      <pointLight position={[-3, 1.5, 2]} intensity={6} color="#E94C89" distance={9} />
      <WarmEnvironment resolution={high ? 128 : 64} />
      <Lotus opening={opening} onOpened={onOpened} />
      <Sparkles count={high ? 90 : 35} scale={[8, 4, 6]} position={[0, 1.6, 0]} size={2.5} speed={0.3} color="#FFD27A" />
    </SceneCanvas>
  );
}
