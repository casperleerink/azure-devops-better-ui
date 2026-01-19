import type {
  Identity,
  Iteration,
  WorkItemDetail,
  WorkItemSummary,
  WorkItemTypeState,
} from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Check,
  ChevronsUpDown,
  CircleDot,
  Folder,
  GitBranch,
  Network,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CardRow, CardRowLabel } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SaveIndicator } from "@/components/ui/save-indicator";
import { useFieldMutation } from "@/hooks/useFieldMutation";
import { useParentMutation } from "@/hooks/useParentMutation";
import { cn } from "@/lib/utils";
import { AssigneeCombobox } from "./AssigneeCombobox";
import { ParentWorkItemCombobox } from "./ParentWorkItemCombobox";
import { StateSelect } from "./StateSelect";

interface DetailsGridProps {
  workItem: WorkItemDetail;
  states: WorkItemTypeState[];
}

export function DetailsGrid({ workItem, states }: DetailsGridProps) {
  const [localState, setLocalState] = useState(workItem.state);
  const [localIteration, setLocalIteration] = useState(workItem.iterationPath || "");
  const [localAssignee, setLocalAssignee] = useState(workItem.assignedTo);
  const [localParent, setLocalParent] = useState<{ id: number; title: string } | undefined>(
    workItem.parentId ? { id: workItem.parentId, title: "" } : undefined,
  );
  const [iterationOpen, setIterationOpen] = useState(false);

  // Auto-save mutations
  const stateMutation = useFieldMutation(workItem.id, "state");
  const iterationMutation = useFieldMutation(workItem.id, "iterationPath");
  const assigneeMutation = useFieldMutation(workItem.id, "assignedTo");
  const parentMutation = useParentMutation(workItem.id);

  // Fetch iterations for the picker
  const { data: iterations = [] } = useQuery({
    queryKey: ["iterations"],
    queryFn: () => window.ado.iterations.list(),
    staleTime: 1000 * 60 * 60,
  });

  // Fetch parent work item for display
  const { data: parentWorkItem } = useQuery({
    queryKey: ["workItem", workItem.parentId],
    queryFn: () => window.ado.workItems.get(workItem.parentId!),
    enabled: !!workItem.parentId,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch children for circular reference prevention
  const { data: children = [] } = useQuery({
    queryKey: ["workItems", "children", workItem.id],
    queryFn: () => window.ado.workItems.listChildren(workItem.id),
    staleTime: 1000 * 60 * 2,
  });

  // Sync local state when work item changes (e.g., after mutation success)
  useEffect(() => {
    setLocalState(workItem.state);
    setLocalIteration(workItem.iterationPath || "");
    setLocalAssignee(workItem.assignedTo);

    if (workItem.parentId && parentWorkItem) {
      setLocalParent({ id: parentWorkItem.id, title: parentWorkItem.title });
    } else {
      setLocalParent(undefined);
    }
  }, [
    workItem.state,
    workItem.iterationPath,
    workItem.assignedTo,
    workItem.parentId,
    parentWorkItem,
  ]);

  const handleStateChange = (newState: string) => {
    setLocalState(newState);
    stateMutation.mutate(newState);
  };

  const handleIterationSelect = (iteration: Iteration | null) => {
    const newPath = iteration?.path || "";
    setLocalIteration(newPath);
    setIterationOpen(false);
    iterationMutation.mutate(newPath);
  };

  const handleAssigneeChange = (user: Identity | null) => {
    if (user) {
      setLocalAssignee({ displayName: user.displayName, uniqueName: user.uniqueName });
      assigneeMutation.mutate(user.uniqueName);
    } else {
      setLocalAssignee(undefined);
      assigneeMutation.mutate("");
    }
  };

  const handleParentChange = (parent: WorkItemSummary | null) => {
    if (parent) {
      setLocalParent({ id: parent.id, title: parent.title });
    } else {
      setLocalParent(undefined);
    }
    parentMutation.mutate(parent);
  };

  const selectedIteration = iterations.find((i) => i.path === localIteration);

  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-100 mb-6 [&>:first-child]:border-t-0">
      <CardRow>
        <CardRowLabel icon={<User />} label="Assigned To" />
        <div className="flex items-center gap-2">
          <AssigneeCombobox
            value={localAssignee}
            onChange={handleAssigneeChange}
            disabled={assigneeMutation.isPending}
          />
          <SaveIndicator
            isPending={assigneeMutation.isPending}
            isSuccess={assigneeMutation.isSuccess}
          />
        </div>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<Network />} label="Parent" />
        <div className="flex items-center gap-2">
          <ParentWorkItemCombobox
            workItemId={workItem.id}
            workItemType={workItem.type}
            value={localParent}
            childIds={children.map((c) => c.id)}
            onChange={handleParentChange}
            disabled={parentMutation.isPending}
          />
          <SaveIndicator
            isPending={parentMutation.isPending}
            isSuccess={parentMutation.isSuccess}
          />
        </div>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<CircleDot />} label="State" />
        <div className="flex items-center gap-2">
          <StateSelect
            value={localState}
            states={states}
            onChange={handleStateChange}
            disabled={stateMutation.isPending}
          />
          <SaveIndicator isPending={stateMutation.isPending} isSuccess={stateMutation.isSuccess} />
        </div>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<Folder />} label="Area Path" />
        <span className="text-sm text-alpha">{workItem.areaPath || "-"}</span>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<GitBranch />} label="Iteration" />
        <div className="flex items-center gap-2">
          <Popover open={iterationOpen} onOpenChange={setIterationOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 justify-between border border-alpha/10 rounded-lg px-3 font-normal hover:bg-gray-200/70 focus-visible:border-blue-500 transition-colors min-w-40"
                disabled={iterationMutation.isPending}
              >
                <span className="truncate text-sm">
                  {selectedIteration?.name || localIteration || "Select iteration..."}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <Command>
                <CommandInput placeholder="Search iterations..." />
                <CommandList>
                  <CommandEmpty>No iterations found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleIterationSelect(null)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !localIteration ? "opacity-100" : "opacity-0",
                        )}
                      />
                      None
                    </CommandItem>
                    {iterations.map((iteration) => (
                      <CommandItem
                        key={iteration.id}
                        onSelect={() => handleIterationSelect(iteration)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            localIteration === iteration.path ? "opacity-100" : "opacity-0",
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
          <SaveIndicator
            isPending={iterationMutation.isPending}
            isSuccess={iterationMutation.isSuccess}
          />
        </div>
      </CardRow>
      {workItem.changedDate && (
        <CardRow>
          <CardRowLabel icon={<Calendar />} label="Last Updated" />
          <span className="text-sm text-alpha">
            {new Date(workItem.changedDate).toLocaleString()}
          </span>
        </CardRow>
      )}
    </div>
  );
}
