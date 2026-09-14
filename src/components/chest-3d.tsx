"use client";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import type { Rarity, TierId } from "@/lib/types";

export type ChestStage =
  | "locked"
  | "ready"
  | "lifting"
  | "reveal1"
  | "reveal2"
  | "revealed";

const OPEN_STAGES: ChestStage[] = ["lifting", "reveal1", "reveal2", "revealed"];

const TIER_STYLE: Record<
  TierId,
  { wood: string; trim: string; glow: string; label: string }
> = {
  regular: { wood: "#6d4b2c", trim: "#a98a4f", glow: "#e9b44c", label: "Regular Vessel" },
  medium: { wood: "#4a2f1b", trim: "#e9b44c", glow: "#fbbf24", label: "Medium Chest" },
  premium: { wood: "#2b2138", trim: "#d4af37", glow: "#e879f9", label: "Premium Casket" },
};

const RARITY_COLOR: Record<Rarity, string> = {
  common: "#94a3b8",
  rare: "#38bdf8",
  epic: "#a855f7",
  legendary: "#f59e0b",
  ultrarare: "#ec4899",
};

const OPEN_ANGLE = 1.92; // ~110deg, past vertical leaning back

function setCursor(pointer: boolean) {
  if (typeof document !== "undefined") {
    document.body.style.cursor = pointer ? "pointer" : "";
  }
}

