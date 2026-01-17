import type { Identity, Iteration } from "@shared/types";
import { IterationCombobox } from "./IterationCombobox";
import { SearchInput } from "./SearchInput";
import { TypeFilterButtons } from "./TypeFilterButtons";
import { UserCombobox } from "./UserCombobox";

interface FilterBarProps {
  users: Identity[] | undefined;
  iterations: Iteration[] | undefined;
}

export function FilterBar({ users, iterations }: FilterBarProps) {
  return (
    <div className="border-b border-alpha/5 bg-gray-50 px-6 py-3">
      <div className="flex items-center gap-4">
        <UserCombobox users={users} />
        <IterationCombobox iterations={iterations} />
        <TypeFilterButtons />
        <div className="flex-1" />
        <SearchInput />
      </div>
    </div>
  );
}
