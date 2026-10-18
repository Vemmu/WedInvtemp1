"use client";

/**
 * Procedural 3D Hindu bride & groom (smooth, faceless figurine style).
 *   Groom: ivory-gold sherwani, churidar, mojari, saffron safa with kalgi, maroon stole.
 *   Bride: red lehenga with gold buti & border, choli, ghoonghat dupatta, maang tikka,
 *          nath, jhumkas, rani haar, chooda bangles, mehendi hands, gajra bun.
 * Plus the marigold varmala they exchange.
 *
 * Each figure exposes a small rig (arms, elbows, body) via the `rig` prop.
 * Units: metres, origin at the feet, facing +Z.
 */

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

type GroupProps = ThreeElements["group"];

export type Rig = {
  body: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftElbow: THREE.Group;
  rightElbow: THREE.Group;
  /** bride only: the lehenga skirt, swayed while walking */
  skirt?: THREE.Group;
};

/* ------------------------------- materials ------------------------------- */
export const MAT = {
  skin: new THREE.MeshStandardMaterial({ color: "#C68B67", roughness: 0.55 }),
  mehendi: new THREE.MeshStandardMaterial({ color: "#A65A2E", roughness: 0.6 }),
  hair: new THREE.MeshStandardMaterial({ color: "#1C120C", roughness: 0.45 }),
  sherwani: new THREE.MeshPhysicalMaterial({ color: "#F1E2C0", roughness: 0.5, sheen: 0.8, sheenColor: new THREE.Color("#FFF3D6") }),
  churidar: new THREE.MeshStandardMaterial({ color: "#F7EFDD", roughness: 0.65 }),
  safa: new THREE.MeshPhysicalMaterial({ color: "#E0561B", roughness: 0.55, sheen: 0.7, sheenColor: new THREE.Color("#FFB36B") }),
  stole: new THREE.MeshStandardMaterial({ color: "#8F0E21", roughness: 0.6, side: THREE.DoubleSide }),
  lehenga: new THREE.MeshPhysicalMaterial({ color: "#B3001B", roughness: 0.5, sheen: 1, sheenColor: new THREE.Color("#FF6A6A") }),
  choli: new THREE.MeshStandardMaterial({ color: "#8F0E21", roughness: 0.5 }),
  dupatta: new THREE.MeshPhysicalMaterial({ color: "#E8402A", roughness: 0.4, transparent: true, opacity: 0.62, side: THREE.DoubleSide, depthWrite: false }),
  gold: new THREE.MeshStandardMaterial({ color: "#D4AF37", metalness: 1, roughness: 0.22 }),
  pearl: new THREE.MeshStandardMaterial({ color: "#FFF8EE", roughness: 0.3 }),
  red: new THREE.MeshStandardMaterial({ color: "#C8102E", roughness: 0.35 }),
  white: new THREE.MeshStandardMaterial({ color: "#FFFFFF", roughness: 0.4 }),
  feather: new THREE.MeshStandardMaterial({ color: "#FFFDF6", roughness: 0.8 }),
};

const capsule = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 6, 14);

