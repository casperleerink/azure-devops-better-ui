# Implementation Plan

> Auto-generated breakdown of specs into tasks.
> Delete this file to return to working directly from specs.

## Spec Status Overview

| Spec | Status |
|------|--------|
| 001-testing-setup.md | ✅ Complete |
| 002-ui-polish.md | 🔄 Pending |

---

## Priority Tasks

### Avatar Component
- [ ] [HIGH] Add subtle depth to avatar fallback (inner shadow) - from spec 002
- [ ] [HIGH] Remove unused outline variants: `cyan`, `yellow`, `green`, `red`, `purple` - from spec 002
- [ ] [HIGH] Clean up `avatarWithOutlineChildrenSizes` mapping (no longer needed for removed variants) - from spec 002

### Work Item Row Menu
- [ ] [HIGH] Make MoreHorizontal button always visible (remove `opacity-0 group-hover:opacity-100`) - from spec 002
- [ ] [MEDIUM] Use subtle styling for menu button that doesn't compete with primary content - from spec 002

### Error States
- [ ] [HIGH] Fix hardcoded `bg-red-50` to theme-aware `bg-red-500/5` in `work-item-detail.tsx:99` - from spec 002
- [ ] [MEDIUM] Add AlertCircle icon to error states in `work-items.tsx:102-107` - from spec 002
- [ ] [MEDIUM] Add AlertCircle icon to error states in `work-item-detail.tsx:98-105` - from spec 002
- [ ] [MEDIUM] Standardize error message styling across all error states - from spec 002

### Empty States
- [ ] [HIGH] Add icon (Search or Inbox) to work items list empty state in `work-items.tsx:147-152` - from spec 002
- [ ] [HIGH] Add icon (FileX or AlertCircle) to work item not found state in `work-item-detail.tsx:122-124` - from spec 002
- [ ] [MEDIUM] Apply proper spacing, typography hierarchy, and theme-aware colors to empty states - from spec 002

### Consistent Interactive States
- [ ] [MEDIUM] Update `InputWithIcon` with consistent focus state (`focus-visible:border-blue-500`) - from spec 002
- [ ] [MEDIUM] Update `InputWithIcon` with consistent hover state (`hover:bg-gray-100/70`) - from spec 002
- [ ] [MEDIUM] Add error state support to input components (`[&.error]:border-red-500`) - from spec 002
- [ ] [LOW] Review `Select` / `SelectTrigger` interactive states for consistency - from spec 002
- [ ] [LOW] Review `UserCombobox` and `IterationCombobox` trigger interactive states - from spec 002

### Padding Consistency
- [ ] [LOW] Standardize form field padding to `p-2` / `px-2` scale - from spec 002
- [ ] [LOW] Review and normalize padding in `FormFieldContainer`, `FormFieldControl` - from spec 002
- [ ] [LOW] Review padding in `SelectTrigger`, `SelectItem` - from spec 002
- [ ] [LOW] Review padding in combobox triggers - from spec 002

### Loading States
- [ ] [LOW] Ensure loading skeletons use consistent border-radius matching their content - from spec 002
- [ ] [LOW] Review skeleton sizing to better match actual content dimensions - from spec 002

---

## Completed

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
