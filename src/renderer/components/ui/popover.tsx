import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronsUpDown } from "lucide-react";
import * as React from "react";

import { cn } from "~/lib/utils";
import { dropdownMenuVariants } from "./dropdown-menu";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverClose = PopoverPrimitive.Close;

const comboboxTriggerVariants = cva(
  "flex w-full items-center justify-between bg-transparent text-sm font-medium text-gray-950 whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-40 [&>span]:truncate",
  {
    variants: {
      variant: {
        default: "h-9 px-3 rounded-lg border border-alpha/10 hover:bg-alpha/5",
        bare: "px-0 hover:opacity-70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ComboboxTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof comboboxTriggerVariants> {
  placeholder?: string;
}

const ComboboxTrigger = React.forwardRef<HTMLButtonElement, ComboboxTriggerProps>(
  ({ className, variant, children, placeholder, ...props }, ref) => {
    const showPlaceholder = !children;
    return (
      <button
        ref={ref}
        type="button"
        className={cn(comboboxTriggerVariants({ variant, className }))}
        {...props}
      >
        <span className={cn(showPlaceholder && "opacity-40")}>{children ?? placeholder}</span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>
    );
  },
);
ComboboxTrigger.displayName = "ComboboxTrigger";

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & {
    variant?: "default" | "subtle";
  }
>(({ className, variant = "default", align = "center", sideOffset = 8, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 z-50 min-w-56 rounded-2xl text-gray-950 outline-hidden",
        dropdownMenuVariants[variant],
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  ComboboxTrigger,
  comboboxTriggerVariants,
};
