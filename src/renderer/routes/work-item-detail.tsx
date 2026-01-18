import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, FileX } from "lucide-react";
import { useEffect, useState } from "react";
import { BareInput } from "@/components/ui/input";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { DetailHeader, DetailsGrid } from "@/components/work-item-detail";
import { DescriptionEditor } from "@/components/work-item-detail/DescriptionEditor";
import { useFieldMutation } from "@/hooks/useFieldMutation";

export function WorkItemDetailPage() {
  const { id } = useParams({ from: "/work-items/$id" });
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

  // Auto-save mutation for title field
  const titleMutation = useFieldMutation(workItemId, "title");

  // Auto-save mutation for description field
  const descriptionMutation = useFieldMutation(workItemId, "description");

  useEffect(() => {
    if (workItem) {
      setTitle(workItem.title);
    }
  }, [workItem]);

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
        hasChanges={false}
        isSaving={false}
        saveSuccess={false}
        saveError={null}
        onSave={() => {}}
      />

      <div className="p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <BareInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => {
                  if (title !== workItem.title) {
                    titleMutation.mutate(title);
                  }
                }}
                disabled={titleMutation.isPending}
                className="text-3xl font-semibold text-alpha w-full"
                placeholder="Enter title..."
              />
              <SaveIndicator
                isPending={titleMutation.isPending}
                isSuccess={titleMutation.isSuccess}
              />
            </div>
          </div>

          <DetailsGrid workItem={workItem} states={states} />

          <div className="mt-8">
            <DescriptionEditor
              initialHtml={workItem.descriptionHtml || ""}
              onSave={(html) => descriptionMutation.mutate(html)}
              isPending={descriptionMutation.isPending}
              isSuccess={descriptionMutation.isSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