function EmojiSprite({ emoji }: { emoji: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "200px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, 128, 140);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [emoji]);

  return (
    <sprite scale={[1.15, 1.15, 1]} position={[0, 1.15, 0]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function BurstParticles({ color, openRef }: { color: string; openRef: React.MutableRefObject<number> }) {
  const COUNT = 110;
  const ref = useRef<THREE.Points>(null);
  const { positions, speeds } = useMemo(() => {
    // Deterministic seeded PRNG so initial particle layout is stable across renders.
    let seed = 1337;
    const rand = () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
      return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
    };
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = 0.3 + rand() * 1.3;
      const a = rand() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = 0.9 + rand() * 0.4;
      positions[i * 3 + 2] = Math.sin(a) * r;
      speeds[i] = 0.5 + rand() * 1.4;
    }
    return { positions, speeds };
  }, []);

  useFrame((state, delta) => {
    const pts = ref.current;
    if (!pts) return;
    const open = openRef.current;
    const pos = pts.geometry.attributes.position as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speeds[i] * delta * (0.25 + open);
      if (arr[i * 3 + 1] > 4.4) {
        const r = 0.3 + Math.random() * 1.3;
        const a = Math.random() * Math.PI * 2;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = 0.9;
        arr[i * 3 + 2] = Math.sin(a) * r;
      }
    }
    pos.needsUpdate = true;
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = open * 0.95;
    pts.rotation.y = state.clock.elapsedTime * 0.25;
    pts.visible = open > 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={color}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ChestScene({
  stage,
  locks,
  tier,
  rarity,
  prizeEmoji,
  onPickLock,
  onOpen,
}: {
  stage: ChestStage;
  locks: boolean[];
  tier: TierId;
  rarity: Rarity;
  prizeEmoji: string | null;
  onPickLock: (i: number) => void;
  onOpen: () => void;
}) {
  const style = TIER_STYLE[tier];
  const accent = RARITY_COLOR[rarity] ?? style.glow;

  const chest = useRef<THREE.Group>(null);
  const lid = useRef<THREE.Group>(null);
  const prize = useRef<THREE.Group>(null);
  const gem = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const glowPlane = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);
  const mouthLight = useRef<THREE.PointLight>(null);
  const prizeLight = useRef<THREE.PointLight>(null);
  const open = useRef(0);

  const target = OPEN_STAGES.includes(stage) ? 1 : 0;
  const lidInteraction = stage === "ready";

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    open.current = THREE.MathUtils.damp(open.current, target, 3.4, delta);
    const o = open.current;

    if (chest.current) {
      chest.current.position.y = Math.sin(t * 1.15) * 0.07;
    }
    if (lid.current) {
      lid.current.rotation.x = -o * OPEN_ANGLE;
    }
    if (glowPlane.current) {
      const m = glowPlane.current.material as THREE.MeshBasicMaterial;
      m.opacity = o * 0.95;
    }
    if (beam.current) {
      const m = beam.current.material as THREE.MeshBasicMaterial;
      m.opacity = o * 0.3;
      beam.current.scale.set(0.6 + o * 0.4, 1, 0.6 + o * 0.4);
    }
    if (mouthLight.current) mouthLight.current.intensity = 0.3 + o * 9;
    if (prizeLight.current) prizeLight.current.intensity = o * 6;
    if (prize.current) {
      prize.current.position.y = 0.75 + o * 1.85 + Math.sin(t * 2) * 0.12 * o;
      prize.current.scale.setScalar(Math.max(0.001, o));
      prize.current.rotation.y = t * (0.4 + o * 0.7);
    }
    if (gem.current) gem.current.rotation.y = t * 1.4;
    if (ring.current) {
      ring.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.9) * 0.18;
      ring.current.rotation.z = t * 0.7;
    }
  });

  const handleLockClick = (i: number) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!locks[i] && stage === "locked") onPickLock(i);
  };

  const handleChestClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (lidInteraction) onOpen();
  };

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#ffe9c4" castShadow />
      <directionalLight position={[-5, 3, -3]} intensity={0.35} color="#8ea2ff" />
      <spotLight
        position={[0, 7, 2]}
        angle={0.5}
        penumbra={0.7}
        intensity={60}
        color={style.glow}
        distance={20}
      />

      <group ref={chest} position={[0, 0.15, 0]}>
        {/* ---- base ---- */}
        <mesh castShadow receiveShadow onClick={handleChestClick}>
          <boxGeometry args={[3.2, 1.6, 2.1]} />
          <meshStandardMaterial color={style.wood} roughness={0.62} metalness={0.22} />
        </mesh>

        {/* plank grooves */}
        {[-0.45, 0.1, 0.55].map((y) => (
          <mesh key={y} position={[0, y, 1.055]}>
            <boxGeometry args={[3.18, 0.035, 0.012]} />
            <meshStandardMaterial color="#000000" roughness={1} transparent opacity={0.35} />
          </mesh>
        ))}

        {/* gold rims */}
        <mesh position={[0, 0.76, 1.02]}>
          <boxGeometry args={[3.26, 0.1, 0.1]} />
          <meshStandardMaterial color={style.trim} metalness={0.95} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.76, 1.02]}>
          <boxGeometry args={[3.26, 0.1, 0.1]} />
          <meshStandardMaterial color={style.trim} metalness={0.95} roughness={0.3} />
        </mesh>

        {/* vertical iron straps */}
        {[-0.95, 0.95].map((x) => (
          <group key={x} position={[x, 0, 1.06]}>
            <mesh castShadow>
              <boxGeometry args={[0.4, 1.64, 0.07]} />
              <meshStandardMaterial color="#3a3e45" metalness={0.85} roughness={0.42} />
            </mesh>
            {[0.55, -0.55].map((y) => (
              <mesh key={y} position={[0, y, 0.045]}>
                <sphereGeometry args={[0.05, 12, 12]} />
                <meshStandardMaterial color="#c9ced8" metalness={1} roughness={0.3} />
              </mesh>
            ))}
          </group>
        ))}

        {/* brass plaque */}
        <mesh position={[0, 0.34, 1.1]}>
          <boxGeometry args={[1.05, 0.32, 0.06]} />
          <meshStandardMaterial color={style.trim} metalness={0.9} roughness={0.28} />
        </mesh>

        {/* dark mouth + glow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.795, 0]}>
          <planeGeometry args={[2.9, 1.8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh ref={glowPlane} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.82, 0]}>
          <planeGeometry args={[2.7, 1.6]} />
          <meshBasicMaterial color={accent} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <pointLight ref={mouthLight} position={[0, 1.3, 0.2]} intensity={0.3} color={accent} distance={7} decay={2} />

        {/* light beam cone */}
        <mesh ref={beam} position={[0, 2.5, 0]}>
          <coneGeometry args={[1.5, 3.4, 32, 1, true]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* ---- hinged lid ---- */}
        <group ref={lid} position={[0, 0.8, -1.05]}>
          <mesh castShadow position={[0, 0.425, 1.05]} onClick={handleChestClick}>
            <boxGeometry args={[3.2, 0.85, 2.1]} />
            <meshStandardMaterial color={style.wood} roughness={0.58} metalness={0.25} />
          </mesh>
          {/* lid top inlay */}
          <mesh position={[0, 0.86, 1.05]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.7, 1.6]} />
            <meshStandardMaterial color={style.trim} metalness={0.85} roughness={0.35} transparent opacity={0.55} />
          </mesh>
          {/* lid front trim + hanging hasps */}
          <mesh position={[0, 0.12, 2.1]}>
            <boxGeometry args={[3.26, 0.1, 0.08]} />
            <meshStandardMaterial color={style.trim} metalness={0.95} roughness={0.25} />
          </mesh>
          {[-0.95, 0.95].map((x) => (
            <mesh key={x} position={[x, 0.1, 2.11]}>
              <boxGeometry args={[0.4, 0.95, 0.06]} />
              <meshStandardMaterial color="#43474f" metalness={0.88} roughness={0.4} />
            </mesh>
          ))}
        </group>

        {/* ---- padlocks ---- */}
        {([0, 1] as const).map((i) => {
          const x = i === 0 ? -0.95 : 0.95;
          const broken = locks[i];
          return (
            <group key={i} position={[x, broken ? -0.55 : 0.02, 1.28]}>
              <mesh
                castShadow
                onClick={handleLockClick(i)}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  if (!broken && stage === "locked") setCursor(true);
                }}
                onPointerOut={() => setCursor(false)}
              >
                <boxGeometry args={[0.44, 0.5, 0.2]} />
                <meshStandardMaterial
                  color={broken ? "#5b5320" : "#c9962f"}
                  metalness={0.9}
                  roughness={0.3}
                  transparent
                  opacity={broken ? 0.55 : 1}
                />
              </mesh>
              {/* keyhole */}
              <mesh position={[0, -0.02, 0.105]}>
                <circleGeometry args={[0.05, 16]} />
                <meshBasicMaterial color="#241503" />
              </mesh>
              {/* shackle */}
              <mesh
                position={[broken ? 0.1 : 0, broken ? 0.42 : 0.36, 0]}
                rotation={[0, 0, broken ? -0.55 : 0]}
              >
                <torusGeometry args={[0.17, 0.045, 12, 24, Math.PI]} />
                <meshStandardMaterial color="#c3c8d2" metalness={1} roughness={0.28} />
              </mesh>
            </group>
          );
        })}

        {/* ---- prize ---- */}
        <group ref={prize} scale={0.001} position={[0, 0.75, 0]}>
          <mesh ref={gem} castShadow>
            <octahedronGeometry args={[0.52, 0]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.6}
              roughness={0.12}
              metalness={0.15}
              flatShading
            />
          </mesh>
          <mesh>
            <icosahedronGeometry args={[0.74, 0]} />
            <meshBasicMaterial color={accent} wireframe transparent opacity={0.45} />
          </mesh>
          <mesh ref={ring} rotation={[Math.PI / 2.4, 0, 0]}>
            <torusGeometry args={[0.92, 0.028, 12, 64]} />
            <meshStandardMaterial color={style.trim} metalness={1} roughness={0.2} emissive={accent} emissiveIntensity={0.35} />
          </mesh>
          {prizeEmoji ? <EmojiSprite emoji={prizeEmoji} /> : null}
          <pointLight ref={prizeLight} intensity={0} color={accent} distance={6} decay={2} />
        </group>

        <BurstParticles color={accent} openRef={open} />
      </group>

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]} receiveShadow>
        <circleGeometry args={[3.8, 48]} />
        <meshStandardMaterial color="#12101a" roughness={1} metalness={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.94, 0]}>
        <ringGeometry args={[2.95, 3.02, 64]} />
        <meshBasicMaterial color={style.trim} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      <ContactShadows position={[0, -0.93, 0]} opacity={0.72} scale={11} blur={2.4} far={4} color="#000000" />
    </>
  );
}

