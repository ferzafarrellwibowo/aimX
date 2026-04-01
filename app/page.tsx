'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, GameSettings } from '@/lib/gameEngine';

export default function Home() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [duration, setDuration] = useState<number>(30000);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem('aimX_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.adaptiveDifficulty !== undefined) setAdaptiveDifficulty(parsed.adaptiveDifficulty);
      } catch (e) {}
    }
  }, []);

  const handleCardClick = (modeId: GameMode) => {
    // Toggle: jika card yang sama diklik lagi, tutup card tersebut
    setSelectedMode(prev => prev === modeId ? null : modeId);
  };

  const handleStart = (modeToStart: GameMode) => {
    const settings: GameSettings = {
      mode: modeToStart,
      duration,
      adaptiveDifficulty,
    };
    
    localStorage.setItem('aimX_settings', JSON.stringify({ ...settings, mode: modeToStart }));
    router.push('/game');
  };

  const modes: { id: GameMode; title: string; desc: string; category: string }[] = [
    { id: 'grid', title: 'Grid Shot', desc: 'Targets spawn in a fixed 3x3 grid. Perfect for building muscle memory.', category: 'Flicking' },
    { id: 'flick', title: 'Flick Shot', desc: 'Alternate between a small center target and larger random targets. Perfect for mouse flicking!', category: 'Flicking' },
    { id: 'speed', title: 'Speed Focus', desc: 'Targets spawn rapidly. Test your reaction time and speed.', category: 'Speed' },
    { id: 'precision', title: 'Exact Aiming', desc: 'Smaller targets, slower spawns. Master your exact clicking.', category: 'Precision' },
    { id: 'smooth-aiming', title: 'Smooth Aiming', desc: 'Track a medium target moving slowly horizontal. Perfect for beginners to practice smooth mouse control.', category: 'Tracking' },
    { id: 'tracking', title: 'Strafe Tracking', desc: 'Track the moving target! Keep your cursor hovering over the target without clicking.', category: 'Tracking' },
    { id: 'switch-tracking', title: 'Switch Tracking', desc: 'Track the moving target! It will relocate after 3 seconds of accumulated hover time.', category: 'Tracking' },
    { id: 'dropshot', title: 'Dropshot', desc: 'Track small targets falling from top to bottom. New target spawns after 1 second delay.', category: 'Tracking' }
  ];

  const categories = ['Flicking', 'Tracking', 'Speed', 'Precision'];



  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededed] flex flex-col items-center p-6 font-sans relative overflow-x-hidden overflow-y-auto">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-red-900/8 via-transparent to-transparent blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-900/5 rounded-full blur-[120px]"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 pt-12 pb-16 text-center">
        <div className="mb-2">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white inline-block">
            aim<span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">X</span>
          </h1>
        </div>
        <p className="text-[#666666] text-sm tracking-wide">Train your aim — flicking, tracking, speed & precision drills</p>
      </header>

      {/* Main content */}
      <main className="w-full max-w-5xl relative z-10 flex flex-col space-y-16 pb-24">
        {categories.map((category) => {
          const categoryModes = modes.filter(m => m.category === category);
          if (categoryModes.length === 0) return null;
          
          return (
            <section key={category}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">{category}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>
              
              {/* Horizontal scrollable cards */}
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent items-start">
                {categoryModes.map((m) => {
                  const isSelected = selectedMode === m.id;
                  
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => handleCardClick(m.id)}
                      className={`
                        relative rounded-2xl p-6 cursor-pointer transition-all duration-300 flex-shrink-0
                        w-[280px] md:w-[320px]
                        ${isSelected 
                          ? 'bg-gradient-to-br from-[#1a1a1f] to-[#141418] border-2 border-red-600/40 shadow-[0_0_40px_rgba(220,38,38,0.15)]' 
                          : 'bg-[#111114]/80 border border-white/5 hover:border-white/10 hover:bg-[#161619]'
                        }
                      `}
                    >
                      {/* Selected indicator line */}
                      {isSelected && (
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                      )}
                      
                      {/* Card content */}
                      <div className="flex flex-col">
                        {/* Title row */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className={`text-xl font-bold tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-[#999999]'}`}>
                            {m.title}
                          </h3>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 ml-2 mt-1"></div>
                          )}
                        </div>
                        
                        {/* Description */}
                        <p className="text-[#666666] text-sm leading-relaxed min-h-[72px]">{m.desc}</p>
                        
                        {/* Controls - only visible when selected */}
                        {isSelected && (
                          <div className="mt-4 card-controls-enter">
                            {/* Duration selector */}
                            <div className="flex gap-2 mb-3">
                              {[30000, 60000, 100000].map(d => (
                                <button
                                key={d}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDuration(d);
                                }}
                                className={`
                                  flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200
                                  ${duration === d
                                    ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                    : 'bg-white/5 text-[#666666] border border-transparent hover:text-white hover:bg-white/10'
                                  }
                                `}
                              >
                                {d / 1000}s
                              </button>
                            ))}
                          </div>
                          
                          {/* Adaptive Difficulty Toggle */}
                          <div 
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdaptiveDifficulty(!adaptiveDifficulty);
                            }}
                            className={`
                              flex items-center justify-between mb-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                              ${adaptiveDifficulty 
                                ? 'bg-amber-500/10 border border-amber-500/30' 
                                : 'bg-white/5 border border-transparent hover:bg-white/10'
                              }
                            `}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-medium transition-colors ${adaptiveDifficulty ? 'text-amber-400' : 'text-[#888888]'}`}>
                                  Adaptive Difficulty
                                </span>
                                <span className="text-[10px] text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded">BETA</span>
                              </div>
                              <span className="text-[10px] text-[#555555]">
                                {(m.id === 'tracking' || m.id === 'switch-tracking' || m.id === 'smooth-aiming' || m.id === 'dropshot') 
                                  ? 'Target shrinks & speeds up over time'
                                  : 'Adjusts based on your performance'
                                }
                              </span>
                            </div>
                            <div className={`
                              relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0
                              ${adaptiveDifficulty 
                                ? 'bg-amber-500' 
                                : 'bg-white/20'
                              }
                            `}>
                              <div className={`
                                absolute top-1 w-4 h-4 rounded-full transition-all duration-200 bg-white shadow-sm
                                ${adaptiveDifficulty ? 'left-6' : 'left-1'}
                              `} />
                            </div>
                          </div>
                          
                          {/* Play button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStart(m.id);
                            }}
                            className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all duration-200 bg-white hover:bg-neutral-100 text-black active:scale-[0.98]"
                          >
                            START
                          </button>
                        </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </main>


    </div>
  );
}
