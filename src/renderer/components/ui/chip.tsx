"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";
import { Avatar } from "./avatar";
import { X } from "lucide-react";

const chipVariants = cva(
  "group/chip inline-flex items-center justify-center gap-1 whitespace-nowrap font-medium transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-gray-950 hover:bg-gray-900 text-gray-50",
        subtle: "bg-alpha/5 text-gray-950 hover:bg-alpha/10",
        secondary: "bg-blue-500 text-white hover:bg-blue-600",
        "secondary-subtle": "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
      },
      size: {
        xs: "h-5 text-xs rounded-sm px-0.5",
        sm: "h-6 text-sm rounded-md px-0.5",
        md: "h-8 text-sm rounded-lg px-1",
        lg: "h-10 text-base rounded-[10px] px-1",
      },
      rounded: {
        true: "rounded-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      rounded: false,
    },
  },
);

const spanSizeVariants = {
  xs: "px-1.5",
  sm: "px-2",
  md: "px-2",
  lg: "px-2.5",
};

const closeButtonVariants = cva(
  "flex aspect-square items-center justify-center transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-gray-50/10 text-gray-50/70",
        subtle: "bg-alpha/5 text-gray-500",
        secondary: "bg-white/10 text-white/70",
        "secondary-subtle": "bg-blue-500/10 text-blue-500/70",
      },
      size: {
        xs: "rounded-xs size-4",
        sm: "rounded-sm size-5",
        md: "rounded-sm size-6",
        lg: "rounded-md size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof chipVariants> {
  image?: string | null;
  fallback?: React.ReactNode | null;
  onRemove?: () => void;
  avatarProps?: Partial<React.ComponentPropsWithoutRef<typeof Avatar>>;
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      className,
      variant,
      size,
      rounded,
      image,
      fallback,
      children,
      onRemove,
      avatarProps,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={cn(chipVariants({ variant, size, rounded, className }))}
        {...props}
      >
        {(image || fallback) && (
          <Avatar
            image={image}
            fallback={fallback}
            size={size ?? "md"}
            rounded={rounded ?? false}
            {...avatarProps}
          />
        )}
        <span className={spanSizeVariants[size ?? "md"]}>{children}</span>

        <button
          onClick={onRemove}
          className={cn(
            closeButtonVariants({ variant, size }),
            rounded ? "rounded-full" : "",
          )}
        >
          <X className="size-3.5" />
        </button>
      </div>
    );
  },
);
Chip.displayName = "Chip";

export { Chip, chipVariants };
