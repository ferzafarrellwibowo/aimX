# Implementation Plan: Daily Challenges

## Overview

This plan implements a Daily Challenges system for aimX with deterministic date-seeded challenge generation, progress tracking via game-over hooks, streak/milestone management, cosmetic reward unlocking (borders + badges), a Challenge Panel in the sidebar, and an Edit Profile modal for avatar/border customization. All state persists in localStorage. Property-based tests use fast-check to validate correctness properties defined in the design.

## Tasks

- [x] 1. Set up testing infrastructure and core types
  - [x] 1.1 Install fast-check and vitest as dev dependencies
    - Run `npm install --save-dev vitest fast-check @testing-library/react @testing-library/jest-dom jsdom`
    - Add `"test": "vitest --run"` script to package.json
    - Create `vitest.config.ts` with jsdom environment and path aliases matching tsconfig
    - _Requirements: N/A (infrastructure)_

  - [x] 1.2 Create core type definitions in `lib/challengeTypes.ts`
    - Define `ChallengeObjectiveType`, `ChallengeDifficulty`, `GameModeCategory` types
    - Define `Challenge`, `ChallengeSet`, `CumulativeStats` interfaces
    - Define `MilestoneDefinition`, `MilestoneCondition`, `UnlockedReward`, `RewardType` types
    - Define `ProfileData`, `SessionResult` interfaces
    - Export all types for use across modules
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.3, 3.1, 4.3, 6.1, 6.2, 6.3_

  - [x] 1.3 Create milestone definitions in `lib/milestoneDefinitions.ts`
    - Define the 7 Normal_Border milestones with thresholds (5, 10, 20, 35, 50, 75, 100)
    - Define the 3 Luxury_Border milestones (150 total, 200 total, 30-day streak)
    - Define the 5 Badge milestones (7-day streak, 14-day streak, 30-day streak, 50 total, 10 perfect days)
    - Map each milestone to its corresponding image filename in `public/images/`
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

- [x] 2. Implement challenge generator
  - [x] 2.1 Create `lib/challengeGenerator.ts` with deterministic date-seeded generation
    - Implement `seedFromDate(dateStr: string): number` using char code hashing
    - Implement `seededRandom(seed: number): () => number` using Mulberry32 PRNG
    - Implement category-to-mode mapping (Flicking, Tracking, Speed, Precision)
    - Implement `selectCategories(rng)` ensuring at least 2 different categories
    - Implement `pickModeFromCategory(category, rng)` to select a specific GameMode
    - Implement `pickObjectiveForMode(mode, difficulty, rng)` with constraint enforcement (reaction_time only for Speed, accuracy not for Tracking)
    - Implement difficulty scaling for target values per objective type
    - Implement `generateChallengeSet(dateStr: string): ChallengeSet` as the main entry point
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 9.1, 9.2_

  - [ ]* 2.2 Write property tests for challenge generator (`__tests__/challengeGenerator.test.ts`)
    - **Property 1: Challenge set structural invariants** — For any valid date, generates exactly 3 challenges with one each of easy/medium/hard spanning ≥2 categories
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 2.3 Write property test for generation determinism
    - **Property 2: Generation determinism (idempotence)** — For any valid date, calling generateChallengeSet multiple times produces identical results
    - **Validates: Requirements 9.1, 9.2**

  - [ ]* 2.4 Write property test for serialization round-trip
    - **Property 3: Challenge set serialization round-trip** — For any valid date, serialize to JSON and deserialize back produces deeply equal set
    - **Validates: Requirements 1.4, 9.3**

  - [ ]* 2.5 Write property test for challenge constraint validity
    - **Property 4: Challenge constraint validity** — For any generated challenge: targetMode is valid, reaction_time only for Speed modes, score thresholds within difficulty range
    - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 3. Implement challenge tracker
  - [x] 3.1 Create `lib/challengeTracker.ts` with progress evaluation logic
    - Implement `evaluateSession(sessionResult, challengeSet): ChallengeSet` — updates currentValue per objective type rules
    - Implement `meetsThreshold(challenge): boolean` — handles reaction_time (lower-is-better) vs other objectives
    - Handle score_threshold (max), accuracy_threshold (max), hit_count (accumulate), session_count (increment), reaction_time (min)
    - Skip challenges that are already completed or don't match session mode
    - Mark challenge as completed when threshold is met, set completedAt timestamp
    - _Requirements: 3.1, 3.3, 3.4, 3.5_

  - [x] 3.2 Implement cumulative stats and streak management in `lib/challengeTracker.ts`
    - Implement `updateStatsOnCompletion(stats, challengeSet, today): CumulativeStats` — increments totalCompleted, checks for perfect day
    - Implement `updateStreak(stats, today): CumulativeStats` — handles consecutive day logic, streak reset, longestStreak update
    - Implement `getYesterday(dateStr): string` helper
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4, 5.5_

  - [x] 3.3 Implement milestone evaluation in `lib/challengeTracker.ts`
    - Implement `evaluateMilestones(stats, currentRewards, milestones): UnlockedReward[]` — checks all milestone conditions against stats
    - Return newly unlocked rewards (not already in currentRewards)
    - _Requirements: 6.4, 6.5, 6.8_

  - [ ]* 3.4 Write property tests for session evaluation (`__tests__/challengeTracker.test.ts`)
    - **Property 5: Session evaluation correctness** — For any matching session, currentValue updates correctly and completion triggers at threshold
    - **Validates: Requirements 3.1, 3.3**

  - [ ]* 3.5 Write property test for completed challenge immutability
    - **Property 6: Completed challenge immutability** — For any completed challenge and subsequent session, fields remain unchanged
    - **Validates: Requirements 3.5**

  - [ ]* 3.6 Write property test for stats update on completion
    - **Property 7: Stats update on challenge completion** — totalCompleted increments by 1, perfectDays increments when all 3 done
    - **Validates: Requirements 4.1, 4.4**

  - [ ]* 3.7 Write property test for streak update correctness
    - **Property 8: Streak update correctness** — consecutive day increments, gap resets to 1, longestStreak >= currentStreak
    - **Validates: Requirements 5.1, 5.2, 5.5**

  - [ ]* 3.8 Write property tests for milestones (`__tests__/milestones.test.ts`)
    - **Property 9: Milestone unlock correctness** — stats meeting threshold produces unlock in rewards list
    - **Validates: Requirements 6.4**

  - [ ]* 3.9 Write property test for reward permanence
    - **Property 10: Reward permanence** — streak reset does not remove unlocked rewards
    - **Validates: Requirements 6.8**

