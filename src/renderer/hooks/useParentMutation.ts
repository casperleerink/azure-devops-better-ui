import type { WorkItemSummary } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Hook for updating a work item's parent relationship.
 * Returns a mutation that adds, changes, or removes the parent.
 *
 * @param workItemId - The ID of the work item to update
 *
 * @example
 * const parentMutation = useParentMutation(workItem.id);
 *
 * // Add or change parent
 * parentMutation.mutate(parentWorkItem);
 *
 * // Remove parent
 * parentMutation.mutate(null);
 */
export function useParentMutation(workItemId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (parent: WorkItemSummary | null) =>
      window.ado.workItems.updateParent(workItemId, parent?.id ?? null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItem", workItemId] });
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      queryClient.invalidateQueries({ queryKey: ["workItems", "children"] });
    },
    onError: (error) => {
      toast.error("Failed to update parent", {
        description: error.message,
      });
    },
  });
}
