"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Environment, ContactShadows } from "@react-three/drei";
import { Suspense } from "react";

export interface GameCessnaHandle {
  setPitch: (deg: number) => void;
  setBank: (deg: number) => void;
  setYaw: (deg: number) => void;
  setGearCompress: (v: number) => void;
  setThrottle: (v: number) => void;
}

/**
 * GameCessna3D — the in-game Cessna 172 as a real 3D model (replaces the
 * 2D side-profile SVG). Renders the actual GLB model with live pitch/bank/
 * yaw driven by the physics engine. The propeller spins based on throttle.
 *
 * The camera is positioned behind and slightly above — the "chase view"
 * that makes the plane face forward down the runway (fixing the
 * "not faced correctly to the road" issue).
 */
const GameCessna3DInner = React.forwardRef<GameCessnaHandle, { className?: string }>(
  function GameCessna3DInner({ className }, ref) {
    const pitchRef = React.useRef(0);
    const bankRef = React.useRef(0);
    const yawRef = React.useRef(0);
    const gearRef = React.useRef(0);
    const throttleRef = React.useRef(0.5);
    const groupRef = React.useRef<any>(null);
    const propRef = React.useRef<any>(null);

    React.useImperativeHandle(ref, () => ({
      setPitch: (deg: number) => { pitchRef.current = deg; },
      setBank: (deg: number) => { bankRef.current = deg; },
      setYaw: (deg: number) => { yawRef.current = deg; },
      setGearCompress: (v: number) => { gearRef.current = v; },
      setThrottle: (v: number) => { throttleRef.current = v; },
    }), []);

    const { scene } = useGLTF("/models/cessna172-opt.glb");
    const cloned = React.useMemo(() => scene.clone(true), [scene]);

    // Spin the propeller based on throttle
    React.useEffect(() => {
      let raf = 0;
      let lastTime = performance.now();
      const animate = (now: number) => {
        const dt = (now - lastTime) / 1000;
        lastTime = now;
        if (propRef.current) {
          const speed = 10 + throttleRef.current * 60;
          propRef.current.rotation.z += speed * dt;
        }
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(raf);
    }, []);

    return (
      <div className={className} style={{ width: "100%", height: "100%" }}>
        <Canvas
          camera={{ position: [0, 1.2, 5.5], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
          style={{ background: "transparent" }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[3, 5, 2]} intensity={1.5} castShadow />
          <directionalLight position={[-3, 2, -1]} intensity={0.4} color="oklch(0.75 0.128 205)" />

          <Suspense fallback={null}>
            <group
              ref={(g) => {
                groupRef.current = g;
                if (g) {
                  g.rotation.x = pitchRef.current * (Math.PI / 180);
                  g.rotation.z = bankRef.current * (Math.PI / 180);
                  g.rotation.y = yawRef.current * (Math.PI / 180);
                }
              }}
            >
              <primitive object={cloned} scale={1.5} />
            </group>
            <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={8} blur={2.5} far={3} />
            <Environment preset="sunset" />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

export const GameCessna3D = React.forwardRef<GameCessnaHandle, { className?: string }>(
  function GameCessna3D(props, ref) {
    return (
      <React.Suspense fallback={<div className="flex items-center justify-center text-xs text-muted-foreground">Loading aircraft…</div>}>
        <GameCessna3DInner {...props} ref={ref} />
      </React.Suspense>
    );
  }
);

useGLTF.preload("/models/cessna172-opt.glb");
