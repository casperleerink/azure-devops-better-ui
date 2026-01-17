import type { WorkItemType } from "@shared/types";
import { Button } from "@/components/ui/button";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";

interface TypeFilterButtonsProps {
  selectedTypes: WorkItemType[];
  onToggle: (type: WorkItemType) => void;
}

export function TypeFilterButtons({ selectedTypes, onToggle }: TypeFilterButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {workItemTypes.map((type) => (
        <Button
          key={type}
          variant={selectedTypes.includes(type) ? "subtle" : "ghost"}
          size="sm"
          onClick={() => onToggle(type)}
          className="gap-1.5"
        >
          {getTypeIcon(type)}
          <span>{type}</span>
        </Button>
      ))}
    </div>
  );
}
