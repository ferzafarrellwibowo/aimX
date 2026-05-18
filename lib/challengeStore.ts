import {
  ChallengeSet,
  CumulativeStats,
  UnlockedReward,
  ProfileData,
} from '@/lib/challengeTypes';
import { generateChallengeSet, getWeekStart } from '@/lib/challengeGenerator';

export { generateChallengeSet };

// --- localStorage Keys ---

const KEYS = {
  challengeSet: 'aimX_challengeSet',
  cumulativeStats: 'aimX_cumulativeStats',
  unlockedRewards: 'aimX_unlockedRewards',
  profileData: 'aimX_profileData',
} as const;

// --- Default Values ---

const DEFAULT_CUMULATIVE_STATS: CumulativeStats = {
  totalCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastCompletionDate: null,
  perfectDays: 0,
  perfectDayDates: [],
  totalSessions: 0,
  totalScore: 0,
  bestSingleScore: 0,
  bestReactionTime: 0,
  avgAccuracy: 0,
  accuracySessionCount: 0,
};

const DEFAULT_PROFILE_DATA: ProfileData = {
  profilePicture: null,
  equippedBorder: null,
  equippedBadges: [],
  equippedTitle: null,
};

// --- Validation Functions ---

export function isValidChallengeSet(data: unknown): data is ChallengeSet {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (typeof d.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return false;
  if (typeof d.weekStart !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.weekStart)) return false;
  if (!Array.isArray(d.dailyChallenges) || d.dailyChallenges.length !== 4) return false;
  if (!Array.isArray(d.weeklyChallenges) || d.weeklyChallenges.length !== 5) return false;

  const validateChallenge = (c: unknown): boolean => {
    if (!c || typeof c !== 'object') return false;
    const ch = c as Record<string, unknown>;
    return (
      typeof ch.id === 'string' &&
      typeof ch.objectiveType === 'string' &&
      typeof ch.targetMode === 'string' &&
      typeof ch.targetValue === 'number' &&
      typeof ch.currentValue === 'number' &&
      typeof ch.difficulty === 'string' &&
      typeof ch.description === 'string' &&
      typeof ch.completed === 'boolean'
    );
  };

  return (
    d.dailyChallenges.every(validateChallenge) &&
    d.weeklyChallenges.every(validateChallenge)
  );
}

export function isValidCumulativeStats(data: unknown): data is CumulativeStats {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.totalCompleted === 'number' &&
    typeof d.currentStreak === 'number' &&
    typeof d.longestStreak === 'number' &&
    typeof d.perfectDays === 'number'
  );
}

export function isValidFileExtension(filename: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ['png', 'jpg', 'jpeg'].includes(ext || '');
}

// --- Helper Functions ---

export function getCurrentDateStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Checks if the stored challenge set needs a refresh.
 * Daily challenges refresh when the date changes.
 * Weekly challenges refresh when the week start (Monday) changes.
 */
export function needsRefresh(stored: ChallengeSet | null): boolean {
  if (!stored) return true;
  const today = getCurrentDateStr();
  const currentWeekStart = getWeekStart(today);

  // Refresh if daily date doesn't match today
  if (stored.date !== today) return true;
  // Refresh if weekly start doesn't match current week's Monday
  if (stored.weekStart !== currentWeekStart) return true;

  return false;
}

// --- Safe localStorage Access ---

function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    // Test that localStorage is accessible
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return null;
  }
}

// --- Load Functions ---

export function loadChallengeSet(): ChallengeSet | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(KEYS.challengeSet);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidChallengeSet(parsed)) {
      console.warn('[challengeStore] Invalid challenge set data in localStorage, returning null');
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('[challengeStore] Failed to load challenge set:', e);
    return null;
  }
}

export function loadCumulativeStats(): CumulativeStats {
  try {
    const storage = getStorage();
    if (!storage) return { ...DEFAULT_CUMULATIVE_STATS };
    const raw = storage.getItem(KEYS.cumulativeStats);
    if (!raw) return { ...DEFAULT_CUMULATIVE_STATS };
    const parsed = JSON.parse(raw);
    if (!isValidCumulativeStats(parsed)) {
      console.warn('[challengeStore] Invalid cumulative stats data, returning defaults');
      return { ...DEFAULT_CUMULATIVE_STATS };
    }
    return parsed;
  } catch (e) {
    console.warn('[challengeStore] Failed to load cumulative stats:', e);
    return { ...DEFAULT_CUMULATIVE_STATS };
  }
}

export function loadUnlockedRewards(): UnlockedReward[] {
  try {
    const storage = getStorage();
    if (!storage) return [];
    const raw = storage.getItem(KEYS.unlockedRewards);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('[challengeStore] Invalid unlocked rewards data, returning empty array');
      return [];
    }
    return parsed;
  } catch (e) {
    console.warn('[challengeStore] Failed to load unlocked rewards:', e);
    return [];
  }
}

export function loadProfileData(): ProfileData {
  try {
    const storage = getStorage();
    if (!storage) return { ...DEFAULT_PROFILE_DATA };
    const raw = storage.getItem(KEYS.profileData);
    if (!raw) return { ...DEFAULT_PROFILE_DATA };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      console.warn('[challengeStore] Invalid profile data, returning defaults');
      return { ...DEFAULT_PROFILE_DATA };
    }
    return {
      profilePicture: parsed.profilePicture ?? null,
      equippedBorder: parsed.equippedBorder ?? null,
      equippedBadges: Array.isArray(parsed.equippedBadges) ? parsed.equippedBadges : [],
      equippedTitle: parsed.equippedTitle ?? null,
    };
  } catch (e) {
    console.warn('[challengeStore] Failed to load profile data:', e);
    return { ...DEFAULT_PROFILE_DATA };
  }
}

// --- Save Functions ---

export function saveChallengeSet(set: ChallengeSet): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(KEYS.challengeSet, JSON.stringify(set));
  } catch (e) {
    console.warn('[challengeStore] Failed to save challenge set (quota exceeded?):', e);
  }
}

export function saveCumulativeStats(stats: CumulativeStats): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(KEYS.cumulativeStats, JSON.stringify(stats));
  } catch (e) {
    console.warn('[challengeStore] Failed to save cumulative stats (quota exceeded?):', e);
  }
}

export function saveUnlockedRewards(rewards: UnlockedReward[]): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(KEYS.unlockedRewards, JSON.stringify(rewards));
  } catch (e) {
    console.warn('[challengeStore] Failed to save unlocked rewards (quota exceeded?):', e);
  }
}

export function saveProfileData(data: ProfileData): void {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.setItem(KEYS.profileData, JSON.stringify(data));
  } catch (e) {
    console.warn('[challengeStore] Failed to save profile data (quota exceeded?):', e);
  }
}

/**
 * For demo/testing: pre-unlock ALL borders and badges for preview.
 * Forces re-generation if not all milestones are unlocked.
 */
export function initDemoRewards(): UnlockedReward[] {
  const { MILESTONE_DEFINITIONS } = require('@/lib/milestoneDefinitions');
  const existing = loadUnlockedRewards();
  
  // If already all unlocked, return existing
  if (existing.length >= MILESTONE_DEFINITIONS.length) return existing;
  
  // Unlock all milestones
  const demoRewards: UnlockedReward[] = MILESTONE_DEFINITIONS.map((m: { id: string }) => ({
    milestoneId: m.id,
    unlockedAt: new Date().toISOString(),
  }));
  saveUnlockedRewards(demoRewards);
  return demoRewards;
}
