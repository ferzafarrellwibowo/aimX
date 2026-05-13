# Implementation Plan: Main Page Improvement

## Overview

Enhance the aimX main page hero section with a branded trademark badge (neon flicker effect), decorative visual elements, quick stats row, improved tagline typography, and staggered Framer Motion entrance animations. All changes are scoped to `app/globals.css` and `app/page.tsx`.

## Tasks

- [x] 1. Add neon flicker CSS animation to globals.css
  - [x] 1.1 Add `@keyframes neon-flicker` with varying glow intensities and opacity states
    - Keyframe stops: 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% at full glow (opacity 1)
    - Keyframe stops: 20%, 24%, 55% with no text-shadow (opacity 0.8)
    - Use red color values (#ff2d2d, #dc2626) matching existing theme accents
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Add `.neon-text` utility class with the neon-flicker animation
    - Set `animation: neon-flicker 3s infinite`
    - Include base text-shadow for persistent glow when not flickering
    - _Requirements: 2.1, 2.3_

  - [x] 1.3 Add `prefers-reduced-motion` media query to disable neon animation
    - Inside `@media (prefers-reduced-motion: reduce)`, set `.neon-text` animation to `none`
    - Keep a subtle static text-shadow for the glow effect without motion
    - _Requirements: 2.4_

- [x] 2. Add Framer Motion stagger animation variants to page.tsx
  - [x] 2.1 Import `motion` from `framer-motion` in page.tsx
    - Add `import { motion } from 'framer-motion'` to the existing imports
    - _Requirements: 6.1_

  - [x] 2.2 Define `heroContainerVariants` and `heroItemVariants` animation objects
    - `heroContainerVariants`: hidden (opacity 0), visible (opacity 1, staggerChildren: 0.1, delayChildren: 0.1)
    - `heroItemVariants`: hidden (opacity 0, y: 20), visible (opacity 1, y: 0, duration: 0.5, ease: 'easeOut')
    - Place above the `Home` component function
    - _Requirements: 6.1, 6.2_

- [x] 3. Enhance hero section with new elements and motion wrappers
  - [x] 3.1 Wrap the hero `<header>` content in a `motion.div` stagger container
    - Use `heroContainerVariants` with `initial="hidden"` and `animate="visible"`
    - Maintain existing `header` element and its classes
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 3.2 Wrap existing logo and tagline in individual `motion.div` elements with `heroItemVariants`
    - Wrap the `<h1>` aimX logo block in `motion.div variants={heroItemVariants}`
    - Wrap the `<p>` tagline in `motion.div variants={heroItemVariants}`
    - _Requirements: 6.1, 5.1, 5.2_

  - [x] 3.3 Improve tagline typography and spacing
    - Increase tagline font size from `text-sm` to `text-base md:text-lg`
    - Add `max-w-md` constraint to prevent text stretching on wide screens
    - Adjust `mb-6` spacing as needed for visual balance
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.4 Add "MADE BY UXTITLED" trademark badge element
    - Add a `motion.div` with `heroItemVariants` after the tagline
    - Render "MADE BY" in muted color (`text-[#555555] font-medium`)
    - Render "UXTITLED" with `neon-text text-red-500 font-bold` classes
    - Use `flex items-center gap-2 text-sm tracking-widest` layout
    - _Requirements: 1.1, 1.2, 1.3, 2.1_

  - [x] 3.5 Add decorative gradient divider element
    - Add a `motion.div` with `heroItemVariants` after the trademark badge
    - Style: `w-48 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent`
    - _Requirements: 3.1, 3.2_

  - [x] 3.6 Add quick stats row with game mode count, categories, and potential
    - Add a `motion.div` with `heroItemVariants` after the divider
    - Display "11" (Game Modes), "4" (Categories), "∞" (Potential) with vertical separators
    - Use `text-2xl font-bold text-white` for numbers, `text-xs text-[#555555] uppercase tracking-wider` for labels
    - Style "∞" in `text-red-500` to match accent color
    - _Requirements: 4.1, 4.2, 4.3, 3.1, 3.3_

- [x] 4. Checkpoint - Verify visual implementation
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 5. Write unit tests for hero section enhancements
  - [ ]* 5.1 Write unit tests for trademark badge rendering
    - Verify "MADE BY" and "UXTITLED" render as separate styled elements
    - Verify "UXTITLED" element has the `neon-text` CSS class
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 5.2 Write unit tests for quick stats row
    - Verify stats row displays "11", "4", and "∞" values
    - Verify stat labels render ("Game Modes", "Categories", "Potential")
    - _Requirements: 4.1, 4.2_

  - [ ]* 5.3 Write unit tests for motion wrapper presence
    - Verify hero section elements are wrapped in Framer Motion components
    - Verify stagger animation variants are applied to the container
    - _Requirements: 6.1, 6.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All changes are scoped to `app/globals.css` and `app/page.tsx` — no new files or components needed
- Framer Motion is already installed (`framer-motion: ^12.38.0`)
- The neon animation uses CSS keyframes for performance (GPU-compositable, no React re-renders)
- Quick stats values are hardcoded based on the existing `modes` and `categories` arrays
- `prefers-reduced-motion` support ensures accessibility compliance
