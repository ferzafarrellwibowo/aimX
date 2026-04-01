'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import Heatmap from '@/components/Heatmap';
import { GameSettings, GameState, ClickPoint } from '@/lib/gameEngine';

export default function GamePage() {
  const router = useRouter();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [finalState, setFinalState] = useState<GameState | null>(null);
  const [selectedWave, setSelectedWave] = useState<number>(0); // 0 = all waves

  const handleRestart = () => {
    setFinalState(null);
    setSelectedWave(0);
  };

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
      if (e.key === 'r' || e.key === 'R') {
        if (finalState) {
          handleRestart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, finalState]);

  const handleGameOver = (state: GameState) => {
    setFinalState(state);
    
    // Check high score
    const key = `aimX_highscore_${settings?.mode}`;
    const currentHigh = parseInt(localStorage.getItem(key) || '0', 10);
    if (state.score > currentHigh) {
      localStorage.setItem(key, state.score.toString());
    }
  };

  if (!settings) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative font-sans">
      {!finalState ? (
        <>
          {/* Keyboard hint */}
          <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 text-[10px] text-[#555555] uppercase tracking-widest">
            <span className="px-2 py-1 bg-[#1a1a1a]/60 border border-white/5 rounded text-[#666666]">ESC</span>
            <span>Menu</span>
          </div>
          
          <button 
            onClick={() => router.push('/')}
            className="absolute bottom-6 left-6 z-50 bg-[#1a1a1a]/80 backdrop-blur-md hover:bg-[#222222] border border-white/10 text-[#a1a1aa] hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
          >
            ← Exit
          </button>
          <GameCanvas 
            settings={settings}
            onGameOver={handleGameOver}
            onRestart={handleRestart}
          />
        </>
      ) : (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white overflow-y-auto animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-center space-y-8 py-8">
            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 drop-shadow-2xl">
              TIME'S UP
            </h2>
            
            <div className="flex flex-col lg:flex-row gap-6 w-full max-w-4xl">
              {/* Stats Card */}
              <div className="flex-1 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] grid grid-cols-2 gap-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="space-y-1 relative z-10">
                  <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Score</div>
                  <div className="text-4xl font-black text-white">{finalState.score}</div>
                </div>
                
                <div className="space-y-1 relative z-10">
                  <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">
                    {settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot' ? 'Track Accuracy' : 'Accuracy'}
                  </div>
                  <div className="text-4xl font-black text-white">
                    {settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot'
                      ? (finalState.trackingTicks > 0 
                          ? ((finalState.trackingHits / finalState.trackingTicks) * 100).toFixed(1) 
                          : '0')
                      : (finalState.hits + finalState.misses > 0 
                          ? ((finalState.hits / (finalState.hits + finalState.misses)) * 100).toFixed(1) 
                          : '0')
                    }%
                  </div>
                </div>

                {/* Only show Hits/Misses and Avg Reaction for non-tracking modes */}
                {settings?.mode !== 'tracking' && settings?.mode !== 'switch-tracking' && settings?.mode !== 'smooth-aiming' && settings?.mode !== 'dropshot' && (
                  <>
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
                  </>
                )}

                {/* Tracking mode specific stats */}
                {(settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot') && (
                  <div className="col-span-2 space-y-1 relative z-10">
                    <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Time On Target</div>
                    <div className="text-2xl font-bold text-indigo-400">
                      {((finalState.trackingHits * 100) / 1000).toFixed(1)}s
                    </div>
                  </div>
                )}

                {/* Burst mode specific stats */}
                {settings?.mode === 'burst' && (
                  <div className="col-span-2 space-y-1 relative z-10 pt-4 border-t border-white/10">
                    <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Waves Completed</div>
                    <div className="text-2xl font-bold text-amber-400">
                      {finalState.waveClickHistory?.length || 0} / {finalState.totalWaves}
                    </div>
                  </div>
                )}

                {settings?.adaptiveDifficulty && (
                  <div className="col-span-2 space-y-1 relative z-10 pt-4 border-t border-white/10">
                    <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Mode</div>
                    <div className="text-sm font-bold text-amber-400">Adaptive Difficulty</div>
                  </div>
                )}
              </div>

              {/* Heatmap Card - only show for non-tracking modes */}
              {settings?.mode !== 'tracking' && settings?.mode !== 'switch-tracking' && settings?.mode !== 'smooth-aiming' && settings?.mode !== 'dropshot' && (
                <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  {/* Wave navigation for burst mode */}
                  {settings?.mode === 'burst' && finalState.waveClickHistory && finalState.waveClickHistory.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setSelectedWave(prev => Math.max(0, prev - 1))}
                        disabled={selectedWave === 0}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="text-sm font-bold text-white">
                        {selectedWave === 0 ? 'All Waves' : `Wave ${selectedWave}`}
                      </div>
                      <button
                        onClick={() => setSelectedWave(prev => Math.min(finalState.waveClickHistory.length, prev + 1))}
                        disabled={selectedWave >= finalState.waveClickHistory.length}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <Heatmap 
                    clickHistory={
                      settings?.mode === 'burst' && selectedWave > 0 && finalState.waveClickHistory?.[selectedWave - 1]
                        ? finalState.waveClickHistory[selectedWave - 1]
                        : finalState.clickHistory || []
                    }
                    canvasWidth={finalState.canvasWidth || 800}
                    canvasHeight={finalState.canvasHeight || 600}
                    width={350}
                    height={220}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={handleRestart}
                className="flex-1 bg-[#ededed] hover:bg-white text-black font-bold text-sm tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2"
              >
                <span className="text-[10px] px-1.5 py-0.5 bg-black/10 rounded">R</span>
                PLAY AGAIN
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 text-white font-bold text-sm tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded">ESC</span>
                MENU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
