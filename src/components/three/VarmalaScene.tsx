"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { gsap } from "gsap";
import SceneCanvas from "./SceneCanvas";
import { Bride, Groom, MAT, Varmala, type Rig } from "./figures";
import { Diya, MarigoldStrands, PetalShower, WarmEnvironment, rangoliTexture } from "./props";
import { tilt } from "@/lib/tilt";

/**
 * Hero: the jaimala / varmala. Bride & groom face each other on a rangoli stage
 * before a curtain of marigolds and a flower-ringed golden halo. On start, the
 * bride lifts her garland over the groom's head and lowers it onto him, then the
 * groom does the same. Petals shower down; the scene follows mouse / tilt.
 */

const G_POS = new THREE.Vector3(-0.4, 0, 0.1);
const B_POS = new THREE.Vector3(0.4, 0, 0.1);
const G_ROT = 0.62;
const B_ROT = -0.62;

/** A point in a figure's local space, expressed in the couple's space. */
const local = (pos: THREE.Vector3, rotY: number, x: number, y: number, z: number) =>
  new THREE.Vector3(x, y, z).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY).add(pos);

type GarlandPath = { held: THREE.Vector3; over: THREE.Vector3; worn: THREE.Vector3; fromRot: number; toRot: number };

/** held (in holder's hands) → arc over the receiver's head → resting on the neck */
function garlandAt(path: GarlandPath, p: number, out: THREE.Vector3) {
  if (p < 0.55) {
    const k = p / 0.55;
    out.lerpVectors(path.held, path.over, k);
    out.y += Math.sin(k * Math.PI) * 0.25;
  } else {
    out.lerpVectors(path.over, path.worn, THREE.MathUtils.smoothstep(p, 0.55, 1));
  }
  return out;
}