- [x] 4. Implement localStorage persistence layer
  - [x] 4.1 Create `lib/challengeStore.ts` for localStorage operations
    - Implement `loadChallengeSet(): ChallengeSet | null` with JSON parse and schema validation
    - Implement `saveChallengeSet(set: ChallengeSet): void`
    - Implement `loadCumulativeStats(): CumulativeStats` with fallback to defaults
    - Implement `saveCumulativeStats(stats: CumulativeStats): void`
    - Implement `loadUnlockedRewards(): UnlockedReward[]`
    - Implement `saveUnlockedRewards(rewards: UnlockedReward[]): void`
    - Implement `loadProfileData(): ProfileData` with fallback to defaults
    - Implement `saveProfileData(data: ProfileData): void`
    - Implement validation functions: `isValidChallengeSet`, `isValidCumulativeStats`, `isValidFileExtension`
    - Handle corrupted data recovery: regenerate challenges, reset stats preserving rewards
    - Handle localStorage unavailable/full with try/catch and in-memory fallback
    - Use keys: `aimX_challengeSet`, `aimX_cumulativeStats`, `aimX_unlockedRewards`, `aimX_profileData`
    - _Requirements: 1.4, 3.4, 4.2, 5.4, 6.5, 10.1, 10.2, 10.3, 10.4, 11.15_

  - [ ]* 4.2 Write property tests for error handling (`__tests__/errorHandling.test.ts`)
    - **Property 11: Corrupted data recovery** — invalid JSON produces fresh challenge set; corrupted stats reset while preserving rewards
    - **Validates: Requirements 10.1, 10.4**

