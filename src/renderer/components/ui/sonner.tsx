"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-gray-50 group-[.toaster]:text-gray-950 group-[.toaster]:border-alpha/10 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-alpha/60",
          actionButton: "group-[.toast]:bg-gray-950 group-[.toast]:text-gray-50",
          cancelButton: "group-[.toast]:bg-alpha/40 group-[.toast]:text-gray-950",
          error: "group-[.toaster]:bg-red-500 group-[.toaster]:text-white",
          success: "group-[.toaster]:bg-green-500 group-[.toaster]:text-white",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
