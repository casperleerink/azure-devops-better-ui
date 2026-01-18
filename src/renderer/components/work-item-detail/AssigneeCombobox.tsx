import type { UserSearchResult } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
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

interface AssigneeComboboxProps {
  value: { displayName: string; uniqueName?: string } | undefined;
  onChange: (user: UserSearchResult | null) => void;
  disabled?: boolean;
}

export function AssigneeCombobox({ value, onChange, disabled }: AssigneeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search users when query changes
  const { data: users = [], isFetching } = useQuery({
    queryKey: ["users", "search", debouncedQuery],
    queryFn: () => window.ado.users.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 5,
  });

  const handleSelect = (user: UserSearchResult | null) => {
    onChange(user);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 justify-between border border-alpha/10 rounded-lg px-3 font-normal hover:bg-gray-200/70 focus-visible:border-blue-500 transition-colors min-w-48"
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <Avatar size="xs" fallback={value.displayName} />
                <span className="truncate text-sm">{value.displayName}</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Unassigned</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search users..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {debouncedQuery.length < 2 ? (
              <div className="py-6 text-center text-sm text-gray-500">
                Type at least 2 characters to search
              </div>
            ) : isFetching ? (
              <div className="py-6 text-center text-sm text-gray-500">Searching...</div>
            ) : users.length === 0 ? (
              <CommandEmpty>No users found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {value && (
                  <CommandItem onSelect={() => handleSelect(null)} className="text-gray-500">
                    <X className="mr-2 h-4 w-4" />
                    Unassign
                  </CommandItem>
                )}
                {users.map((user) => (
                  <CommandItem key={user.id} onSelect={() => handleSelect(user)}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.uniqueName === user.uniqueName ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <Avatar size="xs" fallback={user.displayName} image={user.imageUrl} />
                    <span className="ml-2 truncate">{user.displayName}</span>
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
