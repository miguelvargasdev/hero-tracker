# HERO: Tales of the Tomes - Health Tracker

A Progressive Web App (PWA) for tracking health, attack, mana, and armor stats during games of **HERO: Tales of the Tomes**.

## About

This is a mobile-first health tracker designed to be placed flat on a table during board game sessions. Players sit around the phone/tablet and each player's tracker is rotated to face them. The app supports multiple game modes and player counts, with each hero having unique base stats pulled from the board game.

### Features

- **Multiple game modes** - Solo, Standard (2-5 players), Skirmish (2v2), and Tyrant (coming soon)
- **8 playable heroes** - Each with unique HP, attack, mana, and armor values
- **Tap to increment/decrement** - Tap the top half to increase, bottom half to decrease (rotation-aware)
- **Subtrackers** - Long-press any tracker to open a drawer, then add attack, armor, or mana subtrackers one at a time
- **Hero artwork backgrounds** - Each tracker displays the hero's artwork
- **Responsive design** - Works across phones, tablets, and desktops
- **Installable PWA** - Add to home screen for a native app experience

### Tech Stack

- React 19 + TypeScript
- Vite 7 with PWA plugin
- Zustand for state management
- Vitest + Testing Library for tests
- GitHub Pages for deployment

## Built with Claude

This project is my first attempt at using [Claude Code](https://claude.com/claude-code) as the primary driver for development. Nearly all of the code - from the initial scaffold to the complex rotation-aware subtracker layouts - was written by Claude through an iterative conversation. I described features, provided reference images, and gave feedback on the results while Claude handled the implementation, debugging, and Git workflow (branching, PRs, merging).

It was an interesting experiment in AI-assisted development, where my role shifted from writing code to directing the architecture and providing design feedback.

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test:run
```

The test suite includes:
- **Hero template validation** - Verifies all 8 heroes have correct base stats
- **Store action tests** - Covers game lifecycle, hero selection, stat updates, and resets
- **Integration tests** - Full game flow from start to reset
