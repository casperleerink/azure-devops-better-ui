import type { Identity } from "@shared/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
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
import { useWorkItemFiltersStore } from "@/stores/work-item-filters";

interface UserComboboxProps {
  users: Identity[] | undefined;
}

export function UserCombobox({ users }: UserComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedUser = useWorkItemFiltersStore((state) => state.selectedUser);
  const setSelectedUser = useWorkItemFiltersStore((state) => state.setSelectedUser);

  const handleSelect = (user: Identity | "me" | null) => {
    setSelectedUser(user);
    setOpen(false);
  };

  const label = selectedUser === "me" ? "Me" : (selectedUser?.displayName ?? "Anyone");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-40 justify-between border border-alpha/5 rounded-lg px-2 font-normal hover:bg-gray-100/70 focus-visible:border-blue-500 transition-colors"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => handleSelect("me")} className="justify-between">
                <div className="flex items-center gap-2">
                  <Avatar size="sm" fallback="Me" />
                  <span>Me</span>
                </div>
                <Check
                  className={cn(
                    "h-4 w-4 shrink-0",
                    selectedUser === "me" ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
              {users?.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelect(user)} className="justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <Avatar size="sm" fallback={user.displayName} image={user.imageUrl} />
                    <span className="truncate">{user.displayName}</span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 shrink-0",
                      selectedUser !== "me" && selectedUser !== null && selectedUser.id === user.id
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
  );
}
