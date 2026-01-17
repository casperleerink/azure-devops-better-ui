import type { Identity, Iteration, WorkItemListFilters, WorkItemType } from "@shared/types";
import { useState } from "react";
import { workItemTypes } from "@/lib/work-item-utils";

const defaultFilters: WorkItemListFilters = {
  types: workItemTypes,
  assignedTo: "me",
};

export function useWorkItemFilters() {
  const [filters, setFilters] = useState<WorkItemListFilters>(defaultFilters);
  const [selectedUser, setSelectedUser] = useState<Identity | "me" | null>("me");
  const [selectedIteration, setSelectedIteration] = useState<Iteration | null>(null);

  const toggleType = (type: WorkItemType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  };

  const handleUserSelect = (user: Identity | "me" | null) => {
    setSelectedUser(user);
    if (user === "me") {
      setFilters((prev) => ({ ...prev, assignedTo: "me" }));
    } else if (user) {
      setFilters((prev) => ({ ...prev, assignedTo: { identityId: user.id } }));
    } else {
      setFilters((prev) => ({ ...prev, assignedTo: undefined }));
    }
  };

  const handleIterationSelect = (iteration: Iteration | null) => {
    setSelectedIteration(iteration);
    if (iteration) {
      setFilters((prev) => ({ ...prev, iterationPath: iteration.path }));
    } else {
      setFilters((prev) => ({ ...prev, iterationPath: undefined }));
    }
  };

  const getSelectedUserLabel = () => {
    if (selectedUser === "me") return "Me";
    if (selectedUser === null) return "All";
    return selectedUser.displayName;
  };

  return {
    filters,
    selectedUser,
    selectedIteration,
    toggleType,
    handleUserSelect,
    handleIterationSelect,
    getSelectedUserLabel,
  };
}
