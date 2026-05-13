# Requirements Document

## Introduction

The Daily Challenges feature provides players with a rotating set of daily challenges that encourage regular practice and engagement with aimX. Each day, players receive a fresh set of challenges tied to specific game modes, performance targets, or play patterns. The system tracks cumulative progress across challenges, and when players reach specific milestones (total challenges completed, streak lengths), they unlock cosmetic rewards such as Profile Borders/Frames and Badges/Titles that can be equipped and displayed on their profile.

## Glossary

- **Challenge_System**: The subsystem responsible for generating, tracking, completing daily challenges, and awarding milestone rewards
- **Challenge**: A single daily objective with a specific goal and target value
- **Challenge_Set**: The collection of challenges assigned to a player for a given calendar day
- **Player**: The user interacting with the aimX application
- **Streak**: A count of consecutive days where the player completed at least one challenge
- **Challenge_Progress**: The current numeric progress toward a challenge's completion threshold
- **Game_Session**: A single completed round of any game mode from start to finish
- **Challenge_Store**: The localStorage-based persistence layer for challenge and milestone data
- **Milestone**: A cumulative achievement threshold that unlocks a cosmetic reward when reached
- **Profile_Border**: A decorative PNG frame image displayed around the player's avatar on their profile, provided by the user (10 total images stored in public/images/)
- **Normal_Border**: A standard-tier Profile_Border (7 total) unlocked at earlier challenge milestones
- **Luxury_Border**: A premium-tier Profile_Border (3 total) unlocked at higher or harder milestones requiring greater dedication
- **Badge**: An unlockable PNG icon image (5 total) displayed in the Achievements_Section, unlocked through challenge milestones
- **Achievements_Section**: A dedicated UI section within the profile or challenge panel that displays all unlocked and locked Badges with their unlock criteria
- **Cumulative_Stats**: Persistent counters tracking total challenges completed, longest streak, and current streak
- **Edit_Profile_Modal**: A modal dialog triggered by a pencil icon on the profile section that allows the Player to upload a custom profile picture and select an unlocked Profile_Border to equip
- **Profile_Picture**: A custom avatar image uploaded by the Player in .png, .jpg, or .jpeg format, stored as a base64 data URL in localStorage, replacing the default avatar

## Requirements

### Requirement 1: Daily Challenge Generation

**User Story:** As a player, I want to receive a fresh set of challenges each day, so that I have new goals to work toward every training session.

#### Acceptance Criteria

1. WHEN a new calendar day begins (midnight local time), THE Challenge_System SHALL generate a new Challenge_Set containing exactly 3 challenges for the Player
2. THE Challenge_System SHALL select challenges from at least 2 different game mode categories (Flicking, Tracking, Speed, Precision) within a single Challenge_Set
3. WHEN generating challenges, THE Challenge_System SHALL assign each challenge a difficulty tier (Easy, Medium, Hard) with exactly one challenge per tier in each Challenge_Set
4. THE Challenge_System SHALL persist the generated Challenge_Set to the Challenge_Store so that challenges survive page refreshes
5. WHEN the Player opens the application for the first time on a new day, THE Challenge_System SHALL display the new Challenge_Set without requiring manual refresh

### Requirement 2: Challenge Types and Objectives

**User Story:** As a player, I want varied challenge objectives, so that I am encouraged to practice different skills and game modes.

#### Acceptance Criteria

1. THE Challenge_System SHALL support the following challenge objective types: score threshold (achieve a minimum score), accuracy threshold (achieve a minimum accuracy percentage), hit count (land a minimum number of hits), session count (complete a number of sessions in a specific mode), and reaction time (achieve a reaction time below a threshold)
2. WHEN generating a challenge with a score threshold objective, THE Challenge_System SHALL set the target value based on the assigned difficulty tier (Easy: lower threshold, Hard: higher threshold)
3. THE Challenge_System SHALL associate each challenge with exactly one specific game mode from the available 11 modes
4. WHEN generating a challenge with a reaction time objective, THE Challenge_System SHALL only assign it to Speed category modes (Rapid Shot, Reflex Shots, Timed Pressure)

### Requirement 3: Challenge Progress Tracking

**User Story:** As a player, I want to see my progress toward completing each challenge in real time, so that I know how close I am to finishing today's objectives.

#### Acceptance Criteria

1. WHEN a Game_Session ends, THE Challenge_System SHALL evaluate the session results against all active challenges and update Challenge_Progress accordingly
2. THE Challenge_System SHALL display a progress indicator for each challenge showing current value relative to the target value (e.g., "2/5 sessions" or "78%/85% accuracy")
3. WHEN Challenge_Progress reaches or exceeds the target value, THE Challenge_System SHALL mark the challenge as completed
4. THE Challenge_System SHALL persist Challenge_Progress to the Challenge_Store after each Game_Session ends
5. WHILE a challenge is already completed, THE Challenge_System SHALL prevent further progress updates to that challenge

