# Work Item Detail Page Improvements

status: pending

## Description

Enhance the work item detail page with inline auto-saving for metadata fields, a rich text Tiptap editor for descriptions with HTML conversion, and several UI fixes. The goal is to make editing work items faster and more intuitive by removing friction from the save workflow while maintaining clear feedback about save status.

## Acceptance Criteria

### Auto-Save for Metadata Fields
- [ ] Title field auto-saves on blur with debounce
- [ ] State dropdown auto-saves immediately on selection change
- [ ] Assignee combobox with search auto-saves on selection
- [ ] Iteration picker auto-saves on selection
- [ ] Remove global save button from header (no longer needed)

### Save Feedback System
- [ ] Inline spinner indicator appears next to field being saved
- [ ] Inline checkmark indicator shows briefly on successful save
- [ ] Toast notification appears only on save errors
- [ ] Fields are disabled during their individual save operation

### Assignee Combobox
- [ ] Searchable combobox that queries Azure DevOps for users
- [ ] Shows avatar and display name in dropdown options
- [ ] Displays current assignee with avatar when not editing
- [ ] Add IPC channel `ado:users:search` to query team members/users

### Tiptap Description Editor
- [ ] Replace HTML textarea with Tiptap rich text editor
- [ ] Basic toolbar: bold, italic, headings (H1-H3), bullet list, numbered list, links
- [ ] Converts Tiptap JSON to HTML for Azure DevOps API
- [ ] Converts Azure DevOps HTML to Tiptap-compatible format on load
- [ ] Dedicated save button at bottom of description section
- [ ] Visual distinction between edit and view modes

### UI Fixes
- [ ] Skeleton loader positions match actual content layout
- [ ] Remove duplicate border on assignee row (container already has border)
- [ ] Header badge contains icon inside (not separate)
- [ ] Back button uses Button component with subtle variant

## Technical Notes

### Auto-Save Implementation Pattern

Use individual mutation hooks for each field:

```tsx
// Pattern for auto-saving fields
const useFieldMutation = (workItemId: number, fieldName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: string) =>
      window.ado.workItems.update(workItemId, { [fieldName]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItem", workItemId] });
    },
    onError: (error) => {
      toast.error(`Failed to update ${fieldName}: ${error.message}`);
    },
  });
};

// Usage in component
const titleMutation = useFieldMutation(workItem.id, "title");
const [localTitle, setLocalTitle] = useState(workItem.title);

<BareInput
  value={localTitle}
  onChange={(e) => setLocalTitle(e.target.value)}
  onBlur={() => {
    if (localTitle !== workItem.title) {
      titleMutation.mutate(localTitle);
    }
  }}
  disabled={titleMutation.isPending}
/>
{titleMutation.isPending && <Spinner className="size-4" />}
{titleMutation.isSuccess && <Check className="size-4 text-green-500" />}
```

### Inline Save Indicator Component

Create a reusable component for field save status:

```tsx
// src/renderer/components/ui/save-indicator.tsx
type SaveIndicatorProps = {
  isPending: boolean;
  isSuccess: boolean;
  className?: string;
};

export function SaveIndicator({ isPending, isSuccess, className }: SaveIndicatorProps) {
  if (isPending) {
    return <Loader2 className={cn("size-4 animate-spin text-gray-400", className)} />;
  }
  if (isSuccess) {
    return <Check className={cn("size-4 text-green-500 animate-in fade-in", className)} />;
  }
  return null;
}
```

### User Search IPC Channel

Add new IPC handler for user search:

```typescript
// src/shared/types.ts
export type UserSearchResult = {
  id: string;
  displayName: string;
  uniqueName: string; // email
  imageUrl?: string;
};

// src/main/ado-client.ts
async searchUsers(query: string): Promise<UserSearchResult[]> {
  // Use Azure DevOps Graph API or identities endpoint
  // GET https://vssps.dev.azure.com/{org}/_apis/identities?searchFilter=General&filterValue={query}
}

// src/main/ipc.ts
ipcMain.handle("ado:users:search", async (_, query: string) => {
  return adoClient.searchUsers(query);
});

// src/preload/index.ts
users: {
  search: (query: string) => ipcRenderer.invoke("ado:users:search", query),
}
```

### Tiptap Setup

Install required packages:
```bash
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

Editor configuration:

```tsx
// src/renderer/components/work-item-detail/DescriptionEditor.tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
  }),
  Link.configure({
    openOnClick: false,
  }),
];

export function DescriptionEditor({
  initialHtml,
  onSave
}: {
  initialHtml: string;
  onSave: (html: string) => void;
}) {
  const editor = useEditor({
    extensions,
    content: initialHtml, // Tiptap accepts HTML directly
  });

  const handleSave = () => {
    if (editor) {
      onSave(editor.getHTML());
    }
  };

  return (
    <div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="prose prose-sm" />
      <Button onClick={handleSave}>Save Description</Button>
    </div>
  );
}
```

### HTML Conversion Notes

Tiptap natively accepts and outputs HTML, so conversion is straightforward:
- **Load**: Pass Azure DevOps `descriptionHtml` directly to Tiptap's `content` prop
- **Save**: Call `editor.getHTML()` to get HTML for the API

Azure DevOps HTML is standard HTML with some inline styles. Tiptap handles this well. If needed, sanitize with DOMPurify before rendering.

### Files to Modify

**New Files:**
- `src/renderer/components/ui/save-indicator.tsx` - Reusable save status indicator
- `src/renderer/components/work-item-detail/DescriptionEditor.tsx` - Tiptap editor
- `src/renderer/components/work-item-detail/EditorToolbar.tsx` - Tiptap toolbar
- `src/renderer/components/work-item-detail/AssigneeCombobox.tsx` - User search combobox

**Existing Files to Modify:**
- `src/shared/types.ts` - Add UserSearchResult type
- `src/main/ado-client.ts` - Add searchUsers method
- `src/main/ipc.ts` - Add ado:users:search handler
- `src/preload/index.ts` - Add users.search API
- `src/renderer/routes/work-item-detail.tsx` - Refactor to use auto-save pattern
- `src/renderer/components/work-item-detail/DetailHeader.tsx` - Remove save button, fix badge
- `src/renderer/components/work-item-detail/DetailsGrid.tsx` - Add auto-save to fields, fix border
- `src/renderer/components/work-item-detail/DescriptionSection.tsx` - Replace with Tiptap editor

### Header Badge Fix

Current (incorrect):
```tsx
<TypeIcon /> <Badge>{type}</Badge>
```

Fixed:
```tsx
<Badge>
  <TypeIcon className="size-3.5 mr-1" />
  {type}
</Badge>
```

### Back Button Fix

Current:
```tsx
<Link to="/work-items" className="...custom styles...">
  <ArrowLeft />
</Link>
```

Fixed:
```tsx
<Button variant="subtle" size="sm" asChild>
  <Link to="/work-items">
    <ArrowLeft className="size-4" />
    Back
  </Link>
</Button>
```

### Skeleton Alignment Fix

Review current skeleton in loading state and ensure dimensions/positioning match:
- Title skeleton should match BareInput height and position
- Details grid skeleton rows should match actual row heights
- Description skeleton should match editor container size

## Dependencies

```bash
bun add @tiptap/react @tiptap/starter-kit @tiptap/extension-link
```

## Out of Scope

- Editing other work item fields (tags, area path, parent)
- Image upload in description editor
- Markdown syntax support (using HTML/rich text only)
- Offline support or optimistic updates beyond current implementation
- Mentions (@user) in description
- Work item comments/discussion
