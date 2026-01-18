# Implementation Plan

> Auto-generated breakdown of specs into tasks.
> Delete this file to return to working directly from specs.

## Spec Status Overview

| Spec | Status | Notes |
|------|--------|-------|
| 001 - Testing Setup | ✅ Complete | Vitest, MSW, tests all working |
| 002 - UI Polish | ✅ Complete | Avatar depth, form states, empty/error states done |
| 003 - Work Item Detail Improvements | ⏳ Pending | Main focus of this plan |

---

## Priority Tasks

### Phase 1: Infrastructure & Dependencies

- [x] [HIGH] Install Tiptap dependencies (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`) - from spec 003
- [x] [HIGH] Create `SaveIndicator` component (`src/renderer/components/ui/save-indicator.tsx`) - from spec 003

### Phase 2: IPC & Backend for User Search

- [x] [HIGH] Add `UserSearchResult` type to `src/shared/types.ts` - from spec 003
- [x] [HIGH] Add `searchUsers` method to `src/main/ado-client.ts` using Azure DevOps identities API - from spec 003
- [x] [HIGH] Add `ado:users:search` IPC handler in `src/main/ipc.ts` - from spec 003
- [x] [HIGH] Expose `users.search` in preload API (`src/preload/index.ts`) - from spec 003

### Phase 3: Auto-Save Hook & Field Mutations

- [x] [HIGH] Create `useFieldMutation` hook for individual field auto-save pattern - from spec 003
- [x] [HIGH] Refactor title field in `work-item-detail.tsx` to auto-save on blur - from spec 003
- [x] [HIGH] Refactor state dropdown in `DetailsGrid.tsx` to auto-save immediately on change - from spec 003
- [x] [HIGH] Update iteration picker in `DetailsGrid.tsx` to auto-save on selection - from spec 003

### Phase 4: Assignee Combobox

- [x] [HIGH] Create `AssigneeCombobox` component with user search (`src/renderer/components/work-item-detail/AssigneeCombobox.tsx`) - from spec 003
- [x] [HIGH] Integrate `AssigneeCombobox` in `DetailsGrid.tsx` replacing static assignee display - from spec 003
- [x] [HIGH] Wire up auto-save on assignee selection - from spec 003

### Phase 5: Tiptap Description Editor

- [ ] [HIGH] Create `EditorToolbar` component (bold, italic, H1-H3, lists, links) - from spec 003
- [ ] [HIGH] Create `DescriptionEditor` component with Tiptap integration - from spec 003
- [ ] [HIGH] Replace `BareTextarea` in `DescriptionSection.tsx` with Tiptap editor - from spec 003
- [ ] [HIGH] Add dedicated save button at bottom of description section - from spec 003

### Phase 6: Header & Cleanup

- [ ] [MEDIUM] Remove global "Save Changes" button from `DetailHeader.tsx` - from spec 003
- [ ] [MEDIUM] Fix header badge to contain icon inside (not as sibling) in `DetailHeader.tsx` - from spec 003
- [ ] [MEDIUM] Update back button to use `Button` component with `variant="subtle"` - from spec 003

### Phase 7: Polish

- [ ] [LOW] Review skeleton loader dimensions to match actual content layout - from spec 003
- [ ] [LOW] Remove duplicate border on assignee row in `DetailsGrid.tsx` (if present) - from spec 003
- [ ] [LOW] Integrate toast notifications for save errors - from spec 003

---

## Completed

### From Spec 001: Testing Setup with Vitest
- [x] Install testing dependencies (vitest, electron-vitest, msw, @vitest/coverage-v8)
- [x] Create `vitest.config.ts` with electron-vitest configuration
- [x] Add test scripts to `package.json` (test, test:watch, test:coverage)
- [x] Create MSW setup files (`src/test/msw/server.ts`, `src/test/msw/handlers.ts`)
- [x] Implement Azure DevOps API mock handlers for key endpoints
- [x] Write unit tests for `src/main/ado-client.ts`
- [x] Ensure TypeScript includes test files in type checking
- [x] Verify all lint and typecheck commands pass

### From Spec 002: UI Polish and Consistency
- [x] Add subtle depth to avatar fallback (inner shadow)
- [x] Remove unused avatar outline variants (cyan, yellow, green, red, purple)
- [x] Make MoreHorizontal button always visible in WorkItemRow
- [x] Fix hardcoded `bg-red-50` to theme-aware `bg-red-500/5`
- [x] Add AlertCircle icon to error states
- [x] Add icon to work items list empty state
- [x] Add icon to work item not found state
- [x] Apply proper spacing and theme-aware colors to empty/error states
- [x] Update interactive states on form components
- [x] Review and standardize padding across form controls

---

## Files to Create

```
src/renderer/components/ui/save-indicator.tsx                   (DONE)
src/renderer/hooks/useFieldMutation.ts                          (DONE)
src/renderer/components/work-item-detail/AssigneeCombobox.tsx   (DONE)
src/renderer/components/work-item-detail/DescriptionEditor.tsx
src/renderer/components/work-item-detail/EditorToolbar.tsx
```

## Files to Modify

```
src/shared/types.ts                                         (add UserSearchResult type)
src/main/ado-client.ts                                      (add searchUsers method)
src/main/ipc.ts                                             (add ado:users:search handler)
src/preload/index.ts                                        (add users.search to API)
src/renderer/routes/work-item-detail.tsx                    (refactor to auto-save pattern)
src/renderer/components/work-item-detail/DetailHeader.tsx   (remove save btn, fix badge/back btn)
src/renderer/components/work-item-detail/DetailsGrid.tsx    (add auto-save, assignee combobox)
src/renderer/components/work-item-detail/DescriptionSection.tsx (replace with Tiptap editor)
```

---

## Implementation Notes

### Auto-Save Pattern
Each field uses its own mutation hook with inline feedback:
```tsx
const titleMutation = useFieldMutation(workItemId, "title");
<BareInput onBlur={() => titleMutation.mutate(localTitle)} />
{titleMutation.isPending && <SaveIndicator isPending />}
```

### User Search API
Uses Azure DevOps identities endpoint:
```
GET https://vssps.dev.azure.com/{org}/_apis/identities?searchFilter=General&filterValue={query}
```

### Tiptap
Tiptap natively accepts and outputs HTML - no complex conversion needed. Pass Azure DevOps `descriptionHtml` directly to `content` prop, call `editor.getHTML()` to save.
