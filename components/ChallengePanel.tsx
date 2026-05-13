'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  loadChallengeSet,
  saveChallengeSet,
  loadCumulativeStats,
  getCurrentDateStr,
  needsRefresh,
} from '@/lib/challengeStore';
import { generateChallengeSet, getWeekStart } from '@/lib/challengeGenerator';
import { ChallengeSet, CumulativeStats, Challenge } from '@/lib/challengeTypes';

// --- Icons ---
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// --- Header ---
const PanelHeader = ({ title, onClose }: { title: string; onClose: () => void }) => (
  <div className="flex items-center justify-between p-5 border-b border-white/10 h-[72px]">
    <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
    <button onClick={onClose} className="p-2 rounded-lg text-[#666666] hover:text-white hover:bg-white/10 transition-all" aria-label="Close panel">
      <CloseIcon />
    </button>
  </div>
);

// --- Helpers ---
function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getTimeUntilNextMonday(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  const diff = nextMonday.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  return `${hours}h ${minutes}m`;
}

function getDifficultyColor(difficulty: Challenge['difficulty']): string {
  switch (difficulty) {
    case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-white/10 text-white/60 border-white/20';
  }
}

function getProgressPercent(challenge: Challenge): number {
  if (challenge.completed) return 100;
  if (challenge.targetValue === 0) return 0;

  // For reaction_time, lower is better
  if (challenge.objectiveType === 'reaction_time') {
    if (challenge.currentValue === 0) return 0;
    if (challenge.currentValue <= challenge.targetValue) return 100;
    const maxReaction = 500;
    const progress = ((maxReaction - challenge.currentValue) / (maxReaction - challenge.targetValue)) * 100;
    return Math.max(0, Math.min(100, progress));
  }

  return Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
}

function getProgressText(challenge: Challenge): string {
  switch (challenge.objectiveType) {
    case 'score_threshold':
      return `${challenge.currentValue}/${challenge.targetValue} pts`;
    case 'accuracy_threshold':
      return `${Math.round(challenge.currentValue)}%/${challenge.targetValue}%`;
    case 'hit_count':
      return `${challenge.currentValue}/${challenge.targetValue} hits`;
    case 'session_count':
      return `${challenge.currentValue}/${challenge.targetValue} sessions`;
    case 'reaction_time':
      return challenge.currentValue === 0
        ? `—/${challenge.targetValue}ms`
        : `${Math.round(challenge.currentValue)}ms/${challenge.targetValue}ms`;
    default:
      return `${challenge.currentValue}/${challenge.targetValue}`;
  }
}

// --- Challenge Card ---
const ChallengeCard = ({ challenge, index }: { challenge: Challenge; index: number }) => {
  const percent = getProgressPercent(challenge);
  const isCompleted = challenge.completed;
  const isInProgress = !isCompleted && challenge.currentValue > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`
        rounded-lg border p-4 transition-all
        ${isCompleted
          ? 'border-green-500/20 bg-green-500/5 opacity-80'
          : isInProgress
            ? 'border-white/15 bg-white/5'
            : 'border-white/10 bg-white/[0.02]'
        }
      `}
    >
      {/* Top row: difficulty badge + completion status */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyColor(challenge.difficulty)}`}>
          {challenge.difficulty}
        </span>
        {isCompleted && (
          <span className="text-green-400">
            <CheckIcon />
          </span>
        )}
      </div>

      {/* Description */}
      <p className={`text-sm mb-3 ${isCompleted ? 'text-white/60' : 'text-white/90'}`}>
        {challenge.description}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
        <motion.div
          className={`h-full rounded-full ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Progress text */}
      <p className="text-xs text-white/50">
        {getProgressText(challenge)}
      </p>
    </motion.div>
  );
};

// --- Main Component ---
const ChallengePanel = ({ onClose }: { onClose: () => void }) => {
  const [challengeSet, setChallengeSet] = useState<ChallengeSet | null>(null);
  const [stats, setStats] = useState<CumulativeStats | null>(null);
  const [dailyCountdown, setDailyCountdown] = useState<string>(getTimeUntilMidnight());
  const [weeklyCountdown, setWeeklyCountdown] = useState<string>(getTimeUntilNextMonday());

  const loadData = useCallback(() => {
    let set = loadChallengeSet();
    if (needsRefresh(set)) {
      const today = getCurrentDateStr();
      set = generateChallengeSet(today);
      saveChallengeSet(set);
    }
    setChallengeSet(set);
    setStats(loadCumulativeStats());
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Countdown timer — every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setDailyCountdown(getTimeUntilMidnight());
      setWeeklyCountdown(getTimeUntilNextMonday());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Day-rollover detection — every 60 seconds
  useEffect(() => {
    const rolloverCheck = setInterval(() => {
      const set = loadChallengeSet();
      if (needsRefresh(set)) {
        loadData();
      }
    }, 60000);
    return () => clearInterval(rolloverCheck);
  }, [loadData]);

  return (
    <div className="h-full flex flex-col bg-[#111114]">
      <PanelHeader title="Challenges" onClose={onClose} />

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-white font-bold text-sm">{stats?.currentStreak ?? 0}</span>
            <span className="text-white/40 text-xs">streak</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/60 text-xs">{stats?.totalCompleted ?? 0}</span>
            <span className="text-white/40 text-xs">completed</span>
          </div>
        </div>

        {/* Daily Challenges Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/80">Daily</h3>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-white/50 text-[11px] font-mono">{dailyCountdown}</span>
            </div>
          </div>

          {challengeSet?.dailyChallenges.map((challenge, i) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={i} />
          ))}
        </div>

        {/* Weekly Challenges Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white/80">Weekly</h3>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-white/50 text-[11px] font-mono">{weeklyCountdown}</span>
            </div>
          </div>

          {challengeSet?.weeklyChallenges.map((challenge, i) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={i + 4} />
          ))}
        </div>

        {!challengeSet && (
          <div className="text-center py-8 text-white/40 text-sm">
            Loading challenges...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengePanel;
