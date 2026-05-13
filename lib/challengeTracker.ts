import { Challenge, ChallengeSet, CumulativeStats, SessionResult, UnlockedReward, MilestoneDefinition } from '@/lib/challengeTypes';

/**
 * Checks whether a challenge's current value meets or exceeds its target threshold.
 * For reaction_time objectives, lower is better (currentValue <= targetValue).
 * For all other objectives, higher is better (currentValue >= targetValue).
 */
export function meetsThreshold(challenge: Challenge): boolean {
  if (challenge.objectiveType === 'reaction_time') {
    return challenge.currentValue > 0 && challenge.currentValue <= challenge.targetValue;
  }
  return challenge.currentValue >= challenge.targetValue;
}

/**
 * Evaluates a single challenge against a session result.
 * Updates challenge progress and marks as completed when threshold is met.
 */
function evaluateChallenge(challenge: Challenge, sessionResult: SessionResult): void {
  // Skip already completed challenges
  if (challenge.completed) return;

  // Skip if the challenge's target mode doesn't match the session's mode
  if (challenge.targetMode !== sessionResult.mode) return;

  // Update currentValue based on objective type
  switch (challenge.objectiveType) {
    case 'score_threshold':
      challenge.currentValue = Math.max(challenge.currentValue, sessionResult.score);
      break;

    case 'accuracy_threshold': {
      const total = sessionResult.hits + sessionResult.misses;
      const accuracy = total > 0 ? (sessionResult.hits / total) * 100 : 0;
      challenge.currentValue = Math.max(challenge.currentValue, accuracy);
      break;
    }

    case 'hit_count':
      challenge.currentValue += sessionResult.hits;
      break;

    case 'session_count':
      challenge.currentValue += 1;
      break;

    case 'reaction_time':
      if (sessionResult.avgReactionTime > 0) {
        challenge.currentValue =
          challenge.currentValue === 0
            ? sessionResult.avgReactionTime
            : Math.min(challenge.currentValue, sessionResult.avgReactionTime);
      }
      break;
  }

  // Check if threshold is now met
  if (meetsThreshold(challenge)) {
    challenge.completed = true;
    challenge.completedAt = new Date().toISOString();
  }
}

/**
 * Evaluates a game session result against the active challenge set.
 * Updates challenge progress based on objective type rules and marks
 * challenges as completed when thresholds are met.
 * Iterates over both dailyChallenges and weeklyChallenges.
 */
export function evaluateSession(
  sessionResult: SessionResult,
  challengeSet: ChallengeSet
): ChallengeSet {
  for (const challenge of challengeSet.dailyChallenges) {
    evaluateChallenge(challenge, sessionResult);
  }

  for (const challenge of challengeSet.weeklyChallenges) {
    evaluateChallenge(challenge, sessionResult);
  }

  return challengeSet;
}

/**
 * Returns the previous day's date string in YYYY-MM-DD format.
 */
export function getYesterday(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Updates the streak based on the completion date.
 * - If lastCompletionDate === today: no change (already counted today)
 * - If lastCompletionDate === yesterday: increment currentStreak (consecutive day)
 * - Otherwise (gap or null): reset currentStreak to 1 (today counts as day 1)
 * Sets lastCompletionDate = today and updates longestStreak.
 */
export function updateStreak(stats: CumulativeStats, today: string): CumulativeStats {
  if (stats.lastCompletionDate === today) {
    // Already counted today, no change
    return stats;
  }

  const yesterday = getYesterday(today);

  if (stats.lastCompletionDate === yesterday) {
    // Consecutive day — increment streak
    stats.currentStreak += 1;
  } else {
    // Streak broken or first completion — reset to 1
    stats.currentStreak = 1;
  }

  stats.lastCompletionDate = today;
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);

  return stats;
}

/**
 * Updates cumulative stats when a challenge is completed.
 * - Increments totalCompleted by 1
 * - Checks if all daily challenges in the set are completed for a perfect day
 * - Calls updateStreak to handle streak logic
 */
export function updateStatsOnCompletion(
  stats: CumulativeStats,
  challengeSet: ChallengeSet,
  today: string
): CumulativeStats {
  // Increment total completed
  stats.totalCompleted += 1;

  // Check if all daily challenges are completed (perfect day)
  const allDailyCompleted = challengeSet.dailyChallenges.every((c) => c.completed);
  if (allDailyCompleted && !stats.perfectDayDates.includes(today)) {
    stats.perfectDays += 1;
    stats.perfectDayDates.push(today);
  }

  // Update streak
  stats = updateStreak(stats, today);

  return stats;
}

/**
 * Evaluates all milestone definitions against current cumulative stats.
 * Returns only newly unlocked rewards (milestones not already in currentRewards
 * whose conditions are now met).
 */
export function evaluateMilestones(
  stats: CumulativeStats,
  currentRewards: UnlockedReward[],
  milestones: MilestoneDefinition[]
): UnlockedReward[] {
  const newlyUnlocked: UnlockedReward[] = [];

  for (const milestone of milestones) {
    // Skip if already unlocked
    if (currentRewards.some((r) => r.milestoneId === milestone.id)) {
      continue;
    }

    // Check if condition is met
    let conditionMet = false;
    const { condition } = milestone;

    switch (condition.type) {
      case 'total_challenges':
        conditionMet = stats.totalCompleted >= condition.threshold;
        break;
      case 'streak_days':
        conditionMet =
          stats.currentStreak >= condition.threshold ||
          stats.longestStreak >= condition.threshold;
        break;
      case 'perfect_days':
        conditionMet = stats.perfectDays >= condition.threshold;
        break;
      case 'accuracy_avg':
        conditionMet = stats.avgAccuracy >= condition.threshold;
        break;
      case 'total_score':
        conditionMet = stats.totalScore >= condition.threshold;
        break;
      case 'total_sessions':
        conditionMet = stats.totalSessions >= condition.threshold;
        break;
      case 'single_score':
        conditionMet = stats.bestSingleScore >= condition.threshold;
        break;
      case 'reaction_best':
        conditionMet = stats.bestReactionTime > 0 && stats.bestReactionTime <= condition.threshold;
        break;
      case 'leaderboard_percentile':
        // Requires real leaderboard data — not evaluable client-side
        conditionMet = false;
        break;
    }

    if (conditionMet) {
      newlyUnlocked.push({
        milestoneId: milestone.id,
        unlockedAt: new Date().toISOString(),
      });
    }
  }

  return newlyUnlocked;
}
