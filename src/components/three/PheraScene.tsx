"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "./SceneCanvas";
import { Bride, Groom, type Rig } from "./figures";
import { AgniKund, Diya, Mandap, PetalShower, WarmEnvironment, rangoliTexture } from "./props";
import { useExperience } from "@/components/providers/ExperienceProvider";

/**
 * Saat Phere, driven by scroll progress (0 → 1):
 *   0.04–0.92  seven rounds clockwise around the sacred fire, keeping it on the right.
 *              The bride leads the first rounds; the groom leads from the fourth.
 *              They are tied together by the gathbandhan (a saffron cloth knot).
 *   0.92–1.00  they stop and turn to bless the guests; petals shower down.
 */

export const PHERA_START = 0.04;
export const PHERA_END = 0.92;
const R = 1.05;
const seg = (p: number, a: number, b: number) => THREE.MathUtils.clamp((p - a) / (b - a), 0, 1);
const smooth = (t: number) => t * t * (3 - 2 * t);
/** Interpolate angles the short way round (avoids spinning through many turns). */
const lerpAngle = (from: number, to: number, t: number) => {
  const d = Math.atan2(Math.sin(to - from), Math.cos(to - from));
  return from + d * t;
};

function Ceremony({ progress, high }: { progress: React.MutableRefObject<number>; high: boolean }) {
  const groom = useRef<THREE.Group>(null);
  const bride = useRef<THREE.Group>(null);
  const gRig = useRef<Rig | null>(null);
  const bRig = useRef<Rig | null>(null);
  const knot = useRef<THREE.Mesh>(null);
  const p = useRef(0);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const look = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);
  const front = useMemo(() => new THREE.Vector3(), []);
  const knotMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#F7C71C", roughness: 0.6 }), []);

  useEffect(() => () => knot.current?.geometry.dispose(), []);

  const place = (g: THREE.Group, rig: Rig | null, theta: number, walking: boolean, phase: number, face: number) => {
    // position on the circle; facing = direction of travel (θ increasing keeps the fire on the right)
    g.position.set(Math.cos(theta) * R, walking ? Math.abs(Math.sin(phase)) * 0.02 : 0, Math.sin(theta) * R);
    const travel = -theta;
    const outward = Math.atan2(Math.cos(theta), Math.sin(theta)); // face away from the fire, toward guests
    g.rotation.y = lerpAngle(travel, outward, face);
    if (rig) {
      // hands folded in front (namaste) while walking
      rig.leftArm.rotation.set(-0.45, 0, 0.42);
      rig.rightArm.rotation.set(-0.45, 0, -0.42);
      rig.leftElbow.rotation.x = -1.35;
      rig.rightElbow.rotation.x = -1.35;
      if (rig.skirt) rig.skirt.rotation.x = walking ? Math.sin(phase) * 0.03 : 0;
    }
  };

  useFrame(({ camera, clock, viewport }, delta) => {
    p.current += (progress.current - p.current) * (1 - Math.exp(-delta * 4));
    const pr = p.current;
    const walk = seg(pr, PHERA_START, PHERA_END);
    const face = smooth(seg(pr, PHERA_END, 0.98));
    const base = Math.PI / 2 + walk * Math.PI * 2 * 7; // start (and finish) in front of the fire, facing the guests' side
    // the bride leads rounds 1–3, the groom leads from round 4
    const lead = THREE.MathUtils.lerp(0.55, -0.55, smooth(seg(walk * 7, 3, 3.6)));
    const walking = walk > 0 && walk < 1;
    const phase = walk * 7 * 28;

    if (groom.current && bride.current) {
      // whoever leads walks |lead| radians ahead; at the end they stand side by side
      // (groom on the guests' left, bride on the right)
      const gTheta = base + Math.max(-lead, 0) * (1 - face) + 0.32 * face;
      const bTheta = base + Math.max(lead, 0) * (1 - face) - 0.32 * face;
      place(groom.current, gRig.current, gTheta, walking, phase, face);
      place(bride.current, bRig.current, bTheta, walking, phase + 1.2, face);

      // gathbandhan: groom's stole tip → sagging knot → bride's dupatta corner
      groom.current.localToWorld(a.set(0.12, 1.02, 0.18));
      bride.current.localToWorld(b.set(-0.18, 1.0, -0.05));
      mid.lerpVectors(a, b, 0.5).y -= 0.22;
      const curve = new THREE.CatmullRomCurve3([a.clone(), mid.clone(), b.clone()]);
      if (knot.current) {
        knot.current.geometry.dispose();
        knot.current.geometry = new THREE.TubeGeometry(curve, 18, 0.014, 5, false);
      }
    }

    /* camera: slow orbit above the mandap; pull back on portrait screens */
    const dist = 6.4 + Math.max(0, 1 - viewport.aspect) * 5.5;
    const orbit = 0.35 + pr * 1.6 + Math.sin(clock.elapsedTime * 0.1) * 0.05;
    const end = face;
    camera.position.set(Math.sin(orbit) * dist, 3.2, Math.cos(orbit) * dist);
    // at the finale, swing round to face the couple from the front
    if (end > 0) camera.position.lerp(front.set(0, 1.9, dist * 0.8), end);
    look.set(0, 0.9 + end * 0.15, 0);
    camera.lookAt(look);
  });

  return (
    <>
      <group ref={groom}>
        <Groom rig={gRig} garland />
      </group>
      <group ref={bride}>
        <Bride rig={bRig} garland />
      </group>
      <mesh ref={knot} material={knotMat}>
        <bufferGeometry />
      </mesh>
    </>
  );
}

