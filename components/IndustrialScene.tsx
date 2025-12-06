/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, Lightformer, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Represents an Aluminum Profile (Extrusion) with high-end metallic shader
const AluminumProfile = ({ 
  position, 
  rotation, 
  scale = 1, 
  type = 'tube',
  color = "#F3F4F6" // Lighter silver/white for high-end aluminum
}: { 
  position: [number, number, number]; 
  rotation: [number, number, number]; 
  scale?: number; 
  type?: 'tube' | 'beam' | 't-slot';
  color?: string;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      // Very slow, majestic rotation
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x += 0.001;
      ref.current.position.y = position[1] + Math.sin(t * 0.2 + position[0]) * 0.2;
    }
  });

  // High-end "Silver" Physical Material
  // Clearcoat adds a layer of polish, high metalness + low roughness gives it that precision look
  const material = (
    <meshPhysicalMaterial 
      color={color}
      roughness={0.15} 
      metalness={1.0}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
      reflectivity={1}
      envMapIntensity={2.0}
    />
  );

  if (type === 'beam') {
    // I-Beam Shape
    const shape = new THREE.Shape();
    const w = 0.5;
    const h = 0.8;
    const t = 0.1;
    shape.moveTo(-w/2, -h/2);
    shape.lineTo(w/2, -h/2);
    shape.lineTo(w/2, -h/2 + t);
    shape.lineTo(t/2, -h/2 + t);
    shape.lineTo(t/2, h/2 - t);
    shape.lineTo(w/2, h/2 - t);
    shape.lineTo(w/2, h/2);
    shape.lineTo(-w/2, h/2);
    shape.lineTo(-w/2, h/2 - t);
    shape.lineTo(-t/2, h/2 - t);
    shape.lineTo(-t/2, -h/2 + t);
    shape.lineTo(-w/2, -h/2 + t);
    
    const extrudeSettings = { depth: 4, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 }; // Reduced bevel for more precision look

    return (
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        {material}
      </mesh>
    )
  }

  if (type === 't-slot') {
      return (
        <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
            <boxGeometry args={[0.8, 4, 0.8]} />
            {material}
        </mesh>
      )
  }

  // Tube
  return (
    <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
      <cylinderGeometry args={[0.3, 0.3, 5, 64, 1, true]} />
      <meshPhysicalMaterial {...material.props} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const HeroScene: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={40} />
        
        <ambientLight intensity={0.8} />
        <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#ffffff" />
        <spotLight position={[-20, -10, -10]} angle={0.2} penumbra={1} intensity={1.5} color="#E0F2FE" /> {/* Subtle cool tone */}
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {/* Main Elements */}
          <AluminumProfile position={[-2, 1, 0]} rotation={[0.5, 0.5, 0]} scale={1.5} type="beam" />
          <AluminumProfile position={[3, -1, -2]} rotation={[-0.2, -0.2, 0.4]} scale={1.2} type="tube" />
          <AluminumProfile position={[0, 3, -5]} rotation={[1.5, 0, 0.5]} scale={1} type="t-slot" />
          
          {/* Background Detail */}
          <AluminumProfile position={[-5, -4, -8]} rotation={[0, 0, 1]} scale={2} type="beam" color="#CBD5E1" />
        </Float>

        <Environment preset="city" />
        
        {/* Reflections */}
        <group position={[0, 0, -5]}>
            <Lightformer form="rect" intensity={2} position={[5, 2, -5]} scale={[10, 5, 1]} color="white" />
            <Lightformer form="rect" intensity={1} position={[-5, 0, -5]} scale={[10, 5, 1]} color="#009FE3" />
        </group>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/50 to-gray-900/90 pointer-events-none"></div>
    </div>
  );
};

export const StructureGrid: React.FC = () => {
    return (
      <div className="w-full h-full absolute inset-0 opacity-30 pointer-events-none">
        <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <group rotation={[0, Math.PI / 4, 0]}>
             <mesh position={[0,0,0]}>
                <boxGeometry args={[4, 0.05, 0.05]} />
                <meshStandardMaterial color="#4B5563" />
             </mesh>
             <mesh position={[0,0,0]} rotation={[0, Math.PI/2, 0]}>
                <boxGeometry args={[4, 0.05, 0.05]} />
                <meshStandardMaterial color="#4B5563" />
             </mesh>
             <mesh position={[0,0,0]} rotation={[Math.PI/2, 0, 0]}>
                <boxGeometry args={[4, 0.05, 0.05]} />
                <meshStandardMaterial color="#4B5563" />
             </mesh>
          </group>
        </Canvas>
      </div>
    )
}