### Requirement 4: Cumulative Stats Tracking

**User Story:** As a player, I want the system to track my overall challenge history, so that my long-term dedication is recognized through milestones.

#### Acceptance Criteria

1. WHEN a challenge is marked as completed, THE Challenge_System SHALL increment the Player's total completed challenges counter in Cumulative_Stats
2. THE Challenge_System SHALL persist Cumulative_Stats to the Challenge_Store after each update
3. THE Challenge_System SHALL track the following cumulative statistics: total challenges completed, current streak length, and longest streak achieved
4. WHEN all 3 challenges in a Challenge_Set are completed on the same day, THE Challenge_System SHALL record that day as a "perfect day" in Cumulative_Stats

### Requirement 5: Streak System

**User Story:** As a player, I want to maintain a daily streak by completing challenges, so that I am motivated to practice consistently.

#### Acceptance Criteria

1. WHEN the Player completes at least one challenge on a calendar day, THE Challenge_System SHALL increment the Streak counter by 1 for that day
2. WHEN a new calendar day begins and the Player did not complete any challenge on the previous day, THE Challenge_System SHALL reset the Streak counter to 0
3. THE Challenge_System SHALL display the current Streak count to the Player in the challenge panel
4. THE Challenge_System SHALL persist the Streak counter and the last completion date to the Challenge_Store
5. WHEN the current Streak exceeds the longest streak recorded in Cumulative_Stats, THE Challenge_System SHALL update the longest streak value

### Requirement 6: Milestone Definitions and Unlocks

**User Story:** As a player, I want to unlock Profile Borders and Badges when I reach specific milestones, so that I have long-term goals to work toward.

#### Acceptance Criteria

1. THE Challenge_System SHALL define exactly 7 Normal_Border milestones unlocked at total challenges completed thresholds of 5, 10, 20, 35, 50, 75, and 100
2. THE Challenge_System SHALL define exactly 3 Luxury_Border milestones unlocked at higher thresholds: total challenges completed of 150 and 200, and a 30-day streak achievement
3. THE Challenge_System SHALL define exactly 5 Badge milestones unlocked at streak and special achievement thresholds: 7-day streak, 14-day streak, 30-day streak, 50 total challenges completed, and 10 perfect days
4. WHEN the Player's Cumulative_Stats reach a milestone threshold, THE Challenge_System SHALL unlock the corresponding cosmetic reward (Normal_Border, Luxury_Border, or Badge)
5. THE Challenge_System SHALL persist all unlocked rewards to the Challenge_Store
6. WHEN a milestone is reached, THE Challenge_System SHALL display a celebration notification to the Player showing the unlocked reward
7. THE Challenge_System SHALL use user-provided PNG images from public/images/ for all Profile_Border and Badge rewards (10 border PNGs and 5 badge PNGs)
8. THE Challenge_System SHALL make unlocked rewards permanent so they remain available even if the streak resets

### Requirement 7: Cosmetic Reward Equipping

**User Story:** As a player, I want to equip unlocked Profile Borders and view my Badges in an Achievements section, so that other players can see my achievements.

#### Acceptance Criteria

1. THE Challenge_System SHALL allow the Player to equip one Profile_Border at a time from their unlocked collection (Normal_Border or Luxury_Border)
2. WHEN the Player equips a Profile_Border, THE Challenge_System SHALL display the selected PNG border image around the Player's avatar on the profile panel
3. THE Challenge_System SHALL display all 5 Badges (locked and unlocked) in the Achievements_Section with their unlock criteria and status
4. WHEN a Badge is unlocked, THE Challenge_System SHALL display the Badge PNG image in the Achievements_Section with full opacity and a completion indicator
5. WHILE a Badge is locked, THE Challenge_System SHALL display the Badge in the Achievements_Section with reduced opacity and the remaining requirement to unlock it
6. THE Challenge_System SHALL persist the Player's equipped Profile_Border selection to the Challenge_Store
7. THE Challenge_System SHALL display locked milestones with their requirements so the Player can see upcoming rewards and progress toward them

### Requirement 8: Challenge UI Panel

**User Story:** As a player, I want a dedicated panel to view my daily challenges and milestone progress, so that I can easily track my objectives.

#### Acceptance Criteria

