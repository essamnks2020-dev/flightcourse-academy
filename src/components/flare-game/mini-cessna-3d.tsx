"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Float, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

function MiniCessnaModel({ quality }: { quality: string }) {
  const { scene } = useGLTF("/models/cessna172-opt.glb");
  const cloned = React.useMemo(() => scene.clone(true), [scene]);

  // Tilt based on landing quality — greaser = wings level, hard = banked, crash = nose down
  const rotation: [number, number, number] =
    quality === "greaser"
      ? [0, -0.3, 0]
      : quality === "good"
      ? [-0.05, -0.4, 0.02]
      : quality === "firm"
      ? [-0.1, -0.3, 0.05]
      : quality === "hard"
      ? [-0.2, -0.2, 0.1]
      : quality === "bounce"
      ? [-0.15, -0.3, -0.08]
      : [-0.4, -0.2, 0.15]; // crash — nose down

  return (
    <group rotation={rotation} scale={1.2}>
      <primitive object={cloned} />
    </group>
  );
}

function MiniCessnaFallback() {
  return (
    <mesh rotation={[-0.1, -0.3, 0]} scale={1.2}>
      <boxGeometry args={[2, 0.3, 0.8]} />
      <meshStandardMaterial color="oklch(0.7 0.1 250)" metalness={0.3} roughness={0.5} />
    </mesh>
  );
}

/**
 * MiniCessna3D — a small 3D Cessna 172 for the result screen.
 * Shows the real GLB model, tilted based on landing quality.
 * Greaser = wings level, hard = banked, crash = nose down.
 */
export function MiniCessna3D({ quality = "good", className }: { quality?: string; className?: string }) {
  return (
    <div className={className} style={{ width: "100%", height: "200px" }}>
      <Canvas
        camera={{ position: [3, 1.5, 3], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="oklch(0.75 0.128 205)" />
        <Suspense fallback={<MiniCessnaFallback />}>
          <Float speed={1.5} rotationIntensity={0.15} floatIntensity={0.3}>
            <MiniCessnaModel quality={quality} />
          </Float>
          <ContactShadows position={[0, -0.8, 0]} opacity={0.3} scale={6} blur={2.5} far={2} />
        </Suspense>
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/cessna172-opt.glb");
