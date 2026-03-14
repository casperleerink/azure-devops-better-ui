import type { WorkItemType, WorkItemTypeState } from "@shared/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

interface StateFilterButtonsProps {
  statesByType: Record<WorkItemType, WorkItemTypeState[]>;
}

export function StateFilterButtons({ statesByType }: StateFilterButtonsProps) {
  const [open, setOpen] = useState(false);
  const selectedStates = useWorkItemFiltersStore((state) => state.filters.states);
  const selectedTypes = useWorkItemFiltersStore((state) => state.filters.types);
  const toggleState = useWorkItemFiltersStore((state) => state.toggleState);
  const setStates = useWorkItemFiltersStore((state) => state.setStates);

  // Compute union of states across selected types, deduped by name
  const availableStates = useMemo(() => {
    const stateMap = new Map<string, WorkItemTypeState>();
    for (const type of selectedTypes) {
      for (const state of statesByType[type] ?? []) {
        if (!stateMap.has(state.name)) {
          stateMap.set(state.name, state);
        }
      }
    }
    return Array.from(stateMap.values());
  }, [selectedTypes, statesByType]);

  // Auto-remove invalid states when available states change
  useEffect(() => {
    if (!selectedStates || selectedStates.length === 0) return;
    const validNames = new Set(availableStates.map((s) => s.name));
    const filtered = selectedStates.filter((s) => validNames.has(s));
    if (filtered.length !== selectedStates.length) {
      setStates(filtered);
    }
  }, [availableStates, selectedStates, setStates]);

  const getLabel = () => {
    if (!selectedStates || selectedStates.length === 0) return "All states";
    if (selectedStates.length === availableStates.length) return "All states";
    if (selectedStates.length === 1) return selectedStates[0];
    return `${selectedStates.length} states`;
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
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {availableStates.map((state) => (
                <CommandItem
                  key={state.name}
                  onSelect={() => toggleState(state.name)}
                  className="cursor-pointer justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: `#${state.color}` }}
                    />
                    <span>{state.name}</span>
                  </span>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedStates?.includes(state.name) ? "opacity-100" : "opacity-0",
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
