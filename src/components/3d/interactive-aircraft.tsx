"use client";

import * as React from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface AircraftPart {
  id: string;
  name: string;
  description: string;
  position: [number, number, number];
}

interface InteractiveAircraftProps {
  onPartClick?: (part: AircraftPart) => void;
  activePartId?: string | null;
  autoRotate?: boolean;
  showLabels?: boolean;
  className?: string;
}

// Educational parts — numbered pins positioned relative to the model
const EDUCATION_PARTS: { id: string; num: number; name: string; short: string; description: string; position: [number, number, number] }[] = [
  { id: "prop", num: 1, name: "Propeller", short: "Prop", description: "Two-blade, fixed-pitch. Pulls the aircraft forward at 2,300 RPM.", position: [2.2, 0.2, 0] },
  { id: "engine", num: 2, name: "Engine Cowling", short: "Cowling", description: "Houses the 160 HP Lycoming O-320 engine.", position: [1.5, 0.3, 0] },
  { id: "wing", num: 3, name: "High Wing", short: "Wing", description: "Generates lift. High-wing design gives stability and downward visibility.", position: [0, 0.8, 1.5] },
  { id: "cockpit", num: 4, name: "Cockpit", short: "Cockpit", description: "Pilot station. Six-pack instruments, yoke, throttle, radios.", position: [0.3, 0.5, 0] },
  { id: "tail", num: 5, name: "Empennage", short: "Tail", description: "Vertical fin (yaw) + horizontal stabilizer (pitch). Keeps you flying straight.", position: [-2.2, 0.8, 0] },
  { id: "gear", num: 6, name: "Landing Gear", short: "Gear", description: "Tricycle config: two mains + nosewheel. Easier to taxi than tailwheel.", position: [0.2, -1.0, 0.6] },
  { id: "flap", num: 7, name: "Flaps", short: "Flaps", description: "Trailing-edge surfaces that add lift + drag for slower landing approaches.", position: [0.6, 0.3, 1.0] },
  { id: "strut", num: 8, name: "Wing Strut", short: "Strut", description: "Structural support from fuselage to wing. Carries flight loads.", position: [-0.1, 0.0, 1.3] },
];

/**
 * Cessna 172 — loaded from a real textured GLB model.
 * Uses useGLTF for proper PBR materials, textures, and geometry.
 * Educational numbered pins positioned around the model.
 */
export function InteractiveAircraft({
  onPartClick,
  activePartId,
  autoRotate = true,
  showLabels = false,
  className,
}: InteractiveAircraftProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [4, 0.8, 5.5], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }}
        shadows
      >
        <Lighting />
        <React.Suspense fallback={<Html center><div style={{ width: "120px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>{[0,1,2].map(i => <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3E92CC", opacity: 0.4, animation: `pulse 1s ease-in-out ${i * 0.15}s infinite` }} />)}</div></Html>}>
          <GLTFModel onPartClick={onPartClick} activePartId={activePartId} showLabels={showLabels} />
        </React.Suspense>
        <ContactShadows position={[0, -1.15, 0]} opacity={0.4} scale={8} blur={2.5} far={4} color="#030711" resolution={512} />
        <Environment preset="sunset" environmentIntensity={0.5} />
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 1.9}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.7}
          zoomSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      {/* Key light — warm sun, upper right */}
      <directionalLight
        position={[6, 8, 4]}
        intensity={2.0}
        color="#fff0d8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
      {/* Fill — cool sky bounce */}
      <directionalLight position={[-5, 3, 3]} intensity={0.5} color="#8ec5e8" />
      {/* Rim — gold edge from behind */}
      <directionalLight position={[-3, 2, -6]} intensity={1.5} color="#F2B134" />
    </>
  );
}

function GLTFModel({
  onPartClick,
  activePartId,
  showLabels,
}: {
  onPartClick?: (part: AircraftPart) => void;
  activePartId?: string | null;
  showLabels?: boolean;
}) {
  const { scene } = useGLTF("/models/cessna172-opt.glb");
  const modelRef = React.useRef<THREE.Group>(null);

  // Clone the scene and auto-scale/center — GLB models can have arbitrary scale
  const cloned = React.useMemo(() => {
    const c = scene.clone(true);
    // Compute bounding box to center and scale
    const box = new THREE.Box3().setFromObject(c);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3.5 / maxDim;
    c.scale.setScalar(scale);
    c.position.sub(center.multiplyScalar(scale));
    const newBox = new THREE.Box3().setFromObject(c);
    const newY = newBox.min.y;
    c.position.y -= newY;
    // Enable shadows on all meshes
    c.traverse(function(child) {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  const parts: AircraftPart[] = EDUCATION_PARTS.map(p => ({ id: p.id, name: p.name, description: p.description, position: p.position }));
  const isActive = (id: string) => activePartId === id;
  const isDimmed = (id: string) => activePartId !== null && activePartId !== id;

  return (
    <group ref={modelRef}>
      {/* The GLB model */}
      <primitive object={cloned} />

      {/* Educational numbered pins */}
      {showLabels && EDUCATION_PARTS.map((part) => (
        <NumberedPin
          key={part.id}
          num={part.num}
          position={part.position}
          active={isActive(part.id)}
          dimmed={isDimmed(part.id)}
        />
      ))}

      {/* Invisible click targets for each part */}
      {EDUCATION_PARTS.map((part) => (
        <mesh
          key={`hit-${part.id}`}
          position={part.position}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onPartClick?.({ id: part.id, name: part.name, description: part.description, position: part.position });
          }}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "default"; }}
          visible={false}
        >
          <sphereGeometry args={[0.4, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}

/** Educational numbered pin — always visible, with leader line */
function NumberedPin({ num, position, active, dimmed }: { num: number; position: [number, number, number]; active: boolean; dimmed: boolean }) {
  return (
    <Html position={position} center distanceFactor={10} pointerEvents="none" style={{ opacity: dimmed ? 0.3 : 1, transition: "opacity 0.3s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
        {/* Leader line */}
        <div style={{ width: "1px", height: "14px", background: active ? "rgba(242,177,52,0.8)" : "rgba(111,179,222,0.4)" }} />
        {/* Pin dot */}
        <div style={{
          width: "18px", height: "18px", borderRadius: "50%",
          background: active ? "#F2B134" : "rgba(7,21,42,0.9)",
          color: active ? "#07152A" : "#6FB3DE",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "10px", fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700,
          border: active ? "1.5px solid rgba(242,177,52,0.6)" : "1.5px solid rgba(111,179,222,0.3)",
          boxShadow: active ? "0 0 12px rgba(242,177,52,0.6)" : "0 2px 6px rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
        }}>
          {num}
        </div>
      </div>
    </Html>
  );
}

// Preload the model
useGLTF.preload("/models/cessna172-opt.glb");
