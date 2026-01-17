import type { Identity, Iteration, WorkItemListFilters, WorkItemType } from "@shared/types";
import { create } from "zustand";

interface WorkItemFiltersState {
  filters: WorkItemListFilters;
  // UI state for display purposes
  selectedUser: Identity | "me" | null;
  selectedIteration: Iteration | null;
  searchText: string;
  // Actions
  setSearchText: (text: string) => void;
  setSelectedUser: (user: Identity | "me" | null) => void;
  setSelectedIteration: (iteration: Iteration | null) => void;
  toggleType: (type: WorkItemType) => void;
  setTypes: (types: WorkItemType[]) => void;
}

export const useWorkItemFiltersStore = create<WorkItemFiltersState>((set) => ({
  filters: {
    types: ["User Story", "Task"],
    assignedTo: "me",
  },
  selectedUser: "me",
  selectedIteration: null,
  searchText: "",

  setSearchText: (text) =>
    set((state) => ({
      searchText: text,
      filters: { ...state.filters, text: text || undefined },
    })),

  setSelectedUser: (user) =>
    set((state) => ({
      selectedUser: user,
      filters: {
        ...state.filters,
        assignedTo:
          user === "me"
            ? "me"
            : user
              ? { identityId: user.id, uniqueName: user.uniqueName }
              : undefined,
      },
    })),

  setSelectedIteration: (iteration) =>
    set((state) => ({
      selectedIteration: iteration,
      filters: {
        ...state.filters,
        iterationPath: iteration?.path,
      },
    })),

  toggleType: (type) =>
    set((state) => ({
      filters: {
        ...state.filters,
        types: state.filters.types.includes(type)
          ? state.filters.types.filter((t) => t !== type)
          : [...state.filters.types, type],
      },
    })),

  setTypes: (types) =>
    set((state) => ({
      filters: {
        ...state.filters,
        types,
      },
    })),
}));
