import { ThreeElements } from '@react-three/fiber';

export enum ShapeType {
  HEART = 'Heart',
  FLOWER = 'Flower',
  SATURN = 'Saturn',
  STATUE = 'Buddha',
  FIREWORK = 'Firework',
  SPHERE = 'Sphere'
}

export interface ParticleConfig {
  color: string;
  shape: ShapeType;
  expansion: number; // 0 to 1 (Contracted to Expanded)
}

export type GestureState = 'OPEN' | 'CLOSED' | 'IDLE';

export interface GeminiLiveStatus {
  isConnected: boolean;
  isStreaming: boolean;
  lastGesture: GestureState;
  error?: string;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}