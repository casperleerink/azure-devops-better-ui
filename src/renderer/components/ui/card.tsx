import * as React from "react";

import { cn } from "~/lib/utils";

const CardRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { show?: boolean }
>(({ className, show = true, ...props }, ref) => {
  if (!show) {
    return null;
  }
  return (
    <div
      ref={ref}
      className={cn(
        "border-alpha/5 flex items-center justify-between gap-8 border-t px-6 py-4",
        className,
      )}
      {...props}
    />
  );
});
CardRow.displayName = "CardRow";

const CardRowLabel = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    icon?: React.ReactNode;
    label: string;
  }
>(({ className, icon, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-1 items-center gap-4 text-gray-600 [&_svg]:size-5 [&_svg]:opacity-30",
      className,
    )}
    {...props}
  >
    <div className="p-0.5">{icon ?? null}</div>
    <span className="text-base font-medium">{label}</span>
  </div>
));
CardRowLabel.displayName = "CardRowLabel";

const CardRowNew = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { show?: boolean }
>(({ className, show = true, ...props }, ref) => {
  if (!show) {
    return null;
  }
  return (
    <div
      ref={ref}
      className={cn(
        "border-alpha/5 flex items-center justify-between gap-4 border-b bg-gray-50 px-4 py-4 sm:justify-start sm:px-16",
        className,
      )}
      {...props}
    />
  );
});
CardRowNew.displayName = "CardRowNew";

const CardRowLabelNew = React.forwardRef<
  HTMLDivElement,
  Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
    icon?: React.ReactNode;
    label: string;
  }
>(({ className, icon, label, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex shrink-0 items-center gap-4 text-gray-600 sm:w-36 [&_svg]:size-4 [&_svg]:opacity-40",
      className,
    )}
    {...props}
  >
    <div className="flex size-6 items-center justify-center">{icon ?? null}</div>
    <span className="text-sm font-medium">{label}</span>
  </div>
));
CardRowLabelNew.displayName = "CardRowLabelNew";

export { CardRow, CardRowLabel, CardRowNew, CardRowLabelNew };
