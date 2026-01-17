import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-gray-950 text-gray-50 border border-alpha/10",
        "primary-subtle": "bg-alpha/5 text-gray-950",
        "primary-ghost": "text-gray-950 bg-transparent",
        outline: "bg-gray-50 border border-alpha/10 text-gray-950",
        red: "bg-red-500 text-gray-50",
        "red-subtle": "bg-red-500/10 text-red-500",
        "red-ghost": "bg-transparent text-red-500",
        blue: "bg-blue-500 text-gray-50",
        "blue-subtle": "bg-blue-500/10 text-blue-500",
        "blue-ghost": "bg-transparent text-blue-500",
        green: "bg-green-500 text-gray-50",
        "green-subtle": "bg-green-500/10 text-green-500",
        "green-ghost": "bg-transparent text-green-500",
        cyan: "bg-cyan-500 text-gray-50",
        "cyan-subtle": "bg-cyan-500/10 text-cyan-500",
        "cyan-ghost": "bg-transparent text-cyan-500",
        yellow: "bg-yellow-500 text-gray-50",
        "yellow-subtle": "bg-yellow-500/10 text-yellow-500",
        "yellow-ghost": "bg-transparent text-yellow-500",
        orange: "bg-orange-500 text-gray-50",
        "orange-subtle": "bg-orange-500/10 text-orange-500",
        "orange-ghost": "bg-transparent text-orange-500",
        purple: "bg-purple-500 text-white",
        "purple-subtle": "bg-purple-500/10 text-purple-500",
        "purple-ghost": "bg-transparent text-purple-500",
      },
      size: {
        xs: "rounded px-1 h-5 gap-px [&_svg]:size-3 text-xs",
        sm: "rounded-md gap-0.5 px-1.25 h-6 [&_svg]:size-3.5 text-sm",
        md: "rounded-lg gap-1 px-2 h-8 [&_svg]:size-4 text-sm",
        lg: "rounded-[0.625rem] gap-1 px-3 h-10 [&_svg]:size-4 text-base",
        xl: "rounded-xl h-12 gap-1.5 px-3 [&_svg]:size-6 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  text?: string | number;
}

const textPadding: Record<
  NonNullable<VariantProps<typeof badgeVariants>["size"]>,
  string
> = {
  xs: "px-0.5",
  sm: "px-0.5",
  md: "px-0.5",
  lg: "px-1",
  xl: "px-1",
};

function Badge({ className, variant, size, icon, text, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon ?? null}
      {text ? (
        <span className={cn(textPadding[size ?? "md"], "whitespace-nowrap")}>
          {text}
        </span>
      ) : null}
    </div>
  );
}

export { Badge, badgeVariants };
