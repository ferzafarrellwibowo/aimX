'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GameCanvas from '@/components/GameCanvas';
import Heatmap from '@/components/Heatmap';
import ErrorBoundary from '@/components/ErrorBoundary';
import { GameSettings, GameState, ClickPoint, buildSessionResult } from '@/lib/gameEngine';
import { handleGameOver as handleChallengeGameOver, GameOverResult } from '@/lib/challengeIntegration';
import { useToast } from '@/components/Toast';
import { saveSession, getLastSession, SessionHistoryEntry } from '@/lib/sessionHistory';

export default function GamePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [finalState, setFinalState] = useState<GameState | null>(null);
  const [highScore, setHighScore] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [selectedWave, setSelectedWave] = useState<number>(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [previousSession, setPreviousSession] = useState<SessionHistoryEntry | null>(null);

  const handleRestart = () => {
    setFinalState(null);
    setIsNewHighScore(false);
    setSelectedWave(0);
    setPreviousSession(null);
  };

  useEffect(() => {
    const saved = localStorage.getItem('aimX_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch {
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
        if (finalState) {
          // On game over screen, ESC goes to menu directly
          router.push('/');
        } else if (showExitConfirm) {
          setShowExitConfirm(false);
        } else {
          // During gameplay, show confirmation
          setShowExitConfirm(true);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        if (finalState) {
          handleRestart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, finalState, showExitConfirm]);

  const handleGameOver = (state: GameState) => {
    setFinalState(state);

    const isTrackingMode = settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot';
    const totalClicks = state.hits + state.misses;
    const accuracy = isTrackingMode
      ? (state.trackingTicks > 0 ? (state.trackingHits / state.trackingTicks) * 100 : 0)
      : (totalClicks > 0 ? (state.hits / totalClicks) * 100 : 0);
    const avgReaction = state.hits > 0 ? Math.round(state.totalReactionTime / state.hits) : 0;

    // Save session to history
    if (settings) {
      saveSession({
        mode: settings.mode,
        score: state.score,
        accuracy: Math.round(accuracy * 10) / 10,
        avgReaction,
        duration: settings.duration,
        timestamp: new Date().toISOString(),
        hits: state.hits,
        misses: state.misses,
      });

      // Load previous session for comparison
      const prev = getLastSession(settings.mode);
      setPreviousSession(prev);
    }

    // Check high score
    const key = `aimX_highscore_${settings?.mode}`;
    const currentHigh = parseInt(localStorage.getItem(key) || '0', 10);
    if (state.score > currentHigh) {
      localStorage.setItem(key, state.score.toString());
      setHighScore(state.score);
      setIsNewHighScore(true);
      setTimeout(() => {
        showToast({
          title: 'New high score!',
          description: `${state.score} points • previous best ${currentHigh.toLocaleString()}`,
          variant: 'achievement',
          duration: 4500,
        });
      }, 600);
    } else {
      setHighScore(currentHigh);
      setIsNewHighScore(false);
    }

    // Evaluate challenges
    if (settings) {
      const sessionResult = buildSessionResult(state, settings);
      const result: GameOverResult = handleChallengeGameOver(sessionResult);
      if (result.challengesCompleted.length > 0) {
        setTimeout(() => {
          const count = result.challengesCompleted.length;
          showToast({
            title: count === 1 ? 'Challenge complete!' : `${count} challenges complete!`,
            description: 'Open the Challenges panel to see your progress.',
            variant: 'achievement',
            duration: 5000,
          });
        }, 1100);
      }
      if (result.newUnlocks.length > 0) {
        setTimeout(() => {
          showToast({
            title: result.newUnlocks.length === 1 ? 'Reward unlocked!' : `${result.newUnlocks.length} rewards unlocked!`,
            description: 'Equip your new rewards from your profile.',
            variant: 'achievement',
            duration: 5000,
          });
        }, 1700);
      }
    }
  };

  // Improvement delta helper
  const getImprovementDelta = (current: number, previous: number | undefined): { value: number; isPositive: boolean } | null => {
    if (previous === undefined || previous === 0) return null;
    const delta = current - previous;
    return { value: delta, isPositive: delta > 0 };
  };

  if (!settings) return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center" role="status">Loading...</div>;

  return (
    <ErrorBoundary>
      <div className="w-full h-screen bg-[#0a0a0a] overflow-hidden relative font-sans">
        {!finalState ? (
          <>
            {/* Keyboard hint - improved contrast */}
            <div className="absolute bottom-6 right-6 z-50 flex items-center gap-3 text-[10px] text-white/50 uppercase tracking-widest">
              <span className="px-2 py-1 bg-[#1a1a1a]/80 border border-white/10 rounded text-white/60 font-mono">ESC</span>
              <span>Menu</span>
            </div>
            
            <GameCanvas 
              settings={settings}
              onGameOver={handleGameOver}
              onRestart={handleRestart}
            />

            {/* Exit Confirmation Modal */}
            {showExitConfirm && (
              <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="exit-confirm-title">
                <div className="bg-[#111114] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
                  <h3 id="exit-confirm-title" className="text-lg font-bold text-white mb-2">Leave game?</h3>
                  <p className="text-sm text-white/70 mb-6">Your current progress will be lost.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowExitConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 font-semibold text-sm hover:bg-white/10 transition-colors"
                      autoFocus
                    >
                      Keep playing
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-colors"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white overflow-y-auto animate-in fade-in zoom-in duration-300" role="dialog" aria-modal="true" aria-labelledby="game-over-title">
            <div className="flex flex-col items-center space-y-8 py-8">
              <h2 id="game-over-title" className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-rose-400 drop-shadow-2xl">
                TIME&apos;S UP
              </h2>
              
              <div className="w-full max-w-4xl">
                <div className="flex flex-col lg:flex-row gap-6 w-full">
                {/* Stats Card */}
                <div className={`flex-1 bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] text-center relative overflow-hidden ${
                  (settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot')
                    ? 'grid grid-cols-3 gap-6 items-start'
                    : 'grid grid-cols-2 gap-6 items-start'
                }`}>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" aria-hidden="true"></div>
                  
                  {/* Score Section */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2">Score</div>
                    <div className="text-4xl font-black text-white">{finalState.score}</div>
                    {/* Improvement indicator */}
                    {(() => {
                      const delta = getImprovementDelta(finalState.score, previousSession?.score);
                      if (delta) {
                        return (
                          <div className={`text-[10px] font-bold mt-1 ${delta.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {delta.isPositive ? '↑' : '↓'} {Math.abs(delta.value).toLocaleString()} vs last
                          </div>
                        );
                      }
                      return null;
                    })()}
                    {isNewHighScore ? (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        New high score
                      </div>
                    ) : (
                      <div className="text-xs text-white/50 font-bold uppercase tracking-widest mt-2">Best: <span className="text-indigo-400">{highScore.toLocaleString()}</span></div>
                    )}
                  </div>
                  
                  {/* Accuracy Section */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2">
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
                    {/* Accuracy improvement */}
                    {(() => {
                      const currentAcc = settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot'
                        ? (finalState.trackingTicks > 0 ? (finalState.trackingHits / finalState.trackingTicks) * 100 : 0)
                        : (finalState.hits + finalState.misses > 0 ? (finalState.hits / (finalState.hits + finalState.misses)) * 100 : 0);
                      const delta = getImprovementDelta(Math.round(currentAcc * 10) / 10, previousSession?.accuracy);
                      if (delta) {
                        return (
                          <div className={`text-[10px] font-bold mt-1 ${delta.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                            {delta.isPositive ? '↑' : '↓'} {Math.abs(delta.value).toFixed(1)}% vs last
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>

                  {/* Tracking: Time On Target as 3rd column */}
                  {(settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot') && (
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2">Time On Target</div>
                      <div className="text-4xl font-black text-indigo-400">
                        {((finalState.trackingHits * 100) / 1000).toFixed(1)}s
                      </div>
                    </div>
                  )}

                  {/* Non-tracking: Hits/Misses + Avg Reaction */}
                  {settings?.mode !== 'tracking' && settings?.mode !== 'switch-tracking' && settings?.mode !== 'smooth-aiming' && settings?.mode !== 'dropshot' && (
                    <>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2">Hits / Misses</div>
                        <div className="text-2xl font-bold">
                          <span className="text-indigo-400">{finalState.hits}</span> <span className="text-zinc-600">/</span> <span className="text-rose-400">{finalState.misses}</span>
                        </div>
                      </div>

                      <div className="relative z-10 flex flex-col items-center">
                        <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest mb-2">Avg Reaction</div>
                        <div className="text-2xl font-bold text-white">
                          {finalState.hits > 0 ? Math.round(finalState.totalReactionTime / finalState.hits) : 0}ms
                        </div>
                        {/* Reaction improvement (lower is better) */}
                        {(() => {
                          const currentReaction = finalState.hits > 0 ? Math.round(finalState.totalReactionTime / finalState.hits) : 0;
                          if (previousSession && previousSession.avgReaction > 0 && currentReaction > 0) {
                            const delta = previousSession.avgReaction - currentReaction;
                            return (
                              <div className={`text-[10px] font-bold mt-1 ${delta > 0 ? 'text-green-400' : delta < 0 ? 'text-red-400' : 'text-white/40'}`}>
                                {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'} {Math.abs(delta)}ms vs last
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </>
                  )}

                  {settings?.mode === 'burst' && (
                    <div className="col-span-2 space-y-1 relative z-10 pt-4 border-t border-white/10">
                      <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Waves Completed</div>
                      <div className="text-2xl font-bold text-amber-400">
                        {finalState.waveClickHistory?.length || 0} / {finalState.totalWaves}
                      </div>
                    </div>
                  )}

                  {settings?.adaptiveDifficulty && (
                    <div className={`space-y-1 relative z-10 pt-4 border-t border-white/10 ${
                      (settings?.mode === 'tracking' || settings?.mode === 'switch-tracking' || settings?.mode === 'smooth-aiming' || settings?.mode === 'dropshot')
                        ? 'col-span-3'
                        : 'col-span-2'
                    }`}>
                      <div className="text-[#a1a1aa] text-xs font-bold uppercase tracking-widest">Mode</div>
                      <div className="text-sm font-bold text-amber-400">Adaptive Difficulty</div>
                    </div>
                  )}
                </div>

                {/* Heatmap Card */}
                {settings?.mode !== 'tracking' && settings?.mode !== 'switch-tracking' && settings?.mode !== 'smooth-aiming' && settings?.mode !== 'dropshot' && (
                  <div className="bg-[#111111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                    {settings?.mode === 'burst' && finalState.waveClickHistory && finalState.waveClickHistory.length > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => setSelectedWave(prev => Math.max(0, prev - 1))}
                          disabled={selectedWave === 0}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          aria-label="Previous wave"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                          aria-label="Next wave"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full max-w-md">
                <button
                  onClick={handleRestart}
                  className="flex-1 bg-[#ededed] hover:bg-white text-black font-bold text-sm tracking-wider py-4 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-[10px] px-1.5 py-0.5 bg-black/10 rounded font-mono">R</span>
                  PLAY AGAIN
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="flex-1 bg-[#1a1a1a] hover:bg-[#222222] border border-white/10 text-white font-bold text-sm tracking-wider py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded font-mono">ESC</span>
                  MENU
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
