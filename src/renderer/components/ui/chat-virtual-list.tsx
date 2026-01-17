import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { VList, type VListHandle } from "virtua";

type DefaultKey = { id: string };

type ChatVirtualListProps<T> = {
  items: T[];
  getKey?: (item: T, index: number) => string;
  renderRow: (item: T, index: number) => React.ReactNode;
  /**
   * Distance in px considered “at the bottom”. @default 2
   */
  bottomThresholdPx?: number;

  /**
   * Called when the user scrolls close to the top (within threshold).
   * Fires once when entering the near-top zone, and will fire again
   * after the user scrolls away and re-enters.
   */
  loadMore?: () => void;
  /**
   * Distance in px considered “near the top”. @default 100
   */
  topThresholdPx?: number;
  className?: string;
};

export function ChatVirtualList<T extends DefaultKey>({
  items,
  renderRow,
  getKey = (item, index) => String(item.id || index),
  bottomThresholdPx = 2,
  loadMore,
  topThresholdPx = 100,
}: ChatVirtualListProps<T>) {
  const ref = useRef<VListHandle>(null);

  // One-render flag to enable Virtua's shift behavior after prepend
  const shiftOnceRef = useRef(false);
  useLayoutEffect(() => {
    shiftOnceRef.current = false;
  }, []);

  // Track whether we should auto-stick to bottom on append
  const shouldStickToBottom = useRef(true);

  useEffect(() => {
    if (!ref.current) return;
    if (!shouldStickToBottom.current) return;
    ref.current.scrollToIndex(items.length - 1, {
      align: "end",
    });
  }, [items.length]);

  // Track whether we are near the top of the list
  const [nearTop, setNearTop] = useState(false);
  const mountedRef = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
  }, []);

  useEffect(() => {
    if (nearTop && mountedRef.current) {
      loadMore?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nearTop, loadMore]);

  return (
    <VList
      ref={ref}
      style={{ flex: 1 }}
      reverse
      shift={shiftOnceRef.current}
      onScroll={(offset) => {
        const handle = ref.current;
        if (!handle) return;

        // Update bottom stickiness based on current position
        const atBottom =
          offset - handle.scrollSize + handle.viewportSize >= -Math.abs(bottomThresholdPx);
        shouldStickToBottom.current = atBottom;

        // the !atBottom is to avoid the shift on places where the list is near-empty and offset is so little its treated as at the top
        if (offset < topThresholdPx && !atBottom) {
          shiftOnceRef.current = true;
          setNearTop(true);
        } else {
          setNearTop(false);
          shiftOnceRef.current = false;
        }
      }}
    >
      {items.map((item, index) => (
        <Fragment key={getKey(item, index)}>{renderRow(item, index)}</Fragment>
      ))}
    </VList>
  );
}
