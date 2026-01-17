import type { WorkItemCreatePayload, WorkItemType } from "@shared/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTypeIcon, workItemTypes } from "@/lib/work-item-utils";

interface CreateWorkItemDialogProps {
  trigger: React.ReactNode;
}

export function CreateWorkItemDialog({ trigger }: CreateWorkItemDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<WorkItemType>("Task");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: (payload: WorkItemCreatePayload) => window.ado.workItems.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workItems"] });
      setOpen(false);
      // Reset form
      setType("Task");
      setTitle("");
      setDescription("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate({
      type,
      title: title.trim(),
      description: description.trim() || undefined,
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
                  <Select value={type} onValueChange={(value) => setType(value as WorkItemType)}>
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
