import type {
  AreaPath,
  Identity,
  Iteration,
  WorkItemCreatePayload,
  WorkItemSummary,
  WorkItemType,
} from "@shared/types";
import { useForm, useStore } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
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
import { currentUserQueryOptions } from "@/lib/queries";
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
  const [iterationOpen, setIterationOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);
  const [areaPathOpen, setAreaPathOpen] = useState(false);
  const [assignedToOpen, setAssignedToOpen] = useState(false);

  // Get current user (prefetched in root loader)
  const { data: currentUser } = useSuspenseQuery(currentUserQueryOptions);

  // Fetch project users for assignee selector
  const { data: projectUsers } = useQuery({
    queryKey: ["projectUsers"],
    queryFn: () => window.ado.identities.listProjectUsers(),
    staleTime: 1000 * 60 * 5,
  });

  const form = useForm({
    defaultValues: {
      type: "Task" as WorkItemType,
      title: "",
      description: "",
      iteration: null as Iteration | null,
      parent: null as WorkItemSummary | null,
      areaPath: null as AreaPath | null,
      assignedTo: currentUser as Identity | null,
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({
        type: value.type,
        title: value.title.trim(),
        description: value.description.trim() || undefined,
        iterationPath: value.iteration?.path,
        parentId: value.parent?.id,
        areaPath: value.areaPath?.path,
        assignedTo: value.assignedTo?.uniqueName,
      });
    },
  });

  // Subscribe to type field to derive parent type
  const currentType = useStore(form.store, (state) => state.values.type);
  const parentType = getParentType(currentType);

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

  // Fetch area paths
  const { data: areaPaths } = useQuery({
    queryKey: ["areaPaths"],
    queryFn: () => window.ado.areaPaths.list(),
    staleTime: 1000 * 60 * 5,
  });

  // Set default area path from config when dialog opens
  useEffect(() => {
    if (open && config?.defaultAreaPath && areaPaths) {
      const defaultArea = areaPaths.find((ap) => ap.path === config.defaultAreaPath);
      if (defaultArea) {
        form.setFieldValue("areaPath", defaultArea);
      }
    }
  }, [open, config?.defaultAreaPath, areaPaths, form]);

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

  const createMutation = useMutation({
    mutationFn: (payload: WorkItemCreatePayload) => window.ado.workItems.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>New Work Item</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Type Select */}
            <form.Field name="type">
              {(field) => (
                <FormField>
                  <FormFieldContainer>
                    <FormFieldLabel required>Type</FormFieldLabel>
                    <FormFieldControl>
                      <Select
                        value={field.state.value}
                        onValueChange={(value) => {
                          const newType = value as WorkItemType;
                          const newParentType = getParentType(newType);
                          // Clear parent when type hierarchy changes
                          if (newParentType !== getParentType(field.state.value)) {
                            form.setFieldValue("parent", null);
                          }
                          field.handleChange(newType);
                        }}
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
              )}
            </form.Field>

            {/* Area Path Select */}
            <form.Field name="areaPath">
              {(field) => (
                <FormField>
                  <FormFieldContainer>
                    <FormFieldLabel>Area Path</FormFieldLabel>
                    <FormFieldControl>
                      <Popover open={areaPathOpen} onOpenChange={setAreaPathOpen} modal={false}>
                        <PopoverTrigger asChild>
                          <ComboboxTrigger variant="bare" placeholder="Select area path...">
                            {field.state.value?.path}
                          </ComboboxTrigger>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search area paths..." />
                            <CommandList>
                              <CommandEmpty>No area paths found.</CommandEmpty>
                              <CommandGroup>
                                {areaPaths?.map((areaPath) => (
                                  <CommandItem
                                    key={areaPath.id}
                                    onSelect={() => {
                                      field.handleChange(areaPath);
                                      setAreaPathOpen(false);
                                    }}
                                  >
                                    {areaPath.path}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        field.state.value?.id === areaPath.id
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
            </form.Field>

            {/* Assigned To Select */}
            <form.Field name="assignedTo">
              {(field) => (
                <FormField>
                  <FormFieldContainer>
                    <FormFieldLabel>Assigned To</FormFieldLabel>
                    <FormFieldControl>
                      <Popover open={assignedToOpen} onOpenChange={setAssignedToOpen} modal={false}>
                        <PopoverTrigger asChild>
                          <ComboboxTrigger variant="bare" placeholder="Unassigned">
                            {field.state.value?.displayName}
                          </ComboboxTrigger>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search users..." />
                            <CommandList>
                              <CommandEmpty>No users found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  onSelect={() => {
                                    field.handleChange(null);
                                    setAssignedToOpen(false);
                                  }}
                                >
                                  Unassigned
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      field.state.value === null ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                                {projectUsers?.map((user) => (
                                  <CommandItem
                                    key={user.id}
                                    onSelect={() => {
                                      field.handleChange(user);
                                      setAssignedToOpen(false);
                                    }}
                                  >
                                    {user.displayName}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        field.state.value?.id === user.id
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
            </form.Field>

            {/* Sprint and Parent row */}
            <div className="flex gap-4">
              {/* Sprint/Iteration field */}
              <form.Field name="iteration">
                {(field) => (
                  <FormField className="flex-1">
                    <FormFieldContainer>
                      <FormFieldLabel>Sprint</FormFieldLabel>
                      <FormFieldControl>
                        <Popover open={iterationOpen} onOpenChange={setIterationOpen} modal={false}>
                          <PopoverTrigger asChild>
                            <ComboboxTrigger variant="bare" placeholder="Select sprint...">
                              {field.state.value?.name}
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
                                      field.handleChange(null);
                                      setIterationOpen(false);
                                    }}
                                  >
                                    None
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        field.state.value === null ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                  </CommandItem>
                                  {iterations?.map((iteration) => (
                                    <CommandItem
                                      key={iteration.id}
                                      onSelect={() => {
                                        field.handleChange(iteration);
                                        setIterationOpen(false);
                                      }}
                                    >
                                      {iteration.name}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.state.value?.id === iteration.id
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
              </form.Field>

              {/* Parent work item field - only show if not Epic */}
              {parentType && (
                <form.Field name="parent">
                  {(field) => (
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
                                {field.state.value &&
                                  `${field.state.value.id}: ${field.state.value.title}`}
                              </ComboboxTrigger>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <Command>
                                <CommandInput
                                  placeholder={`Search ${parentType.toLowerCase()}s...`}
                                />
                                <CommandList>
                                  <CommandEmpty>No {parentType.toLowerCase()}s found.</CommandEmpty>
                                  <CommandGroup>
                                    <CommandItem
                                      onSelect={() => {
                                        field.handleChange(null);
                                        setParentOpen(false);
                                      }}
                                    >
                                      None
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          field.state.value === null ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                    </CommandItem>
                                    {potentialParents?.map((parent) => (
                                      <CommandItem
                                        key={parent.id}
                                        onSelect={() => {
                                          field.handleChange(parent);
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
                                            field.state.value?.id === parent.id
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
                </form.Field>
              )}
            </div>

            {/* Title Input */}
            <form.Field
              name="title"
              validators={{
                onSubmit: ({ value }) => (!value.trim() ? "Title is required" : undefined),
              }}
            >
              {(field) => (
                <FormField>
                  <FormFieldContainer>
                    <FormFieldLabel required>Title</FormFieldLabel>
                    <FormFieldControl>
                      <FormFieldInput
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Enter a title..."
                      />
                    </FormFieldControl>
                    {field.state.meta.errors.length > 0 && (
                      <span className="text-sm text-red-500">
                        {field.state.meta.errors.join(", ")}
                      </span>
                    )}
                  </FormFieldContainer>
                </FormField>
              )}
            </form.Field>

            {/* Description Textarea */}
            <form.Field name="description">
              {(field) => (
                <FormField>
                  <FormFieldContainer>
                    <FormFieldLabel>Description</FormFieldLabel>
                    <FormFieldControl>
                      <FormFieldTextarea
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        placeholder="Add a description..."
                        className="min-h-[120px]"
                      />
                    </FormFieldControl>
                  </FormFieldContainer>
                </FormField>
              )}
            </form.Field>
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
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!canSubmit || createMutation.isPending}
                >
                  {isSubmitting || createMutation.isPending ? "Creating..." : "Create Work Item"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
