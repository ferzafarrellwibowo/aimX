'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import { GameSettings, GameState } from '@/lib/gameEngine';

export default function GamePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [finalState, setFinalState] = useState<GameState | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('aimX_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  const handleGameOver = (state: GameState) => {
    setFinalState(state);
    
    // Check high score
    const key = `aimX_highscore_${settings?.mode}`;
    const currentHigh = parseInt(localStorage.getItem(key) || '0', 10);
    if (state.score > currentHigh) {
      localStorage.setItem(key, state.score.toString());
    }
  };

  const handleRestart = () => {
    setFinalState(null);
  };

  if (!settings) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative font-sans">
      {!finalState ? (
        <>
          <button 
            onClick={() => router.push('/')}
            className="absolute bottom-6 left-6 z-50 bg-[#1a1a1a]/80 backdrop-blur-md hover:bg-[#222222] border border-white/10 text-[#a1a1aa] hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            Exit to Menu
          </button>
          <GameCanvas 
            settings={settings}
            onGameOver={handleGameOver}
            onRestart={handleRestart}
          />
        </>
      ) : (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white space-y-10 animate-in fade-in zoom-in duration-300">
          <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 drop-shadow-2xl">
            TIME'S UP
          </h2>
          
          <div className="w-full max-w-md bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] grid grid-cols-2 gap-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>
            
            <div className="space-y-1 relative z-10">
              <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Score</div>
              <div className="text-4xl font-black text-white">{finalState.score}</div>
            </div>
            
            <div className="space-y-1 relative z-10">
              <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Accuracy</div>
              <div className="text-4xl font-black text-white">
                {finalState.hits + finalState.misses > 0 
                  ? ((finalState.hits / (finalState.hits + finalState.misses)) * 100).toFixed(1) 
                  : '0'}%
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Hits / Misses</div>
              <div className="text-2xl font-bold">
                <span className="text-indigo-400">{finalState.hits}</span> <span className="text-zinc-600">/</span> <span className="text-rose-400">{finalState.misses}</span>
              </div>
            </div>

            <div className="space-y-1 relative z-10">
              <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Avg Reaction</div>
              <div className="text-2xl font-bold text-white">
                {finalState.hits > 0 ? Math.round(finalState.totalReactionTime / finalState.hits) : 0}ms
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={handleRestart}
              className="flex-1 bg-[#ededed] hover:bg-white text-black font-bold text-sm tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
            >
              PLAY AGAIN
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 text-white font-bold text-sm tracking-wider py-4 rounded-xl transition-all"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