- [x] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement Challenge Panel UI component
  - [x] 6.1 Create `components/ChallengePanel.tsx` with daily challenges display
    - Display header with current streak (🔥 icon) and total challenges completed
    - Render 3 challenge cards with: objective description, progress bar, difficulty badge (Easy/Medium/Hard with color coding), completion status (checkmark or in-progress)
    - Implement countdown timer showing time until next midnight refresh (HH:MM:SS format)
    - Use `setInterval` (every 1 second for timer, every 60 seconds for day-rollover check)
    - Implement midnight refresh detection: compare stored date vs current date, regenerate if different
    - Style with dark theme, Tailwind CSS, framer-motion for card animations
    - Visually distinguish incomplete (dim), in-progress (highlighted), completed (green checkmark, reduced opacity) challenges
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 1.5_

  - [x] 6.2 Add milestones section to `components/ChallengePanel.tsx`
    - Create scrollable milestones list below daily challenges
    - Display Normal Borders (7), Luxury Borders (3), and Badges (5) with progress indicators
    - Show locked milestones with requirements text and progress percentage
    - Show unlocked milestones with full opacity and completion indicator
    - _Requirements: 8.6, 6.7, 7.3, 7.4, 7.5_

- [x] 7. Implement Edit Profile Modal
  - [x] 7.1 Create `components/EditProfileModal.tsx`
    - Implement dark-themed modal overlay with close button
    - Profile Picture section: current avatar preview, upload button accepting .png/.jpg/.jpeg
    - File validation: reject invalid extensions with inline error message
    - On valid upload: read file as base64 data URL via FileReader, show preview
    - Border Selection Grid: two tiers (Normal: 7, Luxury: 3) displayed in grid layout
    - Locked borders: reduced opacity + lock icon overlay, click disabled
    - Unlocked borders: full opacity, clickable to equip, highlight selected
    - Save button: persist profileData to localStorage, close modal
    - Use framer-motion for modal enter/exit animations
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10, 11.11, 11.12, 11.13, 11.14, 11.15, 11.16_

  - [ ]* 7.2 Write property tests for profile validation (`__tests__/profileValidation.test.ts`)
    - **Property 12: File extension validation** — non-.png/.jpg/.jpeg extensions are rejected
    - **Validates: Requirements 11.7**

  - [ ]* 7.3 Write property test for locked border equip prevention
    - **Property 13: Locked border equip prevention** — borders not in unlocked rewards cannot be equipped
    - **Validates: Requirements 11.14**

- [x] 8. Integrate with game engine and sidebar
  - [x] 8.1 Modify `lib/gameEngine.ts` to emit session results on game-over
    - Add `onGameOver` callback option to GameEngine or export a hook point
    - At game-over, construct a `SessionResult` from the final `GameState` (mode, score, hits, misses, avgReactionTime, duration, timestamp)
    - Ensure the callback is invoked after final state is computed
    - _Requirements: 3.1_

  - [x] 8.2 Create game-over integration hook in `lib/challengeIntegration.ts`
    - Implement `handleGameOver(sessionResult: SessionResult): void`
    - Load current challenge set from store
    - Call `evaluateSession` to update progress
    - Check for newly completed challenges, update cumulative stats
    - Update streak if a challenge was completed
    - Evaluate milestones for new unlocks
    - Save all updated state to localStorage
    - Return info about newly completed challenges and unlocked rewards (for notifications)
    - _Requirements: 3.1, 3.4, 4.1, 4.2, 5.1, 6.4, 6.5_

  - [x] 8.3 Modify `components/Sidebar.tsx` to add Challenge Panel
    - Add a new calendar/target icon to the sidebar icon column
    - Add `'challenges'` to the `PanelType` union
    - Render `ChallengePanel` when challenges panel is active
    - _Requirements: 8.1_

  - [x] 8.4 Modify `components/Sidebar.tsx` profile section for border display and edit icon
    - Display equipped border PNG as an overlay/frame around the avatar in the profile panel
    - Show uploaded profile picture (or default UserIcon) as the avatar
    - Add pencil edit icon at top-right of avatar area
    - On pencil click, open EditProfileModal
    - _Requirements: 7.1, 7.2, 11.1, 11.6_

  - [x] 8.5 Wire game-over callback in the game page component
    - In `app/game/page.tsx` (or wherever GameCanvas handles game-over), call `handleGameOver` with session results
    - Show celebration notification when a milestone is newly unlocked
    - _Requirements: 3.1, 6.6_

- [x] 9. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate the 13 universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All persistence uses localStorage with `aimX_` prefixed keys
- The project uses TypeScript, Next.js (app router), Tailwind CSS, and framer-motion
