import type { Identity, Iteration, WorkItemType } from "@shared/types";
import { Search } from "lucide-react";
import { InputWithIcon } from "@/components/ui/input";
import { IterationCombobox } from "./IterationCombobox";
import { TypeFilterButtons } from "./TypeFilterButtons";
import { UserCombobox } from "./UserCombobox";

interface FilterBarProps {
  selectedUser: Identity | "me" | null;
  selectedUserLabel: string;
  users: Identity[] | undefined;
  onUserSelect: (user: Identity | "me" | null) => void;
  selectedIteration: Iteration | null;
  iterations: Iteration[] | undefined;
  onIterationSelect: (iteration: Iteration | null) => void;
  selectedTypes: WorkItemType[];
  onTypeToggle: (type: WorkItemType) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

export function FilterBar({
  selectedUser,
  selectedUserLabel,
  users,
  onUserSelect,
  selectedIteration,
  iterations,
  onIterationSelect,
  selectedTypes,
  onTypeToggle,
  searchText,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="border-b border-alpha/5 bg-gray-50 px-6 py-3">
      <div className="flex items-center gap-4">
        <UserCombobox
          selectedUser={selectedUser}
          users={users}
          onSelect={onUserSelect}
          label={selectedUserLabel}
        />
        <IterationCombobox
          selectedIteration={selectedIteration}
          iterations={iterations}
          onSelect={onIterationSelect}
        />
        <TypeFilterButtons selectedTypes={selectedTypes} onToggle={onTypeToggle} />
        <div className="flex-1" />
        <InputWithIcon
          iconLeft={<Search className="text-gray-400" />}
          placeholder="Search work items..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-64"
        />
      </div>
    </div>
  );
}