1. THE Challenge_System SHALL provide a challenge panel accessible from the Sidebar via a dedicated icon
2. WHEN the Player opens the challenge panel, THE Challenge_System SHALL display all 3 daily challenges with their objective description, progress indicator, difficulty tier badge, and completion status
3. THE Challenge_System SHALL visually distinguish between incomplete, in-progress, and completed challenges using distinct styling (opacity, checkmarks, color changes)
4. THE Challenge_System SHALL display a countdown timer showing time remaining until the next challenge refresh (next midnight local time)
5. THE Challenge_System SHALL display the Player's current Streak count and total challenges completed at the top of the challenge panel
6. THE Challenge_System SHALL include a milestones section showing all milestones with their unlock status and progress percentage

### Requirement 9: Deterministic Challenge Generation

**User Story:** As a developer, I want challenge generation to be deterministic based on the date, so that the system produces consistent results for testing and debugging.

#### Acceptance Criteria

1. THE Challenge_System SHALL use the current calendar date (YYYY-MM-DD format in local time) as the seed for challenge generation
2. WHEN the same date seed is used, THE Challenge_System SHALL produce the identical Challenge_Set regardless of how many times generation is triggered
3. FOR ALL valid date seeds, generating a Challenge_Set then serializing and deserializing it SHALL produce an equivalent Challenge_Set (round-trip property)

### Requirement 10: Error Handling

**User Story:** As a player, I want the challenge system to handle errors gracefully, so that my experience is not disrupted by data issues.

#### Acceptance Criteria

1. IF the Challenge_Store contains corrupted or invalid data, THEN THE Challenge_System SHALL regenerate the Challenge_Set for the current day and log a warning to the console
2. IF localStorage is unavailable or full, THEN THE Challenge_System SHALL operate with in-memory challenge state and display a notice to the Player that progress will not persist across sessions
3. IF a challenge references a game mode that does not exist, THEN THE Challenge_System SHALL skip that challenge and generate a replacement challenge
4. IF Cumulative_Stats data is corrupted, THEN THE Challenge_System SHALL reset stats to zero and preserve any previously unlocked rewards

### Requirement 11: Edit Profile

**User Story:** As a player, I want to edit my profile by uploading a custom avatar and selecting a border, so that I can personalize my appearance in the application.

#### Acceptance Criteria

1. THE Challenge_System SHALL display a pencil (edit) icon at the top-right corner of the Player's profile section
2. WHEN the Player clicks the edit icon, THE Challenge_System SHALL open the Edit_Profile_Modal
3. THE Edit_Profile_Modal SHALL use a dark theme consistent with the application's existing visual aesthetic
4. THE Edit_Profile_Modal SHALL contain a Profile_Picture upload section that accepts files with .png, .jpg, or .jpeg extensions
5. WHEN the Player uploads a valid image file, THE Edit_Profile_Modal SHALL display a preview of the uploaded image and store it as a base64 data URL in localStorage
6. WHEN the Player uploads a Profile_Picture, THE Challenge_System SHALL replace the default avatar with the uploaded image across the profile section
7. IF the Player uploads a file with an extension other than .png, .jpg, or .jpeg, THEN THE Edit_Profile_Modal SHALL reject the file and display a validation error message
8. THE Edit_Profile_Modal SHALL contain a border selection section displaying all 10 Profile_Border images in a grid layout organized into two tiers: Normal (7 borders) and Luxury (3 borders)
9. THE Edit_Profile_Modal SHALL display Normal_Border images with filenames: 01_crosshair_red_BORDER.png, 02_hud_cyan_BORDER.png, 03_purple_hex_BORDER.png, 04_gold_achievement_BORDER.png, 05_orange_energy_BORDER.png, 06_silver_prestige_BORDER.png, and 07_shatter_red_BORDER.png
10. THE Edit_Profile_Modal SHALL display Luxury_Border images with filenames: luxury_01_royal_gold_BORDER.png, luxury_02_diamond_platinum_BORDER.png, and luxury_03_obsidian_crimson_BORDER.png
11. WHILE a Profile_Border is locked (not yet unlocked via milestones), THE Edit_Profile_Modal SHALL display that border with reduced opacity and a lock indicator overlay
12. WHILE a Profile_Border is unlocked, THE Edit_Profile_Modal SHALL display that border at full opacity and allow the Player to select it
13. WHEN the Player selects an unlocked Profile_Border in the Edit_Profile_Modal, THE Challenge_System SHALL equip that border and persist the selection to the Challenge_Store
14. THE Edit_Profile_Modal SHALL prevent the Player from equipping a locked Profile_Border
15. THE Challenge_System SHALL persist the uploaded Profile_Picture base64 data URL to localStorage so that the custom avatar survives page refreshes
16. WHEN the Player closes the Edit_Profile_Modal, THE Challenge_System SHALL apply all changes (Profile_Picture and equipped border) immediately to the profile section
