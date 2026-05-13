'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameSettings, GameState, HUDUpdateCallback } from '@/lib/gameEngine';
import { HUD } from './HUD';

interface GameCanvasProps {
  settings: GameSettings;
  onGameOver: (finalState: GameState) => void;
  onRestart: () => void;
}

export default function GameCanvas({ settings, onGameOver, onRestart }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [startStatus, setStartStatus] = useState<'waiting' | 'countdown' | 'playing'>('waiting');
  const [countdown, setCountdown] = useState(3);
  
  // Custom crosshair states
  const defaultCrosshair = { 
      length: 6, thickness: 2, gap: 4, hasDot: false, dotThickness: 2, color: '#00ff00',
      hasOutline: true, outlineThickness: 1
  };
  const [crosshair, setCrosshair] = useState(defaultCrosshair);
  const crosshairRef = useRef<HTMLDivElement>(null);
  
  const engineRef = useRef<GameEngine | null>(null);
  const countdownAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      countdownAudioRef.current = new Audio('/sounds/3 2 1 0 Countdown With Sound Effect No Copyright Ready To Use.mp3');
      countdownAudioRef.current.volume = 0.8;
    }
  }, []);

  // Load and listen for crosshair changes
  useEffect(() => {
    const loadCrosshair = () => {
      const saved = localStorage.getItem('aimX_crosshair');
      if (saved) {
        try { setCrosshair({ ...defaultCrosshair, ...JSON.parse(saved) }); } catch(e) {}
      }
    };
    loadCrosshair();
    window.addEventListener('crosshairChange', loadCrosshair);
    return () => window.removeEventListener('crosshairChange', loadCrosshair);
  }, []);

  // Mouse tracking for custom crosshair (using directly DOM update for zero latency)
  useEffect(() => {
    if (startStatus !== 'playing') return;
    const handleMouseMove = (e: MouseEvent) => {
      if (crosshairRef.current) {
        crosshairRef.current.style.left = `${e.clientX}px`;
        crosshairRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [startStatus]);

  // Resize handler to make canvas fill play area
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const playArea = playAreaRef.current;
      if (!canvas || !playArea) return;

      const rect = playArea.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize and start game engine
  useEffect(() => {
    if (startStatus !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const onHUDUpdate: HUDUpdateCallback = (state) => {
      // Throttle state updates for React if it's running too hot
      requestAnimationFrame(() => setGameState(state));
    };

    const handleGameOver = (finalState: GameState) => {
      setGameState(finalState);
      onGameOver(finalState);
    };

    engineRef.current = new GameEngine(canvas, settings, onHUDUpdate, handleGameOver);
    engineRef.current.start();

    return () => {
      if (engineRef.current) {
        engineRef.current.cleanup();
      }
    };
  }, [settings, onGameOver, startStatus]);

  // Handle countdown
  useEffect(() => {
    if (startStatus === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setStartStatus('playing');
      }
    }
  }, [startStatus, countdown]);

  const handleContainerClick = () => {
    if (startStatus === 'waiting') {
      setStartStatus('countdown');
      if (countdownAudioRef.current) {
        countdownAudioRef.current.currentTime = 0;
        countdownAudioRef.current.play().catch(err => console.warn('Audio play failed:', err));
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex flex-col bg-[#050505] overflow-hidden"
      onClick={handleContainerClick}
    >
      {/* Background pattern - full screen */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      
      {/* HUD - positioned at top */}
      {gameState && startStatus === 'playing' && (
        <HUD state={gameState} duration={settings.duration} mode={settings.mode} />
      )}

      {/* Play Area Container - with padding */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 lg:p-14">
        <div 
          ref={playAreaRef}
          className="relative w-full h-full max-w-6xl max-h-[75vh] rounded-2xl overflow-hidden border border-white/10 bg-[#080808] shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        >
          {/* Play area inner glow */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ 
            boxShadow: 'inset 0 0 100px rgba(255,255,255,0.02)' 
          }}></div>
          
          {/* Corner indicators */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/20 rounded-tl"></div>
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/20 rounded-tr"></div>
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/20 rounded-bl"></div>
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/20 rounded-br"></div>

          <canvas
            ref={canvasRef}
            className={`w-full h-full block touch-none select-none ${startStatus === 'playing' ? '' : 'pointer-events-none'}`}
            style={{ cursor: startStatus === 'playing' ? 'none' : 'default' }}
          />
        </div>
      </div>

      {/* Overlays */}
      {startStatus === 'waiting' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer gap-6">
          <div className="text-4xl md:text-5xl font-black text-white tracking-widest animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            CLICK TO START
          </div>
          <div className="text-[#666666] text-xs uppercase tracking-widest">
            {settings.mode === 'tracking' || settings.mode === 'switch-tracking' || settings.mode === 'smooth-aiming' || settings.mode === 'dropshot'
              ? 'Keep your cursor over the moving target' 
              : 'Click targets as fast as you can'}
          </div>
        </div>
      )}

      {startStatus === 'countdown' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
          <div className="text-8xl md:text-[150px] font-black text-white">
            {countdown}
          </div>
        </div>
      )}

      {/* Custom Crosshair */}
      {startStatus === 'playing' && (
        <div ref={crosshairRef} style={{
          position: 'fixed',
          left: -100,
          top: -100,
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999
        }}>
          {(() => {
             const d = Number(crosshair.gap) || 0;
             const l = Number(crosshair.length) || 0;
             const t = Number(crosshair.thickness) || 0;
             const dotT = Number(crosshair.dotThickness) || 0;
             const o = crosshair.hasOutline ? (Number(crosshair.outlineThickness) || 0) : 0;
             const totalSize = (d + l + o) * 2;
             const svgSize = Math.max(totalSize, 60);
             const center = svgSize / 2;
             return (
               <svg width={svgSize} height={svgSize} overflow="visible">
                 {/* Outline Layer */}
                 {crosshair.hasOutline && (
                    <>
                        {crosshair.hasDot && (
                            <rect x={center - (dotT / 2) - o} y={center - (dotT / 2) - o} width={dotT + (o * 2)} height={dotT + (o * 2)} fill="#000000" />
                        )}
                        <rect x={center - (t / 2) - o} y={center - d - l - o} width={t + (o * 2)} height={l + (o * 2)} fill="#000000" />
                        <rect x={center - (t / 2) - o} y={center + d - o} width={t + (o * 2)} height={l + (o * 2)} fill="#000000" />
                        <rect x={center - d - l - o} y={center - (t / 2) - o} width={l + (o * 2)} height={t + (o * 2)} fill="#000000" />
                        <rect x={center + d - o} y={center - (t / 2) - o} width={l + (o * 2)} height={t + (o * 2)} fill="#000000" />
                    </>
                 )}
                 {/* Color Layer */}
                 {crosshair.hasDot && (
                    <rect x={center - dotT / 2} y={center - dotT / 2} width={dotT} height={dotT} fill={crosshair.color} />
                 )}
                 <rect x={center - t / 2} y={center - d - l} width={t} height={l} fill={crosshair.color} />
                 <rect x={center - t / 2} y={center + d} width={t} height={l} fill={crosshair.color} />
                 <rect x={center - d - l} y={center - t / 2} width={l} height={t} fill={crosshair.color} />
                 <rect x={center + d} y={center - t / 2} width={l} height={t} fill={crosshair.color} />
               </svg>
             );
          })()}
        </div>
      )}
    </div>
  );
}
