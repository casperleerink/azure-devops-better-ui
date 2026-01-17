import { forwardRef } from "react";
import { cn } from "~/lib/utils";

export const Row = forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group border-alpha/5 hover:bg-alpha/2 relative flex w-full items-center border-t transition-colors duration-100",
          className,
        )}
        {...props}
      />
    );
  },
);
Row.displayName = "Row";

export const RowSquare = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex size-14 shrink-0 items-center justify-center sm:size-16", className)}
      {...props}
    />
  );
};
