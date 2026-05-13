import {
  Challenge,
  ChallengeDifficulty,
  ChallengeObjectiveType,
  ChallengeSet,
  GameModeCategory,
} from '@/lib/challengeTypes';
import { GameMode } from '@/lib/gameEngine';

// --- Category-to-mode mapping ---

const categoryModes: Record<GameModeCategory, GameMode[]> = {
  Flicking: ['grid', 'flick', 'microshot'],
  Tracking: ['smooth-aiming', 'tracking', 'switch-tracking', 'dropshot'],
  Speed: ['speed', 'reflex', 'burst'],
  Precision: ['precision'],
};

const allCategories: GameModeCategory[] = ['Flicking', 'Tracking', 'Speed', 'Precision'];

// --- Seeding and PRNG ---

/**
 * Hash a date string to a numeric seed using char code hashing.
 */
export function seedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Mulberry32 PRNG — returns a function that produces values in [0, 1).
 */
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// --- Helper functions ---

/**
 * Get the Monday of the current week for a given date string (YYYY-MM-DD).
 */
export function getWeekStart(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // days since Monday
  date.setDate(date.getDate() - diff);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get the category for a given game mode.
 */
function getCategoryForMode(mode: GameMode): GameModeCategory {
  for (const [category, modes] of Object.entries(categoryModes)) {
    if (modes.includes(mode)) {
      return category as GameModeCategory;
    }
  }
  return 'Flicking'; // fallback, should never happen with valid modes
}

/**
 * Select categories ensuring at least `minDifferent` are different.
 */
function selectCategories(rng: () => number, count: number, minDifferent: number): GameModeCategory[] {
  const categories: GameModeCategory[] = [];

  for (let i = 0; i < count; i++) {
    categories.push(allCategories[Math.floor(rng() * allCategories.length)]);
  }

  // Ensure minimum different categories
  const unique = new Set(categories);
  while (unique.size < minDifferent) {
    const others = allCategories.filter((c) => !unique.has(c));
    if (others.length === 0) break;
    const newCat = others[Math.floor(rng() * others.length)];
    unique.add(newCat);
    // Replace a duplicate with the new category
    for (let i = 0; i < categories.length; i++) {
      const dupeCount = categories.filter((c) => c === categories[i]).length;
      if (dupeCount > 1) {
        categories[i] = newCat;
        break;
      }
    }
  }

  return categories;
}

/**
 * Pick a random mode from the given category.
 */
function pickModeFromCategory(category: GameModeCategory, rng: () => number): GameMode {
  const modes = categoryModes[category];
  return modes[Math.floor(rng() * modes.length)];
}

/**
 * Pick an objective type appropriate for the given mode and difficulty.
 * Constraints:
 * - reaction_time only for Speed category modes
 * - accuracy_threshold NOT for Tracking category modes
 */
function pickObjectiveForMode(
  mode: GameMode,
  difficulty: ChallengeDifficulty,
  rng: () => number
): ChallengeObjectiveType {
  const category = getCategoryForMode(mode);

  const allObjectives: ChallengeObjectiveType[] = [
    'score_threshold',
    'accuracy_threshold',
    'hit_count',
    'session_count',
    'reaction_time',
  ];

  const validObjectives = allObjectives.filter((obj) => {
    // reaction_time only for Speed category
    if (obj === 'reaction_time' && category !== 'Speed') return false;
    // accuracy_threshold NOT for Tracking category
    if (obj === 'accuracy_threshold' && category === 'Tracking') return false;
    return true;
  });

  return validObjectives[Math.floor(rng() * validObjectives.length)];
}

/**
 * Generate a target value based on objective type and difficulty.
 */
function generateTargetValue(
  objectiveType: ChallengeObjectiveType,
  difficulty: ChallengeDifficulty,
  rng: () => number,
  weekly: boolean = false
): number {
  // Weekly challenges have higher targets since players have a full week
  const weeklyMultiplier = weekly ? 1.5 : 1;

  switch (objectiveType) {
    case 'score_threshold': {
      const ranges = { easy: [500, 1000], medium: [1500, 3000], hard: [4000, 6000] };
      const [min, max] = ranges[difficulty];
      return Math.round((min + rng() * (max - min)) * weeklyMultiplier);
    }
    case 'accuracy_threshold': {
      // Accuracy doesn't scale with weekly multiplier (capped at 100%)
      const ranges = { easy: [60, 70], medium: [75, 85], hard: [90, 95] };
      const [min, max] = ranges[difficulty];
      return Math.round(min + rng() * (max - min));
    }
    case 'hit_count': {
      const ranges = { easy: [15, 25], medium: [30, 50], hard: [60, 80] };
      const [min, max] = ranges[difficulty];
      return Math.round((min + rng() * (max - min)) * weeklyMultiplier);
    }
    case 'session_count': {
      const ranges = { easy: [1, 2], medium: [3, 4], hard: [5, 5] };
      const [min, max] = ranges[difficulty];
      return Math.round((min + rng() * (max - min)) * weeklyMultiplier);
    }
    case 'reaction_time': {
      // Lower is harder — these are upper bounds (must be under this value)
      // Weekly doesn't make reaction time easier, keep same targets
      const ranges = { easy: [350, 350], medium: [280, 280], hard: [220, 220] };
      const [min] = ranges[difficulty];
      return min;
    }
  }
}

/**
 * Generate a human-readable description for a challenge.
 */
function generateDescription(
  mode: GameMode,
  objectiveType: ChallengeObjectiveType,
  targetValue: number,
): string {
  const modeDisplay = mode.charAt(0).toUpperCase() + mode.slice(1).replace(/-/g, ' ');

  switch (objectiveType) {
    case 'score_threshold':
      return `Score ${targetValue}+ points in ${modeDisplay}`;
    case 'accuracy_threshold':
      return `Achieve ${targetValue}% accuracy in ${modeDisplay}`;
    case 'hit_count':
      return `Land ${targetValue} hits in ${modeDisplay}`;
    case 'session_count':
      return `Complete ${targetValue} session${targetValue > 1 ? 's' : ''} of ${modeDisplay}`;
    case 'reaction_time':
      return `React under ${targetValue}ms in ${modeDisplay}`;
  }
}

/**
 * Build a Challenge object.
 */
function buildChallenge(
  seedStr: string,
  index: number,
  mode: GameMode,
  objectiveType: ChallengeObjectiveType,
  difficulty: ChallengeDifficulty,
  targetValue: number,
  prefix: string = ''
): Challenge {
  return {
    id: `${prefix}${seedStr}-${index}`,
    objectiveType,
    targetMode: mode,
    targetValue,
    currentValue: 0,
    difficulty,
    description: generateDescription(mode, objectiveType, targetValue),
    completed: false,
    completedAt: null,
  };
}

/**
 * Main entry point: generate a deterministic challenge set for a given date.
 * Same date always produces the same daily challenges.
 * Same week always produces the same weekly challenges.
 */
export function generateChallengeSet(dateStr: string): ChallengeSet {
  const weekStart = getWeekStart(dateStr);

  // --- Daily challenges (4): 1 easy, 1 medium, 2 hard ---
  const dailyRng = seededRandom(seedFromDate(dateStr));
  const dailyDifficulties: ChallengeDifficulty[] = ['easy', 'medium', 'hard', 'hard'];
  const dailyCategories = selectCategories(dailyRng, 4, 2);

  const dailyChallenges = dailyDifficulties.map((diff, i) => {
    const category = dailyCategories[i];
    const mode = pickModeFromCategory(category, dailyRng);
    const objectiveType = pickObjectiveForMode(mode, diff, dailyRng);
    const targetValue = generateTargetValue(objectiveType, diff, dailyRng, false);
    return buildChallenge(dateStr, i, mode, objectiveType, diff, targetValue, 'd-');
  }) as [Challenge, Challenge, Challenge, Challenge];

  // --- Weekly challenges (5): 1 easy, 2 medium, 2 hard ---
  const weeklyRng = seededRandom(seedFromDate(weekStart + '-weekly'));
  const weeklyDifficulties: ChallengeDifficulty[] = ['easy', 'medium', 'medium', 'hard', 'hard'];
  const weeklyCategories = selectCategories(weeklyRng, 5, 3);

  const weeklyChallenges = weeklyDifficulties.map((diff, i) => {
    const category = weeklyCategories[i];
    const mode = pickModeFromCategory(category, weeklyRng);
    const objectiveType = pickObjectiveForMode(mode, diff, weeklyRng);
    const targetValue = generateTargetValue(objectiveType, diff, weeklyRng, true);
    return buildChallenge(weekStart, i, mode, objectiveType, diff, targetValue, 'w-');
  }) as [Challenge, Challenge, Challenge, Challenge, Challenge];

  return {
    date: dateStr,
    dailyChallenges,
    weeklyChallenges,
    weekStart,
    generatedAt: new Date().toISOString(),
  };
}
