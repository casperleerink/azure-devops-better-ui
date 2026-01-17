import type { WorkItemDetail, WorkItemTypeState } from "@shared/types";
import { Calendar, CircleDot, Folder, GitBranch, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CardRow, CardRowLabel } from "@/components/ui/card";
import { StateSelect } from "./StateSelect";

interface DetailsGridProps {
  workItem: WorkItemDetail;
  state: string;
  states: WorkItemTypeState[];
  onStateChange: (state: string) => void;
}

export function DetailsGrid({ workItem, state, states, onStateChange }: DetailsGridProps) {
  return (
    <div className="rounded-xl border border-alpha/5 bg-gray-100 mb-6">
      <CardRow>
        <CardRowLabel icon={<User />} label="Assigned To" />
        <div className="flex items-center gap-2">
          {workItem.assignedTo ? (
            <>
              <Avatar size="sm" fallback={workItem.assignedTo.displayName} />
              <span className="text-sm text-alpha">{workItem.assignedTo.displayName}</span>
            </>
          ) : (
            <span className="text-sm text-gray-600">Unassigned</span>
          )}
        </div>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<CircleDot />} label="State" />
        <StateSelect value={state} states={states} onChange={onStateChange} />
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<Folder />} label="Area Path" />
        <span className="text-sm text-alpha">{workItem.areaPath || "-"}</span>
      </CardRow>
      <CardRow>
        <CardRowLabel icon={<GitBranch />} label="Iteration" />
        <span className="text-sm text-alpha">{workItem.iterationPath || "-"}</span>
      </CardRow>
      {workItem.changedDate && (
        <CardRow>
          <CardRowLabel icon={<Calendar />} label="Last Updated" />
          <span className="text-sm text-alpha">
            {new Date(workItem.changedDate).toLocaleString()}
          </span>
        </CardRow>
      )}
    </div>
  );
}
