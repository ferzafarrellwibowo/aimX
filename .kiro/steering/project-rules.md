---
inclusion: auto
---

# aimX Project Rules

## Project Overview
aimX is a competitive aim training web app built with Next.js (App Router), TypeScript, Tailwind CSS, and framer-motion. It features 11 game modes across 4 categories (Flicking, Tracking, Speed, Precision), a sidebar with multiple panels, and a challenge/reward system.

## Tech Stack
- **Framework**: Next.js 16 (App Router, `app/` directory)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4, inline classes only (no separate CSS modules)
- **Animations**: framer-motion
- **State**: localStorage for all persistence (no backend yet)
- **Testing**: vitest + fast-check (property-based testing)
- **Package Manager**: npm

## Design System
- **Theme**: Dark theme exclusively. Background: `#08080a` (page), `#0c0c0e` (sidebar), `#111114` (panels/modals)
- **Accent**: Red (`red-600`, `red-500`) for primary actions and branding
- **Text**: White with opacity variants (`text-white`, `text-white/90`, `text-white/70`, `text-white/50`). Minimum contrast: `#888888` on dark backgrounds for WCAG AA compliance.
- **Borders**: `border-white/5`, `border-white/10` for subtle separators
- **Modals**: `bg-[#111114]`, `border border-white/10`, `rounded-2xl`, backdrop `bg-black/60 backdrop-blur-sm`
- **Buttons**: Primary = `bg-red-600 hover:bg-red-500 text-white`, Secondary = `bg-white/5 border border-white/10`
- **Font sizes**: Use Tailwind scale. Labels = `text-xs`, Body = `text-sm`, Headings = `text-lg` to `text-xl`

## Accessibility Standards
- All interactive elements must have `aria-label` or visible text
- Decorative SVGs must have `aria-hidden="true"`
- Modals must have `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`
- Toggle buttons use `role="switch"` with `aria-checked`
- Radio-like groups use `role="radiogroup"` with `role="radio"` + `aria-checked`
- Sidebar buttons use `aria-expanded` when controlling panels
- Active page uses `aria-current="page"`
- Focus-visible ring: `2px solid rgba(220, 38, 38, 0.65)` with `outline-offset: 2px`
- All form inputs must be controlled (have `value` + `onChange`) — never mix controlled/uncontrolled
- Interactive cards must be keyboard-accessible (`tabIndex={0}`, `onKeyDown` for Enter/Space)
- Use `aria-live="polite"` for dynamic content updates (search results count, toasts)
- Include skip-to-content link in layout

## Toast/Notification System
- Use `useToast()` hook from `components/Toast.tsx`
- Provider: `<ToastProvider>` wraps app in `app/layout.tsx`
- Variants: `success`, `error`, `info`, `achievement`
- Always show toast for: login/logout, profile save, settings save, friend add/remove, challenge complete, high score, reward unlock, navigation feedback
- Toast auto-dismisses (default 4s). Achievement toasts use 5s.
- Toasts stack top-right with `aria-live="polite"`

## Loading & Transition States
- Route transitions: `<RouteProgress />` component in layout shows top red progress bar
- Game loading: `app/game/loading.tsx` shows animated reticle skeleton
- Button loading: Disable button + show spinner SVG + "LOADING" text during navigation
- Skeleton class: `.skeleton` in globals.css for shimmer effect
- Never leave user without visual feedback during async operations

## Empty States
- Always provide a friendly empty state with: icon, title, description, and CTA button when applicable
- Search no results: Show icon + "No [items] found" + suggestion text + "Clear filters" button
- Friends empty: Show heart icon + "No friends yet" + "Add your first friend" CTA
- Heatmap empty: Draw reticle icon + "No clicks recorded" + hint text on canvas
- Use `role="status"` on empty state containers for screen reader announcement

## Search UX
- Search bar includes category filter chips below it
- Chips show count per category: `All (11)`, `Flicking (3)`, etc.
- Active chip: `bg-red-600/15 border-red-500/40 text-red-300`
- Show live result count with `aria-live="polite"`: "4 modes found for 'tracking'"
- Show "Clear filters" link when any filter is active
- Empty state when no results match

## Sidebar Navigation
- Home button navigates to `/` with `aria-current="page"` when active
- Logo "X" is clickable, navigates to home
- Active panel indicator: red dot/bar on left side of active button
- Tooltips use `role="tooltip"` and appear on hover AND focus
- `<nav aria-label="Sidebar navigation">` wraps icon column
- `<aside aria-label="Primary navigation">` wraps entire sidebar
- When user is not logged in and clicks a feature requiring auth, show toast "Sign in required" and open profile panel

## Component Patterns
- Sidebar panels receive `onClose: () => void` prop
- Modals use framer-motion `AnimatePresence` + `motion.div` with scale/opacity transitions
- Icons are inline SVG components defined at the top of files
- Badge colors use a shared color map (getBadgeColorClass function in Sidebar.tsx)
- Tooltips use a `TooltipWrapper` component with `group`/`group-hover` pattern

