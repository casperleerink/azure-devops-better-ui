import type { UniqueIdentifier } from "@dnd-kit/core";
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import React from "react";

import { DragHandle, SortableItem } from "./item";

// import { SortableOverlay } from "./overlay";

interface BaseItem {
  id: UniqueIdentifier;
}

interface Props<T extends BaseItem> {
  items: T[];
  onChange(items: T[]): void;
  renderItem(item: T): ReactNode;
  disabled?: boolean;
}

export function SortableList<T extends BaseItem>({
  items,
  onChange,
  renderItem,
  disabled = false,
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      // onDragStart={({ active }) => {
      //   setActive(active);
      // }}
      onDragEnd={({ active, over }) => {
        if (over && active.id !== over?.id) {
          const activeIndex = items.findIndex(({ id }) => id === active.id);
          const overIndex = items.findIndex(({ id }) => id === over.id);

          onChange(arrayMove(items, activeIndex, overIndex));
        }
        // setActive(null);
      }}
      // onDragCancel={() => {
      //   setActive(null);
      // }}
    >
      <SortableContext items={items} disabled={disabled}>
        <ul className="flex w-full flex-col" role="application">
          {items.map((item) => (
            <React.Fragment key={item.id}>{renderItem(item)}</React.Fragment>
          ))}
        </ul>
      </SortableContext>
      {/* <SortableOverlay>
        {activeItem ? renderItem(activeItem) : null}
      </SortableOverlay> */}
    </DndContext>
  );
}

SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
