'use client';

import React, { memo } from 'react';
import type { GameState, GameMode } from '@/lib/gameEngine';

interface HUDProps {
  state: GameState;
  duration: number;
  mode: GameMode;
}

export const HUD = memo(({ state, duration, mode }: HUDProps) => {
  const { score, hits, misses, timeLeft, totalReactionTime, trackingTicks, trackingHits } = state;
  const totalClicks = hits + misses;
  const accuracy = totalClicks > 0 ? ((hits / totalClicks) * 100).toFixed(1) : '100.0';
  const trackAccuracy = trackingTicks > 0 ? ((trackingHits / trackingTicks) * 100).toFixed(1) : '100.0';
  const timeSecs = (timeLeft / 1000).toFixed(1);
  const avgReactionMs = hits > 0 ? (totalReactionTime / hits).toFixed(0) : '0';
  
  const isTrackingMode = mode === 'tracking' || mode === 'switch-tracking' || mode === 'smooth-aiming' || mode === 'dropshot';

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none fade-in z-10 text-white">
      <div className="flex gap-8 font-sans text-xl md:text-2xl drop-shadow-md">
        <div className="text-white font-bold tracking-tight">Score <span className="opacity-60">{score}</span></div>
        <div className="text-white font-bold tracking-tight">Time <span className="opacity-60">{timeSecs}s</span></div>
      </div>
      
      <div className="flex flex-col items-end gap-1.5 font-sans text-sm md:text-base font-medium text-[#a1a1aa] drop-shadow-md uppercase tracking-wider">
        {isTrackingMode ? (
          <>
            <div>Track Accuracy <span className={Number(trackAccuracy) > 90 ? 'text-white' : 'text-rose-400'}>{trackAccuracy}%</span></div>
            <div>Time On Target <span className="text-indigo-400">{((trackingHits * 100) / 1000).toFixed(1)}s</span></div>
          </>
        ) : (
          <>
            <div>Accuracy <span className={Number(accuracy) > 90 ? 'text-white' : 'text-rose-400'}>{accuracy}%</span></div>
            <div>Reaction <span className="text-white">{avgReactionMs}ms</span></div>
            <div>Hits <span className="text-indigo-400">{hits}</span> / <span className="text-rose-400">{misses}</span></div>
          </>
        )}
      </div>
    </div>
  );
});

HUD.displayName = 'HUD';
