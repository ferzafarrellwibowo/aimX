export interface PlayerScore {
  id: string;
  username: string;
  badge: string;
  score: number;
  accuracy: number;
}

const BADGES = [
  "Aim Addict", "High Roller", "Legendary Run", "Magnet Aim", "Sharp Eyes", "Top 1%", "Top 5%", "Top 10%", "Ultra Instinct"
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
  { id: "101", username: "FlickMaster", isOnline: true, badge: "Grandmaster", lastSeen: "" },
  { id: "102", username: "SlowButSure", isOnline: false, badge: "Bronze", lastSeen: "2 hours ago" },
  { id: "103", username: "TrackingGod", isOnline: true, badge: "Ascendant", lastSeen: "" },
];
