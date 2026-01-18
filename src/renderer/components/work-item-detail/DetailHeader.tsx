import type { WorkItemType } from "@shared/types";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getTypeBadgeVariant, getTypeIcon } from "@/lib/work-item-utils";

interface DetailHeaderProps {
  workItemId: number;
  type: WorkItemType;
}

export function DetailHeader({ workItemId, type }: DetailHeaderProps) {
  return (
    <div className="border-b border-alpha/5 bg-gray-50 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button asChild variant="subtle" size="sm">
          <Link to="/work-items" className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <Badge
            variant={getTypeBadgeVariant(type)}
            size="sm"
            icon={getTypeIcon(type)}
            text={type}
          />
          <span className="text-gray-600 text-sm">#{workItemId}</span>
        </div>
      </div>
    </div>
  );
}
