import type { WorkItemCreatePayload, WorkItemType } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BareInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BareTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";

export function CreateWorkItemPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [type, setType] = useState<WorkItemType>("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: (payload: WorkItemCreatePayload) => window.ado.workItems.create(payload),
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
    <div className="h-full bg-gray-50">
      <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/work-items"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-950 transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg font-semibold text-gray-950">New Work Item</h1>
          </div>
          <div className="flex items-center gap-2">
            {createMutation.isError && (
              <span className="text-sm text-red-500">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create"}
              </span>
            )}
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title.trim()}
              variant="primary"
            >
              {createMutation.isPending ? "Creating..." : "Create Work Item"}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="mb-6">
            <Label className="mb-3 block">Work Item Type</Label>
            <div className="flex items-center gap-2">
              {workItemTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
                    type === t
                      ? "border-blue-500 bg-blue-50"
                      : "border-alpha/10 bg-gray-50 hover:bg-alpha/5",
                  )}
                >
                  {getTypeIcon(t)}
                  <span className="text-sm font-medium text-gray-950">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-alpha/5 bg-gray-50 p-4 mb-6">
            <Label className="mb-2 block">Title</Label>
            <BareInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your work item..."
              className="text-lg font-medium"
              required
            />
          </div>

          <div className="rounded-xl border border-alpha/5 bg-gray-50 p-4">
            <Label className="mb-2 block">Description (optional)</Label>
            <BareTextarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="text-sm min-h-[160px]"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
