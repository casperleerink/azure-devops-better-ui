import type { WorkItemType } from "@shared/types";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTypeBadgeVariant, getTypeIcon } from "@/lib/work-item-utils";

interface DetailHeaderProps {
  workItemId: number;
  type: WorkItemType;
  hasChanges: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: Error | null;
  onSave: () => void;
}

export function DetailHeader({
  workItemId,
  type,
  hasChanges,
  isSaving,
  saveSuccess,
  saveError,
  onSave,
}: DetailHeaderProps) {
  return (
    <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/work-items"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-alpha transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            {getTypeIcon(type)}
            <Badge variant={getTypeBadgeVariant(type)} size="sm" text={type} />
            <span className="text-gray-600 text-sm">#{workItemId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-sm text-green-500">
              <Check className="size-4" />
              Saved
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-500">{saveError.message || "Failed to save"}</span>
          )}
          <Button
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            variant={hasChanges ? "primary" : "subtle"}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
