# Implementation Plan

> Auto-generated breakdown of specs into tasks.
> Delete this file to return to working directly from specs.

## Spec Status Overview

| Spec | Status |
|------|--------|
| 001-testing-setup.md | ✅ Complete |
| 002-ui-polish.md | ✅ Complete |

---

## Priority Tasks

(All tasks completed - see Completed section below)

---

## Completed

### From Spec 002: UI Polish and Consistency

#### Avatar Component
- [x] [HIGH] Add subtle depth to avatar fallback (inner shadow) - from spec 002
- [x] [HIGH] Remove unused outline variants: `cyan`, `yellow`, `green`, `red`, `purple` - from spec 002
- [x] [HIGH] Clean up `avatarWithOutlineChildrenSizes` mapping (no longer needed for removed variants) - from spec 002

#### Work Item Row Menu
- [x] [HIGH] Make MoreHorizontal button always visible (remove `opacity-0 group-hover:opacity-100`) - from spec 002
- [x] [MEDIUM] Use subtle styling for menu button that doesn't compete with primary content - from spec 002

#### Error States
- [x] [HIGH] Fix hardcoded `bg-red-50` to theme-aware `bg-red-500/5` in `work-item-detail.tsx:99` - from spec 002
- [x] [MEDIUM] Add AlertCircle icon to error states in `work-items.tsx:102-107` - from spec 002
- [x] [MEDIUM] Add AlertCircle icon to error states in `work-item-detail.tsx:98-105` - from spec 002
- [x] [MEDIUM] Standardize error message styling across all error states - from spec 002

#### Empty States
- [x] [HIGH] Add icon (Search or Inbox) to work items list empty state in `work-items.tsx:147-152` - from spec 002
- [x] [HIGH] Add icon (FileX or AlertCircle) to work item not found state in `work-item-detail.tsx:122-124` - from spec 002
- [x] [MEDIUM] Apply proper spacing, typography hierarchy, and theme-aware colors to empty states - from spec 002

#### Consistent Interactive States
- [x] [MEDIUM] Update `InputWithIcon` with consistent focus state (`focus-visible:border-blue-500`) - from spec 002
- [x] [MEDIUM] Update `InputWithIcon` with consistent hover state (`hover:bg-gray-100/70`) - from spec 002
- [x] [MEDIUM] Add error state support to input components (`[&.error]:border-red-500`) - from spec 002
- [x] [LOW] Review `Select` / `SelectTrigger` interactive states for consistency - from spec 002
- [x] [LOW] Review `UserCombobox` and `IterationCombobox` trigger interactive states - from spec 002

#### Padding Consistency
- [x] [LOW] Standardize form field padding to `p-2` / `px-2` scale - from spec 002
- [x] [LOW] Review and normalize padding in `FormFieldContainer`, `FormFieldControl` - from spec 002
- [x] [LOW] Review padding in `SelectTrigger`, `SelectItem` - from spec 002
- [x] [LOW] Review padding in combobox triggers - from spec 002

#### Loading States
- [x] [LOW] Ensure loading skeletons use consistent border-radius matching their content - from spec 002
- [x] [LOW] Review skeleton sizing to better match actual content dimensions - from spec 002

### From Spec 001: Testing Setup with Vitest

- [x] [HIGH] Install testing dependencies (vitest, electron-vitest, msw, @vitest/coverage-v8)
- [x] [HIGH] Create `vitest.config.ts` with electron-vitest configuration
- [x] [HIGH] Add test scripts to `package.json` (test, test:watch, test:coverage)
- [x] [HIGH] Create MSW setup files (`src/test/msw/server.ts`, `src/test/msw/handlers.ts`)
- [x] [HIGH] Implement Azure DevOps API mock handlers for key endpoints
- [x] [MEDIUM] Write unit tests for `src/main/ado-client.ts` - getWorkItems()
- [x] [MEDIUM] Write unit tests for `src/main/ado-client.ts` - getWorkItem(id)
- [x] [MEDIUM] Write unit tests for `src/main/ado-client.ts` - error handling
- [x] [MEDIUM] Write unit tests for `src/main/ado-client.ts` - authentication headers
- [x] [LOW] Ensure TypeScript includes test files in type checking
- [x] [LOW] Verify all lint and typecheck commands pass with new test files

---

## Notes

- Tests are colocated with source files (`*.test.ts` pattern)
- Coverage reporting enabled but no enforced thresholds
- The `BareInput` component is used inside `FormFieldContainer` which already provides interactive states - no changes needed
- The base `Input` component is minimal by design (used inside other wrappers) - no changes needed
- Avatar color variants (`cyan`, `yellow`, `green`, `red`, `purple`) are confirmed unused in the codebase
- Padding was already consistent across components - no changes required
- Skeleton border-radius already matches content appropriately
