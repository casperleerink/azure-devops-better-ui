import * as React from "react";

import { cn } from "~/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:ring-1 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

const BareTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      divRef.current &&
      typeof props.defaultValue === "string" &&
      divRef.current.dataset.value === undefined
    ) {
      divRef.current.dataset.value = props.defaultValue;
    }
  }, [props.defaultValue]);
  return (
    <div
      className={cn(
        "relative grid w-full after:invisible after:block after:whitespace-pre-wrap after:content-[attr(data-value)] after:[font:inherit] after:[grid-area:1/1/2/2]",
        className,
      )}
      ref={divRef}
    >
      <textarea
        className="resize-none overflow-hidden border-none [font:inherit] [grid-area:1/1/2/2] placeholder:text-gray-950 placeholder:opacity-40 focus-visible:outline-none disabled:cursor-default"
        rows={1}
        ref={ref}
        onInput={(ev) => {
          const parent = ev.currentTarget.parentElement;
          if (parent) {
            parent.dataset.value = ev.currentTarget.value;
          }
        }}
        {...props}
      />
    </div>
  );
});
BareTextarea.displayName = "BareTextarea";

export { Textarea, BareTextarea };
