import type { WorkItemUpdatePatch } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type FieldName = keyof WorkItemUpdatePatch;

/**
 * Hook for auto-saving individual work item fields.
 * Returns a mutation that saves a single field value.
 *
 * @param workItemId - The ID of the work item to update
 * @param fieldName - The field name to update (must be a valid WorkItemUpdatePatch key)
 *
 * @example
 * const titleMutation = useFieldMutation(workItem.id, "title");
 *
 * <BareInput
 *   value={localTitle}
 *   onChange={(e) => setLocalTitle(e.target.value)}
 *   onBlur={() => {
 *     if (localTitle !== workItem.title) {
 *       titleMutation.mutate(localTitle);
 *     }
 *   }}
 *   disabled={titleMutation.isPending}
 * />
 * <SaveIndicator isPending={titleMutation.isPending} isSuccess={titleMutation.isSuccess} />
 */
export function useFieldMutation(workItemId: number, fieldName: FieldName) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (value: string) => window.ado.workItems.update(workItemId, { [fieldName]: value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItem", workItemId] });
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
    },
  });
}
