'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, GameSettings } from '@/lib/gameEngine';

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode>('grid');
  const [duration, setDuration] = useState<number>(30000);

  useEffect(() => {
    const saved = localStorage.getItem('aimX_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.duration) setDuration(parsed.duration);
      } catch (e) {}
    }
  }, []);

  const handleStart = (selectedMode: GameMode) => {
    const settings: GameSettings = {
      mode: selectedMode,
      duration,
    };
    
    localStorage.setItem('aimX_settings', JSON.stringify({ ...settings, mode: selectedMode }));
    router.push('/game');
  };

  const modes: { id: GameMode; title: string; desc: string; category: string }[] = [
    { id: 'grid', title: 'Grid Shot', desc: 'Targets spawn in a fixed 3x3 grid. Perfect for building muscle memory.', category: 'Flicking' },
    { id: 'flick', title: 'Flick Shot', desc: 'Alternate between a small center target and larger random targets. Perfect for mouse flicking!', category: 'Flicking' },
    { id: 'speed', title: 'Speed Focus', desc: 'Targets spawn rapidly. Test your reaction time and speed.', category: 'Speed' },
    { id: 'precision', title: 'Precision', desc: 'Smaller targets, slower spawns. Master your exact clicking.', category: 'Precision' },
    { id: 'tracking', title: 'Strafe Tracking', desc: 'Track the moving target! Keep your cursor hovering over the target without clicking.', category: 'Tracking' },
    { id: 'switch-tracking', title: 'Switch Tracking', desc: 'Track the moving target! It will relocate after 3 seconds of accumulated hover time.', category: 'Tracking' }
  ];

  const categories = ['Flicking', 'Tracking', 'Speed', 'Precision'];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex flex-col items-center justify-center p-6 space-y-12 font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="text-center space-y-3 relative z-10 mt-8">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white">
          aim<span className="text-red-700 drop-shadow-[0_0_15px_rgba(185,28,28,0.8)]">X</span>
        </h1>
        <p className="text-[#a1a1aa] font-medium tracking-wide text-sm md:text-base uppercase letter-spacing-[0.2em]">Precision & Speed Trainer</p>
      </div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col items-center space-y-12 mt-4 px-4 pb-20">
        {categories.map((category) => (
          <div key={category} className="w-full">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-3 pl-2">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {modes.filter(m => m.category === category).map((m) => (
            <div 
              key={m.id} 
              onClick={() => setMode(m.id)}
              className={`bg-[#111111]/80 backdrop-blur-xl border ${mode === m.id ? 'border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20 scale-[1.02]' : 'border-white/10 shadow-2xl hover:border-white/20 hover:bg-[#1a1a1a]/80 cursor-pointer hover:scale-[1.01]'} rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative overflow-hidden min-h-[280px]`}
            >
              {/* Top Side: Info */}
              <div className="flex-1 space-y-3 z-10 w-full text-left mb-6 pointer-events-none">
                <h2 className={`text-2xl font-black tracking-tight transition-colors ${mode === m.id ? 'text-white' : 'text-[#a1a1aa]'}`}>{m.title}</h2>
                <p className="text-[#888888] text-sm leading-relaxed">{m.desc}</p>
              </div>

              {/* Bottom Side: Controls (Only visible when card is selected) */}
              <div className={`flex flex-col items-center gap-3 z-10 w-full transition-all duration-300 ${mode === m.id ? 'opacity-100 translate-y-0 pointer-events-auto mt-auto' : 'opacity-0 translate-y-4 pointer-events-none absolute -bottom-20 scale-95'}`}>
                <div className="flex bg-[#1a1a1a] rounded-xl p-1 border border-white/5 w-full justify-between">
                  {[30000, 60000, 100000].map(d => (
                    <button
                      key={d}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDuration(d);
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all duration-300 flex-1 text-center ${
                        duration === d
                          ? 'bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                          : 'text-[#888888] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {d / 1000}s
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStart(m.id);
                  }}
                  className="w-full px-8 font-bold text-sm tracking-widest py-3 rounded-xl transition-all transform active:scale-95 duration-300 whitespace-nowrap bg-[#ededed] hover:bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                >
                  PLAY
                </button>
              </div>
            </div>
          ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
