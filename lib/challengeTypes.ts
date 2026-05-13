import { GameMode } from '@/lib/gameEngine';

// --- Challenge Types ---

export type ChallengeObjectiveType =
  | 'score_threshold'
  | 'accuracy_threshold'
  | 'hit_count'
  | 'session_count'
  | 'reaction_time';

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export type GameModeCategory = 'Flicking' | 'Tracking' | 'Speed' | 'Precision';

export interface Challenge {
  id: string;
  objectiveType: ChallengeObjectiveType;
  targetMode: GameMode;
  targetValue: number;
  currentValue: number;
  difficulty: ChallengeDifficulty;
  description: string;
  completed: boolean;
  completedAt: string | null;
}

export interface ChallengeSet {
  date: string; // YYYY-MM-DD
  dailyChallenges: [Challenge, Challenge, Challenge, Challenge]; // 4 daily
  weeklyChallenges: [Challenge, Challenge, Challenge, Challenge, Challenge]; // 5 weekly
  weekStart: string; // YYYY-MM-DD (Monday of the current week)
  generatedAt: string; // ISO timestamp
}

// --- Cumulative Stats ---

export interface CumulativeStats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
  perfectDays: number;
  perfectDayDates: string[];
  // New stats for badge requirements
  totalSessions: number;
  totalScore: number;
  bestSingleScore: number;
  bestReactionTime: number; // lowest ms, 0 means not set
  avgAccuracy: number; // running average %
  accuracySessionCount: number; // number of sessions used to calculate avg
}

// --- Milestone & Rewards ---

export type RewardType = 'normal_border' | 'luxury_border' | 'badge';

export type MilestoneCondition =
  | { type: 'total_challenges'; threshold: number }
  | { type: 'streak_days'; threshold: number }
  | { type: 'perfect_days'; threshold: number }
  | { type: 'accuracy_avg'; threshold: number }       // Average accuracy across all sessions >= threshold%
  | { type: 'total_score'; threshold: number }        // Cumulative total score >= threshold
  | { type: 'total_sessions'; threshold: number }     // Total game sessions played >= threshold
  | { type: 'single_score'; threshold: number }       // Single session score >= threshold
  | { type: 'reaction_best'; threshold: number }      // Best reaction time <= threshold ms
  | { type: 'leaderboard_percentile'; threshold: number };  // Be in top X% on global leaderboard

export interface MilestoneDefinition {
  id: string;
  rewardType: RewardType;
  rewardImage: string;
  rewardName: string;
  condition: MilestoneCondition;
}

export interface UnlockedReward {
  milestoneId: string;
  unlockedAt: string; // ISO timestamp
}

// --- Profile Data ---

export interface ProfileData {
  profilePicture: string | null; // base64 data URL or null
  equippedBorder: string | null; // Border image filename or null
  equippedBadges: string[]; // Max 3 badge image filenames
}

// --- Session Result ---

export interface SessionResult {
  mode: GameMode;
  score: number;
  hits: number;
  misses: number;
  avgReactionTime: number; // ms, 0 if not applicable
  duration: number; // ms
  timestamp: string; // ISO
}