/* --------------------------------- arm ---------------------------------- */
function Arm({
  side,
  sleeve,
  thickness = 1,
  hand = MAT.skin,
  bangles,
  shoulderRef,
  elbowRef,
}: {
  side: 1 | -1;
  sleeve: THREE.Material;
  thickness?: number;
  hand?: THREE.Material;
  bangles?: boolean;
  shoulderRef: (g: THREE.Group | null) => void;
  elbowRef: (g: THREE.Group | null) => void;
}) {
  const upper = useMemo(() => capsule(0.058 * thickness, 0.28), [thickness]);
  const fore = useMemo(() => capsule(0.05 * thickness, 0.24), [thickness]);
  return (
    <group ref={shoulderRef} rotation-z={side * 0.12}>
      <mesh geometry={upper} material={sleeve} position={[0, -0.19, 0]} />
      <group ref={elbowRef} position={[0, -0.38, 0]}>
        <mesh geometry={fore} material={bangles ? MAT.skin : sleeve} position={[0, -0.16, 0]} />
        {/* gold cuff (groom) or red-white chooda (bride) */}
        {bangles
          ? Array.from({ length: 7 }).map((_, i) => (
              <mesh key={i} material={i % 3 === 2 ? MAT.white : i % 3 === 1 ? MAT.gold : MAT.red} position={[0, -0.22 - i * 0.018, 0]} rotation-x={Math.PI / 2}>
                <torusGeometry args={[0.047 * thickness, 0.009, 6, 20]} />
              </mesh>
            ))
          : (
              <mesh material={MAT.gold} position={[0, -0.3, 0]} rotation-x={Math.PI / 2}>
                <torusGeometry args={[0.052, 0.012, 6, 20]} />
              </mesh>
            )}
        <mesh material={hand} position={[0, -0.36, 0]} scale={[1, 1.25, 0.8]}>
          <sphereGeometry args={[0.05, 14, 10]} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------- varmala -------------------------------- */
/**
 * Marigold garland: a closed loop of orange & yellow blooms (one instanced mesh).
 * Shaped to hang around a neck: the loop passes behind the neck and dips in front.
 */
export function Varmala({ blooms = 64, scale = 1, ...props }: GroupProps & { blooms?: number }) {
  const mesh = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        [0, 0.02, -0.11],
        [0.13, 0, -0.06],
        [0.17, -0.06, 0.04],
        [0.13, -0.22, 0.13],
        [0, -0.34, 0.17],
        [-0.13, -0.22, 0.13],
        [-0.17, -0.06, 0.04],
        [-0.13, 0, -0.06],
      ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      true
    );
    const m = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.03, 1), new THREE.MeshStandardMaterial({ roughness: 0.6 }), blooms);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < blooms; i++) {
      o.position.copy(curve.getPointAt(i / blooms));
      o.rotation.set(i, i * 0.7, 0);
      o.scale.setScalar(i % 9 === 0 ? 0.75 : 1); // little pearl/rose spacers
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
      m.setColorAt(i, c.set(i % 9 === 0 ? "#B3001B" : i % 2 ? "#F7A70F" : "#F28C0F"));
    }
    return m;
  }, [blooms]);
  useEffect(() => () => mesh.geometry.dispose(), [mesh]);
  return (
    <group {...props} scale={scale}>
      <primitive object={mesh} />
    </group>
  );
}

