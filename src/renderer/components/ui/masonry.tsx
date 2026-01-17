import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

interface Props {
  children?: ReactNode[];
  className?: string;
}

function MasonryGroup({ children, className }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleResize = useCallback(() => {
    const grid = ref.current;
    if (!grid) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any = grid.children;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowHeight = parseInt(
        window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"),
        10,
      );
      const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue("grid-row-gap"), 10);
      const rowSpan = Math.ceil(
        (item.firstChild.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap),
      );
      console.log(rowSpan);
      item.style.gridRowEnd = `span ${rowSpan}`;
    }
  }, []);
  useEffect(() => {
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div
      ref={ref}
      className={cn(
        "grid [grid-auto-rows:1px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default MasonryGroup;
