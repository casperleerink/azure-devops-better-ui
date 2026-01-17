import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon, MoreHorizontal } from "lucide-react";
import { VariantProps, cva } from "class-variance-authority";

import { cn } from "~/lib/utils";

const checkboxVariants = cva(
  "peer shrink-0 rounded-md border focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-alpha/5 hover:bg-alpha/10 border-alpha/5 focus-visible:ring-alpha/5 data-[state=checked]:bg-blue-500 hover:data-[state=checked]:bg-blue-600 data-[state=checked]:text-white  disabled:bg-alpha/15",
        reviewer:
          "bg-alpha/5 hover:bg-alpha/10 border-alpha/5 focus-visible:ring-alpha/5 hover:data-[state=checked]:bg-purple-500/20 data-[state=checked]:bg-purple-500/5 data-[state=checked]:text-purple-500 data-[state=checked]:border-purple-500/50",
      },
      size: {
        xs: "size-5 [&_svg]:size-4",
        sm: "size-6 [&_svg]:size-4",
        md: "size-8 [&_svg]:size-5",
        lg: "size-10 [&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant, size, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(checkboxVariants({ variant, size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      {variant === "reviewer" ? <MoreHorizontal /> : <CheckIcon />}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
