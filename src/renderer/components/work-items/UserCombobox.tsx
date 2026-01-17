import type { Identity } from "@shared/types";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
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

interface UserComboboxProps {
  selectedUser: Identity | "me" | null;
  users: Identity[] | undefined;
  onSelect: (user: Identity | "me" | null) => void;
  label: string;
}

export function UserCombobox({ selectedUser, users, onSelect, label }: UserComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (user: Identity | "me" | null) => {
    onSelect(user);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-40 justify-between border border-alpha/10 rounded-lg px-2 font-normal"
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandList>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => handleSelect("me")}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUser === "me" ? "opacity-100" : "opacity-0",
                  )}
                />
                Me
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(null)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUser === null ? "opacity-100" : "opacity-0",
                  )}
                />
                All
              </CommandItem>
              {users?.map((user) => (
                <CommandItem key={user.id} onSelect={() => handleSelect(user)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUser !== "me" && selectedUser !== null && selectedUser.id === user.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  {user.displayName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
