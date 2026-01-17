import type {
  Iteration,
  WorkItemCreatePayload,
  WorkItemSummary,
  WorkItemType,
} from "@shared/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormField,
  FormFieldContainer,
  FormFieldControl,
  FormFieldInput,
  FormFieldLabel,
  FormFieldTextarea,
} from "@/components/ui/form-field";
import { ComboboxTrigger, Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";

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

interface CreateWorkItemDialogProps {
  trigger: React.ReactNode;
}

export function CreateWorkItemDialog({ trigger }: CreateWorkItemDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkItemType>("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIteration, setSelectedIteration] = useState<Iteration | null>(null);
  const [selectedParent, setSelectedParent] = useState<WorkItemSummary | null>(null);
  const [iterationOpen, setIterationOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  // Fetch config for default area path
  const { data: config } = useQuery({
    queryKey: ["config"],
    queryFn: () => window.ado.config.get(),
  });

  // Fetch iterations
  const { data: iterations } = useQuery({
    queryKey: ["iterations"],
    queryFn: () => window.ado.iterations.list(),
    staleTime: 1000 * 60 * 5,
  });

  // Determine parent type based on selected work item type
  const parentType = getParentType(type);

  // Fetch potential parent work items (filtered by default area path if set)
  const { data: potentialParents, isLoading: parentsLoading } = useQuery({
    queryKey: ["workItems", "parents", parentType, config?.defaultAreaPath],
    queryFn: () =>
      window.ado.workItems.list({
        types: parentType ? [parentType] : [],
        sort: "changedDesc",
        areaPath: config?.defaultAreaPath,
      }),
    enabled: !!parentType,
    staleTime: 1000 * 60 * 2,
    select: (items) => items.filter((item) => !EXCLUDED_STATES.includes(item.state)),
  });

  // Clear parent selection when type changes and parent type is different
  const handleTypeChange = (newType: WorkItemType) => {
    const newParentType = getParentType(newType);
    if (newParentType !== parentType) {
      setSelectedParent(null);
    }
    setType(newType);
  };

  const createMutation = useMutation({
    mutationFn: (payload: WorkItemCreatePayload) => window.ado.workItems.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      setOpen(false);
      // Reset form
      setType("Task");
      setTitle("");
      setDescription("");
      setSelectedIteration(null);
      setSelectedParent(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      iterationPath: selectedIteration?.path,
      parentId: selectedParent?.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Work Item</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Type Select */}
            <FormField>
              <FormFieldContainer>
                <FormFieldLabel required>Type</FormFieldLabel>
                <FormFieldControl>
                  <Select
                    value={type}
                    onValueChange={(value) => handleTypeChange(value as WorkItemType)}
                  >
                    <SelectTrigger className="h-auto p-0 focus:ring-0 hover:bg-transparent [&>span]:flex [&>span]:items-center [&>span]:gap-2 [&_svg]:size-4">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {workItemTypes.map((t) => (
                        <SelectItem key={t} value={t} textValue={t}>
                          <div className="flex items-center gap-2 [&>svg]:size-4">
                            {getTypeIcon(t)}
                            <span>{t}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormFieldControl>
              </FormFieldContainer>
            </FormField>

            {/* Sprint and Parent row */}
            <div className="flex gap-4">
              {/* Sprint/Iteration field */}
              <FormField className="flex-1">
                <FormFieldContainer>
                  <FormFieldLabel>Sprint</FormFieldLabel>
                  <FormFieldControl>
                    <Popover open={iterationOpen} onOpenChange={setIterationOpen} modal={false}>
                      <PopoverTrigger asChild>
                        <ComboboxTrigger variant="bare" placeholder="Select sprint...">
                          {selectedIteration?.name}
                        </ComboboxTrigger>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search sprints..." />
                          <CommandList>
                            <CommandEmpty>No sprints found.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                onSelect={() => {
                                  setSelectedIteration(null);
                                  setIterationOpen(false);
                                }}
                              >
                                None
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    selectedIteration === null ? "opacity-100" : "opacity-0",
                                  )}
                                />
                              </CommandItem>
                              {iterations?.map((iteration) => (
                                <CommandItem
                                  key={iteration.id}
                                  onSelect={() => {
                                    setSelectedIteration(iteration);
                                    setIterationOpen(false);
                                  }}
                                >
                                  {iteration.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedIteration?.id === iteration.id
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormFieldControl>
                </FormFieldContainer>
              </FormField>

              {/* Parent work item field - only show if not Epic */}
              {parentType && (
                <FormField className="flex-1">
                  <FormFieldContainer>
                    <FormFieldLabel>Parent {parentType}</FormFieldLabel>
                    <FormFieldControl>
                      <Popover open={parentOpen} onOpenChange={setParentOpen} modal={false}>
                        <PopoverTrigger asChild>
                          <ComboboxTrigger
                            variant="bare"
                            disabled={parentsLoading}
                            placeholder={
                              parentsLoading
                                ? "Loading..."
                                : `Select ${parentType.toLowerCase()}...`
                            }
                          >
                            {selectedParent && `${selectedParent.id}: ${selectedParent.title}`}
                          </ComboboxTrigger>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder={`Search ${parentType.toLowerCase()}s...`} />
                            <CommandList>
                              <CommandEmpty>No {parentType.toLowerCase()}s found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    setSelectedParent(null);
                                    setParentOpen(false);
                                  }}
                                >
                                  None
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedParent === null ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                                {potentialParents?.map((parent) => (
                                  <CommandItem
                                    key={parent.id}
                                    onSelect={() => {
                                      setSelectedParent(parent);
                                      setParentOpen(false);
                                    }}
                                    className="items-center"
                                  >
                                    <span className="shrink-0 [&>svg]:size-4">
                                      {getTypeIcon(parent.type)}
                                    </span>
                                    <span className="truncate">{parent.title}</span>
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        selectedParent?.id === parent.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </FormFieldControl>
                  </FormFieldContainer>
                </FormField>
              )}
            </div>

            {/* Title Input */}
            <FormField>
              <FormFieldContainer>
                <FormFieldLabel required>Title</FormFieldLabel>
                <FormFieldControl>
                  <FormFieldInput
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter a title..."
                    required
                  />
                </FormFieldControl>
              </FormFieldContainer>
            </FormField>

            {/* Description Textarea */}
            <FormField>
              <FormFieldContainer>
                <FormFieldLabel>Description</FormFieldLabel>
                <FormFieldControl>
                  <FormFieldTextarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    className="min-h-[120px]"
                  />
                </FormFieldControl>
              </FormFieldContainer>
            </FormField>
          </div>

          <DialogFooter>
            {createMutation.isError && (
              <span className="text-sm text-red-500 mr-auto">
                {createMutation.error instanceof Error
                  ? createMutation.error.message
                  : "Failed to create"}
              </span>
            )}
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createMutation.isPending || !title.trim()}
            >
              {createMutation.isPending ? "Creating..." : "Create Work Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
