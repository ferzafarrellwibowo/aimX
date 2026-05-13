'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, GameSettings } from '@/lib/gameEngine';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';

const Particles = dynamic(() => import('@/components/Particles'), { ssr: false });

import { motion } from 'framer-motion';

// Simple arrow icons (no external dependency)
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const heroContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function Home() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [duration, setDuration] = useState<number>(30000);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

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
    { id: 'grid', title: 'Gridshot', desc: 'Targets spawn in a fixed 3x3 grid. Perfect for building muscle memory.', category: 'Flicking' },
    { id: 'flick', title: 'Flick Shot', desc: 'Alternate between a small center target and larger random targets. Perfect for mouse flicking!', category: 'Flicking' },
    { id: 'microshot', title: 'Microshot', desc: 'Small targets spawn nearby each other. Hit one and the next appears close by. Train micro-adjustments!', category: 'Flicking' },
    { id: 'speed', title: 'Rapid Shot', desc: 'Targets spawn rapidly. Test your reaction time and speed.', category: 'Speed' },
    { id: 'reflex', title: 'Reflex Shots', desc: 'Pure reaction test! Single target with very short lifetime (220ms). Measures your raw reflex speed.', category: 'Speed' },
    { id: 'burst', title: 'Timed Pressure', desc: 'Fast waves of targets! 5-second bursts with rapid spawns. Bonus points during waves, heavier penalties for misses.', category: 'Speed' },
    { id: 'precision', title: 'Exact Aiming', desc: 'Smaller targets, slower spawns. Master your exact clicking.', category: 'Precision' },
    { id: 'smooth-aiming', title: 'Smooth Aiming', desc: 'Track a medium target moving slowly horizontal. Perfect for beginners to practice smooth mouse control.', category: 'Tracking' },
    { id: 'tracking', title: 'Strafe Tracking', desc: 'Track the moving target! Keep your cursor hovering over the target without clicking.', category: 'Tracking' },
    { id: 'switch-tracking', title: 'Switch Tracking', desc: 'Track the moving target! It will relocate after 3 seconds of accumulated hover time.', category: 'Tracking' },
    { id: 'dropshot', title: 'Dropshot', desc: 'Track small targets falling from top to bottom. New target spawns after 1 second delay.', category: 'Tracking' }
  ];

  const categories = ['Flicking', 'Tracking', 'Speed', 'Precision'];

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (category: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[category];
    if (container) {
      const cardWidth = 320 + 16;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededed] font-sans relative overflow-y-auto">
      <Sidebar />
      <div className="pl-20">
        <div className="flex flex-col items-center p-6">
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 z-0">
              <Particles
                particleColors={["#7c0202"]}
                particleCount={800}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
              />
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-red-900/8 via-transparent to-transparent blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/5 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-rose-900/5 rounded-full blur-[120px]"></div>
          </div>

          {/* Header */}
          <header className="relative z-10 pt-12 pb-8 text-center flex flex-col items-center">
            <motion.div
              variants={heroContainerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center"
            >
              <motion.div variants={heroItemVariants} className="mb-2">
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white inline-block">
                  aim<span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.6)]">X</span>
                </h1>
              </motion.div>
              <motion.p variants={heroItemVariants} className="text-[#666666] text-base md:text-lg tracking-wide mb-6 max-w-md">
                Improve your accuracy, reaction time, and mouse control with competitive aim training scenarios built for every skill level.
              </motion.p>
              <motion.div variants={heroItemVariants} className="flex items-center gap-2 text-sm tracking-widest mb-4">
                <span className="text-[#555555] font-medium">MADE BY</span>
                <span className="neon-text text-red-500 font-bold">UXTITLED</span>
              </motion.div>
              <motion.div variants={heroItemVariants} className="flex items-center gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">11</div>
                  <div className="text-xs text-[#555555] uppercase tracking-wider">Game Modes</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-white">4</div>
                  <div className="text-xs text-[#555555] uppercase tracking-wider">Categories</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div>
                  <div className="text-2xl font-bold text-red-500">∞</div>
                  <div className="text-xs text-[#555555] uppercase tracking-wider">Potential</div>
                </div>
              </motion.div>
            </motion.div>
          </header>

          {/* Search Bar */}
          <div className="relative z-10 w-full max-w-md mx-auto mb-12">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search game modes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-[#666666] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Main content */}
          <main className="w-full max-w-5xl relative z-10 flex flex-col space-y-16 pb-24">
            {categories.map((category) => {
              const categoryModes = modes.filter(m =>
                m.category === category &&
                (searchQuery === '' ||
                 m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 m.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 m.category.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              if (categoryModes.length === 0) return null;

              const showArrows = categoryModes.length > 3;

              return (
                <section
                  key={category}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative"
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">{category}</h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
                  </div>

                  {/* Left arrow */}
                  {showArrows && (
                    <button
                      onClick={() => scroll(category, 'left')}
                      className={`
                        absolute left-2 top-[calc(50%+12px)] -translate-y-1/2 z-20
                        p-3 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-md
                        border border-white/20 text-white/80 hover:text-white
                        hover:bg-[#111111] hover:border-white/40 hover:scale-110
                        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                        transition-all duration-300 ease-out
                        ${hoveredCategory === category
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 -translate-x-4 pointer-events-none'
                        }
                      `}
                      aria-label="Scroll left"
                    >
                      <ChevronLeft />
                    </button>
                  )}

                  {/* Right arrow */}
                  {showArrows && (
                    <button
                      onClick={() => scroll(category, 'right')}
                      className={`
                        absolute right-2 top-[calc(50%+12px)] -translate-y-1/2 z-20
                        p-3 rounded-xl bg-[#0a0a0a]/95 backdrop-blur-md
                        border border-white/20 text-white/80 hover:text-white
                        hover:bg-[#111111] hover:border-white/40 hover:scale-110
                        shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                        transition-all duration-300 ease-out
                        ${hoveredCategory === category
                          ? 'opacity-100 translate-x-0'
                          : 'opacity-0 translate-x-4 pointer-events-none'
                        }
                      `}
                      aria-label="Scroll right"
                    >
                      <ChevronRight />
                    </button>
                  )}

                  {/* Horizontal scrollable cards */}
                  <div
                    ref={(el) => { scrollRefs.current[category] = el; }}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-start px-1"
                  >
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
                          {isSelected && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                          )}

                          <div className="flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className={`text-xl font-bold tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-[#999999]'}`}>
                                {m.title}
                              </h3>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 ml-2 mt-1"></div>
                              )}
                            </div>

                            <p className="text-[#666666] text-sm leading-relaxed min-h-[72px]">{m.desc}</p>

                            {isSelected && (
                              <div className="mt-4 card-controls-enter">
                                <div className="flex gap-2 mb-3">
                                  {[30000, 60000, 100000].map(d => (
                                    <button
                                      key={d}
                                      onClick={(e) => { e.stopPropagation(); setDuration(d); }}
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

                                <div
                                  onClick={(e) => { e.stopPropagation(); setAdaptiveDifficulty(!adaptiveDifficulty); }}
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
                                  <div className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${adaptiveDifficulty ? 'bg-amber-500' : 'bg-white/20'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 bg-white shadow-sm ${adaptiveDifficulty ? 'left-6' : 'left-1'}`} />
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStart(m.id); }}
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
      </div>
    </div>
  );
}
