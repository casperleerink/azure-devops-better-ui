interface StateCellProps {
  state: string;
  color?: string;
}

export function StateCell({ state, color }: StateCellProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 border border-alpha/10">
      {color && <div className="size-2 rounded-full" style={{ backgroundColor: `#${color}` }} />}
      <span className="text-xs font-medium text-gray-950">{state}</span>
    </div>
  );
}

interface AssigneeCellProps {
  assignee?: {
    displayName: string;
  };
}

export function AssigneeCell({ assignee }: AssigneeCellProps) {
  return <span className="text-sm text-gray-600">{assignee?.displayName ?? "Unassigned"}</span>;
}
