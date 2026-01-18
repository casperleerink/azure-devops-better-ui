# Azure DevOps Better UI

A fast local desktop app for browsing, filtering, creating, and updating Azure DevOps work items.

## Why?

Let's be honest — the Azure DevOps web UI is... not great. It's slow, cluttered, and makes simple tasks feel like a chore. This project is an attempt to build something better: a clean, fast desktop app that talks to the Azure DevOps REST API but provides a much nicer experience for managing work items.

> **Disclaimer**: This is a personal/experimental project that was largely vibecoded. It works for my use case but is definitely not production-ready. Use at your own risk, and feel free to contribute or fork it for your own needs.

## Features

- Browse and filter work items across projects
- Create and update work items
- Fast local desktop app (Electron)
- Dark/light theme support
- Encrypted credential storage via OS keyring

## Tech Stack

- **Runtime**: Electron 40, React 19, TypeScript
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Styling**: Tailwind CSS 4, Radix UI primitives
- **Build**: Vite (renderer), tsc (main/preload)
- **Package Manager**: Bun
- **Linting**: Biome

## Prerequisites

- [Bun](https://bun.sh/) (package manager)
- Node.js 18+ (for Electron)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/azure-devops-better-ui.git
   cd azure-devops-better-ui
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun run dev
   ```

   This runs Vite (for the React frontend) and Electron concurrently with hot reload.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (Vite + Electron) |
| `bun run build` | Build all processes (main, preload, renderer) |
| `bun run start` | Run the built Electron app |
| `bun run dist` | Build distributable packages |
| `bun run lint` | Run Biome linter |
| `bun run lint:fix` | Auto-fix lint issues |
| `bun run format` | Format code with Biome |
| `bun run typecheck` | TypeScript type checking |

## Architecture

This is a standard Electron app with three processes:

```
MAIN PROCESS (src/main/)
├─ Node.js runtime, file system, native APIs
├─ Azure DevOps REST API client
├─ Encrypted credential storage
└─ IPC handlers for all operations
     │
     │ ipcMain ←→ ipcRenderer
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

## Configuration

On first launch, you'll need to configure your Azure DevOps connection:

1. Your Azure DevOps organization URL (e.g., `https://dev.azure.com/your-org`)
2. A Personal Access Token (PAT) with appropriate permissions

Credentials are stored securely using your OS keyring via Electron's `safeStorage` API.

## Building for Distribution

To create distributable packages for your platform:

```bash
bun run dist
```

Output will be in the `release/` directory.

## License

ISC

---

*Built by [Hooman Studio](https://hoomanstudio.com)*
