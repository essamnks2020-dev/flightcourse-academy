"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function AircraftModel() {
  const group = React.useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.rotation.z = Math.sin(t * 0.3) * 0.12;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.04 - 0.05;
    group.current.rotation.y = t * 0.08;
  });

  return (
    <group ref={group} scale={1}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.35, 2.2, 8, 16]} />
        <meshStandardMaterial color="#F7F9FC" metalness={0.3} roughness={0.4} />
      </mesh>
      {/* Nose cone */}
      <mesh position={[1.4, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
        <coneGeometry args={[0.35, 0.5, 16]} />
        <meshStandardMaterial color="#3E92CC" metalness={0.4} roughness={0.3} />
      </mesh>
      {/* Spinner / prop hub */}
      <mesh position={[1.7, 0, 0]} castShadow>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#0B1D3A" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Prop disc illusion */}
      <mesh position={[1.72, 0, 0]}>
        <ringGeometry args={[0.02, 0.9, 16]} />
        <meshStandardMaterial color="#5B6B79" transparent opacity={0.12} side={THREE.DoubleSide} />
      </mesh>
      {/* High wings (Cessna style) */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.8, 0.08, 4.2]} />
        <meshStandardMaterial color="#3E92CC" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Wing struts */}
      <mesh position={[-0.2, 0.05, 1.4]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.04, 0.08]} />
        <meshStandardMaterial color="#2A6A9E" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 0.05, -1.4]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.8, 0.04, 0.08]} />
        <meshStandardMaterial color="#2A6A9E" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Tail fin (vertical stabilizer) */}
      <mesh position={[-1.3, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.06]} />
        <meshStandardMaterial color="#3E92CC" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Tail plane (horizontal stabilizer) */}
      <mesh position={[-1.3, 0.2, 0]} castShadow>
        <boxGeometry args={[0.5, 0.06, 1.6]} />
        <meshStandardMaterial color="#F2B134" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Windows */}
      <mesh position={[0.3, 0.15, 0.32]} castShadow>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#0B1D3A" metalness={0.9} roughness={0.1} emissive="#3E92CC" emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0.3, 0.15, -0.32]} castShadow>
        <boxGeometry args={[0.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#0B1D3A" metalness={0.9} roughness={0.1} emissive="#3E92CC" emissiveIntensity={0.1} />
      </mesh>
      {/* Landing gear wheels */}
      <mesh position={[0.2, -0.4, 0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>
      <mesh position={[0.2, -0.4, -0.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>
      <mesh position={[-1.2, -0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 12]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.8} />
      </mesh>
    </group>
  );
}

interface Aircraft3DProps {
  className?: string;
}

export function Aircraft3D({ className }: Aircraft3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [3, 1.5, 4], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#3E92CC" />
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
          <AircraftModel />
        </Float>
        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.25}
          scale={6}
          blur={2.5}
          far={3}
          color="#0B1D3A"
        />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}