function Finale({ progress, high }: { progress: React.MutableRefObject<number>; high: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.visible = progress.current > PHERA_END;
  });
  return (
    <group ref={ref} visible={false}>
      <PetalShower count={high ? 120 : 50} area={[6, 5, 6]} y={2.2} />
    </group>
  );
}

export default function PheraScene({ progress, fallback }: { progress: React.MutableRefObject<number>; fallback?: React.ReactNode }) {
  const { quality } = useExperience();
  const high = quality === "high";
  const floor = useMemo(() => (typeof document !== "undefined" ? rangoliTexture(1024) : null), []);

  return (
    <SceneCanvas className="absolute inset-0" camera={{ position: [0, 3.2, 6.4], fov: 42 }} fallback={fallback}>
      <color attach="background" args={["#1A0A08"]} />
      <fog attach="fog" args={["#1A0A08", 8, 20]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#FFD8A8", "#3D040C", 0.45]} />
      <spotLight position={[0, 8, 2]} angle={0.55} penumbra={0.9} intensity={70} color="#FFE2B8" />
      <WarmEnvironment resolution={high ? 128 : 64} />

      {/* platform with rangoli */}
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[4.4, 0.2, 3.8]} />
        <meshStandardMaterial color="#F6E7CC" roughness={0.7} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshStandardMaterial map={floor ?? undefined} roughness={0.85} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.199, 0]}>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#2A120C" roughness={1} />
      </mesh>

      <Mandap w={3.8} d={3.2} h={2.7} high={high} />
      <AgniKund />
      <Sparkles count={high ? 50 : 20} scale={[0.8, 1.6, 0.8]} position={[0, 1, 0]} size={4} speed={1.4} color="#FFB45C" />
      {/* diyas lining the platform edge */}
      {Array.from({ length: high ? 14 : 8 }).map((_, i, arr) => {
        const t = (i / arr.length) * Math.PI * 2;
        return <Diya key={i} position={[Math.cos(t) * 1.75, 0, Math.sin(t) * 1.55]} scale={1.2} />;
      })}

      <Ceremony progress={progress} high={high} />
      <Finale progress={progress} high={high} />
    </SceneCanvas>
  );
}
