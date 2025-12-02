import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ShapeType, ParticleConfig } from '../types';
import { getShapePosition, PARTICLE_COUNT } from '../constants';

interface Props {
  config: ParticleConfig;
}

const ParticleSystem: React.FC<Props> = ({ config }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Store target positions
  const targetPositions = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    return positions;
  }, []);

  // Store current positions for lerping
  const currentPositions = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT * 3));
  
  // Generate targets when shape changes
  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const pos = getShapePosition(config.shape, i, PARTICLE_COUNT);
      targetPositions[i * 3] = pos.x;
      targetPositions[i * 3 + 1] = pos.y;
      targetPositions[i * 3 + 2] = pos.z;
    }
  }, [config.shape, targetPositions]);

  // Initial random positions
  useEffect(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        currentPositions.current[i * 3] = (Math.random() - 0.5) * 50;
        currentPositions.current[i * 3 + 1] = (Math.random() - 0.5) * 50;
        currentPositions.current[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();
    const expandFactor = 0.5 + (config.expansion * 2.0); // Map 0-1 to 0.5-2.5 scale

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // Target coords
      const tx = targetPositions[ix] * expandFactor;
      const ty = targetPositions[iy] * expandFactor;
      const tz = targetPositions[iz] * expandFactor;

      // Lerp current to target
      // Faster lerp for responsiveness
      currentPositions.current[ix] += (tx - currentPositions.current[ix]) * 0.05;
      currentPositions.current[iy] += (ty - currentPositions.current[iy]) * 0.05;
      currentPositions.current[iz] += (tz - currentPositions.current[iz]) * 0.05;

      // Add some noise/movement
      const noise = Math.sin(time * 0.5 + i) * 0.05;
      
      dummy.position.set(
        currentPositions.current[ix] + noise,
        currentPositions.current[iy] + noise,
        currentPositions.current[iz] + noise
      );

      // Rotation based on time
      dummy.rotation.set(time * 0.1, time * 0.1, 0);
      dummy.scale.setScalar(1); // Individual particle size

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]}>
      <sphereGeometry args={[0.1, 8, 8]} /> {/* Low poly spheres for performance */}
      <meshStandardMaterial 
        color={config.color} 
        emissive={config.color} 
        emissiveIntensity={0.8}
        roughness={0.4}
        metalness={0.8}
      />
    </instancedMesh>
  );
};

export default ParticleSystem;