function Stage({ start, high }: { start: boolean; high: boolean }) {
  const root = useRef<THREE.Group>(null);
  const gRig = useRef<Rig | null>(null);
  const bRig = useRef<Rig | null>(null);
  const brideGarland = useRef<THREE.Group>(null); // given by the bride → groom
  const groomGarland = useRef<THREE.Group>(null); // given by the groom → bride
  const prog = useRef({ b: 0, g: 0 });
  const burst = useRef<THREE.Group>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const { camera, viewport } = useThree();
  const wide = viewport.aspect > 1.1;
  const floor = useMemo(() => rangoliTexture(1024), []);

  const paths = useMemo(() => {
    const bridesGift: GarlandPath = {
      held: local(B_POS, B_ROT, 0, 1.05, 0.42),
      over: local(G_POS, G_ROT, 0, 2.15, 0.05),
      worn: local(G_POS, G_ROT, 0, 1.6, 0),
      fromRot: B_ROT + Math.PI,
      toRot: G_ROT,
    };
    const groomsGift: GarlandPath = {
      held: local(G_POS, G_ROT, 0, 1.1, 0.44),
      over: local(B_POS, B_ROT, 0, 2.05, 0.05),
      worn: local(B_POS, B_ROT, 0, 1.53, 0),
      fromRot: G_ROT + Math.PI,
      toRot: B_ROT,
    };
    return { bridesGift, groomsGift };
  }, []);

  const curtainTops = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let x = -2.6; x <= 2.6; x += high ? 0.16 : 0.24) out.push(new THREE.Vector3(x, 3.5, -1.3 - Math.abs(x) * 0.08));
    return out;
  }, [high]);

  const halo = useMemo(() => {
    const n = 90;
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.06, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), n);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o.position.set(Math.cos(a) * 1.55, 1.75 + Math.sin(a) * 1.55, -0.9);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(i % 5 === 0 ? "#B3001B" : i % 2 ? "#F7A70F" : "#FFF3DE"));
    }
    return m;
  }, []);

  useEffect(() => {
    camera.position.set(0, 1.7, wide ? 7.2 : 9.6);
    // portrait: look higher so the couple sit in the lower half, below the names
    camera.lookAt(wide ? -1.5 : 0, wide ? 1.2 : 2.9, 0);
  }, [camera, wide]);

  // Entrance + the garland exchange.
  useEffect(() => {
    if (!start || !root.current) return;
    const tl = gsap.timeline();
    tl.fromTo(root.current.position, { y: -0.6 }, { y: 0, duration: 1.6, ease: "expo.out" })
      .fromTo(root.current.scale, { x: 0.85, y: 0.85, z: 0.85 }, { x: 1, y: 1, z: 1, duration: 1.6, ease: "expo.out" }, "<")
      .to(prog.current, { b: 1, duration: 2, ease: "power1.inOut" }, "+=0.2")
      .add(() => burst.current && gsap.fromTo(burst.current.scale, { x: 0.2, y: 0.2, z: 0.2 }, { x: 1.4, y: 1.4, z: 1.4, duration: 1.2 }))
      .to(prog.current, { g: 1, duration: 2, ease: "power1.inOut" }, "+=0.35");
    return () => {
      tl.kill();
    };
  }, [start]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const { b, g } = prog.current;

    // garlands follow their paths
    if (brideGarland.current) {
      brideGarland.current.position.copy(garlandAt(paths.bridesGift, b, tmp));
      brideGarland.current.rotation.y = THREE.MathUtils.lerp(paths.bridesGift.fromRot, paths.bridesGift.toRot, THREE.MathUtils.smoothstep(b, 0.3, 0.9));
    }
    if (groomGarland.current) {
      groomGarland.current.position.copy(garlandAt(paths.groomsGift, g, tmp));
      groomGarland.current.rotation.y = THREE.MathUtils.lerp(paths.groomsGift.fromRot, paths.groomsGift.toRot, THREE.MathUtils.smoothstep(g, 0.3, 0.9));
    }

    // arms: holding forward → raised high while placing → relaxed
    const lift = (p: number) => (p <= 0 ? 0 : p >= 1 ? -1 : Math.sin(Math.min(1, p / 0.7) * Math.PI));
    const pose = (r: Rig | null, p: number) => {
      if (!r) return;
      const done = p >= 0.98;
      const up = lift(p);
      const armX = done ? 0.05 : -0.65 - Math.max(0, up) * 1.15;
      const elbow = done ? -0.25 : -0.9 + Math.max(0, up) * 0.6;
      r.leftArm.rotation.set(armX, 0, done ? -0.12 : 0.28);
      r.rightArm.rotation.set(armX, 0, done ? 0.12 : -0.28);
      r.leftElbow.rotation.x = elbow;
      r.rightElbow.rotation.x = elbow;
    };
    pose(bRig.current, b);
    pose(gRig.current, g > 0 ? g : b >= 1 ? 0 : 0.0001);
    if (bRig.current?.skirt) bRig.current.skirt.rotation.y = Math.sin(t * 1.1) * 0.05;

    if (root.current) {
      const tx = tilt.active ? tilt.x : state.pointer.x;
      const ty = tilt.active ? -tilt.y : state.pointer.y;
      const k = 1 - Math.exp(-Math.min(delta, 0.05) * 2.5);
      root.current.rotation.y += (tx * 0.3 - root.current.rotation.y) * k;
      root.current.rotation.x += (ty * 0.05 - root.current.rotation.x) * k;
    }
  });

  return (
    <group ref={root}>
      {/* round stage with a rangoli */}
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[2.3, 2.4, 0.24, 64]} />
        <meshStandardMaterial color="#FFF3DE" roughness={0.6} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <circleGeometry args={[2.25, 64]} />
        <meshStandardMaterial map={floor} roughness={0.8} />
      </mesh>
      <mesh material={MAT.gold} position={[0, -0.02, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[2.32, 0.03, 8, 96]} />
      </mesh>

      {/* backdrop: golden halo ringed with flowers + marigold curtain */}
      <mesh material={MAT.gold} position={[0, 1.75, -0.95]}>
        <torusGeometry args={[1.55, 0.035, 10, 96]} />
      </mesh>
      <primitive object={halo} />
      <MarigoldStrands tops={curtainTops} length={3.4} spacing={0.075} />

      {/* tall brass diya stands */}
      {[-1.9, 1.9].map((x) => (
        <group key={x} position={[x, 0, 0.3]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.03, 0.06, 1.2, 12]} />
            <meshStandardMaterial color="#C9A23A" metalness={1} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.2, 0.24, 0.06, 20]} />
            <meshStandardMaterial color="#C9A23A" metalness={1} roughness={0.3} />
          </mesh>
          <Diya position={[-0.06, 1.2, 0]} scale={1.4} light={high} />
        </group>
      ))}

      <Groom rig={gRig} position={G_POS} rotation-y={G_ROT} />
      <Bride rig={bRig} position={B_POS} rotation-y={B_ROT} />
      <group ref={brideGarland}>
        <Varmala />
      </group>
      <group ref={groomGarland}>
        <Varmala scale={0.92} />
      </group>

      <group ref={burst} position={[-0.3, 1.8, 0]} scale={0.2}>
        <Sparkles count={high ? 40 : 18} scale={[1.4, 1.2, 1]} size={5} speed={0.8} color="#FFD27A" />
      </group>
    </group>
  );
}

export default function VarmalaScene({ start, high, fallback }: { start: boolean; high: boolean; fallback?: React.ReactNode }) {
  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 1.7, 9.6], fov: 38 }} fallback={fallback}>
      <ambientLight intensity={0.55} />
      <spotLight position={[1, 8, 6]} angle={0.45} penumbra={0.9} intensity={120} color="#FFE8C2" />
      <pointLight position={[-4, 2, 2]} intensity={14} color="#FF8A2B" distance={12} />
      <pointLight position={[4, 2, 3]} intensity={8} color="#E94C89" distance={12} />
      <WarmEnvironment resolution={high ? 128 : 64} />
      <Stage start={start} high={high} />
      <PetalShower count={high ? 110 : 45} area={[9, 6, 5]} y={2.4} />
    </SceneCanvas>
  );
}
