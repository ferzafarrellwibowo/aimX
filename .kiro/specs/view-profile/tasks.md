# Implementation Plan: View Profile

## Overview

Implement a read-only View Profile modal that displays another player's profile information (avatar, border, badges, stats) using deterministically generated mock data. The modal is triggered from the FriendsPanel and LeaderboardModal via click handlers.

## Tasks

- [x] 1. Create mock profile data generator
  - [x] 1.1 Create `lib/mockProfile.ts` with `generateMockProfile(playerId)` function
    - Define `MockProfileData` interface with `profilePicture`, `equippedBorder`, `equippedBadges`, and `stats` fields
    - Implement seeded random number generator based on numeric hash of player ID string (same pattern as `lib/mockData.ts`)
    - Deterministically select a border from available border images (null for ~20% of players)
    - Deterministically select 0-3 badges from available badge images (no duplicates)
    - Generate stats: totalPlayTime (10-500 minutes), accuracy (60-99%), favoriteMode from known game modes
    - Export the `MockProfileData` interface and `generateMockProfile` function
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 1.2 Write property test: Deterministic profile generation
    - **Property 1: Deterministic profile generation**
    - For any player ID string, calling `generateMockProfile` multiple times returns deeply equal results
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

  - [ ]* 1.3 Write property test: Badge count invariant
    - **Property 2: Badge count invariant**
    - For any player ID string, `equippedBadges` array length is between 0 and 3 inclusive
    - **Validates: Requirements 4.1, 8.3**

  - [ ]* 1.4 Write property test: Stats within valid ranges
    - **Property 3: Stats within valid ranges**
    - For any player ID string, accuracy is between 0-100, totalPlayTime is non-negative, favoriteMode is a known game mode name
    - **Validates: Requirements 5.1, 5.2, 5.3, 8.4**

  - [ ]* 1.5 Write property test: Border selection from valid set
    - **Property 4: Border selection from valid set**
    - For any player ID string, if `equippedBorder` is not null, it is one of the known border image filenames
    - **Validates: Requirements 3.2, 8.2**

  - [ ]* 1.6 Write property test: Badge selection from valid set with no duplicates
    - **Property 5: Badge selection from valid set**
    - For any player ID string, every entry in `equippedBadges` is a known badge filename with no duplicates
    - **Validates: Requirements 4.3, 8.3**

- [x] 2. Checkpoint - Verify mock profile generator
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Create ViewProfileModal component
  - [x] 3.1 Create `components/ViewProfileModal.tsx` with modal structure and animations
    - Define `ViewProfileModalProps` interface: `isOpen`, `onClose`, `player: { id, username, badge }`
    - Use `AnimatePresence` and `motion.div` from framer-motion for open/close animations
    - Render backdrop with `bg-black/60 backdrop-blur-sm` that closes modal on click
    - Add Escape key listener to close modal
    - Use dark theme colors consistent with existing modals (`bg-[#0e0e11]`, white/opacity text)
    - Set z-index higher than LeaderboardModal (e.g., `z-[10000]`)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4_

  - [x] 3.2 Implement Profile Section within ViewProfileModal
    - Call `generateMockProfile(player.id)` to get full profile data
    - Display player avatar (default icon since `profilePicture` is null for mock players)
    - Display equipped border as an overlay image around the avatar (same pattern as ProfilePanel)
    - Display player username and badge/title below avatar
    - Display player user ID
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 3.3 Implement Badge Display section within ViewProfileModal
    - Render up to 3 equipped badge images from `public/images/` directory
    - Show empty placeholder slots for unequipped positions (when fewer than 3 badges)
    - Each badge rendered as its corresponding image
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 3.4 Implement Stats Section within ViewProfileModal
    - Display total play time formatted as a human-readable duration (e.g., "3h 20m")
    - Display accuracy as a percentage value
    - Display favorite game mode by name
    - Present stats in visually distinct card layout
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 3.5 Write unit tests for ViewProfileModal
    - Test modal renders correct sections (profile, badges, stats)
    - Test modal contains no editable fields or save buttons
    - Test empty badge slots show placeholders when fewer than 3 badges equipped
    - Test close button, backdrop click, and Escape key close the modal
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 6.1, 6.2, 6.3, 6.4_

- [x] 4. Checkpoint - Verify ViewProfileModal renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Integrate with FriendsPanel and LeaderboardModal
  - [x] 5.1 Add onClick handler to friend entries in FriendsPanel (`components/Sidebar.tsx`)
    - Add state for selected player and modal open/close in FriendsPanel
    - Add `onClick` to each friend entry `<div>` that sets the selected player `{ id, username, badge }`
    - Add cursor-pointer styling to friend entries
    - Render `ViewProfileModal` within FriendsPanel with the selected player data
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 5.2 Add onClick handler to player rows in LeaderboardModal (`components/LeaderboardModal.tsx`)
    - Add state for selected player and modal open/close in LeaderboardModal
    - Add `onClick` to each player row `<div>` that sets the selected player `{ id, username, badge }`
    - Add cursor-pointer styling to player rows
    - Render `ViewProfileModal` within LeaderboardModal with the selected player data
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ]* 5.3 Write unit tests for integration points
    - Test clicking a friend entry opens ViewProfileModal with correct player data
    - Test clicking a leaderboard row opens ViewProfileModal with correct player data
    - Test ViewProfileModal displays over LeaderboardModal (z-index layering)
    - _Requirements: 1.1, 1.3, 2.1, 2.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The design uses TypeScript throughout — all code examples and implementations use TypeScript
- Property tests use fast-check (already set up in the project)
- Unit tests use vitest (already set up in the project)
- `generateMockProfile` is a pure function ideal for property-based testing
- The modal follows the same animation pattern as the existing `EditProfileModal`
- All profile data is mock-generated — no network calls or async operations needed
