import { cn } from "~/lib/utils";

export const UnreadIndicator = ({ unread }: { unread: boolean }) => {
  return (
    <div
      className={cn(
        "size-2 rounded-full",
        unread ? "bg-blue-500 ring-4 ring-blue-500/10" : "bg-alpha/10",
      )}
    />
  );
};
