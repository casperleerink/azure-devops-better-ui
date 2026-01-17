import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

export function TypeFilterButtons() {
  const [open, setOpen] = useState(false);
  const selectedTypes = useWorkItemFiltersStore((state) => state.filters.types);
  const toggleType = useWorkItemFiltersStore((state) => state.toggleType);

  const getLabel = () => {
    if (selectedTypes.length === 0) return "No types";
    if (selectedTypes.length === workItemTypes.length) return "All types";
    if (selectedTypes.length === 1) return selectedTypes[0];
    return `${selectedTypes.length} types`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-36 justify-between border border-alpha/10 rounded-lg px-2 font-normal"
        >
          <span className="truncate">{getLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {workItemTypes.map((type) => (
                <CommandItem
                  key={type}
                  onSelect={() => toggleType(type)}
                  className="cursor-pointer justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="size-3.5 [&>svg]:size-3.5">{getTypeIcon(type)}</span>
                    <span>{type}</span>
                  </span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedTypes.includes(type) ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
