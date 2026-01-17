"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "~/lib/utils";
import { buttonVariants } from "~/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("shadow-dropdown rounded-2xl bg-gray-50 p-4", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "space-y-4",
        month_caption:
          "flex justify-center pt-1 relative items-center pointer-events-none",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-3.5 flex items-center",
        button_next: cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "absolute right-0",
        ),
        button_previous: cn(
          buttonVariants({
            variant: "ghost",
            size: "sm",
          }),
          "absolute left-0",
        ),

        month_grid: "w-full border-collapse space-y-1",

        weekdays: "flex w-full gap-2",
        weekday: "text-gray-500 rounded-md w-6 shrink-0 font-normal text-xs",

        week: "flex w-full mt-2 gap-2",
        day: "relative p-0 text-center text-xs focus-within:relative focus-within:z-20",

        day_button: "size-6 shrink-0 flex items-center justify-center",
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 rounded-md",

        today: "bg-alpha/10 text-gray-950 rounded-md",
        outside:
          "day-outside text-gray-950 opacity-40 aria-selected:bg-gray-950 aria-selected:text-gray-50",
        disabled: "opacity-40",
        range_middle: "aria-selected:bg-gray-950 aria-selected:text-gray-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft className={cn("size-3.5", className)} {...props} />
            );
          }
          if (orientation === "right") {
            return (
              <ChevronRight className={cn("size-3.5", className)} {...props} />
            );
          }

          return (
            <ChevronLeft className={cn("size-3.5", className)} {...props} />
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
