import * as React from "react";

import { cn } from "~/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-transparent px-1 text-sm text-gray-950 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-40",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & {
    iconLeft?: React.ReactNode;
    iconRight?: React.ReactNode;
  }
>(({ className, type, iconLeft, iconRight, ...props }, ref) => {
  return (
    <div className="relative">
      <input
        type={type}
        className={cn(
          "border-alpha/5 focus-visible:border-blue-500 hover:bg-gray-100/70 flex h-8 w-full rounded-md border bg-transparent px-3 text-base text-gray-950 placeholder:text-gray-500 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          iconLeft ? "pl-7" : "",
          iconRight ? "pr-7" : "",
          className,
        )}
        ref={ref}
        {...props}
      />
      {iconLeft ? (
        <div className="absolute top-1/2 left-2 flex -translate-y-1/2 items-center justify-center [&_svg]:size-4">
          {iconLeft}
        </div>
      ) : null}
      {iconRight ? (
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center justify-center [&_svg]:size-4">
          {iconRight}
        </div>
      ) : null}
    </div>
  );
});
InputWithIcon.displayName = "InputWithIcon";

const BareInput = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full flex-1 border-none text-gray-950 focus-visible:outline-none disabled:cursor-default",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
BareInput.displayName = "BareInput";

export { Input, BareInput, InputWithIcon };
