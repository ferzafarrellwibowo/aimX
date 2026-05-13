import { SessionResult, UnlockedReward } from '@/lib/challengeTypes';
import { evaluateSession, updateStatsOnCompletion, evaluateMilestones } from '@/lib/challengeTracker';
import {
  loadChallengeSet,
  saveChallengeSet,
  loadCumulativeStats,
  saveCumulativeStats,
  loadUnlockedRewards,
  saveUnlockedRewards,
  getCurrentDateStr,
  needsRefresh,
} from '@/lib/challengeStore';
import { generateChallengeSet } from '@/lib/challengeGenerator';
import { MILESTONE_DEFINITIONS } from '@/lib/milestoneDefinitions';

export interface GameOverResult {
  challengesCompleted: string[]; // IDs of challenges completed this session
  newUnlocks: UnlockedReward[];  // Newly unlocked rewards this session
}

export function handleGameOver(sessionResult: SessionResult): GameOverResult {
  // 1. Load current challenge set (generate if needed)
  let challengeSet = loadChallengeSet();
  if (needsRefresh(challengeSet)) {
    const today = getCurrentDateStr();
    challengeSet = generateChallengeSet(today);
    saveChallengeSet(challengeSet);
  }

  // At this point challengeSet is guaranteed non-null:
  // needsRefresh(null) returns true, so we always generate if null
  const activeSet = challengeSet!;

  // Track which challenges were incomplete before evaluation
  const allChallenges = [...activeSet.dailyChallenges, ...activeSet.weeklyChallenges];
  const previouslyCompleted = new Set(
    allChallenges.filter(c => c.completed).map(c => c.id)
  );

  // 2. Evaluate session against challenges
  const evaluatedSet = evaluateSession(sessionResult, activeSet);
  saveChallengeSet(evaluatedSet);

  // 3. Find newly completed challenges
  const allEvaluated = [...evaluatedSet.dailyChallenges, ...evaluatedSet.weeklyChallenges];
  const newlyCompleted = allEvaluated
    .filter(c => c.completed && !previouslyCompleted.has(c.id))
    .map(c => c.id);

  // 4. Update cumulative stats for each newly completed challenge
  let stats = loadCumulativeStats();
  const today = getCurrentDateStr();
  for (const _ of newlyCompleted) {
    stats = updateStatsOnCompletion(stats, evaluatedSet, today);
  }

  // Update gameplay stats (before milestone evaluation so new stats are available)
  stats.totalSessions += 1;
  stats.totalScore += sessionResult.score;
  stats.bestSingleScore = Math.max(stats.bestSingleScore, sessionResult.score);
  if (sessionResult.avgReactionTime > 0) {
    stats.bestReactionTime = stats.bestReactionTime === 0
      ? sessionResult.avgReactionTime
      : Math.min(stats.bestReactionTime, sessionResult.avgReactionTime);
  }
  // Update running average accuracy
  const total = sessionResult.hits + sessionResult.misses;
  if (total > 0) {
    const sessionAccuracy = (sessionResult.hits / total) * 100;
    stats.accuracySessionCount += 1;
    stats.avgAccuracy = stats.avgAccuracy + (sessionAccuracy - stats.avgAccuracy) / stats.accuracySessionCount;
  }

  saveCumulativeStats(stats);

  // 5. Evaluate milestones for new unlocks
  let currentRewards = loadUnlockedRewards();
  const newUnlocks = evaluateMilestones(stats, currentRewards, MILESTONE_DEFINITIONS);
  if (newUnlocks.length > 0) {
    currentRewards = [...currentRewards, ...newUnlocks];
    saveUnlockedRewards(currentRewards);
  }

  return {
    challengesCompleted: newlyCompleted,
    newUnlocks,
  };
}