/* --------------------------------- groom --------------------------------- */
export function Groom({ rig, garland = false, children, ...props }: GroupProps & { rig?: React.MutableRefObject<Rig | null>; garland?: boolean }) {
  const r = useRef<Partial<Rig>>({});
  const set = (k: keyof Rig) => (g: THREE.Group | null) => {
    if (g) r.current[k] = g;
  };
  useEffect(() => {
    if (rig) rig.current = r.current as Rig;
  });

  const geo = useMemo(() => {
    // knee-length sherwani, shoulders → knee, flaring slightly
    const coat = new THREE.LatheGeometry(
      [
        [0.1, 1.6],
        [0.2, 1.52],
        [0.215, 1.35],
        [0.19, 1.12],
        [0.2, 0.95],
        [0.235, 0.7],
        [0.25, 0.56],
        [0.0, 0.56],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      40
    );
    return { coat, leg: capsule(0.068, 0.42) };
  }, []);

  return (
    <group {...props}>
      <group ref={set("body")}>
        {/* churidar legs + mojari */}
        {([-1, 1] as const).map((s) => (
          <group key={s} position={[s * 0.09, 0, 0]}>
            <mesh geometry={geo.leg} material={MAT.churidar} position={[0, 0.33, 0]} />
            <mesh material={MAT.gold} position={[0, 0.03, 0.045]} scale={[1, 0.6, 1.8]}>
              <sphereGeometry args={[0.065, 14, 10]} />
            </mesh>
            {/* curled mojari tip */}
            <mesh material={MAT.gold} position={[0, 0.06, 0.16]} rotation-x={-0.8}>
              <coneGeometry args={[0.02, 0.07, 8]} />
            </mesh>
          </group>
        ))}
        <mesh geometry={geo.coat} material={MAT.sherwani} />
        {/* gold borders: hem, waist band, placket buttons */}
        <mesh material={MAT.gold} position={[0, 0.575, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.25, 0.012, 8, 48]} />
        </mesh>
        <mesh material={MAT.gold} position={[0, 0.66, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.243, 0.006, 8, 48]} />
        </mesh>
        {[1.45, 1.36, 1.27, 1.18, 1.09].map((y) => (
          <mesh key={y} material={MAT.gold} position={[0, y, 0.2]}>
            <sphereGeometry args={[0.013, 8, 6]} />
          </mesh>
        ))}
        {/* nehru collar */}
        <mesh material={MAT.gold} position={[0, 1.58, 0]}>
          <cylinderGeometry args={[0.075, 0.09, 0.05, 20, 1, true]} />
        </mesh>
        {/* maroon stole draped over one shoulder, across the chest */}
        <mesh material={MAT.stole} position={[0.02, 1.3, 0.205]} rotation={[0.08, 0, 0.75]}>
          <boxGeometry args={[0.07, 0.4, 0.015]} />
        </mesh>

        <group position={[-0.25, 1.48, 0]}>
          <Arm side={-1} sleeve={MAT.sherwani} shoulderRef={set("leftArm")} elbowRef={set("leftElbow")} />
        </group>
        <group position={[0.25, 1.48, 0]}>
          <Arm side={1} sleeve={MAT.sherwani} shoulderRef={set("rightArm")} elbowRef={set("rightElbow")} />
        </group>

        {/* head + safa */}
        <group position={[0, 1.77, 0]}>
          <mesh material={MAT.skin} position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.05, 0.055, 0.1, 12]} />
          </mesh>
          <mesh material={MAT.skin} scale={[1, 1.12, 1]}>
            <sphereGeometry args={[0.13, 28, 20]} />
          </mesh>
          {/* turban: wrapped bands + crown + kalgi */}
          {[0.04, 0.085, 0.125].map((y, i) => (
            <mesh key={y} material={MAT.safa} position={[0, y, -0.01]} rotation={[Math.PI / 2 + 0.12, 0, 0]}>
              <torusGeometry args={[0.13 - i * 0.012, 0.045, 12, 32]} />
            </mesh>
          ))}
          <mesh material={MAT.safa} position={[0, 0.12, -0.015]} scale={[1, 0.7, 1]}>
            <sphereGeometry args={[0.13, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          </mesh>
          <mesh material={MAT.gold} position={[0, 0.085, 0.14]}>
            <torusGeometry args={[0.03, 0.01, 8, 20]} />
          </mesh>
          <mesh material={MAT.red} position={[0, 0.085, 0.145]}>
            <sphereGeometry args={[0.018, 10, 8]} />
          </mesh>
          <mesh material={MAT.feather} position={[0.02, 0.2, 0.11]} rotation={[0.25, 0, -0.25]}>
            <coneGeometry args={[0.018, 0.2, 8]} />
          </mesh>
          {/* turban tail falling at the back */}
          <mesh material={MAT.safa} position={[0, -0.08, -0.15]} rotation-x={0.12}>
            <boxGeometry args={[0.12, 0.3, 0.02]} />
          </mesh>
        </group>

        {garland && <Varmala position={[0, 1.6, 0]} />}
        {children}
      </group>
    </group>
  );
}

/* --------------------------------- bride --------------------------------- */
export function Bride({ rig, garland = false, children, ...props }: GroupProps & { rig?: React.MutableRefObject<Rig | null>; garland?: boolean }) {
  const r = useRef<Partial<Rig>>({});
  const set = (k: keyof Rig) => (g: THREE.Group | null) => {
    if (g) r.current[k] = g;
  };
  useEffect(() => {
    if (rig) rig.current = r.current as Rig;
  });

  const geo = useMemo(() => {
    // full A-line lehenga, waist → floor
    const pts = [
      [0, 0],
      [0.62, 0],
      [0.6, 0.05],
      [0.52, 0.28],
      [0.4, 0.55],
      [0.28, 0.8],
      [0.19, 0.98],
      [0.15, 1.06],
    ];
    const skirt = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 56);
    // ghoonghat dupatta: from over the head down the back to the waist
    const dupatta = new THREE.LatheGeometry(
      [
        [0.02, 1.86],
        [0.12, 1.83],
        [0.17, 1.72],
        [0.2, 1.55],
        [0.27, 1.32],
        [0.33, 1.1],
        [0.4, 0.8],
      ].map(([x, y]) => new THREE.Vector2(x, y)),
      36,
      Math.PI * 0.62,
      Math.PI * 0.76
    );
    // gold buti scattered over the skirt surface
    const curve = new THREE.SplineCurve(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
    const buti: THREE.Matrix4[] = [];
    for (let i = 0; i < 140; i++) {
      const p = curve.getPoint(0.08 + ((i * 0.618) % 0.85));
      const a = i * 2.39996;
      buti.push(new THREE.Matrix4().makeTranslation(Math.sin(a) * (p.x + 0.004), p.y, Math.cos(a) * (p.x + 0.004)));
    }
    return { skirt, dupatta, buti, choli: capsule(0.14, 0.12) };
  }, []);

  const butiMesh = useMemo(() => {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 6, 4), MAT.gold, geo.buti.length);
    geo.buti.forEach((mat, i) => m.setMatrixAt(i, mat));
    return m;
  }, [geo]);

  return (
    <group {...props}>
      <group ref={set("body")}>
        <group ref={set("skirt")}>
          <mesh geometry={geo.skirt} material={MAT.lehenga} />
          <primitive object={butiMesh} />
          {/* broad zari border near the hem */}
          {[0.03, 0.09, 0.15].map((y, i) => (
            <mesh key={y} material={MAT.gold} position={[0, y, 0]} rotation-x={Math.PI / 2}>
              <torusGeometry args={[0.6 - i * 0.032, i === 1 ? 0.018 : 0.009, 8, 64]} />
            </mesh>
          ))}
          <mesh material={MAT.gold} position={[0, 1.04, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.155, 0.012, 8, 40]} />
          </mesh>
        </group>
        {/* bare midriff + choli */}
        <mesh material={MAT.skin} position={[0, 1.13, 0]}>
          <cylinderGeometry args={[0.125, 0.15, 0.12, 24]} />
        </mesh>
        <mesh geometry={geo.choli} material={MAT.choli} position={[0, 1.33, 0]} scale={[1.05, 1, 0.8]} />
        <mesh material={MAT.skin} position={[0, 1.47, 0]} scale={[1.4, 0.38, 0.8]}>
          <sphereGeometry args={[0.13, 20, 12]} />
        </mesh>
        {/* rani haar necklace */}
        <mesh material={MAT.gold} position={[0, 1.44, 0.04]} rotation-x={Math.PI / 2 - 0.5}>
          <torusGeometry args={[0.1, 0.014, 8, 32]} />
        </mesh>
        <mesh material={MAT.red} position={[0, 1.37, 0.115]}>
          <sphereGeometry args={[0.022, 10, 8]} />
        </mesh>

        <group position={[-0.2, 1.46, 0]}>
          <Arm side={-1} sleeve={MAT.skin} thickness={0.78} hand={MAT.mehendi} bangles shoulderRef={set("leftArm")} elbowRef={set("leftElbow")} />
        </group>
        <group position={[0.2, 1.46, 0]}>
          <Arm side={1} sleeve={MAT.skin} thickness={0.78} hand={MAT.mehendi} bangles shoulderRef={set("rightArm")} elbowRef={set("rightElbow")} />
        </group>

        {/* head, jewellery, hair */}
        <group position={[0, 1.7, 0]}>
          <mesh material={MAT.skin} position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.048, 0.052, 0.1, 12]} />
          </mesh>
          <mesh material={MAT.skin} scale={[1, 1.12, 1]}>
            <sphereGeometry args={[0.125, 28, 20]} />
          </mesh>
          <mesh material={MAT.hair} position={[0, 0.02, -0.015]} rotation-x={-0.6} scale={[1.06, 1.08, 1.08]}>
            <sphereGeometry args={[0.125, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
          {/* bun + gajra */}
          <mesh material={MAT.hair} position={[0, -0.03, -0.13]}>
            <sphereGeometry args={[0.068, 18, 14]} />
          </mesh>
          <mesh material={MAT.white} position={[0, -0.03, -0.13]} rotation-x={0.3}>
            <torusGeometry args={[0.07, 0.014, 6, 24]} />
          </mesh>
          {/* maang tikka */}
          <mesh material={MAT.gold} position={[0, 0.1, 0.1]} rotation-x={-0.5}>
            <cylinderGeometry args={[0.004, 0.004, 0.08, 6]} />
          </mesh>
          <mesh material={MAT.gold} position={[0, 0.06, 0.122]}>
            <sphereGeometry args={[0.02, 10, 8]} />
          </mesh>
          {/* nath (nose ring) + jhumkas */}
          <mesh material={MAT.gold} position={[0.03, -0.035, 0.122]} rotation-y={0.4}>
            <torusGeometry args={[0.025, 0.004, 6, 20]} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} material={MAT.gold} position={[s * 0.128, -0.06, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.022, 0.04, 10]} />
            </mesh>
          ))}
        </group>
        <mesh geometry={geo.dupatta} material={MAT.dupatta} />

        {garland && <Varmala position={[0, 1.53, 0]} scale={0.92} />}
        {children}
      </group>
    </group>
  );
}
