import { Button } from "@/components/ui/button";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

export function TypeFilterButtons() {
  const selectedTypes = useWorkItemFiltersStore((state) => state.filters.types);
  const toggleType = useWorkItemFiltersStore((state) => state.toggleType);

  return (
    <div className="flex items-center gap-2">
      {workItemTypes.map((type) => (
        <Button
          key={type}
          variant={selectedTypes.includes(type) ? "subtle" : "ghost"}
          size="sm"
          onClick={() => toggleType(type)}
          className="gap-1.5"
        >
          {getTypeIcon(type)}
          <span>{type}</span>
        </Button>
      ))}
    </div>
  );
}
