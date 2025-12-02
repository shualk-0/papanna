import { ShapeType, Vector3 } from './types';

export const PARTICLE_COUNT = 4000;

// Helper random
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Shape Generators
// Returns a function that takes an index and returns a Vector3
export const getShapePosition = (type: ShapeType, index: number, total: number): Vector3 => {
  const p = index / total;
  const phi = Math.acos(-1 + (2 * index) / total);
  const theta = Math.sqrt(total * Math.PI) * phi;

  switch (type) {
    case ShapeType.HEART: {
      // 3D Heart formula approximation
      const t = phi * Math.PI * 2;
      const u = theta;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      const z = 5 * Math.sin(t) * Math.cos(u) * 2; // Add volume
      // Random scatter inside
      const scale = 0.5;
      return { x: x * scale + random(-0.2, 0.2), y: y * scale + random(-0.2, 0.2), z: z * scale + random(-0.2, 0.2) };
    }

    case ShapeType.FLOWER: {
      const k = 7; // Petals
      const r = Math.cos(k * theta) * Math.sin(phi) * 10;
      return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        z: Math.cos(phi) * 5
      };
    }

    case ShapeType.SATURN: {
      // Planet + Rings
      const isRing = index % 3 !== 0; // 2/3 particles are ring
      if (isRing) {
        const angle = index * 0.1;
        const radius = random(8, 14);
        return {
          x: Math.cos(angle) * radius,
          y: random(-0.2, 0.2), // Flattened
          z: Math.sin(angle) * radius
        };
      } else {
        // Planet body
        const r = 4;
        return {
          x: r * Math.sin(phi) * Math.cos(theta),
          y: r * Math.sin(phi) * Math.sin(theta),
          z: r * Math.cos(phi)
        };
      }
    }

    case ShapeType.STATUE: {
        // Approximate a sitting figure using stacked spheres/volumes
        // Base (Legs)
        const iNorm = index / total;
        let x = 0, y = 0, z = 0;
        
        if (iNorm < 0.4) {
            // Base/Legs: Ellipsoid
            const angle = iNorm * Math.PI * 20;
            const r = 6 * (1 - iNorm);
            x = r * Math.cos(angle);
            y = -5 + (iNorm * 5); 
            z = r * Math.sin(angle) * 0.6;
        } else if (iNorm < 0.7) {
            // Torso
            const r = 3.5;
            const angle = iNorm * Math.PI * 30;
            x = r * Math.cos(angle) * 0.8;
            y = -3 + ((iNorm - 0.4) * 20);
            z = r * Math.sin(angle) * 0.6;
        } else {
            // Head
            const r = 2.5;
            const angle = iNorm * Math.PI * 40;
            x = r * Math.sin(angle) * Math.cos(iNorm * 100);
            y = 4 + ((iNorm - 0.7) * 10);
            z = r * Math.sin(angle) * Math.sin(iNorm * 100);
        }
        return { x, y, z };
    }

    case ShapeType.FIREWORK: {
      const r = random(0, 15);
      const thetaRandom = random(0, Math.PI * 2);
      const phiRandom = random(0, Math.PI);
      return {
        x: r * Math.sin(phiRandom) * Math.cos(thetaRandom),
        y: r * Math.sin(phiRandom) * Math.sin(thetaRandom),
        z: r * Math.cos(phiRandom)
      };
    }

    case ShapeType.SPHERE:
    default: {
      const r = 10;
      return {
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi)
      };
    }
  }
};