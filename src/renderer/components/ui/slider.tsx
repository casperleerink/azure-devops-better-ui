import * as SliderPrimitive from "@radix-ui/react-slider";
import * as React from "react";

import { cn } from "~/lib/utils";

interface SliderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>,
    "value" | "onValueChange" | "onValueCommit"
  > {
  value: number;
  onValueChange: (value: number) => void;
  onValueCommit: (value: number) => void;
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  (
    {
      className,
      defaultValue,
      value,
      step = 1,
      min = 0,
      max = 14,
      onValueChange,
      onValueCommit,
      ...props
    },
    ref,
  ) => {
    const [steps, stepsArray, amountActiveSteps] = React.useMemo(() => {
      const steps = Math.floor((max - min) / step);
      const stepsArray = Array.from({ length: steps }, (_, index) => index).map((idx) => {
        const isActive = value ? value > min + idx * step : false;
        return {
          isActive,
          value: min + idx * step,
        };
      });
      const amountActiveSteps = stepsArray.filter((step) => step.isActive).length;
      return [steps, stepsArray, amountActiveSteps];
    }, [max, min, step, value]);

    const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex h-6 w-full touch-none items-center justify-center select-none",
          className,
        )}
        defaultValue={defaultValue}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          if (!v[0]) return;
          onValueChange(v[0]);
        }}
        onValueCommit={(v) => {
          if (!v[0]) return;
          onValueCommit(v[0]);
        }}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1 w-full">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))`,
            }}
          >
            {stepsArray.map((_step, index) => (
              <div
                key={index}
                className="relative h-1 w-full"
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Increase hit area using an absolutely positioned invisible div */}
                <div
                  className="absolute top-1/2 left-1/2 z-[1] h-[400%] w-[calc(100%+4px)] -translate-x-1/2 -translate-y-1/2"
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
                <div
                  className={cn(
                    "pointer-events-none relative h-full w-full",
                    hoveredIdx !== null && index <= hoveredIdx ? "bg-orange-500" : "bg-alpha/10",
                  )}
                />
              </div>
            ))}
          </div>
          {amountActiveSteps > 0 ? (
            <div
              className="pointer-events-none absolute inset-0 grid gap-1"
              style={{
                gridTemplateColumns: `repeat(${steps}, minmax(0, 1fr))`,
              }}
            >
              <div
                style={{
                  gridColumn: `span ${amountActiveSteps} / span ${amountActiveSteps}`,
                }}
                className="bg-orange-500"
              />
            </div>
          ) : null}
        </SliderPrimitive.Track>

        {/* <SliderPrimitive.Thumb
          onMouseEnter={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
          }}
          onMouseLeave={(ev) => {
            ev.bubbles = true;
            ev.preventDefault();
            ev.stopPropagation();
          }}
          className="relative block h-8 w-8 shrink-0 cursor-pointer rounded-lg bg-orange-500 opacity-0 focus:outline-none"
        /> */}
      </SliderPrimitive.Root>
    );
  },
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
