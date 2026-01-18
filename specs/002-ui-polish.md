# UI Polish and Consistency

status: complete

## Description

Improve visual polish and consistency across the application. This includes fixing visibility issues, adding depth to flat components, standardizing interactive states (focus, hover, error) across all form elements, normalizing padding, and enhancing empty/error states with icons and better styling.

## Acceptance Criteria

### Avatar Component
- [x] Avatar fallback has subtle depth (inner shadow or gradient) instead of flat background
- [x] Remove unused outline variants: `cyan`, `yellow`, `green`, `red`, `purple` (keep `none` and `gray`)
- [x] Remove associated compound variants and size mappings for removed variants

### Work Item Row Menu
- [x] MoreHorizontal button is always visible (remove `opacity-0 group-hover:opacity-100`)
- [x] Button uses subtle styling that doesn't compete with primary content

### Consistent Interactive States (FormField Style)
- [x] All form inputs use consistent focus state: `border-blue-500`
- [x] All form inputs use consistent hover state: subtle background change
- [x] All form inputs support error state: `border-red-500`
- [x] Components to update: `Input`, `InputWithIcon`, `BareInput`, `Select`, `UserCombobox`, `IterationCombobox`

### Padding Consistency
- [x] Form field padding standardized to `p-2` / `px-2` scale
- [x] Review and normalize padding in: `FormFieldContainer`, `FormFieldControl`, `SelectTrigger`, `SelectItem`, `Input` variants, combobox triggers

### Empty States
- [x] Work items list empty state has icon (e.g., search or inbox icon) with improved layout
- [x] Work item not found state has icon (e.g., file-x or alert icon) with improved layout
- [x] Empty states use proper spacing, typography hierarchy, and theme-aware colors

### Error States
- [x] Fix hardcoded `bg-red-50` to theme-aware `bg-red-500/5` in `work-item-detail.tsx`
- [x] Error states include appropriate icon (e.g., AlertCircle)
- [x] Error messages have consistent styling across all pages

### Loading States
- [x] Loading skeletons use consistent border-radius matching their content
- [x] Review skeleton sizing to better match actual content dimensions

## Technical Notes

### Avatar Depth Styling

Add inner shadow or gradient to create depth. Example approach:

```tsx
// In avatarVariants, update the "none" outline variant
outline: {
  none: "bg-alpha/10 border-none text-gray-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]",
  gray: "border-2 border-alpha/10 text-gray-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]",
}
```

### Interactive States Standard

Base the unified states on `FormFieldContainer` pattern:

```tsx
// Standard interactive states for form elements
const interactiveStyles = `
  border border-alpha/5
  hover:bg-gray-100/70
  focus-within:border-blue-500
  [&.error]:border-red-500
  transition-colors duration-200
`;
```

### Files to Modify

**Components:**
- `src/renderer/components/ui/avatar.tsx` - Depth + remove variants
- `src/renderer/components/ui/input.tsx` - Add consistent states
- `src/renderer/components/ui/select.tsx` - Add consistent states
- `src/renderer/components/ui/form-field.tsx` - Review padding
- `src/renderer/components/work-items/WorkItemRow.tsx` - Menu visibility
- `src/renderer/components/work-items/UserCombobox.tsx` - Add consistent states
- `src/renderer/components/work-items/IterationCombobox.tsx` - Add consistent states

**Pages:**
- `src/renderer/routes/work-items.tsx` - Empty state improvements
- `src/renderer/routes/work-item-detail.tsx` - Error state fix, not found state

### Empty State Pattern

```tsx
// Consistent empty state component structure
<div className="py-16 text-center">
  <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-alpha/5">
    <SearchIcon className="size-6 text-gray-400" />
  </div>
  <p className="font-medium text-gray-600">No work items found</p>
  <p className="mt-1 text-sm text-gray-400">
    Try adjusting your filters or create a new work item
  </p>
</div>
```

### Error State Pattern

```tsx
// Consistent error state component structure
<div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
  <div className="flex items-start gap-3">
    <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
    <div>
      <p className="font-medium text-red-600">Error loading work items</p>
      <p className="mt-1 text-sm text-gray-600">{error.message}</p>
    </div>
  </div>
</div>
```

## Out of Scope

- Adding new functionality or features
- Changing the overall layout or navigation structure
- Dark mode toggle UI (system handles theme switching)
- Animation/transition polish beyond hover/focus states
- Mobile responsive improvements
