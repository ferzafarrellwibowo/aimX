'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getMockLeaderboard, getMockFriendsLeaderboard, PlayerScore } from '../lib/mockData';
import ViewProfileModal from '@/components/ViewProfileModal';

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const TrophyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GAME_MODES = [
  { id: 'grid', name: 'Gridshot' },
  { id: 'flick', name: 'Flick Shot' },
  { id: 'microshot', name: 'Microshot' },
  { id: 'speed', name: 'Rapid Shot' },
  { id: 'reflex', name: 'Reflex Shots' },
  { id: 'burst', name: 'Timed Pressure' },
  { id: 'precision', name: 'Exact Aiming' },
  { id: 'smooth-aiming', name: 'Smooth Aiming' },
  { id: 'tracking', name: 'Strafe Tracking' },
  { id: 'switch-tracking', name: 'Switch Tracking' },
  { id: 'dropshot', name: 'Dropshot' },
];

const getBadgeColor = (badge: string): string => {
  const colors: Record<string, string> = {
    "Aim Addict": "text-purple-400",
    "High Roller": "text-orange-400",
    "Legendary Run": "text-orange-500",
    "Magnet Aim": "text-cyan-400",
    "Sharp Eyes": "text-teal-400",
    "Top 1%": "text-yellow-300",
    "Top 5%": "text-slate-300",
    "Top 10%": "text-amber-500",
    "Ultra Instinct": "text-fuchsia-400",
    "Aim Never Sleeps": "text-purple-400",
    "Endless Training": "text-blue-400",
    "Lightning Reflex": "text-blue-400",
    "Missed Everything": "text-orange-400",
    "Potato Aim": "text-amber-600",
    "Quickscope": "text-cyan-400",
    "Skull Cracker": "text-red-500",
    "Weekly Warrior": "text-green-400",
  };
  return colors[badge] || "text-white/40";
};

