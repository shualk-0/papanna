import React, { useState, useRef } from 'react';
import { ShapeType, ParticleConfig, GestureState } from '../types';
import { Camera, Maximize, Loader2, Minimize } from 'lucide-react';
import { GeminiLiveService } from '../services/geminiService';

interface UIProps {
  config: ParticleConfig;
  setConfig: React.Dispatch<React.SetStateAction<ParticleConfig>>;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
}

const UI: React.FC<UIProps> = ({ config, setConfig, isFullScreen, toggleFullScreen }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>('IDLE');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const geminiService = useRef(new GeminiLiveService());

  const handleConnect = async () => {
    // Interactive Key Selection
    const win = window as any;
    if (win.aistudio) {
        const hasKey = await win.aistudio.hasSelectedApiKey();
        if (!hasKey) {
            await win.aistudio.openSelectKey();
        }
    }

    setIsConnecting(true);
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); 
        setVideoStream(stream);
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
        }

        const connected = await geminiService.current.connect(
            (gesture) => {
                setGestureState(gesture);
                // Smoothly update expansion based on gesture
                if (gesture === 'OPEN') {
                    setConfig(prev => ({ ...prev, expansion: 0.8 }));
                } else if (gesture === 'CLOSED') {
                    setConfig(prev => ({ ...prev, expansion: 0.1 }));
                }
            },
            (err) => {
                console.error(err);
                alert(`Connection Error: ${err}`);
                setIsConnecting(false);
            }
        );

        if (connected) {
            setIsConnected(true);
            // Start streaming video frames
            setTimeout(() => {
                if (videoRef.current) {
                    geminiService.current.startVideoStreaming(videoRef.current);
                }
            }, 1000);
        } else {
             setIsConnecting(false);
        }

    } catch (err) {
        console.error(err);
        alert("Failed to access camera or connect. Please check permissions.");
        setIsConnecting(false);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-xl">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Gemini Particle Flow
          </h1>
          <p className="text-xs text-gray-400 mt-1">Real-time Gesture Control</p>
        </div>

        <div className="flex gap-2">
           {!isConnected ? (
             <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20"
             >
               {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
               Start Camera & AI
             </button>
           ) : (
             <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-mono uppercase">{gestureState}</span>
             </div>
           )}
           <button onClick={toggleFullScreen} className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
              {isFullScreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
           </button>
        </div>
      </div>

      {/* Hidden Video Element for sampling, visible for user feedback */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className={`fixed bottom-6 right-6 w-32 h-24 object-cover rounded-lg border-2 border-white/20 transition-all z-50 bg-black ${isConnected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      />

      {/* Control Panel */}
      <div className="pointer-events-auto max-w-md bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 text-white shadow-2xl mb-4">
        
        <div className="space-y-6">
            
          {/* Shapes */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Particle Shape</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(ShapeType).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setConfig({ ...config, shape })}
                  className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    config.shape === shape 
                      ? 'bg-white text-black font-semibold shadow-lg scale-105' 
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
          </div>

          {/* Color & Expansion */}
          <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Color</label>
                <div className="flex gap-2">
                    {['#3b82f6', '#ec4899', '#eab308', '#22c55e', '#ffffff'].map(color => (
                        <button
                            key={color}
                            onClick={() => setConfig({...config, color})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.color === color ? 'border-white scale-110 shadow-[0_0_10px_currentColor]' : 'border-transparent'}`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <div className="relative w-8 h-8 rounded-full border-2 border-white/20 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 overflow-hidden cursor-pointer hover:scale-110 transition-transform">
                      <input 
                          type="color" 
                          value={config.color}
                          onChange={(e) => setConfig({...config, color: e.target.value})}
                          className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 opacity-0 cursor-pointer" 
                      />
                    </div>
                </div>
            </div>

            <div>
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">Expansion</label>
                 <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01"
                    value={config.expansion}
                    onChange={(e) => setConfig({...config, expansion: parseFloat(e.target.value)})}
                    className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                 />
            </div>
          </div>

          <div className="text-[10px] text-gray-500 text-center pt-2 border-t border-white/5">
            Powered by Gemini 2.5 Flash Native Audio
          </div>

        </div>
      </div>

    </div>
  );
};

export default UI;