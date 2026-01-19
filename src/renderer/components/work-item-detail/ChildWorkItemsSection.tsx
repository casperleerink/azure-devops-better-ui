import type { WorkItemType } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateWorkItemDialog } from "@/components/work-items/CreateWorkItemDialog";
import { AssigneeCell, StateCell } from "@/components/work-items/table-cells";
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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: children = [], isLoading } = useQuery({
    queryKey: ["workItems", "children", parentId],
    queryFn: () => window.ado.workItems.listChildren(parentId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    enabled: childType !== null, // Only fetch if there's a valid child type
  });

  // Don't render section for Tasks (they have no children)
  if (!childType) return null;

  const pluralType = `${childType}s`; // Simple pluralization

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="rounded-xl border border-alpha/5 bg-gray-100">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border-b border-alpha/5 last:border-b-0"
            >
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
        {children.length > 0 && (
          <Button variant="outline" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create {childType}
          </Button>
        )}
      </div>

      {children.length === 0 ? (
        <div className="rounded-xl border border-alpha/5 bg-gray-100 p-8 text-center">
          <p className="text-gray-500 mb-4">No {pluralType.toLowerCase()} yet</p>
          <Button variant="primary" size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Create {childType}
          </Button>
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
                  className="border-b border-alpha/5 last:border-b-0 hover:bg-alpha/5 transition-colors"
                >
                  <td className="p-4 text-sm text-gray-600">{child.id}</td>
                  <td className="p-4">
                    <Link
                      to="/work-items/$id"
                      params={{ id: child.id.toString() }}
                      className="flex items-center gap-2 hover:text-blue-500 transition-colors"
                    >
                      <span className="shrink-0 [&>svg]:size-4 text-gray-400">
                        {getTypeIcon(child.type)}
                      </span>
                      <span className="text-sm font-medium text-alpha truncate">{child.title}</span>
                    </Link>
                  </td>
                  <td className="p-4">
                    <StateCell state={child.state} />
                  </td>
                  <td className="p-4">
                    <AssigneeCell assignee={child.assignedTo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateWorkItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        defaultValues={{
          type: childType,
          parentId: parentId,
        }}
      />
    </div>
  );
}
