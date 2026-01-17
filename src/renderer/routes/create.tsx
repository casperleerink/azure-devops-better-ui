import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import type { WorkItemType, WorkItemCreatePayload } from "../../shared/types";

const workItemTypes: WorkItemType[] = ["Epic", "Feature", "User Story", "Task"];

export function CreateWorkItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [type, setType] = useState<WorkItemType>("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: (payload: WorkItemCreatePayload) =>
      window.ado.workItems.create(payload),
    onSuccess: (workItem) => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      navigate({ to: "/work-items/$id", params: { id: String(workItem.id) } });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold">Create Work Item</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as WorkItemType)}
            className="w-full max-w-xs rounded border border-input bg-background px-3 py-2"
          >
            {workItemTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
            className="w-full rounded border border-input bg-background px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description..."
            rows={6}
            className="w-full rounded border border-input bg-background px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={createMutation.isPending || !title.trim()}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating..." : "Create Work Item"}
          </button>
          {createMutation.isError && (
            <span className="ml-4 text-sm text-destructive">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Failed to create"}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
