# Child Work Items Display

status: pending

## Description

Add a child work items section to the work item detail page that displays hierarchical relationships. Features show their User Stories, User Stories show their Tasks, and Epics show their Features. The section includes a table view with navigation and a quick create button for adding child work items.

## Acceptance Criteria

### Child Work Items Section
- [ ] Display section below the description editor on the work item detail page
- [ ] Section header shows work item type and count (e.g., "User Stories (3)")
- [ ] Table displays: ID, Title, State badge, and Assignee (matching main list styling)
- [ ] Click any row to navigate to that child work item's detail page
- [ ] Section is hidden entirely for Task work items (they have no children)
- [ ] Automatic fetch when work item detail loads, with skeleton loading state

### Type Hierarchy Detection
- [ ] Epic work items display child Features
- [ ] Feature work items display child User Stories
- [ ] User Story work items display child Tasks
- [ ] Task work items hide the section (leaf nodes in hierarchy)

### Empty State
- [ ] Show section with empty state message when no children exist
- [ ] Message reads: "No [type]s yet" (e.g., "No user stories yet")
- [ ] Display "Create [Type]" button in empty state

### Quick Create Button
- [ ] "Create [Type]" button appears in section header (when children exist) or empty state
- [ ] Opens existing CreateWorkItemDialog with default values pre-filled
- [ ] Pre-fills parent field with current work item
- [ ] Pre-fills type field with correct child type
- [ ] After successful creation, invalidates children query to show new item

### Backend Implementation
- [ ] Add new IPC channel `ado:workItems:listChildren(parentId: number)`
- [ ] Add ADO client method to query children using WIQL parent relationship
- [ ] Return WorkItemSummary[] (same as main list endpoint)

## Technical Notes

### Child Type Mapping

```typescript
function getChildType(parentType: WorkItemType): WorkItemType | null {
  switch (parentType) {
    case "Epic":
      return "Feature";
    case "Feature":
      return "User Story";
    case "User Story":
      return "Task";
    case "Task":
      return null; // Tasks have no children
  }
}
```

### Backend Implementation

**Add to src/shared/types.ts:**

```typescript
// Add to IpcChannels interface
export type IpcChannels = {
  // ... existing channels
  "ado:workItems:listChildren": (parentId: number) => Promise<WorkItemSummary[]>;
};
```

**Add to src/main/ado-client.ts:**

```typescript
async listChildren(parentId: number): Promise<WorkItemSummary[]> {
  const config = getConfig();
  if (!config) throw new Error("Config not found");

  // Query for work items where Parent = parentId
  const wiql = {
    query: `
      SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State],
             [System.AssignedTo], [System.AreaPath], [System.IterationPath], [System.ChangedDate]
      FROM WorkItems
      WHERE [System.Parent] = ${parentId}
      ORDER BY [System.Id] ASC
    `
  };

  const response = await fetch(
    `${config.organizationUrl}/${config.projectName}/_apis/wit/wiql?api-version=7.0`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify(wiql),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }
  );

  if (!response.ok) {
    throw new Error(`Azure DevOps API error: ${response.status} ${response.statusText}`);
  }

  const result = AdoWiqlResultSchema.parse(await response.json());

  if (result.workItems.length === 0) {
    return [];
  }

  // Batch fetch full work item details
  return this.fetchWorkItemsBatch(result.workItems.map(wi => wi.id));
}
```

**Add to src/main/ipc.ts:**

```typescript
ipcMain.handle("ado:workItems:listChildren", async (_, parentId: number) => {
  try {
    return await adoClient.listChildren(parentId);
  } catch (error) {
    console.error("Error listing children:", error);
    throw error;
  }
});
```

**Add to src/preload/index.ts:**

```typescript
const adoApi = {
  workItems: {
    // ... existing methods
    listChildren: (parentId: number) =>
      ipcRenderer.invoke("ado:workItems:listChildren", parentId),
  }
};
```

### Frontend Implementation

**Create new component: src/renderer/components/work-item-detail/ChildWorkItemsSection.tsx**

```tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { WorkItemType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateWorkItemDialog } from "@/components/work-items/CreateWorkItemDialog";
import { StateCell, AssigneeCell } from "@/components/work-items/table-cells";
import { getTypeIcon } from "@/lib/work-item-utils";

function getChildType(parentType: WorkItemType): WorkItemType | null {
  switch (parentType) {
    case "Epic":
      return "Feature";
    case "Feature":
      return "User Story";
    case "User Story":
      return "Task";
    case "Task":
      return null;
  }
}

interface ChildWorkItemsSectionProps {
  parentId: number;
  parentType: WorkItemType;
}

export function ChildWorkItemsSection({ parentId, parentType }: ChildWorkItemsSectionProps) {
  const childType = getChildType(parentType);

  // Don't render section for Tasks (they have no children)
  if (!childType) return null;

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["workItems", "children", parentId],
    queryFn: () => window.ado.workItems.listChildren(parentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const pluralType = childType + "s"; // Simple pluralization
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-xl border border-alpha/5 bg-gray-100">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-alpha/5 last:border-b-0">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-alpha">
          {pluralType} ({children.length})
        </h2>
        <CreateWorkItemDialog
          trigger={
            <Button variant="outline" size="sm">
              <Plus className="size-4" />
              Create {childType}
            </Button>
          }
          defaultValues={{
            type: childType,
            parentId: parentId,
          }}
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border border-alpha/5 bg-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-4">No {pluralType.toLowerCase()} yet</p>
          <CreateWorkItemDialog
            trigger={
              <Button variant="primary" size="sm">
                <Plus className="size-4" />
                Create {childType}
              </Button>
            }
            defaultValues={{
              type: childType,
              parentId: parentId,
            }}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-alpha/5 bg-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-alpha/5">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-20">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4 w-32">State</th>
                <th className="p-4 w-40">Assignee</th>
              </tr>
            </thead>
            <tbody>
              {children.map((child) => (
                <tr
                  key={child.id}
                  className="border-b border-alpha/5 last:border-b-0 hover:bg-alpha/5 transition-colors cursor-pointer"
                >
                  <Link
                    to="/work-items/$id"
                    params={{ id: child.id.toString() }}
                    className="contents"
                  >
                    <td className="p-4 text-sm text-gray-600">{child.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="shrink-0 [&>svg]:size-4 text-gray-400">
                          {getTypeIcon(child.type)}
                        </span>
                        <span className="text-sm font-medium text-alpha truncate">
                          {child.title}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StateCell state={child.state} />
                    </td>
                    <td className="p-4">
                      <AssigneeCell assignee={child.assignedTo} />
                    </td>
                  </Link>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

### Update CreateWorkItemDialog

**Modify src/renderer/components/work-items/CreateWorkItemDialog.tsx:**

Add optional props for default values:

```typescript
interface CreateWorkItemDialogProps {
  trigger: React.ReactNode;
  defaultValues?: {
    type?: WorkItemType;
    parentId?: number;
  };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateWorkItemDialog({
  trigger,
  defaultValues,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateWorkItemDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  // ... existing code

  // Update form defaultValues
  const form = useForm({
    defaultValues: {
      type: defaultValues?.type ?? ("Task" as WorkItemType),
      title: "",
      description: "",
      iteration: null as Iteration | null,
      parent: null as WorkItemSummary | null,
      areaPath: null as AreaPath | null,
      assignedTo: currentUser as Identity | null,
    },
    // ... rest of form config
  });

  // Fetch parent work item if defaultValues.parentId is provided
  const { data: parentWorkItem } = useQuery({
    queryKey: ["workItem", defaultValues?.parentId],
    queryFn: () => window.ado.workItems.get(defaultValues!.parentId!),
    enabled: !!defaultValues?.parentId,
  });

  // Set parent field when parentWorkItem loads
  useEffect(() => {
    if (open && parentWorkItem) {
      form.setFieldValue("parent", parentWorkItem);
    }
  }, [open, parentWorkItem, form]);

  // ... rest of component
}
```

### Integration into Work Item Detail Page

**Modify src/renderer/routes/work-item-detail.tsx:**

Add the ChildWorkItemsSection component after the description editor:

```tsx
import { ChildWorkItemsSection } from "@/components/work-item-detail/ChildWorkItemsSection";

// ... in the render
<div className="mt-8">
  <DescriptionEditor
    initialHtml={workItem.descriptionHtml || ""}
    onSave={(html) => descriptionMutation.mutate(html)}
    isPending={descriptionMutation.isPending}
    isSuccess={descriptionMutation.isSuccess}
  />
</div>

<ChildWorkItemsSection
  parentId={workItem.id}
  parentType={workItem.type}
/>
```

### Reusable Table Cells

If StateCell and AssigneeCell don't already exist as reusable components, extract them from the main work items table:

**Create src/renderer/components/work-items/table-cells.tsx:**

```tsx
import { Badge } from "@/components/ui/badge";

export function StateCell({ state }: { state: string }) {
  return (
    <Badge variant="secondary" className="font-normal">
      {state}
    </Badge>
  );
}

export function AssigneeCell({ assignee }: { assignee?: { displayName: string } }) {
  return (
    <span className="text-sm text-gray-600">
      {assignee?.displayName ?? "Unassigned"}
    </span>
  );
}
```

## Files to Modify

**New Files:**
- `src/renderer/components/work-item-detail/ChildWorkItemsSection.tsx` - Main child work items section component
- `src/renderer/components/work-items/table-cells.tsx` - Reusable table cell components (if not already extracted)

**Existing Files:**
- `src/shared/types.ts` - Add listChildren IPC channel
- `src/main/ado-client.ts` - Add listChildren method using WIQL query
- `src/main/ipc.ts` - Add ado:workItems:listChildren handler
- `src/preload/index.ts` - Add workItems.listChildren API method
- `src/renderer/routes/work-item-detail.tsx` - Import and render ChildWorkItemsSection
- `src/renderer/components/work-items/CreateWorkItemDialog.tsx` - Add defaultValues props and controlled state

## Out of Scope

- Editing child work items inline (still requires navigation)
- Drag-and-drop reordering of children
- Bulk operations on children (multi-select, bulk state change)
- Showing grand-children or deeper hierarchy levels
- Filtering or sorting children (shows all, ordered by ID)
- Showing parent work item in the details (inverse relationship)
- Pagination for large numbers of children
- Real-time updates when children change elsewhere
