import type { WorkItemSummary, WorkItemTypeState } from "@shared/types";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Row } from "@/components/ui/row";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { formatShortDate, getTypeIcon } from "@/lib/work-item-utils";

interface WorkItemRowProps {
  item: WorkItemSummary;
  onStatusChange: (id: number, state: string) => void;
  isUpdating?: boolean;
  states: WorkItemTypeState[];
}

export function WorkItemRow({ item, onStatusChange, isUpdating, states }: WorkItemRowProps) {
  return (
    <Row className="group py-0">
      <div className="flex size-8 items-center justify-center shrink-0 [&>svg]:size-5">
        {getTypeIcon(item.type)}
      </div>
      <Link
        to="/work-items/$id"
        params={{ id: String(item.id) }}
        className="flex-1 py-4 pl-3 pr-4 text-sm font-medium text-gray-950 hover:text-blue-500 transition-colors truncate"
      >
        {item.title}
      </Link>
      <div className="flex items-center gap-3 pr-4">
        <Select
          value={item.state}
          onValueChange={(value) => onStatusChange(item.id, value)}
          disabled={isUpdating}
        >
          <SelectTrigger className="h-6 px-2 py-0 border border-alpha/10 rounded-lg bg-gray-50 gap-1 text-xs font-medium [&>svg]:size-3">
            <div className="flex items-center gap-1.5">
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: states.find((s) => s.name === item.state)?.color
                    ? `#${states.find((s) => s.name === item.state)?.color}`
                    : undefined,
                }}
              />
              {item.state}
            </div>
          </SelectTrigger>
          <SelectContent>
            {states.map((state) => (
              <SelectItem key={state.name} value={state.name}>
                <div className="flex items-center gap-2">
                  <div
                    className="size-2 rounded-full"
                    style={{ backgroundColor: `#${state.color}` }}
                  />
                  {state.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {item.assignedTo ? (
          <Avatar size="sm" fallback={item.assignedTo.displayName} />
        ) : (
          <div className="size-5 rounded-full bg-alpha/5" />
        )}
        <span className="text-xs text-gray-500 shrink-0 text-right whitespace-nowrap">
          {item.changedDate ? formatShortDate(item.changedDate) : "-"}
        </span>
        <Button variant="ghost" size="icon-xs" className="opacity-0 group-hover:opacity-100">
          <MoreHorizontal />
        </Button>
      </div>
    </Row>
  );
}
