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
  
  const engineRef = useRef<GameEngine | null>(null);

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
            style={{ cursor: startStatus === 'playing' ? 'crosshair' : 'default' }}
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
    </div>
  );
}
