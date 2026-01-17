import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "~/lib/utils";

const AvatarImage = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>) => (
  <AvatarPrimitive.Image
    className={cn("aspect-square h-full w-full overflow-hidden object-cover", className)}
    {...props}
  />
);

const AvatarFallback = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center font-medium uppercase",
      className,
    )}
    {...props}
  />
);

const avatarVariants = cva(
  "relative isolate flex items-center justify-center shrink-0 overflow-hidden",
  {
    variants: {
      size: {
        xs: "size-4 [&_svg]:size-3",
        sm: "size-5 [&_svg]:size-3.5",
        md: "size-6 [&_svg]:size-3.5",
        lg: "size-8 [&_svg]:size-4",
        xl: "size-10 [&_svg]:size-4",
      },
      rounded: {
        true: "rounded-full",
        false: "",
      },
      outline: {
        none: "bg-alpha/10 border-none text-gray-600",
        gray: "border-2 border-alpha/10 text-gray-950",
        cyan: "border-2 border-cyan-500 bg-cyan-500 text-gray-50",
        yellow: "border-2 border-yellow-500 bg-yellow-500 text-gray-50",
        green: "border-2 border-green-500 bg-green-500 text-gray-50",
        red: "border-2 border-red-500 bg-red-500 text-gray-50",
        purple: "border-2 border-purple-500 bg-purple-500 text-gray-50",
      },
    },
    compoundVariants: [
      {
        size: "xs",
        rounded: false,
        className: "rounded-xs",
      },
      {
        size: "sm",
        rounded: false,
        className: "rounded-sm",
      },
      {
        size: "md",
        rounded: false,
        className: "rounded-md",
      },
      {
        size: "lg",
        rounded: false,
        className: "rounded-lg",
      },
      {
        size: "xl",
        rounded: false,
        className: "rounded-[10px]",
      },
    ],
    defaultVariants: {
      size: "md",
      rounded: true,
      outline: "none",
    },
  },
);

type AvatarVariantProps = VariantProps<typeof avatarVariants>;

const avatarWithOutlineChildrenSizes = {
  xs: "size-3 rounded-xs",
  sm: "size-4 rounded-sm",
  md: "size-5 rounded-md",
  lg: "size-7 rounded-lg",
  xl: "size-9 rounded-[10px]",
} as const;

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    image?: string | null;
    icon?: React.ReactNode | null;
    fallback?: React.ReactNode | null;
  } & AvatarVariantProps
>(
  (
    { className, image, fallback, size, icon, rounded = true, outline, children, ...props },
    ref,
  ) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={avatarVariants({
        size,
        rounded,
        outline,
        className,
      })}
      {...props}
    >
      <AvatarImage src={image ?? undefined} className={cn(rounded ? "rounded-full" : "")} />
      {icon ? (
        icon
      ) : (
        <AvatarFallback
          className={cn(
            size === "xs" ? "text-2xs" : size === "lg" ? "text-sm" : "text-xs",
            outline ? avatarWithOutlineChildrenSizes[size ?? "md"] : "",
            outline === "gray" ? "bg-alpha/10" : "",
            rounded ? "rounded-full" : "",
          )}
        >
          {typeof fallback === "string" ? fallback[0] : (fallback ?? "?")}
        </AvatarFallback>
      )}
      {children}
    </AvatarPrimitive.Root>
  ),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar, type AvatarVariantProps };
