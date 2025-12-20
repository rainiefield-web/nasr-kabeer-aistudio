
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Cylinder, Box, Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';

// Removed clobbering declare global JSX namespace to fix standard HTML element recognition

// Represents an Aluminum Profile (Extrusion)
const AluminumProfile = ({ position, rotation, scale = 1, type = 'tube' }: { position: [number, number, number]; rotation: [number, number, number]; scale?: number; type?: 'tube' | 'beam' }) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      // Slow, heavy industrial float
      ref.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.1;
      ref.current.rotation.x = rotation[0] + Math.sin(t * 0.1) * 0.1;
    }
  });

  // Metal material
  const materialProps = {
    color: "#A1A1AA", // Aluminum Grey
    roughness: 0.2,
    metalness: 1,
    envMapIntensity: 2,
  };

  if (type === 'beam') {
    // I-Beam simulation using a Box (simplified)
    return (
      // @ts-ignore
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
         {/* @ts-ignore */}
         <boxGeometry args={[0.5, 4, 0.5]} />
         {/* @ts-ignore */}
         <meshStandardMaterial {...materialProps} />
      </mesh>
    )
  }

  // Default Cylinder/Tube
  return (
    // @ts-ignore
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* @ts-ignore */}
      <cylinderGeometry args={[0.2, 0.2, 4, 32]} />
      {/* @ts-ignore */}
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

const StructuredLattice = () => {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (ref.current) {
       const t = state.clock.getElapsedTime();
       ref.current.rotation.y = t * 0.05;
    }
  });

  return (
    // @ts-ignore
    <group ref={ref}>
      {/* Create a structural aesthetic */}
      {/* @ts-ignore */}
      <mesh position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <boxGeometry args={[8, 0.1, 0.1]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      {/* @ts-ignore */}
      <mesh position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <boxGeometry args={[0.1, 8, 0.1]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      {/* @ts-ignore */}
      <mesh position={[0, 0, 0]}>
        {/* @ts-ignore */}
        <boxGeometry args={[0.1, 0.1, 8]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#4B5563" />
      </mesh>
      
      {/* Floating details */}
      {/* @ts-ignore */}
      <mesh position={[2, 2, 2]} rotation={[0.5, 0.5, 0]}>
        {/* @ts-ignore */}
        <boxGeometry args={[1, 1, 1]} />
        {/* @ts-ignore */}
        <meshStandardMaterial color="#10B981" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 35 }}>
        {/* @ts-ignore */}
        <ambientLight intensity={0.5} />
        {/* @ts-ignore */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        {/* @ts-ignore */}
        <pointLight position={[-10, -10, -10]} intensity={1} color="#10B981" />
        
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          {/* Architectural Profiles */}
          <AluminumProfile position={[-2, 1, -1]} rotation={[0, 0, Math.PI / 3]} scale={1.2} type="beam" />
          <AluminumProfile position={[2.5, -1, 0]} rotation={[0, 0, -Math.PI / 4]} scale={1.5} type="tube" />
          
          {/* Background Elements */}
          <AluminumProfile position={[0, 0, -4]} rotation={[Math.PI / 2, 0, 0]} scale={3} type="tube" />
        </Float>

        <Environment preset="city" />
        {/* Lightformers to create metallic reflections */}
        {/* @ts-ignore */}
        <group position={[0, 0, -10]}>
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={[10, 2, 1]} />
            <Lightformer intensity={0.5} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
        </group>
      </Canvas>
    </div>
  );
};

export const FactoryScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0">
      <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
        {/* @ts-ignore */}
        <ambientLight intensity={1} />
        {/* @ts-ignore */}
        <directionalLight position={[5, 10, 5]} intensity={2} />
        <Environment preset="warehouse" />
        
        {/* @ts-ignore */}
        <group rotation={[0, Math.PI / 4, 0]} position={[0, -1, 0]}>
            <StructuredLattice />
        </group>
      </Canvas>
    </div>
  );
}
