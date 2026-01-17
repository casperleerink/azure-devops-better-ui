import type { WorkItemType, WorkItemTypeState } from "@shared/types";
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FilterBar, WorkItemRow, WorkItemRowSkeleton } from "@/components/work-items";
import { workItemTypes } from "@/lib/work-item-utils";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

export function WorkItemsPage() {
  const queryClient = useQueryClient();
  const [assignedOpen, setAssignedOpen] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filters = useWorkItemFiltersStore((state) => state.filters);
  const selectedUser = useWorkItemFiltersStore((state) => state.selectedUser);

  const { data: iterations } = useQuery({
    queryKey: ["iterations"],
    queryFn: () => window.ado.iterations.list(),
    staleTime: 1000 * 60 * 5,
  });

  const { data: projectUsers } = useQuery({
    queryKey: ["projectUsers"],
    queryFn: () => window.ado.identities.listProjectUsers(),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: workItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workItems", filters],
    queryFn: () => window.ado.workItems.list(filters),
    placeholderData: keepPreviousData,
  });

  const statesQueries = useQueries({
    queries: workItemTypes.map((type) => ({
      queryKey: ["workItemTypeStates", type],
      queryFn: () => window.ado.workItems.getTypeStates(type),
      staleTime: 1000 * 60 * 60,
    })),
  });

  const statesByType: Record<WorkItemType, WorkItemTypeState[]> = workItemTypes.reduce(
    (acc, type, index) => {
      acc[type] = statesQueries[index]?.data ?? [];
      return acc;
    },
    {} as Record<WorkItemType, WorkItemTypeState[]>,
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, state }: { id: number; state: string }) =>
      window.ado.workItems.update(id, { state }),
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      queryClient.invalidateQueries({ queryKey: ["workItem", id] });
    },
    onSettled: () => setUpdatingId(null),
  });

  const handleStatusChange = (id: number, state: string) => {
    updateStatusMutation.mutate({ id, state });
  };

  const sectionTitle =
    selectedUser === "me"
      ? "Assigned to Me"
      : selectedUser === null
        ? "All Work Items"
        : `Assigned to ${selectedUser.displayName}`;

  return (
    <div className="h-full bg-gray-50">
      <FilterBar users={projectUsers} iterations={iterations} />

      <div className="p-6">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <p className="text-red-500 font-medium">Error loading work items</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : "Failed to load work items"}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-alpha/5 bg-gray-50 overflow-hidden">
            <Collapsible open={assignedOpen} onOpenChange={setAssignedOpen}>
              <CollapsibleTrigger asChild>
                <button className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-alpha/2 transition-colors">
                  {assignedOpen ? (
                    <ChevronDown className="size-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="size-4 text-gray-500" />
                  )}
                  <span className="font-semibold text-gray-950">{sectionTitle}</span>
                  {!isLoading && (
                    <Badge variant="primary-subtle" size="xs" text={workItems?.length ?? 0} />
                  )}
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {isLoading ? (
                  <div>
                    {[...Array(6)].map((_, i) => (
                      <WorkItemRowSkeleton key={i} />
                    ))}
                  </div>
                ) : workItems && workItems.length > 0 ? (
                  <div>
                    {workItems.map((item) => (
                      <WorkItemRow
                        key={item.id}
                        item={item}
                        onStatusChange={handleStatusChange}
                        isUpdating={updatingId === item.id}
                        states={statesByType[item.type] ?? []}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No work items found</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Try adjusting your filters or create a new work item
                    </p>
                    <Button asChild variant="subtle" size="sm" className="mt-4">
                      <Link to="/create">Create Work Item</Link>
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
}
