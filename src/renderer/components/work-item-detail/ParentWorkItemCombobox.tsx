import type { WorkItemSummary, WorkItemType } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Minus, X } from "lucide-react";
import { useMemo, useState } from "react";
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
import { getTypeIcon } from "@/lib/work-item-utils";

/** Get the parent work item type for a given type */
function getParentType(type: WorkItemType): WorkItemType | null {
  switch (type) {
    case "Task":
      return "User Story";
    case "User Story":
      return "Feature";
    case "Feature":
      return "Epic";
    case "Epic":
      return null;
  }
}

/** States to exclude when filtering potential parent work items */
const EXCLUDED_STATES = ["Closed", "Done", "Removed", "Resolved"];

interface ParentWorkItemComboboxProps {
  workItemId: number;
  workItemType: WorkItemType;
  value: { id: number; title: string } | undefined;
  childIds: number[];
  onChange: (parent: WorkItemSummary | null) => void;
  disabled?: boolean;
}

export function ParentWorkItemCombobox({
  workItemId,
  workItemType,
  value,
  childIds,
  onChange,
  disabled,
}: ParentWorkItemComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const parentType = getParentType(workItemType);

  // Fetch config for default area path
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => window.ado.config.get(),
  });

  // Fetch potential parent work items (filtered by type and area path)
  const { data: potentialParents = [], isLoading } = useQuery({
    queryKey: ["workItems", "parents", parentType, config?.defaultAreaPath],
    queryFn: () =>
      window.ado.workItems.list({
        types: parentType ? [parentType] : [],
        sort: "changedDesc",
        areaPath: config?.defaultAreaPath,
      }),
    enabled: !!parentType,
    staleTime: 1000 * 60 * 2,
    select: (items) =>
      items.filter(
        (item) =>
          !EXCLUDED_STATES.includes(item.state) &&
          item.id !== workItemId &&
          !childIds.includes(item.id),
      ),
  });

  // Filter parents on client side based on search
  const filteredParents = useMemo(() => {
    if (!searchQuery) return potentialParents;
    const query = searchQuery.toLowerCase();
    return potentialParents.filter(
      (parent) =>
        parent.id.toString().includes(query) || parent.title.toLowerCase().includes(query),
    );
  }, [potentialParents, searchQuery]);

  const handleSelect = (parent: WorkItemSummary | null) => {
    onChange(parent);
    setOpen(false);
    setSearchQuery("");
  };

  // Epics cannot have parents
  if (!parentType) {
    return (
      <div className="h-8 flex items-center px-3 text-sm text-gray-500">
        <Minus className="h-4 w-4" />
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 justify-between border border-alpha/10 rounded-lg px-3 font-normal hover:bg-gray-200/70 focus-visible:border-blue-500 transition-colors min-w-48"
          disabled={disabled}
        >
          <span className="truncate text-sm">
            {value ? (
              <span className="flex items-center gap-2">
                <span className="text-gray-500">#{value.id}</span>
                <span>{value.title}</span>
              </span>
            ) : (
              <span className="text-gray-500">No parent</span>
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${parentType.toLowerCase()}s...`}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Loading {parentType.toLowerCase()}s...
              </div>
            ) : filteredParents.length === 0 ? (
              <CommandEmpty>No {parentType.toLowerCase()}s found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {value && (
                  <CommandItem onSelect={() => handleSelect(null)} className="text-gray-500">
                    <X className="mr-2 h-4 w-4" />
                    Remove parent
                  </CommandItem>
                )}
                {filteredParents.map((parent) => (
                  <CommandItem
                    key={parent.id}
                    onSelect={() => handleSelect(parent)}
                    className="items-center gap-2"
                  >
                    <span className="shrink-0 [&>svg]:size-4">{getTypeIcon(parent.type)}</span>
                    <span className="text-gray-500 shrink-0">#{parent.id}</span>
                    <span className="truncate">{parent.title}</span>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value?.id === parent.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
