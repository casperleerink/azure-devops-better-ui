import { useTheme } from "next-themes";
import { useState } from "react";
import { studiopageBackgroundColor } from "../website/studio/react-matters/store";
import { useAtomValue } from "jotai";
import { cn } from "~/lib/utils";
import { LaptopIcon, MoonIcon, SunIcon, SwatchBookIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { dropdownMenuItemVariants } from "./dropdown-menu";
import { PixelLogo } from "../website/pixel-logo";

export const ThemeToggle = ({ className }: { className?: string }) => {
  const backgroundColor = useAtomValue(studiopageBackgroundColor);
  const { setTheme, resolvedTheme } = useTheme();
  const [clickCount, setClickCount] = useState(0);
  return (
    <button
      type="button"
      aria-label="Toggle Dark Mode"
      className={className}
      onClick={() => {
        const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        setClickCount((prev) => prev + 1);
      }}
    >
      <svg
        viewBox="0 0 225 225"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "aspect-square h-full w-full transition-transform duration-300 group-hover:rotate-45",
          backgroundColor === "default" ? "text-gray-500" : "text-black",
        )}
        style={{ transform: `rotate(${clickCount * 180}deg)` }}
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M112.938 224.256C51.0826 224.256 0.938477 174.112 0.938477 112.256C0.938477 50.4005 51.0826 0.256348 112.938 0.256348C174.794 0.256348 224.938 50.4005 224.938 112.256C224.938 174.112 174.794 224.256 112.938 224.256ZM112.938 207.456C165.516 207.456 208.138 164.834 208.138 112.256C208.138 59.6788 165.516 17.0563 112.938 17.0563V207.456Z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};

export const PixelThemeToggle = ({ className }: { className?: string }) => {
  const { setTheme, theme } = useTheme();
  const nextTheme = theme === "dark" ? "light" : "dark";
  return (
    <button
      onClick={() => setTheme(nextTheme)}
      type="button"
      aria-label="Toggle Dark Mode"
      className={className}
    >
      <PixelLogo className="h-full w-full" />
    </button>
  );
};

export const DropdownThemeToggle = () => {
  const { setTheme, theme } = useTheme();

  return (
    <div className={dropdownMenuItemVariants()}>
      <SwatchBookIcon />
      <span className="flex-1">Theme</span>
      <div className="border-alpha/5 flex w-fit items-center rounded-full border p-1 transition-colors">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme("system")}
              className={cn(
                "flex size-5 items-center justify-center rounded-full transition-colors",
                theme === "system" ? "bg-alpha/10" : "hover:bg-alpha/5",
              )}
              aria-label="System theme"
            >
              <LaptopIcon className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>System theme</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme("light")}
              className={cn(
                "flex size-5 items-center justify-center rounded-full transition-colors",
                theme === "light" ? "bg-alpha/10" : "hover:bg-alpha/5",
              )}
              aria-label="Light theme"
            >
              <SunIcon className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Light theme</span>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setTheme("dark")}
              className={cn(
                "flex size-5 items-center justify-center rounded-full transition-colors",
                theme === "dark" ? "bg-alpha/10" : "hover:bg-alpha/5",
              )}
              aria-label="Dark theme"
            >
              <MoonIcon className="size-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <span>Dark theme</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