export function Chest3D({
  stage,
  locks,
  tier,
  rarity = "common",
  prizeEmoji = null,
  onPickLock,
  onOpen,
}: {
  stage: ChestStage;
  locks: boolean[];
  tier: TierId;
  rarity?: Rarity;
  prizeEmoji?: string | null;
  onPickLock: (i: number) => void;
  onOpen: () => void;
}) {
  const orbitable = stage !== "lifting";
  const hint =
    stage === "locked"
      ? "Drag to orbit · Scroll to zoom · Click a padlock"
      : stage === "ready"
        ? "Locks picked — click the chest or press Unveil"
        : stage === "revealed"
          ? "Drag to admire your pull · Reset to try again"
          : "The seal is breaking…";

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#0d0b13]">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [4.4, 3.1, 5.4], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => gl.setClearColor("#0d0b13")}
      >
        <Suspense fallback={null}>
          <ChestScene
            stage={stage}
            locks={locks}
            tier={tier}
            rarity={rarity}
            prizeEmoji={prizeEmoji}
            onPickLock={onPickLock}
            onOpen={onOpen}
          />
          <OrbitControls
            makeDefault
            enabled={orbitable}
            enablePan={false}
            target={[0, 0.7, 0]}
            minDistance={3.4}
            maxDistance={9.5}
            minPolarAngle={0.55}
            maxPolarAngle={1.5}
            autoRotate={stage === "locked"}
            autoRotateSpeed={0.9}
          />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
        <span className="rounded-full border border-gold-burnished/40 bg-surface-container-lowest/85 px-3 py-1.5 font-label-sm text-[10px] font-semibold tracking-widest text-gold-radiant uppercase backdrop-blur">
          {hint}
        </span>
      </div>
    </div>
  );
}
