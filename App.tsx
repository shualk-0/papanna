import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import ParticleSystem from './components/ParticleSystem';
import UI from './components/UI';
import { ParticleConfig, ShapeType } from './types';

const App: React.FC = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [config, setConfig] = useState<ParticleConfig>({
    color: '#3b82f6',
    shape: ShapeType.SPHERE,
    expansion: 0.2
  });

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false));
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      
      {/* 3D Scene */}
      <Canvas 
        camera={{ position: [0, 0, 35], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]} // Handle high DPI screens
      >
        <color attach="background" args={['#050505']} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color={config.color} />

        {/* Particles */}
        <ParticleSystem config={config} />

        {/* Environment & Controls */}
        <Environment preset="city" />
        <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            autoRotate={true}
            autoRotateSpeed={0.5}
            minDistance={10}
            maxDistance={100}
        />
        
        {/* Floor Reflection/Shadow */}
        <ContactShadows opacity={0.4} scale={40} blur={2.5} far={40} color={config.color} />
      </Canvas>

      {/* Overlay UI */}
      <UI 
        config={config} 
        setConfig={setConfig} 
        isFullScreen={isFullScreen} 
        toggleFullScreen={toggleFullScreen} 
      />
      
    </div>
  );
};

export default App;