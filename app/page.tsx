'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { GameMode, GameSettings } from '@/lib/gameEngine';
import Sidebar from '@/components/Sidebar';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/Toast';

const Particles = dynamic(() => import('@/components/Particles'), { ssr: false });

import { motion } from 'framer-motion';

// Simple arrow icons (no external dependency)
const ChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

type Category = 'All' | 'Flicking' | 'Tracking' | 'Speed' | 'Precision';

export default function Home() {
  const router = useRouter();
  const { showToast } = useToast();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [duration, setDuration] = useState<number>(30000);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [isNavigating, setIsNavigating] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('aimX_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.duration) setDuration(parsed.duration);
        if (parsed.adaptiveDifficulty !== undefined) setAdaptiveDifficulty(parsed.adaptiveDifficulty);
      } catch {}
    }
  }, []);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (modeId: GameMode) => {
    setSelectedMode(prev => prev === modeId ? null : modeId);
  };

  const handleStart = (modeToStart: GameMode, modeTitle: string) => {
    const settings: GameSettings = {
      mode: modeToStart,
      duration,
      adaptiveDifficulty,
    };
    localStorage.setItem('aimX_settings', JSON.stringify({ ...settings, mode: modeToStart }));
    setIsNavigating(true);
    showToast({
      title: `Loading ${modeTitle}`,
      description: `${duration / 1000}s session • ${adaptiveDifficulty ? 'Adaptive on' : 'Standard'}`,
      variant: 'info',
      duration: 1800,
    });
    router.push('/game');
  };

  const modes: { id: GameMode; title: string; desc: string; category: Exclude<Category, 'All'> }[] = [
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

  const categories: Exclude<Category, 'All'>[] = ['Flicking', 'Tracking', 'Speed', 'Precision'];
  const filterChips: Category[] = ['All', ...categories];

  // Filtered modes based on search + category
  const filteredAll = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return modes.filter(m => {
      const matchesSearch = q === '' ||
        m.title.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const totalResults = filteredAll.length;
  const hasFilters = searchQuery.trim() !== '' || activeCategory !== 'All';

  const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scroll = (category: string, direction: 'left' | 'right') => {
    const container = scrollRefs.current[category];
    if (container) {
      const cardWidth = 320 + 16;
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-[#ededed] font-sans relative overflow-y-auto">
      <Sidebar />
      <div className="pl-20">
        <div className="flex flex-col items-center p-6">
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
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
                  aim<span className="neon-text text-red-600">X</span>
                </h1>
              </motion.div>
              <motion.p variants={heroItemVariants} className="text-[#9a9a9a] text-base md:text-lg tracking-wide mb-6 max-w-md">
                Improve your accuracy, reaction time, and mouse control with competitive aim training scenarios built for every skill level.
              </motion.p>
            </motion.div>
          </header>

          {/* Search Bar + Category chips */}
          <div className="relative z-10 w-full max-w-2xl mx-auto mb-8 flex flex-col gap-4" id="main-content">
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888] pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <label htmlFor="mode-search" className="sr-only">Search game modes</label>
              <input
                id="mode-search"
                type="text"
                placeholder="Search game modes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-describedby="search-results-count"
                className="w-full pl-12 pr-12 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-[#888888] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#888888] hover:text-white transition-colors p-1 rounded"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category chips */}
            <div className="flex items-center justify-center flex-wrap gap-2" role="group" aria-label="Filter by category">
              {filterChips.map(chip => {
                const isActive = activeCategory === chip;
                const count = chip === 'All'
                  ? modes.length
                  : modes.filter(m => m.category === chip).length;
                return (
                  <button
                    key={chip}
                    onClick={() => setActiveCategory(chip)}
                    aria-pressed={isActive}
                    className={`
                      px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200
                      border
                      ${isActive
                        ? 'bg-red-600/15 border-red-500/40 text-red-300 shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                        : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:border-white/20'
                      }
                    `}
                  >
                    {chip}
                    <span className={`ml-1.5 text-[10px] ${isActive ? 'text-red-200/80' : 'text-white/30'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <main id="main-content-section" className="w-full max-w-5xl relative z-10 flex flex-col space-y-16 pb-24">
            {/* Empty state */}
            {totalResults === 0 && (
              <div
                role="status"
                className="flex flex-col items-center justify-center py-16 px-6 text-center bg-[#0e0e11]/60 border border-dashed border-white/10 rounded-2xl"
              >
                <div className="p-4 rounded-full bg-white/[0.03] border border-white/10 mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/40" aria-hidden="true">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="8" y1="11" x2="14" y2="11"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No game modes found</h2>
                <p className="text-sm text-white/50 max-w-sm mb-6">
                  We couldn&apos;t find any modes matching your filters. Try a different search term or category.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl bg-white text-black text-sm font-bold tracking-wide hover:bg-neutral-100 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            )}

            {totalResults > 0 && categories.map((category) => {
              if (activeCategory !== 'All' && activeCategory !== category) return null;

              const categoryModes = filteredAll.filter(m => m.category === category);
              if (categoryModes.length === 0) return null;

              const showArrows = categoryModes.length > 3;

              return (
                <section
                  key={category}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className="relative"
                  aria-labelledby={`category-${category}`}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-6">
                    <h2 id={`category-${category}`} className="text-lg font-bold text-white uppercase tracking-[0.2em]">{category}</h2>
                    <span className="text-xs text-white/40">({categoryModes.length})</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" aria-hidden="true"></div>
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
                      aria-label={`Scroll ${category} modes left`}
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
                      aria-label={`Scroll ${category} modes right`}
                    >
                      <ChevronRight />
                    </button>
                  )}

                  {/* Horizontal scrollable cards */}
                  <div
                    ref={(el) => { scrollRefs.current[category] = el; }}
                    className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide items-start px-1"
                    role="list"
                    aria-label={`${category} game modes`}
                  >
                    {categoryModes.map((m) => {
                      const isSelected = selectedMode === m.id;

                      return (
                        <div
                          key={m.id}
                          role="listitem"
                          tabIndex={0}
                          onClick={() => handleCardClick(m.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleCardClick(m.id);
                            }
                          }}
                          aria-pressed={isSelected}
                          aria-label={`${m.title}: ${m.desc}`}
                          className={`
                            relative rounded-2xl p-6 cursor-pointer transition-all duration-300 flex-shrink-0
                            w-[280px] md:w-[320px]
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080a]
                            ${isSelected
                              ? 'bg-gradient-to-br from-[#1a1a1f] to-[#141418] border-2 border-red-600/40 shadow-[0_0_40px_rgba(220,38,38,0.15)]'
                              : 'bg-[#111114]/80 border border-white/5 hover:border-white/10 hover:bg-[#161619]'
                            }
                          `}
                        >
                          {isSelected && (
                            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent" aria-hidden="true"></div>
                          )}

                          <div className="flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                              <h3 className={`text-xl font-bold tracking-tight transition-colors ${isSelected ? 'text-white' : 'text-[#cccccc]'}`}>
                                {m.title}
                              </h3>
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 ml-2 mt-1" aria-hidden="true"></div>
                              )}
                            </div>

                            <p className="text-[#9a9a9a] text-sm leading-relaxed min-h-[72px]">{m.desc}</p>

                            {isSelected && (
                              <div className="mt-4 card-controls-enter" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                <div className="flex gap-2 mb-3" role="radiogroup" aria-label="Session duration">
                                  {[30000, 60000, 100000].map(d => (
                                    <button
                                      key={d}
                                      role="radio"
                                      aria-checked={duration === d}
                                      onClick={(e) => { e.stopPropagation(); setDuration(d); }}
                                      className={`
                                        flex-1 py-2.5 rounded-lg text-xs font-bold transition-all duration-200
                                        ${duration === d
                                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                          : 'bg-white/5 text-[#aaaaaa] border border-transparent hover:text-white hover:bg-white/10'
                                        }
                                      `}
                                    >
                                      {d / 1000}s
                                    </button>
                                  ))}
                                </div>

                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={adaptiveDifficulty}
                                  onClick={(e) => { e.stopPropagation(); setAdaptiveDifficulty(!adaptiveDifficulty); }}
                                  className={`
                                    w-full flex items-center justify-between mb-3 p-3 rounded-lg cursor-pointer transition-all duration-200 text-left
                                    ${adaptiveDifficulty
                                      ? 'bg-amber-500/10 border border-amber-500/30'
                                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }
                                  `}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className={`text-xs font-medium transition-colors ${adaptiveDifficulty ? 'text-amber-400' : 'text-[#bbbbbb]'}`}>
                                        Adaptive Difficulty
                                      </span>
                                      <span className="text-[10px] text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">BETA</span>
                                    </div>
                                    <span className="text-[10px] text-[#888888]">
                                      {(m.id === 'tracking' || m.id === 'switch-tracking' || m.id === 'smooth-aiming' || m.id === 'dropshot')
                                        ? 'Target shrinks & speeds up over time'
                                        : 'Adjusts based on your performance'
                                      }
                                    </span>
                                  </div>
                                  <div className={`relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0 ${adaptiveDifficulty ? 'bg-amber-500' : 'bg-white/20'}`} aria-hidden="true">
                                    <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 bg-white shadow-sm ${adaptiveDifficulty ? 'left-6' : 'left-1'}`} />
                                  </div>
                                </button>

                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStart(m.id, m.title); }}
                                  disabled={isNavigating}
                                  aria-label={`Start ${m.title} session`}
                                  className="w-full py-3.5 rounded-xl font-bold text-sm tracking-widest transition-all duration-200 bg-white hover:bg-neutral-100 text-black active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait flex items-center justify-center gap-2"
                                >
                                  {isNavigating ? (
                                    <>
                                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                      </svg>
                                      LOADING
                                    </>
                                  ) : 'START'}
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

          {/* Footer */}
          <footer className="relative z-10 w-full max-w-5xl py-8 flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs tracking-widest">
              <span className="text-[#666666] font-medium">MADE BY</span>
              <span className="text-[#888888] font-bold">UXTITLED</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-xl bg-[#111114]/95 border border-white/10 text-white/70 hover:text-white hover:border-white/20 hover:bg-[#1a1a1f] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:scale-105"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
