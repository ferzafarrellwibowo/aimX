import { MilestoneDefinition } from '@/lib/challengeTypes';

export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Normal Borders (7) — unlocked by total challenges completed
  {
    id: 'border_normal_01',
    rewardType: 'normal_border',
    rewardImage: '01_crosshair_red_BORDER.png',
    rewardName: 'Crosshair Red',
    condition: { type: 'total_challenges', threshold: 5 },
  },
  {
    id: 'border_normal_02',
    rewardType: 'normal_border',
    rewardImage: '02_hud_cyan_BORDER.png',
    rewardName: 'HUD Cyan',
    condition: { type: 'total_challenges', threshold: 10 },
  },
  {
    id: 'border_normal_03',
    rewardType: 'normal_border',
    rewardImage: '03_purple_hex_BORDER.png',
    rewardName: 'Purple Hex',
    condition: { type: 'total_challenges', threshold: 20 },
  },
  {
    id: 'border_normal_04',
    rewardType: 'normal_border',
    rewardImage: '04_gold_achievement_BORDER.png',
    rewardName: 'Gold Achievement',
    condition: { type: 'total_challenges', threshold: 35 },
  },
  {
    id: 'border_normal_05',
    rewardType: 'normal_border',
    rewardImage: '05_orange_energy_BORDER.png',
    rewardName: 'Orange Energy',
    condition: { type: 'total_challenges', threshold: 50 },
  },
  {
    id: 'border_normal_06',
    rewardType: 'normal_border',
    rewardImage: '06_silver_prestige_BORDER.png',
    rewardName: 'Silver Prestige',
    condition: { type: 'total_challenges', threshold: 75 },
  },
  {
    id: 'border_normal_07',
    rewardType: 'normal_border',
    rewardImage: '07_shatter_red_BORDER.png',
    rewardName: 'Shatter Red',
    condition: { type: 'total_challenges', threshold: 100 },
  },

  // Luxury Borders (3)
  {
    id: 'border_luxury_01',
    rewardType: 'luxury_border',
    rewardImage: 'luxury_01_royal_gold_BORDER.png',
    rewardName: 'Royal Gold',
    condition: { type: 'total_challenges', threshold: 150 },
  },
  {
    id: 'border_luxury_02',
    rewardType: 'luxury_border',
    rewardImage: 'luxury_02_diamond_platinum_BORDER.png',
    rewardName: 'Diamond Platinum',
    condition: { type: 'total_challenges', threshold: 200 },
  },
  {
    id: 'border_luxury_03',
    rewardType: 'luxury_border',
    rewardImage: 'luxury_03_obsidian_crimson_BORDER.png',
    rewardName: 'Obsidian Crimson',
    condition: { type: 'streak_days', threshold: 30 },
  },

  // Badges (17) — varied requirements from gameplay performance
  {
    id: 'badge_weekly_warrior',
    rewardType: 'badge',
    rewardImage: 'Weekly Warrior.png',
    rewardName: 'Weekly Warrior',
    condition: { type: 'streak_days', threshold: 7 },
  },
  {
    id: 'badge_aim_never_sleeps',
    rewardType: 'badge',
    rewardImage: 'Aim Never Sleeps.png',
    rewardName: 'Aim Never Sleeps',
    condition: { type: 'streak_days', threshold: 14 },
  },
  {
    id: 'badge_endless_training',
    rewardType: 'badge',
    rewardImage: 'Endless Training.png',
    rewardName: 'Endless Training',
    condition: { type: 'total_sessions', threshold: 100 },
  },
  {
    id: 'badge_high_roller',
    rewardType: 'badge',
    rewardImage: 'High Roller.png',
    rewardName: 'High Roller',
    condition: { type: 'total_score', threshold: 500000 },
  },
  {
    id: 'badge_legendary_run',
    rewardType: 'badge',
    rewardImage: 'Legendary Run.png',
    rewardName: 'Legendary Run',
    condition: { type: 'single_score', threshold: 10000 },
  },
  {
    id: 'badge_lightning_reflex',
    rewardType: 'badge',
    rewardImage: 'Lightning Reflex.png',
    rewardName: 'Lightning Reflex',
    condition: { type: 'reaction_best', threshold: 200 },
  },
  {
    id: 'badge_magnet_aim',
    rewardType: 'badge',
    rewardImage: 'Magnet Aim.png',
    rewardName: 'Magnet Aim',
    condition: { type: 'accuracy_avg', threshold: 90 },
  },
  {
    id: 'badge_missed_everything',
    rewardType: 'badge',
    rewardImage: 'Missed Everything.png',
    rewardName: 'Missed Everything',
    condition: { type: 'total_sessions', threshold: 1 },
  },
  {
    id: 'badge_potato_aim',
    rewardType: 'badge',
    rewardImage: 'Potato Aim.png',
    rewardName: 'Potato Aim',
    condition: { type: 'total_sessions', threshold: 10 },
  },
  {
    id: 'badge_quickscope',
    rewardType: 'badge',
    rewardImage: 'Quickscope.png',
    rewardName: 'Quickscope',
    condition: { type: 'reaction_best', threshold: 250 },
  },
  {
    id: 'badge_sharp_eyes',
    rewardType: 'badge',
    rewardImage: 'Sharp Eyes.png',
    rewardName: 'Sharp Eyes',
    condition: { type: 'accuracy_avg', threshold: 80 },
  },
  {
    id: 'badge_skull_cracker',
    rewardType: 'badge',
    rewardImage: 'Skull Cracker.png',
    rewardName: 'Skull Cracker',
    condition: { type: 'single_score', threshold: 5000 },
  },
  {
    id: 'badge_top_1',
    rewardType: 'badge',
    rewardImage: 'Top 1%.png',
    rewardName: 'Top 1%',
    condition: { type: 'leaderboard_percentile', threshold: 1 },
  },
  {
    id: 'badge_top_5',
    rewardType: 'badge',
    rewardImage: 'Top 5%.png',
    rewardName: 'Top 5%',
    condition: { type: 'leaderboard_percentile', threshold: 5 },
  },
  {
    id: 'badge_top_10',
    rewardType: 'badge',
    rewardImage: 'Top 10%.png',
    rewardName: 'Top 10%',
    condition: { type: 'leaderboard_percentile', threshold: 10 },
  },
  {
    id: 'badge_ultra_instinct',
    rewardType: 'badge',
    rewardImage: 'Ultra Instinct.png',
    rewardName: 'Ultra Instinct',
    condition: { type: 'reaction_best', threshold: 150 },
  },
  {
    id: 'badge_aim_addict',
    rewardType: 'badge',
    rewardImage: 'Aim Addict.png',
    rewardName: 'Aim Addict',
    condition: { type: 'total_sessions', threshold: 500 },
  },
];

// Helper constants — filtered arrays by reward type
export const NORMAL_BORDER_MILESTONES = MILESTONE_DEFINITIONS.filter(
  (m) => m.rewardType === 'normal_border'
);

export const LUXURY_BORDER_MILESTONES = MILESTONE_DEFINITIONS.filter(
  (m) => m.rewardType === 'luxury_border'
);

export const BADGE_MILESTONES = MILESTONE_DEFINITIONS.filter(
  (m) => m.rewardType === 'badge'
);
