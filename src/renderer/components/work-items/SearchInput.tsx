import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { InputWithIcon } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

export function SearchInput() {
  const setSearchText = useWorkItemFiltersStore((state) => state.setSearchText);
  const [localValue, setLocalValue] = useState("");
  const debouncedValue = useDebouncedValue(localValue, 300);

  useEffect(() => {
    setSearchText(debouncedValue);
  }, [debouncedValue, setSearchText]);

  return (
    <InputWithIcon
      iconLeft={<Search className="text-gray-400" />}
      placeholder="Search work items..."
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      className="w-64"
    />
  );
}
