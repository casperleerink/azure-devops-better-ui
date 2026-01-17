import { CheckCheckIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "~/lib/utils";

export const StackContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full w-full flex-col justify-center -space-y-8">
      {children}
    </div>
  );
};

const fadedBorder = ["border-alpha/10", "border-alpha/5", "border-alpha/3"];
export const StackItemContainer = ({
  children,
  idx,
  layoutId,
  fade = false,
}: {
  children: React.ReactNode;
  idx: number;
  layoutId: string;
  fade?: boolean;
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      layout
      className={cn(idx === 1 ? "px-4" : "", idx === 2 ? "px-8" : "")}
      style={{
        zIndex: 3 - idx,
      }}
    >
      <div
        className={cn(
          "border-alpha/10 h-14 w-full rounded-xl border bg-gray-50",
          fade ? fadedBorder[idx] : "",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
};

export const EmptyStackItem = ({ idx }: { idx: number }) => {
  if (idx !== 0) return null;
  return (
    <div className="flex h-full w-full items-center justify-between p-4 font-medium text-gray-500">
      <span>You're all caught up!</span>
      <span className="bg-alpha/5 border-alpha/10 inline-flex size-6 items-center justify-center rounded-md border">
        <CheckCheckIcon className="size-4" />
      </span>
    </div>
  );
};
