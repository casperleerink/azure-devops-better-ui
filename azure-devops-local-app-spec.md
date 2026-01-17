# Azure DevOps Local Desktop App Spec

## Goal
A fast local desktop app to **browse, filter, create, and update Azure DevOps work items** (Epics / Features / User Stories / Tasks) for yourself and teammates, using **Azure DevOps REST API**.  
The app runs entirely locally using **Electron IPC** to keep secrets out of the renderer.

## Non-goals (v1)
- Full board / sprint planning UI
- Custom process template configuration UI
- Comments, threads, attachments

---

## Core User Stories

### 1. List work items
Users can:
- View **their own** Epics / Features / User Stories / Tasks
- View **any teammate’s** Epics / Features / User Stories / Tasks

Available filters:
- Work item types (multi-select)
- Assigned to (Me / specific user)
- State (New / Active / Resolved / Closed, process-dependent)
- Area Path (optional)
- Iteration Path (optional)
- Changed in last X days
- Title text search
- Sort order (ChangedDate desc default)

### 2. Create work items
- Create Epic / Feature / User Story / Task
- Set title and optional description
- Optionally assign a parent
- Optionally assign to a user
- Optionally set area and iteration

### 3. Update work items
- Edit title, description, state, assignment
- Change area and iteration
- Optimistic UI updates

---

## Tech Stack

### Shell
- Electron
  - Main process = backend
  - Renderer = React UI
  - Preload bridge exposes IPC API

### UI
- React
- TanStack Router (memory history)
- TanStack Query for async IPC
- shadcn/ui + Tailwind CSS

### Data Access
- Azure DevOps REST API
- PAT authentication
- PAT stored securely in OS keychain

---

## High-Level Architecture

### Renderer (React)
- Renders UI and filters
- Uses TanStack Query
- Calls IPC methods such as:
  - `workItems.list(filters)`
  - `workItems.create(payload)`
  - `workItems.update(id, patch)`

### Main Process (Backend)
- Stores and reads PAT
- Calls Azure DevOps REST APIs
- Builds WIQL queries
- Handles batching, pagination, caching
- Normalizes API responses

### Preload
- Exposes a narrow, typed API via `contextBridge`
- No direct Node or secret access from renderer

---

## Navigation & Screens

### Routes
- `/work-items`
- `/work-items/:id`
- `/create`
- `/settings`

### Work Items List
- Sidebar filters
- Main table:
  - ID, Title, Type, State, Assigned To, Iteration, Changed Date
- Click item to open detail view

### Create Work Item
- Type selector
- Title and description
- Assign user
- Select parent
- Area and iteration

### Work Item Detail
- View and edit fields
- Change state and assignment
- Save or auto-save changes

### Settings
- Organization URL
- Project name
- PAT status and test
- Default filters

---

## IPC Contract

### Auth / Config
- `ado.config.get()`
- `ado.config.set()`
- `ado.auth.setPat()`
- `ado.auth.clearPat()`
- `ado.auth.test()`

### Identities
- `ado.identities.search(query)`
- `ado.identities.listProjectUsers()`

### Work Items
- `ado.workItems.list(filters)`
- `ado.workItems.get(id)`
- `ado.workItems.create(payload)`
- `ado.workItems.update(id, patch)`

---

## Types

```ts
type WorkItemType = "Epic" | "Feature" | "User Story" | "Task";

type WorkItemSummary = {
  id: number;
  url: string;
  type: WorkItemType;
  title: string;
  state: string;
  assignedTo?: { displayName: string; uniqueName?: string };
  areaPath?: string;
  iterationPath?: string;
  changedDate?: string;
};

type WorkItemDetail = WorkItemSummary & {
  descriptionHtml?: string;
  tags?: string[];
  parentId?: number;
};

type WorkItemListFilters = {
  assignedTo?: "me" | { identityId: string };
  types: WorkItemType[];
  states?: string[];
  text?: string;
  areaPath?: string;
  iterationPath?: string;
  changedSinceDays?: number;
  sort?: "changedDesc" | "createdDesc";
};
```

---

## Azure DevOps REST Strategy

### Authentication
- PAT via Basic auth
- Central `adoFetch()` helper in main process

### Listing Work Items
1. Run WIQL query
2. Collect IDs
3. Batch fetch work item fields

### Create / Update
- JSON Patch requests
- Parent relations via hierarchy links

---

## Caching & Data Fetching

- TanStack Query keys:
  - `["workItems", filters]`
  - `["workItem", id]`
- Work items stale time: 15–60s
- Identities cached for hours

---

## Security
- PAT never exposed to renderer
- Context isolation enabled
- IPC payload validation recommended
- No local HTTP server in v1

---

## Implementation Milestones

### Milestone 1
- Electron shell
- Settings + PAT test
- REST helper

### Milestone 2
- Work item list with filters
- WIQL + batch fetch

### Milestone 3
- Create work items
- Parent linking

### Milestone 4
- Update/edit work items
- Optimistic updates

---

## Open Decisions
- Single project in v1
- Plain text description editor
- Process-specific states handled dynamically
