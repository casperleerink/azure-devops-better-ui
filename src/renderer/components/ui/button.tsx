import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "~/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center shrink-0 whitespace-nowrap font-medium transition-colors duration-100 focus-visible:outline-hidden [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-gray-950 text-gray-100 hover:bg-gray-900 disabled:bg-alpha/[0.12] disabled:opacity-40",
        secondary:
          "bg-blue-500 text-white hover:bg-blue-600 disabled:bg-alpha/[0.12] disabled:opacity-40",
        subtle:
          "bg-alpha/5 text-gray-950 hover:bg-gray-950 hover:text-gray-50 disabled:hover:bg-alpha/5 disabled:hover:text-gray-950 disabled:bg-alpha/[0.12] disabled:opacity-40",
        "subtle-secondary":
          "bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white disabled:bg-alpha/[0.12] disabled:opacity-40",
        outline:
          "bg-transparent border border-alpha/10 text-gray-950 hover:bg-alpha/10 disabled:bg-alpha/[0.12] disabled:opacity-40",
        "outline-secondary":
          "bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white disabled:bg-alpha/[0.12] disabled:opacity-40",
        ghost:
          "bg-transparent text-gray-950 hover:bg-alpha/5 disabled:opacity-40",
        "ghost-secondary":
          "bg-transparent text-blue-500 hover:bg-blue-50 disabled:opacity-40",
        "primary-disabled": "bg-alpha/[0.12] text-gray-100 opacity-40",
        "secondary-disabled": "bg-alpha/[0.12] text-white opacity-40",
        "subtle-disabled": "bg-alpha/[0.12] text-gray-950 opacity-40",
        "subtle-secondary-disabled": "bg-alpha/[0.12] text-blue-500 opacity-40",
        "outline-disabled":
          "bg-alpha/[0.12] text-gray-950 opacity-40 border border-alpha/10",
        "outline-secondary-disabled":
          "bg-transparent text-blue-500 opacity-40 border border-blue-500",
        "ghost-disabled":
          "bg-transparent text-gray-950 opacity-40 hover:bg-alpha/5",
        "ghost-secondary-disabled": "bg-transparent text-blue-500 opacity-40",
        purple:
          "bg-purple-500 text-gray-50 hover:bg-purple-600 disabled:bg-alpha/12 disabled:opacity-40 disabled:text-gray-100",
        "green-subtle":
          "bg-green-500/10 text-green-500 disabled:bg-alpha/12 disabled:opacity-40 disabled:text-gray-100",
        "red-subtle":
          "bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white disabled:bg-alpha/12 disabled:opacity-40 disabled:text-gray-100",
      },
      size: {
        xs: "h-5 px-1 gap-0.5 text-xs rounded [&_svg]:size-3 [&_span]:px-0.5",
        sm: "h-6 px-[0.3125rem] gap-0.5 text-sm rounded-md [&_svg]:size-3.5 [&_span]:px-0.5",
        default:
          "h-8 px-2 gap-1 text-sm rounded-lg [&_svg]:size-4 [&_span]:px-1",
        lg: "h-10 rounded-[10px] px-3 gap-2 [&_svg]:size-4 [&_span]:px-1",
        "icon-xs": "size-5 text-xs rounded [&_svg]:size-3",
        "icon-sm": "size-6 text-xs rounded [&_svg]:size-3.5",
        icon: "size-8 text-base rounded-lg [&_svg]:size-4",
        "icon-lg": "size-10 text-base rounded-[10px] [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
