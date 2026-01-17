# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
bun install              # Install dependencies
bun run dev              # Start dev server (Vite + Electron concurrently)
bun run build            # Build all processes (main, preload, renderer)
bun run lint             # Run Biome linter
bun run lint:fix         # Auto-fix lint issues
bun run format           # Format with Biome
bun run typecheck        # TypeScript type checking
bun run start            # Run built Electron app
bun run dist             # Build distributable packages
```

## Architecture Overview

This is an **Electron + React desktop app** for browsing and managing Azure DevOps work items.

### Three-Process Architecture

```
MAIN PROCESS (src/main/)
├─ Node.js runtime, file system, native APIs
├─ Azure DevOps REST API client (ado-client.ts)
├─ Encrypted credential storage (secure-store.ts)
└─ IPC handlers for all operations (ipc.ts)
     │
     │ ipcMain.handle() ←→ ipcRenderer.invoke()
     │
PRELOAD (src/preload/)
├─ Context bridge exposing window.ado API
└─ Type-safe wrapper around IPC calls
     │
RENDERER (src/renderer/)
├─ React UI with TanStack Router/Query
└─ Calls window.ado.* to invoke main process
```

### Key Directories

- `src/main/` - Electron main process (Node.js APIs, Azure DevOps client)
- `src/preload/` - Context bridge exposing safe API to renderer
- `src/renderer/` - React frontend (routes, components, UI)
- `src/shared/types.ts` - Shared TypeScript types across all processes

### IPC Communication Pattern

All main↔renderer communication flows through typed IPC channels:

1. **Main** (`src/main/ipc.ts`): Registers handlers with `ipcMain.handle("ado:channel", handler)`
2. **Preload** (`src/preload/index.ts`): Exposes API via `contextBridge.exposeInMainWorld("ado", api)`
3. **Renderer**: Calls `window.ado.workItems.list(filters)` which invokes IPC

### State Management

- **TanStack Query**: Server state (work items, config) with automatic caching
- **React useState**: UI-only state (filters, search text)
- **Persistence**: Config in JSON file, credentials encrypted via `electron.safeStorage`

### Adding a New Feature

1. Add types to `src/shared/types.ts`
2. Add IPC handler to `src/main/ipc.ts`
3. Add API method to `src/main/ado-client.ts` (if calling Azure DevOps)
4. Add preload API method to `src/preload/index.ts`
5. Use in React via `useQuery()` or `useMutation()` with `window.ado.*`

### Security Model

- Context isolation enabled, node integration disabled
- Renderer cannot access filesystem or Node APIs directly
- Credentials stored encrypted via OS keyring (safeStorage)
- All sensitive operations routed through main process

## Tech Stack

- **Runtime**: Electron 40, React 19, TypeScript
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4, Radix UI primitives
- **Build**: Vite (renderer), tsc (main/preload), Bun (package manager)
- **Linting**: Biome