export default function LeaderboardModal({ isOpen, onClose }: LeaderboardModalProps) {
  const [selectedMode, setSelectedMode] = useState('grid');
  const [scope, setScope] = useState<'global' | 'friends'>('global');
  const [leaderboardData, setLeaderboardData] = useState<PlayerScore[]>([]);
  const [myScore, setMyScore] = useState<number | null>(null);
  const [isFilterHovered, setIsFilterHovered] = useState(false);
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const [viewPlayer, setViewPlayer] = useState<{id: string; username: string; badge: string} | null>(null);

  const scrollFilter = (direction: 'left' | 'right') => {
    if (filterScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      filterScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (scope === 'global') {
        setLeaderboardData(getMockLeaderboard(selectedMode));
      } else {
        setLeaderboardData(getMockFriendsLeaderboard(selectedMode));
      }
      const savedScores = localStorage.getItem('aimX_highscores');
      if (savedScores) {
        try {
          const parsed = JSON.parse(savedScores);
          setMyScore(parsed[selectedMode] || null);
        } catch (e) {}
      } else {
        setMyScore(null);
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, selectedMode, scope]);

  if (!isOpen) return null;

  const selectedModeName = GAME_MODES.find(m => m.id === selectedMode)?.name || '';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl bg-[#0e0e11] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col h-[80vh] overflow-hidden"
        style={{ animation: 'modalFadeIn 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-amber-600/10 text-yellow-500 rounded-xl border border-yellow-500/20">
              <TrophyIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Leaderboard</h2>
              <p className="text-xs text-white/40 mt-0.5">{selectedModeName} • {scope === 'global' ? 'Global' : 'Friends'}</p>
            </div>
          </div>

          {/* Scope Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
            <button
              onClick={() => setScope('global')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                scope === 'global' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              <GlobeIcon />
              Global
            </button>
            <button
              onClick={() => setScope('friends')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                scope === 'friends' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'
              }`}
            >
              <UsersIcon />
              Friends
            </button>
          </div>
        </div>

        {/* Game Mode Filter */}
        <div
          className="relative border-b border-white/5 bg-[#0a0a0d]"
          onMouseEnter={() => setIsFilterHovered(true)}
          onMouseLeave={() => setIsFilterHovered(false)}
        >
          {/* Left Arrow */}
          <button
            onClick={() => scrollFilter('left')}
            className={`
              absolute left-1 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-lg bg-[#0e0e11]/95 backdrop-blur-md
              border border-white/15 text-white/70 hover:text-white
              hover:bg-white/10 hover:scale-105
              shadow-[0_4px_16px_rgba(0,0,0,0.6)]
              transition-all duration-300 ease-out
              ${isFilterHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 pointer-events-none'}
            `}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scrollFilter('right')}
            className={`
              absolute right-1 top-1/2 -translate-y-1/2 z-10
              p-2 rounded-lg bg-[#0e0e11]/95 backdrop-blur-md
              border border-white/15 text-white/70 hover:text-white
              hover:bg-white/10 hover:scale-105
              shadow-[0_4px_16px_rgba(0,0,0,0.6)]
              transition-all duration-300 ease-out
              ${isFilterHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}
            `}
            aria-label="Scroll right"
          >
            <ChevronRightIcon />
          </button>

          {/* Scrollable filter */}
          <div ref={filterScrollRef} className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-hide">
            {GAME_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                  selectedMode === mode.id
                    ? 'bg-red-600 text-white shadow-[0_0_12px_rgba(220,38,38,0.3)]'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-transparent hover:border-white/10'
                }`}
              >
                {mode.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-[#0e0e11] border-b border-white/5 text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-5">Player</div>
          <div className="col-span-3 flex justify-end">Accuracy</div>
          <div className="col-span-3 flex justify-end">Score</div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* User's Score */}
          {myScore !== null && (
            <div className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center bg-indigo-500/8 border-b border-indigo-500/15 sticky top-0 z-20 backdrop-blur-md">
              <div className="col-span-1 text-center">
                <span className="text-xs font-bold text-indigo-400">—</span>
              </div>
              <div className="col-span-5">
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  You
                  <span className="text-[9px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold border border-indigo-500/20">YOUR BEST</span>
                </span>
              </div>
              <div className="col-span-3 flex justify-end text-white/40 text-sm font-mono">—</div>
              <div className="col-span-3 flex justify-end">
                <span className="font-mono font-bold text-indigo-400 text-base">{myScore.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Player Rows */}
          {leaderboardData.map((player, idx) => (
            <div
              key={player.id}
              onClick={() => setViewPlayer({ id: player.id, username: player.username, badge: player.badge })}
              className={`
                grid grid-cols-12 gap-3 px-6 py-3.5 items-center border-b border-white/[0.03]
                transition-colors duration-150 hover:bg-white/[0.03] cursor-pointer
                ${idx === 0 ? 'bg-yellow-500/[0.04]' : ''}
                ${idx === 1 ? 'bg-slate-300/[0.03]' : ''}
                ${idx === 2 ? 'bg-amber-700/[0.03]' : ''}
              `}
            >
              {/* Rank */}
              <div className="col-span-1 flex justify-center">
                {idx === 0 ? (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400/30 to-yellow-600/20 text-yellow-400 flex items-center justify-center text-xs font-black border border-yellow-500/30">1</span>
                ) : idx === 1 ? (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300/20 to-slate-400/10 text-slate-300 flex items-center justify-center text-xs font-black border border-slate-400/20">2</span>
                ) : idx === 2 ? (
                  <span className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-700/10 text-amber-500 flex items-center justify-center text-xs font-black border border-amber-600/20">3</span>
                ) : (
                  <span className="text-xs text-white/30 font-semibold">{idx + 1}</span>
                )}
              </div>

              {/* Player */}
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-white/40">{player.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-semibold truncate ${idx < 3 ? 'text-white' : 'text-white/80'}`}>
                    {player.username}
                  </span>
                  <span className={`text-[10px] font-medium ${getBadgeColor(player.badge)}`}>{player.badge}</span>
                </div>
              </div>

              {/* Accuracy */}
              <div className="col-span-3 flex justify-end">
                <span className="text-sm font-mono text-white/60">
                  {player.accuracy.toFixed(1)}%
                </span>
              </div>

              {/* Score */}
              <div className="col-span-3 flex justify-end">
                <span className={`font-mono font-bold text-sm ${idx < 3 ? 'text-white' : 'text-white/70'}`}>
                  {player.score.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-[#0a0a0d] flex items-center justify-between">
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
            {leaderboardData.length} players • Updated live
          </span>
          <span className="text-[10px] text-white/25 uppercase tracking-wider font-medium">
            Click outside to close
          </span>
        </div>
      </div>
      <ViewProfileModal
        isOpen={!!viewPlayer}
        onClose={() => setViewPlayer(null)}
        player={viewPlayer || {id:'',username:'',badge:''}}
      />
    </div>
  );
}
