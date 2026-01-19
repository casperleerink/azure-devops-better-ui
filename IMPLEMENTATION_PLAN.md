# Implementation Plan

> Auto-generated breakdown of specs into tasks.
> Delete this file to return to working directly from specs.

## Priority Tasks

### Backend (Prerequisites)
- [x] [HIGH] Add `ado:workItems:listChildren` IPC channel type to `src/shared/types.ts` - from spec 004
- [x] [HIGH] Implement `listChildren()` method in `src/main/ado-client.ts` using WIQL parent query - from spec 004
- [x] [HIGH] Add IPC handler for `ado:workItems:listChildren` in `src/main/ipc.ts` - from spec 004
- [x] [HIGH] Expose `workItems.listChildren()` API in `src/preload/index.ts` - from spec 004

### Frontend Core Components
- [x] [HIGH] Create reusable `StateCell` and `AssigneeCell` components in `src/renderer/components/work-items/table-cells.tsx` - from spec 004
- [x] [HIGH] Create `ChildWorkItemsSection` component with table, loading states, and empty state - from spec 004
- [x] [HIGH] Implement child type detection logic (Epic→Feature→User Story→Task) in ChildWorkItemsSection - from spec 004
- [x] [HIGH] Integrate `ChildWorkItemsSection` into work item detail page - from spec 004

### Quick Create Feature
- [x] [MEDIUM] Update `CreateWorkItemDialog` to accept `defaultValues` prop (type, parentId) - from spec 004
- [x] [MEDIUM] Update `CreateWorkItemDialog` to support controlled open/onOpenChange props - from spec 004
- [x] [MEDIUM] Add parent work item fetch and form pre-fill logic to CreateWorkItemDialog - from spec 004
- [x] [MEDIUM] Wire up "Create [Type]" buttons in ChildWorkItemsSection to CreateWorkItemDialog - from spec 004
- [x] [MEDIUM] Add query invalidation after successful child creation to refresh list - from spec 004

### Polish
- [ ] [LOW] Test all work item type hierarchies (Epic, Feature, User Story, Task) - from spec 004
- [ ] [LOW] Verify section is hidden for Task work items - from spec 004
- [ ] [LOW] Test click navigation from child rows to detail pages - from spec 004
- [ ] [LOW] Test empty state display and messaging - from spec 004

