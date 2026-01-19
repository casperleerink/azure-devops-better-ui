import type { Identity } from "@shared/types";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useMemo, useState } from "react";
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
  onChange: (user: Identity | null) => void;
  disabled?: boolean;
}

export function AssigneeCombobox({ value, onChange, disabled }: AssigneeComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all project users
  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ["projectUsers"],
    queryFn: () => window.ado.identities.listProjectUsers(),
    staleTime: 1000 * 60 * 5,
  });

  // Filter users on client side
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return allUsers;
    const query = searchQuery.toLowerCase();
    return allUsers.filter(
      (user) =>
        user.displayName.toLowerCase().includes(query) ||
        user.uniqueName.toLowerCase().includes(query),
    );
  }, [allUsers, searchQuery]);

  const handleSelect = (user: Identity | null) => {
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
          <span className="truncate text-sm">
            {value ? value.displayName : <span className="text-gray-500">Unassigned</span>}
          </span>
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
            {isLoading ? (
              <div className="py-6 text-center text-sm text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <CommandEmpty>No users found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {value && (
                  <CommandItem onSelect={() => handleSelect(null)} className="text-gray-500">
                    <X className="mr-2 h-4 w-4" />
                    Unassign
                  </CommandItem>
                )}
                {filteredUsers.map((user) => (
                  <CommandItem key={user.id} onSelect={() => handleSelect(user)} className="justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Avatar size="sm" fallback={user.displayName} image={user.imageUrl} />
                      <span className="truncate">{user.displayName}</span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value?.uniqueName === user.uniqueName ? "opacity-100" : "opacity-0",
                      )}
                    />
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
