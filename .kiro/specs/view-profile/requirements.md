# Requirements Document

## Introduction

The View Profile feature adds a read-only modal that displays another player's profile information within the aimX aim training web app. Users can open this modal by clicking on a friend in the Friends panel or a player in the Leaderboard. The modal shows the player's avatar, equipped border, title/badge, user ID, equipped badges, and key stats (total play time, accuracy, favorite game mode). All displayed data is mock-generated since there is no backend.

## Glossary

- **View_Profile_Modal**: A read-only modal overlay that displays another player's profile information
- **Friend_List**: The friends panel in the Sidebar component showing online/offline friends from mock data
- **Leaderboard**: The LeaderboardModal component showing global and friends rankings
- **Profile_Section**: The top area of the View Profile Modal displaying avatar, border, title, and user ID
- **Badge_Display**: A section showing up to 3 equipped badge images for the viewed player
- **Stats_Section**: A section displaying the player's total play time, accuracy, and favorite game mode
- **Mock_Profile_Generator**: A utility that deterministically generates profile data (avatar, border, badges, stats) for other players based on their user ID

## Requirements

### Requirement 1: Open View Profile from Friend List

**User Story:** As a user, I want to click on a friend in the Friends panel to view their profile, so that I can see their stats and customization.

#### Acceptance Criteria

1. WHEN a user clicks on a friend entry in the Friend_List, THE View_Profile_Modal SHALL open displaying that friend's profile data
2. WHILE the View_Profile_Modal is open, THE Friend_List SHALL remain visible behind the modal backdrop
3. THE View_Profile_Modal SHALL display the correct profile data matching the clicked friend's user ID

### Requirement 2: Open View Profile from Leaderboard

**User Story:** As a user, I want to click on a player row in the Leaderboard to view their profile, so that I can learn more about top-ranked players.

#### Acceptance Criteria

1. WHEN a user clicks on a player row in the Leaderboard, THE View_Profile_Modal SHALL open displaying that player's profile data
2. THE View_Profile_Modal SHALL display the correct profile data matching the clicked player's user ID
3. WHILE the View_Profile_Modal is open over the Leaderboard, THE Leaderboard SHALL remain rendered behind the modal backdrop

### Requirement 3: Display Profile Section

**User Story:** As a user, I want to see the viewed player's avatar, border, title, and ID, so that I can identify them and see their customization.

#### Acceptance Criteria

1. THE View_Profile_Modal SHALL display the player's profile picture or a default avatar icon when no profile picture exists
2. THE View_Profile_Modal SHALL display the player's equipped border around the avatar image
3. THE View_Profile_Modal SHALL display the player's title or badge name below the avatar
4. THE View_Profile_Modal SHALL display the player's user ID in the profile section

### Requirement 4: Display Equipped Badges

**User Story:** As a user, I want to see the badges a player has equipped, so that I can see their achievements.

#### Acceptance Criteria

1. THE View_Profile_Modal SHALL display up to 3 equipped badge images in the Badge_Display section
2. WHEN a player has fewer than 3 equipped badges, THE Badge_Display SHALL show empty placeholder slots for unequipped positions
3. THE Badge_Display SHALL render each badge as its corresponding image from the public/images directory

### Requirement 5: Display Player Stats

**User Story:** As a user, I want to see a player's key performance stats, so that I can understand their skill level.

#### Acceptance Criteria

1. THE Stats_Section SHALL display the player's total play time as a formatted duration
2. THE Stats_Section SHALL display the player's accuracy as a percentage value
3. THE Stats_Section SHALL display the player's favorite game mode by name
4. THE Stats_Section SHALL present all three stats in a visually distinct layout within the modal

### Requirement 6: Modal Interaction and Dismissal

**User Story:** As a user, I want to close the View Profile modal easily, so that I can return to what I was doing.

#### Acceptance Criteria

1. WHEN a user clicks the close button, THE View_Profile_Modal SHALL close and remove itself from the DOM
2. WHEN a user clicks the backdrop area outside the modal, THE View_Profile_Modal SHALL close
3. WHEN a user presses the Escape key, THE View_Profile_Modal SHALL close
4. THE View_Profile_Modal SHALL NOT contain any editable fields or save actions

### Requirement 7: Visual Consistency with Dark Theme

**User Story:** As a user, I want the View Profile modal to match the app's dark theme, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE View_Profile_Modal SHALL use the same dark background colors as existing modals in the application (bg-[#0e0e11] or bg-[#111114] palette)
2. THE View_Profile_Modal SHALL use white and white-opacity text colors consistent with the existing UI
3. THE View_Profile_Modal SHALL include a backdrop blur effect consistent with other modals in the application
4. THE View_Profile_Modal SHALL use framer-motion for open and close animations consistent with the EditProfileModal

### Requirement 8: Mock Profile Data Generation

**User Story:** As a developer, I want profile data for other players to be deterministically generated from their user ID, so that the same player always shows consistent data.

#### Acceptance Criteria

1. THE Mock_Profile_Generator SHALL produce a deterministic profile picture assignment (or null) based on the player's user ID
2. THE Mock_Profile_Generator SHALL produce a deterministic equipped border selection based on the player's user ID
3. THE Mock_Profile_Generator SHALL produce a deterministic set of up to 3 equipped badges based on the player's user ID
4. THE Mock_Profile_Generator SHALL produce deterministic stats (total play time, accuracy, favorite game mode) based on the player's user ID
5. WHEN the same player ID is used across multiple invocations, THE Mock_Profile_Generator SHALL return identical profile data
