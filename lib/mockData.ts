export interface PlayerScore {
  id: string;
  username: string;
  badge: string;
  score: number;
  accuracy: number;
}

const BADGES = [
  "Aim Addict", "High Roller", "Legendary Run", "Magnet Aim", "Sharp Eyes",
  "Ultra Instinct", "Lightning Reflex", "Quickscope", "Skull Cracker",
  "Weekly Warrior", "Endless Training", "Potato Aim"
];

// Seeded random for consistent mock data
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const getMockLeaderboard = (mode: string): PlayerScore[] => {
  const baseScore = mode === "gridshot" ? 100000 : 
                    mode === "spidershot" ? 80000 : 
                    mode === "microshot" ? 95000 : 85000;
  
  const players: PlayerScore[] = [];
  
  for (let i = 0; i < 50; i++) {
    // Generate deterministic randoms based on mode and index
    const seed = mode.charCodeAt(0) + i;
    const scoreOffset = Math.floor(seededRandom(seed) * 15000);
    const accOffset = seededRandom(seed + 1) * 10;
    
    players.push({
      id: `usr_dummy_${i}`,
      username: `ProAimer_${i + 1}`,
      badge: BADGES[Math.floor(seededRandom(seed + 2) * BADGES.length)],
      score: baseScore - scoreOffset - (i * 500),
      accuracy: 90 + accOffset
    });
  }
  
  // Sort descending
  return players.sort((a, b) => b.score - a.score);
};

export const getMockFriendsLeaderboard = (mode: string): PlayerScore[] => {
  const baseScore = mode === "gridshot" ? 95000 : 
                    mode === "spidershot" ? 75000 : 
                    mode === "microshot" ? 90000 : 80000;
  
  const players: PlayerScore[] = MOCK_FRIENDS.map((friend, index) => {
    const seed = mode.charCodeAt(0) + index * 10;
    const scoreOffset = Math.floor(seededRandom(seed) * 10000);
    const accOffset = seededRandom(seed + 1) * 10;
    
    return {
      id: friend.id,
      username: friend.username,
      badge: BADGES[Math.floor(seededRandom(seed + 2) * BADGES.length)],
      score: baseScore - scoreOffset,
      accuracy: 85 + accOffset
    };
  });
  
  return players.sort((a, b) => b.score - a.score);
};

export const MOCK_FRIENDS = [
  { id: "101", username: "FlickMaster", isOnline: true, badge: "Ultra Instinct", lastSeen: "" },
  { id: "102", username: "SlowButSure", isOnline: false, badge: "Potato Aim", lastSeen: "2 hours ago" },
  { id: "103", username: "TrackingGod", isOnline: true, badge: "Magnet Aim", lastSeen: "" },
];

// Mock player database for search
const MOCK_ALL_PLAYERS = [
  { id: "usr_201", username: "SniperElite", badge: "Sharp Eyes" },
  { id: "usr_202", username: "QuickDraw", badge: "Quickscope" },
  { id: "usr_203", username: "AimBot99", badge: "Magnet Aim" },
  { id: "usr_204", username: "NoScope360", badge: "Skull Cracker" },
  { id: "usr_205", username: "PixelHunter", badge: "Lightning Reflex" },
  { id: "usr_206", username: "HeadshotKing", badge: "Ultra Instinct" },
  { id: "usr_207", username: "ReflexMaster", badge: "Lightning Reflex" },
  { id: "usr_208", username: "TrackStar", badge: "Endless Training" },
  { id: "usr_209", username: "FlickGod", badge: "Legendary Run" },
  { id: "usr_210", username: "PrecisionX", badge: "Sharp Eyes" },
  { id: "usr_211", username: "SpeedDemon", badge: "High Roller" },
  { id: "usr_212", username: "CalmAimer", badge: "Weekly Warrior" },
  { id: "usr_213", username: "NightOwl", badge: "Aim Addict" },
  { id: "usr_214", username: "SteadyHand", badge: "Magnet Aim" },
  { id: "usr_215", username: "BurstKing", badge: "Skull Cracker" },
];

/**
 * Search mock players by username or ID.
 * Excludes players already in the friend list.
 */
export function searchPlayers(query: string): { id: string; username: string; badge: string }[] {
  const q = query.toLowerCase();
  const friendIds = new Set(MOCK_FRIENDS.map(f => f.id));
  
  return MOCK_ALL_PLAYERS.filter(p => 
    !friendIds.has(p.id) &&
    (p.username.toLowerCase().includes(q) || p.id.includes(q))
  ).slice(0, 5); // Max 5 results
}
