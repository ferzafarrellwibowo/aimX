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
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [startStatus, setStartStatus] = useState<'waiting' | 'countdown' | 'playing'>('waiting');
  const [countdown, setCountdown] = useState(3);
  
  const engineRef = useRef<GameEngine | null>(null);

  // Resize handler to make canvas fill container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
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
      {/* Subtle center grid gradient to match minimalist vibe */}
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)' }}></div>
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
      
      {startStatus === 'waiting' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer">
          <div className="text-4xl md:text-5xl font-black text-white tracking-widest animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            CLICK TO START
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

      {gameState && startStatus === 'playing' && (
        <HUD state={gameState} duration={settings.duration} />
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-full block touch-none select-none z-10 relative ${startStatus === 'playing' ? '' : 'pointer-events-none'}`}
        style={{ cursor: startStatus === 'playing' ? 'crosshair' : 'default' }}
      />
    </div>
  );
}
