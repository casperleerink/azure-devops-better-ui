import type { Iteration } from "@shared/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

interface IterationComboboxProps {
  iterations: Iteration[] | undefined;
}

export function IterationCombobox({ iterations }: IterationComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedIteration = useWorkItemFiltersStore((state) => state.selectedIteration);
  const setSelectedIteration = useWorkItemFiltersStore((state) => state.setSelectedIteration);

  const handleSelect = (iteration: Iteration | null) => {
    setSelectedIteration(iteration);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-40 justify-between border border-alpha/5 rounded-lg px-2 font-normal hover:bg-gray-100/70 focus-visible:border-blue-500 transition-colors"
        >
          <span className="truncate">{selectedIteration?.name ?? "All Sprints"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search sprints..." />
          <CommandList>
            <CommandEmpty>No sprints found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => handleSelect(null)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedIteration === null ? "opacity-100" : "opacity-0",
                  )}
                />
                All Sprints
              </CommandItem>
              {iterations?.map((iteration) => (
                <CommandItem key={iteration.id} onSelect={() => handleSelect(iteration)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedIteration?.id === iteration.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {iteration.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
