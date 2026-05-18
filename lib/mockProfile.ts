export interface MockProfileData {
  profilePicture: string | null;
  equippedBorder: string | null;
  equippedBadges: string[];
  stats: {
    totalPlayTime: number;
    accuracy: number;
    favoriteMode: string;
  };
}

const AVAILABLE_BORDERS = [
  '01_crosshair_red_BORDER.png',
  '02_hud_cyan_BORDER.png',
  '03_purple_hex_BORDER.png',
  '04_gold_achievement_BORDER.png',
  '05_orange_energy_BORDER.png',
  '06_silver_prestige_BORDER.png',
  '07_shatter_red_BORDER.png',
  'luxury_01_royal_gold_BORDER.png',
  'luxury_02_diamond_platinum_BORDER.png',
  'luxury_03_obsidian_crimson_BORDER.png',
];

const AVAILABLE_BADGES = [
  'Aim Addict.png',
  'Aim Never Sleeps.png',
  'Endless Training.png',
  'High Roller.png',
  'Legendary Run.png',
  'Lightning Reflex.png',
  'Magnet Aim.png',
  'Missed Everything.png',
  'Potato Aim.png',
  'Quickscope.png',
  'Sharp Eyes.png',
  'Skull Cracker.png',
  'Top 1%.png',
  'Top 5%.png',
  'Top 10%.png',
  'Ultra Instinct.png',
  'Weekly Warrior.png',
];

const GAME_MODES = [
  'Gridshot',
  'Flick Shot',
  'Microshot',
  'Rapid Shot',
  'Reflex Shots',
  'Timed Pressure',
  'Exact Aiming',
  'Smooth Aiming',
  'Strafe Tracking',
  'Switch Tracking',
  'Dropshot',
];

// Seeded random number generator (same pattern as lib/mockData.ts)
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateMockProfile(playerId: string): MockProfileData {
  const baseSeed = hashString(playerId);

  // Border: ~20% chance of null
  let equippedBorder: string | null = null;
  const borderRoll = seededRandom(baseSeed + 1);
  if (borderRoll >= 0.2) {
    const borderIndex = Math.floor(seededRandom(baseSeed + 2) * AVAILABLE_BORDERS.length);
    equippedBorder = AVAILABLE_BORDERS[borderIndex];
  }

  // Badges: 0-3 badges, no duplicates
  const badgeCountRoll = seededRandom(baseSeed + 3);
  const badgeCount = badgeCountRoll < 0.15 ? 0 : badgeCountRoll < 0.4 ? 1 : badgeCountRoll < 0.7 ? 2 : 3;
  const equippedBadges: string[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < badgeCount; i++) {
    let attempts = 0;
    let idx = Math.floor(seededRandom(baseSeed + 10 + i * 7) * AVAILABLE_BADGES.length);
    while (usedIndices.has(idx) && attempts < 20) {
      attempts++;
      idx = Math.floor(seededRandom(baseSeed + 10 + i * 7 + attempts * 31) * AVAILABLE_BADGES.length);
    }
    if (!usedIndices.has(idx)) {
      usedIndices.add(idx);
      equippedBadges.push(AVAILABLE_BADGES[idx]);
    }
  }

  // Stats
  const totalPlayTime = Math.floor(seededRandom(baseSeed + 50) * 490) + 10; // 10-500 minutes
  const accuracy = Math.floor(seededRandom(baseSeed + 51) * 40) + 60; // 60-99
  const favoriteModeIndex = Math.floor(seededRandom(baseSeed + 52) * GAME_MODES.length);
  const favoriteMode = GAME_MODES[favoriteModeIndex];

  return {
    profilePicture: null,
    equippedBorder,
    equippedBadges,
    stats: {
      totalPlayTime,
      accuracy,
      favoriteMode,
    },
  };
}

// Export constants for testing
export { AVAILABLE_BORDERS, AVAILABLE_BADGES, GAME_MODES };
