import * as React from "react";
import { Avatar } from "./avatar";
import { cn } from "~/lib/utils";

interface AvatarInputProps {
  image?: string | null;
  fallback?: string | null;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const AvatarInput = React.forwardRef<HTMLInputElement, AvatarInputProps>(
  ({ image, fallback, size = "lg", loading, className, ...props }, ref) => {
    return (
      <div className={cn("relative block", className)}>
        <Avatar
          image={image}
          fallback={fallback}
          size={size}
          className={cn(
            "cursor-pointer transition-opacity hover:opacity-80",
            loading && "opacity-50",
          )}
        />
        <input
          type="file"
          ref={ref}
          className="absolute inset-0 cursor-pointer text-[0px] opacity-0"
          accept="image/*"
          disabled={loading}
          {...props}
        />
      </div>
    );
  },
);

AvatarInput.displayName = "AvatarInput";
