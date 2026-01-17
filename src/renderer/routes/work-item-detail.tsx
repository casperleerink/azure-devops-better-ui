import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import type { WorkItemUpdatePatch } from "../../shared/types";

export function WorkItemDetailPage() {
  const { id } = useParams({ from: "/work-items/$id" });
  const queryClient = useQueryClient();
  const workItemId = parseInt(id, 10);

  const { data: workItem, isLoading, error } = useQuery({
    queryKey: ["workItem", workItemId],
    queryFn: () => window.ado.workItems.get(workItemId),
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    if (workItem) {
      setTitle(workItem.title);
      setDescription(workItem.descriptionHtml || "");
      setState(workItem.state);
    }
  }, [workItem]);

  const updateMutation = useMutation({
    mutationFn: (patch: WorkItemUpdatePatch) =>
      window.ado.workItems.update(workItemId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItem", workItemId] });
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
    },
  });

  const handleSave = () => {
    const patch: WorkItemUpdatePatch = {};
    if (title !== workItem?.title) patch.title = title;
    if (description !== workItem?.descriptionHtml) patch.description = description;
    if (state !== workItem?.state) patch.state = state;

    if (Object.keys(patch).length > 0) {
      updateMutation.mutate(patch);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-muted-foreground">Loading work item...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded border border-destructive bg-destructive/10 p-4 text-destructive">
          {error instanceof Error ? error.message : "Failed to load work item"}
        </div>
      </div>
    );
  }

  if (!workItem) {
    return (
      <div className="p-6 text-muted-foreground">Work item not found</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/work-items" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Work Items
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="rounded bg-muted px-2 py-1 text-sm font-medium">
          {workItem.type}
        </span>
        <span className="text-muted-foreground">#{workItem.id}</span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-input bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">State</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full max-w-xs rounded border border-input bg-background px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full rounded border border-input bg-background px-3 py-2"
          />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Assigned To: </span>
            <span>{workItem.assignedTo?.displayName || "Unassigned"}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Area: </span>
            <span>{workItem.areaPath || "-"}</span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Iteration: </span>
            <span>{workItem.iterationPath || "-"}</span>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
          {updateMutation.isError && (
            <span className="ml-4 text-sm text-destructive">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Failed to save"}
            </span>
          )}
          {updateMutation.isSuccess && (
            <span className="ml-4 text-sm text-green-600">Saved!</span>
          )}
        </div>
      </div>
    </div>
  );
}
