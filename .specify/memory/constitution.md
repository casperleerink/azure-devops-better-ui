# Project Constitution

## Project Identity

**Name:** Azure DevOps Better UI

**Vision:** A modern, fast desktop app for browsing and managing Azure DevOps work items with improved UX over the web interface.

## Guiding Principles

1. **Simplicity & Speed** - Keep the UI simple, fast, and focused on the most common tasks. Avoid feature bloat.

2. **Type Safety First** - Leverage TypeScript strictly across all processes (main, preload, renderer) for reliability and developer experience.

## Technical Stack

- **Runtime:** Electron 40, React 19, TypeScript
- **Routing:** TanStack Router
- **Data Fetching:** TanStack Query
- **Styling:** Tailwind CSS 4, Radix UI primitives
- **Build:** Vite (renderer), tsc (main/preload), Bun (package manager)
- **Linting:** Biome

## Architecture

Three-process Electron architecture:
- **Main Process** (`src/main/`) - Node.js runtime, Azure DevOps REST API client, encrypted credential storage
- **Preload** (`src/preload/`) - Context bridge exposing type-safe window.ado API
- **Renderer** (`src/renderer/`) - React UI with TanStack Router/Query

All main↔renderer communication flows through typed IPC channels.

## Coding Standards

- Use theme-aware color tokens (never hardcode `white`, `black`, or raw hex)
- Follow the IPC pattern: types → main handler → preload API → React usage
- Keep commits atomic and descriptive
- Run `bun run lint` and `bun run typecheck` before committing

## Operational Settings

**YOLO Mode:** disabled
**Git Autonomy:** enabled

## Ralph Wiggum Installation

- **Installed:** 2026-01-18
- **Commit:** a10293e0a1c0bce136045ba314e34580a714942c
- **Source:** https://github.com/fstandhartinger/ralph-wiggum
