import type { WorkItemUpdatePatch } from "@shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, FileX } from "lucide-react";
import { useEffect, useState } from "react";
import { BareInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DescriptionSection, DetailHeader, DetailsGrid } from "@/components/work-item-detail";

export function WorkItemDetailPage() {
  const { id } = useParams({ from: "/work-items/$id" });
  const queryClient = useQueryClient();
  const workItemId = parseInt(id, 10);

  const {
    data: workItem,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workItem", workItemId],
    queryFn: () => window.ado.workItems.get(workItemId),
  });

  const { data: states = [] } = useQuery({
    queryKey: ["workItemTypeStates", workItem?.type],
    queryFn: () => window.ado.workItems.getTypeStates(workItem!.type),
    enabled: !!workItem?.type,
    staleTime: 1000 * 60 * 60,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);

  useEffect(() => {
    if (workItem) {
      setTitle(workItem.title);
      setDescription(workItem.descriptionHtml || "");
      setState(workItem.state);
    }
  }, [workItem]);

  const updateMutation = useMutation({
    mutationFn: (patch: WorkItemUpdatePatch) => window.ado.workItems.update(workItemId, patch),
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

  const hasChanges =
    workItem &&
    (title !== workItem.title ||
      description !== (workItem.descriptionHtml || "") ||
      state !== workItem.state);

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50">
        <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-6">
          <div className="max-w-4xl">
            <Skeleton className="h-8 w-3/4 mb-6" />
            <Skeleton className="h-32 w-full mb-6" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-gray-50">
        <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4">
          <Link
            to="/work-items"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-alpha transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Work Items
          </Link>
        </div>
        <div className="p-8">
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-600 font-medium">Error loading work item</p>
                <p className="text-sm text-gray-600 mt-1">
                  {error instanceof Error ? error.message : "Failed to load work item"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!workItem) {
    return (
      <div className="h-full bg-gray-50">
        <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4">
          <Link
            to="/work-items"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-alpha transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Work Items
          </Link>
        </div>
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-alpha/5">
            <FileX className="size-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Work item not found</p>
          <p className="mt-1 text-sm text-gray-400">
            This work item may have been deleted or you don't have access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      <DetailHeader
        workItemId={workItem.id}
        type={workItem.type}
        hasChanges={!!hasChanges}
        isSaving={updateMutation.isPending}
        saveSuccess={updateMutation.isSuccess}
        saveError={updateMutation.isError ? (updateMutation.error as Error) : null}
        onSave={handleSave}
      />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <BareInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-3xl font-semibold text-alpha w-full"
              placeholder="Enter title..."
            />
          </div>

          <DetailsGrid workItem={workItem} state={state} states={states} onStateChange={setState} />

          <DescriptionSection
            description={description}
            isEditing={isEditingDescription}
            onDescriptionChange={setDescription}
            onToggleEdit={() => setIsEditingDescription(!isEditingDescription)}
          />
        </div>
      </div>
    </div>
  );
}
