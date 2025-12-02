import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { GestureState } from '../types';

export class GeminiLiveService {
  private ai: GoogleGenAI | null = null;
  private sessionPromise: Promise<any> | null = null;
  private videoInterval: number | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
  }

  async connect(
    onGesture: (gesture: GestureState) => void,
    onError: (error: string) => void
  ) {
    try {
      this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO], 
          systemInstruction: `
            You are a 3D particle system controller. 
            Analyze the user's video feed for HAND GESTURES.
            1. If you see an OPEN HAND (fingers spread wide), output text "OPEN".
            2. If you see a CLOSED FIST (fingers curled tight), output text "CLOSE".
            3. If neutral or no hand, output nothing.
            IMPORTANT: Do not speak conversationally. Only output these single keywords in the transcript.
          `,
          outputAudioTranscription: {}, 
        },
      };

      this.sessionPromise = this.ai.live.connect({
        model: config.model,
        config: config.config,
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription?.text) {
                const text = message.serverContent.outputTranscription.text.toUpperCase();
                console.log("Gemini says:", text);
                if (text.includes("OPEN")) onGesture("OPEN");
                if (text.includes("CLOSE")) onGesture("CLOSED");
            }
          },
          onerror: (e: any) => {
            console.error("Gemini Live Error", e);
            onError(e.message || "Connection error");
          },
          onclose: () => {
            console.log("Gemini Live Closed");
          }
        }
      });

      await this.sessionPromise;
      return true;

    } catch (e: any) {
      console.error(e);
      onError(e.message);
      return false;
    }
  }

  startVideoStreaming(videoElement: HTMLVideoElement) {
    if (!this.sessionPromise || !this.ctx) return;

    const FPS = 5; // Frames per second
    
    this.videoInterval = window.setInterval(async () => {
      if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Downscale for bandwidth efficiency
        this.canvas.width = 320; 
        this.canvas.height = 240;
        this.ctx?.drawImage(videoElement, 0, 0, this.canvas.width, this.canvas.height);
        
        const base64 = this.canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        
        try {
            this.sessionPromise?.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'image/jpeg',
                        data: base64
                    }
                });
            });
        } catch (e) {
            console.warn("Failed to send frame", e);
        }
      }
    }, 1000 / FPS);
  }

  stop() {
    if (this.videoInterval) clearInterval(this.videoInterval);
  }
}

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};