## File Structure
- `app/` — Pages (page.tsx, layout.tsx, game/page.tsx, game/loading.tsx)
- `components/` — React components (Sidebar, GameCanvas, ChallengePanel, EditProfileModal, ViewProfileModal, Toast, RouteProgress, ErrorBoundary, etc.)
- `lib/` — Business logic (gameEngine, challengeGenerator, challengeTracker, challengeStore, challengeIntegration, sessionHistory, mockData, mockProfile, milestoneDefinitions, challengeTypes)
- `public/images/` — Badge PNGs and border PNGs
- `public/sounds/` — Hit sound effects

## Key Data Structures
- **ProfileData**: `{ profilePicture, equippedBorder, equippedBadges: string[], equippedTitle }`
- **ChallengeSet**: `{ date, dailyChallenges[4], weeklyChallenges[5], weekStart, generatedAt }`
- **CumulativeStats**: Tracks totalCompleted, streaks, totalSessions, totalScore, bestSingleScore, bestReactionTime, avgAccuracy
- **MilestoneDefinition**: `{ id, rewardType, rewardImage, rewardName, condition }`
- **UnlockedReward**: `{ milestoneId, unlockedAt }`

## localStorage Keys
- `aimX_settings` — Game settings (mode, duration, adaptiveDifficulty)
- `aimX_challengeSet` — Current challenges + progress
- `aimX_cumulativeStats` — Lifetime stats
- `aimX_unlockedRewards` — Unlocked borders/badges
- `aimX_profileData` — Profile picture, border, badges, title
- `aimX_username` — Display username
- `aimX_crosshair` — Crosshair settings
- `aimX_hitSound` — Selected hit sound
- `aimX_highscore_{mode}` — High scores per mode
- `aimX_sessionHistory` — Array of last 50 game sessions (score, accuracy, reaction, etc.)

## Important Rules
1. **Never overwrite app/page.tsx hero section** — It has framer-motion stagger animations, neon X effect, stats row, and footer trademark. Always preserve these when editing.
2. **Badge images with % in filename** — Use `encodeURIComponent()` in img src (e.g., `Top 1%.png`)
3. **Scrollbar styling** — Auto-hide scrollbar defined in globals.css. Use `overflow-y-auto overflow-x-hidden` on scroll containers.
4. **Modal structure** — Outer div = `overflow-hidden rounded-2xl flex flex-col`, inner scroll area = `overflow-y-auto flex-1`, header/footer = `flex-shrink-0`
5. **initDemoRewards()** — Currently unlocks ALL borders and badges for preview. Change this back to partial unlock before production.
6. **Challenge generation is deterministic** — Same date = same challenges. Uses Mulberry32 PRNG seeded from date string.
7. **Game engine integration** — `buildSessionResult()` in gameEngine.ts converts GameState to SessionResult. `handleGameOver()` in challengeIntegration.ts orchestrates the full evaluation flow.
8. **All form inputs must be controlled** — Always provide `value` + `onChange`. Never mix controlled and uncontrolled inputs in the same form or across conditional renders.
9. **Toast on every user action** — Any action that changes state (save, delete, navigate, login, logout) must show a toast notification.
10. **Empty states are mandatory** — Every list/grid that can be empty must have a designed empty state with icon, message, and action.
11. **Keyboard accessibility** — All clickable cards/items must have `tabIndex={0}` and handle Enter/Space key events.
12. **Color contrast minimum** — Never use text color lighter than `#888888` on dark backgrounds. Avoid `#555555` or `#666666` for readable text.
13. **Session history** — Every game completion must call `saveSession()` from `lib/sessionHistory.ts`. Profile stats and analytics read from this.
14. **ESC confirmation during gameplay** — Show "Leave game?" modal before navigating away. On game-over screen, ESC goes directly to menu.
15. **Error boundary** — Wrap game page content in `<ErrorBoundary>` to catch rendering crashes gracefully.
16. **Improvement indicators** — Game-over screen shows "↑ X vs last" deltas for score, accuracy, and reaction time compared to previous session.
17. **Back to top** — Floating button appears after scrolling 600px on main page.

## Sidebar Structure
The Sidebar component contains multiple panels:
- **Home** — Navigates to `/`, shows active indicator when on home page
- **Profile** — Login/register (controlled inputs), profile info, stats, achievements (unlocked badges only)
- **Leaderboard** — Global modal with game mode filter
- **Friends** — Friend list + add friend (search from mock players) with empty states
- **Analytics** — Charts and performance data (mock)
- **Challenges** — Daily (4) + Weekly (5) challenges with countdown timers
- **Settings** — Crosshair customizer + hit sound selector (both with toast on save)

## Current Mock Data
- Friends: FlickMaster (Ultra Instinct), SlowButSure (Potato Aim), TrackingGod (Magnet Aim)
- Searchable players: 15 mock players (SniperElite, QuickDraw, AimBot99, etc.)
- Leaderboard: 50 mock players per mode
- Profile data for other players: Generated deterministically from player ID via `generateMockProfile()`

## Planned Backend (Not Yet Implemented)
- Supabase (PostgreSQL + Auth + Storage)
- Real auth replacing dummy login
- Score submission with server-side validation
- Real leaderboard rankings
- Real friend system
- Server-side challenge evaluation
