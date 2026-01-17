import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import React from "react";
import { cn } from "~/lib/utils";

export const dropdownButtonVariants = cva(
  "inline-flex items-center overflow-hidden justify-center transition-colors duration-100 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        solid:
          "bg-gray-50 text-gray-950 hover:bg-alpha/10 border border-alpha/10 [&_.dropdown-button-right]:border-l [&_.dropdown-button-right]:border-alpha/10",
        subtle:
          "text-gray-950 bg-transparent gap-px [&_.dropdown-button-left]:bg-alpha/5 [&_.dropdown-button-right]:bg-alpha/5 hover:[&_.dropdown-button-left]:bg-alpha/10 hover:[&_.dropdown-button-right]:bg-alpha/10",
        ghost:
          "text-gray-950 bg-transparent gap-px hover:[&_.dropdown-button-left]:bg-alpha/5 hover:[&_.dropdown-button-right]:bg-alpha/5",
        danger: "text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white",
      },
      size: {
        xs: "h-5 text-xs rounded-sm [&_svg]:size-3 [&_.dropdown-button-left]:px-1 [&_.dropdown-button-left]:gap-0.5 [&_.dropdown-button-text]:px-0.5",
        sm: "h-6 text-sm rounded-md [&_svg]:size-3.5 [&_.dropdown-button-left]:px-[5px] [&_.dropdown-button-left]:gap-0.5 [&_.dropdown-button-text]:px-0.5",
        md: "h-8 text-sm rounded-lg [&_svg]:size-4 [&_.dropdown-button-left]:px-2 [&_.dropdown-button-left]:gap-1 [&_.dropdown-button-text]:px-0.5",
        lg: "h-10 text-base rounded-[10px] [&_svg]:size-4 [&_.dropdown-button-left]:px-3 [&_.dropdown-button-left]:gap-1 [&_.dropdown-button-text]:px-1",
      },
    },
    defaultVariants: {
      variant: "solid",
      size: "md",
    },
  },
);

interface DropdownButtonProps
  extends React.HTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dropdownButtonVariants> {
  icon?: React.ReactNode | null;
  text: string;
  chevron?: boolean;
  disabled?: boolean;
}

export const DropdownButton = React.forwardRef<HTMLButtonElement, DropdownButtonProps>(
  ({ className, variant, chevron = true, size, text, icon, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={dropdownButtonVariants({ variant, size, className })}
        {...props}
        disabled={disabled}
      >
        <DropdownButtonLeft text={text} icon={icon} />
        {chevron ? <DropdownButtonRight /> : null}
      </button>
    );
  },
);

const DropdownButtonLeft = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon?: React.ReactNode | null;
    text: string;
  }
>(({ className, icon, text, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "dropdown-button-left flex h-full items-center justify-center transition-colors",
        className,
      )}
      {...props}
    >
      {icon ?? null}
      <span className="dropdown-button-text">{text}</span>
    </span>
  );
});

const DropdownButtonRight = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    icon?: React.ReactNode;
  }
>(({ className, icon = <ChevronDownIcon />, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        "dropdown-button-right flex aspect-square h-full items-center justify-center transition-colors",
        className,
      )}
      {...props}
    >
      {icon}
    </span>
  );
});
