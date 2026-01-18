import { Check, Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

type SaveIndicatorProps = {
  isPending: boolean;
  isSuccess: boolean;
  className?: string;
};

export function SaveIndicator({ isPending, isSuccess, className }: SaveIndicatorProps) {
  if (isPending) {
    return <Loader2 className={cn("size-4 animate-spin text-gray-400", className)} />;
  }
  if (isSuccess) {
    return <Check className={cn("size-4 text-green-500 animate-in fade-in", className)} />;
  }
  return null;
}
